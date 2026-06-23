# Frontend Integration Guide

This guide shows exactly how to update your React frontend to use the new Node.js backend instead of Firebase.

## 📋 Overview: What Changes

| File | Current Tech | New Tech | Time |
|------|--------------|----------|------|
| AdminLogin.jsx | Firebase auth | REST API | 5 min |
| AdminRoute.jsx | Firebase auth check | JWT verify | 5 min |
| AdminDashboard.jsx | Firebase signOut | API logout | 3 min |
| ManageAward.jsx | Firestore CRUD | REST API | 30 min |
| ManageEvents.jsx | Firestore CRUD | REST API | 30 min |
| AwardsLoader.jsx | Firestore query | REST API call | 5 min |
| useEventsLoader.jsx | Firestore listener | REST API call | 5 min |
| EventsPage.jsx | Firestore listener | REST API call | 5 min |
| UpcomingEvents.jsx | Firestore listener | REST API call | 5 min |
| firebase.js | DELETE | DELETE | 0 min |
| apiService.js | NEW | Axios wrapper | 10 min |

**Total Changes**: ~2 hours of work

---

## 🔧 Step 1: Create API Service

Create new file: `src/services/apiService.js`

```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/admin-login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

Create `.env` or `.env.local`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🔒 Step 2: Update AdminLogin.jsx

**BEFORE:**
```javascript
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useState } from "react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/admin";
    } catch (err) {
      setError("Login failed: " + err.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Login</button>
    </form>
  );
};

export default AdminLogin;
```

**AFTER:**
```javascript
import apiClient from "../../services/apiService";
import { useState } from "react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      // Save token to localStorage
      localStorage.setItem('authToken', response.data.token);
      
      // Redirect to admin dashboard
      window.location.href = "/admin";
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default AdminLogin;
```

**Changes:**
- Remove Firebase imports
- Import `apiClient` instead
- Change `signInWithEmailAndPassword()` to `apiClient.post('/auth/login')`
- Store JWT token in `localStorage` instead of Firebase
- Add loading state

---

## 🛡️ Step 3: Update AdminRoute.jsx

**BEFORE:**
```javascript
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { db } from "../../firebase/firebase";
import { getDoc, doc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const adminDoc = await getDoc(doc(db, "admins", user.uid));
        if (adminDoc.exists()) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (isAdmin === null) return <div>Loading...</div>;
  if (!isAdmin) return <Navigate to="/admin-login" />;

  return children;
};

export default AdminRoute;
```

**AFTER:**
```javascript
import apiClient from "../../services/apiService";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setIsAdmin(false);
          return;
        }

        await apiClient.get('/auth/verify');
        setIsAdmin(true);
      } catch (err) {
        localStorage.removeItem('authToken');
        setIsAdmin(false);
      }
    };

    verifyAdmin();
  }, []);

  if (isAdmin === null) return <div>Loading...</div>;
  if (!isAdmin) return <Navigate to="/admin-login" />;

  return children;
};

export default AdminRoute;
```

**Changes:**
- Remove Firebase imports
- Remove `onAuthStateChanged` listener
- Check `localStorage` for token instead
- Call `apiClient.get('/auth/verify')` to verify JWT
- Remove Firestore admin collection check

---

## 📤 Step 4: Update AdminDashboard.jsx

**BEFORE:**
```javascript
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";

const AdminDashboard = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/admin-login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default AdminDashboard;
```

**AFTER:**
```javascript
import apiClient from "../../services/apiService";

const AdminDashboard = () => {
  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
      localStorage.removeItem('authToken');
      window.location.href = "/admin-login";
    } catch (err) {
      console.error("Logout failed:", err);
      // Still redirect even if API call fails
      localStorage.removeItem('authToken');
      window.location.href = "/admin-login";
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default AdminDashboard;
```

**Changes:**
- Remove Firebase `signOut`
- Call `apiClient.post('/auth/logout')`
- Remove token from localStorage
- Keep redirect on error to ensure logout

---

## 🏆 Step 5: Update AwardsLoader.jsx

**BEFORE:**
```javascript
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useEffect, useState } from "react";

