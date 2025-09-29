"use client";

import { ReactNode } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

interface WalletConnectionProviderProps {
    children: ReactNode;
}

export function WalletConnectionProvider({ children }: WalletConnectionProviderProps) {
    const wallets = [new PhantomWalletAdapter()];
    const apikey = process.env.NEXT_PUBLIC_RPC_MAINNET || "";

    return (
        <ConnectionProvider endpoint={`https://mainnet.helius-rpc.com/?api-key=${apikey}`}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
