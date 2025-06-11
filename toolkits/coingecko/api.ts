import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// First check if COINGECKO_API_KEY is already available
let defaultApiKey = process.env.COINGECKO_API_KEY || '';

// If not found, selectively load only COINGECKO_API_KEY from relative .env file
if (!defaultApiKey) {
  try {
    const envPath = path.resolve(__dirname, '.env');
    const envFileContent = fs.readFileSync(envPath, 'utf8');
    const parsed = dotenv.parse(envFileContent);
    defaultApiKey = parsed.COINGECKO_API_KEY;
  } catch (error) {
  }
}

import { API } from 'unifai-sdk';

export class CoingeckoAPI extends API {
  private headers: Record<string, string>;

  constructor() {
    super({ endpoint: 'https://pro-api.coingecko.com/api/v3' });
    this.headers = {
      'x-cg-pro-api-key': process.env.COINGECKO_API_KEY || defaultApiKey,
    };
  }

  public async searchToken(query: string) {
    return await this.request('GET', `/search`, { params: { query }, headers: this.headers });
  }

  public async getTokenInfo(id: string) {
    return await this.request('GET', `/coins/${id}`, { params: { id }, headers: this.headers });
  }

  public async searchPools(query: string, network: string) {
    return await this.request('GET', `/onchain/search/pools`, { params: { query, network }, headers: this.headers });
  }
}
