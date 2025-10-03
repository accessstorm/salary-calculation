const mongoose = require('mongoose');

const payrollRecordSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true,
    min: 2020,
    max: 2030
  },
  payrollDate: {
    type: Date,
    required: true
  },
  // Work details
  totalDays: {
    type: Number,
    required: true,
    min: 0,
    max: 31
  },
  halfDays: {
    type: Number,
    default: 0,
    min: 0
  },
  leaveDays: {
    type: Number,
    default: 0,
    min: 0
  },
  overtimeHours: {
    type: Number,
    default: 0,
    min: 0
  },
  // Salary calculations
  baseSalary: {
    type: Number,
    required: true,
    min: 0
  },
  perDaySalary: {
    type: Number,
    required: true,
    min: 0
  },
  grossSalary: {
    type: Number,
    required: true,
    min: 0
  },
  // Deductions
  halfDayDeduction: {
    type: Number,
    default: 0,
    min: 0
  },
  unpaidLeaveDeduction: {
    type: Number,
    default: 0,
    min: 0
  },
  // Adjustments
  efficiencyAdjustment: {
    type: Number,
    default: 0
  },
  overtimePay: {
    type: Number,
    default: 0,
    min: 0
  },
  bonus: {
    type: Number,
    default: 0,
    min: 0
  },
  // Final calculations
  netPayableSalary: {
    type: Number,
    required: true
  },
  // Status
  status: {
    type: String,
    enum: ['draft', 'approved', 'paid', 'cancelled'],
    default: 'draft'
  },
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  paidAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
payrollRecordSchema.index({ employee: 1, month: 1, year: 1 });
payrollRecordSchema.index({ month: 1, year: 1 });
payrollRecordSchema.index({ status: 1 });

// Virtual for month-year string
payrollRecordSchema.virtual('monthYear').get(function() {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[this.month - 1]} ${this.year}`;
});

// Ensure virtual fields are serialized
payrollRecordSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('PayrollRecord', payrollRecordSchema);

