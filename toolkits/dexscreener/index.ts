import * as dotenv from 'dotenv';
import { Toolkit, ActionContext } from 'unifai-sdk';
import { getTokenBySymbol } from './dexscreener';

dotenv.config();

async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });

  await toolkit.updateToolkit({
    name: 'DEX Screener',
    description: "DEX Screener provides token information",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  toolkit.action({
    action: 'getTokenBySymbol',
    actionDescription: 'Get token address (a.k.a. contract address) and some basic information (price, liquidity, volume, fdv, market cap) by token symbol (a.k.a. ticker)',
    payloadDescription: {
      symbol: {
        type: 'string',
        description: 'Token symbol (a.k.a. ticker)',
      },
      chain: {
        type: 'string',
        description: 'Chain name (e.g. solana, ethereum, base, etc.). Leave blank to search on all chains and return the one with the highest liquidity.',
        required: false,
      },
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      const result = await getTokenBySymbol(payload.symbol, payload.chain);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to get token address: ${error}` });
    }
  });

  await toolkit.run();
}

main().catch(console.error);
