export type UserRole = 'patient' | 'doctor';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface PatientProfile {
  id: string;
  user_id: string;
  full_name: string;
  date_of_birth?: string;
  phone?: string;
  emergency_contact?: string;
  medical_history?: string;
  age?: number;
  gender?: string;
  preferred_language?: string;
  therapy_goals?: string[];
  current_medications?: string;
  previous_therapy_experience?: string;
  insurance_info?: any;
  created_at: string;
  updated_at: string;
}

export interface DoctorProfile {
  id: string;
  user_id: string;
  full_name: string;
  specialization?: string;
  license_number?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  patient_id: string;
  message: string;
  response: string;
  session_analysis?: any;
  mood_score?: number;
  risk_level?: 'low' | 'moderate' | 'high';
  therapeutic_techniques?: string[];
  created_at: string;
}

export interface SOAPNote {
  id: string;
  patient_id: string;
  doctor_id: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  clinical_report?: string;
  risk_assessment?: string;
  session_count?: number;
  treatment_duration_weeks?: number;
  progress_rating?: number;
  session_date: string;
  created_at: string;
}

export interface TherapeuticReport {
  id: string;
  patient_id: string;
  doctor_id: string;
  report_type: string;
  comprehensive_report: string;
  treatment_metrics?: any;
  session_count: number;
  report_date: string;
  created_at: string;
  updated_at: string;
}

export interface TherapySession {
  id: string;
  patient_id: string;
  doctor_id?: string;
  session_number: number;
  session_date: string;
  session_duration_minutes?: number;
  session_type?: 'individual' | 'group' | 'family' | 'couples';
  session_notes?: string;
  homework_assigned?: string;
  next_session_goals?: string[];
  patient_mood_before?: number;
  patient_mood_after?: number;
  therapeutic_interventions?: string[];
  session_outcome?: string;
  created_at: string;
}
