import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ChatInterface from '@/components/patient/ChatInterface';
import { MessageCircle, Clock, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PatientPortal() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/patient');
  }

  // Fetch user role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userData?.role !== 'patient') {
    redirect('/');
  }

  // Fetch patient profile
  const { data: profile } = await supabase
    .from('patient_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Fetch recent chat messages
  const { data: recentMessages } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('patient_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Patient Portal</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                {profile?.full_name || user.email}
              </span>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Sign Out
                </button>
              </form>
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
                  {recentMessages?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="w-10 h-10 text-green-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Last Session</p>
                <p className="text-2xl font-bold text-gray-900">
                  {recentMessages?.[0]
                    ? new Date(recentMessages[0].created_at).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="w-10 h-10 text-purple-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-gray-900">Good</p>
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
      </div>
    </div>
  );
}
