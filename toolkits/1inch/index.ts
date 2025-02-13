import * as dotenv from 'dotenv';
dotenv.config();

import { ethers } from 'ethers';
import { Toolkit, ActionContext, TransactionAPI } from 'unifai-sdk';
import { getTokenAddressBySymbol } from '../common/tokenaddress';

async function getTokenAddress(token: string, chain: string) : Promise<string> {
  if (ethers.isAddress(token.toLowerCase())) {
    return token.toLowerCase();
  }
  return await getTokenAddressBySymbol(token, chain) || token;
}

async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });
  const api = new TransactionAPI({ apiKey: process.env.TOOLKIT_API_KEY });

  await toolkit.updateToolkit({
    name: '1inch',
    description: "1inch is a swap aggregator on any EVM compatible blockchain, e.g. Ethereum, Base, BSC, etc.",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  toolkit.action({
    action: 'swap',
    actionDescription: 'Swap tokens on any EVM compatible blockchain (e.g. Ethereum, Base, BSC, etc.) using 1inch',
    payloadDescription: {
      chain: {
        type: 'string',
        description: 'Chain name, e.g. ethereum, base, bsc, etc.',
        required: true,
      },
      inputToken: {
        type: 'string',
        description: 'Input token address or contract address or symbol or ticker',
        required: true,
      },
      outputToken: {
        type: 'string',
        description: 'Output token address or contract address or symbol or ticker',
        required: true,
      },
      amount: {
        type: 'number',
        description: 'Amount of input token to swap',
        required: true,
      },
      slippage: {
        type: 'number',
        description: 'Slippage percentage, default is 1 (which means 1%)',
        required: false,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      payload.inputToken = await getTokenAddress(payload.inputToken?.toLowerCase(), payload.chain?.toLowerCase());
      payload.outputToken = await getTokenAddress(payload.outputToken?.toLowerCase(), payload.chain?.toLowerCase());
      payload.amount = payload.amount.toString();
      const result = await api.createTransaction('1inch/swap', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  });

  await toolkit.run();
}

main().catch(console.error);
