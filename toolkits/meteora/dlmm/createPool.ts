import { ActionContext } from "unifai-sdk";
import { txApi, toolkit, connection } from "../config";
import DLMM from "@meteora-ag/dlmm";

export async function initCreatePoolAction() {
  const feeBps2BinStepMap = await getFeeBps2BinStepMap();

  toolkit.action(
    {
      action: "createDlmmPool",
      actionDescription: "Create a new Meteora DLMM liquidity pool (NOT Dynamic AMM pool).",
      payloadDescription: {
        "baseMint": {
          "type": "string",
          "description": "Base token (token x) mint address. IMPORTANT: Cannot be SOL or USDC.",
          "required": true
        },
        "quoteMint": {
          "type": "string",
          "description": "Quote token (token y) mint address. If you want to enable Alpha Vault functionality, must be SOL or USDC. No restrictions otherwise.",
          "required": true
        },
        "feeBps": {
          "type": "number",
          "description": "Base swap fee in basis points (1 bps = 0.01%).",
          "required": true,
          "enums": Object.keys(feeBps2BinStepMap).sort((a, b) => parseInt(a) - parseInt(b))
        },
        "binStep": {
          "type": "number",
          "description": "Determines price granularity by setting the basis point difference between consecutive price bins. IMPORTANT: Must be selected based on the feeBps parameter from following feeBps2binStepEnumsMap. Design your liquidity distribution using the ILM tool at ilm.jup.ag",
          "required": true,
          "feeBps2binStepEnumsMap": feeBps2BinStepMap
        },
        "initialPrice": {
          "type": "number",
          "description": "Initial token price at launch. Works with the liquidity distribution curve designed using the ILM tool.",
          "required": true
        },
      },
    },
    async (ctx: ActionContext, payload: any = {}) => {
      try {
        const result = await txApi.createTransaction(
          "meteora/dlmm/create-pool",
          ctx,
          payload
        );
        return ctx.result(result);
      } catch (error) {
        return ctx.result({ error: `Failed to create transaction: ${error}` });
      }
    }
  );
}


async function getFeeBps2BinStepMap() {
  const presetParameters = await DLMM.getAllPresetParameters(connection, { cluster: 'mainnet-beta' });
  const map = presetParameters.presetParameter2.reduce((map, acc) => {
    const { account: { binStep, baseFactor } } = acc;
    const { baseFeeRatePercentage } = DLMM.calculateFeeInfo(baseFactor, binStep);
    const feeBps = baseFeeRatePercentage.mul(100).toNumber();
    if (map[feeBps]) {
      map[feeBps].push(binStep);
    } else {
      map[feeBps] = [binStep];
    }
    return map;
  }, {} as Record<number, number[]>);

  Object.values(map).forEach(binSteps => binSteps.sort((a, b) => a - b));

  return map;
}
