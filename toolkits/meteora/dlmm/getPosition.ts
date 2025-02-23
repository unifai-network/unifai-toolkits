import { ActionContext } from "unifai-sdk";
import { toolkit } from "../config";
import { MeteoraDlmmAPI } from "./api";

toolkit.action(
  {
    action: "getDlmmPoolPosition",
    actionDescription: "Retrieve details about a specific position in a Meteora DLMM liquidity pool. Includes information such as the owner address, pool address (LB pair), fees, and rewards.",
    payloadDescription: {
      "position": {
        "type": "string",
        "required": true,
        "description": "The unique address of the liquidity pool position to query."
      }
    }
  },
  async (ctx: ActionContext, payload: any = {}) => {
    try {
      const api = new MeteoraDlmmAPI();
      const result = await api.getPosition(payload.position);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to get position infomation: ${error}` });
    }
  }
)
