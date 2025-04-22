import * as dotenv from 'dotenv';
dotenv.config();

import { Toolkit, ActionContext, TransactionAPI } from 'unifai-sdk';
import { getTokenAddressBySymbol } from '../common/tokenaddress';


async function getTokenAddress(token: string) : Promise<string> {
  return await getTokenAddressBySymbol(token, 'bsc') || token;
}

async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });
  const api = new TransactionAPI({ apiKey: process.env.TOOLKIT_API_KEY, endpoint:process.env.TRANSACTION_BUILD_URL });
  
  await toolkit.updateToolkit({
    name: 'Pancake V3',
    description: "Supply or borrow tokens on BNB (a.k.a. BSC) blockchain using Pancake V3 Protocol",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  toolkit.action({
    action: 'create pool',
    actionDescription: 'create pool to a PancakeSwap liquidity pool by providing both tokens in the correct ratio. This action allows you to become a liquidity provider and earn trading fees.',
    payloadDescription: {
      chain: {
        type: 'string',
        description: 'The blockchain network name. Currently only supports BSC (BNB Chain).',
        required: true,
      },
      amount: {
        type: 'string',
        description: 'The amount of the first token to add to the liquidity pool.',
        required: true,
      },
      amount2: {
        type: 'string',
        description: 'The amount of the second token to add to the liquidity pool.',
        required: true,
      },
      asset: {
        type: 'string',
        description: 'The token symbol or address of the first token in the pair.',
        required: true,
      },
      asset2: {
        type: 'string',
        description: 'The token symbol or address of the second token in the pair.',
        required: true,
      },
      slippage: {
        type: 'string',
        description: 'The maximum acceptable slippage percentage for the transaction (e.g., "0.5" for 0.5%).',
        required: false,
      },
      deadline: {
        type: 'string',
        description: 'The transaction deadline in seconds from now.',
        required: false,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      payload.action = 'create pool';
      const result = await api.createTransaction('pancake/v3', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to add transaction: ${error}` });
    }
  });

  toolkit.action({
    action: 'add liquidity',
    actionDescription: 'Add liquidity to a PancakeSwap liquidity pool by providing both tokens in the correct ratio. This action allows you to become a liquidity provider and earn trading fees.',
    payloadDescription: {
      chain: {
        type: 'string',
        description: 'The blockchain network name. Currently only supports BSC (BNB Chain).',
        required: true,
      },
      amount: {
        type: 'string',
        description: 'The amount of the first token to add to the liquidity pool.',
        required: true,
      },
      amount2: {
        type: 'string',
        description: 'The amount of the second token to add to the liquidity pool.',
        required: true,
      },
      asset: {
        type: 'string',
        description: 'The token symbol or address of the first token in the pair.',
        required: true,
      },
      asset2: {
        type: 'string',
        description: 'The token symbol or address of the second token in the pair.',
        required: true,
      },
      slippage: {
        type: 'string',
        description: 'The maximum acceptable slippage percentage for the transaction (e.g., "0.5" for 0.5%).',
        required: false,
      },
      deadline: {
        type: 'string',
        description: 'The transaction deadline in seconds from now.',
        required: false,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      payload.action = 'add liquidity';
      payload.chain = 'bsc';
      const result = await api.createTransaction('pancake/v3/add-liquidity', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to add transaction: ${error}` });
    }
  });

  toolkit.action({
    action: 'remove liquidity',
    actionDescription: 'Remove liquidity from a PancakeSwap V3 liquidity pool and receive both tokens in return. This action allows you to withdraw your liquidity provider position.',
    payloadDescription: {
      chain: {
        type: 'string',
        description: 'The blockchain network name. Currently only supports BSC (BNB Chain).',
        required: true,
      },
      tokenId: {
        type: 'string',
        description: 'The unique identifier of the liquidity position NFT, In PancakeSwap V3, each liquidity position is represented as an NFT,and tokenId is used to identify which position to remove liquidity from. if it is empty, just call the getTokenIds action.',
        required: true,
      },
      deadline: {
        type: 'string',
        description: 'The transaction deadline in seconds from now.',
        required: false,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      payload.action = 'remove liquidity';
      payload.chain = 'bsc';
      if (payload.tokenId.length === 0){
        return ctx.result({ error: `tokenId can't be empty` });
      }
      const result = await api.createTransaction('pancake/v3/remove-liquidity', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to remove transaction: ${error}` });
    }
  });

  toolkit.action({
    action: 'claim',
    actionDescription: 'Collect trading fees and rewards earned from providing liquidity to PancakeSwap pools.',
    payloadDescription: {
      wallet: {
        type: 'string',
        description: 'The wallet address that will receive the collected fees and rewards.',
        required: true,
      },
      chain: {
        type: 'string',
        description: 'The blockchain network name. Currently only supports BSC (BNB Chain).',
        required: true,
      },
      asset: {
        type: 'string',
        description: 'The token symbol or address of the first token in the pair.',
        required: true,
      },
      asset2: {
        type: 'string',
        description: 'The token symbol or address of the second token in the pair.',
        required: true,
      },
      amount: {
        type: 'string',
        description: 'The amount of LP tokens to collect fees from.',
        required: true,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      if (payload.wallet) {
        payload.wallet = await getTokenAddress(payload.wallet);
      }
      payload.action = 'claim';
      if (!payload.asset) {
        payload.asset = payload.token;
      }
      const result = await api.createTransaction('pancake/v3', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to claim: ${error}` });
    }
  });

  toolkit.action({
    action: 'collect',
    actionDescription: 'Collect trading fees and rewards earned from providing liquidity to PancakeSwap pools.',
    payloadDescription: {
      wallet: {
        type: 'string',
        description: 'The wallet address that will receive the collected fees and rewards.',
        required: true,
      },
      chain: {
        type: 'string',
        description: 'The blockchain network name. Currently only supports BSC (BNB Chain).',
        required: true,
      },
      asset: {
        type: 'string',
        description: 'The token symbol or address of the first token in the pair.',
        required: true,
      },
      asset2: {
        type: 'string',
        description: 'The token symbol or address of the second token in the pair.',
        required: true,
      },
      amount: {
        type: 'string',
        description: 'The amount of LP tokens to collect fees from.',
        required: true,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      if (payload.wallet) {
        payload.wallet = await getTokenAddress(payload.wallet);
      }
      payload.action = 'collect';
      if (!payload.asset) {
        payload.asset = payload.token;
      }
      const result = await api.createTransaction('pancake/v3', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to collect: ${error}` });
    }
  });

  toolkit.action({
    action: 'stake',
    actionDescription: 'Stake LP tokens in PancakeSwap farms to earn CAKE rewards and other farming rewards.',
    payloadDescription: {
      wallet: {
        type: 'string',
        description: 'The wallet address that will stake the LP tokens.',
        required: true,
      },
      chain: {
        type: 'string',
        description: 'The blockchain network name. Currently only supports BSC (BNB Chain).',
        required: true,
      },
      amount: {
        type: 'string',
        description: 'The amount of LP tokens to stake in the farm.',
        required: true,
      },
      asset: {
        type: 'string',
        description: 'The token symbol or address of the first token in the pair.',
        required: true,
      },
      asset2: {
        type: 'string',
        description: 'The token symbol or address of the second token in the pair.',
        required: true,
      },
      farmId: {
        type: 'string',
        description: 'The ID of the farm to stake in.',
        required: true,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      if (payload.wallet) {
        payload.wallet = await getTokenAddress(payload.wallet);
      }
      payload.action = 'stake';
      if (!payload.asset) {
        payload.asset = payload.token;
      }
      const result = await api.createTransaction('pancake/v3', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to stake: ${error}` });
    }
  });

  toolkit.action({
    action: 'find the best pool',
    actionDescription: 'Find the best liquidity pool for a token pair on PancakeSwap based on liquidity depth and trading volume.',
    payloadDescription: {
      chain: {
        type: 'string',
        description: 'The blockchain network name. Currently only supports BSC (BNB Chain).',
        required: true,
      },
      asset: {
        type: 'string',
        description: 'The token symbol or address of the first token in the pair.',
        required: true,
      },
      asset2: {
        type: 'string',
        description: 'The token symbol or address of the second token in the pair.',
        required: true,
      },
      amount: {
        type: 'string',
        description: 'The amount of tokens to trade (optional, used to calculate price impact).',
        required: false,
      },
      sortBy: {
        type: 'string',
        description: 'The sorting criteria (e.g., "liquidity", "volume", "apr").',
        required: false,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      if (payload.wallet) {
        payload.wallet = await getTokenAddress(payload.wallet);
      }
      payload.action = 'find the best pool';
      if (!payload.asset) {
        payload.asset = payload.token;
      }
      const result = await api.createTransaction('pancake/v3', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to find the best pool: ${error}` });
    }
  });

  await toolkit.run();
};


main().catch(console.error);
