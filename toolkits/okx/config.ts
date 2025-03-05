import { Toolkit, TransactionAPI } from "unifai-sdk";
import { OkxAPI } from "./api";
import * as dotenv from 'dotenv';

dotenv.config();

export const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });

export const okxApi = new OkxAPI(process.env.OKX_API_KEY, process.env.OKX_SECRET_KEY, process.env.OKX_PASSPHRASE);

export const txApi = new TransactionAPI({ apiKey: process.env.TOOLKIT_API_KEY });
