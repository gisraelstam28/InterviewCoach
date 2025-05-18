import os
from typing import List, Dict, Tuple
import time
import logging
from serpapi import GoogleSearch

_news_cache: Dict[str, Tuple[float, List[Dict[str, str]]]] = {}
_news_cache_ttl = 3600  # seconds

logger = logging.getLogger(__name__)

async def fetch_recent_news(company_name: str, max_articles: int = 5) -> List[Dict[str, str]]:
    # Determine SerpAPI API key (supporting SERPAPI_API_KEY or SERPAPI_KEY)
    api_key = os.getenv("SERPAPI_API_KEY") or os.getenv("SERPAPI_KEY")
    if not api_key:
        print("Warning: SerpAPI API key not found in environment variables")

    # Cache lookup
    key = company_name.lower()
    now = time.time()
    if key in _news_cache and now - _news_cache[key][0] < _news_cache_ttl:
        return _news_cache[key][1]

    # Fetch from SerpAPI
    params = {
        "q": f"{company_name} recent news",
        "engine": "google",
        "tbm": "nws",
        "api_key": api_key,
        "num": max_articles,
    }

    try:
        search = GoogleSearch(params)
        results = search.get_dict()
        articles = results.get("news_results", [])
        if not articles:
            # Fallback if no articles found
            fallback = [{
                "title": "Unable to fetch news – please ask about recent company developments",
                "snippet": "",
                "published_at": "",
                "url": ""
            }]
            _news_cache[key] = (now, fallback)
            return fallback
        data = [
            {
                "title": a.get("title"),
                "snippet": a.get("snippet"),
                "published_at": a.get("date"),
                "url": a.get("link")
            }
            for a in articles if a.get("title") and a.get("link")
        ]
        _news_cache[key] = (now, data)
        return data
    except Exception as e:
        logger.error(f"News fetch failed for {company_name}: {e}")
        fallback = [{
            "title": "Unable to fetch news – please ask about recent company developments",
            "snippet": "",
            "published_at": "",
            "url": ""
        }]
        _news_cache[key] = (now, fallback)
        return fallback
