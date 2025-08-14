import * as dotenv from 'dotenv';
dotenv.config();

import { ethers } from 'ethers';
import { Toolkit, ActionContext, TransactionAPI } from 'unifai-sdk';
import { getTokenAddressBySymbol } from '../common/tokenaddress';

async function getPolygonTokenAddress(token: string) : Promise<string> {
  if (ethers.isAddress(token.toLowerCase())) {
    return token.toLowerCase();
  }
  return await getTokenAddressBySymbol(token, 'polygon') || token;
}

async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });
  const api = new TransactionAPI({ apiKey: process.env.TOOLKIT_API_KEY });

  await toolkit.updateToolkit({
    name: 'Polygon',
    description: "Transfer tokens on Polygon blockchain",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  toolkit.action({
    action: 'transfer',
    actionDescription: 'Transfer tokens on Polygon blockchain',
    payloadDescription: {
      recipientWalletAddress: {
        type: 'string',
        description: 'Recipient Polygon wallet address',
        required: true,
      },
      amount: {
        type: 'number',
        description: 'Amount of tokens to transfer',
        required: true,
      },
      token: {
        type: 'string',
        description: 'Token address or contract address or symbol or ticker, leave empty to transfer native POL',
        required: false,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      let token = payload.token?.toLowerCase();
      if (token && (token === 'pol' || token === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')) {
        token = undefined;
      }
      if (token) {
        token = await getPolygonTokenAddress(token);
      }
      const result = await api.createTransaction('evm/transfer', ctx, {
        chain: 'polygon',
        recipient: payload.recipientWalletAddress.toLowerCase(),
        amount: payload.amount.toString(),
        token: token,
      });
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  });

  await toolkit.run();
}

main().catch(console.error);
