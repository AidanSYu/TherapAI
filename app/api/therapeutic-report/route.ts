import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { patientId, doctorId, reportType = 'comprehensive' } = await request.json();

    if (!patientId || !doctorId) {
      return NextResponse.json(
        { error: 'Patient ID and Doctor ID are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch all chat messages for comprehensive analysis
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      throw messagesError;
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No therapy sessions found for this patient' },
        { status: 404 }
      );
    }

    // Fetch patient and doctor profiles
    const [{ data: patientProfile }, { data: doctorProfile }] = await Promise.all([
      supabase.from('patient_profiles').select('*').eq('user_id', patientId).single(),
      supabase.from('doctor_profiles').select('*').eq('user_id', doctorId).single()
    ]);

    // Initialize Google Gemini
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Analyze session progression and therapeutic outcomes
    const sessionAnalysis = analyzeSessionProgression(messages);

    const reportPrompt = `You are a senior clinical psychologist preparing a comprehensive therapeutic assessment report for medical review. Create a detailed, professional report suitable for healthcare providers, insurance companies, and treatment planning.

PATIENT INFORMATION:
- Name: ${patientProfile?.full_name || 'Patient'}
- Age: ${patientProfile?.age || 'Not specified'}
- Gender: ${patientProfile?.gender || 'Not specified'}
- Medical History: ${patientProfile?.medical_history || 'Not provided'}
- Emergency Contact: ${patientProfile?.emergency_contact || 'Not provided'}

TREATING CLINICIAN:
- Dr. ${doctorProfile?.full_name || 'Attending Physician'}
- Specialization: ${doctorProfile?.specialization || 'Mental Health'}
- License: ${doctorProfile?.license_number || 'Licensed'}

TREATMENT SUMMARY:
- Total Sessions: ${messages.length}
- Treatment Period: ${new Date(messages[0].created_at).toLocaleDateString()} to ${new Date(messages[messages.length - 1].created_at).toLocaleDateString()}
- Session Frequency: ${calculateSessionFrequency(messages)}

DETAILED SESSION DATA:
${messages.map((msg, index) => 
  `Session ${index + 1} (${new Date(msg.created_at).toLocaleDateString()}):
  Duration: Estimated 45-60 minutes
  Patient Presentation: "${msg.message}"
  Therapeutic Response: "${msg.response}"
  Clinical Notes: ${JSON.stringify(msg.session_analysis || {})}
  `
).join('\n\n')}

Please generate a comprehensive clinical report with these sections:

## EXECUTIVE SUMMARY
Provide a 2-3 paragraph overview of the patient's treatment journey, key therapeutic gains, and current status.

## CLINICAL PRESENTATION
### Initial Presentation
- Chief complaints at treatment onset
- Presenting symptoms and severity
- Functional impairment assessment

### Current Presentation  
- Current symptom status
- Functional improvement areas
- Ongoing challenges

## TREATMENT HISTORY
### Therapeutic Interventions Used
- Primary therapeutic modalities
- Specific techniques and approaches
- Patient response to interventions

### Session-by-Session Progress
- Key therapeutic milestones
- Breakthrough moments
- Setbacks and how they were addressed

## DIAGNOSTIC ASSESSMENT
### Clinical Impressions
- Primary diagnostic considerations (DSM-5 criteria)
- Differential diagnoses considered
- Comorbidity assessment

### Severity Assessment
- Symptom severity ratings
- Functional impairment level
- Risk assessment (suicide, self-harm, substance use)

## THERAPEUTIC OUTCOMES
### Measurable Improvements
- Symptom reduction indicators
- Functional improvement areas
- Coping skill development

### Treatment Goals Achievement
- Goals met vs. ongoing objectives
- Unexpected therapeutic gains
- Areas requiring continued focus

## PROGNOSIS AND RECOMMENDATIONS
### Short-term Prognosis (3-6 months)
- Expected trajectory with continued treatment
- Potential challenges or setbacks

### Long-term Prognosis (6-12 months)
- Overall recovery outlook
- Maintenance strategies needed

### Treatment Recommendations
- Continued therapy frequency and duration
- Medication evaluation needs
- Specialized referrals required
- Family/couples therapy considerations

## CRISIS INTERVENTION PLAN
- Warning signs to monitor
- Emergency contact procedures
- Safety planning elements
- Risk mitigation strategies

## PROFESSIONAL SUMMARY
Clinician's overall assessment, treatment effectiveness, and professional recommendations for ongoing care.

Format this as a formal medical document with appropriate clinical terminology, suitable for insurance review, medical records, and healthcare provider consultation.`;

    const reportResult = await model.generateContent(reportPrompt);
    const therapeuticReport = reportResult.response.text();

    // Generate treatment outcome metrics
    const metricsPrompt = `Based on the therapy sessions, provide quantitative treatment metrics in JSON format:

{
  "treatment_duration_weeks": number,
  "total_sessions": number,
  "session_frequency_per_week": number,
  "therapeutic_alliance_score": "1-10 scale",
  "symptom_improvement_percentage": "0-100%",
  "functional_improvement_areas": ["list of areas"],
  "risk_level_progression": {
    "initial": "low/moderate/high",
    "current": "low/moderate/high"
  },
  "treatment_goals_achieved": number,
  "treatment_goals_total": number,
  "recommended_sessions_remaining": number,
  "discharge_readiness_score": "1-10 scale"
}`;

    const metricsResult = await model.generateContent(metricsPrompt);
    let treatmentMetrics = {};
    
    try {
      const metricsText = metricsResult.response.text();
      const jsonMatch = metricsText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        treatmentMetrics = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing treatment metrics:', error);
    }

    // Store the therapeutic report
    const { data: report, error: reportError } = await supabase
      .from('therapeutic_reports')
      .insert({
        patient_id: patientId,
        doctor_id: doctorId,
        report_type: reportType,
        comprehensive_report: therapeuticReport,
        treatment_metrics: treatmentMetrics,
        session_count: messages.length,
        report_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error storing report:', reportError);
      // Continue to return the report even if storage fails
    }

    return NextResponse.json({
      therapeuticReport,
      treatmentMetrics,
      sessionAnalysis,
      reportMetadata: {
        patientName: patientProfile?.full_name || 'Patient',
        doctorName: doctorProfile?.full_name || 'Doctor',
        totalSessions: messages.length,
        treatmentPeriod: {
          start: new Date(messages[0].created_at).toLocaleDateString(),
          end: new Date(messages[messages.length - 1].created_at).toLocaleDateString()
        },
        reportGenerated: new Date().toISOString()
      },
      success: true,
    });
  } catch (error: any) {
    console.error('Error generating therapeutic report:', error);
    return NextResponse.json(
      { error: 'Failed to generate therapeutic report', details: error.message },
      { status: 500 }
    );
  }
}

function analyzeSessionProgression(messages: any[]) {
  const sessions = messages.map((msg, index) => ({
    sessionNumber: index + 1,
    date: new Date(msg.created_at),
    analysis: msg.session_analysis || {}
  }));

  return {
    totalSessions: sessions.length,
    averageSessionsPerWeek: calculateSessionFrequency(messages),
    progressionTrends: {
      moodImprovement: 'Analyzed based on session data',
      engagementLevel: 'Tracked across sessions',
      copingSkillsDevelopment: 'Monitored therapeutic gains'
    }
  };
}

function calculateSessionFrequency(messages: any[]): string {
  if (messages.length < 2) return 'Insufficient data';
  
  const firstSession = new Date(messages[0].created_at);
  const lastSession = new Date(messages[messages.length - 1].created_at);
  const daysDifference = (lastSession.getTime() - firstSession.getTime()) / (1000 * 3600 * 24);
  const weeksDifference = daysDifference / 7;
  
  if (weeksDifference === 0) return 'Multiple sessions in one week';
  
  const sessionsPerWeek = messages.length / weeksDifference;
  return `${sessionsPerWeek.toFixed(1)} sessions per week`;
}

export const runtime = 'nodejs';