import { ActionContext } from "unifai-sdk";
import { toolkit, txApi } from "../config";

toolkit.action({
  action: "claimDefiInvestmentBonus",
  actionDescription: "Claim a DeFi investment bonus for a user.",
  payloadDescription: {
    "address": {
      "type": "string",
      "required": true,
      "description": "The user's wallet address to receive the claimed bonus."
    },
    "investmentId": {
      "type": "string",
      "required": true,
      "description": "The unique identifier of the investment product for which the bonus is being claimed."
    },
    "userInputList": {
      "type": "array",
      "required": true,
      "description": "Details of the tokens provided by the user for the claim.",
      "items": {
        "type": "object",
        "properties": {
          "coinAmount": {
            "type": "string",
            "required": true,
            "description": "The amount of tokens being used for the claim."
          },
          "tokenAddress": {
            "type": "string",
            "required": true,
            "description": "The smart contract address of the token being used."
          }
        }
      }
    },
    "expectOutputList": {
      "type": "array",
      "required": true,
      "description": "Expected return details from the claim, including blockchain and token specifics.",
      "items": {
        "type": "object",
        "properties": {
          "coinAmount": {
            "type": "string",
            "required": true,
            "description": "The expected amount of tokens to be received from the claim."
          },
          "tokenAddress": {
            "type": "string",
            "required": true,
            "description": "The smart contract address of the expected return token."
          }
        }
      }
    },
    "extra": {
      "type": "object",
      "required": false,
      "description": "Optional additional parameters related to bonus claims.",
      "properties": {
        "claimIndex": {
          "type": "array",
          "required": false,
          "description": "A list of reward IDs to be claimed. Required for specific protocols such as Ankr, Benqi, Stader, and Lido.",
          "items": {
            "type": "string"
          }
        },
        "claimOverdue": {
          "type": "boolean",
          "required": false,
          "description": "Indicates whether to claim expired rewards (only applicable for Benqi). Default is false."
        },
        "analysisPlatformId": {
          "type": "number",
          "required": false,
          "description": "ID of the platform for which rewards are being claimed. Supported platforms include Compound, Aave V2, WePiggy, Venus, Aave V3, Benqi, Radiant, Geist Finance, Tender, Compound V3, SonneFinance, and Clearpool."
        }
      }
    }
  }
}, async (ctx: ActionContext, payload: any = {}) => {
  try {
    if (payload.extra && typeof payload.extra === "object") {
      payload.extra = JSON.stringify(payload.extra);
    }
    const result = await txApi.createTransaction(
      "okx/defi/claim-bonus",
      ctx,
      payload
    );
    return ctx.result(result);
  } catch (error) {
    return ctx.result({
      error: `Failed to generate claiming transaction: ${error}`,
    });
  }
});
