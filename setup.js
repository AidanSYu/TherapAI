#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🤖 TherapAI Setup - Google Gemini Integration\n');

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  try {
    console.log('Setting up your TherapAI therapeutic chatbot...\n');

    // Check if .env already exists
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const overwrite = await question('.env file already exists. Overwrite? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Setup cancelled. You can manually edit your .env file.');
        rl.close();
        return;
      }
    }

    // Collect configuration
    console.log('📝 Please provide your configuration details:\n');

    const googleApiKey = await question('Google Gemini API Key (required): ');
    if (!googleApiKey.trim()) {
      console.log('❌ Google Gemini API Key is required. Get one at: https://makersuite.google.com/app/apikey');
      rl.close();
      return;
    }

    const supabaseUrl = await question('Supabase URL (required): ');
    const supabaseAnonKey = await question('Supabase Anon Key (required): ');
    const supabaseServiceKey = await question('Supabase Service Role Key (required): ');

    if (!supabaseUrl.trim() || !supabaseAnonKey.trim() || !supabaseServiceKey.trim()) {
      console.log('❌ All Supabase credentials are required. Get them at: https://supabase.com');
      rl.close();
      return;
    }

    const openaiKey = await question('OpenAI API Key (optional, for fallback): ');
    const appUrl = await question('App URL (default: http://localhost:3000): ') || 'http://localhost:3000';

    // Create .env file
    const envContent = `# TherapAI Configuration - Generated ${new Date().toISOString()}

# Google Gemini API Key (REQUIRED)
GOOGLE_API_KEY=${googleApiKey}

# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}

# OpenAI API Key (OPTIONAL - for fallback)
OPENAI_API_KEY=${openaiKey}

# Next.js
NEXT_PUBLIC_APP_URL=${appUrl}

# FastAPI Backend (if deployed separately)
FASTAPI_URL=your_fastapi_url
`;

    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env file created successfully!');

    // Create a simple test script
    const testScript = `// Test script for TherapAI setup
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiConnection() {
  try {
    const genAI = new GoogleGenerativeAI('${googleApiKey}');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent("Hello, this is a test message.");
    console.log('✅ Gemini API connection successful!');
    console.log('Response:', result.response.text().substring(0, 100) + '...');
  } catch (error) {
    console.log('❌ Gemini API connection failed:', error.message);
  }
}

testGeminiConnection();
`;

    fs.writeFileSync(path.join(__dirname, 'test-connection.js'), testScript);

    console.log('\n🚀 Setup complete! Next steps:');
    console.log('1. Run: npm install');
    console.log('2. Set up your Supabase database (see SETUP_GUIDE.md)');
    console.log('3. Test your connection: node test-connection.js');
    console.log('4. Start the app: npm run dev');
    console.log('\n📖 For detailed instructions, see SETUP_GUIDE.md');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

setup();