import { ActionContext } from "unifai-sdk";
import { connection, toolkit } from "../config";
import DLMM from "@meteora-ag/dlmm";
import { PublicKey } from "@solana/web3.js";

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
          lbPairPositions: Array.from(res.values()),
        }
      });
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to get position infomation: ${error}` });
    }
  }
)
