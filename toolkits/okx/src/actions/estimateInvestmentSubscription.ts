import { ActionContext } from "unifai-sdk";
import { Chain, InvestOrderType } from "../api/enums";
import { okxApi, toolkit } from "../config";

toolkit.action({
  action: "estimateInvestmentSubscription",
  actionDescription: "Calculate subscription earnings details for a specific OKX Defi investment, including super node name, estimated gas fees, received tokens, voucher token details, earnings token details, token authorization status, subscribable amount, minimum subscription amount, maximum subscription amount, and currency exchange rates.",
  payloadDescription: {
    "address": {
      "type": "string",
      "required": false,
      "description": "User's wallet address, supporting EVM address and Solana address."
    },
    "investmentId": {
      "type": "string",
      "required": true,
      "description": "OKX DeFi investmentId, typically obtained from the searchInvestments or getInvestmentDetails action/service."
    },
    "inputTokenAddress": {
      "type": "string",
      "required": true,
      "description": "Smart contract address of the subscription token."
    },
    "inputAmount": {
      "type": "string",
      "required": true,
      "description": "Quantity of tokens to subscribe."
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

    data.receiveTokenInfo['chain'] = Chain[data.receiveTokenInfo.chainId];
    delete data.receiveTokenInfo.chainId;

    data.investWithTokenList.forEach(invest => {
      invest['chain'] = Chain[invest.chainId];
      delete invest.chainId;
    });
    data.approveStatusList?.forEach(approve => {
      approve['chain'] = Chain[approve.chainId];
      delete approve.chainId;
      approve['orderType'] = InvestOrderType[approve.orderType] as any;
    });

    return ctx.result(data);
  } catch (error) {
    return ctx.result({ error: `Failed to calculate subscription: ${error}` });
  }
});
