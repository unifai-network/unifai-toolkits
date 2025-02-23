import { ActionContext } from "unifai-sdk";
import { txApi, toolkit } from "../config";

toolkit.action(
  {
    action: "addDynamicPoolLiquidity",
    actionDescription: "Deposits base (A) and quote (B) tokens into a Meteora Dynamic AMM pool to provide liquidity and receive LP tokens in return.",
    payloadDescription: {
      "poolAddress": {
        "type": "string",
        "description": "The address of the Meteora Dynamic AMM pool where liquidity will be added. This must be a valid pool address on Solana.",
        "required": true
      },
      "baseAmount": {
        "type": "number",
        "description": "The amount of the base token (token A) to deposit into the pool as liquidity. This value should be specified in a user-friendly format (supports decimals).",
        "required": true
      },
      "quoteAmount": {
        "type": "number",
        "description": "The amount of the quote token (token B) to deposit into the pool as liquidity. This value should be specified in a user-friendly format (supports decimals).",
        "required": true
      },
      "fixSide": {
        "type": "string",
        "description": "Specifies which token amount to keep fixed while the other amount will be automatically adjusted to maintain the pool's ratio. For non-stable pools with existing liquidity, deposits must maintain the current pool ratio. Use 'base' to keep baseAmount fixed or 'quote' to keep quoteAmount fixed.",
        "required": true,
        "enum": ["base", "quote"]
      },
      "slippage": {
        "type": "number",
        "description": "The maximum acceptable slippage percentage (e.g., 1 for 1%) when adding liquidity. This controls how much price impact is tolerated before the transaction reverts.",
        "required": true
      }
    }
  },
  async (ctx: ActionContext, payload: any = {}) => {
    try {
      const result = await txApi.createTransaction(
        "meteora/dynamic/add-liquidity",
        ctx,
        payload
      );
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  }
);