"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

export function WalletInterface() {
    const { connected, publicKey } = useWallet();

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                    <h1 className="text-4xl font-bold">DLMM Trading Interface</h1>
                    <WalletMultiButton />
                </div>
                {connected ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold text-green-800 mb-2">Wallet Connected!</h2>
                        <p className="text-green-700">
                            Public Key: <code className="bg-green-100 px-2 py-1 rounded">{publicKey?.toString()}</code>
                        </p>
                    </div>
                ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold text-blue-800 mb-2">Connect Your Wallet</h2>
                        <p className="text-blue-700">
                            Please connect your Solana wallet to start trading with Dynamic Liquidity Market Maker (DLMM) pools.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-2">Pool Information</h3>
                        <p className="text-gray-600">View active DLMM pools and their current stats.</p>
                    </div>

                    <div className="border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-2">Trading</h3>
                        <p className="text-gray-600">Execute trades on available liquidity pools.</p>
                    </div>

                    <div className="border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-2">Liquidity</h3>
                        <p className="text-gray-600">Provide liquidity and earn fees from trading activity.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
