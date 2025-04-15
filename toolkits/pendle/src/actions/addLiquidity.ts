import * as dotenv from "dotenv";
import { ActionContext, TransactionAPI } from "unifai-sdk";
import { toolkit, txApi } from "../config";
import { getMarkets } from "../api";
import { CHAINS } from "../consts";
import { IsEVMAddress } from "../utils";
import { getTokenAddressBySymbol } from "@common/tokenaddress";

toolkit.action(
  {
    action: "addLiquidity",
    actionDescription:
      "Provide liquidity to PT trading markets through single or dual asset deposits. Liquidity providers earn trading fees while enabling price discovery for Principal Tokens (PT) based on yield expectations.",
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
          "- **single**: Single-sided deposit using SY, base tokens (e.g. USDC) or PT. Higher price impact risk.\n" +
          "- **dual**: Dual-token deposit requiring both base/SY + PT. Maintains pool balance with lower slippage.",
        required: true,
        enums: ["single", "dual"],
        conditionalLogic: {
          single: "Supports ZPI mode for slippage-free deposits (receives LP + YT)",
          dual: "Requires precise base/SY and PT ratio matching pool composition",
        },
      },
      marketAddress: {
        type: "string",
        description:
          "Target market identifier for liquidity provisioning. Accepts one resolution format:\n" +
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
      tokenIn: {
        type: "string",
        description:
          "Primary input asset identifier. Resolution varies by type:\n" +
          "- **single**: Can be SY (e.g. SY_stETH), base token (e.g. USDC), or PT address. ZPI mode only accepts SY/base tokens.\n" +
          "- **dual**: Must be base token (e.g. USDC) or SY address. PT is auto-bound to the market.",
        required: true,
        examples: ["0x83...913 (SY)", "USDC (base token symbol)", "0x2a9e...deb (PT - single mode only)"],
      },
      amountIn: {
        type: "string",
        description:
          "Input amount in tokenIn's **native decimals** (integer string). For dual mode, this represents base/SY amount.\n" +
          "Examples:\n" +
          "- Single mode: '1' (1 USDC with 6 decimals)\n" +
          "- Dual mode: '0.5' (0.5 SY with 6 decimals)",
        required: true,
      },
      amountPtIn: {
        type: "string",
        description:
          "[Dual mode required] PT amount to pair with base/SY. Must maintain pool's current PT/base ratio within slippage tolerance.\n" +
          "Example: If pool ratio is 1:1 (PT:SY), amountIn='1' (1 SY) requires amountPtIn='1' (1 PT).",
        required: false,
      },
      zpi: {
        type: "boolean",
        description:
          "[Single mode only] Zero Price Impact mode. Directly mints LP tokens at oracle price without swapping, receiving:\n" +
          "- Reduced LP amount (vs normal mode)\n" +
          "- Proportional YT tokens (yield rights)\n" +
          "Tradeoff: Lower capital efficiency but guaranteed no slippage.",
        required: false,
        default: false,
      },
    },
  },
  async (ctx: ActionContext, payload: any = {}) => {
    try {
      const { chain, type, marketAddress, tokenIn, amountIn } = payload;
      const chainId = CHAINS[chain];
      if (!chainId) {
        throw new Error(`Invalid chain: ${chain}`);
      }
      const markets = await getMarkets(chainId);
      const market = markets.find((market) => market.address.toLocaleLowerCase() === marketAddress.toLocaleLowerCase());
      if (!market) {
        throw new Error(`Market ${marketAddress} not found`);
      }

      if (!IsEVMAddress(tokenIn)) {
        const tokenInAddress = await getTokenAddressBySymbol(chain, tokenIn);
        if (!tokenInAddress) {
          throw new Error(`Token ${tokenIn} not found`);
        }
        payload.tokenIn = tokenInAddress;
      }else {
        const tokenInAddress = await getTokenAddressBySymbol(chain, tokenIn);
        if (!tokenInAddress) {
          throw new Error(`Token ${tokenIn} not found`);
        }
        payload.tokenIn = tokenInAddress;
      }
      let result: any = null;
      if (type === "dual") {
        payload.amountTokenIn = amountIn;
        result = await txApi.createTransaction("pendle/add-liquidity-dual", ctx, payload);
      } else {
        result = await txApi.createTransaction("pendle/add-liquidity", ctx, payload);
      }
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to create transaction: ${error}` });
    }
  }
);
