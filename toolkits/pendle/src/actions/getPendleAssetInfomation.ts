import { ActionContext } from "unifai-sdk";
import { getAssetPrices, getAssets, getMarkets } from "../api";
import { toolkit } from "../config";
import { CHAINS } from "../consts";


toolkit.action({
  action: "getPendleAssetInfomation",
  actionDescription: "Retrieve comprehensive metadata for all Pendle ecosystem assets including yield-bearing tokens, SY/PT/YT derivatives, and LP positions. Returns real-time market parameters, token relationships, and liquidity metrics to support yield strategy analysis.",
  payloadDescription: {
    chain: {
      type: "string",
      description: "Target blockchain network to query asset availability. Different chains host isolated markets with unique yield-bearing assets. Select network based on target investment strategy.",
      required: true,
      enums: ["ethereum", "base", "bsc"],
    },
  },
},
async (ctx: ActionContext, payload: any = {}) => {
  const chainId = CHAINS[payload.chain];
  const result = await getAssets(chainId);
  return ctx.result(result);
});
