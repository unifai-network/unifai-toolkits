import { ActionContext } from "unifai-sdk";
import { txApi, toolkit } from "../config";

toolkit.action(
  {
    action: "claimFromMultiplePositions",
    actionDescription: "Claim any accumulated trading fees and protocol rewards from multiple user positions in Meteora DLMM liquidity pools, without modifying or removing the positions.",
    payloadDescription: {
      "positions": {
        "type": "array",
        "description": "An array of position objects to claim from. Each object should contain lbPair and position addresses.",
        "required": true,
        "items": {
          "type": "object",
          "properties": {
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
        }
      }
    }
  },
  async (ctx: ActionContext, payload: any = {}) => {
    try {
      // Validate input
      if (!payload.positions || !Array.isArray(payload.positions) || payload.positions.length === 0) {
        return ctx.result({ error: "positions array is required and must contain at least one position" });
      }

      // Validate each position object
      for (let i = 0; i < payload.positions.length; i++) {
        const position = payload.positions[i];
        if (!position.lbPair || !position.position) {
          return ctx.result({ 
            error: `Position at index ${i} is missing required fields: lbPair and position are required` 
          });
        }
      }

      const result = await txApi.createTransaction(
        "meteora/dlmm/claim-from-multiple-positions",
        ctx,
        {
          positions: payload.positions
        }
      );
      
      return ctx.result({
        ...result,
        message: `Successfully claimed from ${payload.positions.length} positions`,
        processedPositions: payload.positions.length
      });
    } catch (error) {
      return ctx.result({ error: `Failed to create batch claim transaction: ${error}` });
    }
  }
);