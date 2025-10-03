import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ToastProvider';
import { useAuth } from './contexts/AuthContext';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import EnhancedPayrollDashboard from './components/EnhancedPayrollDashboard';
import { User } from 'lucide-react';

const AppContent = () => {
  const { isAuthenticated, loading, loginAsGuest } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to Payroll System</CardTitle>
            <CardDescription>
              Access the payroll management system as a guest user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              You can explore the payroll system without creating an account. 
              All data will be stored locally and will not be saved to the server.
            </p>
            <Button
              onClick={loginAsGuest}
              className="w-full"
              size="lg"
            >
              Continue as Guest User
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <EnhancedPayrollDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App
