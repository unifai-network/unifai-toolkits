import { API } from 'unifai-sdk';

export class DexscreenerAPI extends API {
  constructor() {
    super({endpoint: 'https://api.dexscreener.com'});
  }

  public async searchToken(q: string) {
    return await this.request('GET', `/latest/dex/search`, { params: { q } });
  }
}
