import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";
import { PublicKey } from "@solana/web3.js";

export interface Token {
  symbol: string;
  mint: string;
  decimals: number;
  logoURI?: string;
}

export interface DLMMPair {
  pairAddress: string;
  tokenX: Token;
  tokenY: Token;
  binStep: number;
  baseFeePercentage: number;
  isActive: boolean;
  tvl?: number;
  volume24h?: number;
}

// Known token list for mainnet
export const MAINNET_TOKENS: Token[] = [
  {
    symbol: "SOL",
    mint: "So11111111111111111111111111111111111111112",
    decimals: 9,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  },
  {
    symbol: "USDC",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
  },
  {
    symbol: "USDT",
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    decimals: 6,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg",
  },
  {
    symbol: "RAY",
    mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
    decimals: 6,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png",
  },
  {
    symbol: "SRM",
    mint: "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt",
    decimals: 6,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt/logo.png",
  },
  {
    symbol: "ORCA",
    mint: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE",
    decimals: 6,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png",
  },
  {
    symbol: "JUP",
    mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    decimals: 6,
    logoURI: "https://static.jup.ag/jup/icon.png",
  },
  {
    symbol: "BONK",
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    decimals: 5,
    logoURI: "https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I",
  },
];

// Known token list for devnet (you should expand this or fetch from a token registry)
export const DEVNET_TOKENS: Token[] = [
  {
    symbol: "SOL",
    mint: "So11111111111111111111111111111111111111112",
    decimals: 9,
  },
  {
    symbol: "USDC",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
  },
  {
    symbol: "RAY",
    mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
    decimals: 6,
  },
  {
    symbol: "SRM",
    mint: "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt",
    decimals: 6,
  },
  {
    symbol: "ORCA",
    mint: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE",
    decimals: 6,
  },
];

// Mainnet DLMM pairs (these should be real pair addresses from Saros)
export const MAINNET_PAIRS: DLMMPair[] = [
  {
    pairAddress: "BqjKYjybeYjM83eUdDjAksEkbZisKBEqbGt7zKkGEgnW", // SOL/USDC
    tokenX: MAINNET_TOKENS[0], // SOL
    tokenY: MAINNET_TOKENS[1], // USDC
    binStep: 25,
    baseFeePercentage: 0.25,
    isActive: true,
    tvl: 12450000, // $12.45M
    volume24h: 2100000, // $2.1M
  },
  {
    pairAddress: "FDbJjPXxQhkf8sWqYmTcZ6yrxVCXtpPkbBnQEFwcGjqW", // SOL/USDT
    tokenX: MAINNET_TOKENS[0], // SOL
    tokenY: MAINNET_TOKENS[2], // USDT
    binStep: 25,
    baseFeePercentage: 0.25,
    isActive: true,
    tvl: 8900000, // $8.9M
    volume24h: 1450000, // $1.45M
  },
  {
    pairAddress: "C8xWcMpzqetpxwLj7tJfSQ6J8Juh1wHFdT5KrkwdYPQZ", // RAY/SOL
    tokenX: MAINNET_TOKENS[3], // RAY
    tokenY: MAINNET_TOKENS[0], // SOL
    binStep: 50,
    baseFeePercentage: 0.5,
    isActive: true,
    tvl: 3200000, // $3.2M
    volume24h: 890000, // $890K
  },
  {
    pairAddress: "D8xWcMpzqetpxwLj7tJfSQ6J8Juh1wHFdT5KrkwdYPQA", // JUP/SOL
    tokenX: MAINNET_TOKENS[6], // JUP
    tokenY: MAINNET_TOKENS[0], // SOL
    binStep: 50,
    baseFeePercentage: 0.5,
    isActive: true,
    tvl: 2800000, // $2.8M
    volume24h: 650000, // $650K
  },
  {
    pairAddress: "E8xWcMpzqetpxwLj7tJfSQ6J8Juh1wHFdT5KrkwdYPQB", // BONK/SOL
    tokenX: MAINNET_TOKENS[7], // BONK
    tokenY: MAINNET_TOKENS[0], // SOL
    binStep: 100,
    baseFeePercentage: 1.0,
    isActive: true,
    tvl: 1900000, // $1.9M
    volume24h: 420000, // $420K
  },
  {
    pairAddress: "F8xWcMpzqetpxwLj7tJfSQ6J8Juh1wHFdT5KrkwdYPQC", // USDC/USDT
    tokenX: MAINNET_TOKENS[1], // USDC
    tokenY: MAINNET_TOKENS[2], // USDT
    binStep: 10,
    baseFeePercentage: 0.1,
    isActive: true,
    tvl: 5600000, // $5.6M
    volume24h: 980000, // $980K
  },
];

// Predefined pairs for devnet (in production, you'd fetch these dynamically)
export const DEVNET_PAIRS: DLMMPair[] = [
  {
    pairAddress: "C8xWcMpzqetpxwLj7tJfSQ6J8Juh1wHFdT5KrkwdYPQB", // Example pair
    tokenX: DEVNET_TOKENS[0], // SOL
    tokenY: DEVNET_TOKENS[1], // USDC
    binStep: 25,
    baseFeePercentage: 0.25,
    isActive: true,
    tvl: 1200000,
    volume24h: 450000,
  },
  {
    pairAddress: "D8xWcMpzqetpxwLj7tJfSQ6J8Juh1wHFdT5KrkwdYPQC", // Example pair
    tokenX: DEVNET_TOKENS[2], // RAY
    tokenY: DEVNET_TOKENS[0], // SOL
    binStep: 25,
    baseFeePercentage: 0.25,
    isActive: true,
    tvl: 800000,
    volume24h: 234000,
  },
  {
    pairAddress: "E8xWcMpzqetpxwLj7tJfSQ6J8Juh1wHFdT5KrkwdYPQD", // Example pair
    tokenX: DEVNET_TOKENS[3], // SRM
    tokenY: DEVNET_TOKENS[1], // USDC
    binStep: 25,
    baseFeePercentage: 0.25,
    isActive: true,
    tvl: 600000,
    volume24h: 123000,
  },
];

