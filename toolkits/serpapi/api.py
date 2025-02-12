import asyncio
from datetime import datetime, timedelta
from unifai.common.api import API

class SerpAPI(API):
    def __init__(self, api_key: str):
        super().__init__("")
        self.set_endpoint("https://serpapi.com")
        self.api_key = api_key

    async def google_search(self, engine: str, params: dict):
        return await self.request('GET', '/search', params={
            "api_key": self.api_key,
            "engine": engine,
            **params
        })

