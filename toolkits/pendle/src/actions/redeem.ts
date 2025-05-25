import * as dotenv from "dotenv";
import { ActionContext, TransactionAPI } from "unifai-sdk";
import { toolkit, txApi } from "../config";
import { getMarkets, isSupportSwapToken } from "../api";
import { CHAINS } from "../consts";
import { IsEVMAddress, redefineGasToken } from "../utils";
import { getTokenAddressBySymbol } from "@common/tokenaddress";

toolkit.action(
  {
    action: "redeem",
    actionDescription:
      "Convert SY tokens or PT and YT pairs back to yield token or base token. Two modes supported:\n" +
      "1. **PTYT Mode**: Burn PT + YT (pre-expiry) or PT-only (post-expiry) to redeem yield token or base token.\n" +
      "2. **SY Mode**: Burn SY tokens to redeem yield-bearing token or base token (e.g. stETH, aUSDC, USDC).\n" +
      "With enableAggregator=true, you can receive ANY ERC20 token directly (no separate swap needed).",
    payloadDescription: {
      chain: {
        type: "string",
        description:
          "Blockchain network identifier where the redeem operation will execute (e.g., 'ethereum', 'base'). Required to route the transaction correctly.",
        required: true,
        enums: ["ethereum", "base", "bsc"],
      },
      type: {
        type: "string",
        description:
          "Redemption type selector:\n" +
          "- **PTYT**: Redeem PT and YT (pre-expiry requires equal amounts of both) or PT-only (post-expiry).\n" +
          "- **SY**: Redeem SY tokens directly to underlying assets. No expiry restriction.",
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
        description:
          "Output asset specification. Accepted formats:\n" +
          "- **With enableAggregator=true**: ANY ERC20 token (address or symbol) can be received directly\n" +
          "- **Without aggregator**: Only yield token/base token of the market or direct address",
        required: true,
        examples: ["stETH (yield token)", "USDC (base token)", "ANY ERC20 token (with enableAggregator=true)"]
      },
      tokenIn: {
        type: "string",
        description:
          "Input asset identifier. Resolution logic varies by type:\n" +
          "- **PTYT Mode**: Market address, PT address, or YT address (system auto-resolves the pair).\n" +
          "- **SY Mode**: SY contract address.\n" +
          "Examples: '0x3124d4...' (market), '0x2a9e...deb' (PT).",
        required: true,
      },
      amountIn: {
        type: "string",
        description:
          "Amount of tokenIn to process. Must be in base units (wei for ETH, integer decimals for ERC-20). Example: For 1.5 USDC (6 decimals), input '1.5'.",
        required: true,
      },
      enableAggregator: {
        type: "boolean",
        description: "When true, allows receiving ANY ERC20 token as output (e.g., redeem PT-stETH directly to USDC without separate swapping). Routes through external DEXs to convert tokens that cannot be natively converted from/to the underlying asset. NOTE: Only applicable when tokenOut is a base token symbol or address.",
        required: false,
        default: false,
      },
    },
  },
  async (ctx: ActionContext, payload: any = {}) => {
    try {
      const { chain, type, tokenOut, tokenIn, enableAggregator } = payload;
      const chainId = CHAINS[chain];
      const markets = await getMarkets(chainId);
      let marketAddress: string = null;
      if (IsEVMAddress(tokenIn)) {
        if (type === "PTYT") {
          const market = (
            markets.find((market) => market.yt.toLowerCase() === tokenIn.toLowerCase()) ||
            markets.find((market) => market.address.toLowerCase() === tokenIn.toLowerCase())
          );
          if (market) {
            payload.yt = market.yt;
            marketAddress = market.address;
          } else {
            return ctx.result({ error: `YT token ${tokenIn} not found` });
          }
        } else {
          const market = (
            markets.find((market) => market.sy.toLowerCase() === tokenIn.toLowerCase()) ||
            markets.find((market) => market.address.toLowerCase() === tokenIn.toLowerCase())
          );
          if (market) {
            payload.sy = market.sy;
            marketAddress = market.address;
          } else {
            return ctx.result({ error: `SY token ${tokenIn} not found` });
          }
        }
      } else {
        if (type === "PTYT") {
          const market = markets.find((market) => market.name.toLowerCase() === tokenOut.toLowerCase());
          if (market) {
            payload.yt = market.yt;
            marketAddress = market.address;
          } else {
            return ctx.result({ error: `Market symbol ${tokenOut} not found` });
          }
        } else {
          const market = markets.find((market) => market.name.toLowerCase() === tokenOut.toLowerCase());
          if (market) {
            payload.sy = market.sy;
            marketAddress = market.address;
          } else {
            return ctx.result({ error: `Market symbol ${tokenOut} not found` });
          }
        }
      }
      
      const tokenOutAddress = await getTokenAddressBySymbol(tokenOut, chain);
      if (tokenOutAddress) {
        payload.tokenOut = tokenOutAddress;
      } else {
        return ctx.result({ error: `Token ${tokenOut} not found` });
      }
      
      payload.tokenOut = redefineGasToken(payload.tokenOut);

      const isSupportToken = await isSupportSwapToken(chainId, marketAddress, payload.tokenOut, "tokensOut");
      if (enableAggregator && !isSupportToken) {
        throw new Error(`Token ${payload.tokenOut} is not supported for redeem`);
      }
      
      let result: any = null;
      if (type === "PTYT") {
        result = await txApi.createTransaction("pendle/redeem", ctx, payload);
      } else {
        result = await txApi.createTransaction("pendle/redeem-sy", ctx, payload);
      }
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  }
);
