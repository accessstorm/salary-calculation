const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Employee email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true
  },
  baseSalary: {
    type: Number,
    required: [true, 'Base salary is required'],
    min: 0
  },
  hireDate: {
    type: Date,
    required: [true, 'Hire date is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['active', 'inactive', 'on-leave', 'terminated'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  createdByGuest: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema);

