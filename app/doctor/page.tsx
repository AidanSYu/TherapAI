import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PatientList from '@/components/doctor/PatientList';
import AnalyticsDashboard from '@/components/doctor/AnalyticsDashboard';
import { Users, FileText, Activity } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DoctorDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/doctor');
  }

  // Fetch user role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userData?.role !== 'doctor') {
    redirect('/');
  }

  // Fetch doctor profile
  const { data: profile } = await supabase
    .from('doctor_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Fetch all patients
  const { data: patients } = await supabase
    .from('patient_profiles')
    .select(`
      *,
      users:user_id (email)
    `)
    .order('created_at', { ascending: false });

  // Fetch SOAP notes count
  const { count: soapNotesCount } = await supabase
    .from('soap_notes')
    .select('*', { count: 'exact', head: true })
    .eq('doctor_id', user.id);

  // Fetch total chat messages
  const { count: messagesCount } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Dr. {profile?.full_name || user.email}
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
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-10 h-10 text-blue-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patients?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FileText className="w-10 h-10 text-green-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">SOAP Notes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {soapNotesCount || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Activity className="w-10 h-10 text-purple-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {messagesCount || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="mb-8">
          <AnalyticsDashboard doctorId={user.id} />
        </div>

        {/* Patient List */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-bold text-gray-900">Patient Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              View patient analytics and generate AI-powered SOAP notes
            </p>
          </div>
          <PatientList patients={patients || []} doctorId={user.id} />
        </div>
      </div>
    </div>
  );
}
