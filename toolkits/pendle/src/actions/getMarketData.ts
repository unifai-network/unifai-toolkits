import { ActionContext } from "unifai-sdk";
import { getMarketData, getMarkets } from "../api";
import { toolkit } from "../config";
import { CHAINS } from "../consts";


toolkit.action({
  action: "retrievePendleMarketDataByAddress",
  actionDescription: "Retrieve market data by address and chain, including liquidity, trading volume, underlying apy, implied apy, yt floating apy, and more apy data, and more data about the market",
  payloadDescription: {
    chain: {
      type: "string",
      description: "EVM-compatible network identifier where the markets operate. Determines available liquidity pools and asset types.",
      required: true,
      enums: ["ethereum", "base", "bsc", "hyperEVM"],
    },
    address: {
      type: "string",
      description: "The address of the market",
      required: true,
    },
  },
},
async (ctx: ActionContext, payload: any = {}) => {
  const { chain, address } = payload;
  const chainId = CHAINS[chain];
  try {
    const result = await getMarketData(chainId, address);
    return ctx.result(result);
  } catch (error) {
    return ctx.result({
      error: error.message,
    });
  }
});
