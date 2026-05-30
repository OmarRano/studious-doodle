# Deployment Guide: Vercel + Render

This guide covers deploying the **Gimbiya Mall** frontend to Vercel and backend to Render.

## Project Structure

```
/workspaces/studious-doodle/
├── client/              (Frontend - React/Vite)  → Deploy to Vercel
├── server/              (Backend - Express)      → Deploy to Render
├── shared/              (Shared types)
├── drizzle/             (Database schema)
├── package.json         (Monorepo root)
├── vercel.json          (Vercel config)
└── render.yaml          (Render config)
```

---

## Backend Deployment (Render)

### Prerequisites
- Render account (free or paid tier)
- MongoDB Atlas database (or any MongoDB provider)
- MySQL database (for Drizzle, if using)
- All required API keys and secrets

### Step 1: Prepare Backend Environment Variables

Required environment variables on Render:

| Variable | Type | Description |
|----------|------|-------------|
| `NODE_ENV` | Fixed | `production` |
| `MONGODB_URI` | Secret | MongoDB connection string |
| `MONGODB_DB_NAME` | Fixed | `gimbiya_mall` |
| `JWT_SECRET` | Secret | Min 32 characters, unique and secure |
| `PORT` | Fixed | `3000` (Render assigns automatically) |
| `DATABASE_URL` | Secret | MySQL connection string (if using Drizzle) |
| `CORS_ORIGIN` | Fixed | Your Vercel frontend URL (e.g., `https://yourdomain.vercel.app`) |
| `AWS_ACCESS_KEY_ID` | Secret | AWS S3 credentials (if using) |
| `AWS_SECRET_ACCESS_KEY` | Secret | AWS S3 credentials (if using) |
| `AWS_S3_BUCKET` | Fixed | S3 bucket name (if using) |
| `MONNIFY_API_KEY` | Secret | Payment gateway API key |
| `MONNIFY_API_SECRET` | Secret | Payment gateway secret |
| `MONNIFY_CONTRACT_CODE` | Secret | Payment gateway contract code |

### Step 2: Create Render Web Service

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `gimbiya-mall-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Standard (or Free for testing)

### Step 3: Set Environment Variables on Render

1. In your service dashboard, go to **Environment**
2. Add all variables from the table above
3. For secrets, toggle the "Secret" option and use Render's secret management

### Step 4: Deploy

```bash
git push origin main
```

Render will automatically build and deploy on every push to your connected branch.

**Your backend URL will be**: `https://your-service-name.onrender.com`

---

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account (free tier available)
- Backend URL from Render (from Step 2 above)
- Firebase configuration

### Step 1: Prepare Frontend Environment Variables

Required environment variables on Vercel:

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (e.g., `https://your-service-name.onrender.com`) |
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

### Step 2: Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Select root directory configuration:
   - **Root Directory**: `.`
   - **Framework**: `Vite`

### Step 3: Configure Build Settings

Vercel should auto-detect, but verify:
- **Build Command**: `npm run build`
- **Output Directory**: `client/dist`
- **Install Command**: `npm install`

### Step 4: Set Environment Variables

1. Go to project **Settings** → **Environment Variables**
2. Add all variables from the table above
3. Set scope to `Production`, `Preview`, and `Development` as needed

**Critical**: Set `VITE_API_URL` to your Render backend URL before deploying.

### Step 5: Deploy

1. Push your code to GitHub
2. Vercel will automatically deploy on push
3. Once deployment succeeds, your app is live!

**Your frontend URL will be**: `https://your-project-name.vercel.app`

---

## Post-Deployment Configuration

### Step 1: Update Backend CORS

Once you have your Vercel frontend URL, update the backend on Render:

1. Go to Render dashboard → Your backend service
2. **Environment** → Edit `CORS_ORIGIN`
3. Set it to: `https://your-project-name.vercel.app`
4. Redeploy the backend

### Step 2: Update Frontend API Endpoint

Once you have your Render backend URL, update Vercel:

1. Go to Vercel dashboard → Your project
2. **Settings** → **Environment Variables**
3. Update `VITE_API_URL` to your Render URL
4. Redeploy frontend

### Step 3: Test API Connectivity

1. Open your Vercel frontend
2. Check browser console for any CORS errors
3. Try making an API request (e.g., login/signup)
4. Monitor Render logs for any backend errors

---

## Monitoring & Logs

### Render Logs
```
Render Dashboard → Your Service → Logs
```
- View real-time server logs
- Check for errors, database connection issues, etc.

### Vercel Logs
```
Vercel Dashboard → Your Project → Deployments → View Logs
```
- Build logs (npm install, vite build, esbuild)
- Runtime logs (if using serverless functions)

---

## Troubleshooting

### Frontend Not Connecting to Backend

**Issue**: API calls fail with CORS errors

**Solution**:
1. Verify `VITE_API_URL` environment variable is set correctly
2. Check backend `CORS_ORIGIN` includes your Vercel URL
3. Ensure backend is running (check Render logs)

### Build Failures on Vercel

**Issue**: `npm run build` fails

**Possible Causes**:
- TypeScript errors (run `npm run check` locally)
- Missing environment variables
- Dependency conflicts

**Solution**:
1. Test locally: `cd client && npm run build`
2. Check Vercel build logs
3. Ensure all environment variables are set

### Build Failures on Render

**Issue**: `npm run build` fails during deployment

**Possible Causes**:
- esbuild compilation errors
- Missing dependencies
- TypeScript errors in server code

**Solution**:
1. Test locally: `npm run build`
2. Check Render build logs
3. Verify all dependencies in `package.json`

### Database Connection Failures

**Issue**: "Cannot connect to MongoDB" or "DATABASE_URL not found"

**Solution**:
1. Verify `MONGODB_URI` and `DATABASE_URL` are set on Render
2. Check your MongoDB Atlas firewall allows Render IPs
3. Test connection string locally before deploying

---

## Production Checklist

- [ ] All environment variables set on both Vercel and Render
- [ ] CORS_ORIGIN on Render matches Vercel frontend URL
- [ ] VITE_API_URL on Vercel matches Render backend URL
- [ ] MongoDB and database connections tested
- [ ] JWT_SECRET is secure and unique
- [ ] API keys (Firebase, AWS, Monnify) are valid and in production
- [ ] Both deployments pass health checks
- [ ] HTTPS enabled (automatic on both platforms)
- [ ] Testing on staging before production

---

## Useful Commands

```bash
# Build backend
npm run build

# Test build locally
npm start

# Build frontend
cd client && npm run build

# Check for TypeScript errors
npm run check

# Run tests
npm run test
```

---

## Important Notes

1. **Monorepo Structure**: This project uses a single `package.json` at the root with both frontend and backend code. Keep this in mind when managing dependencies.

2. **Build Output**: 
   - Frontend builds to `client/dist`
   - Backend builds to `dist/index.js`
   - Vercel serves frontend
   - Render serves backend

3. **Development vs Production**: 
   - Dev: Frontend makes requests to `http://localhost:3000/api/trpc`
   - Prod: Frontend makes requests to Render backend URL

4. **Vite Configuration**: The frontend uses Vite with React. The build is optimized for production automatically.

5. **Node Version**: Ensure both Vercel and Render use the same Node.js version (check `.nvmrc` or `package.json` `engines` field).

---

For issues or questions, check the `STARTUP_GUIDE.md` and `AUTH_GUIDE.md` files for more context.
