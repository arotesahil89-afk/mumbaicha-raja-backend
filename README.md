# Mumbai Cha Raja - Backend API

Complete Node.js + Express + PostgreSQL backend for Mumbai Cha Raja cultural organization.

## 🚀 Quick Start (3 Steps)

### Step 1: Setup Environment
```bash
cd mumbaicha-raja-backend
cp .env.example .env
# Edit .env and set DATABASE_URL and FRONTEND_URL
```

### Step 2: Install & Migrate
```bash
npm install
npx prisma migrate dev --name init
npm run seed
```

### Step 3: Start Server
```bash
npm run dev
```

✅ Server running on `http://localhost:5000`

---

## 📋 Prerequisites

- **Node.js** 18+ (download from https://nodejs.org)
- **PostgreSQL** 14+ 
  - Windows: https://www.postgresql.org/download/windows/
  - Mac: `brew install postgresql`
  - Linux: `apt-get install postgresql`

## 🗄️ Database Setup

### Option A: Local PostgreSQL (Recommended for Development)

**Windows:**
1. Download PostgreSQL installer from https://www.postgresql.org/download/windows/
2. During installation, set password for `postgres` user
3. Add PostgreSQL to PATH (installer does this)
4. Open terminal and test: `psql --version`

**Mac:**
```bash
brew install postgresql
brew services start postgresql
createuser -d postgres
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'password';"
```

### Option B: Remote PostgreSQL (Render.com - Production)

1. Go to https://render.com
2. Create PostgreSQL database
3. Copy connection string to `.env` as `DATABASE_URL`

## 📝 Environment Variables

Create `.env` file from `.env.example`:

```env
# Database (Local)
DATABASE_URL="postgresql://postgres:password@localhost:5432/mumbaicha_raja"

# Or Remote Database (Render)
DATABASE_URL="postgresql://user:password@host:5432/database"

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET="your-secret-key-here-min-32-characters"
JWT_EXPIRE="7d"

# Admin Credentials
INITIAL_ADMIN_EMAIL="admin@mumbaicharaja.com"
INITIAL_ADMIN_PASSWORD="ChangeMe123!"

# CORS
FRONTEND_URL="http://localhost:5173"
```

## 🗄️ Database Migrations

### Create new migration
```bash
npx prisma migrate dev --name add_new_table
```

### Run migrations in production
```bash
npx prisma migrate deploy
```

### Reset database (WARNING: deletes all data)
```bash
npx prisma migrate reset
```

## 🌱 Database Seeding

### Seed with sample data
```bash
npm run seed
```

This creates:
- Default admin user (email + password from `.env`)
- Sample awards (English, Hindi, Marathi)
- Sample events

### View database GUI
```bash
npm run studio
```

Opens http://localhost:5555 for database inspection

---

## 📡 API Endpoints

### Authentication (3 endpoints)

#### 1. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@mumbaicharaja.com",
  "password": "ChangeMe123!"
}

Response (200):
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "admin": {
      "id": "clg4xyzabc",
      "email": "admin@mumbaicharaja.com",
      "role": "admin"
    }
  }
}
```

#### 2. Verify Token
```http
GET /api/auth/verify
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "id": "clg4xyzabc",
    "email": "admin@mumbaicharaja.com",
    "role": "admin",
    "active": true
  }
}
```

#### 3. Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

### Awards (4 endpoints)

#### Get All Awards
```http
GET /api/awards

Response (200):
{
  "success": true,
  "data": {
    "heading": {
      "en": "Awards & Recognition",
      "hi": "पुरस्कार",
      "mr": "पुरस्कार"
    },
    "en": ["Award 1", "Award 2"],
    "hi": ["पुरस्कार 1"],
    "mr": ["पुरस्कार 1"]
  }
}
```

#### Create Award (Admin Only)
```http
POST /api/awards
Authorization: Bearer <token>
Content-Type: application/json

{
  "language": "en",
  "text": "Best Cultural Organization",
  "heading": "Awards & Recognition",
  "displayOrder": 1
}

Response (201):
{
  "success": true,
  "data": {
    "id": "clg4xyzabc",
    "language": "en",
    "text": "Best Cultural Organization",
    "heading": "Awards & Recognition",
    "displayOrder": 1,
    "createdAt": "2024-06-23T10:30:00Z",
    "updatedAt": "2024-06-23T10:30:00Z"
  }
}
```

#### Update Award (Admin Only)
```http
PUT /api/awards/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Updated Award Name",
  "displayOrder": 2
}

