import { CORE_DOMAIN } from "./const";
import axios from "axios";
import { parse } from "csv-string";

interface GetAssetPricesParam {
  chainId: number;
}

interface GetAssetPricesQuery {
  addresses?: string; // separated by commas, return all asset prices if empty
}

interface GetAssetPricesResponse {
  prices: Record<string, number>;
}

interface GetHistoricalPricesParam {
  chainId: number;
  address: string;
}

interface GetHistoricalPricesQuery {
  timeFrame?: "hour" | "day" | "week";
  timestampStart?: Date;
  timestampEnd?: Date;
}

interface HistoricalPriceData {
  timestamps: number[];
  highs: number[];
  lows: number[];
  opens: number[];
  closes: number[];
}

interface GetHistoricalPricesResponse {
  total: number;
  currency: string;
  timeFrame: string;
  timestamp_start: number;
  timestamp_end: number;
  results: string;
}

export async function getAssetPrices(chainId: number, ptAddress: string[]) {
  // This is an example of how to get all spot prices of pendle assets on Ethereum

  const param: GetAssetPricesParam = {
    chainId,
  };

  const addresses = ptAddress.join(",");

  const query: GetAssetPricesQuery = {
    addresses: addresses,
  };

  const targetPath = `/v1/${param.chainId}/assets/prices`;

  const { data } = await axios.get<GetAssetPricesResponse>(CORE_DOMAIN + targetPath, {
    params: query,
  });

  return data.prices;
}

export async function getHistoricalAssetPrices(
  chainId: number,
  address: string,
  timeFrame: "hour" | "day" | "week",
  timestampStart: Date,
  timestampEnd: Date
) {
  // This is an example of how to get daily historical prices from 2024 Aug 5th to Aug 11st of PT-USDO++ on Ethereum

  const param: GetHistoricalPricesParam = {
    chainId,
    address,
  };

  const query: GetHistoricalPricesQuery = {
    timeFrame,
    timestampStart,
    timestampEnd,
  };

  const targetPath = `/v4/${param.chainId}/prices/${param.address}/ohlcv`;
  const { data: response } = await axios.get<GetHistoricalPricesResponse>(CORE_DOMAIN + targetPath, { params: query });

  const { results } = response;

  const data = parse(results, { output: "objects" });

  return data;
}
