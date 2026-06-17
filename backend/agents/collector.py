import requests
import os
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

def fetch_reels_data(access_token: str) -> List[Dict[str, Any]]:
    """
    Fetches the last 20 Reels and their metrics using the Instagram Graph API.
    """
    base_url = "https://graph.facebook.com/v22.0"
    
    # Hackathon Savior: DEMO MODE
    if os.getenv("DEMO_MODE", "False").lower() == "true":
        print("Agent 1: Running in DEMO MODE (using realistic mock data)")
        return [
            {"id": "1", "caption": "How to improve your English speaking #speaking #accents", "timestamp": "2026-06-16T10:00:00+0000", "like_count": 220, "comments_count": 15, "reach": 10000, "plays": 12000, "saved": 45, "shares": 270},
            {"id": "2", "caption": "How to improve your English speaking Part 2 (Shadowing Series #1) #speaking", "timestamp": "2026-06-15T08:30:00+0000", "like_count": 190, "comments_count": 12, "reach": 6000, "plays": 7400, "saved": 30, "shares": 270},
            {"id": "3", "caption": "Stop translating from Urdu to English\n\nIf you want to speak English fluently, stop translating every sentence from Urdu to English inside your head. Native speakers don't translate. They think directly in English. Start with simple thoughts like 'I'm hungry' or 'I need water' and say them directly in English. This single habit can dramatically improve your fluency. Follow for more English speaking tips. #speaking #pakistani", "timestamp": "2026-06-14T18:00:00+0000", "like_count": 340, "comments_count": 25, "reach": 12000, "plays": 15800, "saved": 85, "shares": 410},
            {"id": "4", "caption": "3 mistakes Pakistanis make when speaking English\n\nIf you're Pakistani and learning English, avoid these three mistakes. Number one: speaking too fast. Number two: focusing on grammar instead of communication. Number three: translating every sentence from Urdu. Fix these and you'll sound much more natural. Follow for more tips. #speaking #pakistani #accents", "timestamp": "2026-06-13T12:00:00+0000", "like_count": 260, "comments_count": 18, "reach": 8000, "plays": 9600, "saved": 55, "shares": 320},
            {"id": "5", "caption": "How to improve your English accent\n\nMost people think improving your accent means changing how your voice sounds. That's wrong. An accent is mostly about pronunciation patterns. Start by learning how native speakers pronounce vowels, stress words, and connect sounds together. Master those three things and your accent will improve much faster. Follow for more. #accents #speaking", "timestamp": "2026-06-12T09:00:00+0000", "like_count": 410, "comments_count": 35, "reach": 15000, "plays": 18200, "saved": 110, "shares": 520},
            {"id": "6", "caption": "American accent vs Pakistani accent\n\nListen carefully. Most Pakistanis pronounce every word separately. American speakers connect their words together. For example, 'What are you doing?' often sounds more like 'Whaddaya doing?' Learn these connections and you'll sound much more natural. Follow for daily speaking tips. #accents #pakistani", "timestamp": "2026-06-11T17:30:00+0000", "like_count": 290, "comments_count": 20, "reach": 10000, "plays": 11400, "saved": 75, "shares": 370},
            {"id": "7", "caption": "Learn any accent in 30 days\n\nIf you want to learn an American, British, or Australian accent, don't start with pronunciation rules. First, choose one speaker and copy them every day for ten minutes. The fastest way to learn an accent is through imitation, not theory. Follow for more accent training tips. #accents #voiceacting", "timestamp": "2026-06-10T22:00:00+0000", "like_count": 210, "comments_count": 14, "reach": 7500, "plays": 8900, "saved": 50, "shares": 250},
            {"id": "8", "caption": "The fastest way to sound fluent\n\nWant to sound fluent even if your grammar isn't perfect? Learn common phrases instead of individual words. Native speakers use chunks like 'to be honest,' 'at the end of the day,' and 'you know what I mean.' Learn phrases, not vocabulary lists. Follow for more. #speaking #voiceacting", "timestamp": "2026-06-09T14:00:00+0000", "like_count": 560, "comments_count": 45, "reach": 20000, "plays": 22700, "saved": 160, "shares": 710},
            {"id": "9", "caption": "Shadowing Series Part 2\n\nYesterday we learned what shadowing is. Today let's do a practice session. Listen carefully and repeat exactly as the speaker speaks. Focus on rhythm, stress, and pronunciation. 10 seconds of shadowing demonstration. Do this for five minutes daily and your speaking will improve significantly. Follow for more. #speaking", "timestamp": "2026-06-08T11:00:00+0000", "like_count": 330, "comments_count": 22, "reach": 11000, "plays": 13100, "saved": 90, "shares": 390},
            {"id": "10", "caption": "Speak English confidently in public\n\nConfidence doesn't come before speaking English. Confidence comes from speaking English. Stop waiting until you're perfect. Start speaking today, make mistakes, learn from them, and improve over time. That's exactly how fluent speakers became fluent. Follow for more English speaking tips. #publicspeaking", "timestamp": "2026-06-07T16:00:00+0000", "like_count": 170, "comments_count": 10, "reach": 5500, "plays": 6800, "saved": 25, "shares": 190}
        ]

    # 1. Resolve the Instagram Business Account ID
    ig_user_id = os.getenv("IG_USER_ID")
    
    if not ig_user_id:
        # Since the token is a Facebook User token, we must first find the connected FB Page
        # and then get its associated Instagram Business Account ID.
        accounts_url = f"{base_url}/me/accounts"
        accounts_params = {
            "fields": "instagram_business_account",
            "access_token": access_token
        }
        
        accounts_response = requests.get(accounts_url, params=accounts_params)
        if accounts_response.status_code != 200:
            error_msg = accounts_response.text
            print(f"Error fetching accounts: {error_msg}")
            raise ValueError(f"Meta API Error (Accounts): {error_msg}")
            
        accounts_data = accounts_response.json().get("data", [])
        
        import json
        for page in accounts_data:
            if "instagram_business_account" in page:
                ig_user_id = page["instagram_business_account"]["id"]
                break
                
        if not ig_user_id:
            raise ValueError(f"Could not find a connected Instagram account. Raw Meta response for your Pages was: {json.dumps(accounts_data)}")

    # 2. Get the last 20 media items using the correct ig_user_id
    media_url = f"{base_url}/{ig_user_id}/media"
    params = {
        "fields": "id,caption,media_type,timestamp,like_count,comments_count",
        "limit": 20,
        "access_token": access_token
    }
    
    response = requests.get(media_url, params=params)
    if response.status_code != 200:
        error_msg = response.text
        print(f"Error fetching media: {error_msg}")
        raise ValueError(f"Meta API Error (Media): {error_msg}")
        
    media_data = response.json().get("data", [])
    reels = []
    
    for item in media_data:
        if item.get("media_type") in ["REEL", "VIDEO"]:
            media_id = item.get("id")
            
            # 2. Fetch insights for each reel
            insights_url = f"{base_url}/{media_id}/insights"
            insights_params = {
                "metric": "reach,plays,saved,shares",
                "access_token": access_token
            }
            
            insights_response = requests.get(insights_url, params=insights_params)
            metrics = {
                "reach": None,
                "plays": None,
                "saved": None,
                "shares": None
            }
            
            if insights_response.status_code == 200:
                insights_data = insights_response.json().get("data", [])
                for insight in insights_data:
                    name = insight.get("name")
                    values = insight.get("values", [])
                    if values:
                        metrics[name] = values[0].get("value")
            else:
                print(f"Warning: Could not fetch insights for media {media_id}. Falling back to basic metrics.")
                print(f"Response: {insights_response.text}")
            
            # MVP Fallback: If plays is not available from insights, we estimate it or leave null
            # Usually likes are a proxy for views if views aren't available, but it's better to use likes for sorting fallback
            plays_value = metrics["plays"]
            fallback_sort = plays_value if plays_value is not None else (item.get("like_count", 0) * 10)
            
            reel_data = {
                "id": media_id,
                "caption": item.get("caption"),
                "timestamp": item.get("timestamp"),
                "like_count": item.get("like_count", 0),
                "comments_count": item.get("comments_count", 0),
                "reach": metrics["reach"],
                "plays": plays_value,
                "saved": metrics["saved"],
                "shares": metrics["shares"],
                "_sort_val": fallback_sort
            }
            reels.append(reel_data)
            
    # Sort by plays descending (or fallback)
    reels.sort(key=lambda x: x["_sort_val"], reverse=True)
    
    # Remove the temporary sort key
    for r in reels:
        r.pop("_sort_val", None)
        
    return reels
