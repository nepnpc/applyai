import httpx
from bs4 import BeautifulSoup
from datetime import datetime


async def scrape_merojob(keywords: list[str]) -> list[dict]:
    jobs = []
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

    for keyword in keywords:
        url = f"https://merojob.com/search/?q={keyword.replace(' ', '+')}"
        try:
            async with httpx.AsyncClient(timeout=20, headers=headers) as client:
                resp = await client.get(url)
                soup = BeautifulSoup(resp.text, "html.parser")

                cards = soup.select("div.card.job-card") or soup.select(".job-list-item") or soup.select("article")
                for card in cards[:20]:
                    title_el = card.select_one("h1 a, h2 a, h3 a, .job-title a")
                    company_el = card.select_one(".company-name, .employer-name")
                    location_el = card.select_one(".location, .job-location")
                    link_el = card.select_one("a[href]")

                    if not title_el:
                        continue

                    job_url = link_el["href"] if link_el else ""
                    if job_url and not job_url.startswith("http"):
                        job_url = "https://merojob.com" + job_url

                    jobs.append({
                        "title": title_el.get_text(strip=True),
                        "company": company_el.get_text(strip=True) if company_el else "Unknown",
                        "location": location_el.get_text(strip=True) if location_el else "Nepal",
                        "description": card.get_text(strip=True)[:500],
                        "url": job_url,
                        "source": "merojob",
                        "found_at": datetime.utcnow(),
                    })
        except Exception as e:
            print(f"Merojob scrape error: {e}")

    return jobs
