-- Enhanced TherapAI Schema for Google Gemini Integration
-- Migration: 20240102000000_enhanced_therapy_features.sql

-- Add new columns to existing tables for enhanced functionality

-- Enhance chat_messages table with session analysis
ALTER TABLE public.chat_messages 
ADD COLUMN session_analysis JSONB DEFAULT '{}',
ADD COLUMN mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
ADD COLUMN risk_level TEXT CHECK (risk_level IN ('low', 'moderate', 'high')),
ADD COLUMN therapeutic_techniques TEXT[];

-- Enhance patient_profiles table with additional fields
ALTER TABLE public.patient_profiles 
ADD COLUMN age INTEGER,
ADD COLUMN gender TEXT,
ADD COLUMN preferred_language TEXT DEFAULT 'en',
ADD COLUMN therapy_goals TEXT[],
ADD COLUMN current_medications TEXT,
ADD COLUMN previous_therapy_experience TEXT,
ADD COLUMN insurance_info JSONB DEFAULT '{}';

-- Enhance soap_notes table with comprehensive reporting
ALTER TABLE public.soap_notes 
ADD COLUMN clinical_report TEXT,
ADD COLUMN risk_assessment TEXT,
ADD COLUMN session_count INTEGER DEFAULT 1,
ADD COLUMN treatment_duration_weeks INTEGER,
ADD COLUMN progress_rating INTEGER CHECK (progress_rating >= 1 AND progress_rating <= 10);

-- Create therapeutic_reports table for comprehensive clinical reports
CREATE TABLE public.therapeutic_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'comprehensive',
  comprehensive_report TEXT NOT NULL,
  treatment_metrics JSONB DEFAULT '{}',
  session_count INTEGER NOT NULL,
  report_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create therapy_sessions table for detailed session tracking
CREATE TABLE public.therapy_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  session_duration_minutes INTEGER DEFAULT 50,
  session_type TEXT DEFAULT 'individual' CHECK (session_type IN ('individual', 'group', 'family', 'couples')),
  session_notes TEXT,
  homework_assigned TEXT,
  next_session_goals TEXT[],
  patient_mood_before INTEGER CHECK (patient_mood_before >= 1 AND patient_mood_before <= 10),
  patient_mood_after INTEGER CHECK (patient_mood_after >= 1 AND patient_mood_after <= 10),
  therapeutic_interventions TEXT[],
  session_outcome TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create treatment_plans table for structured therapy planning
CREATE TABLE public.treatment_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  plan_name TEXT NOT NULL,
  treatment_goals JSONB NOT NULL DEFAULT '[]',
  target_symptoms TEXT[],
  therapeutic_approach TEXT NOT NULL,
  estimated_duration_weeks INTEGER,
  session_frequency TEXT DEFAULT 'weekly',
  success_metrics JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'discontinued')),
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create crisis_interventions table for safety planning
CREATE TABLE public.crisis_interventions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  crisis_type TEXT NOT NULL CHECK (crisis_type IN ('suicidal_ideation', 'self_harm', 'substance_abuse', 'psychotic_episode', 'panic_attack', 'other')),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'imminent')),
  intervention_taken TEXT NOT NULL,
  safety_plan JSONB DEFAULT '{}',
  follow_up_required BOOLEAN DEFAULT true,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create therapy_homework table for tracking assignments
CREATE TABLE public.therapy_homework (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES public.therapy_sessions(id) ON DELETE CASCADE,
  assignment_title TEXT NOT NULL,
  assignment_description TEXT NOT NULL,
  due_date DATE,
  completion_status TEXT DEFAULT 'assigned' CHECK (completion_status IN ('assigned', 'in_progress', 'completed', 'not_completed')),
  patient_feedback TEXT,
  therapist_review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for better performance
CREATE INDEX idx_therapeutic_reports_patient_id ON public.therapeutic_reports(patient_id);
CREATE INDEX idx_therapeutic_reports_doctor_id ON public.therapeutic_reports(doctor_id);
CREATE INDEX idx_therapeutic_reports_report_date ON public.therapeutic_reports(report_date DESC);

CREATE INDEX idx_therapy_sessions_patient_id ON public.therapy_sessions(patient_id);
CREATE INDEX idx_therapy_sessions_session_date ON public.therapy_sessions(session_date DESC);
CREATE INDEX idx_therapy_sessions_doctor_id ON public.therapy_sessions(doctor_id);

CREATE INDEX idx_treatment_plans_patient_id ON public.treatment_plans(patient_id);
CREATE INDEX idx_treatment_plans_status ON public.treatment_plans(status);

CREATE INDEX idx_crisis_interventions_patient_id ON public.crisis_interventions(patient_id);
CREATE INDEX idx_crisis_interventions_risk_level ON public.crisis_interventions(risk_level);
CREATE INDEX idx_crisis_interventions_resolved ON public.crisis_interventions(resolved);

CREATE INDEX idx_therapy_homework_patient_id ON public.therapy_homework(patient_id);
CREATE INDEX idx_therapy_homework_completion_status ON public.therapy_homework(completion_status);

CREATE INDEX idx_chat_messages_session_analysis ON public.chat_messages USING GIN (session_analysis);

-- Enable RLS for new tables
ALTER TABLE public.therapeutic_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crisis_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapy_homework ENABLE ROW LEVEL SECURITY;

-- RLS Policies for therapeutic_reports
CREATE POLICY "Patients can view their own therapeutic reports" ON public.therapeutic_reports
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view reports they created" ON public.therapeutic_reports
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can insert therapeutic reports" ON public.therapeutic_reports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'doctor'
    )
  );

