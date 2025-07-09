import * as dotenv from 'dotenv';
dotenv.config();

import { Toolkit, ActionContext } from 'unifai-sdk';
import { ElfaV2API } from './api';

async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });
  const api = new ElfaV2API(process.env.ELFA_API_KEY);

  await toolkit.updateToolkit({
    name: 'Elfa',
    description: "Elfa provides X/Twitter data for web3/blockchain",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  toolkit.action({
    action: 'getTrendingTokens',
    actionDescription: 'Get tokens mostly discussed on X/Twitter recently by selected web3 KOLs',
    payloadDescription: {
      timeWindow: {
        type: 'string',
        description: 'Time window for trending analysis (e.g., "30m", "1h", "4h", "24h", "7d", "30d")',
        default: '7d',
        required: false
      },
      from: {
        type: 'number',
        description: 'Start date (unix timestamp). Use either timeWindow OR both from and to parameters',
        required: false
      },
      to: {
        type: 'number',
        description: 'End date (unix timestamp). Use either timeWindow OR both from and to parameters',
        required: false
      },
      page: {
        type: 'number',
        description: 'Page number for pagination',
        default: 1,
        required: false
      },
      pageSize: {
        type: 'number',
        description: 'Number of items per page, max is 100',
        default: 50,
        required: false
      },
      minMentions: {
        type: 'number', 
        description: 'Minimum number of mentions required',
        default: 5,
        required: false
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      const result = await api.getTrendingTokens(payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to get trending tokens: ${error}` });
    }
  });

  toolkit.action({
    action: 'getEventSummary',
    actionDescription: 'Generate event summaries based on keyword mentions within a time period',
    payloadDescription: {
      keywords: {
        type: 'string',
        description: 'Keywords to search for, separated by commas',
        required: true
      },
      timeWindow: {
        type: 'string',
        description: 'Time window for mentions (e.g., "30m", "1h", "4h", "24h", "7d", "30d")',
        default: '7d',
        required: false
      },
      from: {
        type: 'number',
        description: 'Start date (unix timestamp). Use either timeWindow OR both from and to parameters',
        required: false
      },
      to: {
        type: 'number',
        description: 'End date (unix timestamp). Use either timeWindow OR both from and to parameters',
        required: false
      },
      searchType: {
        type: 'string',
        description: 'Type of search (and, or)',
        default: 'or',
        required: false
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      const result = await api.getEventSummary(payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to get event summary: ${error}` });
    }
  });

  await toolkit.run();
}

main().catch(console.error);
