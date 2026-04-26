// List available Gemini models
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  console.log('🔍 Checking Google Gemini API and available models...\n');

  if (!process.env.GOOGLE_API_KEY) {
    console.log('❌ GOOGLE_API_KEY not found in environment variables');
    return;
  }

  console.log('API Key found:', process.env.GOOGLE_API_KEY.substring(0, 10) + '...');

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // Try a simple request first
    console.log('\n🧪 Testing basic API connectivity...');
    
    // Let's try the most basic model name
    const basicModels = [
      'gemini-pro',
      'text-bison-001',
      'chat-bison-001'
    ];

    for (const modelName of basicModels) {
      try {
        console.log(`Testing ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        console.log(`✅ ${modelName} works!`);
        console.log(`Response: ${result.response.text().substring(0, 50)}...`);
        break;
      } catch (error) {
        console.log(`❌ ${modelName}: ${error.message.split('\n')[0]}`);
      }
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
    
    if (error.message.includes('API_KEY_INVALID') || error.message.includes('403')) {
      console.log('\n💡 API Key Issues:');
      console.log('1. Check if your API key is correct');
      console.log('2. Make sure Gemini API is enabled in Google Cloud Console');
      console.log('3. Check if you have billing enabled');
      console.log('4. Try generating a new API key at: https://makersuite.google.com/app/apikey');
    }
  }
}

listModels();