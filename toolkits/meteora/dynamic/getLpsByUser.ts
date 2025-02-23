import { ActionContext } from "unifai-sdk";
import { connection, toolkit } from "../config";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { createProgram } from "@mercurial-finance/dynamic-amm-sdk/dist/cjs/src/amm/utils";
import AmmImpl from "@mercurial-finance/dynamic-amm-sdk";

toolkit.action(
  {
    action: "getDynamicPoolLpsByUser",
    actionDescription: "Retrieve all Dynamic liquidity pool (LP) tokens associated with a specific user in Meteora. Returns LP token balances along with the corresponding pool details, such as pool addresses, token pairs, fees, LP supply, total locked LP, and other relevant pool data.",
    payloadDescription: {
      "userPublicKey": {
        "type": "string",
        "required": true,
        "description": "The public key of the user whose Dynamic liquidity pool LP tokens should be queried."
      }
    }
  },
  async (ctx: ActionContext, payload: any = {}) => {
    try {
      const tokens = await connection.getParsedTokenAccountsByOwner(new PublicKey(payload.userPublicKey), { programId: TOKEN_PROGRAM_ID }).then(res => res.value.map(t => t.account.data.parsed?.info && { tokenAddress: t.pubkey.toString(), mint: t.account.data.parsed.info.mint.toString() as string, amount: t.account.data.parsed.info.tokenAmount.uiAmount as number }).filter(Boolean));
      const program = createProgram(connection).ammProgram;
      const result = await Promise.all(tokens.map(({ tokenAddress, mint, amount }) => program.account.pool.all([{ memcmp: { offset: 8, encoding: 'base58', bytes: mint } }]).then(res => Promise.all(res.map(async pool => {
        const amm = await AmmImpl.create(connection, new PublicKey(pool.publicKey));
        return {
          lpToken: {
            tokenAddress,
            mint,
            amount
          },
          pool: {
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
          }
        }
      }))))).then(res => res.flat());
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to get LPs: ${error}` });
    }
  }
)
