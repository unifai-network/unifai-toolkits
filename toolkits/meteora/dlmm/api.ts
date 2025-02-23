import { API } from 'unifai-sdk';

const TIMEOUT = 30_000;

export class MeteoraDlmmAPI extends API {
  constructor() {
    super({ endpoint: 'https://dlmm-api.meteora.ag' });
  }

  public async getPool(lbPair: string) {
    return await this.request('GET', `/pair/${lbPair}`, { timeout: TIMEOUT });
  }

  public async searchPools(params: {
    page?: number;
    limit?: number;
    skip_size?: number;
    include_token_mints?: string | string[];
    include_pool_token_pairs?: string | string[];
    hide_low_tvl?: number;
    hide_low_apr?: boolean;
  }) {
    return await this.request('GET', '/pair/all_by_groups', { params, timeout: TIMEOUT })
  }

  public async getPosition(position: string) {
    return await this.request('GET', `/position/${position}`, { timeout: TIMEOUT });
  }
}
