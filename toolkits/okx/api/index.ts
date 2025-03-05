import { API } from "unifai-sdk";
import * as querystring from 'querystring';
import * as crypto from 'crypto';
import { QueryPlatformListParams, QueryPlatformListResult, QueryTokenListParams, QueryTokenListResult, QueryProductListParams, QueryProductListResult, QueryProductDetailParams, QueryProductDetailResult, QueryUserPositionListParams, QueryUserPositionListResult, QueryUserPositionDetailListByPlatformParams, QueryUserPositionDetailListByPlatformResult, QueryUserPositionDetailListByProductParams, QueryUserPositionDetailListByProductResult, QueryUserBalanceListParams, QueryUserBalanceListResult, CalculateSubscribeInfoParams, CalculateSubscribeInfoResult, CalculateRedeemInfoParams, CalculateRedeemInfoResult, GetAllTokenBalancesByAddressParams, GetAllTokenBalancesByAddressResult } from "./types";

export class OkxAPI {
  public defi: OkxDefiAPI;
  public wallet: OkxWalletAPI;

  constructor(apiKey: string, secretKey: string, passphrase: string) {
    this.defi = new OkxDefiAPI(apiKey, secretKey, passphrase);
    this.wallet = new OkxWalletAPI(apiKey, secretKey, passphrase);
  }
}

export class OkxAPIBase extends API {
  private okxApiKey: string;
  private okxSecretKey: string;
  private okxPassphrase: string;
  private lastRequestTime: number = 0;
  private rateLimitMs: number;

  constructor(apiKey: string, secretKey: string, passphrase: string, rateLimitMs: number = 1000) {
    super({ endpoint: 'https://www.okx.com' });
    this.okxApiKey = apiKey;
    this.okxSecretKey = secretKey;
    this.okxPassphrase = passphrase;
    this.rateLimitMs = rateLimitMs;
  }

  private preHash(timestamp: string, method: string, request_path: string, params: Record<string, any>, body: any) {
    // Create a pre-signature based on strings and parameters
    let query_string = '';
    if (params && Object.keys(params).length > 0) {
      query_string += '?' + querystring.stringify(params);
    }
    if (body) {
      query_string += JSON.stringify(body);
    }
    return timestamp + method + request_path + query_string;
  }

  private sign(message: string, secret_key: string) {
    // Use HMAC-SHA256 to sign the pre-signed string
    const hmac = crypto.createHmac('sha256', secret_key);
    hmac.update(message);
    return hmac.digest('base64');
  }

  private createSignature(method: string, request_path: string, params: Record<string, any>, body: any, secretKey: string) {
    // Get the timestamp in ISO 8601 format
    const timestamp = new Date().toISOString().slice(0, -5) + 'Z';
    // Generate a signature
    const message = this.preHash(timestamp, method, request_path, params, body);
    const signature = this.sign(message, secretKey);
    return { signature, timestamp };
  }

  private async enforceRateLimit() {
    const now = Date.now();
    const timeElapsed = now - this.lastRequestTime;

    if (this.rateLimitMs) {
      const delayMs = this.rateLimitMs - timeElapsed;
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    this.lastRequestTime = Date.now();
  }

  public async request(method: string, path: string, options: any) {
    await this.enforceRateLimit();

    const { signature, timestamp } = this.createSignature(method, path, options.params, options.json, this.okxSecretKey);
    const response = await super.request(method, path, {
      headers: {
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-KEY': this.okxApiKey,
        'OK-ACCESS-PASSPHRASE': this.okxPassphrase,
        'OK-ACCESS-PROJECT': '', // This applies only to WaaS APIs
        ...options.headers
      },
      ...options
    });
    if (response.code == 0) {
      return response.data;
    } else {
      throw new Error(`OKX API Error: ${response.detailMsg || response.error_message || response.msg || response}`)
    }
  }
}

export class OkxDefiAPI extends OkxAPIBase {
  public async getPlatformList(params: QueryPlatformListParams): Promise<QueryPlatformListResult> {
    return await super.request('GET', `/api/v5/defi/explore/protocol/list`, { params })
  }

  public async getTokenList(params: QueryTokenListParams): Promise<QueryTokenListResult> {
    return await super.request('GET', `/api/v5/defi/explore/token/list`, { params })
  }

  public async getProductList(params: QueryProductListParams): Promise<QueryProductListResult> {
    return await super.request('POST', `/api/v5/defi/explore/product/list`, { json: params })
  }

  public async getProductDetail(params: QueryProductDetailParams): Promise<QueryProductDetailResult> {
    return await super.request('GET', `/api/v5/defi/explore/product/detail`, { params })
  }

  public async getUserPositionList(params: QueryUserPositionListParams): Promise<QueryUserPositionListResult> {
    return await super.request('POST', `/api/v5/defi/user/asset/platform/list`, { json: params });
  }

  public async getUserPositionDetailListByPlatform(params: QueryUserPositionDetailListByPlatformParams): Promise<QueryUserPositionDetailListByPlatformResult> {
    return await super.request('POST', `/api/v5/defi/user/asset/platform/detail`, { json: params });
  }

  public async getUserPositionDetailListByProduct(params: QueryUserPositionDetailListByProductParams): Promise<QueryUserPositionDetailListByProductResult> {
    return await super.request('POST', `/api/v5/defi/user/investment/asset-detail`, { json: params });
  }

  public async getUserBalanceList(params: QueryUserBalanceListParams): Promise<QueryUserBalanceListResult> {
    return await super.request('POST', `/api/v5/defi/user/balance-list`, { json: params });
  }

  public async calculateSubscription(params: CalculateSubscribeInfoParams): Promise<CalculateSubscribeInfoResult> {
    return await super.request('POST', `/api/v5/defi/calculator/subscribe-info`, { json: params });
  }

  public async calculateRedemption(params: CalculateRedeemInfoParams): Promise<CalculateRedeemInfoResult> {
    return await super.request('POST', `/api/v5/defi/calculator/redeem-info`, { json: params });
  }
}

export class OkxWalletAPI extends OkxAPIBase {
  async getAllTokenBalancesByAddress(params: GetAllTokenBalancesByAddressParams): Promise<GetAllTokenBalancesByAddressResult> {
    return await super.request('GET', `/api/v5/wallet/asset/all-token-balances-by-address`, { params })
  }
}
