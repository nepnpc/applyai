from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class CandidateProfile(Base):
    __tablename__ = "candidate_profile"
    id = Column(Integer, primary_key=True, default=1)
    name = Column(String, default="Subarna Katwal")
    email = Column(String, default="subwrn@gmail.com")
    phone = Column(String, default="+977 9703901454")
    location = Column(String, default="Kathmandu, Nepal")
    linkedin = Column(String, default="linkedin.com/in/subarnakatwal")
    github = Column(String, default="github.com/nepnpc")
    summary = Column(Text)
    skills = Column(Text)  # JSON list
    experience = Column(Text)  # JSON list
    projects = Column(Text)  # JSON list
    certifications = Column(Text)  # JSON list
    target_roles = Column(Text, default='["APM Intern", "Technical BA Intern", "Product Intern", "AI ML Intern"]')
    target_locations = Column(Text, default='["Nepal", "India Remote", "Global Remote"]')
    learning_log = Column(Text, default="[]")  # JSON list of {date, learned}
    resume_text = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow)


class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String)
    company = Column(String)
    location = Column(String)
    description = Column(Text)
    url = Column(String, unique=True)
    source = Column(String)  # linkedin, merojob, indeed
    match_score = Column(Float, default=0.0)
    status = Column(String, default="new")  # new, reviewing, applied, rejected, interview
    cover_letter = Column(Text)
    tailored_resume = Column(Text)
    notes = Column(Text)
    found_at = Column(DateTime, default=datetime.utcnow)
    applied_at = Column(DateTime)


class OutreachContact(Base):
    __tablename__ = "outreach_contacts"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String)
    title = Column(String)
    company = Column(String)
    email = Column(String)
    linkedin = Column(String)
    email_sent = Column(Boolean, default=False)
    email_content = Column(Text)
    sent_at = Column(DateTime)
    replied = Column(Boolean, default=False)
    found_at = Column(DateTime, default=datetime.utcnow)
