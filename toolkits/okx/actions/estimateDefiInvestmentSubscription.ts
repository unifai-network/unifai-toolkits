import { ActionContext } from "unifai-sdk";
import { Chain, InvestOrderType } from "../api/enums";
import { okxApi, toolkit } from "../config";

toolkit.action({
  action: "estimateDefiInvestmentSubscription",
  actionDescription: "Calculate subscription earnings details for a specific Defi investment, including super node name, estimated gas fees, received tokens, voucher token details, earnings token details, token authorization status, subscribable amount, minimum subscription amount, maximum subscription amount, and currency exchange rates.",
  payloadDescription: {
    "address": {
      "type": "string",
      "required": false,
      "description": "User's wallet address."
    },
    "inputAmount": {
      "type": "string",
      "required": true,
      "description": "Quantity of tokens to subscribe."
    },
    "investmentId": {
      "type": "string",
      "required": true,
      "description": "Unique identifier for the investment. Refer to the official documentation for available investment IDs."
    },
    "investmentCategory": {
      "type": "string",
      "required": false,
      "description": "Category of the investment. Possible values: '0' (Default category), '1' (BRC-20)."
    },
    "inputTokenAddress": {
      "type": "string",
      "required": true,
      "description": "Smart contract address of the subscription token. Refer to the official documentation for available token addresses."
    },
    "isSingle": {
      "type": "boolean",
      "required": false,
      "description": "Indicates if the investment is a single token investment. Possible values: true (Single token), false (Multiple tokens)."
    },
    "slippage": {
      "type": "string",
      "required": false,
      "description": "Allowed slippage percentage during subscription. Defaults to 1%."
    }
  }
}, async (ctx: ActionContext, payload: any = {}) => {
  try {
    payload.outputTokenDecimal = "0";
    const data = await okxApi.defi.calculateSubscription(payload);

    data.receiveTokenInfo['chainName'] = Chain[data.receiveTokenInfo.chainId];
    data.investWithTokenList.forEach(invest => {
      invest['chainName'] = Chain[invest.chainId];
    });
    data.approveStatusList?.forEach(approve => {
      approve['chainName'] = Chain[approve.chainId];
      approve['orderType'] = InvestOrderType[approve.orderType] as any;
    });

    return ctx.result(data);
  } catch (error) {
    return ctx.result({ error: `Failed to calculate subscription: ${error}` });
  }
});
