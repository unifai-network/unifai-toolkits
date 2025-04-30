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
    name: 'PancakeSwapV3',
    description: "Add liquidity or Remove liquidity or collect or stake on BNB (a.k.a. BSC) blockchain or Other EVM blockchains such as(Base, opBNB, Ethereum, Polygon, Linea, Aptos, Solana, ZKsync, Arbitrum) using Pancake V3 Protocol",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  toolkit.action({
    action: 'createPool',
    actionDescription: 'create pool to a PancakeSwap liquidity pool by providing both tokens in the correct ratio. This action allows you to become a liquidity provider and earn trading fees.',
    payloadDescription: {
      chain: {
        type: 'string',
        description: 'The blockchain network name. Currently only supports BSC (BNB Chain). or Other EVM blockchains such as(Base, opBNB, Ethereum, Polygon, Linea, Aptos, Solana, ZKsync, Arbitrum) ',
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
      const result = await api.createTransaction('pancake/v3/create', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to add transaction: ${error}` });
    }
  });


  toolkit.action({
    action: 'addLiquidity',
    actionDescription: 'In order to one-click add liquidity in just one step, it will combine swapping tokens and adding liquidity to an existing PancakeSwap V3 pool in a single transaction. This action first swaps one token for another to achieve the desired ratio, then adds both tokens to the liquidity pool.',
    payloadDescription: {
      chain: {
        type: 'string',
        description: 'The blockchain network name. Currently only supports BSC (BNB Chain). or Other EVM blockchains such as(Base, opBNB, Ethereum, Polygon, Linea, Aptos, Solana, ZKsync, Arbitrum) ',
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
      fee: {
        type: 'string',
        description: 'pancake v3 offers three fee tiers for liquidity providers (LPs) to choose from, depending on the trading pair’s volatility:0.05% – For stablecoin pairs (e.g., USDC/USDT, DAI/USDC); 0.30% – The default fee for most common pairs (e.g., ETH/USDC, WBTC/ETH); 1.00% – For highly volatile or exotic tokens (e.g., low-cap altcoins).',
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
      payload.action = 'swap_and_add_liquidity';
      if (payload.chain.length == 0) {
        payload.chain = 'bsc';
      }
      if (payload.asset == 'BNB' || payload.asset == 'bnb') {
        payload.asset = 'WBNB';
      }
      if (payload.asset2 == 'BNB' || payload.asset2 == 'bnb') {
        payload.asset2 = 'WBNB';
      }
      const result = await api.createTransaction('pancake/v3/add-liquidity', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to swap and add liquidity: ${error}` });
    }
  });

  toolkit.action({
    action: 'removeLiquidity',
    actionDescription: 'Remove liquidity from a PancakeSwap V3 liquidity pool and receive both tokens in return. This action allows you to withdraw your liquidity provider position.',
    payloadDescription: {
      chain: {
        type: 'string',
        description: 'The blockchain network name. Currently only supports BSC (BNB Chain). or Other EVM blockchains such as(Base, opBNB, Ethereum, Polygon, Linea, Aptos, Solana, ZKsync, Arbitrum) ',
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
    action: 'collect',
    actionDescription: 'Collect(a.k.a. claim, withdraw) unclaimed fees from a specific liquidity position in PancakeSwap V3. This action allows you to claim trading fees earned from providing liquidity.',
    payloadDescription: {
      chain: {
        type: 'string',
        description: 'The blockchain network name. Currently only supports BSC (BNB Chain). or Other EVM blockchains such as(Base, opBNB, Ethereum, Polygon, Linea, Aptos, Solana, ZKsync, Arbitrum) ',
        required: true,
      },
      tokenId: {
        type: 'string',
        description: 'The unique identifier of the liquidity position NFT. In PancakeSwap V3, each liquidity position is represented as an NFT.',
        required: true,
      },
      amount0Max: {
        type: 'string',
        description: 'The maximum amount of token0 to collect. If not specified, all available fees will be collected.',
        required: false,
      },
      amount1Max: {
        type: 'string',
        description: 'The maximum amount of token1 to collect. If not specified, all available fees will be collected.',
        required: false,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      payload.chain = 'bsc';
      payload.action = 'collect';
      const result = await api.createTransaction('pancake/v3/collect', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to collect fees: ${error}` });
    }
  });

  toolkit.action({
    action: 'stake',
    actionDescription: 'Stake LP tokens in PancakeSwap V3 farms to earn CAKE rewards. This action allows you to participate in yield farming and earn additional rewards.',
    payloadDescription: {
      chain: {
        type: 'string',
        description: 'The blockchain network name. Currently only supports BSC (BNB Chain). or Other EVM blockchains such as(Base, opBNB, Ethereum, Polygon, Linea, Aptos, Solana, ZKsync, Arbitrum) ',
        required: true,
      },
      pid: {
        type: 'string',
        description: 'The pool ID of the farm where you want to stake your LP tokens.',
        required: true,
      },
      amount: {
        type: 'string',
        description: 'The amount of LP tokens to stake in the farm.',
        required: true,
      },
      referrer: {
        type: 'string',
        description: 'Optional referrer address for referral rewards.',
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
      if (payload.referrer) {
        payload.referrer = await getTokenAddress(payload.referrer);
      }
      payload.action = 'stake';
      payload.chain = 'bsc';
      const result = await api.createTransaction('pancake/v3/stake', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to stake LP tokens: ${error}` });
    }
  });

  await toolkit.run();
};


main().catch(console.error);
