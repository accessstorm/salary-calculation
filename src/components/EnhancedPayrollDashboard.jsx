import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  FileText, 
  Trash2, 
  CheckCircle, 
  Download,
  X,
  Calendar,
  Calculator,
  Search,
  Filter,
  BarChart3,
  Settings,
  LogOut,
  Eye
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import LoadingSpinner from './LoadingSpinner';
import { useToast } from './ToastProvider';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import EmployeeForm from './EmployeeForm';
import SalaryCalculator from './SalaryCalculator';
import InvoiceViewer from './InvoiceViewer';
import SalaryPaymentPage from './SalaryPaymentPage';

const EnhancedPayrollDashboard = () => {
  // State management
  const [employees, setEmployees] = useState([]);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  
  // Form states
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showPayrollForm, setShowPayrollForm] = useState(false);
  const [showSalaryCalculator, setShowSalaryCalculator] = useState(false);
  const [showInvoiceViewer, setShowInvoiceViewer] = useState(false);
  const [showSalaryPaymentPage, setShowSalaryPaymentPage] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [selectedEmployeeForSalary, setSelectedEmployeeForSalary] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [existingPayrollRecord, setExistingPayrollRecord] = useState(null);
  
  // Form data
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    employeeId: '',
    department: '',
    position: '',
    baseSalary: '',
    hireDate: '',
    category: 'active'
  });
  
  const [payrollForm, setPayrollForm] = useState({
    employee: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    payrollDate: new Date().toISOString().split('T')[0],
    totalDays: '',
    halfDays: 0,
    leaveDays: 0,
    overtimeHours: 0,
    efficiencyAdjustment: 0,
    overtimePay: 0,
    bonus: 0,
    notes: ''
  });

  const { user, logout } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

  // Load data on component mount
  useEffect(() => {
    loadEmployees(true);
    loadPayrollRecords(false); // Don't show loading for payroll records on initial load
  }, []);

  // Load employees
  const loadEmployees = async (showLoading = true, searchQuery = null) => {
    try {
      if (showLoading) setLoading(true);
      const response = await api.getEmployees({ 
        search: searchQuery !== null ? searchQuery : searchTerm,
        page: 1,
        limit: 100 
      });
      setEmployees(response.employees);
    } catch (error) {
      showError('Failed to load employees');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Load payroll records
  const loadPayrollRecords = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const params = {
        month: filterMonth,
        year: filterYear,
        page: 1,
        limit: 100
      };
      const response = await api.getPayrollRecords(params);
      setPayrollRecords(response.payrollRecords);
    } catch (error) {
      showError('Failed to load payroll records');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Load analytics
  const loadAnalytics = async () => {
    try {
      const response = await api.getPayrollAnalytics(filterYear);
      setAnalytics(response);
    } catch (error) {
      showError('Failed to load analytics');
    }
  };

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Debounce search
    setTimeout(() => {
      loadEmployees(false, value); // Don't show loading spinner for search, pass the search value
    }, 500);
  };

  // Handle filters
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'month':
        setFilterMonth(value);
        break;
      case 'year':
        setFilterYear(value);
        break;
    }
    loadPayrollRecords(false); // Don't show loading spinner for filter changes
  };

  // Employee form handlers
  const handleEmployeeFormChange = (e) => {
    setEmployeeForm({
      ...employeeForm,
      [e.target.name]: e.target.value
    });
  };

  const handleEmployeeSubmit = async (formData) => {
    console.log('handleEmployeeSubmit called with:', formData);
    try {
      setLoading(true);
      console.log('Creating employee with data:', formData);
      
      if (editingEmployee) {
        console.log('Updating employee:', editingEmployee._id);
        await api.updateEmployee(editingEmployee._id, formData);
        showSuccess('Employee updated successfully');
      } else {
        console.log('Creating new employee');
        const response = await api.createEmployee(formData);
        console.log('Employee created successfully:', response);
        showSuccess('Employee created successfully');
      }
      
      setShowEmployeeForm(false);
      setEditingEmployee(null);
      setEmployeeForm({
        name: '',
        email: '',
        employeeId: '',
        department: '',
        position: '',
        baseSalary: '',
        hireDate: '',
        category: 'active'
      });
      loadEmployees(false); // Don't show loading spinner after employee creation
    } catch (error) {
      console.error('Error creating/updating employee:', error);
      showError(error.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  // Salary calculator handler
  const handleSalaryCalculatorSubmit = async (payrollData) => {
    console.log('handleSalaryCalculatorSubmit called with:', payrollData);
    console.log('existingPayrollRecord:', existingPayrollRecord);
    try {
      setLoading(true);
      
      let response;
      if (existingPayrollRecord) {
        // Update existing record
        console.log('Updating existing payroll record:', existingPayrollRecord._id);
        response = await api.updatePayrollRecord(existingPayrollRecord._id, payrollData);
        showSuccess('Invoice updated successfully');
      } else {
        // Create new record
        console.log('Creating new payroll record with data:', payrollData);
        response = await api.createPayrollRecord(payrollData);
        showSuccess('Invoice generated successfully');
      }
      
      console.log('Payroll record processed successfully:', response);
      
      setShowSalaryCalculator(false);
      setSelectedEmployeeForSalary(null);
      setExistingPayrollRecord(null);
      loadPayrollRecords();
    } catch (error) {
      console.error('Error processing payroll record:', error);
      showError(error.message || 'Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  // Handle viewing invoice
  const handleViewInvoice = async (employee) => {
    try {
      // Fetch payroll records for this specific employee
      const response = await api.getPayrollRecords({
        employee: employee._id,
        limit: 100
      });
      
      if (response.payrollRecords && response.payrollRecords.length > 0) {
        // Get the latest record
        const latestRecord = response.payrollRecords[0];
        setSelectedInvoice(latestRecord);
        setShowInvoiceViewer(true);
      } else {
        showError('No invoice found for this employee');
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      showError('Failed to load invoice');
    }
  };

  // Get category badge color
  const getCategoryBadgeColor = (category) => {
    switch (category) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'on-leave':
        return 'bg-yellow-100 text-yellow-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Payroll form handlers
  const handlePayrollFormChange = (e) => {
    setPayrollForm({
      ...payrollForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePayrollSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Get employee data for calculations
      const employee = employees.find(emp => emp._id === payrollForm.employee);
      if (!employee) {
        showError('Employee not found');
        return;
      }

      const baseSalary = parseFloat(employee.baseSalary);
      const totalDays = parseFloat(payrollForm.totalDays);
      const halfDays = parseFloat(payrollForm.halfDays) || 0;
      const leaveDays = parseFloat(payrollForm.leaveDays) || 0;
      const efficiencyAdjustment = parseFloat(payrollForm.efficiencyAdjustment) || 0;
      const overtimePay = parseFloat(payrollForm.overtimePay) || 0;
      const bonus = parseFloat(payrollForm.bonus) || 0;

      // Calculate payroll
      const perDaySalary = baseSalary / 30;
      const netDaysWorked = totalDays + (0.5 * halfDays);
      const halfDayDeduction = (perDaySalary / 2) * halfDays;
      const unpaidLeaveDeduction = perDaySalary * leaveDays;
      const grossSalary = (baseSalary / 30) * netDaysWorked;
      const netPayableSalary = grossSalary - halfDayDeduction - unpaidLeaveDeduction + efficiencyAdjustment + overtimePay + bonus;

      const payrollData = {
        ...payrollForm,
        baseSalary,
        perDaySalary,
        grossSalary,
        halfDayDeduction,
        unpaidLeaveDeduction,
        netPayableSalary
      };

      if (editingPayroll) {
        await api.updatePayrollRecord(editingPayroll._id, payrollData);
        showSuccess('Payroll record updated successfully');
      } else {
        await api.createPayrollRecord(payrollData);
        showSuccess('Payroll record created successfully');
      }
      
      setShowPayrollForm(false);
      setEditingPayroll(null);
      setPayrollForm({
        employee: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        payrollDate: new Date().toISOString().split('T')[0],
        totalDays: '',
        halfDays: 0,
        leaveDays: 0,
        overtimeHours: 0,
        efficiencyAdjustment: 0,
        overtimePay: 0,
        bonus: 0,
        notes: ''
      });
      loadPayrollRecords();
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete handlers
  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.deleteEmployee(id);
        showSuccess('Employee deleted successfully');
        loadEmployees(false); // Don't show loading spinner after delete
      } catch (error) {
        showError(error.message);
      }
    }
  };

  const handleDeletePayroll = async (id) => {
    if (window.confirm('Are you sure you want to delete this payroll record?')) {
      try {
        await api.deletePayrollRecord(id);
        showSuccess('Payroll record deleted successfully');
        loadPayrollRecords();
      } catch (error) {
        showError(error.message);
      }
    }
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    if (selectedEmployees.length === 0) {
      showWarning('Please select employees to delete');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedEmployees.length} employees?`)) {
      try {
        setLoading(true);
        await Promise.all(selectedEmployees.map(id => api.deleteEmployee(id)));
        showSuccess(`${selectedEmployees.length} employees deleted successfully`);
        setSelectedEmployees([]);
        loadEmployees(false); // Don't show loading spinner after bulk delete
      } catch (error) {
        showError('Failed to delete some employees');
      } finally {
        setLoading(false);
      }
    }
  };

  // Export functions
  const handleExportCSV = async () => {
    try {
      const csvContent = [
        [
          'Employee Name', 
          'Email',
          'Employee ID',
          'Department',
          'Position',
          'Base Salary',
          'Hire Date'
        ],
        ...employees.map(emp => [
          emp.name,
          emp.email,
          emp.employeeId,
          emp.department,
          emp.position,
          emp.baseSalary,
          new Date(emp.hireDate).toLocaleDateString()
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employees-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showSuccess('Employees exported successfully');
    } catch (error) {
      showError('Failed to export employees');
    }
  };

  // Calculate KPIs
  const totalEmployees = employees.length;
  const totalPayableAmount = payrollRecords.reduce((sum, record) => sum + (record.netPayableSalary || 0), 0);
  const averageSalary = totalEmployees > 0 ? totalPayableAmount / totalEmployees : 0;
  const activeRecords = payrollRecords.filter(record => record.isProcessed).length;

  // Show salary payment page if requested
  if (showSalaryPaymentPage) {
    return (
      <SalaryPaymentPage 
        onBack={() => setShowSalaryPaymentPage(false)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button
                variant="outline"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Payable</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{totalPayableAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Salary</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{averageSalary.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Paid Records</p>
                  <p className="text-2xl font-bold text-gray-900">{activeRecords}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search & Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
              
              <Select
                value={filterMonth}
                onChange={(e) => handleFilterChange('month', e.target.value)}
              >
                <option value="">All Months</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </Select>

              <Select
                value={filterYear}
                onChange={(e) => handleFilterChange('year', e.target.value)}
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </Select>

            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button onClick={() => setShowEmployeeForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
          <Button onClick={() => setShowPayrollForm(true)} variant="outline">
            <Calculator className="h-4 w-4 mr-2" />
            Create Payroll
          </Button>
          <Button onClick={() => setShowSalaryPaymentPage(true)} variant="default" className="bg-green-600 hover:bg-green-700">
            <DollarSign className="h-4 w-4 mr-2" />
            Process Salary Payment
          </Button>
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          {selectedEmployees.length > 0 && (
            <Button onClick={handleBulkDelete} variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedEmployees.length})
            </Button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Employee Form Modal */}
        <EmployeeForm
          isOpen={showEmployeeForm}
          onClose={() => {
            setShowEmployeeForm(false);
            setEditingEmployee(null);
            setEmployeeForm({
              name: '',
              email: '',
              employeeId: '',
              department: '',
              position: '',
              baseSalary: '',
              hireDate: ''
            });
          }}
          onSubmit={handleEmployeeSubmit}
          editingEmployee={editingEmployee}
          loading={loading}
        />

        {/* Salary Calculator Modal */}
        <SalaryCalculator
          isOpen={showSalaryCalculator}
          onClose={() => {
            setShowSalaryCalculator(false);
            setSelectedEmployeeForSalary(null);
            setExistingPayrollRecord(null);
          }}
          employee={selectedEmployeeForSalary}
          onSubmit={handleSalaryCalculatorSubmit}
          loading={loading}
          existingRecord={existingPayrollRecord}
        />

        {/* Invoice Viewer Modal */}
        <InvoiceViewer
          isOpen={showInvoiceViewer}
          onClose={() => {
            setShowInvoiceViewer(false);
            setSelectedInvoice(null);
          }}
          invoice={selectedInvoice}
          employee={selectedInvoice?.employee}
        />

        {/* Employees Table */}
        {employees.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Employees ({employees.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEmployees(employees.map(emp => emp._id));
                            } else {
                              setSelectedEmployees([]);
                            }
                          }}
                          className="rounded"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Salary</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees.map((employee) => (
                      <tr key={employee._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(employee._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEmployees(prev => [...prev, employee._id]);
                              } else {
                                setSelectedEmployees(prev => prev.filter(id => id !== employee._id));
                              }
                            }}
                            className="rounded"
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {employee.name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.email}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.employeeId}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.department}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.position}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{employee.baseSalary?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Badge className={getCategoryBadgeColor(employee.category)}>
                            {employee.category?.toUpperCase() || 'ACTIVE'}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex flex-col space-y-1">
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingEmployee(employee);
                                  setEmployeeForm({
                                    name: employee.name,
                                    email: employee.email,
                                    employeeId: employee.employeeId,
                                    department: employee.department,
                                    position: employee.position,
                                    baseSalary: employee.baseSalary,
                                    hireDate: new Date(employee.hireDate).toISOString().split('T')[0],
                                    category: employee.category || 'active'
                                  });
                                  setShowEmployeeForm(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteEmployee(employee._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={async () => {
                                setSelectedEmployeeForSalary(employee);
                                
                                // Check if there's an existing record for this employee (latest one)
                                try {
                                  const response = await api.getPayrollRecords({
                                    employee: employee._id,
                                    limit: 1
                                  });
                                  
                                  console.log('Checking for existing payroll record:', response.payrollRecords);
                                  
                                  if (response.payrollRecords && response.payrollRecords.length > 0) {
                                    setExistingPayrollRecord(response.payrollRecords[0]);
                                    console.log('Found existing record:', response.payrollRecords[0]);
                                  } else {
                                    setExistingPayrollRecord(null);
                                    console.log('No existing record found');
                                  }
                                } catch (error) {
                                  console.error('Error checking existing record:', error);
                                  setExistingPayrollRecord(null);
                                }
                                
                                setShowSalaryCalculator(true);
                              }}
                              className="w-full"
                            >
                              <Calculator className="h-4 w-4 mr-1" />
                              Calculate Salary
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewInvoice(employee)}
                              className="w-full"
                              title="Show Invoice"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Show Invoice
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Employees Message */}
        {employees.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first employee to the system.</p>
              <Button onClick={() => setShowEmployeeForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EnhancedPayrollDashboard;

