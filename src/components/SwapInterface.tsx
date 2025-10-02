"use client";

import { useState, useEffect, useMemo } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { ArrowLeftRight, Settings, RefreshCw, AlertCircle, TrendingUp, Info } from "lucide-react";
import toast from 'react-hot-toast';
import { DLMMUtils, Token, DEVNET_TOKENS } from "@/lib/dlmmUtils";
import { MODE } from "@saros-finance/dlmm-sdk";

interface SwapQuote {
    amountIn: bigint;
    amountOut: bigint;
    amountOutMin: bigint;
    priceImpact: number;
    fee: bigint;
    exchangeRate: number;
    pair: any;
}

export function SwapInterface() {
    const { publicKey, sendTransaction, connected } = useWallet();
    const { connection } = useConnection();

    // DLMM Utils instance
    const dlmmUtils = useMemo(() => new DLMMUtils(MODE.DEVNET), []);

    // State
    const [fromToken, setFromToken] = useState<Token | null>(null);
    const [toToken, setToToken] = useState<Token | null>(null);
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('');
    const [slippage, setSlippage] = useState(0.5);
    const [isSwapping, setIsSwapping] = useState(false);
    const [isGettingQuote, setIsGettingQuote] = useState(false);
    const [quote, setQuote] = useState<SwapQuote | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);

    // Available tokens
    const tokens: Token[] = dlmmUtils.getTokens();    // Get quote from DLMM
    const getQuote = async () => {
        if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
            setQuote(null);
            setToAmount('');
            return;
        }

        setIsGettingQuote(true);
        setError(null);

        try {
            const quoteData = await dlmmUtils.getSwapQuote({
                fromToken,
                toToken,
                amount: fromAmount,
                isExactInput: true,
                slippage: slippage / 100,
            });

            const outputAmount = Number(quoteData.amountOut) / Math.pow(10, toToken.decimals);
            setToAmount(outputAmount.toFixed(6));

            setQuote({
                amountIn: quoteData.amount,
                amountOut: quoteData.amountOut,
                amountOutMin: quoteData.otherAmountOffset ?? quoteData.amountOut, // Use otherAmountOffset as min amount
                priceImpact: quoteData.priceImpact,
                fee: BigInt(0), // Fee calculation would need to be implemented
                exchangeRate: quoteData.exchangeRate,
                pair: quoteData.pair
            });

        } catch (error) {
            console.error('Error getting quote:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to get quote';
            setError(errorMessage);
            toast.error(`Failed to get quote: ${errorMessage}`);
            setToAmount('');
            setQuote(null);
        } finally {
            setIsGettingQuote(false);
        }
    };

    // Execute swap
    const executeSwap = async () => {
        if (!connected || !publicKey || !fromToken || !toToken || !quote) {
            setError('Please connect wallet and get a quote first');
            return;
        }
        setIsSwapping(true);
        const loadingToast = toast.loading('Processing swap transaction...');
        setError(null);
        try {
            // Create swap transaction using our utility
            const swapTransaction = await dlmmUtils.createSwapTransaction({
                fromToken,
                toToken,
                amount: quote.amountIn,
                minAmountOut: quote.amountOutMin,
                userPublicKey: publicKey,
            });
            // Send transaction (cast to resolve type compatibility)
            const signature = await sendTransaction(swapTransaction as any, connection, { skipPreflight: false });
            // Wait for confirmation
            await connection.confirmTransaction(signature, 'confirmed');
            console.log('Swap successful:', signature);
            // Reset form
            setFromAmount('');
            setToAmount('');
            setQuote(null);

            toast.success(`Swap completed successfully! Transaction: ${signature}`, {
                id: loadingToast,
                duration: 6000,
            });

        } catch (error) {
            console.error('Swap failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Swap failed';
            setError(errorMessage);
            toast.error(`Swap failed: ${errorMessage}`, {
                id: loadingToast,
            });
        } finally {
            setIsSwapping(false);
        }
    };
    // Flip tokens
    const flipTokens = () => {
        const tempToken = fromToken;
        setFromToken(toToken);
        setToToken(tempToken);
        const tempAmount = fromAmount;
        setFromAmount(toAmount);
        setToAmount(tempAmount);
        setQuote(null);
    };

    // Check if swap is available
    const canSwap = fromToken && toToken ? dlmmUtils.canSwap(fromToken, toToken) : false;

    // Get quote when inputs change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            getQuote();
        }, 500); // Debounce

        return () => clearTimeout(timeoutId);
    }, [fromToken, toToken, fromAmount, slippage]);

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Swap Tokens</h3>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Settings className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Settings Panel */}
                {showSettings && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700">Slippage Tolerance</label>
                            <span className="text-sm text-gray-500">{slippage}%</span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="5"
                            step="0.1"
                            value={slippage}
                            onChange={(e) => setSlippage(parseFloat(e.target.value))}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0.1%</span>
                            <span>5%</span>
                        </div>
                    </div>
                )}

                {/* From Token */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                    <div className="flex space-x-2">
                        <input
                            type="number"
                            value={fromAmount}
                            onChange={(e) => setFromAmount(e.target.value)}
                            placeholder="0.0"
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={isSwapping}
                        />
                        <select
                            value={fromToken?.mint || ''}
                            onChange={(e) => {
                                const token = tokens.find(t => t.mint === e.target.value);
                                setFromToken(token || null);
                            }}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px]"
                            disabled={isSwapping}
                        >
                            <option value="">Select</option>
                            {tokens.map((token) => (
                                <option key={token.mint} value={token.mint}>
                                    {token.symbol}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Flip Button */}
                <div className="flex justify-center mb-4">
                    <button
                        onClick={flipTokens}
                        disabled={isSwapping}
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        <ArrowLeftRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* To Token */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={toAmount}
                            placeholder="0.0"
                            readOnly
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                        />
                        <select
                            value={toToken?.mint || ''}
                            onChange={(e) => {
                                const token = tokens.find(t => t.mint === e.target.value);
                                setToToken(token || null);
                            }}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px]"
                            disabled={isSwapping}
                        >
                            <option value="">Select</option>
                            {tokens.map((token) => (
                                <option key={token.mint} value={token.mint}>
                                    {token.symbol}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Pair Availability Warning */}
                {fromToken && toToken && !canSwap && (
                    <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <span className="text-sm text-amber-800">
                                No DLMM pair available for {fromToken.symbol}/{toToken.symbol}. Please select different tokens.
                            </span>
                        </div>
                    </div>
                )}

                {/* Quote Information */}
                {quote && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2 mb-3">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">Quote Details</span>
                            <div className="flex items-center space-x-1 text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
                                <Info className="w-3 h-3" />
                                <span>DLMM Pool</span>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Rate:</span>
                                <span className="text-gray-900">
                                    1 {fromToken?.symbol} = {quote.exchangeRate.toFixed(6)} {toToken?.symbol}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Price Impact:</span>
                                <span className={`${quote.priceImpact > 1 ? 'text-red-600' : 'text-green-600'}`}>
                                    {quote.priceImpact.toFixed(2)}%
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Min. Received:</span>
                                <span className="text-gray-900">
                                    {(Number(quote.amountOutMin) / Math.pow(10, toToken?.decimals || 6)).toFixed(6)} {toToken?.symbol}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Liquidity Source:</span>
                                <span className="text-blue-700 font-medium">
                                    {quote.pair?.tokenX?.symbol}/{quote.pair?.tokenY?.symbol} DLMM
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span className="text-sm text-red-800">{error}</span>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isGettingQuote && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <RefreshCw className="w-4 h-4 text-gray-600 animate-spin" />
                            <span className="text-sm text-gray-600">Getting quote...</span>
                        </div>
                    </div>
                )}

                {/* Swap Button */}
                <button
                    onClick={executeSwap}
                    disabled={!connected || isSwapping || !quote || isGettingQuote || !canSwap}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                    {isSwapping ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Swapping...</span>
                        </>
                    ) : !connected ? (
                        <span>Connect Wallet</span>
                    ) : !canSwap ? (
                        <span>Pair Not Available</span>
                    ) : !quote ? (
                        <span>Enter Amount</span>
                    ) : (
                        <span>Swap Tokens</span>
                    )}
                </button>

                {/* DLMM Benefits */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">DLMM Benefits</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Zero slippage for small trades</li>
                        <li>• Superior capital efficiency</li>
                        <li>• Dynamic fee optimization</li>
                        <li>• MEV protection built-in</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
