import asyncio
from datetime import datetime, timedelta
from unifai.common.api import API

class DefiLlamaAPI(API):
    def __init__(self):
        super().__init__("")
        self.set_endpoint("https://yields.llama.fi")
        self.cache_expiry = timedelta(hours=1)
        self.pools_cache: list[dict] | None = None
        self.last_fetch_time: datetime | None = None
        self.fetch_lock = asyncio.Lock()

    async def get_pools(self):
        async with self.fetch_lock:
            now = datetime.now()
            if self.pools_cache and self.last_fetch_time and now - self.last_fetch_time < self.cache_expiry:
                return self.pools_cache
            result = await self.request('GET', '/pools')
            self.pools_cache = result.get("data", [])
            self.last_fetch_time = now
            return self.pools_cache
