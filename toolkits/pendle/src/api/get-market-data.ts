import axios from "axios";
import { CORE_DOMAIN } from "./const";

export interface MarketDataResponse {
  timestamp: string;
  liquidity: ValuationResponse;
  tradingVolume: ValuationResponse;
  underlyingInterestApy: number;
  underlyingRewardApy: number;
  underlyingApy: number;
  impliedApy: number;
  ytFloatingApy: number;
  swapFeeApy: number;
  voterApy: number;
  ptDiscount: number;
  pendleApy: number;
  arbApy: number;
  lpRewardApy: number;
  aggregatedApy: number;
  maxBoostedApy: number;
  estimatedDailyPoolRewards: EstimatedDailyPoolRewardResponse[];
  totalPt: number;
  totalSy: number;
  totalLp: number;
  totalActiveSupply: number;
  assetPriceUsd: number;
}

interface ValuationResponse {
  usd: number;
  acc: number;
}

interface EstimatedDailyPoolRewardResponse {
  asset: AssetBasicResponse;
  amount: number;
}

interface AssetBasicResponse {
  id: string;
  chainId: number;
  address: string;
  symbol: string;
  decimals: number;
  expiry: string;
  accentColor: string;
  price: ValuationResponse;
  priceUpdatedAt: string;
  name: string;
}

export async function getMarketData(chainId: number, address: string) {
  const targetPath = `/v2/${chainId}/markets/${address.toLowerCase()}/data`;
  return await axios.get<MarketDataResponse>(CORE_DOMAIN + targetPath);
}
