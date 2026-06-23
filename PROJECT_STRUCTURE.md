# 🗂️ Backend Project Structure & File Guide

## Complete Directory Tree

```
mumbaicha-raja-backend/
│
├── 📁 src/                          ← Main application code
│   ├── 📄 app.js                    ← Express app setup
│   │
│   ├── 📁 config/                   ← Configuration (future expansion)
│   │
│   ├── 📁 middleware/               ← Request interceptors
│   │   ├── 📄 authMiddleware.js     ← JWT verification
│   │   ├── 📄 validationMiddleware.js ← Input validation
│   │   └── 📄 errorHandler.js       ← Error responses
│   │
│   ├── 📁 routes/                   ← API endpoint definitions
│   │   ├── 📄 auth.js               ← /api/auth/* routes
│   │   ├── 📄 awards.js             ← /api/awards/* routes
│   │   └── 📄 events.js             ← /api/events/* routes
│   │
│   ├── 📁 controllers/              ← Request handlers
│   │   ├── 📄 authController.js     ← Login, verify, logout
│   │   ├── 📄 awardsController.js   ← Awards CRUD
│   │   └── 📄 eventsController.js   ← Events CRUD
│   │
│   ├── 📁 services/                 ← Business logic
│   │   ├── 📄 authService.js        ← Auth operations
│   │   ├── 📄 awardsService.js      ← Awards operations
│   │   └── 📄 eventsService.js      ← Events operations
│   │
│   └── 📁 utils/                    ← Helper functions
│       ├── 📄 validationSchemas.js  ← Joi validation rules
│       └── 📄 helpers.js            ← Token, password, format helpers
│
├── 📁 prisma/                       ← Database configuration
│   ├── 📄 schema.prisma             ← Database schema (4 tables)
│   └── 📄 seed.js                   ← Sample data insertion
│
├── 📄 server.js                     ← Server entry point
├── 📄 package.json                  ← Dependencies
├── 📄 .env                          ← Environment variables (local)
├── 📄 .env.example                  ← Environment template
├── 📄 .gitignore                    ← Git ignore rules
│
├── 📖 README.md                     ← Full API documentation
├── 📖 SETUP_GUIDE.md                ← Quick start guide
├── 📖 FRONTEND_INTEGRATION.md       ← Integration instructions
├── 📖 IMPLEMENTATION_CHECKLIST.md   ← Step-by-step checklist
└── 📖 PROJECT_STRUCTURE.md          ← This file

```

---

## 📊 Layers Architecture

```
REQUEST FROM FRONTEND
        ↓
┌─────────────────────────────────────────┐
│ Express Server (server.js)              │ ← Starts on port 5000
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│ Routes (routes/*.js)                    │ ← Defines endpoints
│ GET/POST/PUT/DELETE /api/awards         │
│ GET/POST/PUT/DELETE /api/events         │
│ POST /api/auth/login                    │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│ Middleware (middleware/*.js)            │ ← JWT auth, validation
│ authMiddleware → checks token           │
│ validationMiddleware → checks data      │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│ Controllers (controllers/*.js)          │ ← Handles HTTP requests
│ awardsController.getAll()               │
│ awardsController.create()               │
│ eventsController.delete()               │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│ Services (services/*.js)                │ ← Business logic
│ awardsService.getAll()                  │
│ awardsService.create(data)              │
│ eventsService.delete(id)                │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│ Prisma ORM (prisma/schema.prisma)       │ ← Database abstraction
│ @prisma/client                          │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│ PostgreSQL Database                     │ ← Stores data
│ - admins table                          │
│ - awards table                          │
│ - events table                          │
│ - audit_logs table                      │
└─────────────────────────────────────────┘
        ↓
RESPONSE TO FRONTEND
```

---

## 📄 File-by-File Breakdown

### Entry Point

#### `server.js` (22 lines)
**Purpose**: Start the Express server
**What it does**:
- Imports Express app
- Sets PORT from .env or 5000
- Listens on port
- Handles graceful shutdown

**When you need to change it**: Almost never
**Depends on**: `src/app.js`

---

### Express App Setup

#### `src/app.js` (51 lines)
**Purpose**: Configure Express with middleware
**What it does**:
- Setup CORS (allow frontend to call API)
- Setup Helmet (security headers)
- Setup body parser (JSON requests)
- Register routes (/api/auth, /api/awards, /api/events)
- Error handler

**When you need to change it**: Adding new routes or middleware
**Depends on**: All route files, middleware

---

### Middleware (Functions that intercept requests)

#### `src/middleware/authMiddleware.js` (32 lines)
**Purpose**: Verify JWT tokens
**Exports**:
- `authMiddleware` - Requires valid token
- `optionalAuth` - Token optional

**Used by**: All protected routes (POST/PUT/DELETE)
**On failure**: Returns 401 Unauthorized

#### `src/middleware/validationMiddleware.js` (21 lines)
**Purpose**: Validate request data
**What it does**: 
- Checks email format
- Checks password length
- Validates multilingual fields

**Used by**: All POST/PUT routes
**On failure**: Returns 400 Bad Request

