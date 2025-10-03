# Payroll Management System

A comprehensive full-stack payroll management system built with React, Node.js, Express, and MongoDB. This system provides complete employee management, salary calculations, invoice generation, and payment processing capabilities.

## 🏗️ System Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom UI components
- **State Management**: React Context API + useState/useEffect
- **Authentication**: Guest user system with localStorage
- **Components**: Modular, reusable UI components

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based with guest user support
- **Validation**: Express-validator for input validation
- **CORS**: Configured for cross-origin requests

## 📁 Project Structure

```
payroll-system/
├── backend/                    # Backend API server
│   ├── config/
│   │   └── database.js        # MongoDB connection
│   ├── middleware/
│   │   └── auth.js            # Authentication middleware
│   ├── models/                # MongoDB schemas
│   │   ├── Employee.js        # Employee data model
│   │   ├── PayrollRecord.js   # Payroll/invoice model
│   │   └── User.js            # User model (for future use)
│   ├── routes/                # API endpoints
│   │   ├── auth.js            # Authentication routes
│   │   ├── employees.js       # Employee CRUD operations
│   │   └── payroll.js         # Payroll/invoice operations
│   ├── server.js              # Express server setup
│   └── package.json           # Backend dependencies
├── src/                       # Frontend React application
│   ├── components/            # React components
│   │   ├── ui/                # Reusable UI components
│   │   ├── EmployeeForm.jsx   # Employee creation/editing
│   │   ├── SalaryCalculator.jsx # Salary calculation modal
│   │   ├── InvoiceViewer.jsx  # Invoice display
│   │   ├── SalaryPaymentPage.jsx # Payment processing
│   │   └── EnhancedPayrollDashboard.jsx # Main dashboard
│   ├── contexts/
│   │   └── AuthContext.jsx    # Authentication context
│   ├── services/
│   │   └── api.js             # API service layer
│   ├── lib/
│   │   └── utils.js           # Utility functions
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles
├── package.json               # Frontend dependencies
├── tailwind.config.js         # Tailwind configuration
├── vite.config.js             # Vite configuration
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd payroll-system
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../src
npm install
```

4. **Environment Setup**
Create a `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/payroll-system
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```

5. **Start the application**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd src
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🔧 Integration Guide for Larger Projects

### 1. Backend Integration

#### Database Models
The system uses three main MongoDB models that can be easily integrated:

**Employee Model**
```javascript
// backend/models/Employee.js
const employeeSchema = {
  name: String,
  email: String,
  employeeId: String,
  department: String,
  position: String,
  baseSalary: Number,
  hireDate: Date,
  category: { type: String, enum: ['active', 'inactive', 'on-leave', 'terminated'] },
  createdBy: ObjectId, // Optional for guest users
  createdByGuest: Boolean
};
```

**PayrollRecord Model**
```javascript
// backend/models/PayrollRecord.js
const payrollSchema = {
  employee: ObjectId,
  month: Number,
  year: Number,
  payrollDate: Date,
  totalDays: Number,
  halfDays: Number,
  leaveDays: Number,
  overtimeHours: Number,
  baseSalary: Number,
  perDaySalary: Number,
  grossSalary: Number,
  halfDayDeduction: Number,
  unpaidLeaveDeduction: Number,
  efficiencyAdjustment: Number,
  overtimePay: Number,
  bonus: Number,
  netPayableSalary: Number,
  isProcessed: Boolean,
  processedAt: Date,
  notes: String,
  createdBy: ObjectId, // Optional for guest users
  createdByGuest: Boolean
};
```

#### API Endpoints
The system provides RESTful APIs that can be integrated into existing applications:

**Employee Management**
```javascript
GET    /api/employees          // Get all employees with pagination
POST   /api/employees          // Create new employee
GET    /api/employees/:id      // Get employee by ID
PUT    /api/employees/:id      // Update employee
DELETE /api/employees/:id      // Delete employee
```

**Payroll Management**
```javascript
GET    /api/payroll            // Get payroll records with filters
POST   /api/payroll            // Create new payroll record
GET    /api/payroll/:id        // Get payroll record by ID
PUT    /api/payroll/:id        // Update payroll record
DELETE /api/payroll/:id        // Delete payroll record
```

