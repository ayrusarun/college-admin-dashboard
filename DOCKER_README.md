# College Admin Dashboard - Docker Setup

This is the frontend admin dashboard built with Next.js 16 and React 19.

## 🚀 Quick Start

### Prerequisites
- Docker (20.10+)
- Docker Compose (2.0+)

### Start the Dashboard

```bash
# From this directory (college-admin-dashboard)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

The dashboard will be available at: **http://localhost:3000**

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in this directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=production
```

Or set them in `docker-compose.yml`:

```yaml
environment:
  NEXT_PUBLIC_API_URL: http://your-backend-url:8000
```

### Change Port

Edit `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Change 3001 to your desired port
```

## 🛠️ Development Commands

```bash
# Build image
docker-compose build

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Stop and remove containers
docker-compose down

# Rebuild and start
docker-compose up -d --build

# Execute command in container
docker-compose exec frontend sh
```

## 🔗 Connect to Backend

The dashboard needs to connect to the backend API. Set the API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Main README](../README.md)
- [Backend Setup](../college-community-api/README.md)
