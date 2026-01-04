import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { useAuth } from '../hooks/useAuth';

export function AuthTestPage() {
  const { user, isAuthenticated, loading, login, register, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError('');

    try {
      if (isRegistering) {
        await register({ email, password, displayName });
      } else {
        await login({ email, password });
      }
    } catch (error: any) {
      setError(error.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error: any) {
      setError(error.message || 'Logout failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-black dark:to-blue-900/10 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Firebase Status */}
        <Card>
          <CardHeader>
            <CardTitle>🔥 Firebase Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Status:</strong> {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
              </div>
              <div>
                <strong>Loading:</strong> {loading ? '⏳ Yes' : '✅ No'}
              </div>
              {user && (
                <>
                  <div>
                    <strong>User ID:</strong> {user.uid}
                  </div>
                  <div>
                    <strong>Email:</strong> {user.email}
                  </div>
                  <div>
                    <strong>Name:</strong> {user.name || 'Not set'}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Authentication Form */}
        {!isAuthenticated ? (
          <Card>
            <CardHeader>
              <CardTitle>
                {isRegistering ? 'Create Account' : 'Sign In'}
              </CardTitle>
              <CardDescription>
                {isRegistering ? 'Register a new account' : 'Sign in to your account'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuth} className="space-y-4">
                {isRegistering && (
                  <Input
                    label="Display Name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                )}
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={authLoading}
                  className="w-full"
                >
                  {authLoading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign In')}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="w-full"
                >
                  {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {user?.name || user?.email}!</CardTitle>
              <CardDescription>
                You are successfully authenticated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-400">
                  ✅ Firebase Authentication is working correctly!
                </p>
              </div>
              
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full"
              >
                Sign Out
              </Button>

              <Button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Test Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => {
                setEmail('test@example.com');
                setPassword('test123456');
                setDisplayName('Test User');
                setIsRegistering(true);
              }}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Fill Test Registration
            </Button>
            <Button
              onClick={() => {
                setEmail('test@example.com');
                setPassword('test123456');
                setIsRegistering(false);
              }}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Fill Test Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}