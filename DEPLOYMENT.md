# Admin Dashboard Deployment Guide

## Quick Start (Remote Server)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd college-admin-dashboard
```

### 2. Create Environment File
Create a `.env` file with your backend API URL:

```bash
# For backend running on the same server
NEXT_PUBLIC_API_URL=http://localhost:8000

# OR for backend running on a different server/domain
NEXT_PUBLIC_API_URL=http://your-backend-server:8000

# OR for HTTPS production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 3. Build and Run with Docker
```bash
docker-compose up -d --build
```

The admin dashboard will be available at `http://your-server-ip:3000`

### 4. Check Logs
```bash
docker-compose logs -f frontend
```

---

## Configuration Details

### Environment Variables

#### Required
- `NEXT_PUBLIC_API_URL` - Your backend API URL (must be accessible from the browser)

#### Optional
- `NODE_ENV` - Set to `production` (default in docker-compose.yml)
- `NEXT_PUBLIC_GA_ID` - Google Analytics ID
- `NEXT_PUBLIC_ENABLE_ANALYTICS` - Enable/disable analytics
- `NEXT_PUBLIC_ENABLE_NOTIFICATIONS` - Enable/disable notifications

### Important Notes

1. **NEXT_PUBLIC_API_URL** must be accessible from the **user's browser**, not just from the Docker container
   - ✅ Use `http://your-server-ip:8000` or `https://api.yourdomain.com`
   - ❌ Don't use `http://localhost:8000` on remote servers (works only on local machine)

2. **Backend CORS**: Make sure your backend API allows requests from your frontend domain

3. **Port Exposure**: The frontend runs on port 3000 by default. Change in `docker-compose.yml` if needed:
   ```yaml
   ports:
     - "8080:3000"  # Expose on port 8080 instead
   ```

---

## Troubleshooting

### Network Error During Login

**Problem**: Getting network error when trying to log in

**Solution**: Check that `NEXT_PUBLIC_API_URL` in your `.env` file points to the correct backend API URL

```bash
# Check your current .env file
cat .env

# Test if the backend is accessible
curl http://your-backend-url:8000/health

# Rebuild with correct environment
docker-compose down
docker-compose up -d --build
```

### Cannot Connect to Backend

1. **Check backend is running**:
   ```bash
   curl http://localhost:8000/health
   ```

2. **Check CORS settings** in your backend to allow requests from your frontend domain

3. **Check firewall** - ensure port 8000 (or your backend port) is accessible

### Build Errors

If you encounter build errors related to npm packages:

1. Make sure `package-lock.json` doesn't contain internal corporate registry URLs
2. Delete `node_modules` and `package-lock.json` locally, run `npm install`, then commit
3. Rebuild Docker image: `docker-compose up -d --build`

---

## Production Checklist

- [ ] `.env` file created with correct `NEXT_PUBLIC_API_URL`
- [ ] Backend API is accessible from the network
- [ ] Backend CORS configured to allow frontend domain
- [ ] Firewall allows traffic on port 3000 (frontend)
- [ ] Firewall allows traffic on port 8000 (backend)
- [ ] SSL/HTTPS configured (recommended for production)
- [ ] Docker containers set to restart automatically (`restart: unless-stopped` in docker-compose.yml)

---

## Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f frontend

# Rebuild after code changes
docker-compose up -d --build

# Restart service
docker-compose restart frontend

# Check container status
docker-compose ps
```

---

## Architecture

```
User Browser
    ↓
Frontend (Next.js) :3000  ← You are here
    ↓ (API calls via NEXT_PUBLIC_API_URL)
Backend (FastAPI) :8000
    ↓
PostgreSQL :5432
```

The frontend makes API calls **from the user's browser** to the backend, so `NEXT_PUBLIC_API_URL` must be a URL that the user's browser can access.
