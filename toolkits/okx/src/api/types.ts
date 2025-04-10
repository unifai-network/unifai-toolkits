import type { InvestType, InvestRateType, SimplifyInvestType, InvestOrderType, InvestTokenType, AuthorizationType } from "./enums";

export type QueryPlatformListParams = {
  platformId?: string;
  platformName?: string;
}

export type QueryPlatformListResult = Array<{
  platformId: string;
  platformName: string;
  platformWebSite: string;
  investmentApiUrlPattern: string;
  investmentPageUrlPattern: string;
  platformMinInfos: {
    investmentId: string;
    protocolId: string;
    network: string;
    chainId?: string;
  }[];
}>;

export type QueryTokenListParams = {
  tokenAddress?: string;
  chainId?: string;
}

export type QueryTokenListResult = Array<{
  symbol: string;
  tokenInfos: {
    tokenId: string;
    tokenSymbol: string;
    network: string;
    logoUrl: string;
    tokenAddress: string;
  }[];
}>;

export type QueryProductListParams = {
  simplifyInvestType: SimplifyInvestType;
  network: string;
  poolVersion?: string;
  platformIds?: string[];
  sort?: {
    orders?: {
      direction: "ASC" | "DESC";
      property: "TVL" | "RATE";
    }[];
  };
  tokenIds?: string[];
  offset?: string;
  limit: string;
};

export type QueryProductListResult = {
  investments: {
    investmentId: string;
    investmentName: string;
    chainId: string;
    rate: string;
    investType: InvestType;
    platformName: string;
    platformId: string;
    poolVersion: string;
    rateType: InvestRateType;
    tvl: string;
    underlyingToken: {
      isBaseToken: boolean;
      tokenAddress: string;
      tokenSymbol: string;
    }[];
  }[];
  total: string;
};

export type QueryProductDetailParams = {
  investmentId: string;
  investmentCategory?: string;
};

export type QueryProductDetailResult = {
  investmentId: string;
  investmentName: string;
  chainId: string;
  rate: string;
  investType: InvestType;
  platformName: string;
  platformId: string;
  analysisPlatformId: string;
  rateType: InvestRateType;
  tvl: string;
  underlyingToken: {
    isBaseToken: boolean;
    tokenAddress: string;
    tokenSymbol: string;
  }[];
  rateDetails?: {
    tokenAddress: string;
    tokenSymbol: string;
    rate: string;
    type: InvestRateType;
  }[];
  isInvestable: boolean;
  utilizationRate: string;
  earnedToken: {
    isBaseToken: boolean;
    tokenAddress: string;
    tokenSymbol: string;
  }[];
  lpToken: {
    isBaseToken: boolean;
    tokenAddress: string;
    tokenSymbol: string;
  }[];
};


export type QueryUserPositionListParams = {
  walletAddressList: {
    chainId: string;
    walletAddress: string;
  }[];
};

export type QueryUserPositionListResult = {
  walletIdPlatformList: {
    platformList: {
      platformName: string;
      analysisPlatformId: number;
      platformLogo: string;
      platformColor: string;
      currencyAmount: string;
      isSupportInvest: boolean;
      bonusTag: number;
      platformUrl: string;
      networkBalanceVoList: {
        network: string;
        networkLogo: string;
        chainId: number;
        currencyAmount: string;
      }[];
      investmentCount: number;
    }[];
    walletId: string;
    totalAssets: string;
  }[];
  lpTokenAddressList: {
    chainId: number;
    tokenAddress: string;
  }[];
  updateAt: number;
  assetStatus: number;
};

export type QueryUserPositionDetailListByPlatformParams = {
  analysisPlatformId: string;
  accountIdInfoList: {
    walletAddressList: {
      chainId: string;
      walletAddress: string;
    }[];
  }[];
};

export type QueryUserPositionDetailListByPlatformResult = {
  walletIdPlatformDetailList: {
    networkHoldVoList: {
      network: string;
      chainId: string;
      investTokenBalanceVoList: {
        investType: string;
        assetsTokenList: {
          tokenSymbol: string;
          tokenLogo: string;
          coinAmount: string;
          currencyAmount: string;
          tokenPrecision: number;
          tokenAddress: string;
          network: string;
        }[];
        rewardDefiTokenInfo: any[];
        totalValue: string;
      }[];
      availableRewards: any[];
      airDropRewardInfo: any[];
    }[];
    accountId: string;
  }[];
  platformName: string;
  analysisPlatformId: number;
  platformLogo: string;
  platformUrl: string;
};

export type QueryUserPositionDetailListByProductParams = {
  address: string;
  chainId?: string;
  investmentId: string;
  poolId?: string;
  farmInvestmentId?: string;
};

