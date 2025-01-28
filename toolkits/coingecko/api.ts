import { API } from 'unifai-sdk';

export class CoingeckoAPI extends API {
  constructor() {
    super({endpoint: 'https://api.coingecko.com/api/v3'});
  }

  public async searchToken(query: string) {
    return await this.request('GET', `/search`, { params: { query } });
  }

  public async getTokenInfo(id: string) {
    return await this.request('GET', `/coins/${id}`, { params: { id } });
  }
}
