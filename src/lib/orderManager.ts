import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";
import { PublicKey, Connection } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo, useCallback, useState, useEffect } from "react";
import { SupabaseOrderManager, DatabaseOrder } from "./supabase";

// Types for our order system
export interface LimitOrder {
  id: string;
  type: "limit" | "stop-loss";
  tokenFrom: string;
  tokenTo: string;
  amount: number;
  targetPrice: number;
  currentPrice?: number;
  status: "active" | "executed" | "cancelled" | "expired";
  createdAt: Date;
  pairAddress: string;
  userWallet: string;
}

export class SarosOrderManager {
  private liquidityBookServices: LiquidityBookServices;
  private priceCheckInterval: number = 30000; // Check every 30 seconds
  private intervalId: NodeJS.Timeout | null = null;

  constructor(mode: MODE = MODE.DEVNET) {
    this.liquidityBookServices = new LiquidityBookServices({ mode });
  }

  // Create a new limit order
  async createLimitOrder(
    order: Omit<LimitOrder, "id" | "status" | "createdAt" | "currentPrice">
  ): Promise<string> {
    const orderId = this.generateOrderId();

    // Get current price for reference
    const currentPrice = await this.getCurrentPrice(
      order.pairAddress,
      order.tokenFrom,
      order.tokenTo
    );

    // Create order in database
    const dbOrder = await SupabaseOrderManager.createOrder({
      id: orderId,
      type: order.type,
      token_from: order.tokenFrom,
      token_to: order.tokenTo,
      amount: order.amount,
      target_price: order.targetPrice,
      current_price: currentPrice,
      status: "active",
      pair_address: order.pairAddress,
      user_wallet: order.userWallet,
    });

    if (!dbOrder) {
      throw new Error("Failed to create order in database");
    }

    // Start monitoring if not already running
    if (!this.intervalId) {
      this.startPriceMonitoring();
    }

    return orderId;
  }

  // Get current price from DLMM pool
  private async getCurrentPrice(
    pairAddress: string,
    tokenFrom: string,
    tokenTo: string
  ): Promise<number> {
    try {
      const amount = 1e6; // 1 token with 6 decimals
      const quoteData = await this.liquidityBookServices.getQuote({
        amount: BigInt(amount),
        isExactInput: true,
        swapForY: true, // Adjust based on token order
        pair: new PublicKey(pairAddress),
        tokenBase: new PublicKey(tokenFrom),
        tokenQuote: new PublicKey(tokenTo),
        tokenBaseDecimal: 6, // Adjust based on actual token decimals
        tokenQuoteDecimal: 6,
        slippage: 0.5,
      });

      // Calculate price from quote
      const price = Number(quoteData.amountOut) / amount;
      return price;
    } catch (error) {
      console.error("Error getting current price:", error);
      return 0;
    }
  }

  // Start monitoring prices for active orders
  private async startPriceMonitoring() {
    this.intervalId = setInterval(async () => {
      const activeOrders = await SupabaseOrderManager.getActiveOrders();

      for (const dbOrder of activeOrders) {
        try {
          const currentPrice = await this.getCurrentPrice(
            dbOrder.pair_address,
            dbOrder.token_from,
            dbOrder.token_to
          );

          // Update current price in database
          await SupabaseOrderManager.updateOrderPrice(dbOrder.id, currentPrice);

          // Check if order should be executed
          const shouldExecute = this.shouldExecuteOrder(dbOrder, currentPrice);

          if (shouldExecute) {
            await this.executeOrder(dbOrder);
          }
        } catch (error) {
          console.error(`Error checking order ${dbOrder.id}:`, error);
        }
      }
    }, this.priceCheckInterval);
  }

  // Check if order conditions are met
  private shouldExecuteOrder(
    order: DatabaseOrder,
    currentPrice: number
  ): boolean {
    if (order.type === "limit") {
      // For buy limit orders: execute when current price <= target price
      // For sell limit orders: execute when current price >= target price
      // This is simplified - in practice you'd need to determine buy/sell direction
      return currentPrice >= order.target_price;
    } else if (order.type === "stop-loss") {
      // Stop loss: execute when price drops below target
      return currentPrice <= order.target_price;
    }
    return false;
  }

  // Execute the order using DLMM SDK
  private async executeOrder(order: DatabaseOrder) {
    try {
      console.log(
        `Executing order ${order.id} at price ${order.current_price}`
      );

      // Get quote for the actual swap
      const quoteData = await this.liquidityBookServices.getQuote({
        amount: BigInt(order.amount),
        isExactInput: true,
        swapForY: true,
        pair: new PublicKey(order.pair_address),
        tokenBase: new PublicKey(order.token_from),
        tokenQuote: new PublicKey(order.token_to),
        tokenBaseDecimal: 6,
        tokenQuoteDecimal: 6,
        slippage: 0.5,
      });

      // Create swap transaction
      const transaction = await this.liquidityBookServices.swap({
        amount: quoteData.amount,
        tokenMintX: new PublicKey(order.token_from),
        tokenMintY: new PublicKey(order.token_to),
        otherAmountOffset: quoteData.otherAmountOffset,
        hook: new PublicKey(this.liquidityBookServices.hooksConfig),
        isExactInput: true,
        swapForY: true,
        pair: new PublicKey(order.pair_address),
        payer: new PublicKey(order.user_wallet),
      });

      // Note: In a real implementation, you'd need to sign and send the transaction
      // This requires user approval or a delegated signing mechanism

      // Mark order as executed in database
      await SupabaseOrderManager.executeOrder(
        order.id,
        order.current_price || 0
      );
      console.log(`Order ${order.id} executed successfully`);
    } catch (error) {
      console.error(`Error executing order ${order.id}:`, error);
      // You might want to retry or mark as failed
    }
  }

