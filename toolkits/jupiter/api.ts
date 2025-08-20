export async function getTokenPrices(inputTokenAddress: string, outputTokenAddress: string): Promise<{ inputPrice: number, outputPrice: number }> {
  try {
    const response = await fetch(`https://lite-api.jup.ag/price/v3?ids=${inputTokenAddress},${outputTokenAddress}`);
    const data = await response.json();
    
    const inputPrice = data[inputTokenAddress]?.usdPrice || 0;
    const outputPrice = data[outputTokenAddress]?.usdPrice || 0;
    
    return { inputPrice, outputPrice };
  } catch (error) {
    throw new Error(`Failed to fetch token prices: ${error}`);
  }
}

export async function searchToken(query: string): Promise<any[]> {
  try {
    const apiKey = process.env.JUPITER_API_KEY;
    if (!apiKey) {
      throw new Error('JUPITER_API_KEY environment variable is not set');
    }

    const response = await fetch(`https://api.jup.ag/ultra/v1/search?query=${encodeURIComponent(query)}`, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Search request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Failed to search tokens: ${error}`);
  }
}
