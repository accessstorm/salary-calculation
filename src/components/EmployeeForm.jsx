import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { X, User, Mail, Hash, Building, Briefcase, DollarSign, Calendar } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const EmployeeForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingEmployee = null,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    name: editingEmployee?.name || '',
    email: editingEmployee?.email || '',
    employeeId: editingEmployee?.employeeId || '',
    department: editingEmployee?.department || '',
    position: editingEmployee?.position || '',
    baseSalary: editingEmployee?.baseSalary || '',
    hireDate: editingEmployee?.hireDate ? new Date(editingEmployee.hireDate).toISOString().split('T')[0] : ''
  });
  const [errors, setErrors] = useState({});

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

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }

    if (!formData.baseSalary || formData.baseSalary <= 0) {
      newErrors.baseSalary = 'Base salary must be greater than 0';
    }

    if (!formData.hireDate) {
      newErrors.hireDate = 'Hire date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }

    console.log('Calling onSubmit with:', formData);
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </CardTitle>
              <CardDescription>
                {editingEmployee ? 'Update employee information' : 'Enter employee details to add them to the system'}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Enter full name"
                      disabled={loading}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Enter email address"
                      disabled={loading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Employee ID */}
                <div className="space-y-2">
                  <label htmlFor="employeeId" className="text-sm font-medium">
                    Employee ID *
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="employeeId"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Enter employee ID"
                      disabled={loading}
                    />
                  </div>
                  {errors.employeeId && (
                    <p className="text-sm text-red-600">{errors.employeeId}</p>
                  )}
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <label htmlFor="department" className="text-sm font-medium">
                    Department *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Enter department"
                      disabled={loading}
                    />
                  </div>
                  {errors.department && (
                    <p className="text-sm text-red-600">{errors.department}</p>
                  )}
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <label htmlFor="position" className="text-sm font-medium">
                    Position *
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Enter position"
                      disabled={loading}
                    />
                  </div>
                  {errors.position && (
                    <p className="text-sm text-red-600">{errors.position}</p>
                  )}
                </div>

                {/* Base Salary */}
                <div className="space-y-2">
                  <label htmlFor="baseSalary" className="text-sm font-medium">
                    Base Salary (₹) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="baseSalary"
                      name="baseSalary"
                      type="number"
                      value={formData.baseSalary}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Enter base salary"
                      min="0"
                      step="0.01"
                      disabled={loading}
                    />
                  </div>
                  {errors.baseSalary && (
                    <p className="text-sm text-red-600">{errors.baseSalary}</p>
                  )}
                </div>

                {/* Hire Date */}
                <div className="space-y-2">
                  <label htmlFor="hireDate" className="text-sm font-medium">
                    Hire Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="hireDate"
                      name="hireDate"
                      type="date"
                      value={formData.hireDate}
                      onChange={handleChange}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                  {errors.hireDate && (
                    <p className="text-sm text-red-600">{errors.hireDate}</p>
                  )}
                </div>
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
                      {editingEmployee ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    editingEmployee ? 'Update Employee' : 'Add Employee'
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

export default EmployeeForm;