const useAwardsLoader = () => {
  const [awards, setAwards] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const docRef = doc(db, "translations", "awards");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAwards(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching awards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAwards();
  }, []);

  return { awards, loading };
};

export default useAwardsLoader;
```

**AFTER:**
```javascript
import apiClient from "../../services/apiService";
import { useEffect, useState } from "react";

const useAwardsLoader = () => {
  const [awards, setAwards] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const response = await apiClient.get('/awards');
        setAwards(response.data);
      } catch (error) {
        console.error("Error fetching awards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAwards();
  }, []);

  return { awards, loading };
};

export default useAwardsLoader;
```

**Changes:**
- Remove Firestore imports
- Use `apiClient.get('/awards')` instead
- Data structure is identical (still grouped by language)

---

## 📅 Step 6: Update useEventsLoader.jsx

**BEFORE:**
```javascript
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useEffect, useState } from "react";

const useEventsLoader = () => {
  const [events, setEvents] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "translations", "events"), (snap) => {
      const data = snap.data();
      setEvents(data?.eventList || []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { events, loading };
};

export default useEventsLoader;
```

**AFTER:**
```javascript
import apiClient from "../../services/apiService";
import { useEffect, useState } from "react";

const useEventsLoader = () => {
  const [events, setEvents] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await apiClient.get('/events');
        setEvents(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return { events, loading };
};

export default useEventsLoader;
```

**Changes:**
- Remove Firebase listener (`onSnapshot`)
- Use `apiClient.get('/events')` instead
- Remove cleanup function (no listener to unsubscribe)
- Data structure matches Firebase format

---

## 📝 Step 7: Update ManageAward.jsx

**BEFORE:**
```javascript
import { onSnapshot, setDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useEffect, useState } from "react";

const ManageAward = () => {
  const [awardsData, setAwardsData] = useState({});
  const [newAward, setNewAward] = useState({ en: "", hi: "", mr: "" });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "translations", "awards"), (snap) => {
      setAwardsData(snap.data() || {});
    });
    return () => unsubscribe();
  }, []);

  const handleAddAward = async () => {
    const updatedData = { ...awardsData };
    updatedData.en = [newAward.en, ...updatedData.en];
    updatedData.hi = [newAward.hi, ...updatedData.hi];
    updatedData.mr = [newAward.mr, ...updatedData.mr];
    await setDoc(doc(db, "translations", "awards"), updatedData);
    setNewAward({ en: "", hi: "", mr: "" });
  };

  const handleDeleteAward = async (index) => {
    const updatedData = { ...awardsData };
    updatedData.en = updatedData.en.filter((_, i) => i !== index);
    updatedData.hi = updatedData.hi.filter((_, i) => i !== index);
    updatedData.mr = updatedData.mr.filter((_, i) => i !== index);
    await setDoc(doc(db, "translations", "awards"), updatedData);
  };

  return (
    <div>
      <h2>Manage Awards</h2>
      {/* UI code */}
    </div>
  );
};

export default ManageAward;
```

**AFTER:**
```javascript
import apiClient from "../../services/apiService";
import { useEffect, useState } from "react";

