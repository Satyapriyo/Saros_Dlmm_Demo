import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for orders
export interface DatabaseOrder {
  id: string;
  type: "limit" | "stop-loss";
  token_from: string;
  token_to: string;
  amount: number;
  target_price: number;
  current_price?: number;
  status: "active" | "executed" | "cancelled" | "expired";
  created_at: string;
  updated_at: string;
  pair_address: string;
  user_wallet: string;
}

// Database functions for orders
export class SupabaseOrderManager {
  // Create a new order in the database
  static async createOrder(
    order: Omit<DatabaseOrder, "created_at" | "updated_at">
  ): Promise<DatabaseOrder | null> {
    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          ...order,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating order:", error);
      return null;
    }

    return data;
  }

  // Get orders for a specific wallet
  static async getOrdersByWallet(userWallet: string): Promise<DatabaseOrder[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_wallet", userWallet)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return [];
    }

    return data || [];
  }

  // Get all active orders
  static async getActiveOrders(): Promise<DatabaseOrder[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching active orders:", error);
      return [];
    }

    return data || [];
  }

  // Update order status
  static async updateOrderStatus(
    orderId: string,
    status: DatabaseOrder["status"],
    currentPrice?: number
  ): Promise<boolean> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (currentPrice !== undefined) {
      updateData.current_price = currentPrice;
    }

    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId);

    if (error) {
      console.error("Error updating order:", error);
      return false;
    }

    return true;
  }

  // Update order current price
  static async updateOrderPrice(
    orderId: string,
    currentPrice: number
  ): Promise<boolean> {
    const { error } = await supabase
      .from("orders")
      .update({
        current_price: currentPrice,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      console.error("Error updating order price:", error);
      return false;
    }

    return true;
  }

  // Cancel an order
  static async cancelOrder(orderId: string): Promise<boolean> {
    return this.updateOrderStatus(orderId, "cancelled");
  }

  // Execute an order
  static async executeOrder(
    orderId: string,
    currentPrice: number
  ): Promise<boolean> {
    return this.updateOrderStatus(orderId, "executed", currentPrice);
  }

  // Delete an order (optional - for cleanup)
  static async deleteOrder(orderId: string): Promise<boolean> {
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (error) {
      console.error("Error deleting order:", error);
      return false;
    }

    return true;
  }

  // Get orders by status
  static async getOrdersByStatus(
    status: DatabaseOrder["status"]
  ): Promise<DatabaseOrder[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders by status:", error);
      return [];
    }

    return data || [];
  }

  // Get orders by type (limit or stop-loss)
  static async getOrdersByType(
    type: "limit" | "stop-loss"
  ): Promise<DatabaseOrder[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("type", type)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders by type:", error);
      return [];
    }

    return data || [];
  }

  // Get orders for a specific pair
  static async getOrdersByPair(pairAddress: string): Promise<DatabaseOrder[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("pair_address", pairAddress)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders by pair:", error);
      return [];
    }

    return data || [];
  }
}
