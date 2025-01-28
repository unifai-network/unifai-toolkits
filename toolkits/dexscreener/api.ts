import { ActionContext, API, APIConfig } from 'unifai-sdk';

const API_ENDPOINT = 'https://api.dexscreener.com';

export class CoingeckoAPI extends API {
  constructor(config: APIConfig = {apiKey: ''}) {
    if (!config.endpoint) {
      config.endpoint = API_ENDPOINT;
    }
    super(config);
  }

  public async searchToken(q: string) {
    return await this.request('GET', `/latest/dex/search`, { params: { q } });
  }
}