#### Authentication Middleware
The system supports both traditional JWT authentication and guest user access:

```javascript
// backend/middleware/auth.js
const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  const isGuestUser = req.header('X-Guest-User') === 'true';
  
  if (isGuestUser) {
    // Create mock user for guest access
    req.user = {
      _id: 'guest-user',
      name: 'Guest User',
      email: 'guest@example.com',
      role: 'hr',
      isGuest: true
    };
    return next();
  }
  
  // Traditional JWT authentication
  // ... JWT verification logic
};
```

### 2. Frontend Integration

#### Component Architecture
The frontend is built with modular components that can be easily integrated:

**Main Dashboard Component**
```javascript
// src/components/EnhancedPayrollDashboard.jsx
const EnhancedPayrollDashboard = () => {
  // State management
  const [employees, setEmployees] = useState([]);
  const [payrollRecords, setPayrollRecords] = useState([]);
  
  // API integration
  const loadEmployees = async () => {
    const response = await api.getEmployees();
    setEmployees(response.employees);
  };
  
  // Component rendering
  return (
    <div>
      {/* Employee table with Net Payable column */}
      {/* Action buttons for CRUD operations */}
      {/* Modals for forms */}
    </div>
  );
};
```

**API Service Layer**
```javascript
// src/services/api.js
class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const guestUser = localStorage.getItem('guestUser');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(guestUser && { 'X-Guest-User': 'true' }),
        ...options.headers,
      },
      ...options,
    };
    
    const response = await fetch(url, config);
    return response.json();
  }
  
  // Employee methods
  async getEmployees(params = {}) {
    return this.request(`/employees${this.buildQueryString(params)}`);
  }
  
  async createEmployee(employeeData) {
    return this.request('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  }
  
  // Payroll methods
  async getPayrollRecords(params = {}) {
    return this.request(`/payroll${this.buildQueryString(params)}`);
  }
  
  async createPayrollRecord(payrollData) {
    return this.request('/payroll', {
      method: 'POST',
      body: JSON.stringify(payrollData),
    });
  }
}
```

#### Authentication Context
```javascript
// src/contexts/AuthContext.jsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  const loginAsGuest = () => {
    const guestUser = {
      id: 'guest-user',
      name: 'Guest User',
      email: 'guest@example.com',
      role: 'hr',
      isGuest: true
    };
    localStorage.setItem('guestUser', JSON.stringify(guestUser));
    setUser(guestUser);
  };
  
  return (
    <AuthContext.Provider value={{ user, loginAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 3. Key Features for Integration

#### Net Payable Column Logic
The system includes a sophisticated Net Payable column that shows real-time invoice status:

```javascript
// Individual cell component for each employee
const NetPayableCell = ({ employee }) => {
  const [invoiceStatus, setInvoiceStatus] = useState({ hasInvoice: false, netPayable: 0 });
  
  useEffect(() => {
    const checkEmployeeInvoice = async () => {
      const response = await api.getPayrollRecords({
        employee: employee._id,
        limit: 1
      });
      
      if (response.payrollRecords?.length > 0) {
        setInvoiceStatus({
          hasInvoice: true,
          netPayable: response.payrollRecords[0].netPayableSalary
        });
      }
    };
    
    checkEmployeeInvoice();
  }, [employee._id]);
  
  return (
    <div>
      <span className={invoiceStatus.hasInvoice ? 'text-green-600' : 'text-gray-400'}>
        ₹{invoiceStatus.netPayable.toLocaleString('en-IN')}
      </span>
      {invoiceStatus.hasInvoice ? (
        <Badge className="text-green-600">Ready</Badge>
      ) : (
        <Badge className="text-orange-600">No Invoice</Badge>
      )}
    </div>
  );
};
```

#### Salary Calculation Engine
The system includes a comprehensive salary calculation engine:

```javascript
// Salary calculation logic
const calculateSalary = (employee, payrollData) => {
  const baseSalary = employee.baseSalary;
  const perDaySalary = baseSalary / 30;
  const netDaysWorked = payrollData.totalDays + (0.5 * payrollData.halfDays);
  
  const grossSalary = (baseSalary / 30) * netDaysWorked;
  const halfDayDeduction = (perDaySalary / 2) * payrollData.halfDays;
  const unpaidLeaveDeduction = perDaySalary * payrollData.leaveDays;
  
  const netPayableSalary = grossSalary 
    - halfDayDeduction 
    - unpaidLeaveDeduction 
    + payrollData.efficiencyAdjustment 
    + payrollData.overtimePay 
    + payrollData.bonus;
    
  return {
    perDaySalary,
    grossSalary,
    halfDayDeduction,
    unpaidLeaveDeduction,
    netPayableSalary
  };
};
```

## 🔌 Integration Patterns

### 1. Microservices Integration
The backend can be easily containerized and deployed as microservices:

```dockerfile
# Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### 2. Database Integration
The MongoDB models can be extended or integrated with existing schemas:

