import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { X, FileText, Download, Calendar, User, Building, DollarSign, Calculator } from 'lucide-react';

const InvoiceViewer = ({ 
  isOpen, 
  onClose, 
  invoice,
  employee 
}) => {
  if (!isOpen || !invoice || !employee) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.getElementById('invoice-content');
    const html = element.innerHTML;
    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${employee.name}-${invoice.month}-${invoice.year}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Salary Invoice - {employee.name}
              </CardTitle>
              <CardDescription>
                Invoice for {new Date(invoice.year, invoice.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
              >
                <Download className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div id="invoice-content" className="space-y-6">
              {/* Invoice Header */}
              <div className="text-center border-b pb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">SALARY INVOICE</h1>
                <p className="text-gray-600">Payroll Management System</p>
                <p className="text-sm text-gray-500 mt-2">
                  Invoice Date: {formatDate(invoice.payrollDate)}
                </p>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Employee Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{employee.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Employee ID:</span>
                      <span className="font-medium">{employee.employeeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{employee.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium">{employee.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Position:</span>
                      <span className="font-medium">{employee.position}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hire Date:</span>
                      <span className="font-medium">{formatDate(employee.hireDate)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Salary Period
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Month:</span>
                      <span className="font-medium">
                        {new Date(invoice.year, invoice.month - 1).toLocaleString('default', { month: 'long' })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year:</span>
                      <span className="font-medium">{invoice.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payroll Date:</span>
                      <span className="font-medium">{formatDate(invoice.payrollDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium px-2 py-1 rounded text-xs ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.status?.toUpperCase() || 'DRAFT'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Salary Calculations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Salary Calculations
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    {/* Basic Salary Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base Salary:</span>
                        <span className="font-medium">₹{invoice.baseSalary?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Per Day Salary:</span>
                        <span className="font-medium">₹{invoice.perDaySalary?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Days Worked:</span>
                        <span className="font-medium">{invoice.totalDays}</span>
                      </div>
                    </div>

                    {/* Work Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Half Days:</span>
                        <span className="font-medium">{invoice.halfDays || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Leave Days:</span>
                        <span className="font-medium">{invoice.leaveDays || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Overtime Hours:</span>
                        <span className="font-medium">{invoice.overtimeHours || 0}</span>
                      </div>
                    </div>

                    {/* Earnings */}
                    <div className="border-t pt-3">
                      <h4 className="font-semibold text-green-700 mb-2">Earnings</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Gross Salary (Days × Per Day):</span>
                          <span className="font-medium text-green-700">
                            ₹{invoice.grossSalary?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        {invoice.overtimePay > 0 && (
                          <div className="flex justify-between">
                            <span>Overtime Pay:</span>
                            <span className="font-medium text-green-700">
                              ₹{invoice.overtimePay?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                        {invoice.bonus > 0 && (
                          <div className="flex justify-between">
                            <span>Bonus:</span>
                            <span className="font-medium text-green-700">
                              ₹{invoice.bonus?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                        {invoice.efficiencyAdjustment > 0 && (
                          <div className="flex justify-between">
                            <span>Efficiency Bonus:</span>
                            <span className="font-medium text-green-700">
                              ₹{invoice.efficiencyAdjustment?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Deductions */}
                    <div className="border-t pt-3">
                      <h4 className="font-semibold text-red-700 mb-2">Deductions</h4>
                      <div className="space-y-2 text-sm">
                        {invoice.halfDayDeduction > 0 && (
                          <div className="flex justify-between">
                            <span>Half Day Deduction:</span>
                            <span className="font-medium text-red-700">
                              ₹{invoice.halfDayDeduction?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                        {invoice.unpaidLeaveDeduction > 0 && (
                          <div className="flex justify-between">
                            <span>Unpaid Leave Deduction:</span>
                            <span className="font-medium text-red-700">
                              ₹{invoice.unpaidLeaveDeduction?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                        {invoice.efficiencyAdjustment < 0 && (
                          <div className="flex justify-between">
                            <span>Efficiency Deduction:</span>
                            <span className="font-medium text-red-700">
                              ₹{Math.abs(invoice.efficiencyAdjustment)?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Net Payable */}
                    <div className="border-t pt-3 bg-blue-50 p-3 rounded">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-blue-900">Net Payable Salary:</span>
                        <span className="text-2xl font-bold text-blue-900">
                          ₹{invoice.netPayableSalary?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {invoice.notes}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="border-t pt-6 text-center text-sm text-gray-500">
                <p>This is a computer-generated invoice. No signature required.</p>
                <p className="mt-1">Generated on {formatDate(new Date().toISOString())}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceViewer;
