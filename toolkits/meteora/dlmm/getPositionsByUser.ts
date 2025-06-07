import { ActionContext } from "unifai-sdk";
import { connection, toolkit } from "../config";
import DLMM, { getPriceOfBinByBinId, PositionInfo } from "@meteora-ag/dlmm";
import { PublicKey } from "@solana/web3.js";
import { lamportsPriceToTokenPrice, toUiAmount } from "../utils";
import BN = require("bn.js");

toolkit.action(
  {
    action: "getDlmmPoolPositionsByUser",
    actionDescription: "Retrieve all DLMM liquidity pool (NOT Dynamic AMM pool) positions associated with a specific user in Meteora. Returns position public keys and their details such as pool addresses (LB pairs), fees, rewards, and other relevant position data.",
    payloadDescription: {
      "userPublicKey": {
        "type": "string",
        "required": true,
        "description": "The public key of the user whose liquidity pool positions should be queried."
      }
    }
  },
  async (ctx: ActionContext, payload: any = {}) => {
    try {
      const result = await DLMM.getAllLbPairPositionsByUser(connection, new PublicKey(payload.userPublicKey), { cluster: 'mainnet-beta' }).then(res => {
        return {
          lbPairPositions: Array.from(res.values()).map(info => {
            const [baseDecimals, quoteDecimals] = [info.tokenX.mint.decimals, info.tokenY.mint.decimals];
            const currentPrice = lamportsPriceToTokenPrice(getPriceOfBinByBinId(info.lbPair.activeId, info.lbPair.binStep), baseDecimals, quoteDecimals);
            return {
              lbPair: {
                lbPairPublicKey: info.publicKey.toString(),
                currentPrice,
                activeBinId: info.lbPair.activeId,
                binStep: info.lbPair.binStep,
                creator: info.lbPair.creator.toString(),
                reserveX: info.lbPair.reserveX.toString(),
                reserveY: info.lbPair.reserveY.toString(),
                tokenXMint: info.lbPair.tokenXMint.toString(),
                tokenYMint: info.lbPair.tokenYMint.toString(),
                totalXAmount: toUiAmount(new BN(info.tokenX.amount.toString()), baseDecimals),
                totalYAmount: toUiAmount(new BN(info.tokenY.amount.toString()), quoteDecimals),
                baseFeeBps: DLMM.calculateFeeInfo(info.lbPair.parameters.baseFactor, info.lbPair.binStep).baseFeeRatePercentage.mul(100).toNumber(),
                protocolFeeBps: info.lbPair.parameters.protocolShare,
              },
              positions: info.lbPairPositionsData.map(position => {
                const minPrice = lamportsPriceToTokenPrice(getPriceOfBinByBinId(position.positionData.lowerBinId, info.lbPair.binStep), baseDecimals, quoteDecimals);
                const maxPrice = lamportsPriceToTokenPrice(getPriceOfBinByBinId(position.positionData.upperBinId, info.lbPair.binStep), baseDecimals, quoteDecimals);
                return {
                  positionPublicKey: position.publicKey.toString(),
                  feeOwner: position.positionData.feeOwner.toString(),
                  feeX: toUiAmount(position.positionData.feeX, baseDecimals),
                  feeY: toUiAmount(position.positionData.feeY, quoteDecimals),
                  totalXAmount: toUiAmount(new BN(position.positionData.totalXAmount.split('.')[0]), baseDecimals),
                  totalYAmount: toUiAmount(new BN(position.positionData.totalYAmount.split('.')[0]), quoteDecimals),
                  lowerBinId: position.positionData.lowerBinId,
                  upperBinId: position.positionData.upperBinId,
                  totalClaimedFeeXAmount: toUiAmount(position.positionData.totalClaimedFeeXAmount, baseDecimals),
                  totalClaimedFeeYAmount: toUiAmount(position.positionData.totalClaimedFeeYAmount, quoteDecimals),
                  minPrice,
                  maxPrice,
                }
              }),
            }
          }),
        }
      });
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to get position infomation: ${error}` });
    }
  }
);
