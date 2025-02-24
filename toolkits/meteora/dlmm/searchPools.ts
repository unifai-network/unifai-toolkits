import { ActionContext } from "unifai-sdk";
import { toolkit } from "../config";
import { MeteoraDlmmAPI } from "./api";

toolkit.action(
  {
    action: "searchDlmmPools",
    actionDescription: "Search for launched Meteora DLMM pools using query parameters. Returns liquidity pool (LB) pairs with details grouped by token pairs, including base token mint (mint x), quote token mint (mint y), reserves, bin step, current price, trading volume, and fees. You should use include_pool_token_pairs or include_token_mints if you want to search pools with specific tokens.",
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
      "sort_key": {
        "type": "string",
        "required": false,
        "description": "The key used to sort the results. Options include 'tvl' (total value locked), 'volume' (trading volume), and 'feetvlratio' (fee-to-TVL ratio).",
        "enums": ["tvl", "volume", "feetvlratio"],
        "default": "volume"
      },
      "order_by": {
        "type": "string",
        "required": false,
        "description": "The sorting order of the results. Use 'asc' for ascending order or 'desc' for descending order.",
        "enums": ["asc", "desc"],
        "default": "desc"
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
      "include_token_mints": {
        "type": "string",
        "required": false,
        "default": null,
        "description": "Filter results to only include pools containing the specified token mint. Since SOL and USDC pools are the most common, if other tokens are available in the search conditions, prioritize using them instead."
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
