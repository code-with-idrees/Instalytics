# Instalytics — Hackathon Context & Master Prompt File

## What Is This?

This is the full context for an AI-powered Instagram content analytics system called **Instalytics**, built for a hackathon. Share this file with any AI assistant to get it fully up to speed. The hackathon theme is: **agents making decisions to solve a problem.**

---

## The Idea

**Instalytics** helps Instagram content creators understand what's working and what isn't on their profile, and generates an actionable content plan.

The user logs in with their own Instagram account (OAuth via Meta). The system then runs a 3-agent pipeline:

1. **Agent 1 — Collector:** Fetches the user's last 20 Reels + per-post metrics via the Instagram Graph API
2. **Agent 2 — Analyst:** Diagnoses best and worst performers, finds patterns, detects niche
3. **Agent 3 — Planner:** Generates content pillars + a 7-day content plan based on the analysis

### Core Features
- Input: Instagram OAuth login (user's own account)
- Performance ranking of last 20 Reels (TOP / AVERAGE / UNDERPERFORMER)
- Diagnosis: why each top/bottom post worked or flopped (based on caption, hashtags, timing, keywords)
- Niche detection from recurring caption keywords and bio
- 3 content pillars for the creator's niche
- 7-day posting plan with hooks, caption angles, hashtag strategy, posting times
- One specific improvement tip per underperformer

### Stretch Features (if time allows)
- Allow user to paste the script of a reel for deeper analysis
- Multi-account support
- Export plan as PDF

---

## Data Access — How It Actually Works

- The user must have an **Instagram Business or Creator account** (converting from personal takes 5 minutes in the app)
- The account must be linked to a **Facebook Page**
- Authentication is done via **Meta OAuth 2.0** — user clicks "Connect Instagram," logs in, grants permissions, and we store a long-lived access token (valid 60 days)
- No scraping. No third-party data broker. Only the Meta Graph API with the user's own token.

### API Endpoints Used
```
GET /me/media?fields=id,caption,media_type,timestamp,like_count,comments_count
GET /{media-id}/insights?metric=reach,plays,saved,shares
GET /me?fields=biography,followers_count,media_count
```

### Permissions Required (request during OAuth)
- `instagram_basic`
- `instagram_manage_insights`
- `pages_read_engagement`

### What Metrics Are Available via API
- ✅ Views (plays), Likes, Comments, Reach, Saves, Shares
- ✅ Follower count, Bio, Post count
- ✅ Post timestamp (to infer best posting time)
- ❌ Audience retention graphs (only visible in-app, not in API)
- ❌ Story analytics (requires special permissions)

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) | Easy Vercel deploy, team knows it |
| Backend | FastAPI (Python) | Easy Railway deploy, Python ecosystem for AI |
| Agent Framework | LangChain + `langchain-google-genai` | Native agent/chain support, modular |
| LLM | Google Gemini 1.5 Flash | Free tier (15 RPM, 1M tokens/day), no credit card |
| Instagram Data | Meta Graph API | Official, no scraping risk |
| Deployment | Vercel (Next.js) + Railway (FastAPI) | Both have free tiers, one-command deploy |
| State/Cache | Python dict + JSON file cache | Simple, prevents re-fetching during demo |

### Why LangChain?
The system uses LangChain's `AgentExecutor` to define each of the 3 agents with their own tools, prompt templates, and output parsers. The agents are chained sequentially — each agent's JSON output is passed as input to the next. This makes it a genuine agentic system (not just 3 sequential LLM calls) and is impressive to hackathon judges.

### Why Gemini Flash?
- Truly free: 15 requests/minute, 1 million tokens/day
- No billing setup required
- LangChain integration: `from langchain_google_genai import ChatGoogleGenerativeAI`
- Get key at: https://aistudio.google.com/app/apikey

---

## Architecture

