import os
import httpx
import json
import re


def _strip_html(text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"&[a-z]+;", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


async def generate_cover_letter(job_title: str, company: str, job_description: str, profile: dict) -> str:
    clean_jd = _strip_html(job_description)[:2000]
    prompt = f"""Write a cover letter from Subarna Katwal applying for {job_title} at {company}.

ABOUT SUBARNA:
{profile['summary']}

Resume:
{profile.get('resume_text', '')}

Skills: {', '.join(json.loads(profile['skills']))}
Recent learning: {_format_learning(profile.get('learning_log', '[]'))}

JOB DESCRIPTION:
{clean_jd}

Rules:
- 3 tight paragraphs, no greeting/sign-off
- Paragraph 1: why this specific role at this specific company (use JD details)
- Paragraph 2: 1-2 concrete projects from resume that directly map to JD requirements
- Paragraph 3: one sentence ask
- Use plain dashes (-) not em-dashes (--)
- No "I am excited", no "I would love to", no placeholders, no brackets
- Write as Subarna in first person, confident tone
- Do NOT use the word "dynamic", "passionate", "leverage", "hone", or "foster"

Return only the 3 paragraphs. Nothing else."""

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
            json={"model": "llama-3.3-70b-versatile", "messages": [{"role": "user", "content": prompt}], "max_tokens": 600}
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]


async def tailor_resume(job_title: str, job_description: str, profile: dict) -> str:
    prompt = f"""Rewrite this resume summary and skills section to better match the job.

CURRENT RESUME:
{profile['resume_text']}

JOB: {job_title}
JOB DESCRIPTION: {job_description[:1500]}

Return a tailored version with:
1. Modified summary (2-3 sentences, match JD keywords)
2. Reordered skills (most relevant first)
3. Which projects to highlight and why

Keep it factual — do not add skills the candidate doesn't have."""

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
            json={"model": "llama-3.3-70b-versatile", "messages": [{"role": "user", "content": prompt}], "max_tokens": 800}
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]


async def generate_cold_email(contact_name: str, contact_title: str, company: str, profile: dict) -> str:
    prompt = f"""Write a cold email from {profile['name']} to {contact_name} ({contact_title} at {company}).

SENDER PROFILE:
{profile['summary']}
Skills: {', '.join(json.loads(profile['skills'])[:8])}

Goal: Ask about internship opportunities (APM, Technical BA, AI/ML roles).
- Max 5 sentences
- Specific to their company (mention what they do if known)
- One concrete thing the sender built
- Clear ask at the end
- No desperation, no over-flattery
- Subject line included

Format:
Subject: [subject]
[email body]"""

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
            json={"model": "llama-3.3-70b-versatile", "messages": [{"role": "user", "content": prompt}], "max_tokens": 400}
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]


def _format_learning(learning_log_json: str) -> str:
    try:
        logs = json.loads(learning_log_json)
        if not logs:
            return "None logged yet"
        return "; ".join([f"{l['date']}: {l['learned']}" for l in logs[-5:]])
    except Exception:
        return "None logged yet"
