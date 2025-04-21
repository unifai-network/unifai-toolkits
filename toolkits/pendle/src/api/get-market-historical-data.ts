import { CORE_DOMAIN } from "./const";
import axios from "axios";
import { parse } from "csv-string";

interface Param {
  chainId: number;
  address: string;
}

interface Query {
  timeFrame?: "hour" | "day" | "week";
  timestampStart?: Date;
  timestampEnd?: Date;
}

interface MarketHistoricalData {
  timestamps: number[];
  underlyingApys: number[];
  impliedApys: number[];
}

interface Response {
  total: number;
  timestamp_start: string;
  timestamp_end: string;
  results: string;
}

export async function getMarketHistoricalData(
  chainId: number,
  address: string,
  timeFrame: "hour" | "day" | "week",
  timestampStart: Date,
  timestampEnd: Date
) {
  const param: Param = {
    chainId,
    address,
  };

  const query: Query = {
    timeFrame,
    timestampStart,
    timestampEnd,
  };

  const targetPath = `/v2/${param.chainId}/markets/${param.address}/apy-history`;

  const { data: response } = await axios.get<Response>(CORE_DOMAIN + targetPath, { params: query });

  const { results } = response;

  const data = parse(results, { output: "objects" });

  console.log("first data point info", {
    timestamp: data[0].timestamp,
    underlyingApy: data[0].underlyingApy,
    impliedApy: data[0].impliedApy,
  });

  return data;
}
