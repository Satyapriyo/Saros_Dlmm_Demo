

import { useState, useEffect } from "react";
import { SupabaseOrderManager, DatabaseOrder } from "@/lib/supabase";
import { Target, Shield, Clock, CheckCircle, X, AlertCircle, Users, Activity } from "lucide-react";
import { DLMMUtils } from "@/lib/dlmmUtils";
import { MODE } from "@saros-finance/dlmm-sdk";

export function AdminOrderView() {
    const [allOrders, setAllOrders] = useState<DatabaseOrder[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'limit' | 'stop-loss'>('all');
    const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});
    const [pricesLoading, setPricesLoading] = useState(false);
    const [stats, setStats] = useState({
        totalOrders: 0,
        activeOrders: 0,
        executedOrders: 0,
        cancelledOrders: 0,
        uniqueWallets: 0
    });

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            const [_all, active] = await Promise.all([
                SupabaseOrderManager.getOrdersByStatus('active'),
                SupabaseOrderManager.getActiveOrders()
            ]);

            // Load all orders for stats
            const allOrdersData = await Promise.all([
                SupabaseOrderManager.getOrdersByStatus('active'),
                SupabaseOrderManager.getOrdersByStatus('executed'),
                SupabaseOrderManager.getOrdersByStatus('cancelled'),
                SupabaseOrderManager.getOrdersByStatus('expired')
            ]);

            const flatAllOrders = allOrdersData.flat();
            setAllOrders(flatAllOrders);

            // Calculate stats
            const uniqueWallets = new Set(flatAllOrders.map(o => o.user_wallet)).size;
            setStats({
                totalOrders: flatAllOrders.length,
                activeOrders: flatAllOrders.filter(o => o.status === 'active').length,
                executedOrders: flatAllOrders.filter(o => o.status === 'executed').length,
                cancelledOrders: flatAllOrders.filter(o => o.status === 'cancelled').length,
                uniqueWallets
            });
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch current prices for all unique token pairs
    const fetchCurrentPrices = async () => {
        if (allOrders.length === 0) return;

        setPricesLoading(true);
        try {
            const dlmmUtils = new DLMMUtils(MODE.DEVNET);
            const uniquePairs = new Set<string>();
            const pairRequests: Array<{ fromToken: any; toToken: any }> = [];

            // Collect unique token pairs from orders
            allOrders.forEach(order => {
                const pairKey = `${order.token_from}/${order.token_to}`;
                if (!uniquePairs.has(pairKey)) {
                    uniquePairs.add(pairKey);
                    const fromToken = dlmmUtils.getTokenByMint(order.token_from);
                    const toToken = dlmmUtils.getTokenByMint(order.token_to);
                    if (fromToken && toToken) {
                        pairRequests.push({ fromToken, toToken });
                    }
                }
            });

            // Fetch prices for all pairs
            const prices = await dlmmUtils.getCurrentPrices(pairRequests);
            setCurrentPrices(prices);
        } catch (error) {
            console.error('Failed to fetch current prices:', error);
        } finally {
            setPricesLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();

        // Refresh every 30 seconds
        const interval = setInterval(loadOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    // Fetch prices when orders change
    useEffect(() => {
        if (allOrders.length > 0) {
            fetchCurrentPrices();

            // Refresh prices every 10 seconds
            const priceInterval = setInterval(fetchCurrentPrices, 10000);
            return () => clearInterval(priceInterval);
        }
    }, [allOrders]);

    const getFilteredOrders = () => {
        switch (selectedTab) {
            case 'active':
                return allOrders.filter(o => o.status === 'active');
            case 'limit':
                return allOrders.filter(o => o.type === 'limit');
            case 'stop-loss':
                return allOrders.filter(o => o.type === 'stop-loss');
            default:
                return allOrders;
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

    const getTokenSymbol = (tokenMint: string): string => {
        const tokenMap: { [key: string]: string } = {
            'So11111111111111111111111111111111111111112': 'SOL',
            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
            'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
            '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': 'RAY',
            'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt': 'SRM',
            'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE': 'ORCA',
            'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': 'JUP',
            'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 'BONK'
        };
        return tokenMap[tokenMint] || tokenMint.slice(0, 4) + '...';
    };

    const getCurrentPrice = (order: DatabaseOrder): string => {
        const fromSymbol = getTokenSymbol(order.token_from);
        const toSymbol = getTokenSymbol(order.token_to);
        const pairKey = `${fromSymbol}/${toSymbol}`;

        const price = currentPrices[pairKey];
        if (price !== undefined) {
            return price.toFixed(6);
        }

        return '—';
    };

    const truncateWallet = (wallet: string) => {
        return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Order Management Dashboard</h2>
                        <p className="text-gray-600">Monitor all limit orders and stop-loss orders across wallets</p>
                    </div>
                    <button
                        onClick={loadOrders}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                        <Activity className="w-4 h-4" />
                        <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-medium text-gray-600">Total Orders</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-medium text-gray-600">Active</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{stats.activeOrders}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-medium text-gray-600">Executed</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 mt-1">{stats.executedOrders}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-2">
                        <X className="w-5 h-5 text-red-500" />
                        <span className="text-sm font-medium text-gray-600">Cancelled</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600 mt-1">{stats.cancelledOrders}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-purple-500" />
                        <span className="text-sm font-medium text-gray-600">Wallets</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600 mt-1">{stats.uniqueWallets}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex space-x-1">
                    {['all', 'active', 'limit', 'stop-loss'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedTab === tab
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">
                        {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1).replace('-', ' ')} Orders
                        <span className="ml-2 text-sm font-normal text-gray-500">
                            ({getFilteredOrders().length} {getFilteredOrders().length === 1 ? 'order' : 'orders'})
                        </span>
                    </h3>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-500">Loading orders...</div>
                    </div>
                ) : getFilteredOrders().length === 0 ? (
                    <div className="p-8 text-center">
                        <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No orders found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Wallet
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pair
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Target Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Current Price
                                        {pricesLoading && (
                                            <span className="ml-2 inline-flex items-center">
                                                <svg className="animate-spin h-3 w-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </span>
                                        )}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {getFilteredOrders().map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${order.type === 'limit' ? 'bg-blue-100' : 'bg-red-100'
                                                    }`}>
                                                    {order.type === 'limit' ? (
                                                        <Target className="w-4 h-4 text-blue-600" />
                                                    ) : (
                                                        <Shield className="w-4 h-4 text-red-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 capitalize">
                                                        {order.type} Order
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {order.id.slice(0, 8)}...
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-mono text-gray-900">
                                                {truncateWallet(order.user_wallet)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">
                                                {getTokenSymbol(order.token_from)} → {getTokenSymbol(order.token_to)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">
                                                {order.amount} {getTokenSymbol(order.token_from)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">
                                                {order.target_price}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {pricesLoading ? (
                                                <span className="text-sm text-gray-400">Loading...</span>
                                            ) : (
                                                (() => {
                                                    const currentPrice = getCurrentPrice(order);
                                                    if (currentPrice === '—') {
                                                        return <span className="text-sm text-gray-400">—</span>;
                                                    }

                                                    const current = parseFloat(currentPrice);
                                                    const target = order.target_price;

                                                    return (
                                                        <span className={`text-sm font-medium ${order.type === 'limit'
                                                            ? (current >= target ? 'text-green-600' : 'text-gray-900')
                                                            : (current <= target ? 'text-red-600' : 'text-gray-900')
                                                            }`}>
                                                            {currentPrice}
                                                        </span>
                                                    );
                                                })()
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-1">
                                                {getStatusIcon(order.status)}
                                                <span className="text-sm capitalize">{order.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(order.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
