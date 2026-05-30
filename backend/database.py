from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, CandidateProfile
import json

engine = create_engine("sqlite:///applyai.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)


def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    profile = db.query(CandidateProfile).first()
    if not profile:
        db.add(CandidateProfile(
            summary="Final-year BCA student building hands-on AI projects with Python, FastAPI, and LLM APIs. Practiced in agentic coding workflows. Recently shipped an LLM-powered text humanizer and autonomous LinkedIn posting agent.",
            skills=json.dumps([
                "Python", "FastAPI", "Groq API", "Llama 3", "Prompt Engineering",
                "LLM Agent Design", "GitHub Actions", "SQL", "Linux", "Git",
                "REST API", "spaCy", "Claude", "Cursor"
            ]),
            projects=json.dumps([
                {"name": "Project Humanizer", "tech": "FastAPI, Groq, Llama 3, spaCy", "url": "github.com/nepnpc/project-humanizer"},
                {"name": "LinkedIn Agent", "tech": "Python, Groq, GitHub Actions", "url": "github.com/nepnpc/linkedin-agent"},
            ]),
            experience=json.dumps([
                {"role": "Technical Support & Data Associate", "company": "Profusion Tech Pvt. Ltd.", "duration": "2023-Present"},
                {"role": "Content Moderator", "company": "Yodha", "duration": "2022"},
            ]),
            certifications=json.dumps([
                "Google Cybersecurity Professional Certificate",
                "Programming for Everybody (Python) - Coursera",
                "Databases and SQL for Data Science - Coursera",
            ]),
            resume_text="""Subarna Katwal — BCA Final Year, Aspiring AI Product Engineer
Skills: Python, FastAPI, Groq API, Llama 3, Prompt Engineering, LLM Agent Design, GitHub Actions, SQL, Linux
Projects: Project Humanizer (FastAPI+Groq), LinkedIn Agent (Python+GitHub Actions)
Experience: Technical Support at Profusion Tech (2023-Present), Content Moderator at Yodha (2022)
Education: BCA Final Semester, Madan Bhandari Memorial College, Kathmandu"""
        ))
        db.commit()
    db.close()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
