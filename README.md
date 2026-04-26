# TherapAI - AI-Powered Therapeutic Chatbot

A comprehensive mental health platform featuring an AI therapist powered by Google Gemini. Built with Next.js, Supabase, and designed for healthcare professionals to provide AI-assisted therapy with comprehensive clinical reporting.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS
- **Authentication**: Supabase Auth with role-based access control
- **Database**: Supabase (PostgreSQL) with enhanced therapeutic schema
- **AI/ML**: Google Gemini for conversational therapy and clinical analysis
- **Deployment**: Vercel (serverless functions) / AWS Lambda
- **Charts**: Recharts for analytics visualization

### Key Features
- ✅ **AI Therapist "Dr. Sarah"**: Google Gemini-powered conversational therapy
- ✅ **Real-time Session Analysis**: Mood tracking, risk assessment, and therapeutic insights
- ✅ **Comprehensive Clinical Reports**: Doctor-ready therapeutic assessments
- ✅ **SOAP Notes Generation**: Structured clinical documentation
- ✅ **Crisis Detection & Response**: Built-in safety protocols and risk monitoring
- ✅ **Treatment Progress Tracking**: Quantitative metrics and outcome analysis
- ✅ **Role-based Authentication**: Separate portals for patients and healthcare providers
- ✅ **HIPAA-Ready Architecture**: Secure, compliant data handling
- ✅ **Serverless & Scalable**: Auto-scaling with zero infrastructure management

## 📁 Project Structure

```
TherapAI/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # LangChain chat endpoint
│   │   ├── analytics/route.ts     # Patient analytics
│   │   └── soap-notes/route.ts    # AI SOAP note generation
│   ├── auth/
│   │   ├── login/page.tsx         # Login/signup page
│   │   ├── callback/route.ts      # Auth callback
│   │   └── signout/route.ts       # Sign out
│   ├── patient/page.tsx           # Patient portal
│   ├── doctor/page.tsx            # Doctor dashboard
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   └── globals.css                # Global styles
├── components/
│   ├── patient/
│   │   └── ChatInterface.tsx      # AI chat component
│   └── doctor/
│       ├── PatientList.tsx        # Patient management
│       └── AnalyticsDashboard.tsx # Analytics charts
├── lib/
│   └── supabase/
│       ├── client.ts              # Browser Supabase client
│       └── server.ts              # Server Supabase client
├── types/
│   └── database.ts                # TypeScript types
├── supabase/
│   └── migrations/
│       └── 20240101000000_initial_schema.sql
├── middleware.ts                  # Auth middleware
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Google Gemini API key

### Installation

1. **Clone and setup**
```bash
git clone https://github.com/AidanSYu/TherapAI.git
cd TherapAI
npm install
```

2. **Run the setup script**
```bash
node setup.js
```

3. **Set up Supabase database**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL migrations from `supabase/migrations/` in order
   - Update your `.env` with Supabase credentials

4. **Get your Google Gemini API key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create an API key and add it to your `.env`

5. **Start the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access TherapAI.

📖 **For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

## 🗄️ Database Schema

### Tables
- **users**: User accounts with role (patient/doctor)
- **patient_profiles**: Patient information and medical history
- **doctor_profiles**: Doctor credentials and specialization
- **chat_messages**: AI therapy chat history
- **soap_notes**: AI-generated clinical documentation

### Row Level Security (RLS)
- Patients can only view their own data
- Doctors can view all patient data
- All tables have RLS policies enabled

## 🔐 Authentication Flow

1. User signs up/logs in via `/auth/login`
2. Supabase creates auth user and triggers `handle_new_user()` function
3. User entry created in `users` table with default 'patient' role
4. Role can be updated to 'doctor' via Supabase dashboard
5. Middleware refreshes session on each request
6. Routes redirect based on user role

## 🤖 AI Features

### Therapeutic Chatbot (Google Gemini)
- **Dr. Sarah**: Compassionate AI therapist with CBT and trauma-informed care expertise
- **Context-Aware Conversations**: Maintains therapeutic continuity across sessions
- **Real-time Analysis**: Mood indicators, risk assessment, and therapeutic insights
- **Crisis Detection**: Automatic identification of high-risk situations with safety protocols
- **Evidence-Based Responses**: Incorporates therapeutic techniques and coping strategies

### Clinical Documentation (Gemini Pro)
- **Comprehensive Reports**: Detailed therapeutic assessments ready for medical review
- **SOAP Notes**: Structured clinical documentation with treatment recommendations
- **Progress Tracking**: Quantitative metrics including mood improvement and treatment goals
- **Risk Assessment**: Automated safety evaluations and crisis intervention planning
- **Treatment Analytics**: Session frequency, therapeutic alliance, and outcome measurements

## 📊 API Endpoints

### `/api/chat` (POST)
- **Purpose**: Process patient messages with AI therapist
- **Body**: `{ message: string, userId: string, currentMood?: number }`
- **Response**: `{ response: string, sessionInsights: object, success: boolean }`

### `/api/therapeutic-report` (POST)
- **Purpose**: Generate comprehensive clinical reports
- **Body**: `{ patientId: string, doctorId: string, reportType?: string }`
- **Response**: `{ therapeuticReport: string, treatmentMetrics: object, success: boolean }`

### `/api/soap-notes` (POST)
- **Purpose**: Generate structured SOAP notes
- **Body**: `{ patientId: string, doctorId: string, sessionCount?: number }`
- **Response**: `{ soapNote: object, clinicalReport: string, riskAssessment: string, success: boolean }`

### `/api/analytics` (GET)
- **Purpose**: Fetch patient session analytics and progress metrics
- **Query**: `?doctorId=<uuid>&patientId=<uuid>`
- **Response**: `{ analytics: Array, progressMetrics: object, success: boolean }`

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### AWS Lambda
- Build: `npm run build`
- Use AWS Lambda adapter for Next.js
- Configure API Gateway for routes
- Set environment variables in Lambda console

### Environment Variables (Production)
Ensure all variables from `.env.example` are set in your deployment platform.

## 🔒 Security Considerations

1. **Row Level Security (RLS)**: All Supabase tables have RLS enabled
2. **Auth Middleware**: Validates sessions on every request
3. **API Routes**: Server-side validation of user permissions
4. **Environment Variables**: Never commit `.env` files
5. **HTTPS**: Always use HTTPS in production
6. **HIPAA Compliance**: 
   - Enable Supabase audit logs
   - Configure data retention policies
   - Implement backup strategies

## 📈 Scaling

The serverless architecture provides:
- **Auto-scaling**: Functions scale with demand
- **Zero cold start cost**: Pay only for execution time
- **Global edge network**: Low latency worldwide
- **No infrastructure management**: Focus on features

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Type checking
npx tsc --noEmit

# Lint
npm run lint
```

## 📝 Development Workflow

1. Create feature branch
2. Make changes and test locally
3. Run linting: `npm run lint`
4. Commit with descriptive message
5. Push and create pull request

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

ISC License

## 🆘 Support

For issues and questions:
- GitHub Issues: [github.com/AidanSYu/TherapAI/issues](https://github.com/AidanSYu/TherapAI/issues)
- Email: support@therapai.com

## 🎯 Roadmap

- [ ] Video therapy sessions
- [ ] Prescription management
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Integration with EHR systems
- [ ] Advanced analytics with ML insights
- [ ] Group therapy features

## 👥 Team

Created with ❤️ by the TherapAI team

---

**Note**: This is a demo/scaffold application. For production use, ensure compliance with local healthcare regulations (HIPAA, GDPR, etc.) and conduct thorough security audits. 
