# Quick Vercel Deployment Reference

## Pre-Deployment Checklist

```bash
# 1. Ensure all changes are committed to git
git status
git add .
git commit -m "chore: prepare for Vercel deployment"
git push origin main

# 2. Verify builds work locally
npm run api:build
npm run ui:build

# 3. Test locally if needed
npm run api:dev  # Terminal 1
npm run ui:start # Terminal 2
```

## Deployment Steps

### Backend Deployment (One-time setup)

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - Root Directory: `./bizflow-api`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/?retryWrites=true
   DB_NAME=bizflow
   JWT_SECRET=<generate-random-secret>
   JWT_REFRESH_SECRET=<generate-random-secret>
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   NODE_ENV=production
   ```
6. Deploy
7. **Save backend URL**: `https://bizflow-api-xxxxx.vercel.app`

### Frontend Deployment (One-time setup)

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your GitHub repository (can be same or different)
4. Configure:
   - Root Directory: `./bizflow-ui`
   - Build Command: `npm run build`
   - Output Directory: `dist/bizflow-ui`
5. Add Environment Variables:
   ```
   ENVIRONMENT_API_URL=https://bizflow-api-xxxxx.vercel.app/api
   ```
   (Use the backend URL from previous step)
6. Deploy
7. **Save frontend URL**: `https://bizflow-ui-xxxxx.vercel.app`

### Update Backend CORS (if needed)

Go back to backend project → Settings → Environment Variables
Update:
```
CORS_ORIGIN=https://bizflow-ui-xxxxx.vercel.app
```

## Automatic Redeploy

Vercel automatically redeploys when you push to the main branch:

```bash
# Make changes locally
git add .
git commit -m "feature: your changes"
git push origin main

# Vercel automatically deploys both projects!
```

## Manual Redeploy

```bash
# Requires Vercel CLI installed: npm i -g vercel

# Redeploy backend
cd bizflow-api
vercel --prod

# Redeploy frontend  
cd ../bizflow-ui
vercel --prod
```

## View Logs

### Backend Logs
- Vercel Dashboard → bizflow-api → Deployments → Select deployment → Function Logs

### Frontend Logs
- Vercel Dashboard → bizflow-ui → Deployments → Select deployment
- Browser Console (F12)

## Monitor Deployments

- https://vercel.com/dashboard (main dashboard)
- Each project shows deployment history
- Click on deployment to see logs and analytics

## Environment Variables Quick Reference

### Backend (MONGODB_URI)

Generate connection string:
1. Go to https://cloud.mongodb.com/
2. Create cluster
3. Create user
4. Get connection string
5. Replace `<password>` with actual password

Example:
```
mongodb+srv://bizflow_user:SecurePassword123@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
```

### JWT Secrets

Generate random secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Output: `a1b2c3d4e5f6...` (copy this as JWT_SECRET)

## Troubleshooting

### Backend won't build
- Check `npm run build` works locally
- Verify all dependencies in package.json
- Check node version >= 18

### Frontend won't build
- Check `npm run build` works locally
- Verify Output Directory is `dist/bizflow-ui`
- Check Angular build succeeds locally

### API calls fail (403/CORS)
- Backend: Check CORS_ORIGIN matches frontend domain exactly
- Backend: Restart after changing environment variables
- Frontend: Check ENVIRONMENT_API_URL is set correctly

### API calls timeout (504)
- MongoDB: Check connection string is correct
- MongoDB: Whitelist `0.0.0.0/0` (or specific Vercel IPs)
- MongoDB: Check database is running

## Domains (Optional)

1. Purchase domain from registrar (Namecheap, GoDaddy, etc.)
2. Vercel Project → Settings → Domains
3. Add domain
4. Follow DNS setup instructions

Example:
- Backend: api.bizflow.com
- Frontend: app.bizflow.com

---

**For detailed instructions, see VERCEL_DEPLOYMENT.md**
