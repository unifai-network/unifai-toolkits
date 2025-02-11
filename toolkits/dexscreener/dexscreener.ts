import { DexscreenerAPI } from './api';

const api = new DexscreenerAPI();

export const tokenSymbolAlias = {
  "bnb": "bsc",
}

export const tokenAddressMap = {
  "SOL": {
    "solana": {
      "chain": "solana",
      "tokenAddress": "So11111111111111111111111111111111111111112",
    },
  },
  "ETH": {
    "ethereum": {
      "chain": "ethereum",
      "tokenAddress": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    },
    "base": {
      "chain": "base",
      "tokenAddress": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    },
    "bsc": {
      "chain": "bsc",
      "tokenAddress": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    },
  },
}

function getLiquidity(pair: any) {
  return Math.min(pair?.liquidity?.usd - pair?.liquidity?.base * pair?.priceUsd, pair?.liquidity?.base * pair?.priceUsd) || 0;
}

export async function getTokenBySymbol(symbol: string, chainId?: string) {
  if (tokenSymbolAlias[symbol]) {
    symbol = tokenSymbolAlias[symbol];
  }

  if (tokenAddressMap[symbol]) {
    return tokenAddressMap[symbol];
  }

  let query = symbol;
  if (chainId) {
    query += ` ${chainId}`;
  }
  const result = await api.searchToken(query);

  if (!result.pairs || result.pairs.length === 0) {
    return { error: 'Token not found' };
  }

  let pairs = result.pairs.filter(
    (pair: any) => pair.baseToken.symbol.toLowerCase() === symbol.toLowerCase() || pair.quoteToken.symbol.toLowerCase() === symbol.toLowerCase(),
  );

  if (chainId) {
    pairs = pairs.filter((pair: any) => pair.chainId.toLowerCase() === chainId.toLowerCase());
  }

  pairs = pairs.sort((a: any, b: any) => getLiquidity(b) - getLiquidity(a));

  if (pairs.length === 0) {
    return { error: 'Token not found' };
  }

  return {
    [pairs[0].chainId]: {
      chain: pairs[0].chainId,
      tokenAddress: pairs[0].baseToken.symbol.toLowerCase() === symbol.toLowerCase() ? pairs[0].baseToken.address : pairs[0].quoteToken.address,
    }
  };
}
