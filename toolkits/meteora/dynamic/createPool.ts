import { ActionContext } from "unifai-sdk";
import { txApi, toolkit } from "../config";

toolkit.action(
  {
    action: "createDynamicPool",
    actionDescription: "Create a new Meteora Dynamic AMM Pool.",
    payloadDescription: {
      "baseMint": {
        "type": "string",
        "description": "The mint address of the base token (token A) to be used in the pool. IMPORTANT: This token CANNOT be SOL or USDC.",
        "required": true
      },
      "quoteMint": {
        "type": "string",
        "description": "The mint address of the quote token (token B). If you want to enable Alpha Vault functionality, must be SOL or USDC. Otherwise, any token is allowed.",
        "required": true
      },
      "baseAmount": {
        "type": "number",
        "description": "The amount of the base token (token A) that will be initially deposited into the pool as liquidity.",
        "required": true
      },
      "quoteAmount": {
        "type": "number",
        "description": "The amount of the quote token (token B) that will be initially deposited into the pool as liquidity.",
        "required": true
      },
      "feeBps": {
        "type": "number",
        "description": "The swap fee for trades in the pool, measured in basis points (bps), where 1 bps = 0.01%.",
        "required": true,
        "enums": [25, 30, 100, 200, 400, 600]
      },
      "activationPoint": {
        "type": "number",
        "description": "Specifies when the pool starts trading. Unix timestamp (in seconds). If omitted, the pool activates immediately.",
        "required": false,
        "default": null
      },
    }
  },
  async (ctx: ActionContext, payload: any = {}) => {
    try {
      const result = await txApi.createTransaction(
        "meteora/dynamic/create-pool",
        ctx,
        payload
      );
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  }
);