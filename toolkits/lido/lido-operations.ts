import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

import { createWalletClient, http, createPublicClient, formatEther, Hash, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { holesky } from 'viem/chains';
import { ethers } from 'ethers';


const result = dotenv.config({ path: resolve(__dirname, '../../.env') });

const mypk = process.env.ETHEREUM_PRIVATE_KEY;
const yourHoleskyRpcUrl = process.env.YOUR_HOLESKY_RPC_URL;

// validate and format private key
function formatPrivateKey(key: string | undefined): `0x${string}` {
  if (!key) {
    throw new Error('private key is not set');
  }

  const cleanKey = key.replace('0x', '');

  if (!/^[0-9a-fA-F]{64}$/.test(cleanKey)) {
    throw new Error('invalid private key format: need 64-bit hexadecimal');
  }

  return `0x${cleanKey}` as `0x${string}`;
}

// initialize Lido SDK
async function initLidoSDK(mypk) {
  let account;
  const formattedKey = formatPrivateKey(mypk);
  account = privateKeyToAccount(formattedKey);

  console.log(`will use account: ${account.address}`);
  console.log(`will connect to RPC: ${yourHoleskyRpcUrl}`);

  console.log('creating Viem WalletClient...');
  const walletClient = createWalletClient({
    account,
    chain: holesky,
    transport: http(yourHoleskyRpcUrl)
  });


  console.log('creating Viem PublicClient...');
  const publicClient = createPublicClient({
    chain: holesky,
    transport: http(yourHoleskyRpcUrl)
  });

  console.log('initializing Lido SDK...');
  const sdk = new LidoSDK({
    chainId: holesky.id,
    rpcUrls: [yourHoleskyRpcUrl],
    web3Provider: walletClient
  });
  console.log('Lido SDK initialized.');

  console.log('initLidoSDK return value check:', {
    sdk: !!sdk,
    account: !!account,
    walletClient: !!walletClient,
    accountAddress: account?.address
  });

  return [sdk, account, walletClient];
}

export async function stake(stakeValueWei) {
  let sdk, account, walletClient;

  try {
    [sdk, account, walletClient] = await initLidoSDK(mypk);

    console.log(`querying ETH balance of account ${account.address}...`);
    const balanceWei = await sdk.core.balanceETH(account.address);
    console.log(`ETH balance of account: ${formatEther(balanceWei)} ETH`);
    if (balanceWei < stakeValueWei) {
      throw new Error('account balance is not enough, cannot stake');
    }

    console.log(`prepare to stake ${formatEther(stakeValueWei)} ETH for account ${account.address}...`);

    const referralAddress = '0x0000000000000000000000000000000000000000';

    const stakeOperationResult = await sdk.stake.stakeEth({
      account: account,
      value: stakeValueWei,
      referralAddress: referralAddress,
    });

    if (!stakeOperationResult || !stakeOperationResult.hash || !stakeOperationResult.result) {
      console.error('stake operation result is not as expected (missing hash or result object):', stakeOperationResult);
      throw new Error('stake operation result is not as expected (missing hash or result object).');
    }

    const txHash = stakeOperationResult.hash; // get tx hash from stakeOperationResult
    console.log(`stake transaction sent, tx hash: ${txHash}, waiting for confirmation...`);

    console.log(`stake transaction confirmed, block number: ${stakeOperationResult.blockNumber}`);

    console.log('Lido SDK processed stake operation.');

    const { stethReceived, sharesReceived } = stakeOperationResult.result;
    console.log(`will receive stETH: ${formatEther(stethReceived)}`);
    console.log(`will receive shares: ${formatEther(sharesReceived)}`);
    console.log(`transaction info: ${stakeOperationResult.result.blockNumber}`);

    return `tx hash: ${txHash}, will receive stETH: ${formatEther(stethReceived)}, will receive shares: ${formatEther(sharesReceived)}`;

  } catch (error) {
    console.error('error during stake operation:', error);
    let errorMessage = `error message: ${error.message}`;
    if (error.transactionHash) {
      errorMessage += `, tx hash: ${error.transactionHash}`;
    } else if (error.cause && error.cause.transactionHash) {
      errorMessage += `, tx hash: ${error.cause.transactionHash}`;
    }
    return errorMessage;
  }
}

async function approveStEthAllowance(
  amountToApprove: bigint
): Promise<string | undefined> {
  try {
    if (!yourHoleskyRpcUrl || !amountToApprove) {
      throw new Error('missing required parameters');
    }

    console.log('initializing ethers provider and wallet...');

    const provider = new ethers.JsonRpcProvider(yourHoleskyRpcUrl);

    const formattedKey = formatPrivateKey(mypk);
    const wallet = new ethers.Wallet(formattedKey, provider);

    console.log(`will use account: ${wallet.address}`);

    const stETH_ADDRESS = '0x3F1c547b21f65e10480dE3ad8E19fAAC46C95034';
    const WITHDRAWAL_QUEUE_ADDRESS = '0xc7cc160b58F8Bb0baC94b80847E2CF2800565C50';

    const stETH_ABI = [
      "function allowance(address owner, address spender) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)"
    ];

    console.log(`\n--- check allowance ---`);
    console.log(`stETH contract address: ${stETH_ADDRESS}`);
    console.log(`Withdrawal Queue address: ${WITHDRAWAL_QUEUE_ADDRESS}`);


    const stETHContract = new ethers.Contract(stETH_ADDRESS, stETH_ABI, wallet);


    console.log(`query current allowance, parameters: owner=${wallet.address}, spender=${WITHDRAWAL_QUEUE_ADDRESS}`);
    const currentAllowance = await stETHContract.allowance(wallet.address, WITHDRAWAL_QUEUE_ADDRESS);
    console.log(`current allowance: ${ethers.formatEther(currentAllowance)} stETH`);

    if (currentAllowance < amountToApprove) {
      console.log('allowance is not enough, sending approve transaction...');

      const approveTx = await stETHContract.approve(WITHDRAWAL_QUEUE_ADDRESS, amountToApprove);
      console.log(`approve transaction hash: ${approveTx.hash}`);

      console.log('waiting for transaction confirmation...');
      const receipt = await approveTx.wait();
      console.log(`transaction confirmed, block number: ${receipt.blockNumber}`);
      console.log('stETH allowance approved successfully!');

      return approveTx.hash;
    } else {
      console.log('allowance is enough, no need to approve again.');
      return undefined;
    }
  } catch (error) {
    console.error('error during approve allowance:', error);
    throw error;
  }
}

export async function unstakeEth(amountToUnstake) {
  let sdk, account;
  try {

    [sdk, account] = await initLidoSDK(mypk);


    console.log(`\n--- check wallet balance ---`);

    const stETH_ADDRESS = '0x3F1c547b21f65e10480dE3ad8E19fAAC46C95034';

    const provider = new ethers.JsonRpcProvider(yourHoleskyRpcUrl);
    const stETH_ABI = [
      "function balanceOf(address account) view returns (uint256)"
    ];
    const stETHContract = new ethers.Contract(stETH_ADDRESS, stETH_ABI, provider);

    const stethBalance = await stETHContract.balanceOf(account.address);
    console.log(`stETH balance in wallet: ${ethers.formatEther(stethBalance)} stETH`);

    if (stethBalance < amountToUnstake) {
      throw new Error(`balance is not enough for unstake operation. need ${amountToUnstake} stETH, but only ${ethers.formatEther(stethBalance)} stETH.`);
    }

    const withdrawalQueueAddress = await sdk.core.getContractAddress('withdrawalQueue');
    console.log(`WithdrawalQueue contract address: ${withdrawalQueueAddress}`); // WithdrawalQueue contract address:

    await approveStEthAllowance(amountToUnstake);

    console.log(`\n--- submit unstake request ---`); // --- Submitting unstake request ---

    console.log(`submitting unstake request, amount: ${ethers.formatEther(amountToUnstake)} stETH...`);

    const WITHDRAWAL_QUEUE_ABI = [
      "function requestWithdrawals(uint256[] amounts, address owner) returns (uint256[] requestIds)",
      "function getLastCheckpointIndex() view returns (uint256)",
      "function calculateExpectedCheckpoint() view returns (uint256 expectedCheckpoint)",
      "function getLastRequestTimestamp() view returns (uint256)"
    ];

    const formattedKey = formatPrivateKey(mypk);
    const wallet = new ethers.Wallet(formattedKey, provider);
    const withdrawalQueueContract = new ethers.Contract(withdrawalQueueAddress, WITHDRAWAL_QUEUE_ABI, wallet);

    const requestTx = await withdrawalQueueContract.requestWithdrawals([amountToUnstake], wallet.address);
    console.log(`unstake transaction hash: ${requestTx.hash}`);
    await requestTx.wait();
    console.log('unstake request submitted successfully!');

    console.log(`\n--- request successful, get latest information ---`);

    const newStethBalance = await stETHContract.balanceOf(account.address);
    console.log(`stETH balance in wallet: ${ethers.formatEther(newStethBalance)} stETH`);

    return `tx hash: ${requestTx.hash} stETH balance in wallet: ${ethers.formatEther(newStethBalance)} stETH`;

  } catch (error: any) {
    console.error(`\nerror occurred: ${error.message}`);

    return `error message: ${error.message}`;
  }
}
