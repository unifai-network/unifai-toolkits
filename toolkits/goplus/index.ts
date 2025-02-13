import * as dotenv from 'dotenv';
dotenv.config();

import { Toolkit, ActionContext } from 'unifai-sdk';
import { GoplusAPI } from './api';

const supportedChains = {
  solana: 'solana',
  sui: 'sui',
  ethereum: '1',
  bsc: '56',
  base: '8453',
}

async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });
  const api = new GoplusAPI();

  await toolkit.updateToolkit({
    name: 'GoPlus Security',
    description: "GoPlus Security provides fast, reliable, and convenient security services",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  toolkit.action({
    action: 'tokenSecurity',
    actionDescription: 'Get token\'s security and risk data.',
    payloadDescription: {
      chain: {
        type: 'string',
        description: 'Chain name (e.g. solana, ethereum, base, bsc, sui etc.).',
        required: true,
      },
      contractAddress: {
        type: 'string',
        description: 'Contract address of the token.',
        required: true,
      },
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      payload.chain = payload.chain?.toLowerCase();

      if (!supportedChains[payload.chain]) {
        return ctx.result({ 
          error: `Unsupported chain: ${payload.chain}`,
          supportedChains: Object.keys(supportedChains)
        });
      }

      const chainId = supportedChains[payload.chain];
      let result: Record<string, any>;
      if (payload.chain === 'solana') {
        result = await api.solanaTokenSecurity(payload.contractAddress);
      } else if (payload.chain === 'sui') {
        result = await api.suiTokenSecurity(payload.contractAddress);
      } else {
        result = await api.tokenSecurity(chainId, payload.contractAddress);
      }

      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to get token security data: ${error}` });
    }
  });

  await toolkit.run();
}

main().catch(console.error);
