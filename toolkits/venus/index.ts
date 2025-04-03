import * as dotenv from 'dotenv';
dotenv.config();

import { Toolkit, ActionContext, TransactionAPI } from 'unifai-sdk';
import { getTokenAddressBySymbol } from '../common/tokenaddress';


async function getTokenAddress(token: string) : Promise<string> {
  return await getTokenAddressBySymbol(token, 'bsc') || token;
}

async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });
  const api = new TransactionAPI({ apiKey: process.env.TOOLKIT_API_KEY, endpoint:process.env.FRONTEND_URL });
  
  await toolkit.updateToolkit({
    name: 'Venus',
    description: "Supply or borrow tokens on BNB (a.k.a. BSC) blockchain using Venus Protocol",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  toolkit.action({
    action: 'invest',
    actionDescription: 'invests (lends, stake, PoS) assets into the market and receives cTokens in exchange on BNB (a.k.a. BSC) blockchain.',
    payloadDescription: {
      chain: {
        type: 'string',
        description: 'The chain name, only support BNB (a.k.a. BSC) for now.',
        required: true,
      },
      amount: {
        type: 'string',
        description: 'The amount of the underlying asset to invest(lend, stake, PoS)',
        required: true,
      },
      asset: {
        type: 'string',
        description: 'The token address or contract address or symbol or ticker of underlying asset. Leave blank for BNB.',
        required: false,
      },
      action: {
        type: 'string',
        description: 'The action for the calling the venus protocol. Leave blank for invest.',
        required: false,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      payload.action = 'invest';
      const result = await api.createTransaction('venus/v5', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  });

  toolkit.action({
    action: 'supply',
    actionDescription: 'supplies(lends, stake, PoS) assets into the market and receives cTokens in exchange on BNB (a.k.a. BSC) blockchain.',
    payloadDescription: {
      chain: {
        type: 'string',
        description: 'The chain name, only support BNB (a.k.a. BSC) for now.',
        required: true,
      },
      amount: {
        type: 'string',
        description: 'The amount of the underlying asset to supply(lend, stake, PoS)',
        required: true,
      },
      asset: {
        type: 'string',
        description: 'The token address or contract address or symbol or ticker of underlying asset. Leave blank for BNB.',
        required: false,
      },
      action: {
        type: 'string',
        description: 'The action for the calling the venus protocol. Leave blank for supply.',
        required: false,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      payload.action = 'supply';
      const result = await api.createTransaction('venus/v5', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  });

  toolkit.action({
    action: 'redeem',
    actionDescription: 'redeem a specified quantity of vTokens into the underlying asset',
    payloadDescription: {
      wallet: {
        type: 'string',
        description: 'The wallet address that receives the fund redeem from the investment(lending, staking, PoS), only support BNB (a.k.a. BSC) for now.',
        required: true,
      },
      chain: {
        type: 'string',
        description: 'The chain name, only support BNB (a.k.a. BSC) for now.',
        required: true,
      },
      amount: {
        type: 'string',
        description: 'The number of vTokens to redeem into underlying',
        required: true,
      },
      asset: {
        type: 'string',
        description: 'The token address or contract address or symbol or ticker of underlying asset to redeem.',
        required: false,
      },
      action: {
        type: 'string',
        description: 'The action for the calling the venus protocol. Leave blank for redeem.',
        required: false,
      },
      token: {
        type: 'string',
        description: 'The token address or contract address or symbol or ticker of underlying asset to redeem.',
        required: false,
      },
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      if (payload.wallet) {
        payload.wallet = await getTokenAddress(payload.wallet);
      }
      payload.action = 'redeem';
      if (!payload.asset) {
        payload.asset = payload.token;
      }
      const result = await api.createTransaction('venus/v5', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to redeem: ${error}` });
    }
  });

  toolkit.action({
    action: 'withdraw',
    actionDescription: 'withdraw a specified quantity of vTokens into the underlying asset',
    payloadDescription: {
      wallet: {
        type: 'string',
        description: 'The wallet address that receives the fund redeem from the investment(lending, staking, PoS), only support BNB (a.k.a. BSC) for now.',
        required: true,
      },
      chain: {
        type: 'string',
        description: 'The chain name, only support BNB (a.k.a. BSC) for now.',
        required: true,
      },
      amount: {
        type: 'string',
        description: 'The number of vTokens to withdraw into underlying',
        required: true,
      },
      asset: {
        type: 'string',
        description: 'The token address or contract address or symbol or ticker of underlying asset to withdraw.',
        required: false,
      },
      token: {
        type: 'string',
        description: 'The token address or contract address or symbol or ticker of underlying asset to redeem.',
        required: false,
      },
      action: {
        type: 'string',
        description: 'The action for the calling the venus protocol. Leave blank for redeem.',
        required: false,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      if (payload.wallet) {
        payload.wallet = await getTokenAddress(payload.wallet);
      }
      payload.action = 'redeem';
      if (!payload.asset) {
        payload.asset = payload.token;
      }
      const result = await api.createTransaction('venus/v5', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to redeem: ${error}` });
    }
  });

  toolkit.action({
    action: 'borrow',
    actionDescription: 'Borrow a specified amount of tokens from the Venus protocol. Users must provide sufficient collateral and maintain a health factor greater than 1.5. Supported tokens include BNB and other approved tokens on BSC.',
    payloadDescription: {
      wallet: {
        type: 'string',
        description: 'The wallet address that will receive the borrowed funds. Currently only supports addresses on BSC (BNB Chain).',
        required: true,
      },
      chain: {
        type: 'string',
        description: 'The blockchain network name. Currently only supports BSC (BNB Chain).',
        required: true,
      },
      amount: {
        type: 'string',
        description: 'The amount of tokens to borrow (in base units, e.g., wei for BNB).',
        required: true,
      },
      asset: {
        type: 'string',
        description: 'The identifier of the token to borrow. Can be a token symbol (e.g., "BNB", "USDT"), contract address, or token code. If not specified, defaults to BNB.',
        required: false,
      },
      token: {
        type: 'string',
        description: 'The identifier of the token to use as collateral. Can be a token symbol, contract address, or token code. If not specified, will use the default collateral.',
        required: false,
      },
      action: {
        type: 'string',
        description: 'The operation type for the Venus protocol. Should be set to "borrow" for borrowing operations.',
        required: false,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      if (payload.wallet) {
        payload.wallet = await getTokenAddress(payload.wallet);
      }
      payload.action = 'borrow';
      if (!payload.asset) {
        payload.asset = payload.token;
      }
      const result = await api.createTransaction('venus/v5', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to borrow: ${error}` });
    }
  });

  toolkit.action({
    action: 'repayborrow',
    actionDescription: 'Repay borrowed tokens to the Venus protocol. This operation reduces the user\'s outstanding debt and improves their health factor. Supports repaying both BNB and other approved tokens on BSC.',
    payloadDescription: {
      wallet: {
        type: 'string',
        description: 'The wallet address that will repay the borrowed funds. Must be the same address that initially borrowed the tokens. Currently only supports addresses on BSC (BNB Chain).',
        required: true,
      },
      chain: {
        type: 'string',
        description: 'The blockchain network name. Currently only supports BSC (BNB Chain).',
        required: true,
      },
      amount: {
        type: 'string',
        description: 'The amount of tokens to repay (in base units, e.g., wei for BNB). This should not exceed the total borrowed amount plus accrued interest.',
        required: true,
      },
      asset: {
        type: 'string',
        description: 'The identifier of the token to repay. Can be a token symbol (e.g., "BNB", "USDT"), contract address, or token code. If not specified, defaults to BNB.',
        required: false,
      },
      token: {
        type: 'string',
        description: 'The identifier of the token being repaid. Should match the token that was initially borrowed. Can be a token symbol, contract address, or token code.',
        required: false,
      },
      action: {
        type: 'string',
        description: 'The operation type for the Venus protocol. Should be set to "repayborrow" for repaying borrowed tokens.',
        required: false,
        enum: ['repayborrow']
      }
    }
}, async (ctx: ActionContext, payload: any = {}) => {
    try {
      if (payload.wallet) {
        payload.wallet = await getTokenAddress(payload.wallet);
      }
      payload.action = 'repayborrow';
      if (!payload.asset) {
        payload.asset = payload.token;
      }
      const result = await api.createTransaction('venus/v5', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to repayborrow: ${error}` });
    }
  });

  await toolkit.run();
};


main().catch(console.error);
