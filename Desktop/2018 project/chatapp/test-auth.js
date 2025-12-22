const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testAuth() {
  try {
    console.log('🧪 Testing Authentication...\n');

    // Test Registration
    console.log('1. Testing Registration...');
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('✅ Registration successful:', registerResponse.data.message);
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️ User already exists, continuing with login test...');
      } else {
        console.log('❌ Registration failed:', error.response?.data?.message || error.message);
        return;
      }
    }

    // Test Login
    console.log('\n2. Testing Login...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('✅ Login successful:', loginResponse.data.message);
      console.log('📝 User data:', loginResponse.data.data.user);
      
      const token = loginResponse.data.data.token;
      console.log('🔑 Token received:', token ? 'Yes' : 'No');

      // Test Profile Access
      console.log('\n3. Testing Profile Access...');
      const profileResponse = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Profile access successful:', profileResponse.data.data.user);

    } catch (error) {
      console.log('❌ Login failed:', error.response?.data?.message || error.message);
      if (error.response?.status === 429) {
        console.log('⚠️ Rate limit hit - this is expected during development');
      }
    }

    console.log('\n🎉 Authentication test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuth();