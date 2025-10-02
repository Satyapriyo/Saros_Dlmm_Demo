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
    console.log("RPC Endpoint:", `https://devnet.helius-rpc.com/?api-key=${apikey}`);


    return (
        <ConnectionProvider endpoint={`https://devnet.helius-rpc.com/?api-key=c171e5b5-d26b-49ac-a0fd-783b2607122d`}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