#### `src/middleware/errorHandler.js` (38 lines)
**Purpose**: Catch and format errors
**Handles**:
- Database errors (P2002 - unique constraint)
- Not found errors (P2025)
- Generic errors

**Used by**: Global error handler at app.js level

---

### Routes (URL definitions)

#### `src/routes/auth.js` (32 lines)
**Routes defined**:
```
POST   /api/auth/login      → authController.login
GET    /api/auth/verify     → authController.verify (protected)
POST   /api/auth/logout     → authController.logout (protected)
```

**Middleware**: 
- Login: validation only
- Verify/Logout: auth required

#### `src/routes/awards.js` (42 lines)
**Routes defined**:
```
GET    /api/awards          → awardsController.getAll
GET    /api/awards/:id      → awardsController.getById
POST   /api/awards          → awardsController.create (protected)
PUT    /api/awards/:id      → awardsController.update (protected)
DELETE /api/awards/:id      → awardsController.delete (protected)
```

**Protected**: POST, PUT, DELETE require JWT token

#### `src/routes/events.js` (42 lines)
**Routes defined**: Same as awards but for events
```
GET    /api/events
POST   /api/events          (protected)
PUT    /api/events/:id      (protected)
DELETE /api/events/:id      (protected)
```

---

### Controllers (Handle HTTP requests/responses)

#### `src/controllers/authController.js` (54 lines)
**Functions**:
- `login(email, password)` → Returns JWT token
- `verify(token)` → Validates token
- `logout()` → Clears token
- `changePassword(adminId, old, new)` → Updates password

**What happens**: 
1. Receives request
2. Calls service layer
3. Sends JSON response
4. On error: passes to error handler

#### `src/controllers/awardsController.js` (60 lines)
**Functions**:
- `getAll()` → Get all awards
- `getById(id)` → Get one award
- `create(data)` → Create award
- `update(id, data)` → Update award
- `delete(id)` → Delete award

**Pattern**: Request → Service → Response

#### `src/controllers/eventsController.js` (60 lines)
**Functions**: Same as awards but for events

---

### Services (Business logic)

#### `src/services/authService.js` (65 lines)
**Functions**:
- `login(email, password)` 
  - Finds admin by email
  - Compares password with bcrypt
  - Generates JWT token
  - Returns token + admin info

- `verify(adminId)`
  - Checks if admin exists
  - Checks if active

- `logout()`
  - Just returns success message

- `changePassword(adminId, old, new)`
  - Verifies old password correct
  - Hashes new password
  - Updates database

#### `src/services/awardsService.js` (108 lines)
**Functions**:
- `getAll()` 
  - Queries database
  - Groups by language
  - Returns formatted response

- `getById(id)`
  - Find single award

- `create(data)`
  - Insert into database
  - Create audit log entry

- `update(id, data)`
  - Modify award
  - Create audit log

- `delete(id)`
  - Remove from database
  - Create audit log

#### `src/services/eventsService.js` (108 lines)
**Functions**: Same as awards but for events

**Pattern**: All functions handle database + logging

---

### Utilities (Helper functions)

#### `src/utils/validationSchemas.js` (56 lines)
**Exports**: Joi validation schemas
- `loginSchema` - email + password
- `createAwardSchema` - language, text, heading
- `updateAwardSchema` - optional fields
- `createEventSchema` - all language fields
- `updateEventSchema` - optional fields

**Used by**: validationMiddleware in routes

#### `src/utils/helpers.js` (56 lines)
**Functions**:
- `generateToken(adminId)` - Create JWT
- `hashPassword(password)` - bcrypt hash
- `comparePassword(raw, hashed)` - Verify password
- `groupAwardsByLanguage(awards)` - Format awards response
- `groupEventsByLanguage(events)` - Format events response

**Used by**: Services

---

### Database

#### `prisma/schema.prisma` (56 lines)
**Defines 4 tables**:

1. **Admin**
   - id, email (unique), password, role, active, timestamps

2. **Award**
   - id, language, text, heading, displayOrder, timestamps

3. **Event**
   - id, titleEn/Hi/Mr, descriptionEn/Hi/Mr, eventDate, eventTime

4. **AuditLog**
   - id, action (CREATE/UPDATE/DELETE), entity, entityId, changes (JSON), adminId

**Relationships**: None (simple flat structure for speed)

#### `prisma/seed.js` (61 lines)
**Does**:
- Clear existing data
- Create admin user
- Insert sample awards (3 languages)
- Insert sample events

**Run**: `npm run seed`

---

### Configuration Files

#### `.env` (10 lines)
**Your local secrets**:
```env
DATABASE_URL="postgresql://..."    ← Database connection
PORT=5000                          ← Server port
JWT_SECRET="..."                   ← Token signing key
INITIAL_ADMIN_EMAIL="..."          ← Seed admin
INITIAL_ADMIN_PASSWORD="..."       ← Seed password
FRONTEND_URL="..."                 ← CORS allowed origin
```

#### `.env.example` (10 lines)
**Template** - commit this, not `.env`
Shows what variables are needed