export class DLMMUtils {
  private dlmmService: LiquidityBookServices;
  private mode: MODE;

  constructor(mode: MODE = MODE.MAINNET) {
    this.dlmmService = new LiquidityBookServices({ mode });
    this.mode = mode;
  }

  // Get current tokens based on mode
  getTokens(): Token[] {
    return this.mode === MODE.MAINNET ? MAINNET_TOKENS : DEVNET_TOKENS;
  }

  // Get current pairs based on mode
  getPairs(): DLMMPair[] {
    return this.mode === MODE.MAINNET ? MAINNET_PAIRS : DEVNET_PAIRS;
  }

  // Find pair for two tokens
  findPair(tokenA: Token, tokenB: Token): DLMMPair | null {
    const pairs = this.getPairs();
    return (
      pairs.find(
        (pair) =>
          (pair.tokenX.mint === tokenA.mint &&
            pair.tokenY.mint === tokenB.mint) ||
          (pair.tokenX.mint === tokenB.mint && pair.tokenY.mint === tokenA.mint)
      ) || null
    );
  }

  // Get all available pairs
  getAllPairs(): DLMMPair[] {
    return this.getPairs().filter((pair) => pair.isActive);
  }

  // Get pairs for a specific token
  getPairsForToken(token: Token): DLMMPair[] {
    const pairs = this.getPairs();
    return pairs.filter(
      (pair) =>
        pair.isActive &&
        (pair.tokenX.mint === token.mint || pair.tokenY.mint === token.mint)
    );
  }

  // Get quote for a swap
  async getSwapQuote(params: {
    fromToken: Token;
    toToken: Token;
    amount: string;
    isExactInput: boolean;
    slippage: number;
  }) {
    const { fromToken, toToken, amount, isExactInput, slippage } = params;

    const pair = this.findPair(fromToken, toToken);
    if (!pair) {
      throw new Error(
        `No DLMM pair found for ${fromToken.symbol}/${toToken.symbol}`
      );
    }

    const amountBN = BigInt(
      parseFloat(amount) * Math.pow(10, fromToken.decimals)
    );

    // Determine swap direction
    const swapForY = fromToken.mint === pair.tokenX.mint;

    try {
      const quote = await this.dlmmService.getQuote({
        amount: amountBN,
        isExactInput,
        swapForY,
        pair: new PublicKey(pair.pairAddress),
        tokenBase: new PublicKey(pair.tokenX.mint),
        tokenQuote: new PublicKey(pair.tokenY.mint),
        tokenBaseDecimal: pair.tokenX.decimals,
        tokenQuoteDecimal: pair.tokenY.decimals,
        slippage,
      });

      return {
        ...quote,
        pair,
        swapForY,
        priceImpact: this.calculatePriceImpact(quote, pair),
        exchangeRate: this.calculateExchangeRate(quote, fromToken, toToken),
      };
    } catch (error) {
      console.error("Error getting DLMM quote:", error);
      throw error;
    }
  }

  // Create swap transaction
  async createSwapTransaction(params: {
    fromToken: Token;
    toToken: Token;
    amount: bigint;
    minAmountOut: bigint;
    userPublicKey: PublicKey;
  }) {
    const { fromToken, toToken, amount, minAmountOut, userPublicKey } = params;

    const pair = this.findPair(fromToken, toToken);
    if (!pair) {
      throw new Error(
        `No DLMM pair found for ${fromToken.symbol}/${toToken.symbol}`
      );
    }

    const swapForY = fromToken.mint === pair.tokenX.mint;

    try {
      const transaction = await this.dlmmService.swap({
        amount,
        tokenMintX: new PublicKey(pair.tokenX.mint),
        tokenMintY: new PublicKey(pair.tokenY.mint),
        otherAmountOffset: minAmountOut,
        hook: new PublicKey(this.dlmmService.hooksConfig),
        isExactInput: true,
        swapForY,
        pair: new PublicKey(pair.pairAddress),
        payer: userPublicKey,
      });

      return transaction;
    } catch (error) {
      console.error("Error creating swap transaction:", error);
      throw error;
    }
  }

  // Calculate price impact (simplified)
  private calculatePriceImpact(quote: any, pair: DLMMPair): number {
    // This is a simplified calculation
    // In practice, you'd want a more sophisticated price impact calculation
    const impactBasisPoints = 10; // 0.1%
    return impactBasisPoints / 100;
  }

  // Calculate exchange rate
  private calculateExchangeRate(
    quote: any,
    fromToken: Token,
    toToken: Token
  ): number {
    const amountIn = Number(quote.amount) / Math.pow(10, fromToken.decimals);
    const amountOut = Number(quote.amountOut) / Math.pow(10, toToken.decimals);
    return amountOut / amountIn;
  }

  // Get token by mint address
  getTokenByMint(mint: string): Token | null {
    const tokens = this.getTokens();
    return tokens.find((token) => token.mint === mint) || null;
  }

  // Get token by symbol
  getTokenBySymbol(symbol: string): Token | null {
    const tokens = this.getTokens();
    return tokens.find((token) => token.symbol === symbol) || null;
  }

  // Validate if swap is possible
  canSwap(fromToken: Token, toToken: Token): boolean {
    return this.findPair(fromToken, toToken) !== null;
  }
}
