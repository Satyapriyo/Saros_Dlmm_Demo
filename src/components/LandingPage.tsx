"use client";

import { useState } from "react";
import { ChevronRight, Zap, Shield, TrendingUp, DollarSign, Users, BarChart3 } from "lucide-react";

interface LandingPageProps {
    onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Saros DLMM</span>
                        </div>
                        <button
                            onClick={onGetStarted}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
                        >
                            <span>Launch App</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                            The Future of
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {" "}Liquidity Trading
                            </span>
                        </h1>
                        <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
                            Experience next-generation Dynamic Liquidity Market Making (DLMM) on Solana.
                            Trade with unparalleled capital efficiency, reduced slippage, and maximized returns.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={onGetStarted}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
                            >
                                <span>Start Trading</span>
                                <ChevronRight className="w-5 h-5" />
                            </button>
                            <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:border-gray-400 transition-colors">
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Why Choose Saros DLMM?
                        </h2>
                        <p className="text-xl text-gray-600">
                            Revolutionary advantages that set us apart from traditional AMMs
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl border border-blue-200">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Lightning Fast Execution
                            </h3>
                            <p className="text-gray-600">
                                Built on Solana's high-performance blockchain for instant trades with minimal fees.
                                Experience sub-second transaction confirmations.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-xl border border-purple-200">
                            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Superior Capital Efficiency
                            </h3>
                            <p className="text-gray-600">
                                DLMM's concentrated liquidity model ensures your capital works harder,
                                generating higher yields compared to traditional AMMs.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl border border-green-200">
                            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Reduced Impermanent Loss
                            </h3>
                            <p className="text-gray-600">
                                Advanced algorithms and dynamic pricing mechanisms significantly minimize
                                impermanent loss risks for liquidity providers.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-xl border border-orange-200">
                            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Dynamic Fee Structure
                            </h3>
                            <p className="text-gray-600">
                                Intelligent fee optimization that adjusts based on market conditions,
                                ensuring optimal returns for both traders and liquidity providers.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-xl border border-indigo-200">
                            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Community-Driven
                            </h3>
                            <p className="text-gray-600">
                                Join a thriving ecosystem of traders and liquidity providers.
                                Benefit from shared insights and collaborative growth.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-8 rounded-xl border border-pink-200">
                            <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Advanced Analytics
                            </h3>
                            <p className="text-gray-600">
                                Comprehensive trading analytics and insights to help you make
                                informed decisions and optimize your strategies.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            How Saros DLMM Works
                        </h2>
                        <p className="text-xl text-gray-600">
                            Simple steps to start maximizing your DeFi potential
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-white">1</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Connect Your Wallet
                            </h3>
                            <p className="text-gray-600">
                                Securely connect your Solana wallet to access the platform.
                                We support all major wallets including Phantom, Solflare, and more.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-white">2</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Choose Your Strategy
                            </h3>
                            <p className="text-gray-600">
                                Trade tokens with minimal slippage or provide liquidity to earn fees.
                                Our DLMM technology optimizes returns for both strategies.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-pink-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-white">3</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Start Earning
                            </h3>
                            <p className="text-gray-600">
                                Execute trades instantly or watch your liquidity generate passive income.
                                Monitor your performance with real-time analytics.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to Experience the Future?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of users who are already maximizing their DeFi potential with Saros DLMM
                    </p>
                    <button
                        onClick={onGetStarted}
                        className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 mx-auto"
                    >
                        <span>Launch App Now</span>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold">Saros DLMM</span>
                        </div>
                        <p className="text-gray-400 mb-4">
                            The next generation of decentralized trading on Solana
                        </p>
                        <p className="text-sm text-gray-500">
                            © 2025 Saros DLMM. Built with ❤️ for the DeFi community.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
