const express = require('express');
const { body, validationResult, query } = require('express-validator');
const PayrollRecord = require('../models/PayrollRecord');
const Employee = require('../models/Employee');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/payroll
// @desc    Get payroll records with filtering by month/year
// @access  Private
router.get('/', auth, [
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  query('year').optional().isInt({ min: 2020, max: 2030 }).withMessage('Year must be between 2020 and 2030'),
  query('employee').optional().isMongoId().withMessage('Invalid employee ID'),
  query('status').optional().isIn(['draft', 'approved', 'paid', 'cancelled', 'no-invoice']).withMessage('Invalid status'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { month, year, employee } = req.query;

    let payrollRecords = [];
    let total = 0;

    // Build filter object for queries
    const filter = {};
    
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);
    if (employee) filter.employee = employee;

    payrollRecords = await PayrollRecord.find(filter)
      .populate('employee', 'name email employeeId department position category')
      .populate('createdBy', 'name email')
      .sort({ year: -1, month: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    total = await PayrollRecord.countDocuments(filter);

    // Calculate summary statistics
    const summary = {
      totalRecords: total,
      totalAmount: payrollRecords.reduce((sum, record) => sum + (record.netPayableSalary || 0), 0),
      averageAmount: total > 0 ? payrollRecords.reduce((sum, record) => sum + (record.netPayableSalary || 0), 0) / total : 0,
      processedCount: payrollRecords.filter(record => record.isProcessed).length,
      unprocessedCount: payrollRecords.filter(record => !record.isProcessed).length
    };

    res.json({
      payrollRecords,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      summary: summary[0] || {
        totalRecords: 0,
        totalPayable: 0,
        averageSalary: 0,
        draftCount: 0,
        approvedCount: 0,
        paidCount: 0
      }
    });
  } catch (error) {
    console.error('Get payroll records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/payroll/:id
// @desc    Get single payroll record
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const payrollRecord = await PayrollRecord.findById(req.params.id)
      .populate('employee', 'name email employeeId department position baseSalary')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');
    
    if (!payrollRecord) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    res.json(payrollRecord);
  } catch (error) {
    console.error('Get payroll record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/payroll
// @desc    Create new payroll record
// @access  Private
router.post('/', auth, [
  body('employee').isMongoId().withMessage('Valid employee ID is required'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year').isInt({ min: 2020, max: 2030 }).withMessage('Year must be between 2020 and 2030'),
  body('payrollDate').isISO8601().withMessage('Valid payroll date is required'),
  body('totalDays').isInt({ min: 0, max: 31 }).withMessage('Total days must be between 0 and 31'),
  body('baseSalary').isNumeric().withMessage('Base salary must be a number'),
  body('netPayableSalary').isNumeric().withMessage('Net payable salary must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      employee,
      month,
      year,
      payrollDate,
      totalDays,
      halfDays = 0,
      leaveDays = 0,
      overtimeHours = 0,
      baseSalary,
      efficiencyAdjustment = 0,
      overtimePay = 0,
      bonus = 0,
      netPayableSalary,
      notes
    } = req.body;

    // Check if employee exists
    const employeeDoc = await Employee.findById(employee);
    if (!employeeDoc) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if payroll record already exists for this employee and month/year
    const existingRecord = await PayrollRecord.findOne({
      employee,
      month,
      year
    });

    if (existingRecord) {
      return res.status(400).json({ 
        message: 'Payroll record already exists for this employee and month/year' 
      });
    }

    // Calculate derived fields
    const perDaySalary = baseSalary / 30;
    const netDaysWorked = totalDays + (0.5 * halfDays);
    const halfDayDeduction = (perDaySalary / 2) * halfDays;
    const unpaidLeaveDeduction = perDaySalary * leaveDays;
    const grossSalary = (baseSalary / 30) * netDaysWorked;

    const payrollRecord = new PayrollRecord({
      employee,
      month,
      year,
      payrollDate,
      totalDays,
      halfDays,
      leaveDays,
      overtimeHours,
      baseSalary,
      perDaySalary,
      grossSalary,
      halfDayDeduction,
      unpaidLeaveDeduction,
      efficiencyAdjustment,
      overtimePay,
      bonus,
      netPayableSalary,
      notes,
      createdBy: req.user.isGuest ? null : req.user._id,
      createdByGuest: req.user.isGuest || false
    });

    await payrollRecord.save();

    const populatedRecord = await PayrollRecord.findById(payrollRecord._id)
      .populate('employee', 'name email employeeId department position category')
      .populate('createdBy', 'name email');

    res.status(201).json(populatedRecord);
  } catch (error) {
    console.error('Create payroll record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/payroll/:id
// @desc    Update payroll record
// @access  Private
router.put('/:id', auth, [
  body('totalDays').optional().isInt({ min: 0, max: 31 }).withMessage('Total days must be between 0 and 31'),
  body('baseSalary').optional().isNumeric().withMessage('Base salary must be a number'),
  body('netPayableSalary').optional().isNumeric().withMessage('Net payable salary must be a number'),
  body('isProcessed').optional().isBoolean().withMessage('isProcessed must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const payrollRecord = await PayrollRecord.findById(req.params.id);
    if (!payrollRecord) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    // Update processed status
    if (req.body.isProcessed === true) {
      req.body.processedAt = new Date();
    }

    const updatedRecord = await PayrollRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('employee', 'name email employeeId department position category')
     .populate('createdBy', 'name email');

    res.json(updatedRecord);
  } catch (error) {
    console.error('Update payroll record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/payroll/:id
// @desc    Delete payroll record
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const payrollRecord = await PayrollRecord.findById(req.params.id);
    if (!payrollRecord) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    // Only allow deletion of draft records
    if (payrollRecord.status !== 'draft') {
      return res.status(400).json({ 
        message: 'Only draft records can be deleted' 
      });
    }

    await PayrollRecord.findByIdAndDelete(req.params.id);
    res.json({ message: 'Payroll record deleted successfully' });
  } catch (error) {
    console.error('Delete payroll record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/payroll/analytics/summary
// @desc    Get payroll analytics summary
// @access  Private
router.get('/analytics/summary', auth, [
  query('year').optional().isInt({ min: 2020, max: 2030 }).withMessage('Year must be between 2020 and 2030')
], async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    
    const analytics = await PayrollRecord.aggregate([
      { $match: { year } },
      {
        $group: {
          _id: '$month',
          totalPayable: { $sum: '$netPayableSalary' },
          averageSalary: { $avg: '$netPayableSalary' },
          recordCount: { $sum: 1 },
          paidCount: {
            $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const yearlyTotal = await PayrollRecord.aggregate([
      { $match: { year } },
      {
        $group: {
          _id: null,
          totalPayable: { $sum: '$netPayableSalary' },
          totalRecords: { $sum: 1 },
          averageSalary: { $avg: '$netPayableSalary' }
        }
      }
    ]);

    res.json({
      monthlyData: analytics,
      yearlyTotal: yearlyTotal[0] || { totalPayable: 0, totalRecords: 0, averageSalary: 0 }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

