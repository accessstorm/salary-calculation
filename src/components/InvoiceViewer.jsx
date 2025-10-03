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
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintHTML();
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleDownload = () => {
    const printContent = generatePrintHTML();
    const blob = new Blob([printContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${employee.name}-${invoice.month}-${invoice.year}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const generatePrintHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Salary Invoice - ${employee.name}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 20px;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border: 1px solid #ddd;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #6b7280;
            font-size: 14px;
        }
        
        .invoice-date {
            background: #f3f4f6;
            padding: 10px;
            border-radius: 5px;
            margin: 20px 0;
            text-align: center;
            font-weight: 500;
        }
        
        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .section {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
        }
        
        .section h3 {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        
        .section h3::before {
            content: "📋";
            margin-right: 8px;
        }
        
        .section.calculation h3::before {
            content: "🧮";
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 5px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .detail-row:last-child {
            border-bottom: none;
        }
        
        .detail-label {
            color: #6b7280;
            font-weight: 500;
        }
        
        .detail-value {
            font-weight: 600;
            color: #1f2937;
        }
        
        .status-badge {
            background: #dcfce7;
            color: #166534;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .status-badge.approved {
            background: #dbeafe;
            color: #1e40af;
        }
        
        .status-badge.draft {
            background: #fef3c7;
            color: #92400e;
        }
        
        .calculations {
            background: #f0f9ff;
            padding: 25px;
            border-radius: 8px;
            border: 1px solid #bae6fd;
            margin-bottom: 30px;
        }
        
        .calculations h3 {
            color: #0c4a6e;
            margin-bottom: 20px;
        }
        
        .calculation-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .calc-item {
            background: white;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #e0f2fe;
        }
        
        .calc-label {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 5px;
        }
        
        .calc-value {
            font-size: 16px;
            font-weight: 600;
        }
        
        .earnings, .deductions {
            margin: 20px 0;
        }
        
        .earnings h4, .deductions h4 {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 15px;
            padding: 10px;
            border-radius: 5px;
        }
        
        .earnings h4 {
            background: #dcfce7;
            color: #166534;
        }
        
        .deductions h4 {
            background: #fee2e2;
            color: #dc2626;
        }
        
        .earnings .detail-row .detail-value {
            color: #166534;
        }
        
        .deductions .detail-row .detail-value {
            color: #dc2626;
        }
        
        .net-payable {
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            color: white;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            margin: 30px 0;
        }
        
        .net-payable .label {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .net-payable .amount {
            font-size: 32px;
            font-weight: bold;
        }
        
        .notes {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .notes h3 {
            color: #374151;
            margin-bottom: 10px;
        }
        
        .notes p {
            color: #6b7280;
            font-style: italic;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
        }
        
        @media print {
            body {
                padding: 0;
            }
            
            .invoice-container {
                border: none;
                padding: 0;
                max-width: none;
            }
            
            .no-print {
                display: none !important;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <h1>SALARY INVOICE</h1>
            <p>Payroll Management System</p>
            <div class="invoice-date">
                Invoice Date: ${formatDate(invoice.payrollDate)}
            </div>
        </div>

        <div class="details-grid">
            <div class="section">
                <h3>Employee Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${employee.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Employee ID:</span>
                    <span class="detail-value">${employee.employeeId}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${employee.email}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Department:</span>
                    <span class="detail-value">${employee.department}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Position:</span>
                    <span class="detail-value">${employee.position}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Hire Date:</span>
                    <span class="detail-value">${formatDate(employee.hireDate)}</span>
                </div>
            </div>

            <div class="section">
                <h3>Salary Period</h3>
                <div class="detail-row">
                    <span class="detail-label">Month:</span>
                    <span class="detail-value">${new Date(invoice.year, invoice.month - 1).toLocaleString('default', { month: 'long' })}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Year:</span>
                    <span class="detail-value">${invoice.year}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payroll Date:</span>
                    <span class="detail-value">${formatDate(invoice.payrollDate)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">
                        <span class="status-badge ${invoice.status || 'draft'}">${(invoice.status || 'draft').toUpperCase()}</span>
                    </span>
                </div>
            </div>
        </div>

        <div class="calculations">
            <h3>Salary Calculations</h3>
            
            <div class="calculation-grid">
                <div class="calc-item">
                    <div class="calc-label">Base Salary</div>
                    <div class="calc-value">₹${invoice.baseSalary?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                </div>
                <div class="calc-item">
                    <div class="calc-label">Per Day Salary</div>
                    <div class="calc-value">₹${invoice.perDaySalary?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                </div>
                <div class="calc-item">
                    <div class="calc-label">Total Days Worked</div>
                    <div class="calc-value">${invoice.totalDays}</div>
                </div>
                <div class="calc-item">
                    <div class="calc-label">Half Days</div>
                    <div class="calc-value">${invoice.halfDays || 0}</div>
                </div>
                <div class="calc-item">
                    <div class="calc-label">Leave Days</div>
                    <div class="calc-value">${invoice.leaveDays || 0}</div>
                </div>
                <div class="calc-item">
                    <div class="calc-label">Overtime Hours</div>
                    <div class="calc-value">${invoice.overtimeHours || 0}</div>
                </div>
            </div>

            <div class="earnings">
                <h4>Earnings</h4>
                <div class="detail-row">
                    <span class="detail-label">Gross Salary (Days × Per Day):</span>
                    <span class="detail-value">₹${invoice.grossSalary?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                ${invoice.overtimePay > 0 ? `
                <div class="detail-row">
                    <span class="detail-label">Overtime Pay:</span>
                    <span class="detail-value">₹${invoice.overtimePay?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                ` : ''}
                ${invoice.bonus > 0 ? `
                <div class="detail-row">
                    <span class="detail-label">Bonus:</span>
                    <span class="detail-value">₹${invoice.bonus?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                ` : ''}
                ${invoice.efficiencyAdjustment > 0 ? `
                <div class="detail-row">
                    <span class="detail-label">Efficiency Bonus:</span>
                    <span class="detail-value">₹${invoice.efficiencyAdjustment?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                ` : ''}
            </div>

            <div class="deductions">
                <h4>Deductions</h4>
                ${invoice.halfDayDeduction > 0 ? `
                <div class="detail-row">
                    <span class="detail-label">Half Day Deduction:</span>
                    <span class="detail-value">₹${invoice.halfDayDeduction?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                ` : ''}
                ${invoice.unpaidLeaveDeduction > 0 ? `
                <div class="detail-row">
                    <span class="detail-label">Unpaid Leave Deduction:</span>
                    <span class="detail-value">₹${invoice.unpaidLeaveDeduction?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                ` : ''}
                ${invoice.efficiencyAdjustment < 0 ? `
                <div class="detail-row">
                    <span class="detail-label">Efficiency Deduction:</span>
                    <span class="detail-value">₹${Math.abs(invoice.efficiencyAdjustment)?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                ` : ''}
            </div>

            <div class="net-payable">
                <div class="label">Net Payable Salary</div>
                <div class="amount">₹${invoice.netPayableSalary?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
            </div>
        </div>

        ${invoice.notes ? `
        <div class="notes">
            <h3>Notes</h3>
            <p>${invoice.notes}</p>
        </div>
        ` : ''}

        <div class="footer">
            <p>This is a computer-generated invoice. No signature required.</p>
            <p>Generated on ${formatDate(new Date().toISOString())}</p>
        </div>
    </div>
</body>
</html>`;
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
            <div className="flex space-x-2 no-print">
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
