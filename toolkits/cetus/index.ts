import * as dotenv from 'dotenv';
dotenv.config();

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { ActionContext, Toolkit, TransactionAPI } from 'unifai-sdk';
import { getTokenBySymbol } from '../dexscreener/dexscreener';


export const suiClient = new SuiClient({ url: process.env.SUI_FULLNODE_URL || getFullnodeUrl('mainnet') });

async function getSuiTokenAddress(token: string) : Promise<string> {
  try {
    const coinMetadata = await suiClient.getCoinMetadata({coinType: token});
    if (coinMetadata) {
      return token;
    }
  } catch (error) {
    const result = await getTokenBySymbol(token, 'sui');
    return result?.sui?.tokenAddress || token;
  }
  return token;
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
      from: {
        type: 'string',
        description: 'The coin type of the from token, eg: 0x2::sui::SUI',
      },
      target: {
        type: 'string',
        description: 'The coin type of the target token, eg: 0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      },
      amount: {
        type: 'number',
        description: 'Amount of from token to swap (in human readable format, decimals will be handled automatically), eg: 0.5',
      },
      slippage: {
        type: 'number',
        description: 'Slippage percentage, eg: 0.01 means 1% slippage',
      },
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      const result = await api.createTransaction('cetus/swap', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  });

  await toolkit.run();
}

main().catch(console.error);
