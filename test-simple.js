// Simple test for Google Gemini API
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testSimple() {
  console.log('🧪 Simple Google Gemini Test\n');
  
  const apiKey = process.env.GOOGLE_API_KEY;
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
  
  if (!apiKey) {
    console.log('❌ No API key found');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try the most basic model names
    const modelsToTry = [
      'gemini-1.5-flash',
      'gemini-1.5-pro', 
      'gemini-pro',
      'text-bison-001'
    ];

    for (const modelName of modelsToTry) {
      console.log(`\n🔍 Testing model: ${modelName}`);
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const prompt = "Say hello";
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        console.log(`✅ SUCCESS with ${modelName}!`);
        console.log(`Response: ${response.substring(0, 100)}...`);
        
        // If we get here, this model works - let's test a therapeutic response
        console.log('\n🧠 Testing therapeutic response...');
        const therapyPrompt = "I'm feeling anxious. Can you help?";
        const therapyResult = await model.generateContent(therapyPrompt);
        const therapyResponse = therapyResult.response.text();
        
        console.log('\n💬 Therapeutic Response:');
        console.log('─'.repeat(50));
        console.log(therapyResponse);
        console.log('─'.repeat(50));
        
        console.log(`\n🎉 Model ${modelName} is working perfectly!`);
        return; // Exit on first success
        
      } catch (error) {
        console.log(`❌ ${modelName} failed: ${error.message.split('\n')[0]}`);
      }
    }
    
    console.log('\n❌ No models worked. This might be an API key issue.');
    
  } catch (error) {
    console.log('❌ General error:', error.message);
  }
}

testSimple();