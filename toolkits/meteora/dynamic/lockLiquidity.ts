import { ActionContext } from "unifai-sdk";
import { txApi, toolkit } from "../config";

toolkit.action(
  {
    action: "lockDynamicAmmPoolLiquidity",
    actionDescription: "Locks a specified amount of LP tokens in a Meteora Dynamic AMM liquidity pool (NOT DLMM pool).",
    payloadDescription: {
      "poolAddress": {
        "type": "string",
        "description": "The address of the Meteora Dynamic AMM pool where liquidity will be locked. This must be a valid pool address on Solana.",
        "required": true
      },
      "lpAmount": {
        "type": "number",
        "description": "The amount of LP tokens to lock, specified in a user-friendly format (supports decimals).",
        "required": true
      }
    }
  },
  async (ctx: ActionContext, payload: any = {}) => {
    try {
      const result = await txApi.createTransaction(
        "meteora/dynamic/lock-liquidity",
        ctx,
        payload
      );
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  }
);
