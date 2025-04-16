import { getTokenAddressBySymbol as getTokenDexScreener } from '../../dexscreener/dexscreener';
import { getTokenAddressBySymbol as getTokenCoingecko } from '../../coingecko/coingecko';

// Interface for cache entry
interface CacheEntry {
  address: string;
  timestamp: number;
}

// In-memory cache with token-chain as key and address as value
const cache: Record<string, CacheEntry> = {};

// Cache expiration time: 1 hour in milliseconds
const CACHE_EXPIRATION = 60 * 60 * 1000;

export async function getTokenAddressBySymbol(token: string, chain?: string): Promise<string | null> {
  // Create a unique cache key based on token and chain
  const cacheKey = `${token}${chain ? `-${chain}` : ''}`;
  
  // Check if we have a valid cached result
  if (cache[cacheKey]) {
    const entry = cache[cacheKey];
    const now = Date.now();
    
    // Check if the cache entry is still valid (less than 1 hour old)
    if (now - entry.timestamp < CACHE_EXPIRATION) {
      return entry.address;
    } else {
      // Cache expired, remove it
      delete cache[cacheKey];
    }
  }
  
  // No valid cache, fetch the result
  const result = await getTokenCoingecko(token, chain) || await getTokenDexScreener(token, chain) || null;
  
  // Only cache non-null results
  if (result !== null) {
    cache[cacheKey] = {
      address: result,
      timestamp: Date.now()
    };
  }
  
  return result;
}
