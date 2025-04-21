import * as dotenv from 'dotenv';
dotenv.config();

import { Toolkit, ActionContext } from 'unifai-sdk';
import { getTokenBySymbol } from './dexscreener';


async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });

  await toolkit.updateToolkit({
    name: 'DexScreener',
    description: "DexScreener provides token information",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  toolkit.action({
    action: 'getTokenAddressBySymbol',
    actionDescription: 'Get token address (a.k.a. contract address) by token symbol (a.k.a. ticker)',
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
