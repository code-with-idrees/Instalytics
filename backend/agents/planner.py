import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from typing import Dict, Any

def generate_plan(analysis_data: Dict[str, Any]) -> Dict[str, Any]:
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.4)
    
    prompt = PromptTemplate.from_template("""
You are a senior Instagram content strategist. You have been given a performance analysis of a creator's account.

INPUT ANALYSIS:
{analysis_data}

Generate a complete content strategy with this exact JSON schema:

{{
  "content_pillars": [
    {{
      "name": "string (2-4 words)",
      "description": "string (1 sentence explaining what this pillar covers)",
      "why_it_works": "string (1 sentence connecting it to their top performer patterns)",
      "post_ideas": ["string", "string", "string"]
    }}
  ],
  "seven_day_plan": [
    {{
      "day": "Monday",
      "pillar": "string (which content pillar this falls under)",
      "reel_concept": "string (one sentence describing the video)",
      "hook_line": "string (the first words spoken or shown in the reel — make it scroll-stopping)",
      "caption_angle": "string (what the caption should focus on)",
      "hashtags": ["string (5-8 hashtags, mix of niche + broad)"],
      "best_post_time": "string (based on their historical top performer timing)"
    }}
  ],
  "quick_wins": [
    "string (3 immediate changes they can make to improve their next reel, based on top performer patterns)"
  ]
}}

Rules:
- Content pillars must be grounded in their detected niche and top performer keywords
- Hook lines must be under 8 words and create curiosity or urgency
- Post ideas must be specific, not generic (e.g. "How I lost 10kg eating biryani" not "fitness tips")
- Spread the 7 days across all 3 content pillars

You must respond with valid JSON only, no markdown blocks or preamble.
""")

    chain = prompt | llm
    
    response = chain.invoke({"analysis_data": json.dumps(analysis_data)})
    
    # Clean up response if it contains markdown formatting
    content = response.content
    if content.startswith("```json"):
        content = content[7:-3]
    elif content.startswith("```"):
        content = content[3:-3]
        
    return json.loads(content.strip())
