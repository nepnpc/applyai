import json
import re


def score_job(job: dict, profile: dict) -> float:
    skills = json.loads(profile.get("skills", "[]"))
    target_roles = json.loads(profile.get("target_roles", "[]"))

    text = (job.get("title", "") + " " + job.get("description", "")).lower()
    score = 0.0

    # skill match
    for skill in skills:
        if skill.lower() in text:
            score += 5

    # role match
    for role in target_roles:
        if any(word.lower() in text for word in role.split()):
            score += 10

    # location match
    target_locs = json.loads(profile.get("target_locations", "[]"))
    job_loc = job.get("location", "").lower()
    for loc in target_locs:
        if loc.lower() in job_loc or "remote" in job_loc:
            score += 8
            break

    # learning log boost — recently learned skills get priority
    try:
        logs = json.loads(profile.get("learning_log", "[]"))
        for log in logs[-10:]:
            words = re.findall(r"\w+", log.get("learned", "").lower())
            for word in words:
                if len(word) > 3 and word in text:
                    score += 3
    except Exception:
        pass

    return min(score, 100.0)
