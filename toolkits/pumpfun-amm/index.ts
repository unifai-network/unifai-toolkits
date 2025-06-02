import * as dotenv from 'dotenv'
dotenv.config()

import { ActionContext, Toolkit, TransactionAPI } from 'unifai-sdk'

async function main() {
	const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY })
	const api = new TransactionAPI({ apiKey: process.env.TOOLKIT_API_KEY })

	await toolkit.updateToolkit({
		name: 'PumpFun Amm',
		description:
			'Pump.fun allows you to trade meme token (memecoin) on Solana',
	})

	toolkit.event('ready', () => {
		console.log('Toolkit is ready to use')
	})

	toolkit.action(
		{
			action: 'getSolBalance',
			actionDescription: 'Get SOL balance for a Solana address',
			payloadDescription: {
				userAddress: {
					type: 'string',
					description: 'Solana address to check balance',
					required: true,
				},
			},
		},
		async (ctx: ActionContext, payload: any = {}) => {
			try {
				const result = await api.createTransaction(
					'balance/sol',
					ctx,
					payload
				)
				return ctx.result(result)
			} catch (error) {
				return ctx.result({
					error: `Failed to create transaction: ${error}`,
				})
			}
		}
	)

	toolkit.action(
		{
			action: 'getSPLBalance',
			actionDescription: 'Get SPL token balance for a Solana address',
			payloadDescription: {
				userAddress: {
					type: 'string',
					description: 'Solana address to check balance for',
					required: true,
				},
				mint: {
					type: 'string',
					description: 'SPL token mint address',
					required: true,
				},
			},
		},
		async (ctx: ActionContext, payload: any = {}) => {
			try {
				const result = await api.createTransaction(
					'balance/spl',
					ctx,
					payload
				)
				return ctx.result(result)
			} catch (error) {
				return ctx.result({
					error: `Failed to create transaction: ${error}`,
				})
			}
		}
	)

	toolkit.action(
		{
			action: 'createBuyTransaction',
			actionDescription:
				'Create an unsigned transaction to buy tokens on Pump.fun',
			payloadDescription: {
				userAddress: {
					type: 'string',
					description: "Buyer's Solana address",
					required: true,
				},
				mint: {
					type: 'string',
					description: 'Token mint address to buy',
					required: true,
				},
				buyAmountHumanReadableSol: {
					type: 'number',
					description: 'Amount of SOL to spend on buying tokens',
					required: true,
				},
			},
		},
		async (ctx: ActionContext, payload: any = {}) => {
			try {
				const result = await api.createTransaction(
					'pumpfun/buy',
					ctx,
					payload
				)
				return ctx.result(result)
			} catch (error) {
				return ctx.result({
					error: `Failed to create transaction: ${error}`,
				})
			}
		}
	)

	toolkit.action(
		{
			action: 'createSellTransaction',
			actionDescription:
				'Create an unsigned transaction to sell tokens on Pump.fun',
			payloadDescription: {
				userAddress: {
					type: 'string',
					description: "Seller's Solana address",
					required: true,
				},
				mint: {
					type: 'string',
					description: 'Token mint address to sell',
					required: true,
				},
				sellAmountHumanReadableToken: {
					type: 'number',
					description: 'Amount of tokens to sell',
					required: true,
				},
				slippage: {
					type: 'number',
					description: 'Slippage tolerance in percentage (2-100)',
					required: false,
					default: 99,
				},
			},
		},
		async (ctx: ActionContext, payload: any = {}) => {
			try {
				const result = await api.createTransaction(
					'pumpfun/sell',
					ctx,
					payload
				)
				return ctx.result(result)
			} catch (error) {
				return ctx.result({
					error: `Failed to create transaction: ${error}`,
				})
			}
		}
	)
	await toolkit.run()
}

main().catch(console.error)
