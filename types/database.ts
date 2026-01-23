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
  session_date: string;
  created_at: string;
}
