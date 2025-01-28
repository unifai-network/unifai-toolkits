import { API, APIConfig } from 'unifai-sdk';

const API_ENDPOINT = 'https://api.coingecko.com/api/v3';

export class CoingeckoAPI extends API {
  constructor(config: APIConfig = {apiKey: ''}) {
    if (!config.endpoint) {
      config.endpoint = API_ENDPOINT;
    }
    super(config);
  }

  public async searchToken(query: string) {
    return await this.request('GET', `/search`, { params: { query } });
  }

  public async getTokenInfo(id: string) {
    return await this.request('GET', `/coins/${id}`, { params: { id } });
  }
}
