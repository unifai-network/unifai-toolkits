import { ActionContext } from "unifai-sdk";
import { connection, toolkit } from "../config";
import { PublicKey } from "@solana/web3.js";
import AmmImpl from "@mercurial-finance/dynamic-amm-sdk";

toolkit.action(
  {
    action: "getDynamicPool",
    actionDescription: "Retrieves detailed information about a Meteora Dynamic AMM liquidity pool, including base token mint (mint A), quote token mint (mint B), reserves, LP supply, fees, and virtual price.",
    payloadDescription: {
      "poolAddress": {
        "type": "string",
        "description": "The address of the Meteora Dynamic AMM liquidity pool to query. This must be a valid pool address on Solana.",
        "required": true
      }
    }
  },
  async (ctx: ActionContext, payload: any = {}) => {
    try {
      const amm = await AmmImpl.create(connection, new PublicKey(payload.poolAddress));

      return ctx.result({
        poolAddress: amm.address.toString(),
        baseMint: amm.tokenAMint.address.toString(),
        quoteMint: amm.tokenBMint.address.toString(),
        baseDecimals: amm.tokenAMint.decimals.toString(),
        quoteDecimals: amm.tokenBMint.decimals.toString(),
        baseReserve: amm.vaultA.vaultPda.toString(),
        quoteReserve: amm.vaultB.vaultPda.toString(),
        baseAmount: amm.poolInfo.tokenAAmount.toString(),
        quoteAmount: amm.poolInfo.tokenBAmount.toString(),
        virtualPrice: amm.poolInfo.virtualPrice,
        lpMint: amm.poolState.lpMint.toString(),
        lpDecimals: amm.decimals,
        lpSupply: amm.poolState.lpSupply.toString(),
        totalLockedLp: amm.poolState.totalLockedLp.toString(),
        feeBps: amm.feeBps.toString(),
      });
    } catch (error) {
      return ctx.result({ error: `Failed to get pool infomation: ${error}` });
    }
  }
)
