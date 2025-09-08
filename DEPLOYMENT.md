# CampusTrail Deployment Guide

This guide covers various options for hosting the CampusTrail website.

## Quick Start

1. **Fix Environment Variables**: Copy the production environment files and update them:
   ```bash
   cp backend/.env.production backend/.env
   cp frontend/.env.production frontend/.env
   # Edit both files with your actual values
   ```

2. **Choose a deployment platform** from the options below.

## Deployment Options

### 1. Railway (Recommended for Full-Stack)

Railway is great for full-stack applications with databases.

**Prerequisites:**
- Install Railway CLI: `npm install -g @railway/cli`
- Create account at [railway.app](https://railway.app)

**Deploy:**
```bash
# Login to Railway
railway login

# Create new project
railway new

# Deploy
./deploy/deploy.sh railway
```

**Setup:**
1. Add a PostgreSQL database in Railway dashboard
2. Set environment variables in Railway dashboard
3. Connect your GitHub repo for automatic deployments

### 2. Vercel (Good for Frontend + Serverless)

Vercel works well for the frontend and can handle the backend as serverless functions.

**Prerequisites:**
- Install Vercel CLI: `npm install -g vercel`
- Create account at [vercel.com](https://vercel.com)

**Deploy:**
```bash
# Login to Vercel
vercel login

# Deploy
./deploy/deploy.sh vercel
```

**Setup:**
1. Add environment variables in Vercel dashboard
2. For database, use Vercel Postgres or external database
3. Connect GitHub repo for automatic deployments

### 3. Netlify (Frontend Only)

Netlify is primarily for frontend hosting. Backend needs separate deployment.

**Prerequisites:**
- Install Netlify CLI: `npm install -g netlify-cli`
- Create account at [netlify.com](https://netlify.com)

**Deploy:**
```bash
# Login to Netlify
netlify login

# Deploy frontend only
./deploy/deploy.sh netlify
```

**Note:** You'll need to deploy the backend separately (e.g., on Railway, Render, or Heroku).

### 4. Docker (Self-Hosted)

Use Docker for self-hosted deployments on any cloud provider.

**Prerequisites:**
- Docker installed
- A server or cloud instance

**Deploy:**
```bash
# Build and run locally
./deploy/deploy.sh docker

# Or build and push to registry
docker build -t your-registry/campustrail:latest .
docker push your-registry/campustrail:latest
```

**Run:**
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL=your_database_url \
  -e JWT_SECRET=your_jwt_secret \
  campustrail:latest
```

## Environment Variables

### Backend (.env)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT tokens
- `PORT`: Server port (default: 4000)
- `CORS_ORIGIN`: Frontend domain for CORS
- Email configuration (optional)
- See `backend/.env.production` for full list

### Frontend (.env)
- `VITE_API_BASE`: Backend API URL
- See `frontend/.env.production` for full list

## Database Setup

### PostgreSQL (Production)
1. Create a PostgreSQL database
2. Update `DATABASE_URL` in backend environment
3. Run migrations: `cd backend && npx prisma migrate deploy`

### SQLite (Development)
The project uses SQLite by default for development.

## Health Checks

After deployment, verify:
- Frontend: `https://your-domain.com`
- Backend health: `https://your-api-domain.com/health`

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Ensure all dependencies are installed
   - Check Node.js version (recommended: 18+)

2. **Database Connection**
   - Verify `DATABASE_URL` format
   - Check database server accessibility
   - Run migrations if needed

3. **CORS Errors**
   - Update `CORS_ORIGIN` in backend env
   - Ensure frontend `VITE_API_BASE` is correct

4. **Environment Variables**
   - Check all required variables are set
   - Verify variable names (VITE_ prefix for frontend)

### Getting Help

1. Check application logs
2. Verify environment variables
3. Test database connectivity
4. Check health endpoints

## Monitoring

Consider adding:
- Error tracking (Sentry)
- Performance monitoring
- Uptime monitoring
- Log aggregation

## Security Checklist

- [ ] Use strong JWT secret
- [ ] Set up HTTPS
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Set up database backups
- [ ] Enable rate limiting
- [ ] Review and update dependencies

## Support

For deployment issues:
1. Check the logs
2. Verify configuration
3. Test locally first
4. Check platform-specific documentation