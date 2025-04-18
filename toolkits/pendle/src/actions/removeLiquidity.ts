import * as dotenv from "dotenv";
import { ActionContext, TransactionAPI } from "unifai-sdk";
import { toolkit, txApi } from "../config";
import { getAssetPrices, getAssets, getMarkets } from "../api";
import { CHAINS } from "../consts";
import { IsEVMAddress, redefineGasToken } from "../utils";
import { getTokenAddressBySymbol } from "@common/tokenaddress";

toolkit.action(
  {
    action: "removeLiquidity",
    actionDescription:
      "Remove liquidity from PT trading markets through single or dual asset withdrawals. Yield rights holders can redeem their yield rights for base tokens.",
    payloadDescription: {
      chain: {
        type: "string",
        description:
          "Blockchain network where liquidity is added. Must match the chain of target markets. Supported: 'ethereum' (Mainnet), 'base', 'bsc'.",
        required: true,
        enums: ["ethereum", "base", "bsc"],
      },
      type: {
        type: "string",
        description:
          "Liquidity provision mode:\n" +
          "- **single**: Single-sided liquidity removal, get back either tokens or PT, callable regardless of the market's expiry.\n" +
          "- **dual**: Dual liquidity provision, using both tokens and PT. Only callable until market's expiry.",
        required: true,
        enums: ["single", "dual"],
      },
      marketAddress: {
        type: "string",
        description:
          "Target market identifier for liquidity removal. Accepts one resolution format:\n" +
          "1. **Direct Market Address**: '0x3124d4...ef1' (preferred for deterministic routing)",
        required: true,
        examples: ["0x3124d41708edbdc... (Market Address)"],
      },
      slippage: {
        type: "number",
        description:
          "Maximum acceptable price impact (0-1 decimal). Critical for single-sided deposits. Dual deposits may ignore due to balanced provisioning.\n" +
          "Example: 0.01 = 1% tolerance. ZPI mode overrides this parameter.",
        required: false,
        default: 0.05,
      },
      tokenOut: {
        type: "string",
        description: "Token to withdraw from the market. Must be a valid token address or a valid token symbol.",
        required: true,
        examples: ["0x83...913 (SY)", "USDC (base token symbol)"],
      },
      amountOut: {
        type: "string",
        description:
          "Input amount in tokenIn's **native decimals** (integer string). For dual mode, this represents base/SY amount.\n" +
          "Examples: '0.1' (1 USDC with 6 decimals)",
        required: true,
      },
      enableAggregator: {
        type: "boolean",
        description: "Only need when tokenOut is base token symbol or address and type is single, this option enable swap aggregator to swap between tokens that cannot be natively converted from/to the underlying asset",
        required: false,
        default: false,
      },
    },
  },
  async (ctx: ActionContext, payload: any = {}) => {
    try {
      const { chain, type, marketAddress, tokenOut, amountOut } = payload;
      const chainId = CHAINS[chain];
      if (!chainId) {
        throw new Error(`Invalid chain: ${chain}`);
      }
      if (!IsEVMAddress(tokenOut)) {
        const tokenOutAddress = await getTokenAddressBySymbol(chain, tokenOut);
        if (!tokenOutAddress) {
          throw new Error(`Token ${tokenOut} not found`);
        }
        payload.tokenOut = tokenOutAddress;
      }
      const prices = await getAssetPrices(chainId, [marketAddress, payload.tokenOut]);
      if (!(tokenOut.toLowerCase() in prices)) {
        throw new Error(`Token ${tokenOut} not found`);
      }
      if (!(marketAddress.toLowerCase() in prices)) {
        throw new Error(`Market ${marketAddress} not found`);
      }
      const priceOfTokenOut = prices[tokenOut.toLowerCase()];
      const priceOfPT = prices[marketAddress.toLowerCase()];

      payload.amountIn = ((amountOut * priceOfTokenOut) / priceOfPT).toFixed(18);
      payload.tokenOut = redefineGasToken(payload.tokenOut);
      let result: any = null;
      if (type === "dual") {
        result = await txApi.createTransaction("pendle/remove-liquidity-dual", ctx, payload);
      } else {
        result = await txApi.createTransaction("pendle/remove-liquidity", ctx, payload);
      }
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  }
);
