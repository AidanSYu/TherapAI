import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { patientId, doctorId, sessionCount = 10 } = await request.json();

    if (!patientId || !doctorId) {
      return NextResponse.json(
        { error: 'Patient ID and Doctor ID are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch recent chat messages for the patient
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(sessionCount);

    if (messagesError) {
      throw messagesError;
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No chat history found for this patient' },
        { status: 404 }
      );
    }

    // Fetch patient profile
    const { data: patientProfile } = await supabase
      .from('patient_profiles')
      .select('*')
      .eq('user_id', patientId)
      .single();

    // Initialize Google Gemini
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Create comprehensive conversation analysis
    const conversationData = messages
      .reverse()
      .map((msg, index) => ({
        sessionNumber: index + 1,
        date: new Date(msg.created_at).toLocaleDateString(),
        patientMessage: msg.message,
        therapistResponse: msg.response,
        sessionAnalysis: msg.session_analysis || {}
      }));

    // Generate comprehensive clinical report
    const reportPrompt = `You are a senior clinical psychologist creating a comprehensive therapeutic assessment report. Analyze the following therapy session data and generate a detailed, doctor-ready clinical report.

PATIENT INFORMATION:
Name: ${patientProfile?.full_name || 'Patient'}
Age: ${patientProfile?.age || 'Not specified'}
Gender: ${patientProfile?.gender || 'Not specified'}
Medical History: ${patientProfile?.medical_history || 'Not provided'}

THERAPY SESSION DATA (${messages.length} sessions):
${conversationData.map(session => 
  `Session ${session.sessionNumber} (${session.date}):
  Patient: "${session.patientMessage}"
  Therapist: "${session.therapistResponse}"
  Analysis: ${JSON.stringify(session.sessionAnalysis)}
  `
).join('\n\n')}

Please generate a comprehensive clinical report with the following sections:

1. EXECUTIVE SUMMARY
- Brief overview of patient presentation and key findings
- Primary concerns and treatment focus areas

2. SUBJECTIVE (Patient's Reported Experience)
- Chief complaints and presenting problems
- Patient's description of symptoms and concerns
- Emotional state and self-reported mood patterns
- Coping mechanisms and support systems

3. OBJECTIVE (Clinical Observations)
- Behavioral observations during sessions
- Communication patterns and engagement level
- Cognitive functioning and thought processes
- Risk assessment findings

4. ASSESSMENT (Clinical Analysis)
- Preliminary diagnostic considerations (DSM-5 criteria if applicable)
- Symptom severity and functional impairment
- Therapeutic alliance and treatment engagement
- Strengths and protective factors
- Risk factors and areas of concern

5. PLAN (Treatment Recommendations)
- Recommended therapeutic interventions
- Treatment goals and objectives
- Frequency and duration of sessions
- Referrals or additional services needed
- Crisis intervention plan if applicable
- Follow-up recommendations

6. PROGRESS TRACKING
- Session-by-session progress indicators
- Therapeutic milestones achieved
- Areas requiring continued focus
- Medication considerations (if any)

7. CLINICAL NOTES
- Therapist observations and insights
- Treatment modalities utilized
- Patient response to interventions
- Any safety concerns or risk factors

Format this as a professional clinical document suitable for medical records and healthcare provider review. Use clinical terminology appropriately while maintaining clarity.`;

    const reportResult = await model.generateContent(reportPrompt);
    const clinicalReport = reportResult.response.text();

    // Generate structured SOAP note
    const soapPrompt = `Based on the clinical report above, create a structured SOAP note in the following format:

SUBJECTIVE:
[Patient's reported symptoms, feelings, and concerns - 3-4 sentences]

OBJECTIVE:
[Observable behaviors, affect, and presentation - 3-4 sentences]

ASSESSMENT:
[Clinical analysis and diagnostic considerations - 3-4 sentences]

PLAN:
[Treatment recommendations and next steps - 3-4 sentences]

Keep each section concise but clinically comprehensive.`;

    const soapResult = await model.generateContent(soapPrompt);
    const soapNoteText = soapResult.response.text();

    // Parse SOAP note sections
    const sections = {
      subjective: extractSection(soapNoteText, 'SUBJECTIVE'),
      objective: extractSection(soapNoteText, 'OBJECTIVE'),
      assessment: extractSection(soapNoteText, 'ASSESSMENT'),
      plan: extractSection(soapNoteText, 'PLAN'),
    };

    // Generate risk assessment
    const riskPrompt = `Based on the therapy sessions, provide a brief risk assessment:
    
    Risk Level: [LOW/MODERATE/HIGH]
    Suicide Risk: [NONE/LOW/MODERATE/HIGH]
    Self-Harm Risk: [NONE/LOW/MODERATE/HIGH]
    Substance Use Risk: [NONE/LOW/MODERATE/HIGH]
    
    Justification: [Brief explanation of risk factors]
    Recommendations: [Safety planning recommendations]`;

    const riskResult = await model.generateContent(riskPrompt);
    const riskAssessment = riskResult.response.text();

    // Store the comprehensive report in database
    const { data: soapNote, error: soapError } = await supabase
      .from('soap_notes')
      .insert({
        patient_id: patientId,
        doctor_id: doctorId,
        subjective: sections.subjective,
        objective: sections.objective,
        assessment: sections.assessment,
        plan: sections.plan,
        clinical_report: clinicalReport,
        risk_assessment: riskAssessment,
        session_count: messages.length,
        session_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (soapError) {
      throw soapError;
    }

    return NextResponse.json({
      soapNote,
      clinicalReport,
      riskAssessment,
      sessionsSummary: {
        totalSessions: messages.length,
        dateRange: {
          from: new Date(messages[messages.length - 1].created_at).toLocaleDateString(),
          to: new Date(messages[0].created_at).toLocaleDateString()
        }
      },
      success: true,
    });
  } catch (error: any) {
    console.error('Error generating clinical report:', error);
    return NextResponse.json(
      { error: 'Failed to generate clinical report', details: error.message },
      { status: 500 }
    );
  }
}

function extractSection(text: string, sectionName: string): string {
  const regex = new RegExp(`${sectionName}:?\\s*([\\s\\S]*?)(?=\\n\\n[A-Z]+:|$)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : 'Not available';
}

export const runtime = 'nodejs';
