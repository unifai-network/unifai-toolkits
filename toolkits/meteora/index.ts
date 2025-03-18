import { toolkit } from "./config";

import "./dlmm/addLiquidity";
import "./dlmm/createCustomizablePool";
import "./dlmm/createPool";
import "./dlmm/getPool";
import "./dlmm/getPosition";
import "./dlmm/getPositionsByUser";
import "./dlmm/removeLiquidity";
import "./dlmm/searchPools";

import "./dynamic/addLiquidity";
import "./dynamic/createCustomizablePool";
import "./dynamic/createPool";
import "./dynamic/getLpsByUser";
import "./dynamic/getPool";
import "./dynamic/lockLiquidity";
import "./dynamic/removeLiquidity";
import "./dynamic/searchPools";

async function main() {
  await toolkit.updateToolkit({
    name: "Meteora",
    description: "Meteora is a decentralized liquidity protocol on Solana offering advanced market-making solutions for efficient token trading.",
  });

  toolkit.event("ready", () => {
    console.log("Toolkit is ready to use");
  });

  await toolkit.run();
}

main().catch(console.error);
