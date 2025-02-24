import { ActionContext } from "unifai-sdk";
import { connection, toolkit } from "../config";
import { PublicKey } from "@solana/web3.js";
import AmmImpl from "@mercurial-finance/dynamic-amm-sdk";
import { toUiAmount } from "../utils";

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
        baseReserve: amm.vaultA.vaultPda.toString(),
        quoteReserve: amm.vaultB.vaultPda.toString(),
        baseAmount: toUiAmount(amm.poolInfo.tokenAAmount, amm.tokenAMint.decimals),
        quoteAmount: toUiAmount(amm.poolInfo.tokenBAmount, amm.tokenBMint.decimals),
        virtualPrice: amm.poolInfo.virtualPrice,
        lpMint: amm.poolState.lpMint.toString(),
        lpSupply: toUiAmount(amm.poolState.lpSupply, amm.decimals),
        totalLockedLp: toUiAmount(amm.poolState.totalLockedLp, amm.decimals),
        feeBps: amm.feeBps.toString(),
      });
    } catch (error) {
      return ctx.result({ error: `Failed to get pool infomation: ${error}` });
    }
  }
)
