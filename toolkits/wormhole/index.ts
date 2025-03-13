import * as dotenv from 'dotenv';
dotenv.config();

import { PublicKey } from '@solana/web3.js';
import { ActionContext, Toolkit, TransactionAPI } from 'unifai-sdk';
import { wormhole } from "@wormhole-foundation/sdk";

async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });
  const api = new TransactionAPI({ apiKey: process.env.TOOLKIT_API_KEY });

  await toolkit.updateToolkit({
    name: 'Ethereum to Solana USDC Bridge',
    description: "A Wormhole bridge implementation specifically for transferring USDC tokens from Ethereum to Solana",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  toolkit.action({
    action: 'bridge',
    actionDescription: 'Transfer USDC tokens from Ethereum to Solana using Wormhole',
    payloadDescription: {
      amount: {
        type: 'string',
        description: 'Amount of USDC to transfer (in string format)',
        required: true,
      },
      from: {
        type: 'object', 
        description: 'Source chain and address information for USDC transfer',
        required: true,
        properties: {
          chain: { type: 'string', description: 'Source chain name (supports ethereum and base)' },
          address: { type: 'string', description: 'Source address holding USDC (ethereum or base address)' }
        }
      },
      to: {
        type: 'object',
        description: 'Destination chain and address information for USDC transfer',
        required: true,
        properties: {
          chain: { type: 'string', description: 'Destination chain name (only supports solana)' },
          address: { type: 'string', description: 'Destination solana address to receive USDC' }
        }
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      const result = await api.createTransaction('wormhole/bridge', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  });

  await toolkit.run();
}

main().catch(console.error);