Response (200): [updated award object]
```

#### Delete Award (Admin Only)
```http
DELETE /api/awards/:id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "message": "Award deleted successfully"
  }
}
```

---

### Events (4 endpoints)

#### Get All Events
```http
GET /api/events

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "clg4xyzabc",
      "title": {
        "en": "Ganpati Visarjan",
        "hi": "गणपति विसर्जन",
        "mr": "गणपती विसर्जन"
      },
      "description": {
        "en": "Description...",
        "hi": "विवरण...",
        "mr": "वर्णन..."
      },
      "date": "2024-08-27T00:00:00Z",
      "time": "8:00 AM"
    }
  ]
}
```

#### Create Event (Admin Only)
```http
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "titleEn": "Ganpati Visarjan",
  "titleHi": "गणपति विसर्जन",
  "titleMr": "गणपती विसर्जन",
  "descriptionEn": "Traditional event description",
  "descriptionHi": "पारंपरिक कार्यक्रम विवरण",
  "descriptionMr": "परंपरागत कार्यक्रम वर्णन",
  "eventDate": "2024-08-27",
  "eventTime": "8:00 AM"
}

Response (201): [created event object]
```

#### Update Event (Admin Only)
```http
PUT /api/events/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "titleEn": "Updated Title",
  "eventTime": "9:00 AM"
}

Response (200): [updated event object]
```

#### Delete Event (Admin Only)
```http
DELETE /api/events/:id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "message": "Event deleted successfully"
  }
}
```

---

## 🧪 Testing with cURL

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mumbaicharaja.com",
    "password": "ChangeMe123!"
  }'
```

### Test Get Awards
```bash
curl http://localhost:5000/api/awards
```

### Test Create Award
```bash
curl -X POST http://localhost:5000/api/awards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "language": "en",
    "text": "New Award",
    "heading": "Awards"
  }'
```

---

## 📂 Project Structure

```
backend/
├── src/
│   ├── app.js                 # Express app setup
│   ├── config/                # Configuration files
│   ├── middleware/            # Express middleware
│   │   ├── authMiddleware.js
│   │   ├── validationMiddleware.js
│   │   └── errorHandler.js
│   ├── routes/                # API routes
│   │   ├── auth.js
│   │   ├── awards.js
│   │   └── events.js
│   ├── controllers/           # Request handlers
│   │   ├── authController.js
│   │   ├── awardsController.js
│   │   └── eventsController.js
│   ├── services/              # Business logic
│   │   ├── authService.js
│   │   ├── awardsService.js
│   │   └── eventsService.js
│   └── utils/                 # Helpers
│       ├── validationSchemas.js
│       └── helpers.js
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.js                # Seed script
├── .env.example               # Environment template
├── .env                       # Environment (local)
├── .gitignore
├── package.json
└── server.js                  # Entry point
```

---

## 🔒 Security Features

✅ **JWT Authentication** - Tokens expire after 7 days
✅ **Password Hashing** - bcryptjs with 10 salt rounds
✅ **CORS Protection** - Restrict to frontend URL only
✅ **Helmet Security Headers** - Prevent common attacks
✅ **Input Validation** - Joi schema validation
✅ **SQL Injection Prevention** - Prisma parameterized queries
✅ **Audit Logging** - Track all CRUD operations

---

## 🚀 Deployment

### Deploy to Render.com

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create PostgreSQL Database**
   - New → PostgreSQL
   - Free tier: 3 months
   - Copy connection string

3. **Deploy Backend**
   - New → Web Service
   - Connect your GitHub repo (arotesahil89-afk/nexbuild)
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma migrate deploy && npm run seed`
   - Start Command: `npm start`
   - Add environment variables:
     ```
     DATABASE_URL=<from PostgreSQL>
     JWT_SECRET=<generate random 32+ chars>
     FRONTEND_URL=https://yourdomain.com
     NODE_ENV=production
     ```

4. **Update Frontend**
   - Change API_URL to: `https://yourbackend.onrender.com`

---

## 🐛 Troubleshooting

### Port 5000 already in use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <pid> /F

# Mac/Linux
lsof -i :5000
kill -9 <pid>
```

### Database connection refused
```bash
# Check PostgreSQL is running
# Windows: Services → PostgreSQL
# Mac: brew services list
# Linux: sudo systemctl status postgresql
```

### Prisma migration failed
```bash
# Reset database (WARNING: deletes data)
npx prisma migrate reset

# Or check migration status
npx prisma migrate status
```

### Token verification failed
- Ensure JWT_SECRET matches in .env
- Token may have expired (7 days)
- Check Authorization header format: `Bearer <token>`

---

## 📚 Documentation Files

- `BACKEND_STRATEGY_FOR_YOUR_APP.md` - Architecture deep-dive
- `EXECUTION_PLAN_START_HERE.md` - Visual guide with examples
- `FIREBASE_TO_NODEJS_COMPLETE_MAPPING.md` - Migration details

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review `.env` configuration
3. Verify PostgreSQL is running
4. Check error logs in terminal

---

## 📄 License

Built for Mumbai Cha Raja Organization © 2024
