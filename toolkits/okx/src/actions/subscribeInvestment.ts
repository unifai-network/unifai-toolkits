import { ActionContext } from "unifai-sdk";
import { toolkit, txApi } from "../config";

toolkit.action({
  action: "subscribeInvestment",
  actionDescription: "Initiate a subscription transaction for an OKX DeFi investment obtained from the searchInvestments or getInvestmentDetails action/service. It is recommended to first use `estimateInvestmentSubscription` to calculate the necessary details before proceeding with the subscription.",
  payloadDescription: {
    "address": {
      "type": "string",
      "required": true,
      "description": "User's wallet address, supporting EVM address and Solana address."
    },
    "investmentId": {
      "type": "string",
      "required": true,
      "description": "OKX DeFi investmentId, typically obtained from the searchInvestments or getInvestmentDetails action/service."
    },
    "userInputList": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "coinAmount": {
            "type": "string",
            "required": true,
            "description": "Amount of tokens to subscribe."
          },
          "tokenAddress": {
            "type": "string",
            "required": true,
            "description": "Smart contract address of the subscription token."
          }
        }
      },
      "required": true,
      "description": "Information about the tokens the user wishes to use for the subscription."
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
      "description": "Information about the tokens the user expects to receive upon subscription."
    },
  }
}, async (ctx: ActionContext, payload: any = {}) => {
  try {
    if (payload.extra && typeof payload.extra === 'object') {
      payload.extra = JSON.stringify(payload.extra);
    }
    const result = await txApi.createTransaction(
      "okx/defi/subscribe",
      ctx,
      payload
    );
    return ctx.result(result);
  } catch (error) {
    console.error(error);
    return ctx.result({ error: `Failed to generate subscription transaction: ${error}` });
  }
});
