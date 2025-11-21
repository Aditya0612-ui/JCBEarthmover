# 🚀 Complete Setup Guide

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `jcb-rental-management`
4. Disable Google Analytics (optional)
5. Click "Create project"

### 1.2 Enable Authentication Methods

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable the following providers:
   - **Email/Password**: Click Enable and Save
   - **Google**: Click Enable, add support email, and Save
   - **Phone**: Click Enable, and Save

### 1.3 Set up Realtime Database

1. Go to **Realtime Database** in Firebase Console
2. Click "Create Database"
3. Choose location (closest to your users)
4. Start in **Test mode** (we'll update rules later)
5. Click "Enable"

### 1.4 Update Database Rules

1. In Realtime Database, go to **Rules** tab
2. Replace with these rules:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "vehicles": {
      ".read": "auth != null",
      ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'staff')"
    },
    "customers": {
      ".read": "auth != null",
      ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'staff')"
    },
    "rentals": {
      ".read": "auth != null",
      ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'staff')"
    },
    "billing": {
      ".read": "auth != null",
      ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'staff')"
    }
  }
}
```

3. Click "Publish"

### 1.5 Enable Storage (Optional - for future features)

1. Go to **Storage** in Firebase Console
2. Click "Get started"
3. Use default security rules
4. Choose location
5. Click "Done"

### 1.6 Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon `</>`
4. Register app with nickname: `jcb-rental-web`
5. Copy the `firebaseConfig` object

---

## Step 2: Local Project Setup

### 2.1 Install Node.js
- Download and install [Node.js](https://nodejs.org/) (v18 or higher)
- Verify installation:
```bash
node --version
npm --version
```

### 2.2 Install Dependencies
```bash
cd Dashboard2
npm install
```

### 2.3 Configure Firebase

1. Open `src/config/firebase.js`
2. Replace the placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### 2.4 Run Development Server
```bash
npm run dev
```

The app will open at `http://localhost:3000`

---

## Step 3: First Time Usage

### 3.1 Create Admin Account

1. Open the app at `http://localhost:3000`
2. Click "Sign Up"
3. Create account with email/password or Google
4. **Important**: Manually set your role to 'admin' in Firebase:
   - Go to Firebase Console > Realtime Database
   - Navigate to `users/{your-uid}`
   - Change `role` from `viewer` to `admin`

### 3.2 Add Sample Data

#### Add Vehicles
1. Go to **Vehicles** page
2. Click "Add Vehicle"
3. Fill in details:
   - Vehicle ID: JCB-001
   - Model: JCB 3DX
   - Type: JCB
   - Condition: Good
   - Status: Available
   - Rent Rate: 5000
4. Click "Add Vehicle"

#### Add Customers
1. Go to **Customers** page
2. Click "Add Customer"
3. Fill in details:
   - Name: John Doe
   - Phone: +91 9876543210
   - Email: john@example.com
   - Address: 123 Main St, City
4. Click "Add Customer"

#### Create Rental
1. Go to **Rentals** page
2. Click "New Rental"
3. Select vehicle and customer
4. Set start and end dates
5. Add additional charges if needed
6. Click "Create Rental"

#### Generate Bill
1. Complete a rental first
2. Go to **Billing** page
3. Click "Generate Bill"
4. Select the completed rental
5. Choose payment mode
6. Enter amount paid
7. Click "Generate Bill"

---

## Step 4: Production Deployment

### 4.1 Build for Production
```bash
npm run build
```

### 4.2 Deploy to Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init
```
   - Select "Hosting"
   - Choose your Firebase project
   - Set public directory to: `dist`
   - Configure as single-page app: `Yes`
   - Set up automatic builds: `No`

4. Deploy:
```bash
npm run build
firebase deploy
```

Your app will be live at: `https://your-project.web.app`

### 4.3 Alternative: Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

3. Deploy:
```bash
netlify deploy --prod --dir=dist
```

---

## Step 5: Configure Phone Authentication (Optional)

### 5.1 Enable reCAPTCHA
Phone authentication requires reCAPTCHA verification:

1. Go to [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
2. Register a new site
3. Choose reCAPTCHA v2 (Invisible)
4. Add your domain
5. Copy the site key

### 5.2 Update Firebase Console
1. Go to Firebase Console > Authentication > Sign-in method
2. Click on Phone
3. Add your authorized domains

### 5.3 Test Phone Auth
1. In the app, click "Phone" tab on login
2. Enter phone number with country code (+91 for India)
3. Complete reCAPTCHA
4. Enter OTP received
5. Sign in

---

## Step 6: User Roles & Permissions

### Role Types
- **Admin**: Full access to all features
- **Staff**: Can manage vehicles, customers, rentals, and billing
- **Viewer**: Read-only access

### Setting User Roles
1. Go to Firebase Console > Realtime Database
2. Navigate to `users/{userId}`
3. Edit the `role` field
4. Set to: `admin`, `staff`, or `viewer`

---

## Troubleshooting

### Issue: Firebase not connecting
**Solution**: Check if Firebase config is correct in `src/config/firebase.js`

### Issue: Authentication not working
**Solution**: 
- Verify authentication methods are enabled in Firebase Console
- Check if domain is authorized in Firebase Console > Authentication > Settings

### Issue: Database permission denied
**Solution**: Update database rules as shown in Step 1.4

### Issue: Phone auth not working
**Solution**: 
- Enable Phone authentication in Firebase Console
- Add domain to authorized domains
- Ensure reCAPTCHA is properly configured

### Issue: Build fails
**Solution**:
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## Support & Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **React Documentation**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vite Documentation**: https://vitejs.dev

---

## Security Best Practices

1. **Never commit** `.env` file to version control
2. **Use environment variables** for sensitive data
3. **Update Firebase rules** for production
4. **Enable App Check** in Firebase for additional security
5. **Regular backups** of Realtime Database
6. **Monitor usage** in Firebase Console
7. **Set up billing alerts** in Firebase

---

**🎉 Setup Complete! You're ready to manage your rental business efficiently.**
