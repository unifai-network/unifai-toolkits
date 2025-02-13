import { CoingeckoAPI } from './api';

const api = new CoingeckoAPI();

export const tokenAddressMap = {
  "sol": {
    "solana": {
      "chain": "solana",
      "contract_address": "So11111111111111111111111111111111111111112",
      "decimal_place": 9,
    },
  },
  "eth": {
    "ethereum": {
      "chain": "ethereum",
      "tokenAddress": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      "decimal_place": 18,
    },
    "base": {
      "chain": "base",
      "tokenAddress": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      "decimal_place": 18,
    },
  },
  "bnb": {
    "bsc": {
      "chain": "bsc",
      "tokenAddress": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      "decimal_place": 18,
    },
  },
}

export async function getTokenBySymbol(symbol: string, chain?: string) {
  symbol = symbol.toLowerCase();

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
  const result = await api.searchToken(symbol);
  if (result.coins && result.coins.length > 0) {
    const token = result.coins[0];
    const tokenInfo = await api.getTokenInfo(token.id);
    return tokenInfo.detail_platforms || tokenInfo.platforms;
  } else {
    return { error: 'Token not found' };
  }
}

export async function getTokenAddressBySymbol(token: string, chain: string) {
  const result = await getTokenBySymbol(token, chain);
  return result?.[chain]?.contract_address || token;
}