#### `package.json` (30 lines)
**Dependencies**:
- express (web framework)
- dotenv (environment)
- cors (cross-origin)
- helmet (security)
- joi (validation)
- bcryptjs (password hashing)
- jsonwebtoken (JWT)
- @prisma/client (ORM)

**Scripts**:
- `npm start` - Production
- `npm run dev` - Development with nodemon
- `npm run migrate` - Create migrations
- `npm run seed` - Insert sample data
- `npm run studio` - GUI database editor

---

## 🔄 Request Flow Example: Create Award

```
Frontend: POST /api/awards
├─ Headers: Authorization: Bearer <token>
├─ Body: { language: "en", text: "...", heading: "..." }
  │
  └─→ routes/awards.js
      ├─ POST /awards endpoint defined
      ├─ authMiddleware → check token
      ├─ validationMiddleware → check data
      │
      └─→ controllers/awardsController.js
          ├─ create() function called
          │
          └─→ services/awardsService.js
              ├─ create() function called
              │
              └─→ prisma/schema.prisma
                  ├─ INSERT INTO awards
                  ├─ CREATE audit_log entry
                  │
                  └─→ PostgreSQL Database
                      ├─ Data stored
                      ├─ Return created record
                      │
                      └─→ Back through layers
                          ├─ awardsService returns record
                          ├─ awardsController formats response
                          ├─ Express sends JSON
                          │
                          └─→ Frontend receives 201 + data
```

---

## 🔐 Security Journey

```
Request arrives with token
    ↓
authMiddleware
├─ Extract token from header
├─ Verify JWT signature
├─ Check expiration
└─ Attach admin info to request
    ↓
validationMiddleware
├─ Check email format
├─ Check password length
├─ Check required fields
└─ Sanitize input
    ↓
Service layer
├─ bcrypt.compare() password
├─ Prisma parameterized queries (SQL injection safe)
└─ Audit log sensitive operations
    ↓
Database
├─ PostgreSQL handles constraints
└─ Unique indexes prevent duplicates
    ↓
Response
├─ Never send password
├─ Only send needed fields
└─ Helmet sets security headers
```

---

## 📈 Data Flow

### Create Operation
```
POST /api/awards
{language: "en", text: "...", heading: "..."}
    ↓
INSERT INTO awards VALUES (...)
    ↓
INSERT INTO audit_logs VALUES (
  action: 'CREATE',
  entity: 'award',
  changes: {...},
  admin_id: ...
)
    ↓
Return award object
```

### Get Operation
```
GET /api/awards
    ↓
SELECT * FROM awards ORDER BY display_order
    ↓
Group by language in helpers.js
    ↓
Return:
{
  heading: {en: "...", hi: "...", mr: "..."},
  en: [...],
  hi: [...],
  mr: [...]
}
```

### Update Operation
```
PUT /api/awards/:id
{text: "updated..."}
    ↓
UPDATE awards SET text = '...' WHERE id = ...
    ↓
INSERT INTO audit_logs VALUES (
  action: 'UPDATE',
  changes: {before: {...}, after: {...}},
  ...
)
    ↓
Return updated award
```

### Delete Operation
```
DELETE /api/awards/:id
    ↓
DELETE FROM awards WHERE id = ...
    ↓
INSERT INTO audit_logs VALUES (
  action: 'DELETE',
  entity_id: id,
  changes: {...}
)
    ↓
Return success message
```

---

## 🚀 Deployment Flow

```
GitHub (nexbuild repo)
    ↓
    ├─ Push code
    │   └─ CI/CD triggers
    │
    └─ Render.com
        ├─ Clone repo
        ├─ Run: npm install
        ├─ Run: npx prisma migrate deploy
        ├─ Run: npm run seed
        ├─ Run: npm start
        │
        └─ Backend live on https://...onrender.com
            ├─ Connected to Render PostgreSQL
            ├─ All 11 endpoints working
            ├─ Audit logs recording
            │
            └─ Frontend calls:
                https://...onrender.com/api/...
```

---

## 🔧 Maintenance

### Daily
- Monitor error logs in Render

### Weekly
- Test all endpoints
- Check database size

### Monthly
- Backup database
- Review audit logs
- Update dependencies

### Quarterly
- Security audit
- Performance review
- Cost optimization

---

## 📞 Quick Reference

| Task | File | Function |
|------|------|----------|
| Add new API endpoint | routes/**.js | Create new route |
| Add validation | utils/validationSchemas.js | Add new schema |
| Change database field | prisma/schema.prisma | Add field |
| Add business logic | services/**.js | Add method |
| Fix bug in response | controllers/**.js | Fix method |
| Change password rules | utils/helpers.js | Modify function |
| Change CORS origin | .env | Update FRONTEND_URL |

---

## ✅ When Everything Works

1. ✅ Backend runs: `npm run dev`
2. ✅ Database responds: `npm run studio`
3. ✅ API works: `curl http://localhost:5000/api/health`
4. ✅ Token issued: `POST /api/auth/login`
5. ✅ Frontend integrates
6. ✅ Production deploys
7. ✅ Data flows both ways

You now have a **production-ready backend**!
