from typing import List, Dict, Any
from fastapi import APIRouter
from app.models import ProjectStats
from app.database import db_manager

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectStats])
def get_projects_overview():
    audits_col = db_manager.get_collection("audits")
    all_audits = audits_col.find(sort_by="created_at", reverse=True)
    
    projects_map: Dict[str, List[Dict[str, Any]]] = {}
    for a in all_audits:
        p_name = a.get("project_name", "Untitled Project")
        if p_name not in projects_map:
            projects_map[p_name] = []
        projects_map[p_name].append(a)

    stats_list: List[ProjectStats] = []
    for p_name, audits in projects_map.items():
        latest = audits[0]
        scores = [a.get("overall_score", 0.0) for a in audits]
        highest = max(scores) if scores else 0.0
        
        # Sort by creation for first audited date
        first = audits[-1]
        
        stats_list.append(
            ProjectStats(
                project_name=p_name,
                total_audits=len(audits),
                latest_score=latest.get("overall_score", 0.0),
                latest_grade=latest.get("letter_grade", "N/A"),
                latest_audit_id=latest.get("id") or str(latest.get("_id", "")),
                highest_score=highest,
                first_audited_at=first.get("created_at", ""),
                last_audited_at=latest.get("created_at", "")
            )
        )

    return stats_list