```
User (Next.js frontend)
        │
        │  POST /analyze  {access_token}
        ▼
FastAPI Backend
        │
        ├── Agent 1: Collector
        │     Tool: InstagramFetcherTool (calls Graph API)
        │     Output: JSON array of 20 reels with metrics
        │
        ├── Agent 2: Analyst
        │     Input: Collector output
        │     Tool: PerformanceRankerTool, PatternDetectorTool
        │     Output: JSON with labels, patterns, detected_niche
        │
        └── Agent 3: Planner
              Input: Analyst output
              Tool: ContentPlannerTool
              Output: JSON with pillars, 7-day plan, improvement tips
        │
        ▼
Response back to Next.js → renders dashboard
```

---

## Prompts for Each Agent

### System Prompt (used for all agents)
```
You are an expert Instagram content strategist and data analyst. You always respond with valid JSON only — no markdown, no explanation, no preamble. Your JSON must exactly match the schema specified in the user message. If a data point is unavailable, use null.
```

---

### Agent 1 — Collector Prompt
```
You have been given an Instagram access token. Your job is to fetch the user's last 20 Instagram Reels and their performance metrics using the Instagram Graph API v22.0.

Make these API calls:
1. GET https://graph.facebook.com/v22.0/me/media?fields=id,caption,media_type,timestamp,like_count,comments_count&limit=20&access_token={TOKEN}
2. For each media item where media_type is REEL or VIDEO, call:
   GET https://graph.facebook.com/v22.0/{MEDIA_ID}/insights?metric=reach,plays,saved,shares&access_token={TOKEN}

Return a JSON array with this schema for each reel:
{
  "id": "string",
  "caption": "string or null",
  "timestamp": "ISO8601 string",
  "like_count": number,
  "comments_count": number,
  "reach": number or null,
  "plays": number or null,
  "saved": number or null,
  "shares": number or null
}

Sort the array by plays descending. Return only the JSON array, nothing else.
```

---

### Agent 2 — Analyst Prompt
```
You are a content performance analyst. You have been given data about an Instagram creator's last 20 Reels with metrics.

INPUT DATA:
{COLLECTOR_OUTPUT}

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
{
  "performance_labels": [
    {"id": "string", "label": "TOP_PERFORMER|AVERAGE|UNDERPERFORMER", "plays": number}
  ],
  "top_patterns": {
    "avg_caption_length": "short|medium|long",
    "hashtag_count_range": "string e.g. 5-10",
    "common_keywords": ["string"],
    "best_posting_time": "string e.g. Tuesday 7PM",
    "tone": "string"
  },
  "underperformer_diagnoses": [
    {"id": "string", "reason": "string", "improvement": "one sentence specific fix"}
  ],
  "detected_niche": "string",
  "niche_keywords": ["string", "string", "string"]
}
```

---

### Agent 3 — Planner Prompt
```
You are a senior Instagram content strategist. You have been given a performance analysis of a creator's account.

INPUT ANALYSIS:
{ANALYST_OUTPUT}

Generate a complete content strategy with this exact JSON schema:

{
  "content_pillars": [
    {
      "name": "string (2-4 words)",
      "description": "string (1 sentence explaining what this pillar covers)",
      "why_it_works": "string (1 sentence connecting it to their top performer patterns)",
      "post_ideas": ["string", "string", "string"]
    }
  ],
  "seven_day_plan": [
    {
      "day": "Monday",
      "pillar": "string (which content pillar this falls under)",
      "reel_concept": "string (one sentence describing the video)",
      "hook_line": "string (the first words spoken or shown in the reel — make it scroll-stopping)",
      "caption_angle": "string (what the caption should focus on)",
      "hashtags": ["string (5-8 hashtags, mix of niche + broad)"],
      "best_post_time": "string (based on their historical top performer timing)"
    }
  ],
  "quick_wins": [
    "string (3 immediate changes they can make to improve their next reel, based on top performer patterns)"
  ]
}

Rules:
- Content pillars must be grounded in their detected niche and top performer keywords
- Hook lines must be under 8 words and create curiosity or urgency
- Post ideas must be specific, not generic (e.g. "How I lost 10kg eating biryani" not "fitness tips")
- Spread the 7 days across all 3 content pillars
```

---

## Frontend UI — 3 Screens

### Screen 1: Landing Page
- Headline: "Know exactly why your reels work."
- Subheadline: "Connect your Instagram. Get a data-backed content plan in 60 seconds."
- Single CTA button: "Connect Instagram →" (triggers Meta OAuth)
- Note below button: "We only read your own post data. Nothing is stored."
- Design: Dark background, clean minimal, one accent color (suggest indigo or violet)

