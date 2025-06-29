import { ActionContext } from "unifai-sdk";
import { toolkit } from "../config";
import { CHAINS } from "../consts";
import { getUserPosition } from "../api/get-user-position";

toolkit.action({
  action: "retrieveUserPendlePosition",
  actionDescription: "Retrieve user's Pendle position with a specific wallet address, position is include pt, yt, lp position",
  payloadDescription: {
    "wallet": {
      type: "string",
      description: "User's wallet address",
      required: true,
    },
    "filterUsd": {
      type: "number",
      description: "Filter position by USD value",
      required: false,
      default: 0,
    }
  },
},
async (ctx: ActionContext, payload: any = {}) => {
  try {
    const result = await getUserPosition(payload.wallet, payload.filterUsd);
    return ctx.result(result);
  } catch (error) {
    return ctx.result(error);
  }
});
