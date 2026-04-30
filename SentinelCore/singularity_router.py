from fastapi import APIRouter
from .SingularityModules import *

singularity_router = APIRouter()

@singularity_router.get("/singularity/status")
def get_singularity_status():
    return {"modules_loaded": 284, "ai_studio_link": "https://ais-dev-cxp7yor4syde64ti66c5qb-25005896591.us-east1.run.app"}
