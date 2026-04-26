'use client';

import { useState, useEffect } from 'react';
import { Users, FileText, TrendingUp, AlertTriangle, Calendar, Activity } from 'lucide-react';
import TherapeuticReportViewer from './TherapeuticReportViewer';

interface Patient {
  id: string;
  full_name: string;
  age?: number;
  gender?: string;
  last_session?: string;
  total_sessions?: number;
  risk_level?: 'low' | 'moderate' | 'high';
  mood_trend?: 'improving' | 'stable' | 'declining';
}

interface DashboardStats {
  totalPatients: number;
  activeSessions: number;
  reportsGenerated: number;
  highRiskPatients: number;
}

interface EnhancedDashboardProps {
  doctorId: string;
}

export default function EnhancedDashboard({ doctorId }: EnhancedDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'reports'>('overview');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    activeSessions: 0,
    reportsGenerated: 0,
    highRiskPatients: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [doctorId]);

  const loadDashboardData = async () => {
    try {
      // In a real implementation, these would be actual API calls
      // For now, we'll simulate the data
      const mockPatients: Patient[] = [
        {
          id: '1',
          full_name: 'Sarah Johnson',
          age: 28,
          gender: 'Female',
          last_session: '2024-01-22',
          total_sessions: 8,
          risk_level: 'low',
          mood_trend: 'improving'
        },
        {
          id: '2',
          full_name: 'Michael Chen',
          age: 35,
          gender: 'Male',
          last_session: '2024-01-21',
          total_sessions: 12,
          risk_level: 'moderate',
          mood_trend: 'stable'
        },
        {
          id: '3',
          full_name: 'Emily Rodriguez',
          age: 24,
          gender: 'Female',
          last_session: '2024-01-20',
          total_sessions: 5,
          risk_level: 'high',
          mood_trend: 'declining'
        }
      ];

      setPatients(mockPatients);
      setStats({
        totalPatients: mockPatients.length,
        activeSessions: mockPatients.filter(p => p.last_session && new Date(p.last_session) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
        reportsGenerated: 15,
        highRiskPatients: mockPatients.filter(p => p.risk_level === 'high').length
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getMoodTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining': return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      case 'stable': return <Activity className="w-4 h-4 text-blue-600" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Clinical Dashboard</h1>
        <p className="text-gray-600">Monitor patient progress and generate therapeutic reports</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'patients', label: 'Patients', icon: Users },
            { id: 'reports', label: 'Reports', icon: FileText }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeSessions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Reports Generated</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.reportsGenerated}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">High Risk Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.highRiskPatients}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Recent Patient Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {patients.slice(0, 5).map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{patient.full_name}</p>
                        <p className="text-sm text-gray-600">
                          Last session: {patient.last_session ? new Date(patient.last_session).toLocaleDateString() : 'No sessions'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getMoodTrendIcon(patient.mood_trend)}
                      <span className={`px-2 py-1 text-xs rounded-full border ${getRiskLevelColor(patient.risk_level)}`}>
                        {patient.risk_level?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patients Tab */}
      {activeTab === 'patients' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Patient Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sessions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{patient.full_name}</div>
                        <div className="text-sm text-gray-500">
                          {patient.age && `${patient.age} years old`}
                          {patient.age && patient.gender && ' • '}
                          {patient.gender}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.total_sessions || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.last_session ? new Date(patient.last_session).toLocaleDateString() : 'No sessions'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getRiskLevelColor(patient.risk_level)}`}>
                        {patient.risk_level?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getMoodTrendIcon(patient.mood_trend)}
                        <span className="ml-2 text-sm text-gray-600 capitalize">
                          {patient.mood_trend || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        View Sessions
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        Generate Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <TherapeuticReportViewer doctorId={doctorId} patients={patients} />
      )}
    </div>
  );
}