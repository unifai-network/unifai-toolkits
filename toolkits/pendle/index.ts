import { toolkit } from "./src/config";
import "./src/actions/getListMarket";
import "./src/actions/mint";

async function main() {
  await toolkit.updateToolkit({
    name: "Pendle",
    description:
      "A decentralized finance protocol enabling yield decomposition and forward yield trading on EVM-compatible chains. Through tokenization of yield-bearing assets into SY (Standardized Yield Tokens), users can split assets into principal (PT) and yield (YT) components, create liquidity pools, and implement advanced yield management strategies like hedging, leveraged yield exposure, or fixed-rate yield locking.",
  });
  
  toolkit.event("ready", () => {
    console.log("Pendle toolkit is ready to use");
  });

  await toolkit.run();
}

main().catch(console.error);
