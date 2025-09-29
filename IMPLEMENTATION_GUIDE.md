# Implementing Limit Orders and Stop Loss Orders with Saros DLMM

## Overview

After analyzing the Saros Finance SDKs (@saros-finance/dlmm-sdk and @saros-finance/sdk), I found that **neither SDK provides native limit order or stop loss functionality**. Therefore, we need to implement a **client-side order management system** that monitors prices and executes trades when conditions are met.

## Architecture

### 1. Order Management System (`src/lib/orderManager.ts`)

```typescript
// Key Components:
- SarosOrderManager: Main class that handles order lifecycle
- LimitOrder interface: Defines order structure
- Price monitoring: Polls prices every 30 seconds
- Order execution: Uses DLMM SDK when conditions are met
```

### 2. React Components
- `OrderManagement.tsx`: UI for creating and managing orders
- Integration with existing Dashboard component

## Implementation Details

### **Order Types Supported:**

1. **Limit Orders**: Execute when price reaches or exceeds target price
2. **Stop Loss Orders**: Execute when price drops to or below target price

### **Key Features:**

1. **Price Monitoring**: 
   - Continuous price checking using `liquidityBookServices.getQuote()`
   - Configurable check intervals (default: 30 seconds)

2. **Order Storage**: 
   - Client-side storage using localStorage
   - Persistent across browser sessions

3. **Order Execution**: 
   - Automatic execution when conditions are met
   - Uses Saros DLMM SDK for actual swaps

## Code Implementation

### Order Manager Class

```typescript
import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";

export class SarosOrderManager {
  private liquidityBookServices: LiquidityBookServices;
  
  constructor(mode: MODE = MODE.DEVNET) {
    this.liquidityBookServices = new LiquidityBookServices({ mode });
  }

  // Create limit order
  async createLimitOrder(order: OrderParams): Promise<string> {
    // Store order with unique ID
    // Start price monitoring if not already running
  }

  // Monitor prices and execute orders
  private async checkOrderConditions() {
    // Get current price using DLMM SDK
    const currentPrice = await this.getCurrentPrice(pairAddress, tokenFrom, tokenTo);
    
    // Check if order should execute
    if (shouldExecuteOrder(order, currentPrice)) {
      await this.executeOrder(order);
    }
  }
}
```

### Price Fetching

```typescript
private async getCurrentPrice(pairAddress: string, tokenFrom: string, tokenTo: string): Promise<number> {
  const quoteData = await this.liquidityBookServices.getQuote({
    amount: BigInt(1e6), // 1 token
    isExactInput: true,
    swapForY: true,
    pair: new PublicKey(pairAddress),
    tokenBase: new PublicKey(tokenFrom),
    tokenQuote: new PublicKey(tokenTo),
    tokenBaseDecimal: 6,
    tokenQuoteDecimal: 6,
    slippage: 0.5
  });
  
  return Number(quoteData.amountOut) / 1e6;
}
```

### Order Execution

```typescript
private async executeOrder(order: LimitOrder) {
  // Get quote for actual swap
  const quoteData = await this.liquidityBookServices.getQuote({
    amount: BigInt(order.amount),
    // ... other parameters
  });

  // Create swap transaction
  const transaction = await this.liquidityBookServices.swap({
    amount: quoteData.amount,
    tokenMintX: new PublicKey(order.tokenFrom),
    tokenMintY: new PublicKey(order.tokenTo),
    otherAmountOffset: quoteData.otherAmountOffset,
    pair: new PublicKey(order.pairAddress),
    payer: new PublicKey(order.userWallet)
  });

  // Note: Transaction needs to be signed and sent
  // This requires user approval or delegation
}
```

## Usage in React Components

### Creating Orders

```typescript
const { createLimitOrder } = useOrderManager();

const handleCreateOrder = async () => {
  const orderId = await createLimitOrder(
    fromTokenMint,     // Token to sell
    toTokenMint,       // Token to buy
    amount,            // Amount to trade
    targetPrice,       // Execution price
    pairAddress,       // DLMM pool address
    'limit'            // Order type
  );
};
```

### Managing Orders

```typescript
const { getUserOrders, cancelOrder } = useOrderManager();

// Get user's orders
const orders = getUserOrders();

// Cancel an order
const success = cancelOrder(orderId);
```

## Important Considerations

### **1. Transaction Signing Challenge**

The biggest challenge is **automatic transaction signing**. Options include:

1. **User Approval Required**: Show transaction for each execution (recommended)
2. **Delegated Signing**: Use program-derived addresses (complex)
3. **Custody Service**: Third-party signing (centralized)

### **2. Price Monitoring Reliability**

- Client-side monitoring can miss price movements when app is closed
- Consider server-side monitoring for production use
- WebSocket connections for real-time price updates

### **3. Slippage and MEV Protection**

```typescript
// Add slippage protection
const minAmountOut = calculateMinAmountOut(quoteData.amountOut, slippage);

// Consider MEV protection strategies
const useJitoRPC = true; // For MEV protection
```

### **4. Error Handling**

```typescript
try {
  await executeOrder(order);
} catch (error) {
  // Handle different error types:
  // - Insufficient funds
  // - Price moved before execution
  // - Network issues
  // - Wallet disconnected
  
  order.status = 'failed';
  order.errorMessage = error.message;
}
```

## Deployment Considerations

### **For Production Use:**

1. **Backend Service**: Implement server-side order monitoring
2. **Database Storage**: Replace localStorage with proper database
3. **Real-time Updates**: Use WebSockets for price feeds
4. **Security**: Implement proper authentication and authorization
5. **Monitoring**: Add logging and alerting for order execution

### **Enhanced Features:**

1. **Advanced Order Types**:
   - Take Profit orders
   - Trailing Stop Loss
   - OCO (One-Cancels-Other) orders

2. **Portfolio Management**:
   - Risk management rules
   - Position sizing
   - Portfolio-wide stop losses

3. **Analytics**:
   - Order execution analytics
   - Performance tracking
   - Fee optimization

## Sample Pool Addresses (Devnet)

```typescript
const POOLS = {
  "SAROS/SOL": "C8xWcMpzqetpxwLj7tJfSQ6J8Juh1wHFdT5KrkwdYPQB",
  // Add more pool addresses as needed
};
```

## Testing Strategy

1. **Unit Tests**: Test order logic without blockchain interactions
2. **Integration Tests**: Test with Devnet using small amounts
3. **Simulation**: Test price monitoring and execution logic
4. **User Testing**: Validate UI/UX flow

This implementation provides a solid foundation for limit orders and stop loss functionality while working within the constraints of the current Saros DLMM SDK capabilities.
