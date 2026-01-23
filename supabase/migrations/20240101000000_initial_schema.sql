-- Create custom types
CREATE TYPE user_role AS ENUM ('patient', 'doctor');

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'patient',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create patient profiles table
CREATE TABLE public.patient_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  phone TEXT,
  emergency_contact TEXT,
  medical_history TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create doctor profiles table
CREATE TABLE public.doctor_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  specialization TEXT,
  license_number TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create SOAP notes table
CREATE TABLE public.soap_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  subjective TEXT NOT NULL,
  objective TEXT NOT NULL,
  assessment TEXT NOT NULL,
  plan TEXT NOT NULL,
  session_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_chat_messages_patient_id ON public.chat_messages(patient_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX idx_soap_notes_patient_id ON public.soap_notes(patient_id);
CREATE INDEX idx_soap_notes_doctor_id ON public.soap_notes(doctor_id);
CREATE INDEX idx_soap_notes_session_date ON public.soap_notes(session_date DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soap_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- RLS Policies for patient_profiles
CREATE POLICY "Patients can view their own profile" ON public.patient_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Patients can update their own profile" ON public.patient_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Doctors can view patient profiles" ON public.patient_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'doctor'
    )
  );

-- RLS Policies for doctor_profiles
CREATE POLICY "Doctors can view their own profile" ON public.doctor_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Doctors can update their own profile" ON public.doctor_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
CREATE POLICY "Patients can view their own messages" ON public.chat_messages
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert their own messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can view all messages" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'doctor'
    )
  );

-- RLS Policies for soap_notes
CREATE POLICY "Patients can view their own SOAP notes" ON public.soap_notes
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view SOAP notes they created" ON public.soap_notes
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can insert SOAP notes" ON public.soap_notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'doctor'
    )
  );

CREATE POLICY "Doctors can update their own SOAP notes" ON public.soap_notes
  FOR UPDATE USING (auth.uid() = doctor_id);

-- Function to automatically create user entry on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'patient');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
