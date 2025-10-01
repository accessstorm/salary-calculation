import React, { useState } from 'react';
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
  Calculator
} from 'lucide-react';

const PayrollDashboard = () => {
  // State management
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    baseSalary: '',
    totalDays: '',
    halfDays: '',
    leaveDays: '',
    efficiencyAdjustment: ''
  });
  const [liveCalculations, setLiveCalculations] = useState({
    perDaySalary: 0,
    obtainableSalary: 0,
    netDaysWorked: 0,
    halfDayDeduction: 0,
    unpaidLeaveDeduction: 0,
    grossSalary: 0,
    netPayableSalary: 0
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Current month (you can make this dynamic)
  const currentMonth = "October 2025";

  // Calculation functions
  const calculatePerDaySalary = (baseSalary) => {
    return baseSalary / 30;
  };

  const calculateObtainableSalary = (baseSalary) => {
    return baseSalary; // This is the full monthly salary (30 days × per day salary)
  };

  const calculateNetDaysWorked = (totalDays, halfDays) => {
    return totalDays + (0.5 * halfDays);
  };

  const calculateHalfDayDeduction = (perDaySalary, halfDays) => {
    return (perDaySalary / 2) * halfDays;
  };

  const calculateUnpaidLeaveDeduction = (perDaySalary, leaveDays) => {
    return perDaySalary * leaveDays;
  };

  const calculateGrossSalary = (baseSalary, netDaysWorked) => {
    return (baseSalary / 30) * netDaysWorked;
  };

  const calculateNetPayableSalary = (perDaySalary, totalDays, halfDays, leaveDays, efficiencyAdjustment) => {
    // Formula: (per day × days worked - half days leave × (per day/2) - full day leave × per day) ± efficiency
    const grossFromDaysWorked = perDaySalary * totalDays;
    const halfDayDeduction = halfDays * (perDaySalary / 2);
    const fullDayLeaveDeduction = leaveDays * perDaySalary;
    
    return grossFromDaysWorked - halfDayDeduction - fullDayLeaveDeduction + efficiencyAdjustment;
  };

  // KPI calculations
  const totalEmployees = employees.length;
  const totalPayableAmount = employees.reduce((sum, emp) => sum + emp.netPayableSalary, 0);
  const averageSalary = totalEmployees > 0 ? totalPayableAmount / totalEmployees : 0;

  // Live calculation function
  const calculateLiveValues = (data) => {
    const baseSalary = parseFloat(data.baseSalary) || 0;
    const totalDays = parseFloat(data.totalDays) || 0;
    const halfDays = parseFloat(data.halfDays) || 0;
    const leaveDays = parseFloat(data.leaveDays) || 0;
    const efficiencyAdjustment = parseFloat(data.efficiencyAdjustment) || 0;

    const perDaySalary = calculatePerDaySalary(baseSalary);
    const obtainableSalary = calculateObtainableSalary(baseSalary);
    const netDaysWorked = calculateNetDaysWorked(totalDays, halfDays);
    const halfDayDeduction = calculateHalfDayDeduction(perDaySalary, halfDays);
    const unpaidLeaveDeduction = calculateUnpaidLeaveDeduction(perDaySalary, leaveDays);
    const grossSalary = calculateGrossSalary(baseSalary, netDaysWorked);
    const netPayableSalary = calculateNetPayableSalary(perDaySalary, totalDays, halfDays, leaveDays, efficiencyAdjustment);

    return {
      perDaySalary,
      obtainableSalary,
      netDaysWorked,
      halfDayDeduction,
      unpaidLeaveDeduction,
      grossSalary,
      netPayableSalary
    };
  };

  // Form handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: value
    };
    
    setFormData(updatedFormData);
    
    // Calculate live values
    const liveValues = calculateLiveValues(updatedFormData);
    setLiveCalculations(liveValues);
  };

  const handleAddEmployee = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.baseSalary || !formData.totalDays) {
      alert('Please fill in all required fields');
      return;
    }

    const baseSalary = parseFloat(formData.baseSalary);
    const totalDays = parseFloat(formData.totalDays);
    const halfDays = parseFloat(formData.halfDays) || 0;
    const leaveDays = parseFloat(formData.leaveDays) || 0;
    const efficiencyAdjustment = parseFloat(formData.efficiencyAdjustment) || 0;

    const perDaySalary = calculatePerDaySalary(baseSalary);
    const obtainableSalary = calculateObtainableSalary(baseSalary);
    const netDaysWorked = calculateNetDaysWorked(totalDays, halfDays);
    const halfDayDeduction = calculateHalfDayDeduction(perDaySalary, halfDays);
    const unpaidLeaveDeduction = calculateUnpaidLeaveDeduction(perDaySalary, leaveDays);
    const grossSalary = calculateGrossSalary(baseSalary, netDaysWorked);
    const netPayableSalary = calculateNetPayableSalary(perDaySalary, totalDays, halfDays, leaveDays, efficiencyAdjustment);

    const newEmployee = {
      id: Date.now(),
      name: formData.name,
      baseSalary,
      perDaySalary,
      obtainableSalary,
      totalDays,
      halfDays,
      leaveDays,
      efficiencyAdjustment,
      netDaysWorked,
      halfDayDeduction,
      unpaidLeaveDeduction,
      grossSalary,
      netPayableSalary
    };

    setEmployees(prev => [...prev, newEmployee]);
    
    // Clear form and live calculations
    setFormData({
      name: '',
      baseSalary: '',
      totalDays: '',
      halfDays: '',
      leaveDays: '',
      efficiencyAdjustment: ''
    });
    setLiveCalculations({
      perDaySalary: 0,
      obtainableSalary: 0,
      netDaysWorked: 0,
      halfDayDeduction: 0,
      unpaidLeaveDeduction: 0,
      grossSalary: 0,
      netPayableSalary: 0
    });
  };

  const handleRemoveEmployee = (id) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  const handleGeneratePayslip = (employee) => {
    setSelectedEmployee(employee);
    setShowPayslipModal(true);
  };

  const handleConfirmPayroll = () => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleAddTestEmployee = () => {
    const testEmployee = {
      id: Date.now(),
      name: 'Test Employee',
      baseSalary: 30000,
      perDaySalary: 1000,
      obtainableSalary: 30000,
      totalDays: 25,
      halfDays: 2,
      leaveDays: 3,
      efficiencyAdjustment: 500,
      netDaysWorked: 26,
      halfDayDeduction: 1000,
      unpaidLeaveDeduction: 3000,
      grossSalary: 25000,
      netPayableSalary: 25500
    };
    setEmployees(prev => [...prev, testEmployee]);
  };

  const handleExportCSV = () => {
    // Check if there are employees to export
    if (employees.length === 0) {
      alert('No employees to export. Please add employees first.');
      return;
    }

    console.log('Exporting employees:', employees); // Debug log

    const csvContent = [
      [
        'Employee Name', 
        'Base Salary (₹)', 
        'Per Day Salary (₹)', 
        'Obtainable Salary (₹)', 
        'Total Days Worked', 
        'Half Days', 
        'Leave Days (Unpaid)', 
        'Net Days Worked', 
        'Half Day Deduction (₹)', 
        'Unpaid Leave Deduction (₹)', 
        'Gross Salary (₹)', 
        'Efficiency/Adjustment (₹)', 
        'Net Payable Salary (₹)'
      ],
      ...employees.map(emp => {
        console.log('Processing employee:', emp); // Debug log
        return [
          emp.name || '',
          (emp.baseSalary || 0).toFixed(2),
          (emp.perDaySalary || 0).toFixed(2),
          (emp.obtainableSalary || 0).toFixed(2),
          emp.totalDays || 0,
          emp.halfDays || 0,
          emp.leaveDays || 0,
          (emp.netDaysWorked || 0).toFixed(2),
          (emp.halfDayDeduction || 0).toFixed(2),
          (emp.unpaidLeaveDeduction || 0).toFixed(2),
          (emp.grossSalary || 0).toFixed(2),
          (emp.efficiencyAdjustment || 0).toFixed(2),
          (emp.netPayableSalary || 0).toFixed(2)
        ];
      })
    ].map(row => row.join(',')).join('\n');

    console.log('CSV Content:', csvContent); // Debug log

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-detailed-${currentMonth.toLowerCase().replace(' ', '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Payslip calculations
  const getPayslipBreakdown = (employee) => {
    const efficiencyBonus = employee.efficiencyAdjustment > 0 ? employee.efficiencyAdjustment : 0;
    const deductions = employee.efficiencyAdjustment < 0 ? Math.abs(employee.efficiencyAdjustment) : 0;
    const totalDeductions = employee.halfDayDeduction + employee.unpaidLeaveDeduction + deductions;

    return {
      halfDayDeduction: employee.halfDayDeduction,
      unpaidLeaveDeduction: employee.unpaidLeaveDeduction,
      efficiencyBonus,
      deductions,
      totalDeductions
    };
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payroll Management Dashboard</h1>
          <p className="text-gray-600">Manage employee payroll for {currentMonth}</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Payable Amount</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalPayableAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Salary</p>
                <p className="text-2xl font-bold text-gray-900">₹{averageSalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Salary Calculation Info */}
        <div className="bg-blue-50 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Salary Calculation Logic
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Per Day Salary</h4>
              <p className="text-gray-600">Base Salary ÷ 30 days</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Half Day Deduction</h4>
              <p className="text-gray-600">(Per Day Salary ÷ 2) × Half Days</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Unpaid Leave Deduction</h4>
              <p className="text-gray-600">Per Day Salary × Leave Days</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Net Payable</h4>
              <p className="text-gray-600">(Per Day × Days Worked - Half Days × (Per Day/2) - Leave Days × Per Day) ± Efficiency</p>
            </div>
          </div>
        </div>

        {/* Add Employee Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Add Employee to Payroll
          </h2>
          
          <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Monthly Salary (₹) *</label>
              <input
                type="number"
                name="baseSalary"
                value={formData.baseSalary}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0"
                step="0.01"
                placeholder="Enter base salary"
              />
              {formData.baseSalary && (
                <p className="text-xs text-green-600 mt-1">
                  → Per day: ₹{liveCalculations.perDaySalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Days Worked *</label>
              <input
                type="number"
                name="totalDays"
                value={formData.totalDays}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0"
                max="30"
                step="0.5"
                placeholder="Enter days worked"
              />
              {formData.totalDays && formData.baseSalary && (
                <p className="text-xs text-blue-600 mt-1">
                  → Gross: ₹{liveCalculations.grossSalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Half Days</label>
              <input
                type="number"
                name="halfDays"
                value={formData.halfDays}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.5"
                placeholder="Enter half days"
              />
              {formData.halfDays > 0 && formData.baseSalary && (
                <p className="text-xs text-red-600 mt-1">
                  → Deduction: ₹{liveCalculations.halfDayDeduction.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Days (Unpaid)</label>
              <input
                type="number"
                name="leaveDays"
                value={formData.leaveDays}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.5"
                placeholder="Enter leave days"
              />
              {formData.leaveDays > 0 && formData.baseSalary && (
                <p className="text-xs text-red-600 mt-1">
                  → Deduction: ₹{liveCalculations.unpaidLeaveDeduction.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Efficiency/Adjustment (₹)</label>
              <input
                type="number"
                name="efficiencyAdjustment"
                value={formData.efficiencyAdjustment}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
                placeholder="+ for bonus, - for deduction"
              />
              {formData.efficiencyAdjustment && formData.baseSalary && formData.totalDays && (
                <p className={`text-xs mt-1 ${parseFloat(formData.efficiencyAdjustment) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  → {parseFloat(formData.efficiencyAdjustment) >= 0 ? 'Bonus' : 'Deduction'}: ₹{Math.abs(parseFloat(formData.efficiencyAdjustment)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              )}
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </button>
            </div>
          </form>

          {/* Live Calculation Display */}
          {(formData.baseSalary || formData.totalDays || formData.halfDays || formData.leaveDays || formData.efficiencyAdjustment) && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Live Calculation Preview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formData.baseSalary && (
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Per Day Salary</p>
                    <p className="text-lg font-semibold text-green-700">₹{liveCalculations.perDaySalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                  </div>
                )}
                {formData.baseSalary && (
                  <div className="bg-white p-3 rounded border border-2 border-purple-300">
                    <p className="text-sm text-gray-600">Obtainable Salary (30 days)</p>
                    <p className="text-lg font-semibold text-purple-700">₹{liveCalculations.obtainableSalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                  </div>
                )}
                {(formData.totalDays || formData.halfDays) && (
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Net Days Worked</p>
                    <p className="text-lg font-semibold text-green-700">{liveCalculations.netDaysWorked.toFixed(2)} days</p>
                  </div>
                )}
                {formData.halfDays > 0 && (
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Half Day Deduction</p>
                    <p className="text-lg font-semibold text-red-600">₹{liveCalculations.halfDayDeduction.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                  </div>
                )}
                {formData.leaveDays > 0 && (
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Unpaid Leave Deduction</p>
                    <p className="text-lg font-semibold text-red-600">₹{liveCalculations.unpaidLeaveDeduction.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                  </div>
                )}
                {(formData.baseSalary && formData.totalDays) && (
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Gross Salary</p>
                    <p className="text-lg font-semibold text-blue-700">₹{liveCalculations.grossSalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                  </div>
                )}
                {(formData.baseSalary && formData.totalDays) && (
                  <div className="bg-white p-3 rounded border border-2 border-green-400">
                    <p className="text-sm text-gray-600">Net Payable Salary</p>
                    <p className="text-xl font-bold text-green-700">₹{liveCalculations.netPayableSalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      <p>Formula: (Per Day × Days) - (Half Days × Per Day/2) - (Leave Days × Per Day) ± Efficiency</p>
                      <p>Calculation: (₹{liveCalculations.perDaySalary.toFixed(2)} × {formData.totalDays}) - (₹{(liveCalculations.perDaySalary/2).toFixed(2)} × {formData.halfDays || 0}) - (₹{liveCalculations.perDaySalary.toFixed(2)} × {formData.leaveDays || 0}) {formData.efficiencyAdjustment ? (parseFloat(formData.efficiencyAdjustment) >= 0 ? '+' : '') + '₹' + parseFloat(formData.efficiencyAdjustment).toFixed(2) : ''}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Payroll Summary Table */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Review Payroll - {currentMonth}
          </h2>

          {employees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No employees added yet. Add employees using the form above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Salary</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Per Day</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Obtainable</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Worked</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Half Days</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Days</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Days</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Half Day Ded.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Ded.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Salary</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency/Adj.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Payable</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.name}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">₹{employee.baseSalary.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">₹{employee.perDaySalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-purple-600 font-medium">₹{employee.obtainableSalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{employee.totalDays}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{employee.halfDays}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{employee.leaveDays}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{employee.netDaysWorked.toFixed(2)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600">₹{employee.halfDayDeduction.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600">₹{employee.unpaidLeaveDeduction.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">₹{employee.grossSalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className={employee.efficiencyAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {employee.efficiencyAdjustment >= 0 ? '+' : ''}₹{employee.efficiencyAdjustment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{employee.netPayableSalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => handleGeneratePayslip(employee)}
                            className="text-blue-600 hover:text-blue-900 flex items-center text-xs"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Payslip
                          </button>
                          <button
                            onClick={() => handleRemoveEmployee(employee.id)}
                            className="text-red-600 hover:text-red-900 flex items-center text-xs"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Final Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleConfirmPayroll}
              className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Confirm & Process Payroll
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center justify-center"
            >
              <Download className="h-5 w-5 mr-2" />
              Export as CSV
            </button>
            <button
              onClick={handleAddTestEmployee}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Test Employee
            </button>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Debug Info:</strong> Current employees count: {employees.length}</p>
            {employees.length > 0 && (
              <p>Employee names: {employees.map(emp => emp.name).join(', ')}</p>
            )}
          </div>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Payroll Confirmed!
            </div>
          </div>
        )}

        {/* Payslip Modal */}
        {showPayslipModal && selectedEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Payslip - {currentMonth}</h3>
                  <button
                    onClick={() => setShowPayslipModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Employee Details</h4>
                  <p className="text-gray-700"><strong>Name:</strong> {selectedEmployee.name}</p>
                  <p className="text-gray-700"><strong>Pay Period:</strong> {currentMonth}</p>
                </div>

                {/* Calculation Details */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Calculator className="h-5 w-5 mr-2 text-blue-600" />
                    Calculation Details
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Base Salary:</strong> ₹{selectedEmployee.baseSalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                        <p><strong>Per Day Salary:</strong> ₹{selectedEmployee.perDaySalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                        <p><strong>Obtainable Salary (30 days):</strong> ₹{selectedEmployee.obtainableSalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                        <p><strong>Total Days Worked:</strong> {selectedEmployee.totalDays}</p>
                        <p><strong>Half Days:</strong> {selectedEmployee.halfDays}</p>
                        <p><strong>Leave Days:</strong> {selectedEmployee.leaveDays}</p>
                      </div>
                      <div>
                        <p><strong>Net Days Worked:</strong> {selectedEmployee.netDaysWorked.toFixed(2)}</p>
                        <p><strong>Half Day Deduction:</strong> ₹{selectedEmployee.halfDayDeduction.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                        <p><strong>Unpaid Leave Deduction:</strong> ₹{selectedEmployee.unpaidLeaveDeduction.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                        <p><strong>Efficiency Adjustment:</strong> ₹{selectedEmployee.efficiencyAdjustment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {(() => {
                  const breakdown = getPayslipBreakdown(selectedEmployee);
                  return (
                    <div className="space-y-6">
                      {/* Earnings */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                          Earnings
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <span>Per Day Salary × Days Worked</span>
                            <span>₹{selectedEmployee.perDaySalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })} × {selectedEmployee.totalDays} = ₹{(selectedEmployee.perDaySalary * selectedEmployee.totalDays).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                          </div>
                          {breakdown.efficiencyBonus > 0 && (
                            <div className="flex justify-between">
                              <span>Efficiency Bonus</span>
                              <span>₹{breakdown.efficiencyBonus.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                            </div>
                          )}
                          <hr className="my-2" />
                          <div className="flex justify-between font-semibold">
                            <span>Gross Earnings</span>
                            <span>₹{(selectedEmployee.perDaySalary * selectedEmployee.totalDays + breakdown.efficiencyBonus).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Deductions */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <Calculator className="h-5 w-5 mr-2 text-red-600" />
                          Deductions
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          {breakdown.halfDayDeduction > 0 && (
                            <div className="flex justify-between mb-2">
                              <span>Half Day Deduction ({selectedEmployee.halfDays} days × ₹{selectedEmployee.perDaySalary.toFixed(2)}/2)</span>
                              <span>₹{breakdown.halfDayDeduction.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                            </div>
                          )}
                          {breakdown.unpaidLeaveDeduction > 0 && (
                            <div className="flex justify-between mb-2">
                              <span>Unpaid Leave Deduction ({selectedEmployee.leaveDays} days × ₹{selectedEmployee.perDaySalary.toFixed(2)})</span>
                              <span>₹{breakdown.unpaidLeaveDeduction.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                            </div>
                          )}
                          {breakdown.deductions > 0 && (
                            <div className="flex justify-between mb-2">
                              <span>Efficiency Deduction</span>
                              <span>₹{breakdown.deductions.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                            </div>
                          )}
                          {breakdown.totalDeductions === 0 && (
                            <div className="text-gray-500">No deductions</div>
                          )}
                          <hr className="my-2" />
                          <div className="flex justify-between font-semibold">
                            <span>Total Deductions</span>
                            <span>₹{breakdown.totalDeductions.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                          Summary
                        </h4>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-600 mb-2">
                            <p><strong>Formula:</strong> (Per Day × Days Worked) - (Half Days × Per Day/2) - (Leave Days × Per Day) ± Efficiency</p>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span>Gross Earnings</span>
                            <span>₹{(selectedEmployee.perDaySalary * selectedEmployee.totalDays + breakdown.efficiencyBonus).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span>Total Deductions</span>
                            <span>₹{breakdown.totalDeductions.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                          </div>
                          <hr className="my-2" />
                          <div className="flex justify-between text-xl font-bold text-blue-600">
                            <span>Net Salary Payable</span>
                            <span>₹{selectedEmployee.netPayableSalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowPayslipModal(false)}
                    className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollDashboard;
