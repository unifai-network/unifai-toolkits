import asyncio
import logging
import unifai
import os
from pydantic import BaseModel, Field
from typing import Optional, List
from dotenv import load_dotenv
from api import DefiLlamaAPI

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logging.getLogger('httpx').setLevel(logging.WARNING)

if __name__ == "__main__":
    api = DefiLlamaAPI()

    toolkit = unifai.Toolkit(api_key=os.getenv("TOOLKIT_API_KEY"))

    asyncio.run(toolkit.update_toolkit(name="Defi Llama", description="Fetch defi data from Defi Llama"))

    @toolkit.event
    async def on_ready():
        logging.info(f"Toolkit is ready to use")

    class PoolsPayload(BaseModel):
        sortBy: Optional[str] = Field(default="apy", description="Sort pools by 'tvl', 'apy', 'apyMean30d'")
        symbols: Optional[List[str]] = Field(default=None, description="Filter pools by symbols, e.g. ['ETH', 'USDC']")
        chains: Optional[List[str]] = Field(default=None, description="Filter pools by chains, e.g. ['ethereum', 'polygon']")
        projects: Optional[List[str]] = Field(default=None, description="Filter pools by projects, e.g. ['uniswap-v3', 'aave-v3']")
        minTvl: Optional[float] = Field(default=None, description="Minimum TVL in USD, e.g. 1000000")
        maxTvl: Optional[float] = Field(default=None, description="Maximum TVL in USD, e.g. 1000000000")
        minApy: Optional[float] = Field(default=None, description="Minimum APY percentage, e.g. 10")
        maxApy: Optional[float] = Field(default=None, description="Maximum APY percentage, e.g. 100")
        limit: Optional[int] = Field(default=10, ge=1, le=100, description="Number of pools to return (max 100)")

    @toolkit.action(
        action="get_pools",
        action_description='Get data of defi pools such as total value locked (tvl), annual percentage yield (apy), yield, etc.',
        payload_description=PoolsPayload.model_json_schema()["properties"]
    )
    async def get_pools(ctx: unifai.ActionContext, payload={}):
        params = PoolsPayload(**payload)
        pools = await api.get_pools()
        filtered_pools = pools

        if params.minTvl is not None:
            filtered_pools = [p for p in filtered_pools if p.get("tvlUsd", 0) >= params.minTvl]

        if params.maxTvl is not None:
            filtered_pools = [p for p in filtered_pools if p.get("tvlUsd", 0) <= params.maxTvl]

        if params.minApy is not None:
            filtered_pools = [p for p in filtered_pools if p.get("apy", 0) >= params.minApy]

        if params.maxApy is not None:
            filtered_pools = [p for p in filtered_pools if p.get("apy", 0) <= params.maxApy]

        if params.symbols:
            filtered_pools = [p for p in filtered_pools if p.get("symbol") and p["symbol"].lower() in {s.lower() for s in params.symbols}]

        if params.projects:
            filtered_pools = [p for p in filtered_pools if p.get("project") and p["project"].lower() in {proj.lower() for proj in params.projects}]

        if params.chains:
            filtered_pools = [p for p in filtered_pools if p.get("chain") and p["chain"].lower() in {chain.lower() for chain in params.chains}]

        sort_map = {"tvl": "tvlUsd", "apy": "apy", "apymean30d": "apyMean30d"}
        sort_key = sort_map.get(params.sortBy.lower(), "apy")

        filtered_pools.sort(key=lambda x: x.get(sort_key, 0), reverse=True)

        return ctx.Result(filtered_pools[:params.limit])

    asyncio.run(toolkit.run())