### Screen 2: Processing Screen
- Shows pipeline progress with animated steps:
  - ✅ Connected as @handle
  - 🔄 Fetching your last 20 reels...
  - 🔄 Analyzing performance patterns...
  - 🔄 Building your content plan...
- Simple step-by-step animated loader (no spinner, feels more agentic)

### Screen 3: Results Dashboard — 3 Tabs

**Tab 1 — Performance**
- Bar chart (Chart.js) showing views per reel, color-coded: green = TOP, yellow = AVERAGE, red = UNDERPERFORMER
- Below chart: cards for each reel with label badge + one-line diagnosis for underperformers

**Tab 2 — Why It Worked / Flopped**
- "What's working for you" section: bullet list of top patterns (best time, tone, caption length)
- "What's hurting you" section: each underperformer with its diagnosis + specific fix

**Tab 3 — Your Content Plan**
- 3 content pillar cards
- 7-day calendar view with each day's reel concept, hook, and hashtags

---

## Implementation Timeline

### Today (4–5 hrs) — Plan + Setup
- [ ] Convert Instagram account to Creator (5 min in app)
- [ ] Create Meta Developer App at developers.facebook.com
- [ ] Link Facebook Page to Instagram account
- [ ] Generate long-lived access token with required permissions
- [ ] Test API call in browser — confirm you get your posts back
- [ ] Get Gemini API key at aistudio.google.com/app/apikey
- [ ] Write out and finalize prompts (done — see above)
- [ ] Sketch UI screens

### Tomorrow (5 hrs) — Build + Deploy

| Time | Task |
|---|---|
| 0:00–0:30 | Scaffold FastAPI project, install deps, scaffold Next.js app |
| 0:30–1:15 | Build Graph API fetcher (Agent 1) — test with real token |
| 1:15–2:15 | Build LangChain Agents 2 + 3 with Gemini Flash |
| 2:15–3:15 | Build Next.js frontend (3 screens, use Tailwind) |
| 3:15–4:15 | Wire frontend ↔ FastAPI, test full pipeline |
| 4:15–4:45 | Deploy FastAPI to Railway, Next.js to Vercel |
| 4:45–5:00 | Test on live URL, fix any env variable issues |

---

## Key Environment Variables Needed
```
# FastAPI (.env)
INSTAGRAM_ACCESS_TOKEN=your_long_lived_token
GEMINI_API_KEY=your_gemini_key
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret

# Next.js (.env.local)
NEXT_PUBLIC_API_URL=your_railway_backend_url
```

---

## FastAPI Dependencies
```
pip install fastapi uvicorn langchain langchain-google-genai python-dotenv requests
```

## Next.js Dependencies
```
npm install axios chart.js react-chartjs-2 tailwindcss
```

---

## Demo Script (for judges)

1. Open the app → show the clean landing page
2. Click "Connect Instagram" → complete OAuth (or skip with pre-stored token if demoing)
3. Watch the 3-step agent pipeline animate on screen
4. Tab 1: Point at the bar chart — "Agent 1 fetched all 20 reels, Agent 2 ranked them"
5. Tab 2: Point at a specific underperformer diagnosis — "The agent identified *why* this reel flopped and gave a specific fix"
6. Tab 3: Show the 7-day plan — "Agent 3 generated this entire content strategy grounded in what actually worked on this account"

Key pitch line: *"This isn't just analytics — it's an agent that acts like a social media manager who's read every post you've ever made."*

---

## Risks + Mitigations

| Risk | Mitigation |
|---|---|
| Meta OAuth fails during demo | Pre-store a valid long-lived token, skip live OAuth for judges |
| API rate limit hit | Cache first successful API response to `cache.json`, always read from cache first |
| LLM returns malformed JSON | Wrap all LLM calls in try/except, fall back to hardcoded sample output |
| Railway cold start slow | Keep backend warm with a `/ping` endpoint hit from frontend on load |
| Not enough time for OAuth UI | Just hardcode token server-side for demo; explain OAuth would be the real flow |
