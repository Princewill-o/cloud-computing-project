import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/components/ui/Card";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Simple admin credentials - anyone can use these
  const ADMIN_CREDENTIALS = [
    { username: 'admin', password: 'admin123' },
    { username: 'demo', password: 'demo123' },
    { username: 'test', password: 'test123' },
    { username: 'guest', password: 'guest123' }
  ];

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate a brief loading time for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check credentials
    const isValidCredentials = ADMIN_CREDENTIALS.some(
      cred => cred.username === credentials.username && cred.password === credentials.password
    );

    if (isValidCredentials) {
      // Enable admin mode
      localStorage.setItem('admin_mode', 'true');
      localStorage.setItem('admin_user', credentials.username);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Try: admin/admin123, demo/demo123, test/test123, or guest/guest123');
    }
    
    setIsLoading(false);
  };

  const handleDisableAdmin = () => {
    // Disable admin mode
    localStorage.removeItem('admin_mode');
    localStorage.removeItem('admin_user');
    
    // Redirect to login
    navigate('/login');
  };

  const isAdminMode = localStorage.getItem('admin_mode') === 'true';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-black dark:to-blue-900/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            🧠 AI Career Guide Admin
          </CardTitle>
          <CardDescription>
            Access the AI Career Guidance Platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isAdminMode ? (
            <>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-secondary mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                    className="input-base"
                    placeholder="Enter username"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-secondary mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="input-base"
                    placeholder="Enter password"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                )}

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? 'Logging in...' : 'Login to Dashboard'}
                </Button>
              </form>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-medium text-blue-800 dark:text-blue-400 mb-2">
                  Demo Credentials:
                </h3>
                <div className="text-sm text-blue-700 dark:text-blue-500 space-y-1">
                  <div>• <code>admin</code> / <code>admin123</code></div>
                  <div>• <code>demo</code> / <code>demo123</code></div>
                  <div>• <code>test</code> / <code>test123</code></div>
                  <div>• <code>guest</code> / <code>guest123</code></div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 mb-4">
                  Logged in as: {localStorage.getItem('admin_user')}
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Go to Dashboard
                </Button>
                <Button 
                  onClick={handleDisableAdmin}
                  variant="outline"
                  className="w-full"
                >
                  Logout
                </Button>
              </div>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-secondary hover:text-primary transition-colors"
            >
              ← Back to Regular Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}