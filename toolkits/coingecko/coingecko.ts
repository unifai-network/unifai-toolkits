import { CoingeckoAPI } from './api';

const api = new CoingeckoAPI();

export const tokenAddressMap = {
  "SOL": {
    "solana": {
      "decimal_place": 9,
      "contract_address": "So11111111111111111111111111111111111111112",
    },
  },
}

export async function getTokenBySymbol(symbol: string) {
  if (tokenAddressMap[symbol]) {
    return tokenAddressMap[symbol];
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
