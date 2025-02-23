import { API } from 'unifai-sdk';

const TIMEOUT = 30_000;

export class MeteoraDynamicAPI extends API {
  constructor() {
    super({ endpoint: 'https://amm-v2.meteora.ag' });
  }

  public async searchPools(params: {
    page?: number;
    size?: number;
    include_token_mints?: string | string[];
    include_pool_token_pairs?: string | string[];
    hide_low_tvl?: number;
    hide_low_apr?: boolean;
  }) {
    return await this.request('GET', '/pools/search', { params, timeout: TIMEOUT })
  }
}
