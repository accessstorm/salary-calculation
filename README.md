# Enhanced Payroll Management System

A comprehensive payroll management system built with React, Node.js, Express, and MongoDB. Features user authentication, employee management, payroll processing, analytics, and advanced filtering capabilities.

## Features

### 🔐 Authentication & Security
- User registration and login
- JWT-based authentication
- Role-based access control (HR/Admin)
- Secure password hashing

### 👥 Employee Management
- Add, edit, delete employees
- Employee search and filtering
- Bulk operations
- Employee data export (CSV)

### 💰 Payroll Processing
- Monthly and daily payroll records
- Advanced salary calculations
- Overtime and bonus support
- Leave and half-day deductions
- Efficiency adjustments
- Payroll status tracking (Draft, Approved, Paid, Cancelled)

### 📊 Analytics & Reporting
- Real-time KPI dashboard
- Monthly/yearly analytics
- Payroll summaries
- Export capabilities

### 🎨 Enhanced User Experience
- Modern UI with shadcn/ui components
- Loading states and error handling
- Toast notifications
- Responsive design
- Search and filtering
- Bulk operations

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- shadcn/ui components
- Lucide React icons

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing
- Express validation

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/payroll_system
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the project root:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - Get all employees (with search/filter)
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Payroll
- `GET /api/payroll` - Get payroll records (with month/year filtering)
- `GET /api/payroll/:id` - Get single payroll record
- `POST /api/payroll` - Create payroll record
- `PUT /api/payroll/:id` - Update payroll record
- `DELETE /api/payroll/:id` - Delete payroll record
- `GET /api/payroll/analytics/summary` - Get analytics data

## Database Schema

### User Model
- name, email, password, role, isActive

### Employee Model
- name, email, employeeId, department, position, baseSalary, hireDate, isActive

### PayrollRecord Model
- employee, month, year, payrollDate
- Work details: totalDays, halfDays, leaveDays, overtimeHours
- Salary calculations: baseSalary, perDaySalary, grossSalary
- Deductions: halfDayDeduction, unpaidLeaveDeduction
- Adjustments: efficiencyAdjustment, overtimePay, bonus
- Final: netPayableSalary, status, notes

## Key Features Explained

### Salary Calculation Logic
```
Per Day Salary = Base Salary ÷ 30
Net Days Worked = Total Days + (Half Days × 0.5)
Gross Salary = (Base Salary ÷ 30) × Net Days Worked
Half Day Deduction = (Per Day Salary ÷ 2) × Half Days
Unpaid Leave Deduction = Per Day Salary × Leave Days
Net Payable = Gross Salary - Half Day Deduction - Unpaid Leave Deduction + Efficiency Adjustment + Overtime Pay + Bonus
```

### Advanced Filtering
- Search employees by name, email, ID, or position
- Filter payroll records by month, year, status
- Bulk operations for multiple employees
- Export data in CSV format

### Analytics Dashboard
- Total employees count
- Total payable amount
- Average salary calculation
- Paid records tracking
- Monthly/yearly summaries

## Development

### Running in Development Mode
```bash
# Backend
cd backend && npm run dev

# Frontend
npm run dev
```

### Building for Production
```bash
# Frontend
npm run build

# Backend
cd backend && npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

