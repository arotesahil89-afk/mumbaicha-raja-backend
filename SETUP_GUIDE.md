# SETUP GUIDE: Getting Backend Running in 10 Minutes

## ⚡ Quick Setup

### 1. Open Terminal
```bash
cd c:\Users\Sahil Arote\Desktop\Hosting\mumbaicha-raja-backend
```

### 2. Install Dependencies
```bash
npm install
```
**Takes 2-3 minutes. Coffee ☕ break recommended.**

### 3. Setup Database

#### Windows Users:
1. Download PostgreSQL: https://www.postgresql.org/download/windows/
2. Run installer, set password for `postgres` user (e.g., "password")
3. Select PostgreSQL to run as service (port 5432)
4. After installation, restart your computer

#### Mac Users:
```bash
brew install postgresql
brew services start postgresql
createuser -d postgres
```

#### Linux Users:
```bash
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'password';"
```

### 4. Update `.env` with Your Database Password
If you used "password123" during PostgreSQL setup, change this line:
```env
DATABASE_URL="postgresql://postgres:password123@localhost:5432/mumbaicha_raja"
```

### 5. Create Database & Run Migrations
```bash
npx prisma migrate dev --name init
```
**This creates tables and asks if you want to generate Prisma Client. Say YES.**

### 6. Seed Database
```bash
npm run seed
```
**You'll see:**
```
✅ Database seed completed successfully!

📋 Initial Admin Credentials:
   Email: admin@mumbaicharaja.com
   Password: ChangeMe123!

⚠️  IMPORTANT: Change this password after first login!
```

### 7. Start Server
```bash
npm run dev
```

**✅ You should see:**
```
🚀 Server running on http://localhost:5000
📧 Admin Login: POST 5000/api/auth/login
🏆 Awards API: GET/POST/PUT/DELETE 5000/api/awards
📅 Events API: GET/POST/PUT/DELETE 5000/api/events
```

---

## ✅ Verify It Works

### Test Login in New Terminal Window:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"admin@mumbaicharaja.com\",
    \"password\": \"ChangeMe123!\"
  }"
```

**Expected Response (you'll get a token):**
```json
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

### Test Awards API:
```bash
curl http://localhost:5000/api/awards
```

**You should get sample awards in 3 languages.**

---

## 🗄️ View Database Visually

Open a new terminal and run:
```bash
npm run studio
```

This opens http://localhost:5555 where you can:
- View all tables (admins, awards, events, audit_logs)
- Add/edit/delete records
- See all data

---

## 🎯 Next Steps: Connect Frontend

Once backend is running (http://localhost:5000):

1. Go to **frontend project folder**
2. Create `src/services/apiService.js` with:
```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

3. Update `AdminLogin.jsx`:
```javascript
import apiClient from '../../services/apiService';

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('authToken', response.data.data.token);
    window.location.href = '/admin';
  } catch (err) {
    setError('Login failed: ' + err.message);
  }
};
```

4. Update `AdminRoute.jsx`:
```javascript
import apiClient from '../../services/apiService';

useEffect(() => {
  const checkAuth = async () => {
    try {
      await apiClient.get('/auth/verify');
      setIsAdmin(true);
    } catch (err) {
      navigate('/admin-login');
    }
  };
  checkAuth();
}, []);
```

---

## 🚨 Common Issues

### "Port 5000 already in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <number> /F

# Mac/Linux
lsof -i :5000
kill -9 <pid>
```

### "connect ECONNREFUSED - PostgreSQL not running"
**Windows:**
- Go to Services (Win+R → services.msc)
- Look for "postgresql-x64"
- Right-click → Start

**Mac:**
```bash
brew services start postgresql
```

**Linux:**
```bash
sudo systemctl start postgresql
```

### "database does not exist"
```bash
npx prisma migrate dev --name init
```

### "Invalid environment variables"
- Copy `.env.example` to `.env`
- Update DATABASE_URL with your password
- Make sure no extra quotes or spaces

---

## 📝 File Structure

```
mumbaicha-raja-backend/
├── src/
│   ├── app.js              ← Main Express app
│   ├── middleware/         ← Auth, validation, error handling
│   ├── routes/             ← API endpoints
│   ├── controllers/        ← Request handlers
│   ├── services/           ← Business logic
│   └── utils/              ← Helpers, schemas
├── prisma/
│   ├── schema.prisma       ← Database design
│   └── seed.js             ← Sample data
├── server.js               ← Start here
├── package.json            ← Dependencies
├── .env                    ← Your passwords (DON'T COMMIT)
└── README.md               ← Full documentation
```

---

## 🎬 Running Development Mode

**Terminal 1 - Start Backend:**
```bash
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

**Terminal 3 - View Database GUI (optional):**
```bash
npm run studio
```

Now you have:
- ✅ Backend running on http://localhost:5000
- ✅ Frontend running on http://localhost:5173
- ✅ Database GUI on http://localhost:5555

---

## 🎉 Success!

You now have a complete production-ready backend. When ready to deploy:

1. Push to GitHub
2. Create Render.com account
3. Follow deployment section in README.md
4. Backend will auto-deploy on every push

**Time to production: 30 minutes** 🚀
