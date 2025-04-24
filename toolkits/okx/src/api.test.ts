import { OkxAPI } from "./api";
import * as dotenv from "dotenv";

dotenv.config();

(async () => {
  const api = new OkxAPI(process.env.OKX_API_KEY, process.env.OKX_SECRET_KEY, process.env.OKX_PASSPHRASE);

  const result2 = await api.defi.getUserPositionList({
    walletAddressList: [
      {
        chainId: '130',
        walletAddress: '0x0b4407469aa5033345a7cc222469f23b285b9e44'
      }
    ]
  });
  console.log(JSON.stringify(result2));
  for(let i = 0; i < result2.walletIdPlatformList.length; i++) {
    const platform = result2.walletIdPlatformList[0].platformList[i];
    const positionList = await api.defi.getUserPositionDetailListByPlatform({
      analysisPlatformId: platform.analysisPlatformId.toString(),
      accountIdInfoList: [
        {
          walletAddressList: [
            {
              chainId: '130',
              walletAddress: '0x0b4407469aa5033345a7cc222469f23b285b9e44'
            }
          ]
        }
      ]
    });
    console.log(JSON.stringify(positionList));
  }
})();
