import { ActionContext } from "unifai-sdk";
import { txApi, toolkit } from "../config";

toolkit.action(
  {
    action: "createDlmmPool",
    actionDescription: "Create a new Meteora DLMM liquidity pool (NOT Dynamic AMM pool).",
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
        "enums": [1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 40, 60, 80, 100, 200, 500]
      },
      "binStep": {
        "type": "number",
        "description": "Determines price granularity by setting the basis point difference between consecutive price bins. IMPORTANT: Must be selected based on the feeBps parameter from following feeBps2binStepEnumsMap. Design your liquidity distribution using the ILM tool at ilm.jup.ag",
        "required": true,
        "feeBps2binStepEnumsMap": {
          "1": [1, 5, 8, 10, 16, 80, 100],
          "2": [2, 5, 10, 80],
          "3": [2, 5, 10, 16, 80],
          "4": [4, 5, 10, 80, 100],
          "5": [8, 50, 80, 100],
          "10": [10, 50, 80, 100],
          "15": [15, 75, 80, 100],
          "20": [20, 80, 100, 125],
          "25": [25, 80, 100, 125, 200],
          "30": [30, 50, 100, 150, 200],
          "40": [50, 100, 160, 200, 400],
          "60": [80, 100],
          "80": [80, 100, 160, 200],
          "100": [80, 100, 125, 200, 250, 400],
          "200": [100, 200, 250, 400],
          "500": [80, 100, 125, 250, 400]
        }
      },
      "initialPrice": {
        "type": "number",
        "description": "Initial token price at launch. Works with the liquidity distribution curve designed using the ILM tool.",
        "required": true
      },
    },
  },
  async (ctx: ActionContext, payload: any = {}) => {
    try {
      const result = await txApi.createTransaction(
        "meteora/dlmm/create-pool",
        ctx,
        payload
      );
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  }
);
