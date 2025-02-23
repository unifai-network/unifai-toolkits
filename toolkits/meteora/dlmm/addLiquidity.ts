import { ActionContext } from "unifai-sdk";
import { txApi, toolkit } from "../config";

toolkit.action(
  {
    action: "addDlmmPoolLiquidity",
    actionDescription: "Add liquidity to a Meteora DLMM liquidity pool by specifying base (x) and quote (y) token amounts, along with a chosen strategy and price range settings. Before adding liquidity, retrieve the DLMM pool details to design an appropriate strategy and set price bounds.",
    payloadDescription: {
      "lbPair": {
        "type": "string",
        "description": "The address of the Meteora DLMM liquidity pool where liquidity will be added.",
        "required": true
      },
      "position": {
        "type": "string",
        "description": "The public key of the user's liquidity position in the specified DLMM pool. If left empty, a new position will be created automatically.",
        "required": false
      },
      "baseAmount": {
        "type": "number",
        "description": "The amount of the base token (token x) to be deposited into the liquidity pool.",
        "required": true
      },
      "quoteAmount": {
        "type": "number",
        "description": "The amount of the quote token (token y) to be deposited into the liquidity pool.",
        "required": true
      },
      "slippage": {
        "type": "number",
        "description": "The maximum allowed slippage percentage (e.g., 1 for 1%) when adding liquidity. Determines how much change to the pool price you're willing to accept and still add liquidity.",
        "required": false
      },
      "strategyType": {
        "type": "number",
        "description": "Defines the type of liquidity provision strategy used. Different strategies impact how liquidity is distributed across price ranges.",
        "required": true,
        "enum": [
          {
            "value": 0,
            "description": "Spot: Provides a uniform liquidity distribution, suitable for any market conditions. Ideal for new LPs with less frequent rebalancing."
          },
          {
            "value": 1,
            "description": "Curve: Focuses capital in the middle of the price range to maximize efficiency. Best for stable pairs or markets with low volatility."
          },
          {
            "value": 2,
            "description": "Bid-Ask: Allocates most capital at the ends of the price range, ideal for capturing volatility swings. Requires more frequent rebalancing but offers high fee potential."
          }
        ],
      },
      "minPrice": {
        "type": "number",
        "description": "The minimum price at which liquidity will be provided in the pool. This price represents the lower bound of the active price range for the liquidity pool.",
        "required": true
      },
      "maxPrice": {
        "type": "number",
        "description": "The maximum price at which liquidity will be provided in the pool. This price represents the upper bound of the active price range for the liquidity pool.",
        "required": true
      }
    },
  },
  async (ctx: ActionContext, payload: any = {}) => {
    try {
      const result = await txApi.createTransaction(
        "meteora/dlmm/add-liquidity",
        ctx,
        payload
      );
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  }
);