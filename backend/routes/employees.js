const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Employee = require('../models/Employee');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/employees
// @desc    Get all employees with search and pagination
// @access  Private
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim(),
  query('department').optional().trim(),
  query('isActive').optional().isBoolean().withMessage('isActive must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search, department, isActive } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department) {
      filter.department = { $regex: department, $options: 'i' };
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const employees = await Employee.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Employee.countDocuments(filter);

    res.json({
      employees,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalEmployees: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/employees/:id
// @desc    Get single employee
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/employees
// @desc    Create new employee
// @access  Private
router.post('/', auth, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('position').trim().notEmpty().withMessage('Position is required'),
  body('baseSalary').isNumeric().withMessage('Base salary must be a number'),
  body('hireDate').isISO8601().withMessage('Valid hire date is required'),
  body('category').optional().isIn(['active', 'inactive', 'on-leave', 'terminated']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, employeeId, department, position, baseSalary, hireDate, category = 'active' } = req.body;

    // Check if employee ID already exists
    const existingEmployee = await Employee.findOne({ 
      $or: [{ email }, { employeeId }] 
    });
    
    if (existingEmployee) {
      return res.status(400).json({ 
        message: 'Employee with this email or ID already exists' 
      });
    }

    const employee = new Employee({
      name,
      email,
      employeeId,
      department,
      position,
      baseSalary,
      hireDate,
      category,
      createdBy: req.user.isGuest ? null : req.user._id,
      createdByGuest: req.user.isGuest || false
    });

    await employee.save();

    res.status(201).json(employee);
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/employees/:id
// @desc    Update employee
// @access  Private
router.put('/:id', auth, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('department').optional().trim().notEmpty().withMessage('Department cannot be empty'),
  body('position').optional().trim().notEmpty().withMessage('Position cannot be empty'),
  body('baseSalary').optional().isNumeric().withMessage('Base salary must be a number'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if email is being changed and if it already exists
    if (req.body.email && req.body.email !== employee.email) {
      const existingEmployee = await Employee.findOne({ 
        email: req.body.email,
        _id: { $ne: req.params.id }
      });
      
      if (existingEmployee) {
        return res.status(400).json({ 
          message: 'Employee with this email already exists' 
        });
      }
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedEmployee);
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete employee
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

