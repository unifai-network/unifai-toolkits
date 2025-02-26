import { ActionContext } from "unifai-sdk";
import { txApi, toolkit } from "../config";

toolkit.action(
  {
    action: "removeDynamicAmmPoolLiquidity",
    actionDescription: "Removes liquidity from a Meteora Dynamic AMM liquidity pool (NOT DLMM pool) by withdrawing base (A) and quote (B) tokens in exchange for LP tokens.",
    payloadDescription: {
      "poolAddress": {
        "type": "string",
        "description": "The address of the Meteora Dynamic AMM pool from which liquidity will be removed. This must be a valid pool address on Solana.",
        "required": true
      },
      "lpAmount": {
        "type": "number",
        "description": "The amount of LP tokens to redeem for base (A) and quote (B) tokens. This value should be specified in a user-friendly format (supports decimals).",
        "required": true
      },
      "slippage": {
        "type": "number",
        "description": "The maximum acceptable slippage percentage (e.g., 1 for 1%) when removing liquidity. If the price impact exceeds this percentage, the transaction will revert.",
        "required": true
      }
    }
  },
  async (ctx: ActionContext, payload: any = {}) => {
    try {
      const result = await txApi.createTransaction(
        "meteora/dynamic/remove-liquidity",
        ctx,
        payload
      );
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  }
);