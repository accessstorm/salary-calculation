const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');
    const guestUser = localStorage.getItem('guestUser');

    console.log('API Request:', {
      url,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(guestUser && { 'X-Guest-User': 'true' }),
        ...options.headers,
      },
      body: options.body
    });

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(guestUser && { 'X-Guest-User': 'true' }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error response:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Success response:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Note: Authentication endpoints removed - using guest user mode

  // Employee endpoints
  async getEmployees(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/employees${queryString ? `?${queryString}` : ''}`);
  }

  async getEmployee(id) {
    return this.request(`/employees/${id}`);
  }

  async createEmployee(employeeData) {
    console.log('API: Creating employee with data:', employeeData);
    console.log('API: Base URL:', this.baseURL);
    return this.request('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  }

  async updateEmployee(id, employeeData) {
    return this.request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    });
  }

  async deleteEmployee(id) {
    return this.request(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  // Payroll endpoints
  async getPayrollRecords(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/payroll${queryString ? `?${queryString}` : ''}`);
  }

  async getPayrollRecord(id) {
    return this.request(`/payroll/${id}`);
  }

  async createPayrollRecord(payrollData) {
    return this.request('/payroll', {
      method: 'POST',
      body: JSON.stringify(payrollData),
    });
  }

  async updatePayrollRecord(id, payrollData) {
    return this.request(`/payroll/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payrollData),
    });
  }

  async deletePayrollRecord(id) {
    return this.request(`/payroll/${id}`, {
      method: 'DELETE',
    });
  }

  async getPayrollAnalytics(year) {
    return this.request(`/payroll/analytics/summary?year=${year}`);
  }
}

export default new ApiService();

