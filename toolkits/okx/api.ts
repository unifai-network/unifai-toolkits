import * as crypto from 'crypto';
import * as querystring from 'querystring';
import { API } from 'unifai-sdk';

export class OkxAPI extends API {
  private okxApiKey: string;
  private okxSecretKey: string;
  private okxPassphrase: string;

  constructor(apiKey: string, secretKey: string, passphrase: string) {
    super({ endpoint: 'https://www.okx.com' });
    this.okxApiKey = apiKey;
    this.okxSecretKey = secretKey;
    this.okxPassphrase = passphrase;
  }

  private preHash(timestamp: string, method: string, request_path: string, params: Record<string, any>, body: any) {
    // Create a pre-signature based on strings and parameters
    let query_string = '';
    if (params) {
      query_string += '?' + querystring.stringify(params);
    }
    if (body) {
      query_string += JSON.stringify(body);
    }
    return timestamp + method + request_path + query_string;
  }

  private sign(message: string, secret_key: string) {
    // Use HMAC-SHA256 to sign the pre-signed string
    const hmac = crypto.createHmac('sha256', secret_key);
    hmac.update(message);
    return hmac.digest('base64');
  }

  private createSignature(method: string, request_path: string, params: Record<string, any>, body: any, secretKey: string) {
    // Get the timestamp in ISO 8601 format
    const timestamp = new Date().toISOString().slice(0, -5) + 'Z';
    // Generate a signature
    const message = this.preHash(timestamp, method, request_path, params, body);
    const signature = this.sign(message, secretKey);
    return { signature, timestamp };
  }

  public async request(method: string, path: string, options: any) {
    const { signature, timestamp } = this.createSignature(method, path, options.params, options.json, this.okxSecretKey);
    return await super.request(method, path, {
      headers: {
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-KEY': this.okxApiKey,
        'OK-ACCESS-PASSPHRASE': this.okxPassphrase,
        'OK-ACCESS-PROJECT': '', // This applies only to WaaS APIs
        ...options.headers
      },
      ...options
    });
  }

  public async allTokenBalances(chains: string, address: string) {
    return await this.request('GET', `/api/v5/wallet/asset/all-token-balances-by-address`, { params: { chains, address } });
  }

  public async allDefiPositions(chains: string, walletAddress: string) {
    const chainIds = chains.split(',');
    const walletAddressList = chainIds.map(chainId => ({ chainId, walletAddress }));
    return await this.request('POST', `/api/v5/defi/user/asset/platform/list`, { json: { walletAddressList } });
  }
}
