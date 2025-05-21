import { DappRadarAPI } from './api';

const api = new DappRadarAPI(process.env.DAPPRADAR_API_KEY || '');

export interface SearchDappsParams {
  chain?: string;
  smartContract?: string;
  website?: string;
  name?: string;
  page?: number;
  resultsPerPage?: number;
}

export interface GetTopDappsParams {
  chain?: string;
  category?: number;
  range?: string;
  top?: number;
}

export interface GetDappDataParams {
  chain?: string;
  range?: string;
}

export interface GetDappHistoricalDataParams {
  chain?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface GetDefiDappsParams {
  chain?: string;
  page?: number;
  resultsPerPage?: number;
  sort?: string;
  order?: string;
  range?: string;
}

export interface GetDefiDappDataParams {
  chain?: string;
}

// Get Dapps by search
export async function searchDapps(params: SearchDappsParams) {
  try {
    const result = await api.searchDapps(params);
    return result;
  } catch (error) {
    return { error: `Failed to search dapps: ${error}` };
  }
}

// Get top Dapps
export async function getTopDapps(metric: string, params: GetTopDappsParams) {
  try {
    if (!['balance', 'transactions', 'uaw', 'volume'].includes(metric)) {
      return { error: 'Invalid metric. Must be one of: balance, transactions, uaw, volume' };
    }
    
    const result = await api.getTopDapps(metric, params);
    return result;
  } catch (error) {
    return { error: `Failed to get top dapps: ${error}` };
  }
}

// Get single Dapp data
export async function getDappData(dappId: number, params: GetDappDataParams = {}) {
  try {
    const result = await api.getDappData(dappId, params);
    return result;
  } catch (error) {
    return { error: `Failed to get dapp data: ${error}` };
  }
}

// Get historical Dapp data
export async function getDappHistoricalData(dappId: number, metric: string, params: GetDappHistoricalDataParams = {}) {
  try {
    if (!['transactions', 'uaw', 'volume'].includes(metric)) {
      return { error: 'Invalid metric. Must be one of: transactions, uaw, volume' };
    }
    
    const result = await api.getDappHistoricalData(dappId, metric, params);
    return result;
  } catch (error) {
    return { error: `Failed to get historical dapp data: ${error}` };
  }
}

// Get multiple DeFi dapps data
export async function getDefiDapps(params: GetDefiDappsParams = {}) {
  try {
    const result = await api.getDefiDapps(params);
    return result;
  } catch (error) {
    return { error: `Failed to get DeFi dapps: ${error}` };
  }
}

// Get single DeFi dapp data
export async function getDefiDappData(dappId: number, params: GetDefiDappDataParams = {}) {
  try {
    const result = await api.getDefiDappData(dappId, params);
    return result;
  } catch (error) {
    return { error: `Failed to get DeFi dapp data: ${error}` };
  }
} 