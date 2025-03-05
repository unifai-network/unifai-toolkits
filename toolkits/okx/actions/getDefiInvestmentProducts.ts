import { ActionContext } from "unifai-sdk";
import { Chain, InvestType, Network, InvestRateType, SimplifyInvestType } from "../api/enums";
import { okxApi, toolkit } from "../config";
import { enumKeys } from "../utils";

toolkit.action({
  action: "getDefiInvestmentProducts",
  actionDescription: "Retrieve a paginated list of DeFi investment products offered by various platforms supported on OKX based on specified criteria. The response includes details such as investment IDs, names, associated platforms, yield rates, total value locked (TVL), and underlying tokens. To achieve precise filtering, it is recommended to utilize the 'tokens' or 'platformIds' parameters. This action does not retrieve user's personal investment details.",
  payloadDescription: {
    "offset": {
      "type": "string",
      "required": false,
      "description": "Pagination offset indicating the starting point for the query results."
    },
    "limit": {
      "type": "string",
      "required": true,
      "description": "Number of results to return per request."
    },
    "simplifyInvestType": {
      "type": "string",
      "required": true,
      "description": "Type of investment product to query.",
      "enum": enumKeys(SimplifyInvestType)
    },
    "network": {
      "type": "string",
      "required": true,
      "description": "Name of the blockchain network to query.",
      "enum": enumKeys(Network)
    },
    "tokens": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "required": false,
      "description": "List of token contract addresses to filter the investment products."
    },
    "platformIds": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "required": false,
      "description": "List of platform IDs to filter the investment products. Refer to the official documentation for available platform IDs."
    },
    "poolVersion": {
      "type": "string",
      "required": false,
      "description": "Version of the investment pool. Defaults to 'V2'. Used to distinguish between 'V2' and 'V3' pools.",
      "enum": ["V2", "V3"]
    },
    "sort": {
      "type": "object",
      "required": false,
      "description": "Criteria for sorting the query results.",
      "properties": {
        "orders": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "direction": {
                "type": "string",
                "required": false,
                "description": "Direction of sorting. Possible values: 'ASC' (ascending), 'DESC' (descending).",
                "enum": ["ASC", "DESC"]
              },
              "property": {
                "type": "string",
                "required": false,
                "description": "Property by which to sort the results. Sortable fields include: 'TVL' (Total Value Locked), 'RATE' (APY Rate).",
                "enum": ["TVL", "RATE"]
              }
            }
          },
          "required": false,
          "description": "List of sorting criteria."
        }
      }
    }
  }
}, async (ctx: ActionContext, payload: any = {}) => {
  try {
    if (payload.simplifyInvestType) {
      payload.simplifyInvestType = SimplifyInvestType[payload.simplifyInvestType];
    }
    if (payload.tokens) {
      payload.tokenIds = await Promise.all(
        (payload.tokens as string[]).map(tokenAddress =>
          okxApi.defi.getTokenList({ tokenAddress }).then(res => res.flatMap(data => data.tokenInfos.map(token => token.tokenId)))
        )
      ).then(res => res.flat());
      delete payload.tokens;
    }

    const data = await okxApi.defi.getProductList(payload);

    data.investments.forEach(invest => {
      invest['chainName'] = Chain[invest.chainId];
      invest['investType'] = InvestType[invest.investType] as any;
      invest['rateType'] = InvestRateType[invest.rateType] as any;
    });

    return ctx.result(data);
  } catch (error) {
    return ctx.result({ error: `Failed to get investment products: ${error}` });
  }
});
