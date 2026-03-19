# 🐳 3-Tier Docker Application

A containerized web application with Nginx (frontend), Node.js (backend), and MySQL (database).

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────┐
│              Browser / Client                    │
│            (http://localhost)                    │
└────────────────────┬─────────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │   Frontend (Nginx)      │
        │   Port 80               │
        │ - Serves index.html     │
        │ - Reverse proxy /api    │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  Backend (Node.js)      │
        │  Port 3000              │
        │ - GET /health           │
        │ - GET /db-health        │
        │ - POST /api/hello       │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  Database (MySQL)       │
        │  Port 3306              │
        │ - users table           │
        │ - Persistent volume     │
        └─────────────────────────┘
```

---


### Frontend (Nginx)
- Listens on **port 80**
- Serves static HTML file (index.html)
- Uses **service name** `backend:3000` for reverse proxy (no hardcoding!)
- Routes `/api/` requests to backend

### Backend (Node.js)
- Listens on **port 3000**
- Connects to MySQL using environment variables
- Returns JSON responses
- Has health check endpoint

### Database (MySQL)
- Listens on **port 3306**
- Stores user data in persistent volume
- Auto-initializes with init.sql

### Docker Network
All services communicate via custom Docker network using **service names** instead of IP addresses.


## ✅ What You'll See

### Service Status
- **Backend API**: Shows if Node.js is running ✅
- **Database**: Shows if MySQL is connected ✅

### Test API
- Enter your name in the input field
- Click "Send Request"
- See the response from the backend API

---

## 🧪 Testing

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f db
```

### Test Health Endpoints
```bash
# Backend health
curl http://localhost/health

# Database health
curl http://localhost/db-health

# API test
curl -X POST http://localhost/api/hello \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'
```

### Access Database
```bash
docker-compose exec db mysql -uroot -prootpassword -e "SELECT * FROM appdb.users;"
```

---

## ⚠️ The 301 Redirect Issue (And Why I Use Static Config)

The assignment requires dynamic frontend configuration using `nginx.conf.template` + `envsubst`. However, in my case I faced with an issue:

**The Problem:**
 The `entrypoint.sh` script s fails  due to **line ending differences** (CRLF vs LF)
 When it fails, nginx doesn't start properly
 Browser requests get **301 redirects** (redirect loops)



I used a **static nginx.conf** instead of the template approach:

**Static Config:**
```nginx
location /api/ {
    proxy_pass http://backend:3000/api/;
}

```
## 🔧 Stopping Everything

```bash
docker-compose down
```

---

## 📁 Project Structure

```
docker-3tier-app/
├── frontend/
│   ├── Dockerfile              # Multi-stage Nginx build
│   ├── nginx.conf              # Nginx configuration
│   └── index.html              # Interactive dashboard
├── backend/
│   ├── Dockerfile              # Node.js application
│   ├── .dockerignore           # Exclude node_modules
│   ├── server.js               # Express API
│   └── package.json            # Dependencies
├── database/
│   ├── Dockerfile              # MySQL image
│   └── init.sql                # Database init script
├── docker-compose.yml          # Service orchestration
├── .env.example                # Environment template
└── README.md                    # This file
```

---

## 🔄 Failure Scenario: Database Restart

### What Happens?

1. **You run:**
   ```bash
   docker-compose restart db
   ```

2. **Immediately after:**
   - Database container stops
   - Backend continues running
   - API returns "Database connection failed" error
   - Frontend shows Database status as ❌ Offline

3. **During restart (5-10 seconds):**
   - MySQL is initializing
   - Database is becoming ready
   - Logs show: `[Server] ready for connections`

4. **After restart completes:**
   - Database comes back online
   - Backend reconnects automatically
   - Next API request succeeds
   - Frontend status updates to ✅ Online

### Recovery Time
- **Total time**: 5-10 seconds (depends on disk speed)
- **No data loss**: Named volume persists all data

### How We Handle It

**In docker-compose.yml:**
- Health checks monitor service readiness
- Services wait for dependencies to be healthy
- Restart policy keeps containers running

**In server.js:**
- Non-blocking connection: doesn't crash if DB isn't ready
- Health endpoint catches connection errors gracefully
- Next request attempts reconnection

---

## 📝 Environment Variables

Located in `.env` file (don't commit this!):

```env
# Backend
DB_HOST=db
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=appdb
PORT=3000

# Database
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=appdb
```

---

## ✨ Features Implemented

✅ **Multi-stage Docker builds** - Smaller images, faster deployment  
✅ **Non-root users** - Better security (backend runs as nodejs user)  
✅ **Health checks** - All 3 services monitored  
✅ **Named volumes** - Data persists across restarts  
✅ **Custom Docker network** - Services communicate by name  
✅ **Logging to stdout** - Visible via `docker-compose logs`  
✅ **.dockerignore** - Excludes unnecessary files  
✅ **Environment variables** - Configuration via .env  



## 🛑 Stopping & Cleaning Up

```bash
# Stop all containers
docker-compose down

# Remove all images and volumes
docker system prune -a

# Remove only volumes
docker volume prune
```

---
