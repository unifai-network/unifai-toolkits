import * as dotenv from 'dotenv';
dotenv.config();

import { Toolkit, ActionContext } from 'unifai-sdk';
import { getTokenBySymbol } from './coingecko';


async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });

  await toolkit.updateToolkit({
    name: 'Coingecko',
    description: "Coingecko provides token information",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  toolkit.action({
    action: 'getTokenAddressBySymbol',
    actionDescription: 'Get token address (a.k.a. contract address) by symbol (a.k.a. ticker)',
    payloadDescription: {
      symbol: {
        type: 'string',
        description: 'Input token symbol (a.k.a. ticker)',
      },
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      const result = await getTokenBySymbol(payload.symbol);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to get token address: ${error}` });
    }
  });

  await toolkit.run();
}

main().catch(console.error);
