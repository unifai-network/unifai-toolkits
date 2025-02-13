import { API } from 'unifai-sdk';

export class GoplusAPI extends API {
  constructor() {
    super({endpoint: 'https://api.gopluslabs.io/api/v1'});
  }

  public async tokenSecurity(chainId: string, contractAddress: string) {
    return await this.request('GET', `/token_security/${chainId}`, { params: { contract_addresses: contractAddress } });
  }

  public async solanaTokenSecurity(contractAddress: string) {
    return await this.request('GET', `/solana/token_security`, { params: { contract_addresses: contractAddress } });
  }

  public async suiTokenSecurity(contractAddress: string) {
    return await this.request('GET', `/sui/token_security`, { params: { contract_addresses: contractAddress } });
  }
}
