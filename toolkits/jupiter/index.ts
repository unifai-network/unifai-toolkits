import * as dotenv from 'dotenv';
dotenv.config();

import { PublicKey } from '@solana/web3.js';
import { ActionContext, Toolkit, TransactionAPI } from 'unifai-sdk';
import { getTokenAddressBySymbol } from '../common/tokenaddress';

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
      amount: {
        type: 'number',
        description: 'Amount of input token to swap. If you want to get a certain amount of output token, you need to use the current token price to calculate the amount of input token.',
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
      payload.inputToken = await getSolanaTokenAddress(payload.inputToken);
      payload.outputToken = await getSolanaTokenAddress(payload.outputToken);
      
      // Set defaults if not provided
      if (payload.slippageBps === undefined) {
        payload.slippageBps = 50;
      }
      if (payload.dynamicSlippage === undefined) {
        payload.dynamicSlippage = true;
      }
      
      const result = await api.createTransaction('jupiter/swap', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  });

  await toolkit.run();
}

main().catch(console.error);
