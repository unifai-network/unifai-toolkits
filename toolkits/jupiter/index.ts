import * as dotenv from 'dotenv';
dotenv.config();

import { PublicKey } from '@solana/web3.js';
import { ActionContext, Toolkit, TransactionAPI } from 'unifai-sdk';
import { getTokenAddressBySymbol } from '../common/tokenaddress';

async function getSolanaTokenAddress(token: string) : Promise<string> {
  try {
    new PublicKey(token);
  } catch (error) {
    return await getTokenAddressBySymbol(token, 'solana') || token;
  }
  return token;
}

async function getTokenPrices(inputTokenAddress: string, outputTokenAddress: string): Promise<{ inputPrice: number, outputPrice: number }> {
  try {
    const response = await fetch(`https://lite-api.jup.ag/price/v3?ids=${inputTokenAddress},${outputTokenAddress}`);
    const data = await response.json();
    
    const inputPrice = data[inputTokenAddress]?.usdPrice || 0;
    const outputPrice = data[outputTokenAddress]?.usdPrice || 0;
    
    return { inputPrice, outputPrice };
  } catch (error) {
    throw new Error(`Failed to fetch token prices: ${error}`);
  }
}

async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });
  const api = new TransactionAPI({ apiKey: process.env.TOOLKIT_API_KEY });

  await toolkit.updateToolkit({
    name: 'Jupiter',
    description: "Jupiter is a swap aggregator on the Solana blockchain",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  toolkit.action({
    action: 'swap',
    actionDescription: 'Swap tokens on Solana blockchain using Jupiter',
    payloadDescription: {
      inputToken: {
        type: 'string',
        description: 'Input token address or contract address or symbol or ticker',
      },
      outputToken: {
        type: 'string',
        description: 'Output token address or contract address or symbol or ticker',
      },
      inAmount: {
        type: 'number',
        description: 'Exact amount of input token to swap. Only specify either inAmount OR outAmount, not both.',
      },
      outAmount: {
        type: 'number',
        description: 'Desired amount of output token to receive (estimated, not exact). Only specify either inAmount OR outAmount, not both.',
      },
      slippageBps: {
        type: 'number',
        description: 'Slippage tolerance in basis points (100 bps = 1%). By default dynamic slippage is used. If you want to use a fixed slippage, set this to the desired value, and set dynamicSlippage to false.',
        default: 50,
      },
      dynamicSlippage: {
        type: 'boolean',
        description: 'If true, slippageBps will be overridden by Dynamic Slippage\'s estimated value. Default is true. If you want to use a fixed slippage, set this to false, and set slippageBps to the desired value.',
        default: true,
      },
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      let inAmount = payload.inAmount || payload.amount; // For backwards compatibility
      let outAmount = payload.outAmount;

      // Validate that only one of inAmount or outAmount is specified
      if ((inAmount && outAmount) || (!inAmount && !outAmount)) {
        return ctx.result({ error: 'Must specify exactly one of inAmount or outAmount, not both or neither' });
      }

      // Set defaults if not provided
      if (payload.slippageBps === undefined) {
        payload.slippageBps = 50;
      }
      if (payload.dynamicSlippage === undefined) {
        payload.dynamicSlippage = true;
      }

      payload.inputToken = await getSolanaTokenAddress(payload.inputToken);
      payload.outputToken = await getSolanaTokenAddress(payload.outputToken);
      
      if (outAmount) {
        const { inputPrice, outputPrice } = await getTokenPrices(payload.inputToken, payload.outputToken);

        if (inputPrice === 0 || outputPrice === 0) {
          return ctx.result({ error: 'Unable to fetch token prices to estimate inAmount' });
        }

        // Calculate estimated inAmount with 1% slippage buffer
        inAmount = (outAmount * outputPrice / inputPrice) * 1.01;
      }

      payload.amount = inAmount;
      delete payload.inAmount;
      delete payload.outAmount;
      
      const result = await api.createTransaction('jupiter/swap', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  });

  await toolkit.run();
}

main().catch(console.error);
