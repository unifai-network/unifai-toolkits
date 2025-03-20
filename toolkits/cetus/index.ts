import * as dotenv from 'dotenv';
dotenv.config();

import { isValidSuiAddress } from "@mysten/sui/utils";
import { ActionContext, Toolkit, TransactionAPI } from 'unifai-sdk';
import { getTokenAddressBySymbol } from '../common/tokenaddress';

async function getSuiTokenAddress(token: string) : Promise<string> {
  if (isValidSuiAddress(token)) {
    return token;
  }
  return await getTokenAddressBySymbol(token, 'sui') || token;
}

async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });
  const api = new TransactionAPI({ apiKey: process.env.TOOLKIT_API_KEY });

  await toolkit.updateToolkit({
    name: 'Cetus',
    description: "Cetus is a DEX and aggregator on the Sui blockchain",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  toolkit.action({
    action: 'swap',
    actionDescription: 'Swap tokens on Sui blockchain using Cetus',
    payloadDescription: {
      inputToken: {
        type: 'string',
        description: 'Input token address or contract address (a.k.a. coin type) or symbol or ticker',
        required: true,
      },
      outputToken: {
        type: 'string',
        description: 'Output token address or contract address (a.k.a. coin type) or symbol or ticker',
        required: true,
      },
      amount: {
        type: 'number',
        description: 'Amount of input token to swap. If you want to get a certain amount of output token, you need to use the current token price to calculate the amount of input token.',
        required: true,
      },
      slippage: {
        type: 'number',
        description: 'Slippage, eg: 0.01 means 1% slippage',
        required: false,
      },
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      const from = await getSuiTokenAddress(payload.inputToken);
      const target = await getSuiTokenAddress(payload.outputToken);
      const result = await api.createTransaction('cetus/swap', ctx, {
        from,
        target,
        amount: payload.amount,
        slippage: payload.slippage,
      });
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  });

  await toolkit.run();
}

main().catch(console.error);
