import * as dotenv from 'dotenv';
dotenv.config();

import { PublicKey, Connection, clusterApiUrl, LAMPORTS_PER_SOL, ParsedAccountData } from '@solana/web3.js';
import { Toolkit, ActionContext, TransactionAPI } from 'unifai-sdk';
import { getTokenAddressBySymbol } from '../common/tokenaddress';

const connection = new Connection(process.env.SOLANA_RPC_URL || clusterApiUrl('mainnet-beta'), 'confirmed');

async function getSolanaTokenAddress(token: string) : Promise<string> {
  try {
    new PublicKey(token);
  } catch (error) {
    return await getTokenAddressBySymbol(token, 'solana') || token;
  }
  return token;
}

async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });
  const api = new TransactionAPI({ apiKey: process.env.TOOLKIT_API_KEY });

  await toolkit.updateToolkit({
    name: 'Solana',
    description: "Get account information on Solana blockchain",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  toolkit.action({
    action: 'getBalance',
    actionDescription: 'Get the balance of SOL or an SPL token of a Solana wallet address',
    payloadDescription: {
      walletAddress: {
        type: 'string',
        description: 'Solana wallet address',
        required: true,
      },
      tokenAddress: {
        type: 'string', 
        description: 'Token address or contract address or symbol or ticker. If not provided, the balance of SOL will be returned.',
        required: false,
      },
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      const walletAddress = new PublicKey(payload.walletAddress);
      if (!payload.tokenAddress || payload.tokenAddress.toLowerCase() === 'sol') {
        const balance = await connection.getBalance(walletAddress);
        return ctx.result(`Balance of SOL: ${balance / LAMPORTS_PER_SOL}`);
      }

      const tokenAddress = await getSolanaTokenAddress(payload.tokenAddress);

      const tokenAccounts = await connection.getTokenAccountsByOwner(
        walletAddress,
        { mint: new PublicKey(tokenAddress) }
      );

      if (tokenAccounts.value.length === 0) {
        return ctx.result(`Balance of ${payload.tokenAddress}: 0`);
      }

      const tokenAccount = await connection.getParsedAccountInfo(tokenAccounts.value[0].pubkey);

      const tokenData = tokenAccount.value?.data as ParsedAccountData;

      return ctx.result(`Balance of ${payload.tokenAddress}: ${tokenData.parsed?.info?.tokenAmount?.uiAmount || 0}`);
    } catch (error) {
      return ctx.result({ error: `Failed to get balance: ${error}` });
    }
  });

  toolkit.action({
    action: 'transfer',
    actionDescription: 'Transfer SOL or an SPL token from one Solana wallet address to another',
    payloadDescription: {
      toWalletAddress: {
        type: 'string',
        description: 'Solana wallet address to transfer to',
        required: true,
      },
      amount: {
        type: 'number', 
        description: 'Amount of SOL or tokens to transfer',
        required: true,
      },
      tokenAddress: {
        type: 'string', 
        description: 'Token address or contract address or symbol or ticker to transfer. If not provided, the transfer will be SOL.',
        required: false,
      },
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      const result = await api.createTransaction('solana/transfer', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  });

  toolkit.action({
    action: 'createSplToken',
    actionDescription: 'Create an SPL token on Solana',
    payloadDescription: {
      decimals: {
        type: 'number',
        description: 'Number of decimals for the token, default is 9',
        required: false,
      },
      mintAmount: {
        type: 'number', 
        description: 'Amount of tokens to mint, default is 1000000000',
        required: false,
      },
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      const result = await api.createTransaction('solana/spl-create', ctx, payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  });

  await toolkit.run();
}

main().catch(console.error);
