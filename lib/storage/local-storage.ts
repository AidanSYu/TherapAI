// Local Storage Service - No database required!
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  role: 'patient' | 'doctor';
  created_at: string;
}

export interface PatientProfile {
  id: string;
  user_id: string;
  full_name: string;
  age?: number;
  gender?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  patient_id: string;
  message: string;
  response: string;
  session_analysis?: any;
  mood_score?: number;
  risk_level?: 'low' | 'moderate' | 'high';
  created_at: string;
}

export interface TherapeuticReport {
  id: string;
  patient_id: string;
  doctor_id: string;
  comprehensive_report: string;
  treatment_metrics?: any;
  session_count: number;
  report_date: string;
  created_at: string;
}

class LocalStorageService {
  private getStorageKey(type: string): string {
    return `therapai_${type}`;
  }

  private getData<T>(type: string): T[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(this.getStorageKey(type));
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${type} from localStorage:`, error);
      return [];
    }
  }

  private setData<T>(type: string, data: T[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.getStorageKey(type), JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${type} to localStorage:`, error);
    }
  }

  // User Management
  createUser(email: string, role: 'patient' | 'doctor' = 'patient'): User {
    const user: User = {
      id: uuidv4(),
      email,
      role,
      created_at: new Date().toISOString()
    };

    const users = this.getData<User>('users');
    users.push(user);
    this.setData('users', users);

    return user;
  }

  getUser(id: string): User | null {
    const users = this.getData<User>('users');
    return users.find(user => user.id === id) || null;
  }

  getUserByEmail(email: string): User | null {
    const users = this.getData<User>('users');
    return users.find(user => user.email === email) || null;
  }

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const currentUserId = localStorage.getItem('therapai_current_user');
    return currentUserId ? this.getUser(currentUserId) : null;
  }

  setCurrentUser(userId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('therapai_current_user', userId);
  }

  signOut(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('therapai_current_user');
  }

  // Patient Profiles
  createPatientProfile(userId: string, fullName: string, age?: number, gender?: string): PatientProfile {
    const profile: PatientProfile = {
      id: uuidv4(),
      user_id: userId,
      full_name: fullName,
      age,
      gender,
      created_at: new Date().toISOString()
    };

    const profiles = this.getData<PatientProfile>('patient_profiles');
    profiles.push(profile);
    this.setData('patient_profiles', profiles);

    return profile;
  }

  getPatientProfile(userId: string): PatientProfile | null {
    const profiles = this.getData<PatientProfile>('patient_profiles');
    return profiles.find(profile => profile.user_id === userId) || null;
  }

  getAllPatientProfiles(): PatientProfile[] {
    return this.getData<PatientProfile>('patient_profiles');
  }

  // Chat Messages
  saveChatMessage(patientId: string, message: string, response: string, sessionAnalysis?: any, moodScore?: number): ChatMessage {
    const chatMessage: ChatMessage = {
      id: uuidv4(),
      patient_id: patientId,
      message,
      response,
      session_analysis: sessionAnalysis,
      mood_score: moodScore,
      risk_level: sessionAnalysis?.risk_level || 'low',
      created_at: new Date().toISOString()
    };

    const messages = this.getData<ChatMessage>('chat_messages');
    messages.push(chatMessage);
    this.setData('chat_messages', messages);

    return chatMessage;
  }

  getChatMessages(patientId: string, limit?: number): ChatMessage[] {
    const messages = this.getData<ChatMessage>('chat_messages');
    const patientMessages = messages
      .filter(msg => msg.patient_id === patientId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return limit ? patientMessages.slice(0, limit) : patientMessages;
  }

  // Therapeutic Reports
  saveTherapeuticReport(patientId: string, doctorId: string, report: string, metrics?: any, sessionCount: number = 0): TherapeuticReport {
    const therapeuticReport: TherapeuticReport = {
      id: uuidv4(),
      patient_id: patientId,
      doctor_id: doctorId,
      comprehensive_report: report,
      treatment_metrics: metrics,
      session_count: sessionCount,
      report_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };

    const reports = this.getData<TherapeuticReport>('therapeutic_reports');
    reports.push(therapeuticReport);
    this.setData('therapeutic_reports', reports);

    return therapeuticReport;
  }

  getTherapeuticReports(patientId?: string, doctorId?: string): TherapeuticReport[] {
    const reports = this.getData<TherapeuticReport>('therapeutic_reports');
    
    return reports.filter(report => {
      if (patientId && report.patient_id !== patientId) return false;
      if (doctorId && report.doctor_id !== doctorId) return false;
      return true;
    });
  }

  // Analytics
  getPatientAnalytics(patientId: string) {
    const messages = this.getChatMessages(patientId);
    const totalSessions = messages.length;
    const averageMood = messages
      .filter(msg => msg.mood_score)
      .reduce((sum, msg) => sum + (msg.mood_score || 0), 0) / messages.filter(msg => msg.mood_score).length || 0;

    const riskLevels = messages.map(msg => msg.risk_level).filter(Boolean);
    const currentRiskLevel = riskLevels[0] || 'low';

    return {
      totalSessions,
      averageMood: Math.round(averageMood * 10) / 10,
      currentRiskLevel,
      lastSession: messages[0]?.created_at,
      moodTrend: this.calculateMoodTrend(messages)
    };
  }

  private calculateMoodTrend(messages: ChatMessage[]): 'improving' | 'stable' | 'declining' {
    const recentMessages = messages.slice(0, 5);
    const moodScores = recentMessages.map(msg => msg.mood_score).filter(Boolean) as number[];
    
    if (moodScores.length < 2) return 'stable';
    
    const recent = moodScores.slice(0, Math.ceil(moodScores.length / 2));
    const older = moodScores.slice(Math.ceil(moodScores.length / 2));
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    if (recentAvg > olderAvg + 0.5) return 'improving';
    if (recentAvg < olderAvg - 0.5) return 'declining';
    return 'stable';
  }

  // Data Export/Import for backup
  exportData(): string {
    const data = {
      users: this.getData<User>('users'),
      patient_profiles: this.getData<PatientProfile>('patient_profiles'),
      chat_messages: this.getData<ChatMessage>('chat_messages'),
      therapeutic_reports: this.getData<TherapeuticReport>('therapeutic_reports'),
      exported_at: new Date().toISOString()
    };

    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.users) this.setData('users', data.users);
      if (data.patient_profiles) this.setData('patient_profiles', data.patient_profiles);
      if (data.chat_messages) this.setData('chat_messages', data.chat_messages);
      if (data.therapeutic_reports) this.setData('therapeutic_reports', data.therapeutic_reports);
      
      console.log('Data imported successfully');
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Invalid data format');
    }
  }

  // Clear all data (for testing/reset)
  clearAllData(): void {
    if (typeof window === 'undefined') return;
    
    const keys = ['users', 'patient_profiles', 'chat_messages', 'therapeutic_reports', 'current_user'];
    keys.forEach(key => {
      localStorage.removeItem(`therapai_${key}`);
    });
  }
}

export const localStorageService = new LocalStorageService();