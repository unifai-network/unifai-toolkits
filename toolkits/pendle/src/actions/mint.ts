import * as dotenv from "dotenv";
import { ActionContext, TransactionAPI } from "unifai-sdk";
import { toolkit, txApi } from "../config";
import { getMarkets } from "../api";
import { CHAINS } from "../consts";
import { IsEVMAddress, redefineGasToken } from "../utils";
import { getTokenAddressBySymbol } from "@common/tokenaddress";

toolkit.action(
  {
    action: "mint",
    actionDescription:
      "Use yield-bearing assets or base token to mint SY tokens or mint Principal Tokens (PT) and Yield Tokens (YT). This enables yield decomposition and flexible management of principal vs future income streams.",
    payloadDescription: {
      chain: {
        type: "string",
        description:
          "Blockchain network identifier where the mint operation will execute (e.g., 'ethereum', 'arbitrum'). Required to route the transaction correctly.",
        required: true,
        enums: ["ethereum", "base", "bsc"],
      },
      type: {
        type: "string",
        description: "PTYT mean that Mint PT & YT, using tokens. Only callable until YT's expiry. SY mean Mint SY, using tokens",
        required: true,
        enums: ["PTYT", "SY"],
      },
      slippage: {
        type: "number",
        description:
          "Maximum acceptable price impact tolerance (0-1 scale). For example: 0.01 = 1% slippage. Critical for protecting against market volatility during SY/PT/YT conversions.",
        required: false,
        default: 0.05,
      },
      tokenOut: {
        type: "string",
        description: "transfer target token, it can be (sy, pt or yt) address, or market address, or Yield Token symbol",
        required: true,
      },
      tokenIn: {
        type: "string",
        description:
          "Input asset identifier. Accepts three types: 1) Yield-bearing assets (e.g. stETH, aUSDC), 2) Standardized Yield Tokens (SY contract address), 3) Base tokens (e.g. USDC, USDT, ETH/WETH). Can be provided as: symbol (case-sensitive), contract address, or common ticker.",
        required: true,
        examples: ["stETH (yield-bearing)", "0x83...913 (SY contract)", "USDC (base token)", "ETH (native token)"],
      },
      amountIn: {
        type: "string",
        description:
          "Amount of tokenIn to process. Must be in base units (wei for ETH, integer decimals for ERC-20). Example: For 1.5 USDC (6 decimals), input '1.5'.",
        required: true,
      },
      enableAggregator: {
        type: "boolean",
        description: "Only need when tokenIn is base token symbol, this option enable swap aggregator to swap between tokens that cannot be natively converted from/to the underlying asset",
        required: false,
        default: false,
      },
    },
  },
  async (ctx: ActionContext, payload: any = {}) => {
    try {
      const { chain, type, tokenOut, tokenIn } = payload;
      const chainId = CHAINS[chain];
      const markets = await getMarkets(chainId);
      if(IsEVMAddress(tokenOut)) {
        if(type === "PTYT") {
          const ytToken = (markets.find(market => market.yt.toLowerCase() === tokenOut.toLowerCase()) ||
                          markets.find(market => market.address.toLowerCase() === tokenOut.toLowerCase()))?.yt;
          if(ytToken) {
            payload.yt = ytToken;
          }else {
            return ctx.result({ error: `YT token ${tokenOut} not found` });
          }
        }else {
          const syToken = (markets.find(market => market.sy.toLowerCase() === tokenOut.toLowerCase()) ||
                          markets.find(market => market.address.toLowerCase() === tokenOut.toLowerCase()))?.sy;
          if(syToken) {
            payload.sy = syToken;
          }else {
            return ctx.result({ error: `SY token ${tokenOut} not found` });
          }
        }
      }else {
        if(type === "PTYT") {
          const market = markets.find(market => market.name.toLowerCase() === tokenOut.toLowerCase());
          if(market) {
            payload.yt = market.yt;
          }else {
            return ctx.result({ error: `Market symbol ${tokenOut} not found` });
          }
        }else {
          const market = markets.find(market => market.name.toLowerCase() === tokenOut.toLowerCase());
          if(market) {
            payload.sy = market.sy;
          }else {
            return ctx.result({ error: `Market symbol ${tokenOut} not found` });
          }
        }
      }
      
      payload.tokenIn = redefineGasToken(payload.tokenIn);

      let result: any = null;
      if(type === "PTYT") {
        result = await txApi.createTransaction("pendle/mint", ctx, payload);
      }else {
        result = await txApi.createTransaction("pendle/mint-sy", ctx, payload);
      }
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  }
);
