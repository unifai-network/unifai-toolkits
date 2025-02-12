from dotenv import load_dotenv
load_dotenv()

import asyncio
import logging
import os
import unifai
from pydantic import BaseModel, Field
from typing import Optional
from api import SerpAPI

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logging.getLogger('httpx').setLevel(logging.WARNING)


class GoogleWebSearchPayload(BaseModel):
    q: str = Field(description="The query to search for")

class GoogleNewsSearchPayload(BaseModel):
    q: Optional[str] = Field(default=None, description="The query to search for")

class GoogleFinanceSearchPayload(BaseModel):
    q: str = Field(description="The query to search for")

class GoogleFlightSearchPayload(BaseModel):
    departure_id: Optional[str] = Field(default=None, description="Departure airport IATA code(s) or location kgmid(s)")
    arrival_id: Optional[str] = Field(default=None, description="Arrival airport IATA code(s) or location kgmid(s)")
    currency: Optional[str] = Field(default="USD", description="Currency code for prices")
    type: Optional[int] = Field(default=1, description="Flight type: 1-Round trip, 2-One way, 3-Multi-city")
    outbound_date: Optional[str] = Field(default=None, description="Outbound date (YYYY-MM-DD)")
    return_date: Optional[str] = Field(default=None, description="Return date (YYYY-MM-DD), required for round trip")
    travel_class: Optional[int] = Field(default=1, description="1-Economy, 2-Premium economy, 3-Business, 4-First")
    deep_search: Optional[bool] = Field(default=True, description="Enable deep search for better results but slower response time")
    adults: Optional[int] = Field(default=1, description="Number of adult passengers")
    children: Optional[int] = Field(default=0, description="Number of child passengers")
    infants_in_seat: Optional[int] = Field(default=0, description="Number of infants in seat")
    infants_on_lap: Optional[int] = Field(default=0, description="Number of infants on lap")
    sort_by: Optional[int] = Field(default=1, description="Sort order: 1-Top flights, 2-Price, 3-Departure time, 4-Arrival time, 5-Duration, 6-Emissions")
    stops: Optional[int] = Field(default=0, description="0-Any stops, 1-Nonstop only, 2-1 stop or fewer, 3-2 stops or fewer")
    max_price: Optional[float] = Field(default=None, description="Maximum ticket price")
    max_duration: Optional[int] = Field(default=None, description="Maximum flight duration in minutes")

class GoogleHotelSearchPayload(BaseModel):
    q: str = Field(description="The search query for Google Hotels search")
    check_in_date: str = Field(description="Check-in date (YYYY-MM-DD)")
    check_out_date: str = Field(description="Check-out date (YYYY-MM-DD)")
    currency: Optional[str] = Field(default="USD", description="Currency code for prices")
    adults: Optional[int] = Field(default=2, description="Number of adults")
    children: Optional[int] = Field(default=0, description="Number of children")
    children_ages: Optional[str] = Field(default=None, description="Ages of children (comma-separated, ages 1-17)")
    sort_by: Optional[int] = Field(default=None, description="Sort order: 3-Lowest price, 8-Highest rating, 13-Most reviewed. Leave blank to sort by Relevance.")
    min_price: Optional[float] = Field(default=None, description="Lower bound of price range")
    max_price: Optional[float] = Field(default=None, description="Upper bound of price range")
    rating: Optional[int] = Field(default=None, description="Rating filter: 7-3.5+, 8-4.0+, 9-4.5+")
    hotel_class: Optional[str] = Field(default=None, description="Hotel classes: 2,3,4,5 stars (comma-separated)")


if __name__ == "__main__":
    api = SerpAPI(os.getenv('SERPAPI_API_KEY'))

    toolkit = unifai.Toolkit(api_key=os.getenv("TOOLKIT_API_KEY"))

    asyncio.run(toolkit.update_toolkit(name="SerpAPI", description="Google Search"))

    @toolkit.event
    async def on_ready():
        logging.info(f"Toolkit is ready to use")

    @toolkit.action(
        action="webSearch",
        action_description='Google web search',
        payload_description=GoogleWebSearchPayload.model_json_schema()["properties"]
    )
    async def google_web_search(ctx: unifai.ActionContext, payload={}):
        try:
            params = GoogleWebSearchPayload.model_validate(payload)
            response = await api.google_search("google", params.model_dump(mode="json"))
            return ctx.Result({"results": response})
        except Exception as e:
            return ctx.Result({"error": str(e)})

    @toolkit.action(
        action="newsSearch",
        action_description='Google news search',
        payload_description=GoogleNewsSearchPayload.model_json_schema()["properties"]
    )
    async def google_news_search(ctx: unifai.ActionContext, payload={}):
        try:
            params = GoogleNewsSearchPayload.model_validate(payload)
            response = await api.google_search("google_news", params.model_dump(mode="json"))
            return ctx.Result({"results": response})
        except Exception as e:
            return ctx.Result({"error": str(e)})

    @toolkit.action(
        action="financeSearch",
        action_description='Google finance search',
        payload_description=GoogleFinanceSearchPayload.model_json_schema()["properties"]
    )
    async def google_finance_search(ctx: unifai.ActionContext, payload={}):
        try:
            params = GoogleFinanceSearchPayload.model_validate(payload)
            response = await api.google_search("google_finance", params.model_dump(mode="json"))
            return ctx.Result({"results": response})
        except Exception as e:
            return ctx.Result({"error": str(e)})

    @toolkit.action(
        action="flightSearch",
        action_description='Google flight search',
        payload_description=GoogleFlightSearchPayload.model_json_schema()["properties"]
    )
    async def google_flight_search(ctx: unifai.ActionContext, payload={}):
        try:
            params = GoogleFlightSearchPayload.model_validate(payload)
            response = await api.google_search("google_flights", params.model_dump(mode="json"))
            return ctx.Result({"results": response})
        except Exception as e:
            return ctx.Result({"error": str(e)})

    @toolkit.action(
        action="hotelSearch",
        action_description='Google hotel search',
        payload_description=GoogleHotelSearchPayload.model_json_schema()["properties"]
    )
    async def google_hotel_search(ctx: unifai.ActionContext, payload={}):
        try:
            params = GoogleHotelSearchPayload.model_validate(payload)
            response = await api.google_search("google_hotels", params.model_dump(mode="json"))
            return ctx.Result({"results": response})
        except Exception as e:
            return ctx.Result({"error": str(e)})
    
    asyncio.run(toolkit.run())
    