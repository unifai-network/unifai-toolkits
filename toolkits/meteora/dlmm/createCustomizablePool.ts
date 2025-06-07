import { ActionContext } from "unifai-sdk";
import { txApi, toolkit } from "../config";

toolkit.action(
  {
    action: "createCustomizableDlmmPool",
    actionDescription: "Create a new Meteora DLMM liquidity pool (NOT Dynamic AMM pool) with customizable parameters.",
    payloadDescription: {
      "baseMint": {
        "type": "string",
        "description": "Base token (token x) mint address. IMPORTANT: Cannot be SOL or USDC.",
        "required": true
      },
      "quoteMint": {
        "type": "string",
        "description": "Quote token (token y) mint address. If you want to enable Alpha Vault functionality, must be SOL or USDC. No restrictions otherwise.",
        "required": true
      },
      "feeBps": {
        "type": "number",
        "description": "Base swap fee in basis points (1 bps = 0.01%).",
        "required": true,
      },
      "binStep": {
        "type": "number",
        "description": "Determines price granularity by setting the basis point difference between consecutive price bins. Design your liquidity distribution using the ILM tool at ilm.jup.ag",
        "required": true,
      },
      "initialPrice": {
        "type": "number",
        "description": "Initial token price at launch. Works with the liquidity distribution curve designed using the ILM tool.",
        "required": true
      },
      "activationType": {
        "type": "number",
        "description": "Pool activation mechanism: 0 for slot-based activation, 1 for timestamp-based activation.",
        "required": false,
        "default": 1
      },
      "activationPoint": {
        "type": "number",
        "description": "When the pool starts trading: slot number for activationType 0, Unix timestamp (in seconds) for activationType 1.",
        "required": false,
        "default": null
      },
      "hasAlphaVault": {
        "type": "boolean",
        "description": "Enable Alpha Vault features. If true, quoteMint MUST be SOL or USDC. Enables additional vault functionality.",
        "required": false,
        "default": false
      }
    },
  },
  async (ctx: ActionContext, payload: any = {}) => {
    try {
      const result = await txApi.createTransaction(
        "meteora/dlmm/create-customizable-pool",
        ctx,
        payload
      );
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  }
);