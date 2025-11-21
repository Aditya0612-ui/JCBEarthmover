# 🚜 JCB & Earthmover Rental Management Dashboard

A comprehensive, real-time dashboard for managing JCBs, excavators, and earthmover vehicles used for renting, billing, and tracking operations.

## 🎯 Features

### 1. **Authentication & Authorization**
- Firebase OAuth (Google Sign-in)
- Email/Password Authentication
- Phone Number OTP Verification
- Role-based access control (Admin/Staff/Viewer)
- Secure session management

### 2. **Dashboard Overview**
- Real-time statistics (total vehicles, active rentals, pending payments, revenue)
- Recent activities feed
- Vehicle availability status
- Quick action cards

### 3. **Vehicle Management**
- Add, edit, and delete vehicles
- Track vehicle status (Available, On Rent, Under Maintenance)
- Record service history and maintenance logs
- Store vehicle details (ID, Model, Type, Condition, Rent Rate)
- Auto-update availability when rented/returned

### 4. **Customer Management**
- Maintain customer database
- Store contact information (Name, Phone, Email, Address)
- Optional PAN/GST details
- Link customers with rental contracts

### 5. **Rental Management**
- Create and manage rental entries
- Select vehicle and customer
- Set rental duration (start & end dates)
- Calculate total rent automatically
- Add additional charges (diesel, transport, driver fee)
- Track rental status (Active/Completed)
- Mark rentals as completed

### 6. **Billing & Payments**
- Auto-generate bills from completed rentals
- Multiple payment modes (Cash, UPI, Bank Transfer, Cheque)
- Track payment status (Pending, Partial, Paid)
- Record payment history
- Download bills as PDF
- View detailed bill information

### 7. **Reports & Analytics**
- Daily/Monthly revenue reports
- Interactive charts (Line, Bar, Pie)
- Vehicle utilization statistics
- Payment mode distribution
- Revenue vs Expenses comparison
- Downloadable PDF reports
- Custom date range filtering

### 8. **Notifications & Reminders**
- Rental ending soon alerts
- Overdue rental notifications
- Payment due reminders
- Vehicle maintenance alerts
- Real-time notification system

### 9. **Responsive Design**
- Fully responsive layout
- Mobile-friendly interface
- Collapsible sidebar for mobile
- Horizontal scrolling tables on small screens
- Optimized for all screen sizes

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Auth (OAuth + Phone OTP)
- **Charts**: Recharts
- **PDF Generation**: jsPDF + jsPDF-AutoTable
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns
- **Routing**: React Router DOM v6

## 📦 Installation

1. **Clone the repository**
```bash
cd Dashboard2
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password, Google, Phone)
   - Create a Realtime Database
   - Enable Storage (for future file uploads)
   - Copy your Firebase configuration

4. **Update Firebase Configuration**
   - Open `src/config/firebase.js`
   - Replace the placeholder values with your Firebase config:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

5. **Set up Firebase Realtime Database Rules**
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

6. **Run the development server**
```bash
npm run dev
```

The application will open at `http://localhost:3000`

## 🚀 Build for Production

```bash
npm run build
```

The optimized build will be in the `dist` folder.

## 📱 Usage

### First Time Setup

1. **Sign Up**: Create an account using Email/Password or Google Sign-in
2. **Add Vehicles**: Navigate to Vehicles page and add your fleet
3. **Add Customers**: Go to Customers page and register your clients
4. **Create Rentals**: Start creating rental entries from the Rentals page
5. **Generate Bills**: After completing rentals, generate bills from the Billing page

### Daily Operations

1. **Dashboard**: Check daily stats and recent activities
2. **Monitor Rentals**: Track active rentals and upcoming returns
3. **Process Payments**: Record payments and update bill status
4. **Check Notifications**: Stay updated with alerts and reminders
5. **Generate Reports**: View analytics and download reports

## 🎨 UI Components

### Reusable Components
- **Button**: Customizable button with variants (primary, secondary, danger, success, outline)
- **InputField**: Form input with label, icon, and error handling
- **Modal**: Responsive modal dialog
- **Table**: Data table with sorting and custom rendering
- **Card**: Container card with optional icon and actions
- **StatCard**: Statistics display card with trend indicators

### Layout Components
- **Sidebar**: Collapsible navigation sidebar
- **Navbar**: Top navigation bar with user menu
- **Layout**: Main layout wrapper

## 🔐 Security Features

- Firebase Authentication
- Protected routes
- Role-based access control
- Secure database rules
- Session management
- Input validation

## 📊 Database Structure

```
├── users/
│   └── {userId}/
│       ├── email
│       ├── displayName
│       ├── role
│       └── createdAt
├── vehicles/
│   └── {vehicleId}/
│       ├── vehicleId
│       ├── model
│       ├── type
│       ├── condition
│       ├── status
│       ├── rentRate
│       └── description
├── customers/
│   └── {customerId}/
│       ├── name
│       ├── phone
│       ├── email
│       ├── address
│       ├── pan
│       └── gst
├── rentals/
│   └── {rentalId}/
│       ├── vehicleId
│       ├── customerId
│       ├── startDate
│       ├── endDate
│       ├── totalRent
│       ├── additionalCharges
│       ├── status
│       └── notes
└── billing/
    └── {billId}/
        ├── billNumber
        ├── rentalId
        ├── totalAmount
        ├── amountPaid
        ├── dueAmount
        ├── paymentMode
        ├── status
        └── notes
```

## 🎯 Future Enhancements

- [ ] WhatsApp integration for bill sharing
- [ ] Email notifications
- [ ] SMS reminders
- [ ] Vehicle GPS tracking
- [ ] Maintenance scheduling
- [ ] Fuel consumption tracking
- [ ] Driver management
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Advanced analytics with ML predictions

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Support

For support, email support@jcbrental.com or create an issue in the repository.

## 🙏 Acknowledgments

- React Team for the amazing framework
- Firebase for backend services
- Tailwind CSS for the utility-first CSS framework
- All open-source contributors

---

**Built with ❤️ for efficient rental management**
