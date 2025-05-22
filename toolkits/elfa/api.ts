import { API } from 'unifai-sdk';

export class ElfaAPI extends API {
  private headers: Record<string, string>;

  constructor(apiKey: string) {
    super({endpoint: 'https://api.elfa.ai/v1'});
    this.headers = {
      'accept': 'application/json',
      'x-elfa-api-key': apiKey
    }
  }

  public async trendingTokens(timeWindow: string = '24h', pageSize: number = 50, minMentions: number = 10) {
    return await this.request('GET', `/trending-tokens`, {
      headers: this.headers,
      params: { timeWindow, pageSize, minMentions },
    });
  }

  public async mentionsSearch(keywords: string, from: number, to: number, limit: number = 30) {
    return await this.request('GET', `/mentions/search`, {
      headers: this.headers,
      params: { keywords, from, to, limit },
    });
  }

  public async topMentions(ticker: string, timeWindow: string = '24h', pageSize: number = 10, includeAccountDetails: boolean = true) {
    return await this.request('GET', `/top-mentions`, {
      headers: this.headers,
      params: { ticker, timeWindow, pageSize, includeAccountDetails },
    });
  }
}
