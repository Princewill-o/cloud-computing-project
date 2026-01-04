// Firebase Authentication Debug Script
// Run this in the browser console to debug Firebase auth issues

console.log('🔍 Firebase Authentication Debug Script');
console.log('=====================================');

// Check if Firebase is loaded
if (typeof firebase !== 'undefined') {
    console.log('✅ Firebase SDK loaded (v8 compat)');
} else if (typeof window.firebase !== 'undefined') {
    console.log('✅ Firebase SDK loaded on window');
} else {
    console.log('❌ Firebase SDK not found');
}

// Test Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDowurbYQjV55Ox-Gid8JzpgrkfugU51U8",
    authDomain: "cloudproject-22b3b.firebaseapp.com",
    projectId: "cloudproject-22b3b",
    storageBucket: "cloudproject-22b3b.firebasestorage.app",
    messagingSenderId: "39239274386",
    appId: "1:39239274386:web:593da94b50acc985c67b4b",
    measurementId: "G-WZ8GJHXJSY"
};

console.log('🔧 Firebase Configuration:');
console.log(firebaseConfig);

// Test API key validity
async function testApiKey() {
    try {
        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'test123',
                returnSecureToken: true
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ API Key is valid');
            return true;
        } else {
            console.log('❌ API Key test failed:', data);
            return false;
        }
    } catch (error) {
        console.log('❌ API Key test error:', error);
        return false;
    }
}

// Test auth domain
async function testAuthDomain() {
    try {
        const response = await fetch(`https://${firebaseConfig.authDomain}/__/auth/handler`);
        console.log('✅ Auth domain is accessible');
        return true;
    } catch (error) {
        console.log('❌ Auth domain test failed:', error);
        return false;
    }
}

// Test project ID
async function testProjectId() {
    try {
        const response = await fetch(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`);
        if (response.status === 401 || response.status === 403) {
            console.log('✅ Project ID is valid (authentication required)');
            return true;
        } else if (response.ok) {
            console.log('✅ Project ID is valid and accessible');
            return true;
        } else {
            console.log('❌ Project ID test failed:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Project ID test error:', error);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('\n🧪 Running Firebase Configuration Tests...\n');
    
    const apiKeyValid = await testApiKey();
    const authDomainValid = await testAuthDomain();
    const projectIdValid = await testProjectId();
    
    console.log('\n📊 Test Results:');
    console.log('================');
    console.log(`API Key: ${apiKeyValid ? '✅' : '❌'}`);
    console.log(`Auth Domain: ${authDomainValid ? '✅' : '❌'}`);
    console.log(`Project ID: ${projectIdValid ? '✅' : '❌'}`);
    
    if (apiKeyValid && authDomainValid && projectIdValid) {
        console.log('\n🎉 All tests passed! Firebase configuration appears to be correct.');
        console.log('If you\'re still having issues, check:');
        console.log('1. Firebase Authentication is enabled in the console');
        console.log('2. Email/Password sign-in method is enabled');
        console.log('3. Authorized domains include your current domain');
    } else {
        console.log('\n⚠️ Some tests failed. Please check your Firebase configuration.');
    }
}

// Export for manual testing
window.debugFirebase = {
    testApiKey,
    testAuthDomain,
    testProjectId,
    runAllTests,
    config: firebaseConfig
};

console.log('\n🚀 Debug functions available on window.debugFirebase');
console.log('Run window.debugFirebase.runAllTests() to test configuration');

// Auto-run tests
runAllTests();