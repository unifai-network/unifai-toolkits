import * as dotenv from 'dotenv';
dotenv.config();

import { ActionContext, Toolkit } from 'unifai-sdk';
import { OkxAPI } from './api';

const ChainNameToId = {
  'solana': '501',
  'bitcoin': '0',
  'ethereum': '1',
  'optimism': '10',
  'bsc': '56',
  'polygon': '137',
  'base': '8453',
  'avalanche': '43114',
  'sui': '784',
  'tron': '195',
}

const ChainIdToName = Object.entries(ChainNameToId).reduce((acc, [name, id]) => ({
  ...acc,
  [id]: name
}), {} as Record<string, string>);

async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });
  const api = new OkxAPI(process.env.OKX_API_KEY, process.env.OKX_SECRET_KEY, process.env.OKX_PASSPHRASE);

  await toolkit.updateToolkit({
    name: 'OKX',
    description: "OKX OS offers the most powerful data querying capabilities, deeply analyzing asset data, transaction history, project information, and more.",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  toolkit.action({
    action: 'getTokenAndDefiAssets',
    actionDescription: 'Get all token balances and defi positions of a wallet address, supports multiple chains and networks',
    payloadDescription: {
      chains: {
        type: 'string',
        description: 'Chains to get token balances from, separated by comma. Only pass multiple chains if they share the same wallet address (like multiple evm chains). Do not mix chains with different wallet address formats (like evm and solana).',
        enum: Object.keys(ChainNameToId).join(', ')
      },
      address: {
        type: 'string',
        description: 'Wallet address',
      },
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      const chains = payload.chains.split(',').map(chain => ChainNameToId[chain.trim().toLowerCase()]).filter(Boolean).join(',');
      const tokenBalances = await api.allTokenBalances(chains, payload.address);
      if (tokenBalances?.data) {
        for (const data of tokenBalances.data) {
          for (const asset of data.tokenAssets) {
            if (!asset.chain && ChainIdToName[asset.chainIndex]) {
              asset.chain = ChainIdToName[asset.chainIndex];
            }
            if (!asset.balanceUsd && asset.balance && asset.tokenPrice) {
              asset.balanceUsd = Number(asset.balance) * Number(asset.tokenPrice);
            }
          }
        }
      }
      const defiPositions = await api.allDefiPositions(chains, payload.address);
      return ctx.result({
        tokenAssets: tokenBalances?.data,
        defiAssets: defiPositions?.data?.walletIdPlatformList,
      });
    } catch (error) {
      return ctx.result({ error: `Failed to get all token balances: ${error}` });
    }
  });

  await toolkit.run();
}

main().catch(console.error);
