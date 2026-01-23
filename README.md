# TherapAI - Serverless Mental Health Platform

A scalable, serverless mental health platform built with Next.js, FastAPI, and Supabase. Features AI-powered therapy chat and doctor dashboards with analytics and automated SOAP note generation.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS
- **Authentication**: Supabase Auth with role-based access control
- **Database**: Supabase (PostgreSQL) 
- **AI/ML**: LangChain + OpenAI GPT for chat and SOAP notes
- **Deployment**: Vercel (serverless functions) / AWS Lambda
- **Charts**: Recharts for analytics visualization

### Key Features
- ✅ **Patient Portal**: AI-powered therapy chat interface
- ✅ **Doctor Dashboard**: Patient analytics and AI-generated SOAP notes
- ✅ **Role-based Authentication**: Separate access for patients and doctors
- ✅ **Serverless Architecture**: Zero infrastructure management
- ✅ **HIPAA-Ready**: Supabase RLS policies for data security
- ✅ **Scalable**: Serverless functions scale automatically

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

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/AidanSYu/TherapAI.git
cd TherapAI
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your credentials
   - Run the SQL migration from `supabase/migrations/20240101000000_initial_schema.sql` in the Supabase SQL Editor

4. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

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

### Patient Chat (LangChain + OpenAI)
- Uses GPT-3.5-turbo for conversational therapy
- Maintains context-aware responses
- Stores conversation history in database
- Configured with therapeutic prompting

### SOAP Note Generation (GPT-4)
- Analyzes patient chat history
- Generates structured clinical notes:
  - **S**ubjective: Patient's reported symptoms
  - **O**bjective: Observable behaviors
  - **A**ssessment: Clinical analysis
  - **P**lan: Treatment recommendations

## 📊 API Endpoints

### `/api/chat` (POST)
- **Purpose**: Process patient messages with AI
- **Body**: `{ message: string, userId: string }`
- **Response**: `{ response: string, success: boolean }`

### `/api/analytics` (GET)
- **Purpose**: Fetch patient session analytics
- **Query**: `?doctorId=<uuid>`
- **Response**: `{ analytics: Array, success: boolean }`

### `/api/soap-notes` (POST)
- **Purpose**: Generate AI SOAP note for patient
- **Body**: `{ patientId: string, doctorId: string }`
- **Response**: `{ soapNote: Object, success: boolean }`

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
