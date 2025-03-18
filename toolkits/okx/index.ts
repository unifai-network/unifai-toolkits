import { toolkit } from "./config";

import "./actions/claimDefiInvestmentBonus";
import "./actions/estimateDefiInvestmentRedemption";
import "./actions/estimateDefiInvestmentSubscription";
import "./actions/getSupportedDefiPlatforms";
import "./actions/getDefiInvestmentDetails";
import "./actions/getDefiInvestmentProducts";
import "./actions/getTokenAndDefiAssets";
import "./actions/redeemDefiInvestment";
import "./actions/subscribeDefiInvestment";

async function main() {
  await toolkit.updateToolkit({
    name: 'OKX',
    description: "OKX OS offers the most powerful data querying capabilities, deeply analyzing asset data, transaction history, project information, and more.",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  await toolkit.run();
}

main().catch(console.error);
