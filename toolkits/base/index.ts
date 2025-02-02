import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import { Toolkit, ActionContext, TransactionAPI } from 'unifai-sdk';
import { getTokenBySymbol } from '../dexscreener/dexscreener';

dotenv.config();

async function getBaseTokenAddress(token: string) : Promise<string> {
  if (ethers.isAddress(token)) {
    return token;
  }
  const result = await getTokenBySymbol(token, 'base');
  return result?.base?.tokenAddress || token;
}

async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });
  const api = new TransactionAPI({ apiKey: process.env.TOOLKIT_API_KEY });

  await toolkit.updateToolkit({
    name: 'Base',
    description: "Transfer tokens on Base blockchain",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  toolkit.action({
    action: 'transfer',
    actionDescription: 'Transfer tokens on Base blockchain',
    payloadDescription: {
      recipientWalletAddress: {
        type: 'string',
        description: 'Recipient Base wallet address',
        required: true,
      },
      amount: {
        type: 'number',
        description: 'Amount of tokens to transfer',
        required: true,
      },
      token: {
        type: 'string',
        description: 'Token address or contract address or symbol or ticker, leave empty to transfer native ETH',
        required: false,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      let token = payload.token;
      if (token && token.toLowerCase() === 'eth') {
        token = undefined;
      }
      if (token) {
        token = await getBaseTokenAddress(token);
      }
      const result = await api.createTransaction('evm/transfer', ctx, {
        chain: 'base',
        recipient: payload.recipientWalletAddress,
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
