import { API } from 'unifai-sdk';

export class ElfaV2API extends API {
  private headers: Record<string, string>;

  constructor(apiKey: string) {
    super({ endpoint: 'https://api.elfa.ai/v2' });
    this.headers = {
      'accept': 'application/json',
      'x-elfa-api-key': apiKey
    };
  }

  public async getTrendingTokens(params: {
    timeWindow?: string;
    from?: number;
    to?: number;
    page?: number;
    pageSize?: number;
    minMentions?: number;
  } = {}) {
    const {
      timeWindow = '7d',
      from,
      to,
      page = 1,
      pageSize = 50,
      minMentions = 5
    } = params;

    const queryParams: Record<string, any> = {
      page,
      pageSize,
      minMentions
    };

    // Either provide timeWindow OR both from and to
    if (from && to) {
      queryParams.from = from;
      queryParams.to = to;
    } else {
      queryParams.timeWindow = timeWindow;
    }

    return await this.request('GET', `/aggregations/trending-tokens`, {
      headers: this.headers,
      params: queryParams,
    });
  }

  public async getEventSummary(params: {
    keywords: string;
    timeWindow?: string;
    from?: number;
    to?: number;
    searchType?: string;
  }) {
    const {
      keywords,
      timeWindow = '7d',
      from,
      to,
      searchType = 'or'
    } = params;

    const queryParams: Record<string, any> = {
      keywords,
      searchType
    };

    // Either provide timeWindow OR both from and to
    if (from && to) {
      queryParams.from = from;
      queryParams.to = to;
    } else {
      queryParams.timeWindow = timeWindow;
    }

    return await this.request('GET', `/data/event-summary`, {
      headers: this.headers,
      params: queryParams,
      timeout: 30000,
    });
  }
}
