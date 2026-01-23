import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json();

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Message and userId are required' },
        { status: 400 }
      );
    }

    // Initialize LangChain with OpenAI
    const model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Create the system message for the AI therapist
    const systemMessage = new SystemMessage(
      `You are a compassionate and professional AI mental health assistant. Your role is to:
      - Listen actively and empathetically to the patient
      - Provide supportive responses without diagnosing
      - Encourage healthy coping mechanisms
      - Remind users to seek professional help for serious concerns
      - Maintain patient confidentiality
      - Ask thoughtful follow-up questions to understand the patient's feelings
      Keep responses concise, warm, and professional.`
    );

    const humanMessage = new HumanMessage(message);

    // Get response from LangChain
    const response = await model.invoke([systemMessage, humanMessage]);
    const aiResponse = response.content.toString();

    // Store the conversation in Supabase
    const supabase = await createClient();
    const { error: dbError } = await supabase.from('chat_messages').insert({
      patient_id: userId,
      message,
      response: aiResponse,
    });

    if (dbError) {
      console.error('Error storing message:', dbError);
      // Continue anyway - we still want to return the response
    }

    return NextResponse.json({
      response: aiResponse,
      success: true,
    });
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process message', details: error.message },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
