import * as dotenv from 'dotenv';
dotenv.config();

import { Toolkit, ActionContext } from 'unifai-sdk';
import { 
  searchDapps, 
  getTopDapps, 
  getDappData, 
  getDappHistoricalData,
  getDefiDapps,
  getDefiDappData,
  SearchDappsParams,
  GetTopDappsParams,
  GetDappDataParams,
  GetDappHistoricalDataParams,
  GetDefiDappsParams,
  GetDefiDappDataParams
} from './dappradar';

async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });

  await toolkit.updateToolkit({
    name: 'DappRadar',
    description: "Access DappRadar's API to get data about dapps, DeFi, and blockchain applications",
  });

  toolkit.event('ready', () => {
    console.log('DappRadar toolkit is ready to use');
  });

  // Register the searchDapps action
  toolkit.action({
    action: 'searchDapps',
    actionDescription: 'Search for dapps by name, smart contract, or website',
    payloadDescription: {
      chain: {
        type: 'string',
        description: 'Filter by blockchain (e.g., ethereum, polygon, etc.)',
        required: false,
      },
      smartContract: {
        type: 'string',
        description: 'Search dapps by a smart contract address',
        required: false,
      },
      website: {
        type: 'string',
        description: 'Search dapps by an exact website URL',
        required: false,
      },
      name: {
        type: 'string',
        description: 'Search dapps by name/title',
        required: false,
      },
      page: {
        type: 'number',
        description: 'Page number for pagination',
        required: false,
      },
      resultsPerPage: {
        type: 'number',
        description: 'Number of results per page (10, 25, or 50)',
        required: false,
      },
    }
  }, async (ctx: ActionContext, payload: SearchDappsParams = {}) => {
    try {
      const result = await searchDapps(payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to search dapps: ${error}` });
    }
  });

  // Register the getTopDapps action
  toolkit.action({
    action: 'getTopDapps',
    actionDescription: 'Get top dapps by various metrics',
    payloadDescription: {
      metric: {
        type: 'string',
        description: 'Metric to sort by (balance, transactions, uaw, volume)',
        required: true,
      },
      chain: {
        type: 'string',
        description: 'Filter by blockchain (e.g., ethereum, polygon, etc.)',
        required: false,
      },
      category: {
        type: 'number',
        description: 'Filter by category ID',
        required: false,
      },
      range: {
        type: 'string',
        description: 'Time range (24h, 7d, 30d)',
        required: false,
      },
      top: {
        type: 'number',
        description: 'Number of top results to return (10, 25, 50, or 100)',
        required: false,
      },
    }
  }, async (ctx: ActionContext, payload: GetTopDappsParams & { metric: string } = { metric: 'volume' }) => {
    try {
      const { metric, ...params } = payload;
      const result = await getTopDapps(metric, params);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to get top dapps: ${error}` });
    }
  });

  // Register the getDappData action
  toolkit.action({
    action: 'getDappData',
    actionDescription: 'Get detailed data for a specific dapp',
    payloadDescription: {
      dappId: {
        type: 'number',
        description: 'DappRadar unique dapp identifier',
        required: true,
      },
      chain: {
        type: 'string',
        description: 'Filter by blockchain for multichain dapps',
        required: false,
      },
      range: {
        type: 'string',
        description: 'Time range (24h, 7d, 30d)',
        required: false,
      },
    }
  }, async (ctx: ActionContext, payload: GetDappDataParams & { dappId: number }) => {
    try {
      const { dappId, ...params } = payload;
      const result = await getDappData(dappId, params);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to get dapp data: ${error}` });
    }
  });

  // Register the getDappHistoricalData action
  toolkit.action({
    action: 'getDappHistoricalData',
    actionDescription: 'Get historical data for a specific dapp',
    payloadDescription: {
      dappId: {
        type: 'number',
        description: 'DappRadar unique dapp identifier',
        required: true,
      },
      metric: {
        type: 'string',
        description: 'Metric to retrieve (transactions, uaw, volume)',
        required: true,
      },
      chain: {
        type: 'string',
        description: 'Filter by blockchain for multichain dapps',
        required: false,
      },
      dateFrom: {
        type: 'string',
        description: 'Start date in YYYY-MM-DD format',
        required: false,
      },
      dateTo: {
        type: 'string',
        description: 'End date in YYYY-MM-DD format (maximum range - 30 days)',
        required: false,
      },
    }
  }, async (ctx: ActionContext, payload: GetDappHistoricalDataParams & { dappId: number, metric: string }) => {
    try {
      const { dappId, metric, ...params } = payload;
      const result = await getDappHistoricalData(dappId, metric, params);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to get historical dapp data: ${error}` });
    }
  });

  // Register the getDefiDapps action
  toolkit.action({
    action: 'getDefiDapps',
    actionDescription: 'Get data for multiple DeFi dapps',
    payloadDescription: {
      chain: {
        type: 'string',
        description: 'Filter by blockchain',
        required: false,
      },
      page: {
        type: 'number',
        description: 'Page number for pagination',
        required: false,
      },
      resultsPerPage: {
        type: 'number',
        description: 'Number of results per page',
        required: false,
      },
      sort: {
        type: 'string',
        description: 'Sort field (tokenPrice, marketCap, adjustedTvl, tvl, marketCapTvl)',
        required: false,
      },
      order: {
        type: 'string',
        description: 'Sort order (asc, desc)',
        required: false,
      },
      range: {
        type: 'string',
        description: 'Time range (24h, 7d, 30d)',
        required: false,
      },
    }
  }, async (ctx: ActionContext, payload: GetDefiDappsParams = {}) => {
    try {
      const result = await getDefiDapps(payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to get DeFi dapps: ${error}` });
    }
  });

  // Register the getDefiDappData action
  toolkit.action({
    action: 'getDefiDappData',
    actionDescription: 'Get detailed DeFi data for a specific dapp',
    payloadDescription: {
      dappId: {
        type: 'number',
        description: 'DappRadar unique dapp identifier',
        required: true,
      },
      chain: {
        type: 'string',
        description: 'Filter by blockchain for multichain dapps',
        required: false,
      },
    }
  }, async (ctx: ActionContext, payload: GetDefiDappDataParams & { dappId: number }) => {
    try {
      const { dappId, ...params } = payload;
      const result = await getDefiDappData(dappId, params);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to get DeFi dapp data: ${error}` });
    }
  });

  await toolkit.run();
}

main().catch(console.error);
