# CareData AI — Production Deployment Guide

This guide walks you through deploying **CareData AI** to live production. The application consists of a **FastAPI backend** (Python 3.11 + SQLite + Groq LLM) and a **Next.js 14 frontend** (React 18 + Tailwind CSS).

---

## 🚀 Option 1: Vercel (Frontend) + Render (Backend)
**Recommended: 100% Free Tier, Zero Server Maintenance, Automatic HTTPS & CI/CD.**

Your repository is already pushed to GitHub:
`https://github.com/amangari115322/CareAI_Health_Intelligent`

---

### Step 1: Deploy Backend to Render (5 Minutes)

1. Go to [render.com](https://render.com) and sign in with your **GitHub** account.
2. Click **New +** (top right) $\rightarrow$ select **Web Service**.
3. Choose **Build and deploy from a Git repository** $\rightarrow$ click **Next**.
4. Select your repository: `amangari115322/CareAI_Health_Intelligent`.
5. Fill in the deployment settings:
   - **Name**: `caredata-backend` (or your preferred name)
   - **Region**: Any (e.g., `Oregon (US West)` or `Singapore`)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
6. Click **Advanced** $\rightarrow$ **Add Environment Variable**:
   - `PYTHON_VERSION` = `3.11.9`
   - `GROQ_API_KEY` = *(your Groq API key, optional; fallback LLM rules are pre-configured)*
7. Click **Create Web Service**.
8. Wait 1–2 minutes for the build to finish. Once live, Render displays your backend URL:
   `https://caredata-backend-xxxx.onrender.com`
   *(Verify it by visiting `https://caredata-backend-xxxx.onrender.com/api/health` — it will return `{"status": "healthy"}`).*

---

### Step 2: Deploy Frontend to Vercel (2 Minutes)

1. Go to [vercel.com](https://vercel.com) and sign in with **GitHub**.
2. Click **Add New...** $\rightarrow$ select **Project**.
3. Locate `CareAI_Health_Intelligent` and click **Import**.
4. Configure the project:
   - **Framework Preset**: `Next.js` (detected automatically)
   - **Root Directory**: Click **Edit** and select `frontend` $\rightarrow$ click **Continue**.
5. Expand **Environment Variables** and add:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://caredata-backend-xxxx.onrender.com` *(paste your Render backend URL from Step 1)*
6. Click **Deploy**.
7. In ~60 seconds, Vercel will generate your live production URL:
   `https://care-ai-health-intelligent.vercel.app`

---

## 🛠 Option 2: Render Blueprint (1-Click Automated Setup)

The repository includes a ready-to-use [`render.yaml`](file:///c:/Users/hp/Desktop/new%20project/render.yaml) file:

1. Log in to [render.com](https://render.com).
2. Click **New +** $\rightarrow$ **Blueprint**.
3. Select `amangari115322/CareAI_Health_Intelligent`.
4. Render will automatically read `render.yaml`, configure both the **backend** and **frontend** services, and link their environment variables together.
5. Click **Apply**.

---

After deployment, verify the live platform with these quick checks:
- [ ] **Health Endpoint**: Visit `<backend-url>/api/health` (should return HTTP 200).
- [ ] **Data Explorer**: Open `<frontend-url>/explorer` and verify search loads provider records.
- [ ] **Interactive Cleaning**: Test resolving an issue on `<frontend-url>/cleaning`.
- [ ] **Report Downloads**: Click any export button on `<frontend-url>/#how-it-works-and-downloads` to test Excel/CSV generation.
- [ ] **Settings Search**: Type a location in `<frontend-url>/settings` and press Enter to verify cross-page routing.
