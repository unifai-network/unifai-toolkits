import { ActionContext } from "unifai-sdk";
import { Chain, InvestRateType, InvestType, SimplifyInvestType } from "../api/enums";
import { okxApi, toolkit } from "../config";
import { allPlatforms, chain2network, enumKeys, getPlatformId } from "../utils";
import { QueryProductListParams } from "../api/types";

enum InvestQueryType {
  SingleCoin = "SingleCoin",
  V2Pool = "V2Pool",
  V3Pool = "V3Pool",
}

toolkit.action({
  action: "searchInvestments",
  actionDescription: "Retrieve a paginated list of OKX DeFi investment products offered by various platforms supported on OKX based on specified criteria. The response includes details such as investment IDs, names, associated platforms, yield rates, total value locked (TVL), and underlying tokens. To achieve precise filtering, it is recommended to utilize the 'tokens' or 'platformIds' parameters. This action does not retrieve user's personal investment details.",
  payloadDescription: {
    "type": {
      "type": "string",
      "required": true,
      "description": "Type of investment product to query. Single Coin involves staking/lending one asset; V2 Pool (e.g., Uniswap V2, Raydium) uses constant product AMM; V3 Pool (e.g., Uniswap V3, Orca Whirlpools) offers concentrated liquidity for higher efficiency.",
      "enum": enumKeys(InvestQueryType)
    },
    "chain": {
      "type": "string",
      "required": true,
      "description": "Specify the blockchain to query.",
      "enum": enumKeys(Chain)
    },
    "tokenAddresses": {
      "type": "string[]",
      "required": true,
      "description": "List of token contract addresses to filter the investment products, supporting EVM token contract addresses (e.g., 0x123...abc) and Solana token mint address (e.g., EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v). For token SOL, token address is So11111111111111111111111111111111111111111."
    },
    "platforms": {
      "type": "string[]",
      "required": false,
      "description": "Filter investment products by platform names specific to the selected chain. Only platforms available on the specified chain are valid. If omitted, returns data for all supported platforms on that chain.",
      "enum": allPlatforms,
    },
    "offset": {
      "type": "string",
      "required": true,
      "description": "Pagination offset indicating the starting point for the query results."
    },
    "limit": {
      "type": "string",
      "required": true,
      "description": "Number of results to return per request. Range: 1 - 10."
    },
    "sortBy": {
      "type": "string",
      "required": false,
      "description": "Property by which to sort the results. Sortable fields include: 'TVL' (Total Value Locked), 'RATE' (APY Rate).",
      "enum": ["TVL", "RATE"]
    },
    "orderBy": {
      "type": "string",
      "required": false,
      "description": "Direction of sorting. Possible values: 'ASC' (ascending), 'DESC' (descending).",
      "enum": ["ASC", "DESC"]
    }
  }
}, async (ctx: ActionContext, payload: any = {}) => {
  try {
    const query = {} as QueryProductListParams;

    switch (payload.type) {
      case InvestQueryType.SingleCoin: {
        query.simplifyInvestType = SimplifyInvestType.Single;
        break;
      }
      case InvestQueryType.V2Pool: {
        query.simplifyInvestType = SimplifyInvestType.Multi;
        query.poolVersion = "1";
        break;
      }
      case InvestQueryType.V3Pool: {
        query.simplifyInvestType = SimplifyInvestType.Multi;
        query.poolVersion = "2";
        break;
      }
    }

    query.network = chain2network(Chain[payload.chain as string]);

    if (payload.tokenAddresses?.length > 0) {
      query.tokenIds = await Promise.all(
        (payload.tokenAddresses as string[]).filter(Boolean).map(tokenAddress =>
          okxApi.defi.getTokenList({ tokenAddress }).then(res => res.flatMap(data => data.tokenInfos.map(token => token.tokenId)))
        )
      ).then(res => res.flat());
    }

    if (payload.platforms) {
      query.platformIds = payload.platforms.map((platform: string) => getPlatformId(Chain[payload.chain as string], platform));
    }

    query.offset = payload.offset;
    query.limit = payload.limit;

    if (payload.sortBy || payload.orderBy) {
      query.sort = {
        orders: [
          {
            direction: payload.orderBy ?? 'DESC',
            property: payload.sortBy ?? 'TVL'
          }
        ]
      };
    }

    const data = await okxApi.defi.getProductList(query);

    const result = data.investments.map(invest => ({
      investmentId: invest.investmentId,
      investmentName: invest.investmentName,
      InvestType: InvestType[invest.investType],
      chain: Chain[invest.chainId],
      platform: invest.platformName.replace(/\s/g, '_').replace('.', '_'),
      tvl: invest.tvl,
      rate: invest.rate,
      rateType: InvestRateType[invest.rateType],
      underlyingToken: invest.underlyingToken,
    }));

    return ctx.result(result);
  } catch (error) {
    return ctx.result({ error: `Failed to get investment products: ${error}` });
  }
});