```javascript
// Extend Employee model for your organization
const ExtendedEmployeeSchema = new mongoose.Schema({
  ...employeeSchema.obj,
  // Add your custom fields
  employeeCode: String,
  managerId: ObjectId,
  teamId: ObjectId,
  customFields: mongoose.Schema.Types.Mixed
});
```

### 3. Authentication Integration
The guest user system can be replaced with your existing authentication:

```javascript
// Replace guest authentication with your system
const auth = async (req, res, next) => {
  // Your existing authentication logic
  const user = await yourAuthService.verifyToken(req.headers.authorization);
  req.user = user;
  next();
};
```

### 4. Frontend Integration
Components can be integrated into existing React applications:

```javascript
// Import specific components
import { EnhancedPayrollDashboard } from './payroll-system/src/components';
import { ApiService } from './payroll-system/src/services';

// Use in your existing app
const YourApp = () => {
  return (
    <div>
      <YourExistingHeader />
      <EnhancedPayrollDashboard />
      <YourExistingFooter />
    </div>
  );
};
```

## 🛠️ Customization Guide

### 1. Styling Customization
The system uses Tailwind CSS with custom components. To customize:

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#your-brand-color',
        secondary: '#your-secondary-color',
      },
    },
  },
};
```

### 2. Business Logic Customization
Salary calculation rules can be customized:

```javascript
// Custom salary calculation
const customSalaryCalculation = (employee, payrollData) => {
  // Your custom calculation logic
  const baseSalary = employee.baseSalary;
  const customMultiplier = 1.2; // Example: 20% bonus
  const netPayableSalary = baseSalary * customMultiplier;
  
  return { netPayableSalary };
};
```

### 3. API Customization
Add custom endpoints for your specific needs:

```javascript
// backend/routes/custom.js
router.get('/api/custom/reports', auth, async (req, res) => {
  // Your custom reporting logic
  const reports = await generateCustomReports();
  res.json(reports);
});
```

## 📊 Database Schema Reference

### Employee Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  employeeId: String,
  department: String,
  position: String,
  baseSalary: Number,
  hireDate: Date,
  category: String, // 'active', 'inactive', 'on-leave', 'terminated'
  createdBy: ObjectId, // Optional
  createdByGuest: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### PayrollRecord Collection
```javascript
{
  _id: ObjectId,
  employee: ObjectId, // Reference to Employee
  month: Number, // 1-12
  year: Number,
  payrollDate: Date,
  totalDays: Number,
  halfDays: Number,
  leaveDays: Number,
  overtimeHours: Number,
  baseSalary: Number,
  perDaySalary: Number,
  grossSalary: Number,
  halfDayDeduction: Number,
  unpaidLeaveDeduction: Number,
  efficiencyAdjustment: Number,
  overtimePay: Number,
  bonus: Number,
  netPayableSalary: Number,
  isProcessed: Boolean,
  processedAt: Date,
  notes: String,
  createdBy: ObjectId, // Optional
  createdByGuest: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment Guide

### 1. Backend Deployment
```bash
# Build and deploy backend
cd backend
npm run build
docker build -t payroll-backend .
docker run -p 5000:5000 payroll-backend
```

### 2. Frontend Deployment
```bash
# Build and deploy frontend
cd src
npm run build
# Deploy dist/ folder to your hosting service
```

### 3. Environment Variables
```env
# Production environment
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-secret
NODE_ENV=production
PORT=5000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For integration support or questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

---

**Note**: This system is designed to be easily integrated into larger projects. The modular architecture, clear separation of concerns, and comprehensive API design make it suitable for enterprise-level applications.