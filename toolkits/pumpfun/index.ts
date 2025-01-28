import * as dotenv from 'dotenv';
import { ActionContext, Toolkit, TransactionAPI } from 'unifai-sdk';

dotenv.config();

async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });
  const api = new TransactionAPI({ apiKey: process.env.TOOLKIT_API_KEY });

  await toolkit.updateToolkit({
    name: 'Pump.fun',
    description: "Pump.fun allows you to launch your own meme token (memecoin) on Solana",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  toolkit.action({
    action: 'launch token',
    actionDescription: 'Launch a new token on Pump.fun',
    payloadDescription: {
      tokenName: {
        type: 'string',
        description: 'Name of the token',
        required: true,
      },
      tokenTicker: {
        type: 'string', 
        description: 'Ticker symbol for the token',
        required: true,
      },
      description: {
        type: 'string',
        description: 'Description of the token',
        required: true,
      },
      imageUrl: {
        type: 'string',
        description: 'URL of the token image/logo',
        required: true,
      },
      twitter: {
        type: 'string',
        description: 'Twitter handle/URL (optional)',
        required: false,
      },
      telegram: {
        type: 'string',
        description: 'Telegram group URL (optional)', 
        required: false,
      },
      website: {
        type: 'string',
        description: 'Project website URL (optional)',
        required: false,
      },
      initialBuyAmount: {
        type: 'number',
        description: 'The amount of token to buy at launch in SOL (optional)',
        required: false,
      },
      slippageBps: {
        type: 'number',
        description: 'Slippage tolerance in basis points (optional)',
        required: false,
      },
      priorityFee: {
        type: 'number',
        description: 'Priority fee for transaction (optional)',
        required: false,
      },
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      const result = await api.createTransaction('pumpfun/launch', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  });

  await toolkit.run();
}

main().catch(console.error);
