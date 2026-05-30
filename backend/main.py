from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
import json

from database import get_db, init_db
from models import CandidateProfile, Job, OutreachContact
from scrapers.merojob import scrape_merojob
from scrapers.matcher import score_job
from generators.cover_letter import generate_cover_letter, tailor_resume, generate_cold_email

app = FastAPI(title="ApplyAI")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.on_event("startup")
def startup():
    init_db()


# --- Profile ---

@app.get("/profile")
def get_profile(db: Session = Depends(get_db)):
    p = db.query(CandidateProfile).first()
    return p


class ProfileUpdate(BaseModel):
    summary: str | None = None
    skills: list[str] | None = None
    target_roles: list[str] | None = None
    target_locations: list[str] | None = None
    resume_text: str | None = None


@app.put("/profile")
def update_profile(data: ProfileUpdate, db: Session = Depends(get_db)):
    p = db.query(CandidateProfile).first()
    if data.summary is not None:
        p.summary = data.summary
    if data.skills is not None:
        p.skills = json.dumps(data.skills)
    if data.target_roles is not None:
        p.target_roles = json.dumps(data.target_roles)
    if data.target_locations is not None:
        p.target_locations = json.dumps(data.target_locations)
    if data.resume_text is not None:
        p.resume_text = data.resume_text
    p.updated_at = datetime.utcnow()
    db.commit()
    return {"status": "updated"}


# --- Learning Log ---

class LearnEntry(BaseModel):
    learned: str


@app.post("/profile/learn")
def add_learning(entry: LearnEntry, db: Session = Depends(get_db)):
    p = db.query(CandidateProfile).first()
    logs = json.loads(p.learning_log or "[]")
    logs.append({"date": datetime.utcnow().strftime("%Y-%m-%d"), "learned": entry.learned})
    p.learning_log = json.dumps(logs)
    p.updated_at = datetime.utcnow()
    db.commit()
    return {"status": "logged", "total": len(logs)}


@app.get("/profile/learn")
def get_learning(db: Session = Depends(get_db)):
    p = db.query(CandidateProfile).first()
    return json.loads(p.learning_log or "[]")


# --- Jobs ---

@app.get("/jobs")
def list_jobs(status: str = None, db: Session = Depends(get_db)):
    q = db.query(Job)
    if status:
        q = q.filter(Job.status == status)
    return q.order_by(Job.match_score.desc()).all()


@app.post("/jobs/scrape")
async def scrape_jobs(db: Session = Depends(get_db)):
    p = db.query(CandidateProfile).first()
    profile = {
        "skills": p.skills, "target_roles": p.target_roles,
        "target_locations": p.target_locations, "learning_log": p.learning_log
    }

    keywords = [r.split()[0] for r in json.loads(p.target_roles)]
    raw_jobs = await scrape_merojob(keywords)

    added = 0
    for j in raw_jobs:
        existing = db.query(Job).filter(Job.url == j["url"]).first()
        if existing:
            continue
        score = score_job(j, profile)
        job = Job(
            title=j["title"], company=j["company"], location=j["location"],
            description=j["description"], url=j["url"], source=j["source"],
            match_score=score, found_at=j["found_at"]
        )
        db.add(job)
        added += 1

    db.commit()
    return {"scraped": len(raw_jobs), "new": added}


@app.post("/jobs/{job_id}/cover-letter")
async def gen_cover_letter(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404)
    p = db.query(CandidateProfile).first()
    profile = {k: getattr(p, k) for k in ["name", "email", "summary", "skills", "resume_text", "learning_log"]}
    cl = await generate_cover_letter(job.title, job.company, job.description or "", profile)
    job.cover_letter = cl
    db.commit()
    return {"cover_letter": cl}


@app.post("/jobs/{job_id}/tailor")
async def gen_tailored_resume(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404)
    p = db.query(CandidateProfile).first()
    profile = {k: getattr(p, k) for k in ["resume_text", "skills", "summary"]}
    tailored = await tailor_resume(job.title, job.description or "", profile)
    job.tailored_resume = tailored
    db.commit()
    return {"tailored_resume": tailored}


class StatusUpdate(BaseModel):
    status: str
    notes: str | None = None


@app.put("/jobs/{job_id}/status")
def update_job_status(job_id: int, data: StatusUpdate, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404)
    job.status = data.status
    if data.notes:
        job.notes = data.notes
    if data.status == "applied":
        job.applied_at = datetime.utcnow()
    db.commit()
    return {"status": "updated"}


# --- Outreach ---

class ContactCreate(BaseModel):
    name: str
    title: str
    company: str
    email: str | None = None
    linkedin: str | None = None


@app.post("/outreach")
def add_contact(data: ContactCreate, db: Session = Depends(get_db)):
    c = OutreachContact(**data.model_dump())
    db.add(c)
    db.commit()
    return {"id": c.id}


@app.get("/outreach")
def list_contacts(db: Session = Depends(get_db)):
    return db.query(OutreachContact).all()


@app.post("/outreach/{contact_id}/email")
async def gen_cold_email(contact_id: int, db: Session = Depends(get_db)):
    c = db.query(OutreachContact).filter(OutreachContact.id == contact_id).first()
    if not c:
        raise HTTPException(404)
    p = db.query(CandidateProfile).first()
    profile = {k: getattr(p, k) for k in ["name", "summary", "skills", "learning_log"]}
    email = await generate_cold_email(c.name, c.title, c.company, profile)
    c.email_content = email
    db.commit()
    return {"email": email}


# --- Stats ---

@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total = db.query(Job).count()
    by_status = {}
    for s in ["new", "reviewing", "applied", "rejected", "interview"]:
        by_status[s] = db.query(Job).filter(Job.status == s).count()
    return {"total_jobs": total, "by_status": by_status, "contacts": db.query(OutreachContact).count()}
