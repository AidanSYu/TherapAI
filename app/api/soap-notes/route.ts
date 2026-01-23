import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

export async function POST(request: NextRequest) {
  try {
    const { patientId, doctorId } = await request.json();

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
      .limit(10);

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
      .select('full_name')
      .eq('user_id', patientId)
      .single();

    // Initialize LangChain with OpenAI
    const model = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.3,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Create conversation context
    const conversationSummary = messages
      .reverse()
      .map((msg) => `Patient: ${msg.message}\nTherapist: ${msg.response}`)
      .join('\n\n');

    // Create the system message for generating SOAP notes
    const systemMessage = new SystemMessage(
      `You are a professional medical documentation assistant. Generate a comprehensive SOAP note based on the therapy session transcript provided. Format the note with clear sections:

SUBJECTIVE: Patient's reported symptoms, feelings, and concerns
OBJECTIVE: Observable behaviors, affect, and presentation during sessions
ASSESSMENT: Clinical analysis, patterns identified, and mental health considerations
PLAN: Treatment recommendations, follow-up actions, and interventions

Keep it professional, concise, and clinically relevant.`
    );

    const humanMessage = new HumanMessage(
      `Patient Name: ${patientProfile?.full_name || 'Unknown'}\n\nRecent Session Transcript:\n${conversationSummary}\n\nPlease generate a SOAP note for this therapy session.`
    );

    // Generate SOAP note
    const response = await model.invoke([systemMessage, humanMessage]);
    const soapNoteText = response.content.toString();

    // Parse SOAP note sections (simplified parsing)
    const sections = {
      subjective: extractSection(soapNoteText, 'SUBJECTIVE'),
      objective: extractSection(soapNoteText, 'OBJECTIVE'),
      assessment: extractSection(soapNoteText, 'ASSESSMENT'),
      plan: extractSection(soapNoteText, 'PLAN'),
    };

    // Store the SOAP note in database
    const { data: soapNote, error: soapError } = await supabase
      .from('soap_notes')
      .insert({
        patient_id: patientId,
        doctor_id: doctorId,
        subjective: sections.subjective,
        objective: sections.objective,
        assessment: sections.assessment,
        plan: sections.plan,
        session_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (soapError) {
      throw soapError;
    }

    return NextResponse.json({
      soapNote,
      success: true,
    });
  } catch (error: any) {
    console.error('Error generating SOAP note:', error);
    return NextResponse.json(
      { error: 'Failed to generate SOAP note', details: error.message },
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
