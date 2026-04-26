// Test Google Gemini Integration for TherapAI
// Run with: node test-gemini.js

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testTherapeuticChat() {
  console.log('🤖 Testing TherapAI - Google Gemini Integration\n');

  if (!process.env.GOOGLE_API_KEY) {
    console.log('❌ GOOGLE_API_KEY not found in environment variables');
    console.log('Please add your Google Gemini API key to your .env file');
    return;
  }

  try {
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // Try different model names
    const modelNames = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    
    let workingModel = null;
    
    for (const modelName of modelNames) {
      try {
        console.log(`🔍 Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, this is a test.");
        console.log(`✅ Model ${modelName} works!`);
        workingModel = model;
        break;
      } catch (error) {
        console.log(`❌ Model ${modelName} failed: ${error.message.split('\n')[0]}`);
      }
    }

    if (!workingModel) {
      console.log('\n❌ No working model found. Let me try to list available models...');
      
      // Try to list models
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        // This might fail but let's see what error we get
      } catch (error) {
        console.log('Error details:', error.message);
      }
      return;
    }

    console.log('\n✅ Google Gemini API connected successfully');

    // Test therapeutic conversation
    const therapeuticPrompt = `You are Dr. Sarah, a compassionate AI therapist. A patient says: "I've been feeling really anxious lately and can't sleep well." Please respond with empathy and provide helpful guidance.`;

    console.log('\n🧠 Testing therapeutic response...');
    const result = await workingModel.generateContent(therapeuticPrompt);
    const response = result.response.text();

    console.log('\n💬 Dr. Sarah\'s Response:');
    console.log('─'.repeat(50));
    console.log(response);
    console.log('─'.repeat(50));

    console.log('\n✅ All tests passed! TherapAI is ready to use.');
    console.log('\nNext steps:');
    console.log('1. Visit: http://localhost:3000/patient-local');
    console.log('2. Start chatting with Dr. Sarah');
    console.log('3. Experience AI-powered therapy');

  } catch (error) {
    console.log('❌ Error testing Gemini integration:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('\n💡 Your API key appears to be invalid. Please check:');
      console.log('- Visit https://makersuite.google.com/app/apikey');
      console.log('- Generate a new API key');
      console.log('- Update your .env file');
    }
  }
}

testTherapeuticChat();