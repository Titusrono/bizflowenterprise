# BizFlow Enterprise - Vercel Deployment Guide

This guide explains how to deploy BizFlow Enterprise (both backend API and frontend) to Vercel separately.

## Project Structure

```
bizflow-enterprise (monorepo)
├── bizflow-api/        # NestJS backend
├── bizflow-ui/         # Angular frontend
├── package.json        # Root workspace config
└── pnpm-workspace.yaml # PNPM workspace definition
```

## Prerequisites

1. **Vercel Account**: Create one at [vercel.com](https://vercel.com)
2. **GitHub Account**: Both projects must be on GitHub
3. **MongoDB Atlas**: Cloud database (for backend)
4. **Node.js 18+**: Required for builds
5. **Vercel CLI** (optional): `npm i -g vercel`

---

## Part 1: Deploy Backend API (bizflow-api)

### Step 1: Connect Backend Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..." → "Project"**
3. Select your GitHub repository
4. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./bizflow-api`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --legacy-peer-deps`

### Step 2: Set Environment Variables for Backend

In the **Environment Variables** section, add:

```
MONGODB_URI = mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME = bizflow
JWT_SECRET = (generate a strong random secret)
JWT_REFRESH_SECRET = (generate a strong random secret)
JWT_EXPIRATION = 24h
JWT_REFRESH_EXPIRATION = 7d
CORS_ORIGIN = https://your-frontend-domain.vercel.app
NODE_ENV = production
```

**How to generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Configure vercel.json

The backend already has a `vercel.json` at `bizflow-api/vercel.json`:

```json
{
  "version": 2,
  "name": "bizflow-api",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "builds": [
    {
      "src": "dist/main.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/main.js"
    }
  ]
}
```

### Step 4: Deploy Backend

1. Click **"Deploy"** on Vercel
2. Wait for build to complete (~5-10 minutes)
3. Note the deployment URL: `https://bizflow-api-xxxxx.vercel.app`

**Backend API is now live at**: `https://bizflow-api-xxxxx.vercel.app/api`

---

## Part 2: Deploy Frontend UI (bizflow-ui)

### Step 1: Connect Frontend Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..." → "Project"**
3. Select your GitHub repository (same or different)
4. Configure project:
   - **Framework Preset**: Angular
   - **Root Directory**: `./bizflow-ui`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/bizflow-ui`
   - **Install Command**: `npm install --legacy-peer-deps`

### Step 2: Set Environment Variables for Frontend

In the **Environment Variables** section, add:

```
ENVIRONMENT_API_URL = https://bizflow-api-xxxxx.vercel.app/api
```

Replace `bizflow-api-xxxxx.vercel.app` with your actual backend domain from Part 1.

### Step 3: Configure vercel.json

The frontend already has a `vercel.json` at `bizflow-ui/vercel.json`:

```json
{
  "version": 2,
  "name": "bizflow-ui",
  "buildCommand": "npm run build",
  "outputDirectory": "dist/bizflow-ui",
  "builds": [
    {
      "src": "dist/bizflow-ui",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/bizflow-ui/index.html"
    }
  ]
}
```

### Step 4: Deploy Frontend

1. Click **"Deploy"** on Vercel
2. Wait for build to complete (~5-10 minutes)
3. Note the deployment URL: `https://bizflow-ui-xxxxx.vercel.app`

**Frontend is now live at**: `https://bizflow-ui-xxxxx.vercel.app`

---

## Part 3: Configure CORS and API Connection

### Update Backend CORS

In the backend `bizflow-api/src/main.ts`, ensure CORS is configured:

```typescript
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:4200';

app.enableCors({
  origin: corsOrigin.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### Update Frontend API URL

The frontend environment file (`bizflow-ui/src/environments/environment.prod.ts`) is already configured to read from the environment variable.

---

## Part 4: Database Setup (MongoDB Atlas)

### Create MongoDB Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Get connection string: `mongodb+srv://<user>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority`
5. Whitelist Vercel IPs or use `0.0.0.0/0` (less secure but works for development)

### Initialize Database

Option 1: Using Vercel UI
```bash
# Via Vercel function or script
npm run db:seed
```

Option 2: Manual setup
- Connect to MongoDB Atlas
- Create database named `bizflow`
- Run seed scripts manually if needed

---

## Part 5: Custom Domains (Optional)

### Add Custom Domain to Frontend

1. In Vercel Dashboard → Frontend Project → Settings → Domains
2. Add your domain (e.g., `app.bizflow.com`)
3. Follow DNS instructions

### Add Custom Domain to Backend

1. In Vercel Dashboard → Backend Project → Settings → Domains
2. Add your domain (e.g., `api.bizflow.com`)
3. Follow DNS instructions

---

## Deployment Checklist

- [ ] Backend repository connected to Vercel
- [ ] Backend environment variables set (MongoDB URI, JWT secrets, CORS_ORIGIN)
- [ ] Backend deployed successfully
- [ ] Backend API accessible at `https://bizflow-api-xxxxx.vercel.app/api`
- [ ] Frontend repository connected to Vercel
- [ ] Frontend ENVIRONMENT_API_URL set to backend URL
- [ ] Frontend deployed successfully
- [ ] Frontend accessible at `https://bizflow-ui-xxxxx.vercel.app`
- [ ] CORS configured in backend
- [ ] Frontend can successfully call backend API
- [ ] Authentication flow working (login/register)
- [ ] Branch switching working
- [ ] Database seeded with initial data

---

## Troubleshooting

### Backend Build Fails

**Error**: `Cannot find module 'nest'`
- **Solution**: Add `npm install --legacy-peer-deps` as Install Command

**Error**: `MONGODB_URI is not set`
- **Solution**: Add MONGODB_URI to Vercel Environment Variables

### Frontend Build Fails

**Error**: `dist/bizflow-ui directory not found`
- **Solution**: Ensure Output Directory is set to `dist/bizflow-ui` (not `dist`)

**Error**: `Cannot connect to API`
- **Solution**: 
  1. Verify ENVIRONMENT_API_URL is set correctly
  2. Check backend CORS_ORIGIN includes frontend domain
  3. Check browser console for actual error

### API Timeouts

**Error**: `504 Gateway Timeout`
- **Cause**: MongoDB connection slow or credentials wrong
- **Solution**: 
  1. Check MongoDB Atlas connection string
  2. Verify whitelist IPs (use `0.0.0.0/0` for testing)
  3. Test MongoDB connection locally first

### CORS Errors

**Error**: `Access to XMLHttpRequest blocked by CORS`
- **Solution**:
  1. Verify `CORS_ORIGIN` in backend matches frontend domain
  2. Check that `credentials: true` is set in backend CORS config
  3. Verify Authorization header is included in requests

---

## Environment Variables Reference

### Backend (bizflow-api)

| Variable | Example | Required | Notes |
|----------|---------|----------|-------|
| MONGODB_URI | `mongodb+srv://...` | ✓ | MongoDB Atlas connection string |
| DB_NAME | `bizflow` | ✓ | Database name |
| JWT_SECRET | `hex string (32 bytes)` | ✓ | Access token secret |
| JWT_REFRESH_SECRET | `hex string (32 bytes)` | ✓ | Refresh token secret |
| JWT_EXPIRATION | `24h` | ✗ | Token validity duration |
| JWT_REFRESH_EXPIRATION | `7d` | ✗ | Refresh token validity |
| CORS_ORIGIN | `https://bizflow-ui-xxxxx.vercel.app` | ✓ | Frontend domain |
| NODE_ENV | `production` | ✓ | Environment mode |
| PORT | `3000` | ✗ | (Set automatically by Vercel) |

### Frontend (bizflow-ui)

| Variable | Example | Required | Notes |
|----------|---------|----------|-------|
| ENVIRONMENT_API_URL | `https://bizflow-api-xxxxx.vercel.app/api` | ✓ | Backend API URL |

---

## Post-Deployment

### Monitor Deployments

1. **Vercel Analytics**: Check performance metrics in Vercel Dashboard
2. **Error Logging**: Monitor frontend errors via browser DevTools
3. **API Logs**: Check backend logs in Vercel Function Logs

### Redeploy Process

**Automatic**: Push to GitHub → Vercel auto-deploys
**Manual**: 
```bash
vercel --prod
```

### Rollback to Previous Version

In Vercel Dashboard → Project → Deployments → Select previous version → Redeploy

---

## Security Best Practices

1. ✓ Use strong, random JWT secrets (32+ characters)
2. ✓ Enable MongoDB IP Whitelist (or use `0.0.0.0/0` temporarily)
3. ✓ Keep CORS_ORIGIN specific to your frontend domain
4. ✓ Enable HTTPS (Vercel default)
5. ✓ Rotate JWT secrets periodically
6. ✓ Use environment variables for all secrets (never hardcode)
7. ✓ Enable MFA on Vercel and GitHub accounts

---

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [NestJS Deployment](https://docs.nestjs.com/deployment)
- [Angular Deployment](https://angular.io/guide/deployment)
- [MongoDB Atlas](https://docs.atlas.mongodb.com/)

---

**Last Updated**: June 1, 2026
**Version**: 1.0.0
