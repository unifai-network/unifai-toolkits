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
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY as string});
  const api = new TransactionAPI({ apiKey: process.env.TOOLKIT_API_KEY });

  await toolkit.updateToolkit({
    name: 'Compound-V2',
    description: "Interact with the Compound lending platform (v2).",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  toolkit.action({
    action: 'supply',
    actionDescription: 'Supplies assets into the market and receives cTokens in exchange.',
    payloadDescription: {
      chain: {
        type: 'string',
        description: 'The chain name, only support ethereum for now.',
        required: true,
      },
      amount: {
        type: 'number',
        description: 'The amount of the underlying asset to supply',
        required: true,
      },
      asset: {
        type: 'string',
        description: 'The token address or contract address or symbol or ticker of underlying asset. Leave blank for ETH.',
        required: false,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      if (payload.asset) {
        payload.asset = await getTokenAddress(payload.asset, payload.chain);
      }
      const result = await api.createTransaction('compound/v2', ctx, {
        action: 'supply',
        chain: payload.chain,
        amount: payload.amount.toString(),
        asset: payload.asset,
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
      chain: {
        type: 'string',
        description: 'The chain name, only support ethereum for now.',
        required: true,
      },
      amount: {
        type: 'number',
        description: 'Amount of tokens to borrow',
        required: true,
      },
      asset: {
        type: 'string',
        description: 'The token address or contract address or symbol or ticker of underlying asset. Leave blank for ETH.',
        required: false,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      if (payload.asset) {
        payload.asset = await getTokenAddress(payload.asset, payload.chain);
      }
      const result = await api.createTransaction('compound/v2', ctx, {
        action: 'borrow',
        chain: payload.chain,
        amount: payload.amount.toString(),
        asset: payload.asset,
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
      chain: {
        type: 'string',
        description: 'The chain name, only support ethereum for now.',
        required: true,
      },
      amount: {
        type: 'number',
        description: 'The amount to repay',
        required: true,
      },
      asset: {
        type: 'string',
        description: 'The token address or contract address or symbol or ticker of underlying asset. Leave blank for ETH.',
        required: false,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      if (payload.asset) {
        payload.asset = await getTokenAddress(payload.asset, payload.chain);
      }
      const result = await api.createTransaction('compound/v2', ctx, {
        action: 'repayBorrow',
        chain: payload.chain,
        amount: payload.amount.toString(),
        asset: payload.asset,
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
      chain: {
        type: 'string',
        description: 'The chain name, only support ethereum for now.',
        required: true,
      },
      amount: {
        type: 'number',
        description: 'The number of cTokens to redeem into underlying',
        required: true,
      },
      asset: {
        type: 'string',
        description: 'The token address or contract address or symbol or ticker of underlying asset. Leave blank for ETH.',
        required: false,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      if (payload.asset) {
        payload.asset = await getTokenAddress(payload.asset, payload.chain);
      }
      const result = await api.createTransaction('compound/v2', ctx, {
        action: 'redeem',
        chain: payload.chain,
        amount: payload.amount.toString(),
        asset: payload.asset,
      });
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to redeem: ${error}` });
    }
  });

  await toolkit.run();
}

main().catch(console.error);
