import * as dotenv from "dotenv";
dotenv.config();

import { Toolkit, ActionContext, TransactionAPI } from "unifai-sdk";

async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });
  const api = new TransactionAPI({ apiKey: process.env.TOOLKIT_API_KEY });

  await toolkit.updateToolkit({
    name: "Orbiter finance",
    description:
      "Orbiter Finance enables cross-rollup transactions of Ethereum native assets in a trustless and seamless manner. We support various networks, including Ethereum, Mantle, Base, StarkNet, opBNB, Scroll, Arbitrum, Optimism, Polygon, BNB Chain, etc..",
  });

  toolkit.event("ready", () => {
    console.log("Toolkit is ready to use");
  });

  toolkit.action(
    {
      action: "cross-chain-transfer",
      actionDescription: "Cross-chain transfer tokens",
      payloadDescription: {
        srcChainId: {
          type: "number",
          description:
            "Source evm chain id, for example: 1 for ETH, 56 for BSC, 137 for Polygon, 8453 for Base, etc",
          required: true,
        },
        dstChainId: {
          type: "number",
          description:
            "Destination evm chain id, for example: 1 for ETH, 56 for BSC, 137 for Polygon, 8453 for Base, etc",
          required: true,
        },
        srcTokenSymbol: {
          type: "string",
          description: "Source token symbol, for example: ETH, USDC, USDT, BNB, BTCB, etc.",
          required: true,
        },
        dstTokenSymbol: {
          type: "string",
          description: "Destination token symbol, for example: ETH, USDC, USDT, BNB, BTCB, etc.",
          required: true,
        },
        amount: {
          type: "string",
          description: `Amount of source tokens to transfer, for example: '10', '10.05'`,
          required: true,
        },
      },
    },
    async (ctx: ActionContext, payload: any = {}) => {
      try {
        const result = await api.createTransaction("orbiter/transfer", ctx, payload);
        return ctx.result(result);
      } catch (error) {
        return ctx.result({ error: `Failed to create transaction: ${error}` });
      }
    }
  );

  await toolkit.run();
}

main().catch(console.error);
