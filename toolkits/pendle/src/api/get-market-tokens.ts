import axios from "axios";
import { CORE_DOMAIN } from "./const";

// resposne schema
/* {
  "tokensMintSy": [
    "string"
  ],
  "tokensRedeemSy": [
    "string"
  ],
  "tokensIn": [
    "string"
  ],
  "tokensOut": [
    "string"
  ]
} */

interface Response {
  tokensMintSy: string[];
  tokensRedeemSy: string[];
  tokensIn: string[];
  tokensOut: string[];
}


export async function getMarketTokens(chainId: number, market: string) {

  const targetPath = `/v1/sdk/${chainId}/markets/${market}/tokens`;

  const { data } = await axios.get<Response>(CORE_DOMAIN + targetPath);

  return data;
}


export async function isSupportSwapToken(chainId: number, market: string, token: string, type: "tokenMintSy" | "tokenRedeemSy" | "tokenIn" | "tokenOut") {
  const tokens = await getMarketTokens(chainId, market);
  return tokens[type].includes(token.toLowerCase());
}


