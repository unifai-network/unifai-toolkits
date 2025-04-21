import asyncio
import logging
import unifai
import os
from dotenv import load_dotenv
from news import fetch_rss_web3_news

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logging.getLogger('httpx').setLevel(logging.WARNING)

if __name__ == "__main__":
    toolkit = unifai.Toolkit(api_key=os.getenv("TOOLKIT_API_KEY"))

    asyncio.run(toolkit.update_toolkit(name="Web3News", description="Fetch the latest Web3 news"))

    @toolkit.event
    async def on_ready():
        logging.info(f"Toolkit is ready to use")

    @toolkit.action(
        action="getWeb3News",
        action_description='Get the latest Web3 news in crypto and blockchain space',
        payload_description={
            "limitPerFeed": {
                "type": "number",
                "description": "The number of articles per feed (optional, default 5, max 10)",
                "required": False,
            }
        }
    )
    async def get_web3_news(ctx: unifai.ActionContext, payload={}):
        try:
            limit_per_feed = int(payload.get("limitPerFeed", 5))
            if limit_per_feed < 1 or limit_per_feed > 10:
                limit_per_feed = 5
            news_items = fetch_rss_web3_news(limit_per_feed=limit_per_feed)
            return ctx.Result({"results": news_items})
        except Exception as e:
            return ctx.Result({"error": str(e)})

    asyncio.run(toolkit.run())
