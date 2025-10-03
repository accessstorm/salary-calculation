import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  DollarSign, 
  Users, 
  CheckCircle, 
  Clock,
  CreditCard,
  Banknote
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useToast } from './ToastProvider';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const SalaryPaymentPage = ({ onBack }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingPayments, setProcessingPayments] = useState(new Set());
  const { showSuccess, showError } = useToast();

  // Load active employees
  const loadActiveEmployees = async () => {
    try {
      setLoading(true);
      
      // Load employees
      const employeeResponse = await api.getEmployees({ 
        page: 1,
        limit: 100 
      });
      
      // Filter only active employees
      const activeEmployees = employeeResponse.employees.filter(emp => emp.category === 'active');
      setEmployees(activeEmployees);
      
    } catch (error) {
      showError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveEmployees();
  }, []);

  // Check if employee has invoice by making direct API call
  const checkEmployeeInvoice = async (employeeId) => {
    try {
      const response = await api.getPayrollRecords({
        employee: employeeId,
        limit: 1
      });
      
      if (response.payrollRecords && response.payrollRecords.length > 0) {
        const record = response.payrollRecords[0];
        return {
          hasInvoice: true,
          netPayable: record.netPayableSalary || 0
        };
      }
      
      return {
        hasInvoice: false,
        netPayable: 0
      };
    } catch (error) {
      console.error('Error checking invoice:', error);
      return {
        hasInvoice: false,
        netPayable: 0
      };
    }
  };

  // Handle salary payment
  const handlePayNow = async (employee) => {
    try {
      setProcessingPayments(prev => new Set(prev).add(employee._id));
      
      // Check if employee has invoice
      const invoiceStatus = await checkEmployeeInvoice(employee._id);
      
      if (!invoiceStatus.hasInvoice) {
        showError(`No invoice found for ${employee.name}. Please generate an invoice first.`);
        return;
      }
      
      // Here you would typically call an API to process the payment
      // For now, we'll just simulate the payment process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showSuccess(`Salary payment of ₹${invoiceStatus.netPayable.toLocaleString('en-IN')} processed for ${employee.name}`);
      
      // Remove from processing set
      setProcessingPayments(prev => {
        const newSet = new Set(prev);
        newSet.delete(employee._id);
        return newSet;
      });
      
    } catch (error) {
      showError(`Failed to process payment for ${employee.name}`);
      setProcessingPayments(prev => {
        const newSet = new Set(prev);
        newSet.delete(employee._id);
        return newSet;
      });
    }
  };

  // Calculate total amount to be paid (will be calculated dynamically)
  const totalAmount = 0; // Will be calculated when we check each employee
  const activeEmployeeCount = employees.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">Salary Payment Processing</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Users className="h-3 w-3 mr-1" />
                {activeEmployeeCount} Active Employees
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{activeEmployeeCount}</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                  <p className="text-2xl font-bold text-gray-900">{activeEmployeeCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
              Payment Processing Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This is a frontend demonstration. In a real application, 
                clicking "Pay Now" would integrate with payment gateways or banking systems 
                to process actual salary payments to employees.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Employee List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Employees - Ready for Payment</CardTitle>
            <CardDescription>
              Review and process salary payments for all active employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            {employees.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Employees</h3>
                <p className="text-gray-600">There are no active employees to process payments for.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {employees.map((employee) => (
                  <EmployeePaymentRow 
                    key={employee._id} 
                    employee={employee} 
                    onPayNow={handlePayNow}
                    processingPayments={processingPayments}
                    checkInvoice={checkEmployeeInvoice}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Separate component for each employee row
const EmployeePaymentRow = ({ employee, onPayNow, processingPayments, checkInvoice }) => {
  const [invoiceStatus, setInvoiceStatus] = useState({ hasInvoice: false, netPayable: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvoiceStatus = async () => {
      setLoading(true);
      const status = await checkInvoice(employee._id);
      setInvoiceStatus(status);
      setLoading(false);
    };
    
    loadInvoiceStatus();
  }, [employee._id, checkInvoice]);

  if (loading) {
    return (
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-gray-100 rounded-full animate-pulse"></div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
              {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900">{employee.name}</h3>
          <p className="text-sm text-gray-500">
            {employee.position} • {employee.department}
          </p>
          <p className="text-xs text-gray-400">ID: {employee.employeeId}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className={`text-lg font-semibold ${invoiceStatus.hasInvoice ? 'text-green-600' : 'text-gray-400'}`}>
            ₹{invoiceStatus.netPayable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-gray-500">Net Payable</p>
          {!invoiceStatus.hasInvoice && (
            <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs mt-1">
              No Invoice
            </Badge>
          )}
          {invoiceStatus.hasInvoice && (
            <Badge variant="outline" className="text-green-600 border-green-600 text-xs mt-1">
              Ready to Pay
            </Badge>
          )}
        </div>
        
        <Button
          onClick={() => onPayNow(employee)}
          disabled={processingPayments.has(employee._id) || !invoiceStatus.hasInvoice}
          className={`${
            !invoiceStatus.hasInvoice
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
          } text-white`}
          title={!invoiceStatus.hasInvoice ? 'No invoice found. Please generate an invoice first.' : ''}
        >
          {processingPayments.has(employee._id) ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Banknote className="h-4 w-4 mr-2" />
              Pay Now
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SalaryPaymentPage;