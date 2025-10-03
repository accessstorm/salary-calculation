import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { X, Calculator, DollarSign, Calendar, Minus, Plus, FileText } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const SalaryCalculator = ({ 
  isOpen, 
  onClose, 
  employee,
  onSubmit, 
  loading = false,
  existingRecord = null
}) => {
  const [formData, setFormData] = useState({
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

  const [calculations, setCalculations] = useState({
    perDaySalary: 0,
    grossSalary: 0,
    halfDayDeduction: 0,
    unpaidLeaveDeduction: 0,
    netPayableSalary: 0
  });

  const [errors, setErrors] = useState({});

  // Pre-populate form if editing existing record
  useEffect(() => {
    if (existingRecord) {
      setFormData({
        month: existingRecord.month,
        year: existingRecord.year,
        payrollDate: existingRecord.payrollDate ? new Date(existingRecord.payrollDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        totalDays: existingRecord.totalDays || '',
        halfDays: existingRecord.halfDays || 0,
        leaveDays: existingRecord.leaveDays || 0,
        overtimeHours: existingRecord.overtimeHours || 0,
        efficiencyAdjustment: existingRecord.efficiencyAdjustment || 0,
        overtimePay: existingRecord.overtimePay || 0,
        bonus: existingRecord.bonus || 0,
        notes: existingRecord.notes || ''
      });
    }
  }, [existingRecord]);

  // Calculate values whenever form data changes
  useEffect(() => {
    if (employee && employee.baseSalary) {
      const baseSalary = parseFloat(employee.baseSalary);
      const totalDays = parseFloat(formData.totalDays) || 0;
      const halfDays = parseFloat(formData.halfDays) || 0;
      const leaveDays = parseFloat(formData.leaveDays) || 0;
      const efficiencyAdjustment = parseFloat(formData.efficiencyAdjustment) || 0;
      const overtimePay = parseFloat(formData.overtimePay) || 0;
      const bonus = parseFloat(formData.bonus) || 0;

      // Calculate per day salary
      const perDaySalary = baseSalary / 30;
      
      // Calculate gross salary (base salary for days worked)
      const grossSalary = (baseSalary / 30) * totalDays;
      
      // Calculate deductions
      const halfDayDeduction = (perDaySalary / 2) * halfDays;
      const unpaidLeaveDeduction = perDaySalary * leaveDays;
      
      // Calculate net payable salary
      const netPayableSalary = grossSalary - halfDayDeduction - unpaidLeaveDeduction + efficiencyAdjustment + overtimePay + bonus;

      setCalculations({
        perDaySalary,
        grossSalary,
        halfDayDeduction,
        unpaidLeaveDeduction,
        netPayableSalary
      });
    }
  }, [employee, formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.totalDays || formData.totalDays <= 0) {
      newErrors.totalDays = 'Total days must be greater than 0';
    }

    if (formData.totalDays > 31) {
      newErrors.totalDays = 'Total days cannot exceed 31';
    }

    if (formData.halfDays < 0) {
      newErrors.halfDays = 'Half days cannot be negative';
    }

    if (formData.leaveDays < 0) {
      newErrors.leaveDays = 'Leave days cannot be negative';
    }

    if (formData.overtimeHours < 0) {
      newErrors.overtimeHours = 'Overtime hours cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const payrollData = {
      ...formData,
      employee: employee._id,
      baseSalary: employee.baseSalary,
      perDaySalary: calculations.perDaySalary,
      grossSalary: calculations.grossSalary,
      halfDayDeduction: calculations.halfDayDeduction,
      unpaidLeaveDeduction: calculations.unpaidLeaveDeduction,
      netPayableSalary: calculations.netPayableSalary
    };

    onSubmit(payrollData);
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                {existingRecord ? 'Update Invoice' : 'Salary Calculator'} - {employee.name}
              </CardTitle>
              <CardDescription>
                {existingRecord ? 'Update invoice for' : 'Calculate net payable salary for'} {employee.name} (Base Salary: ₹{employee.baseSalary?.toLocaleString('en-IN')})
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Month</label>
                  <Input
                    name="month"
                    type="number"
                    value={formData.month}
                    onChange={handleChange}
                    min="1"
                    max="12"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Year</label>
                  <Input
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleChange}
                    min="2020"
                    max="2030"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payroll Date</label>
                  <Input
                    name="payrollDate"
                    type="date"
                    value={formData.payrollDate}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Work Days */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Total Days Worked *</label>
                  <Input
                    name="totalDays"
                    type="number"
                    value={formData.totalDays}
                    onChange={handleChange}
                    placeholder="Enter days worked"
                    min="0"
                    max="31"
                    step="0.5"
                    disabled={loading}
                  />
                  {errors.totalDays && (
                    <p className="text-sm text-red-600">{errors.totalDays}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Half Days</label>
                  <Input
                    name="halfDays"
                    type="number"
                    value={formData.halfDays}
                    onChange={handleChange}
                    placeholder="Enter half days"
                    min="0"
                    step="0.5"
                    disabled={loading}
                  />
                  {errors.halfDays && (
                    <p className="text-sm text-red-600">{errors.halfDays}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Leave Days (Unpaid)</label>
                  <Input
                    name="leaveDays"
                    type="number"
                    value={formData.leaveDays}
                    onChange={handleChange}
                    placeholder="Enter leave days"
                    min="0"
                    step="0.5"
                    disabled={loading}
                  />
                  {errors.leaveDays && (
                    <p className="text-sm text-red-600">{errors.leaveDays}</p>
                  )}
                </div>
              </div>

              {/* Adjustments */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Efficiency/Adjustment (₹)</label>
                  <Input
                    name="efficiencyAdjustment"
                    type="number"
                    value={formData.efficiencyAdjustment}
                    onChange={handleChange}
                    placeholder="+ for bonus, - for deduction"
                    step="0.01"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Overtime Pay (₹)</label>
                  <Input
                    name="overtimePay"
                    type="number"
                    value={formData.overtimePay}
                    onChange={handleChange}
                    placeholder="Enter overtime pay"
                    min="0"
                    step="0.01"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bonus (₹)</label>
                  <Input
                    name="bonus"
                    type="number"
                    value={formData.bonus}
                    onChange={handleChange}
                    placeholder="Enter bonus amount"
                    min="0"
                    step="0.01"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Live Calculations Display */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Live Calculation Preview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Per Day Salary</p>
                    <p className="text-lg font-semibold text-blue-700">
                      ₹{calculations.perDaySalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Gross Salary</p>
                    <p className="text-lg font-semibold text-green-700">
                      ₹{calculations.grossSalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Half Day Deduction</p>
                    <p className="text-lg font-semibold text-red-600">
                      ₹{calculations.halfDayDeduction.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Leave Deduction</p>
                    <p className="text-lg font-semibold text-red-600">
                      ₹{calculations.unpaidLeaveDeduction.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-2 border-green-400">
                    <p className="text-sm text-gray-600">Net Payable Salary</p>
                    <p className="text-xl font-bold text-green-700">
                      ₹{calculations.netPayableSalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                
                {/* Formula Display */}
                <div className="mt-4 p-3 bg-white rounded border text-sm text-gray-600">
                  <p className="font-semibold mb-2">Calculation Formula:</p>
                  <p>Net Payable = Gross Salary - Half Day Deduction - Leave Deduction + Efficiency Adjustment + Overtime Pay + Bonus</p>
                  <p className="mt-1">
                    = ₹{calculations.grossSalary.toFixed(2)} - ₹{calculations.halfDayDeduction.toFixed(2)} - ₹{calculations.unpaidLeaveDeduction.toFixed(2)} 
                    {formData.efficiencyAdjustment ? ` ${parseFloat(formData.efficiencyAdjustment) >= 0 ? '+' : ''}₹${parseFloat(formData.efficiencyAdjustment).toFixed(2)}` : ''}
                    {formData.overtimePay ? ` + ₹${parseFloat(formData.overtimePay).toFixed(2)}` : ''}
                    {formData.bonus ? ` + ₹${parseFloat(formData.bonus).toFixed(2)}` : ''}
                    = ₹{calculations.netPayableSalary.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Input
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add any notes or comments"
                  disabled={loading}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      {existingRecord ? 'Updating Invoice...' : 'Generating Invoice...'}
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      {existingRecord ? 'Update Invoice' : 'Generate Invoice'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalaryCalculator;
