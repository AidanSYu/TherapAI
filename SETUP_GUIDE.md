# TherapAI Setup Guide - Google Gemini Integration

This guide will help you set up TherapAI with Google Gemini as your AI therapeutic chatbot.

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd TherapAI
npm install
```

### 2. Get Your Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit your `.env` file with your credentials:

```env
# Google Gemini API Key (REQUIRED)
GOOGLE_API_KEY=your_google_gemini_api_key_here

# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OpenAI API Key (OPTIONAL - for fallback)
OPENAI_API_KEY=your_openai_api_key
```

### 4. Set Up Supabase Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your credentials
3. Run the database migrations:

```sql
-- Run this in your Supabase SQL Editor
-- First run: supabase/migrations/20240101000000_initial_schema.sql
-- Then run: supabase/migrations/20240102000000_enhanced_therapy_features.sql
```

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your therapeutic chatbot!

## 🤖 Features

### For Patients:
- **AI Therapy Chat**: Conversational therapy with Dr. Sarah (powered by Google Gemini)
- **Mood Tracking**: Rate your mood before each session
- **Session Insights**: Real-time analysis of therapeutic progress
- **Crisis Support**: Built-in safety protocols and crisis resources

### For Doctors:
- **Comprehensive Reports**: AI-generated clinical reports ready for medical review
- **SOAP Notes**: Structured clinical documentation
- **Treatment Metrics**: Quantitative progress tracking
- **Risk Assessment**: Automated risk level monitoring

## 🔧 Configuration Options

### Gemini Model Selection

You can customize which Gemini model to use in your API routes:

- `gemini-1.5-flash` - Fast responses, good for chat (default for chat)
- `gemini-1.5-pro` - More comprehensive analysis (default for reports)

### Therapeutic Customization

Edit the system prompts in `/app/api/chat/route.ts` to customize:
- Therapeutic approach (CBT, DBT, etc.)
- Response style and tone
- Safety protocols
- Session structure

## 📊 Database Schema

The enhanced schema includes:

- **chat_messages**: Stores conversations with AI analysis
- **therapeutic_reports**: Comprehensive clinical reports
- **therapy_sessions**: Detailed session tracking
- **treatment_plans**: Structured therapy planning
- **crisis_interventions**: Safety and crisis management

## 🔒 Security & Privacy

- **Row Level Security (RLS)**: All data is protected with Supabase RLS
- **HIPAA-Ready**: Designed with healthcare compliance in mind
- **Encrypted Storage**: All conversations and reports are encrypted
- **Role-Based Access**: Separate access for patients and doctors

## 🚨 Crisis Management

The system includes built-in crisis detection and response:

- Automatic risk level assessment
- Crisis resource information
- Emergency contact protocols
- Safety planning features

## 📈 Analytics & Reporting

Track therapeutic progress with:

- Session-by-session mood tracking
- Therapeutic technique effectiveness
- Treatment goal achievement
- Risk level progression
- Comprehensive outcome metrics

## 🛠️ Troubleshooting

### Common Issues:

1. **Gemini API Errors**
   - Verify your API key is correct
   - Check your Google Cloud billing is enabled
   - Ensure you have Gemini API access

2. **Database Connection Issues**
   - Verify Supabase credentials
   - Check RLS policies are properly set
   - Ensure migrations have been run

3. **Authentication Problems**
   - Check Supabase auth configuration
   - Verify middleware is properly set up
   - Ensure user roles are assigned correctly

## 🔄 Updates & Maintenance

To update the system:

1. Pull latest changes
2. Run `npm install` for new dependencies
3. Apply any new database migrations
4. Restart the application

## 📞 Support

For technical support:
- Check the GitHub issues
- Review the troubleshooting section
- Contact your system administrator

## 🎯 Next Steps

After setup, consider:

1. **Customizing Therapeutic Approaches**: Modify AI prompts for specific therapy types
2. **Adding Integrations**: Connect with EHR systems or other healthcare tools
3. **Scaling**: Deploy to production with proper security measures
4. **Training**: Train your clinical staff on the new system

---

**Important**: This system is designed to supplement, not replace, professional mental health care. Always ensure proper clinical oversight and follow local healthcare regulations.