import asyncio
import logging
import unifai
import os
from tavily import TavilyClient
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logging.getLogger('httpx').setLevel(logging.WARNING)

if __name__ == "__main__":
    tavily_client = TavilyClient(api_key=os.getenv('TAVILY_API_KEY'))

    toolkit = unifai.Toolkit(api_key=os.getenv("TOOLKIT_API_KEY"))

    asyncio.run(toolkit.update_toolkit(name="Tavily Web Search", description="Search the web for information"))

    @toolkit.event
    async def on_ready():
        logging.info(f"Toolkit is ready to use")

    @toolkit.action(
        action="webSearch",
        action_description='Search the web for information',
        payload_description={
            "query": {
                "type": "string",
                "description": "The query to search for",
                "required": True
            }
        }
    )
    async def web_search(ctx: unifai.ActionContext, payload={}):
        try:
            query = payload["query"]
            response = tavily_client.search(query)
            results = response.get('results', [])
            if results:
                message = f"Search results for '{query}':\n"
                for idx, result in enumerate(results, 1):
                    title = result.get('title', 'No Title')
                    url = result.get('url', 'No URL')
                    content = result.get('content', 'No Content')
                    message += f"\n{idx}. {title}\nURL: {url}\nContent: {content}...\n"
                return ctx.Result({"results": message})
            else:
                return ctx.Result({"error": f"No results found for query '{query}'."})
        except Exception as e:
            return ctx.Result({"error": str(e)})

    asyncio.run(toolkit.run())
