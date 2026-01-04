import { useState } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';

export function FirebaseAuthTest() {
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('test123456');
  const [displayName, setDisplayName] = useState('Test User');
  const [message, setMessage] = useState('');

  const handleTestLogin = async () => {
    try {
      setMessage('Logging in...');
      await login({ email, password });
      setMessage('Login successful!');
    } catch (error: any) {
      setMessage(`Login failed: ${error.message}`);
    }
  };

  const handleTestRegister = async () => {
    try {
      setMessage('Registering...');
      await register({ email, password, displayName });
      setMessage('Registration successful!');
    } catch (error: any) {
      setMessage(`Registration failed: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      setMessage('Logging out...');
      await logout();
      setMessage('Logout successful!');
    } catch (error: any) {
      setMessage(`Logout failed: ${error.message}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md border p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Firebase Auth Test</h2>
        
        {/* Current Status */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Current Status</h3>
          <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
          {user && (
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p><strong>User ID:</strong> {user.uid}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Display Name:</strong> {user.displayName || 'Not set'}</p>
              <p><strong>Created:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Recently'}</p>
              <p><strong>Last Login:</strong> {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Recently'}</p>
            </div>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">{message}</p>
          </div>
        )}

        {!isAuthenticated ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name:</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleTestLogin}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Test Login
              </button>
              <button
                onClick={handleTestRegister}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Test Register
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">✅ Authentication Successful!</h3>
              <p className="text-sm text-green-700">
                You are successfully logged in as {user?.email}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Logout
              </button>
              <a
                href="/dashboard"
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-center"
              >
                Go to Dashboard
              </a>
              <a
                href="/profile"
                className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium text-center"
              >
                View Profile
              </a>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-2">Quick Links</h3>
          <div className="flex gap-2 text-sm">
            <a href="/" className="text-blue-600 hover:text-blue-700">Dashboard</a>
            <span className="text-gray-400">•</span>
            <a href="/login" className="text-blue-600 hover:text-blue-700">Login Page</a>
            <span className="text-gray-400">•</span>
            <a href="/register" className="text-blue-600 hover:text-blue-700">Register Page</a>
            <span className="text-gray-400">•</span>
            <a href="/simple-test" className="text-blue-600 hover:text-blue-700">Simple Test</a>
          </div>
        </div>
      </div>
    </div>
  );
}