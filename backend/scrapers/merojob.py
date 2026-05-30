from datetime import datetime
from playwright.async_api import async_playwright
import asyncio


async def scrape_merojob(keywords: list[str]) -> list[dict]:
    jobs = []
    seen_urls = set()

    role_map = {
        "APM": ["intern", "apm intern", "associate product manager"],
        "Technical": ["technical intern", "business analyst intern", "ba intern"],
        "Product": ["product intern", "product manager intern"],
        "AI": ["ai intern", "machine learning intern", "data intern"],
    }

    search_terms = []
    for kw in keywords:
        search_terms.extend(role_map.get(kw, [kw.lower()]))
    search_terms = list(set(search_terms))

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--no-sandbox", "--disable-dev-shm-usage"])
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120",
            locale="en-US",
        )

        # --- LinkedIn ---
        try:
            page = await context.new_page()
            url = "https://www.linkedin.com/jobs/search/?keywords=intern+product+nepal&location=Nepal&f_E=1&f_E=2"
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
            await page.wait_for_timeout(3000)
            cards = await page.query_selector_all(".job-search-card, .base-card")
            for card in cards[:25]:
                try:
                    title = await card.query_selector(".base-search-card__title, .job-search-card__title")
                    company = await card.query_selector(".base-search-card__subtitle, .job-search-card__company-name")
                    location = await card.query_selector(".job-search-card__location")
                    link = await card.query_selector("a.base-card__full-link, a[data-tracking-control-name]")
                    if not title:
                        continue
                    job_url = await link.get_attribute("href") if link else ""
                    if job_url in seen_urls:
                        continue
                    seen_urls.add(job_url)
                    jobs.append({
                        "title": (await title.inner_text()).strip(),
                        "company": (await company.inner_text()).strip() if company else "Unknown",
                        "location": (await location.inner_text()).strip() if location else "Nepal",
                        "description": "",
                        "url": job_url,
                        "source": "linkedin",
                        "found_at": datetime.utcnow(),
                    })
                except Exception:
                    continue
            await page.close()
        except Exception as e:
            print(f"LinkedIn scrape error: {e}")

        # --- MeroJob ---
        for term in search_terms[:4]:
            try:
                page = await context.new_page()
                await page.goto(
                    f"https://merojob.com/search/?q={term.replace(' ', '+')}",
                    wait_until="networkidle", timeout=30000
                )
                await page.wait_for_timeout(2000)

                cards = await page.query_selector_all("div[class*='card'], article, .job-listing, li[class*='job']")
                for card in cards[:20]:
                    try:
                        title_el = await card.query_selector("h1 a, h2 a, h3 a, a[class*='title']")
                        if not title_el:
                            continue
                        title_text = (await title_el.inner_text()).strip()
                        if not any(t in title_text.lower() for t in ["intern", "trainee", "associate", "junior", "entry"]):
                            continue
                        company_el = await card.query_selector("[class*='company'], [class*='employer']")
                        location_el = await card.query_selector("[class*='location']")
                        href = await title_el.get_attribute("href") or ""
                        if not href.startswith("http"):
                            href = "https://merojob.com" + href
                        if href in seen_urls:
                            continue
                        seen_urls.add(href)
                        jobs.append({
                            "title": title_text,
                            "company": (await company_el.inner_text()).strip() if company_el else "Unknown",
                            "location": (await location_el.inner_text()).strip() if location_el else "Nepal",
                            "description": (await card.inner_text())[:400],
                            "url": href,
                            "source": "merojob",
                            "found_at": datetime.utcnow(),
                        })
                    except Exception:
                        continue
                await page.close()
            except Exception as e:
                print(f"MeroJob scrape error [{term}]: {e}")

        await browser.close()

    return jobs
