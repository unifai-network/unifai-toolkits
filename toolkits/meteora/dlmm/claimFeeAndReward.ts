import { ActionContext } from "unifai-sdk";
import { txApi, toolkit } from "../config";

toolkit.action(
  {
    action: "claimFeeAndReward",
    actionDescription: "Claim any accumulated trading fees and protocol rewards from a user's position in a Meteora DLMM liquidity pool, without modifying or removing the position itself.",
    payloadDescription: {
      "lbPair": {
        "type": "string",
        "description": "The address of the Meteora DLMM liquidity pool from which fees and rewards will be claimed.",
        "required": true
      },
      "position": {
        "type": "string",
        "description": "The public key of the user's liquidity position in the specified DLMM pool.",
        "required": true
      }
    }
  },
  async (ctx: ActionContext, payload: any = {}) => {
    try {
      const result = await txApi.createTransaction(
        "meteora/dlmm/claim-fee-and-reward",
        ctx,
        payload
      );
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  }
);