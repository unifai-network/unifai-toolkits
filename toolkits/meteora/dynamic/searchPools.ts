import { ActionContext } from "unifai-sdk";
import { toolkit } from "../config";
import { MeteoraDynamicAPI } from "./api";

toolkit.action(
  {
    action: "searchDynamicAmmPools",
    actionDescription: "Search for launched Meteora Dynamic AMM liquidity pools (NOT DLMM pools) using query parameters. The results include detailed information about each liquidity pool, such as the pool address, base token mint (mint A), quote token mint (mint B), LP mint, trading volume, and fees. To filter pools by specific tokens, use 'include_pool_token_pairs' or 'include_token_mints'.",
    payloadDescription: {
      "page": {
        "type": "number",
        "required": true,
        "description": "The page index for pagination, starting from 0."
      },
      "size": {
        "type": "number",
        "required": true,
        "description": "The maximum number of results per page. Example: 10."
      },
      "sort_key": {
        "type": "string",
        "required": false,
        "description": "The key used to sort the results. Options include 'tvl' (total value locked), 'volume' (trading volume), and 'fee_tvl_ratio' (fee-to-TVL ratio).",
        "enums": ["tvl", "volume", "fee_tvl_ratio"],
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
        "description": "Exclude pools with a total value locked (TVL) below the specified threshold. If omitted, no filtering is applied. When 'sort_key' is set to 'feetvlratio', you should set 'fee_tvl_ratio' to a reasonable value (e.g., 100,000) to avoid including pools with zero TVL, which could distort the ranking."
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
      const api = new MeteoraDynamicAPI();
      const result = await api.searchPools(payload);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to find pools: ${error}` });
    }
  }
)
