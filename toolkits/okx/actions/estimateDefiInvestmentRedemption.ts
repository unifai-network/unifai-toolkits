import { ActionContext } from "unifai-sdk";
import { Chain, InvestOrderType } from "../api/enums";
import { okxApi, toolkit } from "../config";

toolkit.action({
  action: "estimateDefiInvestmentRedemption",
  actionDescription: "Calculate redemption details for a specific Defi investment, including super node name, estimated gas fees, received tokens, token exchange details, token authorization status, redeemable amount, minimum redemption amount, and maximum redemption amount.",
  payloadDescription: {
    "address": {
      "type": "string",
      "required": false,
      "description": "User's wallet address."
    },
    "inputTokenAmount": {
      "type": "string",
      "required": true,
      "description": "Quantity of tokens to redeem."
    },
    "investmentId": {
      "type": "string",
      "required": true,
      "description": "Unique identifier for the investment."
    },
    "investmentCategory": {
      "type": "string",
      "required": false,
      "description": "Category of the investment. Possible values: '0' (Default category), '1' (BRC-20)."
    },
    "outputTokenAddress": {
      "type": "string",
      "required": true,
      "description": "Smart contract address of the token to receive upon redemption."
    },
    "isSingle": {
      "type": "boolean",
      "required": false,
      "description": "Indicates if the investment is a single token investment. Possible values: true (Single token), false (Multiple tokens)."
    },
    "slippage": {
      "type": "string",
      "required": false,
      "description": "Allowed slippage percentage during redemption."
    }
  }
}, async (ctx: ActionContext, payload: any = {}) => {
  try {
    payload.outputTokenDecimal = "0";
    const data = await okxApi.defi.calculateRedemption(payload);

    data.receiveTokenList.forEach(token => {
      token['chainName'] = Chain[token.chainId];
    });
    data.approveStatusList?.forEach(approve => {
      approve['chainName'] = Chain[approve.chainId];
      approve['orderType'] = InvestOrderType[approve.orderType] as any;
    });

    return ctx.result(data);
  } catch (error) {
    return ctx.result({ error: `Failed to calculate redemption: ${error}` });
  }
});
