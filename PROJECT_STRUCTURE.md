# 📁 Project Structure

```
Dashboard2/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx              # Reusable button component
│   │   │   ├── Card.jsx                # Card container component
│   │   │   ├── InputField.jsx          # Form input component
│   │   │   ├── Modal.jsx               # Modal dialog component
│   │   │   ├── StatCard.jsx            # Statistics card component
│   │   │   └── Table.jsx               # Data table component
│   │   └── layout/
│   │       ├── Layout.jsx              # Main layout wrapper
│   │       ├── Navbar.jsx              # Top navigation bar
│   │       └── Sidebar.jsx             # Side navigation menu
│   ├── config/
│   │   └── firebase.js                 # Firebase configuration
│   ├── context/
│   │   └── AuthContext.jsx             # Authentication context provider
│   ├── pages/
│   │   ├── Billing.jsx                 # Billing & payments page
│   │   ├── Customers.jsx               # Customer management page
│   │   ├── Dashboard.jsx               # Main dashboard page
│   │   ├── Login.jsx                   # Login/signup page
│   │   ├── Notifications.jsx           # Notifications page
│   │   ├── Rentals.jsx                 # Rental management page
│   │   ├── Reports.jsx                 # Reports & analytics page
│   │   └── Vehicles.jsx                # Vehicle management page
│   ├── App.jsx                         # Main app component with routing
│   ├── index.css                       # Global styles & Tailwind
│   └── main.jsx                        # App entry point
├── .env.example                        # Environment variables template
├── .gitignore                          # Git ignore rules
├── index.html                          # HTML entry point
├── package.json                        # Dependencies & scripts
├── postcss.config.js                   # PostCSS configuration
├── PROJECT_STRUCTURE.md                # This file
├── README.md                           # Project documentation
├── SETUP_GUIDE.md                      # Detailed setup instructions
├── tailwind.config.js                  # Tailwind CSS configuration
└── vite.config.js                      # Vite configuration
```

## 📦 Component Hierarchy

```
App
├── AuthProvider (Context)
│   ├── Router
│   │   ├── PublicRoute
│   │   │   └── Login
│   │   └── ProtectedRoute
│   │       └── Layout
│   │           ├── Sidebar
│   │           ├── Navbar
│   │           └── Page Content
│   │               ├── Dashboard
│   │               ├── Vehicles
│   │               ├── Customers
│   │               ├── Rentals
│   │               ├── Billing
│   │               ├── Reports
│   │               └── Notifications
│   └── Toaster (Notifications)
```

## 🔄 Data Flow

```
Firebase Realtime Database
    ↓
AuthContext / useAuth Hook
    ↓
Protected Pages
    ↓
Components (Cards, Tables, Modals)
    ↓
User Actions
    ↓
Firebase Database Updates
    ↓
Real-time UI Updates
```

## 🎨 Styling Architecture

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Classes**: Defined in `index.css`
  - `.card` - Card container
  - `.btn-primary` - Primary button
  - `.btn-secondary` - Secondary button
  - `.btn-danger` - Danger button
  - `.input-field` - Form input
  - `.label` - Form label

## 🔐 Authentication Flow

```
User Login Attempt
    ↓
Firebase Auth (Email/Google/Phone)
    ↓
onAuthStateChanged Listener
    ↓
Update AuthContext State
    ↓
Fetch User Role from Database
    ↓
Grant Access Based on Role
    ↓
Redirect to Dashboard
```

## 📊 Database Schema

### Users Collection
```javascript
users/{userId}
  ├── email: string
  ├── displayName: string
  ├── role: "admin" | "staff" | "viewer"
  └── createdAt: timestamp
```

### Vehicles Collection
```javascript
vehicles/{vehicleId}
  ├── vehicleId: string
  ├── model: string
  ├── type: string
  ├── condition: string
  ├── status: "Available" | "On Rent" | "Under Maintenance"
  ├── rentRate: number
  ├── description: string
  ├── createdAt: timestamp
  └── updatedAt: timestamp
```

### Customers Collection
```javascript
customers/{customerId}
  ├── name: string
  ├── phone: string
  ├── email: string
  ├── address: string
  ├── pan: string
  ├── gst: string
  ├── createdAt: timestamp
  └── updatedAt: timestamp
```

### Rentals Collection
```javascript
rentals/{rentalId}
  ├── vehicleId: string
  ├── vehicleName: string
  ├── customerId: string
  ├── customerName: string
  ├── startDate: date
  ├── endDate: date
  ├── rentRate: number
  ├── additionalCharges: {
  │   ├── diesel: number
  │   ├── transport: number
  │   └── driverFee: number
  │   }
  ├── totalRent: number
  ├── status: "Active" | "Completed"
  ├── notes: string
  ├── createdAt: timestamp
  └── updatedAt: timestamp
```

### Billing Collection
```javascript
billing/{billId}
  ├── billNumber: string
  ├── rentalId: string
  ├── vehicleName: string
  ├── customerName: string
  ├── totalAmount: number
  ├── amountPaid: number
  ├── dueAmount: number
  ├── paymentMode: "Cash" | "UPI" | "Bank Transfer" | "Cheque"
  ├── status: "Pending" | "Partial" | "Paid"
  ├── notes: string
  ├── createdAt: timestamp
  └── updatedAt: timestamp
```

## 🚀 Key Features by Page

### Dashboard
- Real-time statistics
- Recent activities
- Quick action cards
- Vehicle availability overview

### Vehicles
- CRUD operations
- Status management
- Search & filter
- Condition tracking

### Customers
- Customer database
- Contact information
- PAN/GST details
- Search functionality

### Rentals
- Create rentals
- Duration calculation
- Additional charges
- Status tracking
- Complete rentals

### Billing
- Generate bills
- Payment tracking
- PDF download
- Payment history
- Due amount tracking

### Reports
- Revenue charts
- Vehicle utilization
- Payment distribution
- Date range filtering
- PDF export

### Notifications
- Rental alerts
- Payment reminders
- Maintenance notifications
- Real-time updates

## 🎯 Performance Optimizations

1. **Code Splitting**: React.lazy for route-based splitting
2. **Real-time Updates**: Firebase listeners for live data
3. **Optimized Renders**: React.memo for expensive components
4. **Efficient Queries**: Indexed Firebase queries
5. **Lazy Loading**: Images and heavy components
6. **Caching**: Browser caching for static assets

## 🔧 Development Tools

- **Vite**: Fast build tool and dev server
- **ESLint**: Code linting (optional)
- **Prettier**: Code formatting (optional)
- **React DevTools**: Component debugging
- **Firebase Emulator**: Local testing (optional)

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md, lg)
- **Desktop**: > 1024px (xl, 2xl)

All components are designed to be fully responsive across these breakpoints.
