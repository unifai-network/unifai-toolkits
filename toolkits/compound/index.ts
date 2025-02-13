import * as dotenv from 'dotenv';
dotenv.config();

import { ethers } from 'ethers';
import { Toolkit, ActionContext, TransactionAPI } from 'unifai-sdk';
import { getTokenBySymbol } from '../dexscreener/dexscreener'; 

async function getAssetAddress(asset: string) : Promise<string> {
  if (ethers.isAddress(asset)) {
    return asset;
  }
  const result = await getTokenBySymbol(asset, 'compound');
  return result?.compound?.tokenAddress || asset; 
}

async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.COMPOUND_API_KEY as string});
  const api = new TransactionAPI({ apiKey: process.env.COMPOUND_API_KEY });

  await toolkit.updateToolkit({
    name: 'Compound',
    description: "Interact with the Compound lending platform",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  toolkit.action({
    action: 'supply',
    actionDescription: 'Supplies assets into the market and receives cTokens in exchange',
    payloadDescription: {
      recipientWalletAddress: {
        type: 'string',
        description: 'Recipient wallet address',
        required: true,
      },
      amount: {
        type: 'number',
        description: 'The amount of the underlying asset to supply',
        required: true,
      },
      asset: {
        type: 'string',
        description: 'The address of underlying',
        required: false,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      let asset = await getAssetAddress(payload.asset);
      const result = await api.createTransaction('compound/action', ctx, {
        recipient: payload.recipientWalletAddress,
        amount: payload.amount.toString(),
        asset: asset,
        action: 'supply' ,
      });
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to deposit: ${error}` });
    }
  });

  toolkit.action({
    action: 'borrow',
    actionDescription: 'Borrow tokens from Compound',
    payloadDescription: {
      recipientWalletAddress: {
        type: 'string',
        description: 'Recipient wallet address',
        required: true,
      },
      amount: {
        type: 'number',
        description: 'Amount of tokens to borrow',
        required: true,
      },
      asset: {
        type: 'string',
        description: 'The address of underlying',
        required: false,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      let asset = await getAssetAddress(payload.asset);
      const result = await api.createTransaction('compound/action', ctx, {
        recipient: payload.recipientWalletAddress,
        amount: payload.amount.toString(),
        asset: asset,
        action: 'borrow',
      });
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to borrow: ${error}` });
    }
  });

  toolkit.action({
    action: 'repayBorrow',
    actionDescription: 'Repay borrowed tokens to Compound',
    payloadDescription: {
      recipientWalletAddress: {
        type: 'string',
        description: 'Recipient wallet address',
        required: true,
      },
      amount: {
        type: 'number',
        description: 'The amount to repay',
        required: true,
      },
      asset: {
        type: 'string',
        description: 'The address of underlying',
        required: false,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      let asset = await getAssetAddress(payload.asset);
      const result = await api.createTransaction('compound/action', ctx, {
        recipient: payload.recipientWalletAddress,
        amount: payload.amount.toString(),
        asset: asset,
        action: 'repayBorrow',
      });
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to repay: ${error}` });
    }
  });

  toolkit.action({
    action: 'redeem',
    actionDescription: 'converts a specified quantity of cTokens into the underlying asset',
    payloadDescription: {
      recipientWalletAddress: {
        type: 'string',
        description: 'Recipient wallet address',
        required: true,
      },
      amount: {
        type: 'number',
        description: 'The number of cTokens to redeem into underlying',
        required: true,
      },
      asset: {
        type: 'string',
        description: 'The address of underlying',
        required: false,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      let asset = await getAssetAddress(payload.asset);
      const result = await api.createTransaction('compound/action', ctx, {
        recipient: payload.recipientWalletAddress,
        amount: payload.amount.toString(),
        asset: asset,
        action: 'redeem',
      });
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to repay: ${error}` });
    }
  });

  await toolkit.run();
}

main().catch(console.error);
