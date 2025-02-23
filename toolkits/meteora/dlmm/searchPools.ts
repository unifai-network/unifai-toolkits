import { ActionContext } from "unifai-sdk";
import { toolkit } from "../config";
import { MeteoraDlmmAPI } from "./api";

toolkit.action(
  {
    action: "searchDlmmPools",
    actionDescription: "Search for launched Meteora DLMM pools using query parameters. Returns liquidity pool (LB) pairs with details grouped by token pairs, including base token mint (mint x), quote token mint (mint y), reserves, bin step, current price, trading volume, and fees. You should use mints or pairs filters if you want to search pools with specific tokens.",
    payloadDescription: {
      "page": {
        "type": "number",
        "required": true,
        "description": "The page index for pagination, starting from 0."
      },
      "limit": {
        "type": "number",
        "required": true,
        "description": "The maximum number of results per page. Example: 10."
      },
      "skip_size": {
        "type": "number",
        "required": false,
        "default": 0,
        "description": "The number of results to skip before starting to return data."
      },
      "include_token_mints": {
        "type": "string",
        "required": false,
        "default": null,
        "description": "Filter results to only include pools containing the specified token mint."
      },
      "include_pool_token_pairs": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "required": false,
        "default": [],
        "description": "Filter results to only include specific pool token pairs. Provide an array of token pair mint addresses in the format: '<TOKEN_MINT_1>-<TOKEN_MINT_2>'. Example: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v-So11111111111111111111111111111111111111112'."
      },
      "hide_low_tvl": {
        "type": "number",
        "required": false,
        "default": null,
        "description": "Exclude pools with a total value locked (TVL) below the specified threshold. If omitted, no filtering is applied."
      },
      "hide_low_apr": {
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "If true, filters out pools with low annual percentage rate (APR)."
      }
    }
  },
  async (ctx: ActionContext, payload: any = {}) => {
    try {
      const api = new MeteoraDlmmAPI();
      const result = await api.searchPools(payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to find pools: ${error}` });
    }
  }
)
