import React from 'react';

export function SimpleTest() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Simple Test Page</h1>
      <p className="mt-4 text-gray-600">If you can see this, React is working!</p>
      <div className="mt-4 p-4 bg-blue-100 rounded">
        <p>This is a test to verify the app is rendering correctly.</p>
      </div>
    </div>
  );
}