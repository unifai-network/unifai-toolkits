import { API } from 'unifai-sdk';

export class DappRadarAPI extends API {
  constructor(apiKey: string) {
    super({ endpoint: 'https://apis.dappradar.com/v2', apiKey });
  }

  // Get Dapps by search
  public async searchDapps(params: {
    chain?: string;
    smartContract?: string;
    website?: string;
    name?: string;
    page?: number;
    resultsPerPage?: number;
  }) {
    return await this.request('GET', '/dapps/search', { 
      params,
      headers: { 'X-API-KEY': this.getApiKey() }
    });
  }

  // Get top Dapps
  public async getTopDapps(metric: string, params: {
    chain?: string;
    category?: number;
    range?: string;
    top?: number;
  }) {
    return await this.request('GET', `/dapps/top/${metric}`, { 
      params,
      headers: { 'X-API-KEY': this.getApiKey() }
    });
  }
  
  // Get single Dapp data
  public async getDappData(dappId: number, params: {
    chain?: string;
    range?: string;
  }) {
    return await this.request('GET', `/dapps/${dappId}`, { 
      params,
      headers: { 'X-API-KEY': this.getApiKey() }
    });
  }

  // Get historical Dapp data
  public async getDappHistoricalData(dappId: number, metric: string, params: {
    chain?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    return await this.request('GET', `/dapps/${dappId}/history/${metric}`, { 
      params,
      headers: { 'X-API-KEY': this.getApiKey() }
    });
  }

  // Get multiple DeFi dapps data
  public async getDefiDapps(params: {
    chain?: string;
    page?: number;
    resultsPerPage?: number;
    sort?: string;
    order?: string;
    range?: string;
  }) {
    return await this.request('GET', '/defi/dapps', { 
      params,
      headers: { 'X-API-KEY': this.getApiKey() }
    });
  }

  // Get single DeFi dapp data
  public async getDefiDappData(dappId: number, params: {
    chain?: string;
  }) {
    return await this.request('GET', `/defi/dapps/${dappId}`, { 
      params,
      headers: { 'X-API-KEY': this.getApiKey() }
    });
  }

  private getApiKey(): string {
    const apiKey = this.apiKey;
    if (!apiKey) {
      throw new Error('API key is required for DappRadar API');
    }
    return apiKey;
  }
} 