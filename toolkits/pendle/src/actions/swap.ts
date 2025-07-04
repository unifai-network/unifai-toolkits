import * as dotenv from "dotenv";
import { ActionContext, TransactionAPI } from "unifai-sdk";
import { toolkit, txApi } from "../config";
import { getMarkets, getMarketTokens, isSupportSwapToken } from "../api";
import { CHAINS } from "../consts";
import { IsEVMAddress, redefineGasToken } from "../utils";
import { getTokenAddressBySymbol } from "@common/tokenaddress";

toolkit.action(
  {
    action: "swap",
    actionDescription: 
      "Swap between tokens(base token or yield token or Pendle SY token) and Pendle market token(PT/YT). Only callable until the market's expiry. Swapping between PT and YT is not supported. Two modes:\n" +
      "1. **Native Swap**: Directly trade SY/PT/YT/underlying assets within the specified Pendle market pool.\n"+
      "2. type: 'sell' or 'buy', sell SY/PT/YT to underlying asset, buy SY/PT/YT from underlying asset",
    payloadDescription: {
      chain: {
        type: "string",
        description: 
          "Blockchain network where the swap executes. Must match the chain of the `market`. Supported: 'ethereum', 'base', 'bsc'.",
        required: true,
        enums: ["ethereum", "base", "bsc"]
      },
      slippage: {
        type: "number",
        description: 
          "Maximum acceptable price impact (0-1 decimal). Applies to:\n" +
          "- Native Pendle swaps (e.g. PT to YT)\n" +
          "- Aggregator routing segments (if enabled)\n" +
          "Example: 0.01 = 1% tolerance. Higher values improve success rate for cross-protocol swaps.",
        required: false,
        default: 0.05
      },
      market: {
        type: "string",
        description: 
          "Pendle market address **defining the primary liquidity pool** for the swap. Required even when using aggregators, as it determines initial token conversion logic (e.g. SY to PT).",
        required: true
      },
      enableAggregator: {
        type: "boolean",
        description: 
          "When true, allows swapping ANY ERC20 token to SY/PT/YT in a single transaction. Key benefits:\n" +
          "- Eliminates the need for separate swap transactions (e.g., swap USDC directly to PT-stETH)\n" +
          "- Handles tokens not natively supported by Pendle markets\n" +
          "- Optimizes prices by combining Pendle liquidity with external DEXs",
        required: false,
        default: true,
      },
      tokenIn: {
        type: "string",
        description: 
          "Input token identifier. Accepted values:\n" +
          "- **With enableAggregator=true**: ANY ERC20 token (address or symbol) can be used\n",
        required: true,
        examples: ["0x83...913 (SY)", "0x2a...deb (PT)", "0x32...d9e (YT)", "USDC (base token symbol)", "ANY ERC20 token (with enableAggregator=true)"],
      },
      tokenOut: {
        type: "string",
        description: 
          "Output token identifier. Accepted values:\n" +
          "- **With enableAggregator=true**: ANY ERC20 token (address or symbol) can be received\n",
        required: true,
        examples: ["0x83...913 (SY)", "0x2a...deb (PT)", "0x32...d9e (YT)", "USDC (base token symbol)", "ANY ERC20 token (with enableAggregator=true)"],
      },
      amountIn: {
        type: "string",
        description:
          "Amount of tokenIn to process. Must be in base units (wei for ETH, integer decimals for ERC-20). Example: For 1.5 USDC (6 decimals), input '1.5'.",
        required: true,
      },
      type: {
        type: "string",
        description: "specify the type of swap, 'sell' or 'buy', sell SY/PT/YT to underlying asset, buy SY/PT/YT from underlying asset",
        required: true,
        enums: ["sell", "buy"]
      }
    }
  },
  async (ctx: ActionContext, payload: any = {}) => {
    try {
      const { chain, market, tokenIn, tokenOut, enableAggregator, type } = payload;
      const chainId = CHAINS[chain];
      const markets = await getMarkets(chainId);
      const marketInfo = markets.find(m => m.address.toLowerCase() === market.toLowerCase());
      if(!marketInfo) {
        throw new Error(`Market ${market} not found on ${chain} network`);
      }

      

      if(!IsEVMAddress(tokenIn)) {
        // try to get address from market data
        const tokenInAddress = markets.find(m => m.name.toLowerCase() === tokenIn.toLowerCase())?.underlyingAsset ||(await getTokenAddressBySymbol(tokenIn, chain));
        if(!tokenInAddress) {
          throw new Error(`Token ${tokenIn} not found in market data or on ${chain} network`);
        }
        payload.tokenIn = tokenInAddress;
      }

      if(!IsEVMAddress(tokenOut)) {
        // try to get address from market data
        const tokenOutAddress = markets.find(m => m.name.toLowerCase() === tokenOut.toLowerCase())?.underlyingAsset ||(await getTokenAddressBySymbol(tokenOut, chain));
        if(!tokenOutAddress) {
          throw new Error(`Token ${tokenOut} not found in market data or on ${chain} network`);
        }
        payload.tokenOut = tokenOutAddress;
      }

      payload.tokenIn = redefineGasToken(payload.tokenIn);
      payload.tokenOut = redefineGasToken(payload.tokenOut);

      if(type === "sell") {
        // tokenIn must be SY/PT/YT
        if(!(marketInfo.pt.toLowerCase() === payload.tokenIn.toLowerCase() || marketInfo.yt.toLowerCase() === payload.tokenIn.toLowerCase() || marketInfo.sy.toLowerCase() === payload.tokenIn.toLowerCase())) {
          throw new Error(`TokenIn ${tokenIn} isn't SY/PT/YT in market ${market}`);
        }
        const isSupportTokenOut = await isSupportSwapToken(chainId, market, payload.tokenOut, "tokensOut");
        if(!isSupportTokenOut) {
          throw new Error(`TokenOut ${tokenOut} isn't supported for swap`);
        }
      }else if(type === "buy") {
        // tokenOut must be SY/PT/YT
        if(!(marketInfo.pt.toLowerCase() === payload.tokenOut.toLowerCase() || marketInfo.yt.toLowerCase() === payload.tokenOut.toLowerCase() || marketInfo.sy.toLowerCase() === payload.tokenOut.toLowerCase())) {
          throw new Error(`TokenOut ${tokenOut} isn't SY/PT/YT in market ${market}`);
        }
        const isSupportTokenIn = await isSupportSwapToken(chainId, market, payload.tokenIn, "tokensIn");
        if(!isSupportTokenIn) {
          throw new Error(`TokenIn ${tokenIn} isn't supported for swap`);
        }
      }else {
        throw new Error(`Invalid type: ${type}, need to be 'sell' or 'buy'`);
      }
      
      const result = await txApi.createTransaction("pendle/swap", ctx, payload);
      
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  }
);
