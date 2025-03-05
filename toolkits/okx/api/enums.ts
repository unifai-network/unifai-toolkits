export enum Chain {
  BTC = 0,
  Ethereum = 1,
  Optimism = 10,
  // Rootstock = 30,
  BNB = 56,
  // OKTC = 66,
  // Cosmos = 118,
  // Unichain = 130,
  Polygon = 137,
  // Manta_Pacific = 169,
  TRON = 195,
  // X_Layer = 196,
  // zkSync_Era = 324,
  Solana = 501,
  // Ton = 607,
  // Aptos = 637,
  SUI = 784,
  // Conflux = 1030,
  // Metis = 1088,
  // Polygon_zkEVM = 1101,
  // Core = 1116,
  // Moonbeam = 1284,
  // Sei_EVM = 1329,
  // STORY = 1514,
  // Merlin_Chain = 4200,
  // Mantle = 5000,
  // Stacks = 5757,
  Base = 8453,
  // Starknet = 9004,
  // Immutable_zkEVM = 13371,
  // Mode_Network = 34443,
  // Arbitrum_One = 42161,
  Avalanche_C = 43114,
  // Zircuit = 48900,
  // Linea = 59144,
  // Berachain = 80094,
  // Blast = 81457,
  // Taiko = 167000,
  // Scroll = 534352,
  // Celestia = 70000037,
  // Injective = 70000041,
  // Reya_Network = 70000063,
}

export enum Network {
  ETH = "ETH",
  BSC = "BSC",
  // MATIC = "MATIC",
  AVAX = "AVAX",
  TRON = "TRON",
  // ARB = "ARB",
  OP = "OP",
  // APTOS = "APTOS",
  // ZKSYNC = "ZKSYNC",
  SUI = "SUI",
  SOL = "SOL",
  POLYGONZK = "POLYGONZK",
  BASE = "BASE",
  // METIS = "METIS",
  // CELESTIA = "CELESTIA",
  // COSMOS = "COSMOS",
  // INJECTIVE = "INJECTIVE",
  // MERLIN = "MERLIN",
  BTC = "BTC",
  // SCROLL = "SCROLL",
  // TON = "TON",
  // EVMSEI = "EVMSEI",
  // TAIKO = "TAIKO",
  // MOONBEAM = "MOONBEAM",
  // STORY = "STORY",
}

export enum SimplifyInvestType {
  Stablecoin = 100,
  Single = 101,
  Multi = 102,
  Vaults = 103,
}

export enum InvestType {
  Saving = 1,
  LiquidityPool = 2,
  Farming = 3,
  Vaults = 4,
  Staking = 5,
}

export enum InvestRateType {
  APY = 0,
  APR = 1,
}

export enum InvestTokenType {
  InterestEarnings = 0,
  MiningEarnings = 1,
  TransactionFees = 2,
  Bonus = 3,
}

export enum InvestOrderType {
  BuyAuthorization = 3,
  RedemptionAuthorization = 4,
  EnterFarm = 8,
  LeaveFarm = 9,
}

export enum AuthorizationType {
  Subscription = 3,
  Redemption = 4,
  Claim = 5,
}
