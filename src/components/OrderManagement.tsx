"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useOrderManager, LimitOrder } from "@/lib/orderManager";
import { Target, Shield, Clock, X, CheckCircle, AlertCircle } from "lucide-react";
import toast from 'react-hot-toast';

export function OrderManagement() {
    const { connected, publicKey } = useWallet();
    const { createLimitOrder, getUserOrders, cancelOrder, getActiveOrders, orders, isLoading, refreshOrders } = useOrderManager();

    const [orderType, setOrderType] = useState<'limit' | 'stop-loss'>('limit');
    const [fromToken, setFromToken] = useState('');
    const [toToken, setToToken] = useState('');
    const [amount, setAmount] = useState('');
    const [targetPrice, setTargetPrice] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Sample token data - in real app, this would come from API
    const tokens = [
        { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112', decimals: 9 },
        { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
        { symbol: 'RAY', mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', decimals: 6 },
        { symbol: 'SRM', mint: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt', decimals: 6 }
    ];

    // Sample pool address - in real app, you'd fetch this based on token pair
    const getPairAddress = (tokenA: string, tokenB: string) => {
        // This is a placeholder - you'd implement actual pair discovery
        return "C8xWcMpzqetpxwLj7tJfSQ6J8Juh1wHFdT5KrkwdYPQB";
    };

    useEffect(() => {
        if (connected && publicKey) {
            refreshOrders();
        }
    }, [connected, publicKey, refreshOrders]);

    const handleCreateOrder = async () => {
        if (!fromToken || !toToken || !amount || !targetPrice) {
            toast.error('Please fill all fields');
            return;
        }

        setIsCreating(true);
        const loadingToast = toast.loading(`Creating ${orderType === 'limit' ? 'limit' : 'stop loss'} order...`);

        try {
            const pairAddress = getPairAddress(fromToken, toToken);
            await createLimitOrder(
                fromToken,
                toToken,
                parseFloat(amount),
                parseFloat(targetPrice),
                pairAddress,
                orderType
            );

            // Reset form
            setAmount('');
            setTargetPrice('');

            toast.success(`${orderType === 'limit' ? 'Limit order' : 'Stop loss order'} created successfully!`, {
                id: loadingToast,
            });
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error('Failed to create order. Please try again.', {
                id: loadingToast,
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        const loadingToast = toast.loading('Cancelling order...');

        try {
            const success = await cancelOrder(orderId);
            if (success) {
                toast.success('Order cancelled successfully', {
                    id: loadingToast,
                });
            } else {
                toast.error('Failed to cancel order', {
                    id: loadingToast,
                });
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error('Failed to cancel order', {
                id: loadingToast,
            });
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <Clock className="w-4 h-4 text-blue-500" />;
            case 'executed':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'cancelled':
                return <X className="w-4 h-4 text-red-500" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-500" />;
        }
    };

    const getTokenSymbol = (mintAddress: string) => {
        const token = tokens.find(t => t.mint === mintAddress);
        return token?.symbol || mintAddress.slice(0, 4) + '...';
    };

    if (!connected) {
        return (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
                <p className="text-gray-500">Connect your wallet to manage orders</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Order Creation Form */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Create New Order</h3>

                {/* Order Type Selection */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                        onClick={() => setOrderType('limit')}
                        className={`p-4 rounded-lg border-2 transition-all ${orderType === 'limit'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center space-x-3">
                            <Target className={`w-5 h-5 ${orderType === 'limit' ? 'text-blue-600' : 'text-gray-600'}`} />
                            <div className="text-left">
                                <p className="font-medium">Limit Order</p>
                                <p className="text-sm text-gray-600">Execute at target price</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setOrderType('stop-loss')}
                        className={`p-4 rounded-lg border-2 transition-all ${orderType === 'stop-loss'
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center space-x-3">
                            <Shield className={`w-5 h-5 ${orderType === 'stop-loss' ? 'text-red-600' : 'text-gray-600'}`} />
                            <div className="text-left">
                                <p className="font-medium">Stop Loss</p>
                                <p className="text-sm text-gray-600">Limit losses</p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">From Token</label>
                        <select
                            value={fromToken}
                            onChange={(e) => setFromToken(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Token</option>
                            {tokens.map(token => (
                                <option key={token.mint} value={token.mint}>{token.symbol}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">To Token</label>
                        <select
                            value={toToken}
                            onChange={(e) => setToToken(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Token</option>
                            {tokens.map(token => (
                                <option key={token.mint} value={token.mint}>{token.symbol}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {orderType === 'limit' ? 'Target Price' : 'Stop Loss Price'}
                        </label>
                        <input
                            type="number"
                            value={targetPrice}
                            onChange={(e) => setTargetPrice(e.target.value)}
                            placeholder="0.0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <button
                    onClick={handleCreateOrder}
                    disabled={isCreating}
                    className={`w-full py-3 rounded-lg font-medium transition-all ${orderType === 'limit'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {isCreating
                        ? 'Creating Order...'
                        : `Create ${orderType === 'limit' ? 'Limit Order' : 'Stop Loss Order'}`
                    }
                </button>
            </div>

            {/* Orders List */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Your Orders</h3>
                    {isLoading && (
                        <div className="text-sm text-gray-500">Loading...</div>
                    )}
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-8">
                        <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No orders found</p>
                        <p className="text-sm text-gray-400">Create your first order to get started</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map((order: LimitOrder) => (
                            <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${order.type === 'limit' ? 'bg-blue-100' : 'bg-red-100'
                                            }`}>
                                            {order.type === 'limit' ? (
                                                <Target className={`w-5 h-5 ${order.type === 'limit' ? 'text-blue-600' : 'text-red-600'}`} />
                                            ) : (
                                                <Shield className="w-5 h-5 text-red-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {getTokenSymbol(order.tokenFrom)} → {getTokenSymbol(order.tokenTo)}
                                            </p>
                                            <p className="text-sm text-gray-500 capitalize">{order.type} Order</p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-medium">{order.amount} {getTokenSymbol(order.tokenFrom)}</p>
                                        <p className="text-sm text-gray-500">@ {order.targetPrice}</p>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center space-x-1">
                                            {getStatusIcon(order.status)}
                                            <span className="text-sm capitalize">{order.status}</span>
                                        </div>

                                        {order.status === 'active' && (
                                            <button
                                                onClick={() => handleCancelOrder(order.id)}
                                                className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {order.currentPrice && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Current Price:</span>
                                            <span className={`font-medium ${order.type === 'limit'
                                                ? (order.currentPrice >= order.targetPrice ? 'text-green-600' : 'text-gray-900')
                                                : (order.currentPrice <= order.targetPrice ? 'text-red-600' : 'text-gray-900')
                                                }`}>
                                                {order.currentPrice}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