export type QueryUserPositionDetailListByProductResult = Array<{
  investmentName: string;
  investmentId: string;
  sourceInvestmentId: string;
  investType: string;
  investName: string;
  assetsTokenList: {
    tokenSymbol: string;
    tokenAddress: string;
    tokenPrecision: string;
    coinAmount: string;
    currencyAmount: string;
  }[];
  rewardDefiTokenInfo: {
    baseDefiTokenInfos: {
      tokenSymbol: string;
      tokenAddress: string;
      tokenPrecision: string;
      coinAmount: string;
      currencyAmount: string;
      network: string;
    }[];
    rewardType: string;
  }[];
  totalValue: string;
}>;

export type QueryUserBalanceListParams = {
  chainId: string;
  address: string;
  tokenAddressList: string[];
};

export type QueryUserBalanceListResult = Array<{
  tokenSymbol: string;
  tokenName: string;
  tokenLogo: string;
  tokenAddress: string;
  network: string;
  chainId: string;
  tokenPrecision: string;
  isBaseToken: boolean;
  coinAmount: string;
  currencyAmount: string;
  browserUrl: string;
}>;

export type CalculateSubscribeInfoParams = {
  address?: string;
  inputAmount: string;
  investmentCategory?: string;
  investmentId: string;
  inputTokenAddress: string;
  isSingle?: boolean;
  slippage?: string;
};

export type CalculateSubscribeInfoResult = {
  validatorName: string;
  isAllowSubscribe: boolean;
  estimateGasFee: string;
  isSwapInvest: boolean;
  exchangeRate: string;
  investWithTokenList: {
    tokenSymbol: string;
    tokenName: string;
    tokenAddress: string;
    tokenPrecision: string;
    isBaseToken: boolean;
    network: string;
    chainId: string;
    coinAmount: string;
    currencyAmount: string;
  }[];
  gainsTokenList: {
    tokenSymbol: string;
    tokenName: string;
    tokenAddress: string;
    tokenPrecision: string;
    isBaseToken: boolean;
    network: string;
    chainId: string;
    coinAmount: string;
    dataType: InvestTokenType;
  }[];
  receiveTokenInfo: {
    tokenSymbol: string;
    tokenName: string;
    tokenAddress: string;
    tokenPrecision: string;
    network: string;
    chainId: string;
    coinAmount: string;
  };
  approveStatusList?: {
    tokenSymbol: string;
    tokenAddress: string;
    tokenPrecision: string;
    isNeedApprove: boolean;
    approveAddress: string;
    network: string;
    chainId: string;
    orderType: InvestOrderType;
  }[];
};

export type CalculateRedeemInfoParams = {
  address?: string;
  inputTokenAmount: string;
  investmentCategory?: string;
  investmentId: string;
  isSingle?: boolean;
  outputTokenAddress: string;
  slippage?: string;
};

export type CalculateRedeemInfoResult = {
  isAllowRedeem: boolean;
  estimateGasFee: string;
  isSwapInvest: boolean;
  inputCurrencyAmount: string;
  receiveTokenList: {
    tokenSymbol: string;
    tokenName: string;
    tokenAddress: string;
    tokenPrecision: string;
    isBaseToken: boolean;
    network: string;
    chainId: string;
    coinAmount: string;
    currencyAmount: string;
    dataType: string;
  }[];
  swapFromTokenList: {
    tokenSymbol: string;
    tokenName: string;
    tokenAddress: string;
    tokenPrecision: string;
    isBaseToken: boolean;
    network: string;
    chainId: string;
    coinAmount: string;
    currencyAmount: string;
  }[];
  mySupply: {
    tokenSymbol: string;
    tokenName: string;
    tokenAddress: string;
    tokenPrecision: string;
    isBaseToken: boolean;
    network: string;
    chainId: string;
    coinAmount: string;
    currencyAmount: string;
  };
  approveStatusList?: {
    tokenSymbol: string;
    tokenAddress: string;
    tokenPrecision: string;
    isNeedApprove: boolean;
    approveAddress: string;
    network: string;
    chainId: string;
    orderType: string;
  }[];
};

export type GetAllTokenBalancesByAddressParams = {
  address: string;
  chains: string;
  filter?: string;
};

export type GetAllTokenBalancesByAddressResult = Array<{
  tokenAssets: {
    chainIndex: string;
    tokenAddress: string;
    address: string;
    symbol: string;
    balance: string;
    rawBalance: string;
    tokenPrice: string;
    tokenType: string;
    transferAmount: string;
    availableAmount: string;
    isRiskToken: boolean;
  }[];
}>;


