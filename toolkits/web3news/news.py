import re
import html
import feedparser

def fetch_rss_web3_news(limit_per_feed=5):
    rss_urls = [
        "https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml",
        "https://cointelegraph.com/rss",
        "https://decrypt.co/feed",
        "https://www.theblock.co/rss",
        "https://cryptoslate.com/feed/"
    ]
    
    news_items = []
    
    for url in rss_urls:
        feed = feedparser.parse(url)
        source_title = feed.feed.title if 'title' in feed.feed else 'Unknown Source'
        for entry in feed.entries[:limit_per_feed]:
            summary = entry.summary if 'summary' in entry else ""
            if summary:
                summary = re.sub(r'<[^>]+>', '', summary)
                summary = html.unescape(summary)
                summary = re.sub(r'\s+', ' ', summary).strip()
            news = {
                "title": entry.title,
                "link": entry.link,
                "published": entry.published if 'published' in entry else "",
                "source": source_title,
                "summary": summary
            }
            news_items.append(news)
    
    return news_items
