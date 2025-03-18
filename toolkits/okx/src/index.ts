import { toolkit } from "./config";
import { Chain } from "./api/enums";
import { allPlatforms, enumKeys } from "./utils";

import "./actions/estimateInvestmentRedemption";
import "./actions/estimateInvestmentSubscription";
import "./actions/getInvestmentDetails";
import "./actions/searchInvestments";
import "./actions/getTokenAndDefiAssets";
import "./actions/redeemInvestment";
import "./actions/subscribeInvestment";

async function main() {
  await toolkit.updateToolkit({
    name: 'OKX DeFi',
    description: `OKX DeFi is a one-stop Web3 yield platform, aggregating opportunities across multiple networks/chains (e.g., ${enumKeys(Chain).join(', ')}) and protocols/platforms (e.g., ${allPlatforms.join(', ')}) for seamless asset management.`,
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  await toolkit.run();
}

main().catch(console.error);
