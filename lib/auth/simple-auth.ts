// Simple Authentication System - No external dependencies
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  role: 'patient' | 'doctor';
  created_at: string;
}

export interface AuthSession {
  user: User;
  expires: string;
}

class SimpleAuthService {
  private getStorageKey(key: string): string {
    return `therapai_auth_${key}`;
  }

  // Create a new user (sign up)
  async signUp(email: string, password: string, role: 'patient' | 'doctor' = 'patient'): Promise<{ user: User; error?: string }> {
    try {
      // Check if user already exists
      const existingUser = this.getUserByEmail(email);
      if (existingUser) {
        return { user: existingUser, error: 'User already exists' };
      }

      // Create new user
      const user: User = {
        id: uuidv4(),
        email,
        role,
        created_at: new Date().toISOString()
      };

      // Store user data
      const users = this.getAllUsers();
      users.push(user);
      this.saveUsers(users);

      // Store password (in production, this should be hashed!)
      this.savePassword(user.id, password);

      return { user };
    } catch (error) {
      return { user: {} as User, error: 'Failed to create user' };
    }
  }

  // Sign in user
  async signIn(email: string, password: string): Promise<{ user?: User; error?: string }> {
    try {
      const user = this.getUserByEmail(email);
      if (!user) {
        return { error: 'User not found' };
      }

      const storedPassword = this.getPassword(user.id);
      if (storedPassword !== password) {
        return { error: 'Invalid password' };
      }

      // Create session
      this.setCurrentUser(user);

      return { user };
    } catch (error) {
      return { error: 'Failed to sign in' };
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userData = localStorage.getItem(this.getStorageKey('current_user'));
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  // Set current user (create session)
  setCurrentUser(user: User): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(this.getStorageKey('current_user'), JSON.stringify(user));
  }

  // Sign out
  signOut(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.getStorageKey('current_user'));
  }

  // Get user by email
  private getUserByEmail(email: string): User | null {
    const users = this.getAllUsers();
    return users.find(user => user.email === email) || null;
  }

  // Get all users
  private getAllUsers(): User[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const users = localStorage.getItem(this.getStorageKey('users'));
      return users ? JSON.parse(users) : [];
    } catch (error) {
      return [];
    }
  }

  // Save users
  private saveUsers(users: User[]): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(this.getStorageKey('users'), JSON.stringify(users));
  }

  // Password management (simplified - in production use proper hashing)
  private savePassword(userId: string, password: string): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(this.getStorageKey(`password_${userId}`), password);
  }

  private getPassword(userId: string): string | null {
    if (typeof window === 'undefined') return null;
    
    return localStorage.getItem(this.getStorageKey(`password_${userId}`));
  }

  // Create demo accounts
  createDemoAccounts(): void {
    // Create demo patient
    const demoPatient = {
      id: 'demo-patient-123',
      email: 'patient@demo.com',
      role: 'patient' as const,
      created_at: new Date().toISOString()
    };

    // Create demo doctor
    const demoDoctor = {
      id: 'demo-doctor-123',
      email: 'doctor@demo.com',
      role: 'doctor' as const,
      created_at: new Date().toISOString()
    };

    const users = [demoPatient, demoDoctor];
    this.saveUsers(users);
    
    // Set demo passwords
    this.savePassword(demoPatient.id, 'demo123');
    this.savePassword(demoDoctor.id, 'demo123');
  }

  // Quick login for demo
  quickLogin(role: 'patient' | 'doctor'): User {
    const email = role === 'patient' ? 'patient@demo.com' : 'doctor@demo.com';
    const user = this.getUserByEmail(email);
    
    if (!user) {
      this.createDemoAccounts();
      return this.getUserByEmail(email)!;
    }
    
    this.setCurrentUser(user);
    return user;
  }
}

export const simpleAuth = new SimpleAuthService();