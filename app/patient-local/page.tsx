'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Clock, TrendingUp, User, LogOut } from 'lucide-react';
import { simpleAuth } from '@/lib/auth/simple-auth';
import { localStorageService } from '@/lib/storage/local-storage';
import ChatInterface from '@/components/patient/ChatInterface';

export default function PatientLocalPortal() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializePatient();
  }, []);

  const initializePatient = () => {
    // Get or create current user
    let currentUser = simpleAuth.getCurrentUser();
    
    if (!currentUser) {
      // Auto-login as demo patient for simplicity
      currentUser = simpleAuth.quickLogin('patient');
    }

    if (currentUser.role !== 'patient') {
      // If user is a doctor, redirect or create patient account
      currentUser = simpleAuth.quickLogin('patient');
    }

    setUser(currentUser);

    // Get or create patient profile
    let patientProfile = localStorageService.getPatientProfile(currentUser.id);
    if (!patientProfile) {
      patientProfile = localStorageService.createPatientProfile(
        currentUser.id,
        'Demo Patient',
        28,
        'Not specified'
      );
    }
    setProfile(patientProfile);

    // Get recent messages
    const messages = localStorageService.getChatMessages(currentUser.id, 10);
    setRecentMessages(messages);

    // Get analytics
    const patientAnalytics = localStorageService.getPatientAnalytics(currentUser.id);
    setAnalytics(patientAnalytics);

    setLoading(false);
  };

  const handleSignOut = () => {
    simpleAuth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <User className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Patient Portal</h1>
                <p className="text-sm text-gray-600">Welcome back, {profile?.full_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 text-sm">
                {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <MessageCircle className="w-10 h-10 text-blue-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalSessions || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="w-10 h-10 text-green-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Average Mood</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.averageMood ? `${analytics.averageMood}/10` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="w-10 h-10 text-purple-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Mood Trend</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {analytics.moodTrend || 'Stable'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-bold text-gray-900">AI Therapist Chat</h2>
            <p className="text-sm text-gray-600 mt-1">
              Share your thoughts and feelings in a safe, confidential space
            </p>
          </div>
          <ChatInterface userId={user.id} initialMessages={recentMessages || []} />
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Crisis Resources</h3>
            <p className="text-sm text-blue-700 mb-3">
              If you're experiencing a mental health crisis, help is available 24/7.
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>National Suicide Prevention Lifeline:</strong> 988</p>
              <p><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
              <p><strong>Emergency Services:</strong> 911</p>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="font-semibold text-green-900 mb-2">Your Progress</h3>
            <p className="text-sm text-green-700 mb-3">
              You've been making great progress in your therapeutic journey.
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Risk Level:</strong> <span className="capitalize">{analytics.currentRiskLevel || 'Low'}</span></p>
              <p><strong>Sessions Completed:</strong> {analytics.totalSessions || 0}</p>
              <p><strong>Last Session:</strong> {analytics.lastSession ? new Date(analytics.lastSession).toLocaleDateString() : 'None'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}