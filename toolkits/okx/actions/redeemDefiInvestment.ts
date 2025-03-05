import { ActionContext } from "unifai-sdk";
import { toolkit, txApi } from "../config";

toolkit.action({
  action: "redeemDefiInvestment",
  actionDescription: "Initiate a redemption transaction for a DeFi investment on any platform supported by OKX. It is recommended to first use `estimateDefiInvestmentRedemption` to calculate the required details before executing the redemption.",
  payloadDescription: {
    "address": {
      "type": "string",
      "required": true,
      "description": "User's wallet address."
    },
    "investmentId": {
      "type": "string",
      "required": true,
      "description": "Unique identifier of the investment product."
    },
    "userInputList": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "coinAmount": {
            "type": "string",
            "required": true,
            "description": "Amount of tokens to redeem."
          },
          "tokenAddress": {
            "type": "string",
            "required": true,
            "description": "Smart contract address of the token to redeem."
          }
        }
      },
      "required": true,
      "description": "Information about the tokens the user wishes to redeem."
    },
    "expectOutputList": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "coinAmount": {
            "type": "string",
            "required": true,
            "description": "Expected amount of tokens to receive."
          },
          "tokenAddress": {
            "type": "string",
            "required": true,
            "description": "Smart contract address of the expected token."
          }
        }
      },
      "required": true,
      "description": "Information about the tokens the user expects to receive upon redemption."
    },
    "redeemAll": {
      "type": "boolean",
      "required": false,
      "description": "Whether to redeem all the tokens in this investment.",
      "default": false
    }
  }
}, async (ctx: ActionContext, payload: any = {}) => {
  try {
    if (payload.redeemAll) {
      payload.extra = JSON.stringify({ redeemAll: 1 });
      delete payload.redeemAll;
    }
    const result = await txApi.createTransaction(
      "okx/defi/redeem",
      ctx,
      payload
    );
    return ctx.result(result);
  } catch (error) {
    return ctx.result({
      error: `Failed to generate redemption transaction: ${error}`,
    });
  }
});
