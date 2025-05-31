import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { stake, unstakeEth } from './lido-operations';


const result = dotenv.config({ path: resolve(__dirname, '../../.env') });


import { Toolkit, ActionContext } from 'unifai-sdk';
import { getTokenAddressBySymbol } from '../common/tokenaddress';
import { ethers } from 'ethers';


async function getTokenAddress(token: string, chain: string): Promise<string> {
  if (ethers.isAddress(token.toLowerCase())) {
    return token.toLowerCase();
  }
  return await getTokenAddressBySymbol(token, chain) || token;
}


async function main() {

  const apikey = process.env.UNIFAI_TOOLKIT_API_KEY;
  const ethurl = process.env.ETHEREUM_RPC_URL;
  const toolkit = new Toolkit({ apiKey: apikey });


  await toolkit.updateToolkit({
    name: 'Lido',
    description: "Lido is a liquid staking solution for ETH. It allows users to stake their tokens and receive liquid staked tokens ,and unstake them to receive native tokens.",
  });


  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });


  toolkit.action({
    action: 'stake',
    actionDescription: 'Stake native tokens (ETH) to receive corresponding liquid staked tokens (stETH) .',
    payloadDescription: {
      amount: {
        type: 'number',
        description: 'The amount of native token (ETH) to stake.',
        required: true,
      },

    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      console.log('start to stake, payload:', JSON.stringify(payload, null, 2));

      const stakeValueWei = BigInt(Math.floor(payload.amount * 1e18));
      const stakeOperationResult = await stake(stakeValueWei);
      console.log('stake result:', stakeOperationResult);

      return ctx.result({ message: stakeOperationResult });

    } catch (error) {
      console.error('stake error:', error);
      if (error instanceof Error) {
        console.error('error stack:', error.stack);
      }
      return ctx.result({ error: `Failed to stake: ${error}` });
    }
  });


  toolkit.action({
    action: 'unstake',
    actionDescription: 'Unstake liquid staked tokens (stETH) to receive native tokens (ETH). Note: unstaking may involve a waiting period depending on the protocol.',
    payloadDescription: {
      amount: {
        type: 'number',
        description: 'The amount of liquid staked tokens (stETH) to unstake.',
        required: true,
      },
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      console.log('start to unstake, payload:', JSON.stringify(payload, null, 2));
      const unstakeValueWei = BigInt(Math.floor(payload.amount * 1e18));
      console.log('unstakeValueWei:', unstakeValueWei);
      const unstakeOperationResult = await unstakeEth(unstakeValueWei);
      console.log('unstake result:', unstakeOperationResult);
      return ctx.result({ message: unstakeOperationResult });
    } catch (error) {
      return ctx.result({ error: `Failed to unstake: ${error}` });
    }
  });

  toolkit.action({
    action: 'getLiquidStakedBalance',
    actionDescription: 'Get the balance of stETH for a given wallet address.',
    payloadDescription: {
      chain: {
        type: 'string',
        description: 'The blockchain network (e.g., "ethereum").',
        required: true,
        enums: ['ethereum'],
      },
      walletAddress: {
        type: 'string',
        description: 'The wallet address to query.',
        required: true,
      },
      liquidStakedToken: {
        type: 'string',
        description: 'The symbol or address of the liquid staked token (e.g., "stETH").',
        required: true,
      },
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      const chain = payload.chain.toLowerCase();
      const liquidStakedTokenAddress = await getTokenAddress(payload.liquidStakedToken, chain);

      if (!liquidStakedTokenAddress) {
        throw new Error(`Could not resolve address for liquid staked token: ${payload.liquidStakedToken} on ${payload.chain}`);
      }

      console.log(`Fetching stETH balance for ${payload.walletAddress} on Ethereum`);
      const provider = ethers.getDefaultProvider(ethurl || 'mainnet');

      const stEthContractAbi = [
        "function balanceOf(address account) view returns (uint256)"
      ];
      const stEthContract = new ethers.Contract(liquidStakedTokenAddress, stEthContractAbi, provider);

      const balanceWei = await stEthContract.balanceOf(payload.walletAddress);
      const balanceEth = ethers.formatEther(balanceWei);

      console.log('Balance of stETH for', payload.walletAddress, 'on Ethereum:', balanceEth);

      return ctx.result({
        message: `Balance of ${payload.liquidStakedToken} for ${payload.walletAddress} on ${chain}: ${balanceEth}`,
        balance: balanceEth,
        balanceWei: balanceWei.toString()
      });
    } catch (error) {
      return ctx.result({ error: `Failed to get liquid staked balance: ${error}` });
    }
  });
  await toolkit.run();
}

main().catch(console.error);
