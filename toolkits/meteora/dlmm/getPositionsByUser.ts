import { ActionContext } from "unifai-sdk";
import { connection, toolkit } from "../config";
import DLMM, { PositionInfo } from "@meteora-ag/dlmm";
import { PublicKey } from "@solana/web3.js";
import { toUiAmount } from "../utils";
import BN = require("bn.js");

toolkit.action(
  {
    action: "getDlmmPoolPositionsByUser",
    actionDescription: "Retrieve all DLMM liquidity pool positions associated with a specific user in Meteora. Returns position public keys and their details such as pool addresses (LB pairs), fees, rewards, and other relevant position data.",
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
          lbPairPositions: Array.from(res.values()).map(info => ({
            lbPair: {
              lbPairPublicKey: info.publicKey.toString(),
              binStep: info.lbPair.binStep,
              creator: info.lbPair.creator.toString(),
              reserveX: info.lbPair.reserveX.toString(),
              reserveY: info.lbPair.reserveY.toString(),
              tokenXMint: info.lbPair.tokenXMint.toString(),
              tokenYMint: info.lbPair.tokenYMint.toString(),
              totalXAmount: toUiAmount(new BN(info.tokenX.amount.toString()), info.tokenX.decimal),
              totalYAmount: toUiAmount(new BN(info.tokenY.amount.toString()), info.tokenY.decimal),
              baseFeeBps: DLMM.calculateFeeInfo(info.lbPair.parameters.baseFactor, info.lbPair.binStep).baseFeeRatePercentage.mul(100).toNumber(),
              protocolFeeBps: info.lbPair.parameters.protocolShare,
            },
            positions: info.lbPairPositionsData.map(position => ({
              positionPublicKey: position.publicKey.toString(),
              feeOwner: position.positionData.feeOwner.toString(),
              feeX: toUiAmount(position.positionData.feeX, info.tokenX.decimal),
              feeY: toUiAmount(position.positionData.feeY, info.tokenY.decimal),
              totalXAmount: toUiAmount(new BN(position.positionData.totalXAmount.split('.')[0]), info.tokenX.decimal),
              totalYAmount: toUiAmount(new BN(position.positionData.totalYAmount.split('.')[0]), info.tokenY.decimal),
              lowerBinId: position.positionData.lowerBinId,
              upperBinId: position.positionData.upperBinId,
              totalClaimedFeeXAmount: toUiAmount(position.positionData.totalClaimedFeeXAmount, info.tokenX.decimal),
              totalClaimedFeeYAmount: toUiAmount(position.positionData.totalClaimedFeeYAmount, info.tokenY.decimal),
              positionBinData: position.positionData.positionBinData.map(bin => ({
                binId: bin.binId,
                pricePerToken: bin.pricePerToken,
                binXAmount: toUiAmount(new BN(bin.binXAmount.split('.')[0]), info.tokenX.decimal),
                binYAmount: toUiAmount(new BN(bin.binYAmount.split('.')[0]), info.tokenY.decimal),
                positionXAmount: toUiAmount(new BN(bin.positionXAmount.split('.')[0]), info.tokenX.decimal),
                positionYAmount: toUiAmount(new BN(bin.positionYAmount.split('.')[0]), info.tokenY.decimal),
              })),
            })),
          })),
        }
      });
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to get position infomation: ${error}` });
    }
  }
);
