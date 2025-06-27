import axios from "axios";
import { CORE_DOMAIN } from "./const";

export interface TokenBalance {
  balance: string;
  activeBalance: string;
  valuation: number;
}

export interface MarketPosition {
  marketId: string;
  marketAddress: string;
  pt: TokenBalance;
  yt: TokenBalance;
  lp: TokenBalance;
}

export interface SyPosition {
  syId: string;
  syAddress: string;
  balance: string;
}

export interface UserPositionsResponse {
  chainId: number;
  totalOpen: number;
  totalClosed: number;
  totalSy: number;
  openPositions: MarketPosition[];
  closedPositions: MarketPosition[];
  syPositions: SyPosition[];
  updatedAt: string; // ISO Date string
  errorMessage?: string;
}

export interface UserPositionsCrossChainResponse {
  positions: UserPositionsResponse[];
}



export async function getUserPosition(user: string, filterUsd: number = 0) {
  const targetPath = `/v1/dashboard/positions/database/${user}`;

  const { data } = await axios.get<UserPositionsCrossChainResponse>(CORE_DOMAIN + targetPath, { params: { filterUsd } });

  // add market address to each position
  data.positions.forEach((position) => {
    position.openPositions.forEach((market) => {
      // 1-0xabc..., filter by -, get the second part
      market.marketAddress = market.marketId.split("-")[1];
    });
    position.closedPositions.forEach((market) => {
      market.marketAddress = market.marketId.split("-")[1];
    });
    position.syPositions.forEach((sy) => {
      sy.syAddress = sy.syId.split("-")[1];
    });
  });

  return data;
}