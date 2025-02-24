import { API } from 'unifai-sdk';

const TIMEOUT = 30_000;

export class MeteoraDynamicAPI extends API {
  constructor() {
    super({ endpoint: 'https://amm-v2.meteora.ag' });
  }

  public async searchPools(params: {
    page?: number;
    size?: number;
    sort_key?: 'tvl' | 'volume' | 'fee_tvl_ratio';
    order_by?: 'asc' | 'desc';
    include_pool_token_pairs?: string | string[];
    include_token_mints?: string | string[];
    hide_low_tvl?: number;
    hide_low_apr?: boolean;
  }) {
    params['pool_type'] = 'dynamic';
    return await this.request('GET', '/pools/search', { params, timeout: TIMEOUT })
  }
}
