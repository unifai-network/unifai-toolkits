import { getTokenAddressBySymbol as getTokenDexScreener } from '../../dexscreener/dexscreener';
import { getTokenAddressBySymbol as getTokenCoingecko } from '../../coingecko/coingecko';

export async function getTokenAddressBySymbol(token: string, chain?: string) : Promise<string | null> {
  return await getTokenCoingecko(token, chain) || await getTokenDexScreener(token, chain) || null;
}
