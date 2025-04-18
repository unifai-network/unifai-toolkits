import * as dotenv from "dotenv";
import { ActionContext, TransactionAPI } from "unifai-sdk";
import { toolkit, txApi } from "../config";
import { getMarkets } from "../api";
import { CHAINS } from "../consts";
import { IsEVMAddress, redefineGasToken } from "../utils";
import { getTokenAddressBySymbol } from "@common/tokenaddress";

toolkit.action(
  {
    action: "swap",
    actionDescription: 
      "Swap between tokens(base token or yield token or Pendle SY token) and Pendle market token(PT/YT). Only callable until the market's expiry.Swapping between PT and YT is not supported. two modes:\n" +
      "1. **Native Swap**: Directly trade SY/PT/YT/underlying assets within the specified Pendle market pool.\n" +
      "2. **Aggregated Swap**: Route through external DEXs (e.g. Uniswap, 1inch) when tokens cannot be natively converted within the Pendle market. Combines Pendle AMM and external liquidity.",
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
          "Enable cross-protocol token routing via external DEXs. Use cases:\n" +
          "- Swapping between non-native pairs (e.g. YT to DAI)\n" +
          "- Optimizing prices by combining Pendle liquidity with external pools\n" +
          "Default: false (pure Pendle-native swaps)",
        required: false,
        default: false
      },
      tokenIn: {
        type: "string",
        description: 
          "Input token identifier. Accepted values:\n" +
          "- **Pendle-native**: SY/PT/YT address from the `market`\n" +
          "- **Underlying asset**: Address (e.g. 'stETH', '0x...')\n" +
          "- **External token**: Address/symbol (requires enableAggregator=true)\n",
        required: true,
        examples: ["0x83...913 (SY)", "0x2a...deb (PT)", "0x32...d9e (YT)", "USDC or 0x2a...deb (base token symbol)"],
      },
      tokenOut: {
        type: "string",
        description: 
          "Output token identifier. Must form a valid path with tokenIn:\n" +
          "- **Native path**: SY/PT/YT/underlying address (within market)\n" +
          "- **Aggregated path**: Any ERC-20 address/symbol (if enableAggregator=true)\n",
        required: true,
        examples: ["0x83...913 (SY)", "0x2a...deb (PT)", "0x32...d9e (YT)", "USDC or 0x2a...deb (base token symbol)"],
      },
      amountIn: {
        type: "string",
        description:
          "Amount of tokenIn to process. Must be in base units (wei for ETH, integer decimals for ERC-20). Example: For 1.5 USDC (6 decimals), input '1.5'.",
        required: true,
      }
    }
  },
  async (ctx: ActionContext, payload: any = {}) => {
    try {
      const { chain, market, tokenIn, tokenOut } = payload;
      const chainId = CHAINS[chain];
      const markets = await getMarkets(chainId);
      if(!markets.find(m => m.address.toLowerCase() === market.toLowerCase())) {
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
      
      const result = await txApi.createTransaction("pendle/swap", ctx, payload);
      
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  }
);