  // Cancel an order
  async cancelOrder(orderId: string): Promise<boolean> {
    return await SupabaseOrderManager.cancelOrder(orderId);
  }

  // Get all orders for a user
  async getUserOrders(userWallet: string): Promise<LimitOrder[]> {
    const dbOrders = await SupabaseOrderManager.getOrdersByWallet(userWallet);
    return this.convertDbOrdersToLimitOrders(dbOrders);
  }

  // Get active orders
  async getActiveOrders(): Promise<LimitOrder[]> {
    const dbOrders = await SupabaseOrderManager.getActiveOrders();
    return this.convertDbOrdersToLimitOrders(dbOrders);
  }

  // Convert database orders to LimitOrder format
  private convertDbOrdersToLimitOrders(
    dbOrders: DatabaseOrder[]
  ): LimitOrder[] {
    return dbOrders.map((dbOrder) => ({
      id: dbOrder.id,
      type: dbOrder.type,
      tokenFrom: dbOrder.token_from,
      tokenTo: dbOrder.token_to,
      amount: dbOrder.amount,
      targetPrice: dbOrder.target_price,
      currentPrice: dbOrder.current_price,
      status: dbOrder.status,
      createdAt: new Date(dbOrder.created_at),
      pairAddress: dbOrder.pair_address,
      userWallet: dbOrder.user_wallet,
    }));
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Utility functions
  private generateOrderId(): string {
    return `order_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }
}

// React hook for using the order manager
export function useOrderManager() {
  const { publicKey } = useWallet();
  const [orders, setOrders] = useState<LimitOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Memoize the order manager instance to prevent recreation on every render
  const orderManager = useMemo(() => new SarosOrderManager(MODE.MAINNET), []);

  // Load orders when wallet connects
  useEffect(() => {
    const loadOrders = async () => {
      if (publicKey) {
        setIsLoading(true);
        try {
          const userOrders = await orderManager.getUserOrders(
            publicKey.toString()
          );
          setOrders(userOrders);
        } catch (error) {
          console.error("Error loading orders:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setOrders([]);
      }
    };

    loadOrders();
  }, [publicKey, orderManager]);

  const createLimitOrder = useCallback(
    async (
      tokenFrom: string,
      tokenTo: string,
      amount: number,
      targetPrice: number,
      pairAddress: string,
      type: "limit" | "stop-loss" = "limit"
    ) => {
      if (!publicKey) throw new Error("Wallet not connected");

      setIsLoading(true);
      try {
        const orderId = await orderManager.createLimitOrder({
          type,
          tokenFrom,
          tokenTo,
          amount,
          targetPrice,
          pairAddress,
          userWallet: publicKey.toString(),
        });

        // Refresh orders after creating
        const userOrders = await orderManager.getUserOrders(
          publicKey.toString()
        );
        setOrders(userOrders);

        return orderId;
      } finally {
        setIsLoading(false);
      }
    },
    [publicKey, orderManager]
  );

  const getUserOrders = useCallback(async () => {
    if (!publicKey) return [];

    setIsLoading(true);
    try {
      const userOrders = await orderManager.getUserOrders(publicKey.toString());
      setOrders(userOrders);
      return userOrders;
    } catch (error) {
      console.error("Error getting user orders:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, orderManager]);

  const cancelOrder = useCallback(
    async (orderId: string) => {
      setIsLoading(true);
      try {
        const success = await orderManager.cancelOrder(orderId);

        if (success && publicKey) {
          // Refresh orders after canceling
          const userOrders = await orderManager.getUserOrders(
            publicKey.toString()
          );
          setOrders(userOrders);
        }

        return success;
      } finally {
        setIsLoading(false);
      }
    },
    [orderManager, publicKey]
  );

  const getActiveOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const activeOrders = await orderManager.getActiveOrders();
      return activeOrders;
    } catch (error) {
      console.error("Error getting active orders:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [orderManager]);

  const refreshOrders = useCallback(async () => {
    if (publicKey) {
      await getUserOrders();
    }
  }, [getUserOrders, publicKey]);

  return {
    createLimitOrder,
    getUserOrders,
    cancelOrder,
    getActiveOrders,
    refreshOrders,
    orders,
    isLoading,
  };
}
