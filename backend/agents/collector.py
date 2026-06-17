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
            {"id": "1", "caption": "5 tips for better posture! #fitness #health", "timestamp": "2026-06-16T10:00:00+0000", "like_count": 450, "comments_count": 23, "reach": 4000, "plays": 5500, "saved": 45, "shares": 12},
            {"id": "2", "caption": "My favorite high protein breakfast 🍳 #foodie", "timestamp": "2026-06-15T08:30:00+0000", "like_count": 1200, "comments_count": 89, "reach": 15000, "plays": 22000, "saved": 340, "shares": 88},
            {"id": "3", "caption": "Just chilling today 😴", "timestamp": "2026-06-14T18:00:00+0000", "like_count": 150, "comments_count": 5, "reach": 1200, "plays": 1800, "saved": 2, "shares": 0},
            {"id": "4", "caption": "How to fix shoulder pain in 30 seconds 💥 #fitness #mobility", "timestamp": "2026-06-13T12:00:00+0000", "like_count": 3400, "comments_count": 150, "reach": 45000, "plays": 65000, "saved": 1200, "shares": 450},
            {"id": "5", "caption": "Gym OOTD ✨", "timestamp": "2026-06-12T09:00:00+0000", "like_count": 800, "comments_count": 45, "reach": 8000, "plays": 11000, "saved": 15, "shares": 5},
            {"id": "6", "caption": "Stop doing your squats like this! ❌ #fitness #gymtips", "timestamp": "2026-06-11T17:30:00+0000", "like_count": 2100, "comments_count": 110, "reach": 28000, "plays": 35000, "saved": 850, "shares": 210},
            {"id": "7", "caption": "Late night cravings...", "timestamp": "2026-06-10T22:00:00+0000", "like_count": 220, "comments_count": 12, "reach": 2500, "plays": 3100, "saved": 8, "shares": 1}
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
