import { getTokenAddressBySymbol as getTokenAddress1 } from '../../dexscreener/dexscreener';
import { getTokenAddressBySymbol as getTokenAddress2 } from '../../coingecko/coingecko';

export async function getTokenAddressBySymbol(token: string, chain?: string) : Promise<string | null> {
  return await getTokenAddress1(token, chain) || await getTokenAddress2(token, chain) || null;
}
