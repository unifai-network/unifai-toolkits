import * as dotenv from 'dotenv';
dotenv.config();

import { ethers } from 'ethers';
import { Toolkit, ActionContext, TransactionAPI } from 'unifai-sdk';
import { getTokenAddressBySymbol } from '../common/tokenaddress';
import {searchInvestments, subscribeInvestment, findBestInvestments, getInvestmentsbywallet} from '../okx/src/api/okxapi'
import {SimplifyInvestType} from '../okx/src/api/enums'
import {Investment, InvestmentRequest, TokenInfo} from '../okx/src/api/types'

async function getTokenAddress(token: string) : Promise<string> {
  if (ethers.isAddress(token.toLowerCase())) {
    return token.toLowerCase();
  }
  return await getTokenAddressBySymbol(token, 'bsc') || token;
}

async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });
  const api = new TransactionAPI({ apiKey: process.env.TOOLKIT_API_KEY });
  
  await toolkit.updateToolkit({
    name: 'Base',
    description: "Lend tokens on BNB (a.k.a. BSC) blockchain",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  toolkit.action({
    action: 'invest',
    actionDescription: 'invests(lends, stake, PoS) assets into the market and receives cTokens in exchange on BNB (a.k.a. BSC) blockchain.',
    payloadDescription: {
      investFundWallet: {
        type: 'string',
        description: 'The wallet that supplies the investment(lending, staking, PoS) fund, only support BNB (a.k.a. BSC) for now.',
        required: true,
      },
      chain: {
        type: 'string',
        description: 'The chain name, only support BNB (a.k.a. BSC) for now.',
        required: true,
      },
      amount: {
        type: 'number',
        description: 'The amount of the underlying asset to invest(lend, stake, PoS)',
        required: true,
      },
      asset: {
        type: 'string',
        description: 'The token address or contract address or symbol or ticker of underlying asset. Leave blank for THEBESTCOIN.',
        required: false,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      let asset = payload.asset?.toLowerCase();
      if (asset && (asset === 'eth' || asset === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')) {
        asset = undefined;
      }
      if (asset) {
        asset = await getTokenAddress(asset);
      }
      if (payload.asset == 'THEBESTCOIN') {
        asset = null;
      }
      let investments = await searchInvestments('BNB', SimplifyInvestType.Single, [asset], null, "0", "10", true, false);
      if (Array.isArray(investments)) {
        let bestInvestment = findBestInvestments(investments);
        let investmentRequestInstance: InvestmentRequest = {
          address: payload.investFundWallet,
          investmentId: bestInvestment.investmentId,
          userInputList: [
              {
                  coinAmount: payload.amount.toString(),
                  tokenAddress: asset
              }
          ],
          expectOutputList: [
              {
                  coinAmount: (payload.amount*1.1).toString(),
                  tokenAddress: asset
              }
          ]
        };
        const result = await api.createTransaction('okx/defi/subscribe', ctx, investmentRequestInstance);
        return ctx.result(result);
      }
      return ctx.result({ error: `There is not enough products for your investment` });
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  });

  toolkit.action({
    action: 'get investments',
    actionDescription: 'get investments by user wallet address',
    payloadDescription: {
      userWallet: {
        type: 'string',
        description: 'The wallet address that invest some products(lending, staking, PoS), only support BNB (a.k.a. BSC) for now.',
        required: true,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      if (payload.userWallet) {
        payload.userWallet = await getTokenAddress(payload.userWallet);
      }
      const result = await getInvestmentsbywallet(payload.userWallet);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to fetch investments: ${error}` });
    }
  });

  toolkit.action({
    action: 'redeem',
    actionDescription: 'redeem a specified quantity of cTokens into the underlying asset',
    payloadDescription: {
      redeemFundWallet: {
        type: 'string',
        description: 'The wallet address that receives the fund redeem from the investment(lending, staking, PoS), only support BNB (a.k.a. BSC) for now.',
        required: true,
      },
      investmentId: {
        type: 'string',
        description: 'The investmentId for a certain investment on okx before, only support BNB (a.k.a. BSC) for now.',
        required: true,
      },
      amount: {
        type: 'number',
        description: 'The number of cTokens to redeem into underlying',
        required: true,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      if (payload.redeemFundWallet) {
        payload.redeemFundWallet = await getTokenAddress(payload.redeemFundWallet);
      }
      let redeemParameter = {
        address: payload.investFundWallet,
        investmentId: payload.investmentId,
        userInputList: [
            {
                coinAmount: payload.amount.toString()
            }
        ]
      };
      const result = await api.createTransaction('okx/defi/redeem', ctx, redeemParameter);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to redeem: ${error}` });
    }
  });

  await toolkit.run();
};


main().catch(console.error);
