"use client";

import { useState, useEffect, useMemo } from "react";
import { DLMMUtils, DLMMPair } from "@/lib/dlmmUtils";
import { MODE } from "@saros-finance/dlmm-sdk";
import {
    BarChart3,
    TrendingUp,
    DollarSign,
    Droplets,
    ArrowUpDown,
    RefreshCw,
    Search,
    Filter,
    ExternalLink,
    Info,
    Star,
    Activity
} from "lucide-react";

interface PoolStats {
    totalTVL: number;
    total24hVolume: number;
    totalPairs: number;
    averageAPR: number;
}

export function PoolOverview() {
    const dlmmUtils = useMemo(() => new DLMMUtils(MODE.MAINNET), []);
    const [pools, setPools] = useState<DLMMPair[]>([]);
    const [filteredPools, setFilteredPools] = useState<DLMMPair[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'tvl' | 'volume' | 'apr' | 'name'>('tvl');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filterBy, setFilterBy] = useState<'all' | 'high-tvl' | 'high-volume'>('all');

    // Load pools data
    useEffect(() => {
        const loadPools = () => {
            setIsLoading(true);
            try {
                const allPools = dlmmUtils.getAllPairs();
                setPools(allPools);
                setFilteredPools(allPools);
            } catch (error) {
                console.error('Error loading pools:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadPools();
    }, [dlmmUtils]);

    // Filter and sort pools
    useEffect(() => {
        let filtered = [...pools];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(pool =>
                `${pool.tokenX.symbol}/${pool.tokenY.symbol}`.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter
        switch (filterBy) {
            case 'high-tvl':
                filtered = filtered.filter(pool => (pool.tvl || 0) > 1000000); // > $1M TVL
                break;
            case 'high-volume':
                filtered = filtered.filter(pool => (pool.volume24h || 0) > 500000); // > $500K volume
                break;
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue: number, bValue: number;

            switch (sortBy) {
                case 'tvl':
                    aValue = a.tvl || 0;
                    bValue = b.tvl || 0;
                    break;
                case 'volume':
                    aValue = a.volume24h || 0;
                    bValue = b.volume24h || 0;
                    break;
                case 'apr':
                    // Calculate estimated APR based on volume/TVL ratio
                    aValue = ((a.volume24h || 0) * 365 * (a.baseFeePercentage / 100)) / (a.tvl || 1);
                    bValue = ((b.volume24h || 0) * 365 * (b.baseFeePercentage / 100)) / (b.tvl || 1);
                    break;
                case 'name':
                    return sortOrder === 'asc'
                        ? `${a.tokenX.symbol}/${a.tokenY.symbol}`.localeCompare(`${b.tokenX.symbol}/${b.tokenY.symbol}`)
                        : `${b.tokenX.symbol}/${b.tokenY.symbol}`.localeCompare(`${a.tokenX.symbol}/${a.tokenY.symbol}`);
                default:
                    aValue = 0;
                    bValue = 0;
            }

            return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        });

        setFilteredPools(filtered);
    }, [pools, searchTerm, sortBy, sortOrder, filterBy]);

    // Calculate overall stats
    const stats: PoolStats = useMemo(() => {
        const totalTVL = pools.reduce((sum, pool) => sum + (pool.tvl || 0), 0);
        const total24hVolume = pools.reduce((sum, pool) => sum + (pool.volume24h || 0), 0);
        const totalPairs = pools.length;
        const averageAPR = pools.length > 0
            ? pools.reduce((sum, pool) => {
                const apr = ((pool.volume24h || 0) * 365 * (pool.baseFeePercentage / 100)) / (pool.tvl || 1);
                return sum + apr;
            }, 0) / pools.length * 100
            : 0;

        return {
            totalTVL,
            total24hVolume,
            totalPairs,
            averageAPR
        };
    }, [pools]);

    const formatCurrency = (amount: number) => {
        if (amount >= 1_000_000) {
            return `$${(amount / 1_000_000).toFixed(2)}M`;
        } else if (amount >= 1_000) {
            return `$${(amount / 1_000).toFixed(0)}K`;
        } else {
            return `$${amount.toFixed(2)}`;
        }
    };

    const calculateAPR = (pool: DLMMPair) => {
        if (!pool.tvl || !pool.volume24h) return 0;
        return ((pool.volume24h * 365 * (pool.baseFeePercentage / 100)) / pool.tvl) * 100;
    };

    const getTokenLogo = (mint: string) => {
        const token = dlmmUtils.getTokenByMint(mint);
        return token?.logoURI || '/placeholder-token.png';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">DLMM Pool Overview</h2>
                    <p className="text-gray-600">Discover and analyze dynamic liquidity market maker pools</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Value Locked</p>
                            <p className="text-xl font-semibold text-gray-900">{formatCurrency(stats.totalTVL)}</p>
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
                            <p className="text-xl font-semibold text-gray-900">{formatCurrency(stats.total24hVolume)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Droplets className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Active Pools</p>
                            <p className="text-xl font-semibold text-gray-900">{stats.totalPairs}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Avg APR</p>
                            <p className="text-xl font-semibold text-gray-900">{stats.averageAPR.toFixed(1)}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search pools (e.g., SOL/USDC)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Filter */}
                        <select
                            value={filterBy}
                            onChange={(e) => setFilterBy(e.target.value as any)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Pools</option>
                            <option value="high-tvl">High TVL (`&gt;`$1M)</option>
                            <option value="high-volume">High Volume (`&gt;`$500K)</option>
                        </select>

                        {/* Sort */}
                        <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [newSortBy, newSortOrder] = e.target.value.split('-');
                                setSortBy(newSortBy as any);
                                setSortOrder(newSortOrder as any);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="tvl-desc">TVL: High to Low</option>
                            <option value="tvl-asc">TVL: Low to High</option>
                            <option value="volume-desc">Volume: High to Low</option>
                            <option value="volume-asc">Volume: Low to High</option>
                            <option value="apr-desc">APR: High to Low</option>
                            <option value="apr-asc">APR: Low to High</option>
                            <option value="name-asc">Name: A to Z</option>
                            <option value="name-desc">Name: Z to A</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Pools Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">
                        Pool Details
                        <span className="ml-2 text-sm font-normal text-gray-500">
                            ({filteredPools.length} {filteredPools.length === 1 ? 'pool' : 'pools'})
                        </span>
                    </h3>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center">
                        <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Loading pools...</p>
                    </div>
                ) : filteredPools.length === 0 ? (
                    <div className="p-8 text-center">
                        <Droplets className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No pools found</p>
                        <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pool
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        TVL
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        24h Volume
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Est. APR
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Bin Step
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPools.map((pool) => (
                                    <tr key={pool.pairAddress} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex -space-x-2">
                                                    <img
                                                        src={getTokenLogo(pool.tokenX.mint)}
                                                        alt={pool.tokenX.symbol}
                                                        className="w-8 h-8 rounded-full border-2 border-white"
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/placeholder-token.png';
                                                        }}
                                                    />
                                                    <img
                                                        src={getTokenLogo(pool.tokenY.mint)}
                                                        alt={pool.tokenY.symbol}
                                                        className="w-8 h-8 rounded-full border-2 border-white"
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/placeholder-token.png';
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {pool.tokenX.symbol}/{pool.tokenY.symbol}
                                                    </p>
                                                    <p className="text-xs text-gray-500">DLMM Pool</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 font-medium">
                                                {formatCurrency(pool.tvl || 0)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 font-medium">
                                                {formatCurrency(pool.volume24h || 0)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-green-600 font-medium">
                                                {calculateAPR(pool).toFixed(1)}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {pool.binStep} bps
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center space-x-2">
                                                <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                                    <ArrowUpDown className="w-3 h-3 mr-1" />
                                                    Trade
                                                </button>
                                                <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
                                                    <Droplets className="w-3 h-3 mr-1" />
                                                    Add Liquidity
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* DLMM Information */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="text-lg font-medium text-blue-900 mb-2">About DLMM Pools</h4>
                        <div className="text-sm text-blue-800 space-y-2">
                            <p>
                                <strong>Dynamic Liquidity Market Maker (DLMM)</strong> pools offer superior capital efficiency
                                and reduced impermanent loss compared to traditional AMMs.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <p className="font-medium">Key Benefits:</p>
                                    <ul className="list-disc list-inside space-y-1 text-xs">
                                        <li>Zero slippage for trades within bin ranges</li>
                                        <li>Dynamic fee adjustment based on volatility</li>
                                        <li>Concentrated liquidity with flexible positions</li>
                                        <li>Built-in MEV protection</li>
                                    </ul>
                                </div>
                                <div>
                                    <p className="font-medium">Pool Features:</p>
                                    <ul className="list-disc list-inside space-y-1 text-xs">
                                        <li>Bin Step: Price granularity between liquidity bins</li>
                                        <li>APR: Estimated annual percentage return from fees</li>
                                        <li>Real-time TVL and volume tracking</li>
                                        <li>Active liquidity management tools</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
