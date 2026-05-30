import httpx
from datetime import datetime


async def scrape_merojob(keywords: list[str]) -> list[dict]:
    jobs = []
    seen_ids = set()
    headers = {"User-Agent": "Mozilla/5.0", "Accept": "application/json"}

    tags = {
        "APM": ["product-manager", "product"],
        "Technical": ["engineer", "developer"],
        "Product": ["product-manager", "product"],
        "AI": ["ai", "machine-learning"],
    }

    fetch_tags = set()
    for kw in keywords:
        fetch_tags.update(tags.get(kw, [kw.lower().replace(" ", "-")]))

    async with httpx.AsyncClient(timeout=20, headers=headers) as client:
        for tag in fetch_tags:
            try:
                resp = await client.get(f"https://remoteok.com/api?tag={tag}")
                data = resp.json()
                for j in data:
                    if not isinstance(j, dict) or "position" not in j:
                        continue
                    job_id = str(j.get("id", ""))
                    if job_id in seen_ids:
                        continue
                    seen_ids.add(job_id)
                    jobs.append({
                        "title": j.get("position", ""),
                        "company": j.get("company", "Unknown"),
                        "location": j.get("location") or "Remote",
                        "description": j.get("description", "")[:500],
                        "url": j.get("url") or f"https://remoteok.com/l/{job_id}",
                        "source": "remoteok",
                        "found_at": datetime.utcnow(),
                    })
            except Exception as e:
                print(f"RemoteOK scrape error [{tag}]: {e}")

    return jobs
