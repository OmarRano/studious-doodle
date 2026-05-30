# 🚀 Quick Deployment Setup

This guide provides a **rapid checklist** to deploy your Gimbiya Mall app to Vercel (frontend) + Render (backend).

## 📋 Pre-Deployment Checklist

### Local Validation
```bash
# Run validation script
bash pre-deploy.sh
```

This will check:
- ✅ Node version compatibility
- ✅ TypeScript compilation
- ✅ Full project build

### Environment Files
- [ ] Copy `.env.example` to `.env.local` (local development)
- [ ] Copy `client/.env.example` to `client/.env.local` (frontend local dev)
- [ ] Verify all required credentials are valid

---

## 🟦 Backend Deployment (Render)

### 1. Prepare on Render.com

```
render.com → New Web Service → Connect GitHub Repository
```

**Configuration Details:**

| Setting | Value |
|---------|-------|
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |
| **Node Version** | 18.17.0 (or latest stable) |

### 2. Environment Variables (Add these in Render Dashboard)

**Critical (Required)**:
```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/gimbiya_mall?retryWrites=true&w=majority
JWT_SECRET=your-random-32-char-min-secret-string-here
CORS_ORIGIN=https://your-vercel-url.vercel.app
```

**Optional (If Using)**:
```
DATABASE_URL=mysql://user:pass@host:3306/db  (only if using Drizzle/MySQL)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
MONNIFY_API_KEY=...
MONNIFY_API_SECRET=...
MONNIFY_CONTRACT_CODE=...
```

### 3. Deploy Backend

1. Push to GitHub: `git push origin main`
2. Render auto-deploys on push
3. Monitor logs: **Render Dashboard → Your Service → Logs**
4. **Deployment URL** will be: `https://your-service-name.onrender.com`

⏱️ **Expected deployment time**: 5-10 minutes

---

## ⚪ Frontend Deployment (Vercel)

### 1. Create on Vercel.com

```
vercel.com → Add New → Project → Import GitHub Repo
```

**Framework Selection**: `Vite`

### 2. Build & Output Settings

Vercel should auto-detect, but verify:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `client/dist` |
| **Install Command** | `npm install` |

### 3. Environment Variables (Add in Vercel Dashboard)

**Critical**:
```
VITE_API_URL=https://your-render-backend.onrender.com
```

**Required Firebase** (get from [console.firebase.google.com](https://console.firebase.google.com)):
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 4. Deploy Frontend

1. Push to GitHub: `git push origin main`
2. Vercel auto-deploys
3. Monitor build: **Vercel Dashboard → Deployments**
4. **Frontend URL** will be: `https://your-project-name.vercel.app`

⏱️ **Expected deployment time**: 2-5 minutes

---

## 🔗 Post-Deployment Configuration

### Step 1: Cross-Update URLs

After both services are live, verify they can communicate:

**Update Backend CORS:**
1. Go to **Render Dashboard** → Your Service → **Environment**
2. Find `CORS_ORIGIN`
3. Update to your Vercel URL: `https://your-project-name.vercel.app`
4. Click **Save Changes** (auto-redeployes)

**Update Frontend API:**
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Find `VITE_API_URL`
3. Update to your Render URL: `https://your-service-name.onrender.com`
4. Redeploy frontend (trigger by pushing to GitHub or clicking "Redeploy")

### Step 2: Verify Connectivity

```bash
# Run smoke tests
bash post-deploy-test.sh https://your-render-backend.onrender.com https://your-vercel-frontend.vercel.app
```

✅ Both should respond with HTTP 200

---

## 🐛 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| **Frontend shows blank page** | API endpoint misconfigured | Verify `VITE_API_URL` in Vercel env vars |
| **"CORS Error" in console** | Backend CORS not updated | Update `CORS_ORIGIN` on Render to match Vercel URL |
| **"Cannot connect to database"** | MongoDB connection string invalid | Verify `MONGODB_URI` includes credentials and whitelist Render IP |
| **Build fails on Vercel** | TypeScript errors | Run `npm run check` locally, fix errors |
| **Build fails on Render** | Missing dependencies | Ensure `package.json` includes all dependencies |
| **API requests timeout** | Backend not running | Check Render logs, ensure service has redeployed |

---

## 📊 Monitoring After Deployment

### Render (Backend)
```
Dashboard → Your Service → Logs (Real-time logs)
Dashboard → Your Service → Metrics (CPU, Memory, Requests)
```

### Vercel (Frontend)
```
Dashboard → Your Project → Deployments → Logs
Dashboard → Your Project → Analytics (Page speed, errors)
```

---

## 🔐 Security Best Practices

- [ ] **JWT_SECRET**: Use a long (32+ char), random, unique string. Generate with:
  ```bash
  openssl rand -base64 32
  ```
  
- [ ] **Database credentials**: Never commit `.env` files. Use Render/Vercel secret management.

- [ ] **CORS_ORIGIN**: Always specify exact frontend URL (don't use `*` in production).

- [ ] **API Keys**: Store all API keys (Firebase, AWS, Monnify) in platform secret management.

- [ ] **HTTPS**: Both Vercel and Render provide free HTTPS. Ensure all API calls use `https://`.

---

## 📞 Troubleshooting Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Express.js**: https://expressjs.com
- **Vite**: https://vitejs.dev
- **Firebase**: https://firebase.google.com/docs

---

## ✅ Deployment Success Indicators

Once deployed, verify:

1. ✅ Frontend loads at `https://your-vercel-url.vercel.app`
2. ✅ No CORS errors in browser console
3. ✅ Can log in / authenticate (if applicable)
4. ✅ API requests complete without timeout
5. ✅ Both services appear in respective dashboards
6. ✅ Logs show no critical errors

---

**Congratulations!** Your app is live! 🎉