-- RLS Policies for therapy_sessions
CREATE POLICY "Patients can view their own sessions" ON public.therapy_sessions
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view sessions they conducted" ON public.therapy_sessions
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can insert therapy sessions" ON public.therapy_sessions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'doctor'
    )
  );

-- RLS Policies for treatment_plans
CREATE POLICY "Patients can view their own treatment plans" ON public.treatment_plans
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view treatment plans they created" ON public.treatment_plans
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can manage treatment plans" ON public.treatment_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'doctor'
    )
  );

-- RLS Policies for crisis_interventions
CREATE POLICY "Patients can view their own crisis interventions" ON public.crisis_interventions
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view all crisis interventions" ON public.crisis_interventions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'doctor'
    )
  );

CREATE POLICY "Doctors can manage crisis interventions" ON public.crisis_interventions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'doctor'
    )
  );

-- RLS Policies for therapy_homework
CREATE POLICY "Patients can view their own homework" ON public.therapy_homework
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Patients can update their homework completion" ON public.therapy_homework
  FOR UPDATE USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view all homework" ON public.therapy_homework
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'doctor'
    )
  );

CREATE POLICY "Doctors can manage homework assignments" ON public.therapy_homework
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'doctor'
    )
  );

-- Create function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_patient_profiles_updated_at
  BEFORE UPDATE ON public.patient_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctor_profiles_updated_at
  BEFORE UPDATE ON public.doctor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_therapeutic_reports_updated_at
  BEFORE UPDATE ON public.therapeutic_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_treatment_plans_updated_at
  BEFORE UPDATE ON public.treatment_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create view for comprehensive patient dashboard
CREATE OR REPLACE VIEW public.patient_dashboard AS
SELECT 
  p.user_id,
  p.full_name,
  p.age,
  p.gender,
  COUNT(DISTINCT cm.id) as total_chat_messages,
  COUNT(DISTINCT ts.id) as total_therapy_sessions,
  COUNT(DISTINCT sn.id) as total_soap_notes,
  COUNT(DISTINCT tr.id) as total_reports,
  MAX(cm.created_at) as last_chat_date,
  MAX(ts.session_date) as last_session_date,
  AVG(cm.mood_score) as average_mood_score,
  COUNT(CASE WHEN ci.risk_level = 'high' THEN 1 END) as high_risk_incidents
FROM public.patient_profiles p
LEFT JOIN public.chat_messages cm ON p.user_id = cm.patient_id
LEFT JOIN public.therapy_sessions ts ON p.user_id = ts.patient_id
LEFT JOIN public.soap_notes sn ON p.user_id = sn.patient_id
LEFT JOIN public.therapeutic_reports tr ON p.user_id = tr.patient_id
LEFT JOIN public.crisis_interventions ci ON p.user_id = ci.patient_id
GROUP BY p.user_id, p.full_name, p.age, p.gender;

-- Grant appropriate permissions
GRANT SELECT ON public.patient_dashboard TO authenticated;

-- Create function for generating session summaries
CREATE OR REPLACE FUNCTION public.get_patient_session_summary(patient_uuid UUID)
RETURNS TABLE (
  total_sessions BIGINT,
  avg_mood_improvement NUMERIC,
  primary_concerns TEXT[],
  therapeutic_progress TEXT
) AS $
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(cm.id) as total_sessions,
    AVG(CASE 
      WHEN cm.mood_score IS NOT NULL 
      THEN cm.mood_score 
      ELSE NULL 
    END) as avg_mood_improvement,
    ARRAY_AGG(DISTINCT 
      CASE 
        WHEN cm.session_analysis->>'key_themes' IS NOT NULL 
        THEN cm.session_analysis->>'key_themes'
        ELSE NULL 
      END
    ) FILTER (WHERE cm.session_analysis->>'key_themes' IS NOT NULL) as primary_concerns,
    'Progress tracked through AI analysis' as therapeutic_progress
  FROM public.chat_messages cm
  WHERE cm.patient_id = patient_uuid;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE public.therapeutic_reports IS 'Comprehensive clinical reports generated by AI for doctor review';
COMMENT ON TABLE public.therapy_sessions IS 'Detailed tracking of individual therapy sessions';
COMMENT ON TABLE public.treatment_plans IS 'Structured treatment planning and goal tracking';
COMMENT ON TABLE public.crisis_interventions IS 'Crisis intervention tracking and safety planning';
COMMENT ON TABLE public.therapy_homework IS 'Therapy homework assignments and completion tracking';
COMMENT ON VIEW public.patient_dashboard IS 'Comprehensive patient overview for healthcare providers';