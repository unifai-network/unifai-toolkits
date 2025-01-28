import { CoingeckoAPI } from './api';

const api = new CoingeckoAPI();

export const tokenAddressMap = {
  "SOL": {
    "solana": {
      "chain": "solana",
      "tokenAddress": "So11111111111111111111111111111111111111112",
    },
  },
}

function getLiquidity(pair: any) {
  return Math.min(pair?.liquidity?.usd - pair?.liquidity?.base * pair?.priceUsd, pair?.liquidity?.base * pair?.priceUsd) || 0;
}

export async function getTokenBySymbol(symbol: string, chainId?: string) {
  if (tokenAddressMap[symbol]) {
    return tokenAddressMap[symbol];
  }
  const result = await api.searchToken(symbol);

  if (!result.pairs || result.pairs.length === 0) {
    return { error: 'Token not found' };
  }

  let pairs = result.pairs.filter(
    (pair: any) => pair.baseToken.symbol.toLowerCase() === symbol.toLowerCase(),
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
      tokenAddress: pairs[0].baseToken.address,
      priceUsd: pairs[0].priceUsd,
      liquidityUsd: pairs[0].liquidity?.usd,
      volume24hUsd: pairs[0].volume?.h24,
      fdvUsd: pairs[0].fdv,
      marketCap: pairs[0].marketCap,
    }
  };
}
