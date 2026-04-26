'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Heart, AlertTriangle, TrendingUp } from 'lucide-react';
import type { ChatMessage } from '@/types/database';

interface ChatInterfaceProps {
  userId: string;
  initialMessages: ChatMessage[];
}

interface SessionInsights {
  mood_indicators?: string[];
  key_themes?: string[];
  therapeutic_techniques_used?: string[];
  risk_level?: 'low' | 'moderate' | 'high';
  progress_notes?: string;
}

export default function ChatInterface({ userId, initialMessages }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Array<{ 
    role: 'user' | 'assistant'; 
    content: string; 
    timestamp?: Date;
    insights?: SessionInsights;
  }>>(
    initialMessages.flatMap((msg) => [
      { 
        role: 'user' as const, 
        content: msg.message,
        timestamp: new Date(msg.created_at)
      },
      { 
        role: 'assistant' as const, 
        content: msg.response,
        timestamp: new Date(msg.created_at),
        insights: msg.session_analysis as SessionInsights
      },
    ])
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const timestamp = new Date();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage, timestamp }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          userId,
          currentMood,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: data.response,
        timestamp: new Date(),
        insights: data.sessionInsights
      }]);
      
      // Reset mood after sending
      setCurrentMood(null);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, but I encountered an error. Please try again. If you\'re experiencing a crisis, please contact emergency services or a crisis hotline immediately.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskLevelColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getLatestInsights = () => {
    const assistantMessages = messages.filter(m => m.role === 'assistant' && m.insights);
    return assistantMessages[assistantMessages.length - 1]?.insights;
  };

  return (
    <div className="flex flex-col h-[700px]">
      {/* Header with Session Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Therapy Session with Dr. Sarah</h2>
            <p className="text-sm text-gray-600">Your AI Mental Health Companion</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowInsights(!showInsights)}
              className="px-3 py-1 text-sm bg-white rounded-full border hover:bg-gray-50 transition"
            >
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Insights
            </button>
            {getLatestInsights()?.risk_level && (
              <span className={`px-2 py-1 text-xs rounded-full ${getRiskLevelColor(getLatestInsights()?.risk_level)}`}>
                {getLatestInsights()?.risk_level?.toUpperCase()} RISK
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Session Insights Panel */}
      {showInsights && (
        <div className="bg-blue-50 p-4 border-b">
          <h3 className="font-medium text-gray-800 mb-2">Session Insights</h3>
          {getLatestInsights() ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {getLatestInsights()?.mood_indicators && (
                <div>
                  <span className="font-medium">Mood Indicators:</span>
                  <p className="text-gray-600">{getLatestInsights()?.mood_indicators?.join(', ')}</p>
                </div>
              )}
              {getLatestInsights()?.key_themes && (
                <div>
                  <span className="font-medium">Key Themes:</span>
                  <p className="text-gray-600">{getLatestInsights()?.key_themes?.join(', ')}</p>
                </div>
              )}
              {getLatestInsights()?.therapeutic_techniques_used && (
                <div>
                  <span className="font-medium">Techniques Used:</span>
                  <p className="text-gray-600">{getLatestInsights()?.therapeutic_techniques_used?.join(', ')}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">Start chatting to see session insights</p>
          )}
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <Heart className="w-12 h-12 mx-auto mb-4 text-blue-400" />
            <p className="text-lg font-medium">Welcome to your safe space</p>
            <p className="text-sm mt-2 max-w-md mx-auto">
              I'm Dr. Sarah, your AI therapist. This is a confidential space where you can share your thoughts and feelings. 
              I'm here to listen, support, and help you develop coping strategies.
            </p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg max-w-md mx-auto">
              <p className="text-xs text-blue-700">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                If you're having thoughts of self-harm or suicide, please contact emergency services (911) or the National Suicide Prevention Lifeline (988) immediately.
              </p>
            </div>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[75%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div
                className={`rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.timestamp && (
                <p className="text-xs text-gray-500 mt-1 px-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm text-gray-600">Dr. Sarah is typing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Mood Check-in */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="mb-3">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            How are you feeling right now? (1-10)
          </label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((mood) => (
              <button
                key={mood}
                onClick={() => setCurrentMood(mood)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition ${
                  currentMood === mood
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Very Low</span>
            <span>Excellent</span>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share what's on your mind..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Your conversations are confidential and used only to provide you with better support.
        </p>
      </div>
    </div>
  );
}
