import { PublicKey } from '@solana/web3.js';
import * as dotenv from 'dotenv';
import { ActionContext, Toolkit, TransactionAPI } from 'unifai-sdk';
import { getTokenBySymbol } from '../dexscreener/dexscreener';

dotenv.config();

async function getSolanaTokenAddress(token: string) : Promise<string> {
  try {
    new PublicKey(token);
  } catch (error) {
    const result = await getTokenBySymbol(token, 'solana');
    return result?.solana?.tokenAddress || token;
  }
  return token;
}

async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });
  const api = new TransactionAPI({ apiKey: process.env.TOOLKIT_API_KEY });

  await toolkit.updateToolkit({
    name: 'Jupiter',
    description: "Jupiter provides smooth and efficient token swaps on the Solana blockchain",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  toolkit.action({
    action: 'swap',
    actionDescription: 'Swap tokens on Jupiter',
    payloadDescription: {
      inputToken: {
        type: 'string',
        description: 'Input token address or contract address or symbol or ticker',
      },
      outputToken: {
        type: 'string',
        description: 'Output token address or contract address or symbol or ticker',
      },
      amount: {
        type: 'number',
        description: 'Amount of input token to swap',
      },
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      payload.inputToken = await getSolanaTokenAddress(payload.inputToken);
      payload.outputToken = await getSolanaTokenAddress(payload.outputToken);
      const result = await api.createTransaction('jupiter/swap', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  });

  await toolkit.run();
}

main().catch(console.error);
