import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get all patients
    const { data: patients, error: patientsError } = await supabase
      .from('patient_profiles')
      .select('id, user_id, full_name');

    if (patientsError) {
      throw patientsError;
    }

    // Get chat message counts per patient
    const analytics = await Promise.all(
      (patients || []).map(async (patient) => {
        const { count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('patient_id', patient.user_id);

        return {
          patientId: patient.user_id,
          patientName: patient.full_name,
          sessionCount: count || 0,
        };
      })
    );

    return NextResponse.json({
      analytics,
      success: true,
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error.message },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
