import { ActionContext } from "unifai-sdk";
import { Chain, InvestType, InvestRateType } from "../api/enums";
import { okxApi, toolkit } from "../config";

toolkit.action({
  action: "getInvestmentDetails",
  actionDescription: "Retrieve detailed information about a specific OKX DeFi investment product using investmentId, typically obtained from the searchInvestmentProducts action/service. Returns details such as platform, rate of return, total value locked (TVL), supported tokens, and earning mechanisms. Does not return user-specific investment details.",
  payloadDescription: {
    "investmentId": {
      "type": "string",
      "required": true,
      "description": "OKX DeFi investmentId, obtained from the searchInvestmentProducts action/service."
    },
  }
}, async (ctx: ActionContext, payload: any = {}) => {
  try {
    const investment = await okxApi.defi.getProductDetail(payload);

    return ctx.result({
      investmentId: investment.investmentId,
      investmentName: investment.investmentName,
      InvestType: InvestType[investment.investType],
      chain: Chain[investment.chainId],
      platform: investment.platformName.replace(/\s/g, '_').replace('.', '_'),
      tvl: investment.tvl,
      rate: investment.rate,
      rateType: InvestRateType[investment.rateType],
      rateDetails: investment.rateDetails?.map(rate => ({
        tokenAddress: rate.tokenAddress,
        tokenSymbol: rate.tokenSymbol,
        rate: rate.rate,
        type: InvestRateType[rate.type],
      })),
      underlyingToken: investment.underlyingToken,
      isInvestable: investment.isInvestable,
      utilizationRate: investment.utilizationRate,
      earnedToken: investment.earnedToken,
      lpToken: investment.lpToken,
    });
  } catch (error) {
    return ctx.result({ error: `Failed to get investment details: ${error}` });
  }
});
