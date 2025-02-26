import { ActionContext } from "unifai-sdk";
import { txApi, toolkit } from "../config";

toolkit.action(
  {
    action: "createCustomizableDynamicAmmPool",
    actionDescription: "Create a new Meteora Dynamic AMM liquidity pool (NOT DLMM pool) with customizable parameters.",
    payloadDescription: {
      "baseMint": {
        "type": "string",
        "description": "The mint address of the base token (token A) to be used in the pool. IMPORTANT: This token CANNOT be SOL or USDC.",
        "required": true
      },
      "quoteMint": {
        "type": "string",
        "description": "The mint address of the quote token (token B). If 'hasAlphaVault' is true, this MUST be either SOL or USDC. Otherwise, any token is allowed.",
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
        "description": "The swap fee for trades in the pool, measured in basis points (bps), where 1 bps = 0.01%. Valid values: 25, 30, 100, 200, 400, 600.",
        "required": true
      },
      "activationType": {
        "type": "number",
        "description": "Defines how the pool activation is triggered: 0 for slot-based activation, 1 for timestamp-based activation. If omitted, the default is 1 (timestamp-based).",
        "required": false,
        "default": 1
      },
      "activationPoint": {
        "type": "number",
        "description": "Specifies when the pool starts trading. If 'activationType' is 0, this represents a slot number. If 'activationType' is 1, this represents a Unix timestamp. If omitted, the pool activates immediately.",
        "required": false,
        "default": null
      },
      "hasAlphaVault": {
        "type": "boolean",
        "description": "Indicates whether Alpha Vault features are enabled. If true, 'quoteMint' MUST be SOL or USDC, unlocking additional vault functionalities.",
        "required": false,
        "default": false
      }
    }
  },
  async (ctx: ActionContext, payload: any = {}) => {
    try {
      const result = await txApi.createTransaction(
        "meteora/dynamic/create-customizable-pool",
        ctx,
        payload
      );
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  }
);