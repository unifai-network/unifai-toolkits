import { ActionContext } from "unifai-sdk";
import { okxApi, toolkit } from "../config";

toolkit.action({
  action: "getSupportedDefiPlatforms",
  actionDescription: "Retrieve a list of all DeFi platforms supported by OKX, including details such as platform IDs, official names, and websites.",
  payloadDescription: {
    "platformId": {
      "type": "string",
      "required": false,
      "description": "Specific platform ID to query. If omitted, all platforms are returned."
    },
    "platformName": {
      "type": "string",
      "required": false,
      "description": "Specific platform official name to query. If omitted, all platforms are returned."
    }
  }
}, async (ctx: ActionContext, payload: any = {}) => {
  try {
    const platforms = await okxApi.defi.getPlatformList(payload);

    platforms.forEach(platform => {
      delete platform.platformMinInfos;
    });

    return ctx.result({
      platforms,
    });
  } catch (error) {
    return ctx.result({ error: `Failed to get platforms: ${error}` });
  }
});
