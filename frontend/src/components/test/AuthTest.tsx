import { useState } from 'react';
import { authService } from '../../services/authService';
import { cvService } from '../../services/cvService';

export function AuthTest() {
  const [email, setEmail] = useState('testuser@example.com');
  const [password, setPassword] = useState('TestPass123');
  const [fullName, setFullName] = useState('Test User');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testRegister = async () => {
    setLoading(true);
    try {
      const user = await authService.register({ email, password, full_name: fullName });
      setResult({ success: true, message: 'Registration successful', user });
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    }
    setLoading(false);
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const user = await authService.login({ email, password });
      setResult({ success: true, message: 'Login successful', user });
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    }
    setLoading(false);
  };

  const testCVUpload = async () => {
    setLoading(true);
    try {
      // Create a test file
      const testContent = `John Doe
Software Engineer

Experience:
- 3 years of experience in React and Node.js
- Built multiple web applications
- Strong problem-solving skills

Skills:
- JavaScript, TypeScript
- React, Node.js
- Python, SQL
- Git, Docker

Education:
- Bachelor's in Computer Science`;
      
      const file = new File([testContent], 'test_cv.txt', { type: 'text/plain' });
      const response = await cvService.uploadCV(file, 'paraphrasing');
      setResult({ success: true, message: 'CV upload successful', data: response });
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    }
    setLoading(false);
  };

  const testParaphrase = async () => {
    setLoading(true);
    try {
      const response = await cvService.paraphraseCV({
        job_title: 'Senior Frontend Developer',
        company_name: 'Google',
        job_description: 'We are looking for a senior frontend developer with React experience.'
      });
      setResult({ success: true, message: 'CV paraphrase successful', data: response });
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Authentication & CV Test</h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="space-x-2 mb-6">
        <button
          onClick={testRegister}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Register
        </button>
        <button
          onClick={testLogin}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Login
        </button>
        <button
          onClick={testCVUpload}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test CV Upload
        </button>
        <button
          onClick={testParaphrase}
          disabled={loading}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
        >
          Test Paraphrase
        </button>
      </div>

      {loading && <div className="text-blue-500">Loading...</div>}

      {result && (
        <div className={`p-4 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <h3 className="font-bold">{result.success ? 'Success' : 'Error'}</h3>
          <p>{result.message}</p>
          {result.user && (
            <div className="mt-2">
              <strong>User:</strong> {JSON.stringify(result.user, null, 2)}
            </div>
          )}
          {result.data && (
            <div className="mt-2">
              <strong>Data:</strong>
              <pre className="text-xs mt-1 overflow-auto">{JSON.stringify(result.data, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Current Auth State:</h3>
        <p><strong>Authenticated:</strong> {authService.isAuthenticated() ? 'Yes' : 'No'}</p>
        <p><strong>Current User:</strong> {JSON.stringify(authService.getCurrentUser())}</p>
        <p><strong>Access Token:</strong> {authService.getAccessToken() ? 'Present' : 'None'}</p>
      </div>
    </div>
  );
}