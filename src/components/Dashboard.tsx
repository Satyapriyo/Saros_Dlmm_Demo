"use client";

import { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import {
    ArrowLeftRight,
    Plus,
    Minus,
    BarChart3,
    Wallet,
    TrendingUp,
    DollarSign,
    Activity,
    ArrowLeft,
    Target,
    Shield,
    Clock
} from "lucide-react";
import { OrderManagement } from "./OrderManagement";
import { AdminOrderView } from "./AdminOrderView";
import { SwapInterface } from "./SwapInterface";
import { PoolOverview } from "./PoolOverview";

interface DashboardProps {
    onBackToLanding: () => void;
}

export function Dashboard({ onBackToLanding }: DashboardProps) {
    const { connected, publicKey } = useWallet();
    const [activeTab, setActiveTab] = useState<'swap' | 'liquidity' | 'pools' | 'orders' | 'admin'>('swap');

    if (!connected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
                    <p className="text-gray-600 mb-6">
                        Please connect your Solana wallet to access the trading dashboard
                    </p>
                    <WalletMultiButton />
                    <button
                        onClick={onBackToLanding}
                        className="mt-4 text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-center space-x-2 mx-auto"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Landing</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onBackToLanding}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-gray-900">Saros DLMM</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Connected:</span>{' '}
                                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                    {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
                                </code>
                            </div>
                            <WalletMultiButton />
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Value Locked</p>
                                <p className="text-xl font-semibold text-gray-900">$12.4M</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">24h Volume</p>
                                <p className="text-xl font-semibold text-gray-900">$2.1M</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Activity className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Active Pools</p>
                                <p className="text-xl font-semibold text-gray-900">156</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Your Balance</p>
                                <p className="text-xl font-semibold text-gray-900">$0.00</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="flex">
                            <button
                                onClick={() => setActiveTab('swap')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'swap'
                                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <ArrowLeftRight className="w-4 h-4" />
                                    <span>Swap</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('liquidity')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'liquidity'
                                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <Plus className="w-4 h-4" />
                                    <span>Add/Remove Liquidity</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('pools')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pools'
                                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <BarChart3 className="w-4 h-4" />
                                    <span>Pool Overview</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'orders'
                                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <Target className="w-4 h-4" />
                                    <span>Limit & Stop Orders</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('admin')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'admin'
                                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <Activity className="w-4 h-4" />
                                    <span>All Orders (Admin)</span>
                                </div>
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* Swap Tab */}
                        {activeTab === 'swap' && (
                            <SwapInterface />
                        )}

                        {/* Liquidity Tab */}
                        {activeTab === 'liquidity' && (
                            <div className="max-w-2xl mx-auto">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Manage Liquidity</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <Plus className="w-5 h-5 text-green-600" />
                                            </div>
                                            <h4 className="text-lg font-medium text-gray-900">Add Liquidity</h4>
                                        </div>
                                        <p className="text-gray-600 mb-4">
                                            Provide liquidity to earn fees from trades. DLMM pools offer superior capital efficiency.
                                        </p>
                                        <button className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                                            Add Liquidity
                                        </button>
                                    </div>

                                    <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                                <Minus className="w-5 h-5 text-red-600" />
                                            </div>
                                            <h4 className="text-lg font-medium text-gray-900">Remove Liquidity</h4>
                                        </div>
                                        <p className="text-gray-600 mb-4">
                                            Remove your liquidity positions and claim accumulated fees from your pools.
                                        </p>
                                        <button className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
                                            Remove Liquidity
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Your Liquidity Positions</h4>
                                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                                        <p className="text-gray-500">No liquidity positions found</p>
                                        <p className="text-sm text-gray-400 mt-1">Add liquidity to a pool to see your positions here</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pools Tab */}
                        {activeTab === 'pools' && (
                            <PoolOverview />
                        )}

                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Advanced Orders</h3>
                                <OrderManagement />
                            </div>
                        )}

                        {/* Admin Tab */}
                        {activeTab === 'admin' && (
                            <div>
                                <AdminOrderView />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
