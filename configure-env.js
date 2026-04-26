#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🤖 TherapAI Configuration Helper\n');

// Check if .env exists and has the required keys
const envPath = path.join(__dirname, '.env');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

const hasGeminiKey = envContent.includes('GOOGLE_API_KEY=') && !envContent.includes('GOOGLE_API_KEY=your_google_gemini_api_key_here');
const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL=') && !envContent.includes('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');

console.log('📋 Configuration Status:');
console.log(`✅ Google Gemini API Key: ${hasGeminiKey ? 'Configured' : '❌ Missing'}`);
console.log(`✅ Supabase Configuration: ${hasSupabaseUrl ? 'Configured' : '❌ Missing'}`);

if (!hasGeminiKey) {
  console.log('\n🔑 To get your Google Gemini API Key:');
  console.log('1. Visit: https://makersuite.google.com/app/apikey');
  console.log('2. Sign in with your Google account');
  console.log('3. Click "Create API Key"');
  console.log('4. Copy the key and add it to your .env file');
  console.log('   GOOGLE_API_KEY=your_actual_api_key_here');
}

if (!hasSupabaseUrl) {
  console.log('\n🗄️ To set up Supabase:');
  console.log('1. Visit: https://supabase.com');
  console.log('2. Create a new project');
  console.log('3. Go to Settings > API');
  console.log('4. Copy the URL and keys to your .env file');
  console.log('5. Run the database migrations in the SQL Editor');
}

console.log('\n🚀 Once configured, you can:');
console.log('1. Test Gemini: node test-gemini.js');
console.log('2. Start the app: npm run dev');
console.log('3. Visit: http://localhost:3000');

console.log('\n📖 For detailed setup instructions, see SETUP_GUIDE.md');