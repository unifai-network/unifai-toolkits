import { Chain, Network } from "./api/enums";
import { AvaxPlatform, BasePlatform, BscPlatform, EthPlatform, OpPlatform, PolygonPlatform, SolPlatform } from "./constants";

export const enumKeys = (enumObject: Object) => Object.keys(enumObject).filter(key => isNaN(Number(key)));

export const chain2network = (chain: Chain) => {
  switch (chain) {
    case Chain.Ethereum: return Network.ETH;
    case Chain.BNB: return Network.BSC;
    case Chain.Avalanche_C: return Network.AVAX;
    case Chain.Optimism: return Network.OP;
    case Chain.Solana: return Network.SOL;
    case Chain.Polygon: return Network.POLYGONZK;
    case Chain.Base: return Network.BASE;
  }
}

export const network2chain = (network: Network) => {
  switch (network) {
    case Network.ETH: return Chain.Ethereum;
    case Network.BSC: return Chain.BNB;
    case Network.AVAX: return Chain.Avalanche_C;
    case Network.OP: return Chain.Optimism;
    case Network.SOL: return Chain.Solana;
    case Network.POLYGONZK: return Chain.Polygon;
    case Network.BASE: return Chain.Base;
  }
}

export const getPlatformId = (chain: Chain, platform: string) => {
  switch (chain) {
    case Chain.Solana: return SolPlatform[platform];
    case Chain.Ethereum: return EthPlatform[platform];
    case Chain.BNB: return BscPlatform[platform];
    case Chain.Avalanche_C: return AvaxPlatform[platform];
    case Chain.Optimism: return OpPlatform[platform];
    case Chain.Polygon: return PolygonPlatform[platform];
    case Chain.Base: return BasePlatform[platform];
  }
}

export const allPlatforms = Array.from(new Set([
  ...enumKeys(SolPlatform),
  ...enumKeys(EthPlatform),
  ...enumKeys(BscPlatform),
  ...enumKeys(AvaxPlatform),
  ...enumKeys(OpPlatform),
  ...enumKeys(PolygonPlatform),
  ...enumKeys(BasePlatform),
]));
