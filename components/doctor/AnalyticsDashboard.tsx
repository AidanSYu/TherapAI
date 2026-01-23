'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsDashboardProps {
  doctorId: string;
}

export default function AnalyticsDashboard({ doctorId }: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?doctorId=${doctorId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      setAnalyticsData(data.analytics || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-center text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  const mockData = [
    { name: 'Mon', sessions: 4 },
    { name: 'Tue', sessions: 3 },
    { name: 'Wed', sessions: 5 },
    { name: 'Thu', sessions: 2 },
    { name: 'Fri', sessions: 6 },
    { name: 'Sat', sessions: 1 },
    { name: 'Sun', sessions: 2 },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Weekly Activity</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={mockData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="sessions" fill="#0ea5e9" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
