import { ActionContext } from "unifai-sdk";
import { txApi, toolkit } from "../config";

toolkit.action(
  {
    action: "removeDlmmPoolLiquidity",
    actionDescription: "Remove liquidity from a Meteora DLMM liquidity pool by specifying the amount to remove, along with the price range and other settings.",
    payloadDescription: {
      "lbPair": {
        "type": "string",
        "description": "The address of the Meteora DLMM liquidity pool from which liquidity will be removed.",
        "required": true
      },
      "position": {
        "type": "string",
        "description": "The public key of the user's liquidity position in the specified DLMM pool.",
        "required": true
      },
      "minPrice": {
        "type": "number",
        "description": "The minimum price at which liquidity will be removed from the pool. This defines the lower bound of the price range for liquidity removal.",
        "required": true
      },
      "maxPrice": {
        "type": "number",
        "description": "The maximum price at which liquidity will be removed from the pool. This defines the upper bound of the price range for liquidity removal.",
        "required": true
      },
      "bps": {
        "type": "number",
        "description": "The percentage of liquidity to be removed from each bin, specified in basis points (bps). For example, 100 bps means 1% of the liquidity in each bin will be removed.",
        "required": true
      },
      "shouldClaimAndClose": {
        "type": "boolean",
        "description": "A flag indicating whether to claim any accumulated rewards and close the liquidity position after removing liquidity. Set to true to claim rewards and close the position.",
        "required": true
      }
    }
  },
  async (ctx: ActionContext, payload: any = {}) => {
    try {
      const result = await txApi.createTransaction(
        "meteora/dlmm/remove-liquidity",
        ctx,
        payload
      );
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  }
);