# Deployment Guide for Instalytics

## Vercel Deployment (Frontend)

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Select the `instalytics` project

2. **Set Environment Variables in Vercel:**
   - In Vercel dashboard, go to **Settings → Environment Variables**
   - Add: `NEXT_PUBLIC_API_URL` = Your backend URL (see Backend Deployment below)
   - Example: `https://instalytics-backend.railway.app`

3. **Deploy:**
   - Push to `main` branch or manually trigger deploy in Vercel dashboard
   - Vercel will automatically build and deploy the frontend

## Backend Deployment (Python/FastAPI)

You need to deploy the Python backend separately. Recommended platforms:

### Option 1: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select the repository
4. Configure:
   - **Root Directory:** `backend`
   - **Environment Variables:** 
     - `GROQ_API_KEY`: Your Groq API key
     - `DEMO_MODE`: true or false
5. Railway will automatically detect Python and install dependencies
6. Copy the backend URL and add it to Vercel environment variables

### Option 2: Render
1. Go to [render.com](https://render.com)
2. Create new → Web Service
3. Connect GitHub repo
4. Configure:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory:** `backend`
5. Add environment variables

### Option 3: Heroku
1. Create `Procfile` in backend folder: `web: uvicorn main:app --host 0.0.0.0 --port $PORT`
2. Deploy using Heroku CLI or GitHub integration

## Environment Variables

### Frontend (.env for local development)
```
NEXT_PUBLIC_API_URL=http://localhost:8000  # Local development
# or
NEXT_PUBLIC_API_URL=https://your-backend.railway.app  # Production
```

### Backend (.env)
```
GROQ_API_KEY=your_groq_api_key_here
DEMO_MODE=true
```

## Local Development

1. **Backend:**
   ```bash
   cd backend
   python -m pip install -r requirements.txt
   python -m uvicorn main:app --reload
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Access at `http://localhost:3000`

## Troubleshooting

**404 Error on Vercel:**
- ✅ Make sure `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- ✅ Verify the backend is deployed and running
- ✅ Check CORS settings in backend (currently allows all origins)

**CORS Errors:**
- The backend already has CORS enabled for all origins
- If issues persist, verify the `NEXT_PUBLIC_API_URL` matches your backend domain

**Build Fails:**
- Clear Vercel cache and redeploy
- Check that all dependencies are in `requirements.txt` (backend) and `package.json` (frontend)
