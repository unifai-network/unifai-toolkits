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
    "bsc": {
      "chain": "bsc",
      "tokenAddress": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      "decimal_place": 18,
    },
  },
}

export async function getTokenBySymbol(symbol: string) {
  if (tokenAddressMap[symbol.toLowerCase()]) {
    return tokenAddressMap[symbol.toLowerCase()];
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

export async function getTokenAddressBySymbol(token: string, chainId: string) {
  const result = await getTokenBySymbol(token);
  return result?.[chainId]?.contract_address || token;
}
