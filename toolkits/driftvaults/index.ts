import * as dotenv from 'dotenv';
dotenv.config();

import { ActionContext, Toolkit, TransactionAPI } from 'unifai-sdk';


async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });
  const api = new TransactionAPI({ apiKey: process.env.TOOLKIT_API_KEY });

  await toolkit.updateToolkit({
    name: 'Drift Vaults',
    description: "Drift Vaults is a protocol for yield generation on the Solana blockchain",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  toolkit.action({
    action: 'deposit',
    actionDescription: 'Deposit tokens into a Drift Vault',
    payloadDescription: {
      vaultAddress: {
        type: 'string',
        description: 'Address of the Drift Vault to deposit into',
      },
      amount: {
        type: 'number',
        description: 'Amount of tokens to deposit',
      },
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      const result = await api.createTransaction('driftVaults', ctx, {
        action: 'deposit',
        amount: payload.amount,
        vaultAddress: payload.vaultAddress,
      });
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create deposit transaction: ${error}` });
    }
  });

  toolkit.action({
    action: 'withdraw',
    actionDescription: 'Withdraw tokens from a Drift Vault',
    payloadDescription: {
      vaultAddress: {
        type: 'string',
        description: 'Address of the Drift Vault to withdraw from',
      },
      amount: {
        type: 'number',
        description: 'Amount of tokens to withdraw',
      },
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      const result = await api.createTransaction('driftVaults', ctx, {
        action: 'deposit',
        amount: payload.amount,
        vaultAddress: payload.vaultAddress,
      });
      return ctx.result(result);

    } catch (error) {
      return ctx.result({ error: `Failed to create withdrawal transaction: ${error}` });
    }
  });


  await toolkit.run();
}

main().catch(console.error);
