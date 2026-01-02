import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/components/ui/Card";

export function AdminLoginPage() {
  const navigate = useNavigate();

  const handleAdminLogin = () => {
    // Enable admin mode
    localStorage.setItem('admin_mode', 'true');
    
    // Redirect to dashboard
    navigate('/dashboard');
  };

  const handleDisableAdmin = () => {
    // Disable admin mode
    localStorage.removeItem('admin_mode');
    
    // Redirect to login
    navigate('/login');
  };

  const isAdminMode = localStorage.getItem('admin_mode') === 'true';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-black dark:to-blue-900/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            🔧 Admin Access
          </CardTitle>
          <CardDescription>
            Direct access to the CV Paraphrasing Platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 mb-4">
              {isAdminMode ? "Admin Mode: Enabled" : "Admin Mode: Disabled"}
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h3 className="font-medium text-yellow-800 dark:text-yellow-400 mb-2">
                Admin Features:
              </h3>
              <ul className="text-sm text-yellow-700 dark:text-yellow-500 space-y-1">
                <li>• Bypass Firebase authentication</li>
                <li>• Direct dashboard access</li>
                <li>• Full CV paraphrasing functionality</li>
                <li>• All platform features enabled</li>
              </ul>
            </div>

            {!isAdminMode ? (
              <Button 
                onClick={handleAdminLogin}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Enable Admin Mode & Enter Dashboard
              </Button>
            ) : (
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
                  Disable Admin Mode
                </Button>
              </div>
            )}
          </div>

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