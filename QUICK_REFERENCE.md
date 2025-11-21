# 🚀 Quick Reference Guide

## 📋 Table of Contents
1. [Installation & Setup](#installation--setup)
2. [Common Commands](#common-commands)
3. [Firebase Setup](#firebase-setup)
4. [Adding New Features](#adding-new-features)
5. [Troubleshooting](#troubleshooting)
6. [Code Snippets](#code-snippets)

---

## Installation & Setup

### Quick Start (3 Steps)
```bash
# 1. Install dependencies
npm install

# 2. Configure Firebase (edit src/config/firebase.js)
# Replace YOUR_API_KEY, YOUR_PROJECT_ID, etc.

# 3. Run development server
npm run dev
```

---

## Common Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build           # Build for production
npm run preview         # Preview production build

# Package Management
npm install             # Install all dependencies
npm install [package]   # Add new package
npm update             # Update packages
```

---

## Firebase Setup

### 1. Get Firebase Config
```javascript
// Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

### 2. Enable Authentication
- Go to Authentication > Sign-in method
- Enable: Email/Password, Google, Phone

### 3. Database Rules (Production)
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "vehicles": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "customers": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "rentals": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "billing": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

---

## Adding New Features

### Add a New Page

1. **Create Page Component**
```javascript
// src/pages/NewPage.jsx
import React from 'react';
import Card from '../components/common/Card';

const NewPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">New Page</h1>
      <Card>
        <p>Content here</p>
      </Card>
    </div>
  );
};

export default NewPage;
```

2. **Add Route in App.jsx**
```javascript
import NewPage from './pages/NewPage';

// Inside Routes component
<Route
  path="/new-page"
  element={
    <ProtectedRoute>
      <NewPage />
    </ProtectedRoute>
  }
/>
```

3. **Add to Sidebar**
```javascript
// src/components/layout/Sidebar.jsx
import { NewIcon } from 'lucide-react';

const menuItems = [
  // ... existing items
  { path: '/new-page', icon: NewIcon, label: 'New Page' }
];
```

### Add a New Component

```javascript
// src/components/common/NewComponent.jsx
import React from 'react';

const NewComponent = ({ title, children, className = '' }) => {
  return (
    <div className={`p-4 bg-white rounded-lg ${className}`}>
      {title && <h3 className="font-semibold mb-2">{title}</h3>}
      {children}
    </div>
  );
};

export default NewComponent;
```

### Add Firebase Database Operation

```javascript
import { ref, push, set, get, remove, onValue } from 'firebase/database';
import { database } from '../config/firebase';

// Create
const addData = async (data) => {
  const dbRef = ref(database, 'collection');
  await push(dbRef, data);
};

// Read (once)
const getData = async () => {
  const dbRef = ref(database, 'collection');
  const snapshot = await get(dbRef);
  return snapshot.val();
};

// Read (real-time)
const listenToData = (callback) => {
  const dbRef = ref(database, 'collection');
  return onValue(dbRef, (snapshot) => {
    callback(snapshot.val());
  });
};

// Update
const updateData = async (id, data) => {
  const dbRef = ref(database, `collection/${id}`);
  await set(dbRef, data);
};

// Delete
const deleteData = async (id) => {
  const dbRef = ref(database, `collection/${id}`);
  await remove(dbRef);
};
```

---

## Troubleshooting

### Issue: Port 3000 already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Or change port in vite.config.js
server: {
  port: 3001
}
```

### Issue: Firebase not connecting
1. Check `src/config/firebase.js` configuration
2. Verify Firebase project is active
3. Check browser console for errors
4. Ensure internet connection

### Issue: Authentication not working
1. Enable auth methods in Firebase Console
2. Add domain to authorized domains
3. Check Firebase Auth rules
4. Clear browser cache and cookies

### Issue: Database permission denied
1. Update database rules in Firebase Console
2. Ensure user is authenticated
3. Check user role permissions

### Issue: Build fails
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

---

## Code Snippets

### Create a Modal Form
```javascript
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState({ name: '', email: '' });

const handleSubmit = async (e) => {
  e.preventDefault();
  // Save to Firebase
  await push(ref(database, 'collection'), formData);
  setIsOpen(false);
};

return (
  <>
    <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Form">
      <form onSubmit={handleSubmit}>
        <InputField
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Modal>
  </>
);
```

### Create a Data Table
```javascript
const columns = [
  { header: 'Name', accessor: 'name' },
  { header: 'Email', accessor: 'email' },
  {
    header: 'Actions',
    render: (row) => (
      <button onClick={() => handleEdit(row)}>Edit</button>
    )
  }
];

const data = [
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' }
];

return <Table columns={columns} data={data} />;
```

### Add Search Functionality
```javascript
const [searchTerm, setSearchTerm] = useState('');
const [filteredData, setFilteredData] = useState([]);

useEffect(() => {
  const filtered = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  setFilteredData(filtered);
}, [searchTerm, data]);

return (
  <>
    <InputField
      placeholder="Search..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      icon={Search}
    />
    <Table columns={columns} data={filteredData} />
  </>
);
```

### Show Toast Notifications
```javascript
import toast from 'react-hot-toast';

// Success
toast.success('Operation successful!');

// Error
toast.error('Something went wrong!');

// Loading
const loadingToast = toast.loading('Processing...');
// Later...
toast.dismiss(loadingToast);
toast.success('Done!');

// Custom
toast.custom((t) => (
  <div className="bg-white p-4 rounded-lg shadow-lg">
    Custom notification
  </div>
));
```

### Format Dates
```javascript
import { format, differenceInDays } from 'date-fns';

// Format date
const formatted = format(new Date(), 'PP'); // Jan 1, 2024
const time = format(new Date(), 'PPp'); // Jan 1, 2024, 12:00 PM

// Calculate difference
const days = differenceInDays(new Date('2024-12-31'), new Date());
```

### Generate PDF
```javascript
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const generatePDF = () => {
  const doc = new jsPDF();
  
  doc.text('Report Title', 20, 20);
  
  doc.autoTable({
    head: [['Column 1', 'Column 2']],
    body: [
      ['Data 1', 'Data 2'],
      ['Data 3', 'Data 4']
    ]
  });
  
  doc.save('report.pdf');
};
```

### Create Chart
```javascript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 }
];

return (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="value" stroke="#f59e0b" />
    </LineChart>
  </ResponsiveContainer>
);
```

---

## Useful Resources

- **React Docs**: https://react.dev
- **Firebase Docs**: https://firebase.google.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev
- **Recharts**: https://recharts.org
- **date-fns**: https://date-fns.org

---

## Keyboard Shortcuts (VS Code)

- `Ctrl + P` - Quick file open
- `Ctrl + Shift + F` - Search in files
- `Ctrl + /` - Toggle comment
- `Alt + Shift + F` - Format document
- `F2` - Rename symbol
- `Ctrl + Space` - Trigger suggestions

---

## Git Commands

```bash
git init                    # Initialize repository
git add .                   # Stage all changes
git commit -m "message"     # Commit changes
git push origin main        # Push to remote
git pull                    # Pull latest changes
git status                  # Check status
git log                     # View commit history
```

---

**💡 Pro Tip**: Keep this file open while developing for quick reference!
