import { Toolkit, TransactionAPI } from "unifai-sdk";

import * as dotenv from "dotenv";
dotenv.config();

export const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });


export const txApi = new TransactionAPI({ endpoint: process.env.TRANSACTION_API_ENDPOINT, apiKey: process.env.TOOLKIT_API_KEY });
