import { ActionContext } from "unifai-sdk";
import { Chain, InvestRateType, InvestType, SimplifyInvestType } from "../api/enums";
import { okxApi, toolkit, txApi} from "../config";
import { allPlatforms, chain2network, enumKeys, getPlatformId } from "../utils";
import { QueryProductListParams, Investment, InvestmentRequest, TokenInfo} from "../api/types";

export function getEnv(key: string): string {
	const val = process.env[key];
	if (!val) throw new Error(`Missing environment variable: ${key}`);
	return val;
}

export async function getInvestmentsbywallet(address:string){

    return [];
}

export function findBestInvestments(data: Investment[]|null):Investment|null
{
  const tvlSorted = [...data].sort((a, b) => {
    const tvlA = parseFloat(a.tvl);
    const tvlB = parseFloat(b.tvl);
    return tvlB - tvlA;
  });
  const topEntries = tvlSorted.slice(0, 5);

  let newlist = topEntries.sort((a, b) => {
    const scoreA = Math.pow(parseFloat(a.tvl), 2) * parseFloat(a.rate);
    const scoreB = Math.pow(parseFloat(b.tvl), 2) * parseFloat(b.rate);
    return scoreB - scoreA;
  });
  
  if (newlist.length > 0) {
    return newlist[0];
  }
  return null;
}


export async function searchInvestments(
    chain:string,
    investType:SimplifyInvestType, 
    tokenAddresses:string[], 
    platforms:string[], 
    offset:string, 
    limit:string,
    sortByTvl:boolean,
    orderByAsc:boolean) {
        const query = {} as QueryProductListParams;
        query.simplifyInvestType = investType;
        query.network = chain2network(Chain[chain]);
        if (tokenAddresses?.length > 0) {
          query.tokenIds = await Promise.all(
            (tokenAddresses as string[]).filter(Boolean).map(tokenAddress =>
              okxApi.defi.getTokenList({ tokenAddress }).then(res => res.flatMap(data => data.tokenInfos.map(token => token.tokenId)))
            )
          ).then(res => res.flat());
        }
        if (platforms) {
          query.platformIds = platforms.map((platform: string) => getPlatformId(Chain[chain], platform));
        }
        query.offset = offset;
        query.limit = limit;
        query.sort = {
            orders: [
              {
                direction: orderByAsc ? 'ASC':'DESC',
                property: sortByTvl ? 'TVL':'RATE'
              }
            ]
        };
        try {
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
            const investmentResult: Investment[] = result as Investment[];
            return investmentResult;
        }catch (error) {
            console.error('Search failed:', error);
            return {error:error}; 
        }  
}

export async function subscribeInvestment(ctx: ActionContext, payload: any={}, address:string) {
    try {
        if (payload.extra && typeof payload.extra === 'object') {
          payload.extra = JSON.stringify(payload.extra);
        }
        const result = await txApi.createTransaction(
          "okx/defi/subscribe",
          ctx,
          payload
        );
        return result
      } catch (error) {
        console.error(error);
        return {error:error}
      }
}

export async function redeemInvestment(ctx: ActionContext, payload: any={}, address:string) {
    try {
        if (payload.extra && typeof payload.extra === 'object') {
          payload.extra = JSON.stringify(payload.extra);
        }
        const result = await txApi.createTransaction(
          "okx/defi/redeem",
          ctx,
          payload
        );
        return result
      } catch (error) {
        console.error(error);
        return {error:error}
      }
}

