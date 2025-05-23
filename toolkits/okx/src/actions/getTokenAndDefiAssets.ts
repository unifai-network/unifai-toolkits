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
      "description": "List of blockchain names to retrieve token balances from. Ensure that all specified chains share the same wallet address format (e.g., multiple EVM-compatible chains). Avoid mixing chains with different wallet address formats (e.g., EVM and Solana)."
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

    let tokenBalances = [];
    let tokenBalancesError: Error | null = null;
    try {
      tokenBalances = await okxApi.wallet.getAllTokenBalancesByAddress({
        chains: chainIds.join(','),
        address,
      });
  
      tokenBalances.forEach(data => data.tokenAssets.forEach(asset => {
        asset['chainName'] = Chain[asset.chainIndex];
        asset['balanceValue'] = Number(asset.balance) * Number(asset.tokenPrice);
      }));
    } catch (error) {
      tokenBalancesError = error;
    }

    let defiPositions = [];
    let defiPositionsError: Error | null = null;
    try {
      defiPositions = await okxApi.defi.getUserPositionList({
        walletAddressList: chainIds.map(chainId => ({ chainId, walletAddress: address })),
      }).then(res => res.walletIdPlatformList);

      for (const platform of defiPositions.flatMap(data => data.platformList)) {
        const chainIds = Array.from(new Set(platform.networkBalanceVoList.map(vo => {
          const chainId = vo.chainId;
          delete vo.chainId;
          vo['chain'] = Chain[chainId];
          return chainId;
        })));
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const positionDetail = await okxApi.defi.getUserPositionDetailListByPlatform({
            analysisPlatformId: String(platform.analysisPlatformId),
            accountIdInfoList: [
              {
                walletAddressList: chainIds.map(chainId => ({
                  chainId: String(chainId),
                  walletAddress: address,
                }))
              }
            ]
          });
          platform['details'] = positionDetail.walletIdPlatformDetailList.map(data => {
            data.networkHoldVoList.forEach(vo => {
              vo['chain'] = Chain[vo.chainId];
              delete vo.chainId;
            });
            return data;
          });
        } catch { }
      }
    } catch (error) {
      defiPositionsError = error;
    }

    return ctx.result({
      tokenAssets: tokenBalancesError ? {
        success: false,
        error: tokenBalancesError.message,
      } : {
        success: true,
        data: tokenBalances.flatMap(data => data.tokenAssets)
      },
      defiAssets: defiPositionsError ? {
        success: false,
        error: defiPositionsError.message,
      } : {
        success: true,
        data: defiPositions.flatMap(data => data.platformList)
      }
    });
  } catch (error) {
    return ctx.result({ error: `Failed to get all token balances: ${error}` });
  }
});
