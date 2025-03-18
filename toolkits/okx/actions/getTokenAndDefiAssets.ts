import { ActionContext } from "unifai-sdk";
import { Chain } from "../api/enums";
import { okxApi, toolkit } from "../config";
import { enumKeys } from "../utils";

toolkit.action({
  action: "getTokenAndDefiAssets",
  actionDescription: "Retrieve all token balances and DeFi positions/investments for a specified wallet address across multiple supported chains and networks.",
  payloadDescription: {
    "chains": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": enumKeys(Chain)
      },
      "required": true,
      "description": "List of blockchain networks to retrieve token balances from. Ensure that all specified chains share the same wallet address format (e.g., multiple EVM-compatible chains). Avoid mixing chains with different wallet address formats (e.g., EVM and Solana)."
    },
    "address": {
      "type": "string",
      "required": true,
      "description": "The wallet address for which to retrieve token balances and DeFi positions."
    }
  }
}, async (ctx: ActionContext, payload: any = {}) => {
  try {
    const chainIds = (payload.chains as string[]).map(c => String(Chain[c]));
    const address = payload.address;

    const tokenBalances = await okxApi.wallet.getAllTokenBalancesByAddress({
      chains: chainIds.join(','),
      address,
    });

    tokenBalances.forEach(data => data.tokenAssets.forEach(asset => {
      asset['chainName'] = Chain[asset.chainIndex];
      asset['balanceValue'] = Number(asset.balance) * Number(asset.tokenPrice);
    }));

    const defiPositions = await okxApi.defi.getUserPositionList({
      walletAddressList: chainIds.map(chainId => ({ chainId, walletAddress: address })),
    }).then(res => res.walletIdPlatformList);

    for (const platform of defiPositions.flatMap(data => data.platformList)) {
      const chainIds = Array.from(new Set(platform.networkBalanceVoList.map(vo => {
        vo['chainName'] = Chain[vo.chainId];
        return vo.chainId;
      })));
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const positionDetail = await okxApi.defi.getUserPositionDetailListByPlatform({
          analysisPlatformId: String(platform.analysisPlatformId),
          walletAddressList: chainIds.map(chainId => ({
            chainId: String(chainId),
            walletAddress: address,
          })),
        });
        platform['details'] = positionDetail.walletIdPlatformDetailList.map(data => {
          data.networkHoldVoList.forEach(vo => {
            vo['chainName'] = Chain[vo.chainId];
          });
          return data;
        });
      } catch { }
    }

    return ctx.result({
      tokenAssets: tokenBalances,
      defiAssets: defiPositions,
    });
  } catch (error) {
    return ctx.result({ error: `Failed to get all token balances: ${error}` });
  }
});
