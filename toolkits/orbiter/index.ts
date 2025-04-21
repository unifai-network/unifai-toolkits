import * as dotenv from "dotenv";
dotenv.config();

import { Toolkit, ActionContext, TransactionAPI } from "unifai-sdk";

async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });
  const api = new TransactionAPI({ apiKey: process.env.TOOLKIT_API_KEY });

  await toolkit.updateToolkit({
    name: "OrbiterFinance",
    description:
      "Orbiter Finance provides cross-rollup bridge on EVM compatible chain, e.g. Ethereum, Base, BNB chain (BSC), Polygon, etc.",
  });

  toolkit.event("ready", () => {
    console.log("Toolkit is ready to use");
  });

  toolkit.action(
    {
      action: "crossChainBridge",
      actionDescription: "Send tokens from one chain to another",
      payloadDescription: {
        srcChain: {
          type: "string",
          description:
            "Source chain, for example: 'ethereum', 'base', 'bnb', 'polygon', 'solana', etc",
          required: true,
        },
        dstChain: {
          type: "string",
          description:
            "Destination chain, for example: 'ethereum', 'base', 'bnb', 'polygon', 'solana', etc",
          required: true,
        },
        srcAddress: {
          type: "string",
          description:
            "Source address",
          required: true,
        },
        dstAddress: {
          type: "string",
          description:
            "Destination address",
          required: true,
        },
        srcTokenSymbol: {
          type: "string",
          description: "Source token symbol, for example: ETH, USDC, USDT, etc.",
          required: true,
        },
        dstTokenSymbol: {
          type: "string",
          description: "Destination token symbol, for example: ETH, USDC, USDT, etc.",
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
