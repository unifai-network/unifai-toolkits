import { ActionContext } from "unifai-sdk";
import { Chain, InvestType, InvestRateType } from "../api/enums";
import { okxApi, toolkit } from "../config";

toolkit.action({
  action: "getDefiInvestmentDetails",
  actionDescription: "Retrieve detailed information about a specific DeFi investment product provided by OKX based on the provided search criteria. This includes investment details such as platform, rate of return, total value locked (TVL), supported tokens, and earning mechanisms. This is not for obtaining user's investment details.",
  payloadDescription: {
    "investmentId": {
      "type": "string",
      "required": true,
      "description": "The unique identifier of the investment product to query."
    },
    "investmentCategory": {
      "type": "string",
      "required": false,
      "description": "The category of the investment. Possible values include: '0' (Default type), '1' (BRC-20)."
    }
  }
}, async (ctx: ActionContext, payload: any = {}) => {
  try {
    const investment = await okxApi.defi.getProductDetail(payload);

    investment['chainName'] = Chain[investment.chainId];
    investment['investType'] = InvestType[investment.investType] as any;
    investment['rateType'] = InvestRateType[investment.rateType] as any;

    return ctx.result({
      investment,
    });
  } catch (error) {
    return ctx.result({ error: `Failed to get investment details: ${error}` });
  }
});
