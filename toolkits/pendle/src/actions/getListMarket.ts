import { ActionContext } from "unifai-sdk";
import { getMarkets } from "../api";
import { toolkit } from "../config";
import { CHAINS } from "../consts";


toolkit.action({
  action: "retrievePendleMarketList",
  actionDescription: "Retrieve active/expired markets with key yield trading parameters including liquidity pools, APY metrics, and tokenization details (PT/YT/SY contracts). Essential for analyzing yield opportunities, liquidity positions, and expiry timelines.",
  payloadDescription: {
    chain: {
      type: "string",
      description: "EVM-compatible network identifier where the markets operate. Determines available liquidity pools and asset types.",
      required: true,
      enums: ["ethereum", "base", "bsc"],
    },
    status: {
      type: "string",
      description: "Market lifecycle filter. 'active' = tradable pre-expiry markets, 'inactive' = expired/settled markets for historical analysis.",
      required: false,
      enums: ["active", "inactive"],
      default: "active",
    },
  },
},
async (ctx: ActionContext, payload: any = {}) => {
  const chainId = CHAINS[payload.chain];
  const result = await getMarkets(chainId);
  return ctx.result(result);
});
