import os
import httpx
import json

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


async def generate_cover_letter(job_title: str, company: str, job_description: str, profile: dict) -> str:
    prompt = f"""You are writing a cover letter for {profile['name']}.

CANDIDATE PROFILE:
- Name: {profile['name']}
- Email: {profile['email']}
- Skills: {', '.join(json.loads(profile['skills']))}
- Summary: {profile['summary']}
- Recent learning: {_format_learning(profile.get('learning_log', '[]'))}

JOB: {job_title} at {company}

JOB DESCRIPTION:
{job_description[:2000]}

Write a concise, personalized cover letter (3 paragraphs max).
- Match specific skills from profile to job requirements
- Sound human, not generic
- Mention 1-2 specific projects that are relevant
- End with clear call to action
- No filler phrases like "I am excited to apply"
- No placeholders like [Your Name]

Return only the cover letter body, no subject line."""

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
