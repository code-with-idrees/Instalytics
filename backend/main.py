import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from agents.collector import fetch_reels_data
from agents.analyst import analyze_performance
from agents.planner import generate_plan

load_dotenv()

app = FastAPI(title="Instalytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For hackathon MVP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    access_token: str

@app.post("/analyze")
async def analyze_account(request: AnalyzeRequest):
    try:
        # Step 1: Collect Data
        print("Agent 1: Collecting Data...")
        reels_data = fetch_reels_data(request.access_token)
            
        # Step 2: Analyze Performance
        print("Agent 2: Analyzing Performance...")
        analysis = analyze_performance(reels_data)
        
        # Step 3: Generate Plan
        print("Agent 3: Generating Plan...")
        plan = generate_plan(analysis)
        
        return {
            "status": "success",
            "data": {
                "reels": reels_data,
                "analysis": analysis,
                "plan": plan
            }
        }
    except Exception as e:
        print(f"Error during analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "Instalytics API is running"}
