import * as dotenv from 'dotenv';
dotenv.config();

import { PublicKey } from '@solana/web3.js';
import { ActionContext, Toolkit, TransactionAPI } from 'unifai-sdk';
import { getTokenAddressBySymbol } from '../common/tokenaddress';
import { getTokenPrices, searchToken } from './api';

async function getSolanaTokenAddress(token: string) : Promise<string> {
  try {
    new PublicKey(token);
  } catch (error) {
    return await getTokenAddressBySymbol(token, 'solana') || token;
  }
  return token;
}


async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });
  const api = new TransactionAPI({ apiKey: process.env.TOOLKIT_API_KEY });

  await toolkit.updateToolkit({
    name: 'Jupiter',
    description: "Jupiter is a swap aggregator on the Solana blockchain",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  toolkit.action({
    action: 'swap',
    actionDescription: 'Swap tokens on Solana blockchain using Jupiter',
    payloadDescription: {
      inputToken: {
        type: 'string',
        description: 'Input token address or contract address or symbol or ticker',
      },
      outputToken: {
        type: 'string',
        description: 'Output token address or contract address or symbol or ticker',
      },
      inAmount: {
        type: 'number',
        description: 'Exact amount of input token to swap. Only specify either inAmount OR outAmount, not both.',
      },
      outAmount: {
        type: 'number',
        description: 'Desired amount of output token to receive (estimated, not exact). Only specify either inAmount OR outAmount, not both.',
      },
      slippageBps: {
        type: 'number',
        description: 'Slippage tolerance in basis points (100 bps = 1%). By default dynamic slippage is used. If you want to use a fixed slippage, set this to the desired value, and set dynamicSlippage to false.',
        default: 50,
      },
      dynamicSlippage: {
        type: 'boolean',
        description: 'If true, slippageBps will be overridden by Dynamic Slippage\'s estimated value. Default is true. If you want to use a fixed slippage, set this to false, and set slippageBps to the desired value.',
        default: true,
      },
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      let inAmount = payload.inAmount || payload.amount; // For backwards compatibility
      let outAmount = payload.outAmount;

      // Validate that only one of inAmount or outAmount is specified
      if ((inAmount && outAmount) || (!inAmount && !outAmount)) {
        return ctx.result({ error: 'Must specify exactly one of inAmount or outAmount, not both or neither' });
      }

      // Set defaults if not provided
      if (payload.slippageBps === undefined) {
        payload.slippageBps = 50;
      }
      if (payload.dynamicSlippage === undefined) {
        payload.dynamicSlippage = true;
      }

      payload.inputToken = await getSolanaTokenAddress(payload.inputToken);
      payload.outputToken = await getSolanaTokenAddress(payload.outputToken);
      
      if (outAmount) {
        const { inputPrice, outputPrice } = await getTokenPrices(payload.inputToken, payload.outputToken);

        if (inputPrice === 0 || outputPrice === 0) {
          return ctx.result({ error: 'Unable to fetch token prices to estimate inAmount' });
        }

        // Calculate estimated inAmount with 1% slippage buffer
        inAmount = (outAmount * outputPrice / inputPrice) * 1.01;
      }

      payload.amount = inAmount;
      delete payload.inAmount;
      delete payload.outAmount;
      
      const result = await api.createTransaction('jupiter/swap', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  });

  toolkit.action({
    action: 'searchToken',
    actionDescription: 'Search for comprehensive Solana token information by symbol, name, or mint address. Only works for tokens on the Solana blockchain. Returns detailed token metadata including name, symbol, icon, decimals, market data (price, market cap, FDV), trading statistics (5m, 1h, 6h, 24h), liquidity info, holder count, audit status, organic score, verified status, CEX listings, and more.',
    payloadDescription: {
      query: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Array of search queries - each can be token symbol, name, or mint address. Maximum 100 mint addresses supported.',
        minItems: 1,
        maxItems: 100,
        required: true,
      },
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      if (!payload.query || !Array.isArray(payload.query) || payload.query.length === 0) {
        return ctx.result({ error: 'Query parameter must be a non-empty array' });
      }

      if (payload.query.length > 100) {
        return ctx.result({ error: 'Maximum 100 queries allowed per request' });
      }

      // Filter out empty strings and non-strings, keep only valid queries
      const validQueries = payload.query.filter((q: any) => typeof q === 'string' && q.trim().length > 0);
      
      if (validQueries.length === 0) {
        return ctx.result({ error: 'No valid queries found after filtering empty strings' });
      }

      // Separate mint addresses from symbols/names for optimal API usage
      const mintAddresses: string[] = [];
      const symbolsAndNames: string[] = [];
      
      for (const query of validQueries) {
        const trimmed = query.trim();
        // Check if it's a valid Solana mint address using PublicKey validation
        try {
          new PublicKey(trimmed);
          mintAddresses.push(trimmed);
        } catch (error) {
          symbolsAndNames.push(trimmed);
        }
      }
      
      const allResults: any[] = [];
      const seenTokens = new Set<string>(); // To avoid duplicates
      
      // Create array of promises for concurrent execution
      const searchPromises: Promise<any[]>[] = [];
      
      // Handle mint addresses in batch (comma-separated works for mint addresses)
      if (mintAddresses.length > 0) {
        const mintQuery = mintAddresses.join(',');
        searchPromises.push(searchToken(mintQuery));
      }
      
      // Handle symbols/names individually (comma-separated doesn't work for these)
      for (const query of symbolsAndNames) {
        searchPromises.push(searchToken(query));
      }
      
      // Execute all searches concurrently
      const results = await Promise.allSettled(searchPromises);
      
      // Process results
      for (const result of results) {
        if (result.status === 'fulfilled') {
          for (const token of result.value) {
            if (!seenTokens.has(token.id)) {
              seenTokens.add(token.id);
              allResults.push(token);
            }
          }
        } else {
          console.warn(`Search failed: ${result.reason}`);
        }
      }
      
      return ctx.result({ tokens: allResults });
    } catch (error) {
      return ctx.result({ error: `Failed to search tokens: ${error}` });
    }
  });

  await toolkit.run();
}

main().catch(console.error);
