import { ActionContext } from "unifai-sdk";
import { toolkit } from "../config";
import { MeteoraDlmmAPI } from "./api";

toolkit.action(
  {
    action: "getDlmmPool",
    actionDescription: "Retrieve detailed information about a Meteora DLMM liquidity pool (NOT Dynamic AMM pool), including base token mint (mint x), quote token mint (mint y), reserves, bin step, current price, trading volume, and fees.",
    payloadDescription: {
      "lbPair": {
        "type": "string",
        "required": true,
        "description": "The unique address of the Meteora DLMM liquidity pool to query."
      }
    }
  },
  async (ctx: ActionContext, payload: any = {}) => {
    try {
      const api = new MeteoraDlmmAPI();
      const result = await api.getPool(payload.lbPair);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to get pool infomation: ${error}` });
    }
  }
)
