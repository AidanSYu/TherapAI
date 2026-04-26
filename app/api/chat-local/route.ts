import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Fallback responses for when API is not available
const fallbackResponses = [
  "I hear that you're going through a difficult time, and I want you to know that your feelings are completely valid. It takes courage to reach out and share what you're experiencing. Can you tell me more about what's been weighing on your mind lately?",
  
  "Thank you for trusting me with your thoughts. I can sense that this is important to you, and I'm here to listen and support you through this. What would feel most helpful for you right now - would you like to explore these feelings further, or would you prefer to focus on some coping strategies?",
  
  "I appreciate you opening up about this. Your willingness to share shows real strength, even when things feel overwhelming. Sometimes when we're struggling, it can help to ground ourselves in the present moment. Can you tell me three things you can see around you right now?",
  
  "What you're describing sounds really challenging, and I want to acknowledge how difficult this must be for you. You're not alone in feeling this way, and it's okay to not have all the answers right now. Have you noticed any patterns in when these feelings tend to be stronger or lighter?",
  
  "I can hear the pain in your words, and I want you to know that seeking support is a sign of wisdom, not weakness. Let's work together to find some strategies that might help you feel more balanced. What has helped you cope with difficult emotions in the past, even if it was just a little bit?"
];

// Simple file-based storage for server-side persistence
class ServerStorage {
  private dataDir = path.join(process.cwd(), 'data');

  constructor() {
    // Ensure data directory exists
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private getFilePath(type: string): string {
    return path.join(this.dataDir, `${type}.json`);
  }

  private readData<T>(type: string): T[] {
    try {
      const filePath = this.getFilePath(type);
      if (!fs.existsSync(filePath)) {
        return [];
      }
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${type}:`, error);
      return [];
    }
  }

  private writeData<T>(type: string, data: T[]): void {
    try {
      const filePath = this.getFilePath(type);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error writing ${type}:`, error);
    }
  }

  saveChatMessage(patientId: string, message: string, response: string, sessionAnalysis?: any, moodScore?: number) {
    const chatMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      patient_id: patientId,
      message,
      response,
      session_analysis: sessionAnalysis,
      mood_score: moodScore,
      risk_level: sessionAnalysis?.risk_level || 'low',
      created_at: new Date().toISOString()
    };

    const messages = this.readData('chat_messages');
    messages.push(chatMessage);
    this.writeData('chat_messages', messages);

    return chatMessage;
  }

  getChatMessages(patientId: string, limit: number = 5) {
    const messages = this.readData('chat_messages');
    return messages
      .filter((msg: any) => msg.patient_id === patientId)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }
}

const storage = new ServerStorage();

async function tryGeminiAPI(prompt: string): Promise<string | null> {
  if (!process.env.GOOGLE_API_KEY) {
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // Try different model names that should work
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (error) {
        console.log(`Model ${modelName} failed, trying next...`);
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Gemini API error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, userId, currentMood } = await request.json();

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Message and userId are required' },
        { status: 400 }
      );
    }

    // Get conversation history for context
    const previousMessages = storage.getChatMessages(userId, 5);

    // Build conversation context
    let conversationContext = '';
    if (previousMessages && previousMessages.length > 0) {
      conversationContext = previousMessages
        .reverse()
        .map((msg: any) => `Patient: ${msg.message}\nTherapist: ${msg.response}`)
        .join('\n\n');
    }

    // Enhanced therapeutic system prompt
    const systemPrompt = `You are Dr. Sarah, a compassionate and highly skilled AI mental health therapist with expertise in cognitive behavioral therapy (CBT), mindfulness-based interventions, and trauma-informed care. Your approach is:

THERAPEUTIC PRINCIPLES:
- Use active listening and reflective responses
- Validate emotions while gently challenging negative thought patterns
- Ask open-ended questions to promote self-reflection
- Provide evidence-based coping strategies when appropriate
- Maintain professional boundaries while being warm and empathetic
- Always prioritize patient safety and well-being

RESPONSE GUIDELINES:
- Keep responses between 2-4 sentences for better engagement
- Use "I" statements to show empathy ("I can hear that you're feeling...")
- Reflect back emotions and key themes
- Ask one thoughtful follow-up question per response
- Suggest practical coping techniques when relevant
- Encourage professional help for serious concerns (suicidal ideation, severe symptoms)

SAFETY PROTOCOLS:
- If patient mentions self-harm or suicide, immediately provide crisis resources
- For severe symptoms, gently suggest professional in-person care
- Remind patients this is supportive care, not a replacement for professional therapy

Remember: You're creating a safe, non-judgmental space for healing and growth.`;

    const fullPrompt = `${systemPrompt}

${conversationContext ? `Previous conversation context:\n${conversationContext}\n\n` : ''}

${currentMood ? `Patient's current mood level (1-10): ${currentMood}\n` : ''}

Current patient message: "${message}"

Please respond as Dr. Sarah, the AI therapist:`;

    // Try Gemini API first, fallback to predefined responses
    let aiResponse = await tryGeminiAPI(fullPrompt);
    
    if (!aiResponse) {
      // Use fallback response
      const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
      aiResponse = fallbackResponses[randomIndex];
      console.log('Using fallback response - Gemini API not available');
    }

    // Create session analysis (simplified for fallback)
    const sessionAnalysis = {
      mood_indicators: currentMood ? [`mood_rating_${currentMood}`] : ['conversational_engagement'],
      key_themes: ['emotional_support', 'therapeutic_conversation'],
      therapeutic_techniques_used: ['active_listening', 'empathetic_response'],
      risk_level: 'low',
      progress_notes: 'Patient engaged in therapeutic conversation'
    };

    // Store the conversation
    const savedMessage = storage.saveChatMessage(userId, message, aiResponse, sessionAnalysis, currentMood);

    return NextResponse.json({
      response: aiResponse,
      sessionInsights: sessionAnalysis,
      success: true,
      usingFallback: !process.env.GOOGLE_API_KEY || aiResponse === fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
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