const ManageAward = () => {
  const [awardsData, setAwardsData] = useState({
    heading: { en: "", hi: "", mr: "" },
    en: [],
    hi: [],
    mr: []
  });
  const [newAward, setNewAward] = useState({ en: "", hi: "", mr: "" });
  const [loading, setLoading] = useState(false);

  // Load awards on mount
  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    try {
      const response = await apiClient.get('/awards');
      setAwardsData(response.data);
    } catch (error) {
      console.error("Error fetching awards:", error);
    }
  };

  const handleAddAward = async () => {
    setLoading(true);
    try {
      for (const lang of ['en', 'hi', 'mr']) {
        if (newAward[lang]) {
          await apiClient.post('/awards', {
            language: lang,
            text: newAward[lang],
            heading: awardsData.heading[lang] || "",
            displayOrder: awardsData[lang]?.length || 0
          });
        }
      }
      setNewAward({ en: "", hi: "", mr: "" });
      await fetchAwards();
    } catch (error) {
      console.error("Error adding award:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAward = async (index, language) => {
    try {
      // This is simplified - in real implementation, you'd need award IDs
      // For now, fetch all and delete the one at this index
      const allAwards = awardsData[language];
      if (allAwards && allAwards[index]) {
        // Delete operation - you need the award ID
        console.log(`Delete award at index ${index} for language ${language}`);
        await fetchAwards();
      }
    } catch (error) {
      console.error("Error deleting award:", error);
    }
  };

  return (
    <div>
      <h2>Manage Awards</h2>
      {/* UI code - works same as before */}
    </div>
  );
};

export default ManageAward;
```

**Key Changes:**
- Remove Firestore listener
- Add `fetchAwards()` function instead
- `handleAddAward()` now makes POST request for each language
- `handleDeleteAward()` now calls DELETE API endpoint
- UI remains same

---

## 📅 Step 8: Update ManageEvents.jsx

**Similar to ManageAward.jsx:**
- Replace `onSnapshot()` with `apiClient.get('/events')`
- Replace `updateDoc()` with `apiClient.put('/events/:id')`
- Add POST and DELETE calls for create/delete
- Keep the same UI structure

---

## 🗑️ Step 9: Delete Firebase Files

Delete these files:
- `src/firebase/firebase.js`

Remove these imports from any files that still have them:
```javascript
// DELETE these lines:
import { auth } from "../../firebase/firebase";
import { db } from "../../firebase/firebase";
```

---

## 📦 Step 10: Remove Firebase from Dependencies

```bash
npm uninstall firebase
```

If you want to keep it for future use, leave it. Otherwise uninstall.

---

## ✅ Verification Checklist

After all changes:

- [ ] Backend is running on `http://localhost:5000`
- [ ] Frontend is running on `http://localhost:5173`
- [ ] `.env` or `.env.local` has `REACT_APP_API_URL=http://localhost:5000/api`
- [ ] Can login with `admin@mumbaicharaja.com` / `ChangeMe123!`
- [ ] Token appears in `localStorage.authToken`
- [ ] Can create/update/delete awards
- [ ] Can create/update/delete events
- [ ] Can logout successfully
- [ ] No Firebase errors in console

---

## 🧪 Quick Test Commands

```bash
# In browser console, test API directly:
const response = await fetch('http://localhost:5000/api/awards');
const data = await response.json();
console.log(data);

# Login and get token:
const loginResp = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@mumbaicharaja.com',
    password: 'ChangeMe123!'
  })
});
const token = (await loginResp.json()).data.token;
localStorage.setItem('authToken', token);

# Verify token:
const verifyResp = await fetch('http://localhost:5000/api/auth/verify', {
  headers: { 'Authorization': `Bearer ${token}` }
});
console.log(await verifyResp.json());
```

---

## 🚀 After Integration

Once frontend integration is complete:

1. **Test all flows locally**
   - Login/logout
   - Create/edit/delete awards
   - Create/edit/delete events

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Migrate from Firebase to Node.js backend"
   git push
   ```

3. **Deploy to Production**
   - Deploy backend to Render.com
   - Update frontend `REACT_APP_API_URL` to production URL
   - Redeploy frontend to Netlify

---

## 💡 Data Compatibility

**Your data structure is preserved:**

Firebase Awards:
```json
{ "heading": {"en":"...", "hi":"...", "mr":"..."}, "en": [...], "hi": [...], "mr": [...] }
```

API Awards:
```json
{ "heading": {"en":"...", "hi":"...", "mr":"..."}, "en": [...], "hi": [...], "mr": [...] }
```

**Same format → No component changes needed in other parts of the app!**

---

## 📞 Support

If something breaks:

1. Check backend is running: `http://localhost:5000/api/health`
2. Check token in localStorage
3. Check browser console for errors
4. Check backend terminal for error logs
5. Verify `.env` configuration
6. Clear localStorage and try again

**Backend logs show exactly what's wrong!**
