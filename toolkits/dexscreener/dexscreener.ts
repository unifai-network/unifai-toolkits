import { DexscreenerAPI } from './api';

const api = new DexscreenerAPI();

export const tokenAddressMap = {
  "sol": {
    "solana": {
      "chain": "solana",
      "tokenAddress": "So11111111111111111111111111111111111111112",
    },
  },
  "eth": {
    "ethereum": {
      "chain": "ethereum",
      "tokenAddress": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    },
    "base": {
      "chain": "base",
      "tokenAddress": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    },
  },
  "bnb": {
    "bsc": {
      "chain": "bsc",
      "tokenAddress": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    },
  },
}

export const chainAliasMap = {
  "sol": "solana",
  "eth": "ethereum",
  "bnb": "bsc",
}

function getLiquidity(pair: any) {
  return Math.min(pair?.liquidity?.usd - pair?.liquidity?.base * pair?.priceUsd, pair?.liquidity?.base * pair?.priceUsd) || 0;
}

export async function getTokenBySymbol(symbol: string, chain?: string) {
  symbol = symbol.toLowerCase();
  chain = chain?.toLowerCase();
  if (chain && chainAliasMap[chain]) {
    chain = chainAliasMap[chain];
  }

  if (tokenAddressMap[symbol]) {
    if (chain) {
      if (tokenAddressMap[symbol][chain]) {
        return {
          [chain]: tokenAddressMap[symbol][chain],
        };
      }
    } else {
      return tokenAddressMap[symbol];
    }
  }

  let query = symbol;
  let pairs = [];
  const result = await api.searchToken(query);
  if (result.pairs && result.pairs.length > 0) {
    pairs = result.pairs;
  }
  if (chain) {
    const result = await api.searchToken(`${query} ${chain}`);
    if (result.pairs && result.pairs.length > 0) {
      pairs = pairs.concat(result.pairs);
    }
  }

  if (pairs.length === 0) {
    return { error: 'Token not found' };
  }

  pairs = pairs.filter(
    (pair: any) => pair.baseToken.symbol.toLowerCase() === symbol.toLowerCase() || pair.quoteToken.symbol.toLowerCase() === symbol.toLowerCase(),
  );

  if (chain) {
    pairs = pairs.filter((pair: any) => pair.chainId.toLowerCase() === chain.toLowerCase());
  }

  pairs = pairs.sort((a: any, b: any) => getLiquidity(b) - getLiquidity(a));

  if (pairs.length === 0) {
    return { error: 'Token not found. Maybe try another service like coingecko to get the token address.' };
  }

  return {
    [pairs[0].chainId]: {
      chain: pairs[0].chainId,
      tokenAddress: pairs[0].baseToken.symbol.toLowerCase() === symbol.toLowerCase() ? pairs[0].baseToken.address : pairs[0].quoteToken.address,
    }
  };
}

export async function getTokenAddressBySymbol(token: string, chain?: string) : Promise<string | null> {
  chain = chain?.toLowerCase();
  if (chain && chainAliasMap[chain]) {
    chain = chainAliasMap[chain];
  }

  const result = await getTokenBySymbol(token, chain);
  if (Object.keys(result).length === 0) {
    return null;
  }
  if (chain) {
    return result?.[chain]?.tokenAddress || null;
  } else {
    return result?.[Object.keys(result)[0]]?.tokenAddress || null;
  }
}
