import json
import os
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from typing import List, Dict, Any

def analyze_performance(reels_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    llm = ChatOpenAI(
      api_key=os.getenv("GROQ_API_KEY"),
      base_url="https://api.groq.com/openai/v1",
      model="llama-3.3-70b-versatile",
      temperature=0.2
    )
    
    prompt = PromptTemplate.from_template("""
You are a content performance analyst. You have been given data about an Instagram creator's last 10 Reels with metrics.
The creator's bio is: "i do speaking, voice acting and accents. acc based in pakistan"

INPUT DATA:
{reels_data}

Perform the following analysis:

1. PERFORMANCE LABELING:
   - TOP_PERFORMER: top 25% by plays
   - UNDERPERFORMER: bottom 25% by plays
   - AVERAGE: everything else

2. TOP PERFORMER PATTERNS:
   Look at the top 5 reels and identify what they share:
   - Average caption length (short <50 chars, medium 50-150, long >150)
   - Hashtag count range
   - Common keywords in captions
   - Best performing day/time from timestamps
   - Tone (educational, entertaining, personal, promotional)

3. UNDERPERFORMER DIAGNOSIS:
   For each underperformer, give one primary failure reason:
   - "weak_hook" (caption doesn't grab attention in first line)
   - "off_niche" (content doesn't match creator's main topics)
   - "low_engagement_bait" (no question, CTA, or reason to interact)
   - "poor_timing" (posted at low-traffic time)
   - "low_hashtags" (fewer than 3 hashtags)
   - "other: [brief reason]"

4. NICHE DETECTION:
   Extract the 3 most recurring topic keywords across all captions. Infer the creator's niche as one of: fitness, food, travel, tech, fashion, lifestyle, education, comedy, beauty, business, gaming, or "other: [specify]"

Return this exact JSON schema:
{{
  "performance_labels": [
    {{"id": "string", "label": "TOP_PERFORMER|AVERAGE|UNDERPERFORMER", "plays": 0}}
  ],
  "top_patterns": {{
    "avg_caption_length": "short|medium|long",
    "hashtag_count_range": "string e.g. 5-10",
    "common_keywords": ["string"],
    "best_posting_time": "string e.g. Tuesday 7PM",
    "tone": "string"
  }},
  "underperformer_diagnoses": [
    {{"id": "string", "reason": "string", "improvement": "one sentence specific fix"}}
  ],
  "detected_niche": "string",
  "niche_keywords": ["string", "string", "string"]
}}

You must respond with valid JSON only, no markdown blocks or preamble.
""")

    chain = prompt | llm
    
    response = chain.invoke({"reels_data": json.dumps(reels_data)})
    
    # Clean up response if it contains markdown formatting
    content = response.content
    if content.startswith("```json"):
        content = content[7:-3]
    elif content.startswith("```"):
        content = content[3:-3]
        
    return json.loads(content.strip())
