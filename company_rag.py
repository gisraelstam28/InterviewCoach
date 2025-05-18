import os
import requests
from typing import List, Dict
import openai
import numpy as np

GOOGLE_KG_API_KEY = os.getenv("GOOGLE_KG_API_KEY")
SERPAPI_KEY = os.getenv("SERPAPI_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

# --- Google Knowledge Graph ---
def fetch_company_overview(company_name: str) -> Dict:
    url = "https://kgsearch.googleapis.com/v1/entities:search"
    params = {
        "query": company_name,
        "key": GOOGLE_KG_API_KEY,
        "limit": 1,
        "types": "Organization"
    }
    resp = requests.get(url, params=params)
    if resp.status_code != 200:
        return {}
    data = resp.json()
    if not data.get("itemListElement"):
        return {}
    elem = data["itemListElement"][0]["result"]
    return {
        "name": elem.get("name"),
        "description": elem.get("description"),
        "wikipedia": elem.get("detailedDescription", {}).get("url"),
        "type": elem.get("@type", [])
    }

# --- SerpAPI News ---
def fetch_company_news(company_name: str, num_articles: int = 8) -> List[Dict]:
    url = "https://serpapi.com/search"
    params = {
        "engine": "google_news",
        "q": company_name,
        "api_key": SERPAPI_KEY,
        "num": num_articles
    }
    resp = requests.get(url, params=params)
    if resp.status_code != 200:
        return []
    news = resp.json().get("news_results", [])
    return [{
        "title": n.get("title"),
        "snippet": n.get("snippet"),
        "link": n.get("link"),
        "date": n.get("date")
    } for n in news]

# --- Embedding ---
def get_embeddings(texts: List[str]) -> List[List[float]]:
    resp = openai.Embedding.create(
        model="text-embedding-3-small",
        input=texts
    )
    return [d["embedding"] for d in resp["data"]]

def cosine_similarity(a, b):
    a = np.array(a)
    b = np.array(b)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def rank_snippets(query: str, snippets: List[str]) -> List[int]:
    all_texts = [query] + snippets
    embs = get_embeddings(all_texts)
    query_emb = embs[0]
    snippet_embs = embs[1:]
    sims = [cosine_similarity(query_emb, emb) for emb in snippet_embs]
    ranked = sorted(range(len(snippets)), key=lambda i: -sims[i])
    return ranked

# --- Main RAG Function ---
def get_company_rag(company_name: str, query: str = "company overview") -> Dict:
    overview = fetch_company_overview(company_name)
    news = fetch_company_news(company_name)
    snippets = [n["snippet"] for n in news if n.get("snippet")]
    if overview.get("description"):
        snippets.insert(0, overview["description"])
    if not snippets:
        return {"overview": overview, "top_snippets": [], "news": news}
    ranked_idxs = rank_snippets(query, snippets)
    top_snippets = [snippets[i] for i in ranked_idxs[:5]]
    return {
        "overview": overview,
        "top_snippets": top_snippets,
        "news": news
    }
