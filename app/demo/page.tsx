'use client';

import { useState } from 'react';
import { Send, Heart, TrendingUp, AlertTriangle } from 'lucide-react';

export default function DemoPage() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>>([]);
  const [input, setInput] = useState('');
  const [currentMood, setCurrentMood] = useState<number | null>(null);

  const demoResponses = [
    "I hear that you're feeling anxious. That's completely understandable, and I want you to know that you're not alone in this experience. Can you tell me more about what specifically is making you feel anxious right now?",
    "It sounds like you're going through a challenging time. Thank you for sharing that with me. Let's explore some coping strategies that might help you manage these feelings. Have you tried any breathing exercises before?",
    "I can sense the weight of what you're carrying. Your feelings are valid, and it takes courage to reach out for support. What would feel most helpful for you right now - would you like to talk through what's bothering you, or explore some practical coping techniques?",
    "That must feel overwhelming. I'm here to support you through this. Sometimes when we're feeling this way, it can help to ground ourselves in the present moment. Can you tell me three things you can see around you right now?",
    "I appreciate you opening up about this. It shows real strength to acknowledge when we're struggling. Let's work together to find some strategies that can help you feel more balanced. What has helped you cope with difficult emotions in the past?"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    const timestamp = new Date();
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp }]);
    setInput('');

    // Simulate AI response after a short delay
    setTimeout(() => {
      const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
      setMessages(prev => [...prev, { role: 'assistant', content: randomResponse, timestamp: new Date() }]);
    }, 1000);

    setCurrentMood(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TherapAI Demo</h1>
              <p className="text-sm text-gray-600">Experience AI-powered therapeutic support</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                Demo Mode
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Demo Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Demo Mode Active</h3>
              <p className="text-sm text-blue-700 mt-1">
                This is a demonstration of the TherapAI interface. Responses are simulated and not from the actual AI therapist. 
                To use the full system, configure your Google Gemini API key and Supabase database.
              </p>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Therapy Session with Dr. Sarah</h2>
                <p className="text-sm text-gray-600">Your AI Mental Health Companion (Demo)</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs rounded-full bg-green-50 text-green-600 border border-green-200">
                  LOW RISK
                </span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
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
                  <p className="text-xs text-gray-500 mt-1 px-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
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
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Demo mode - responses are simulated for demonstration purposes.
            </p>
          </div>
        </div>

        {/* Demo Features */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <Heart className="w-8 h-8 text-red-500 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Empathetic AI</h3>
            <p className="text-sm text-gray-600">
              Dr. Sarah uses advanced AI to provide compassionate, evidence-based therapeutic responses.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <TrendingUp className="w-8 h-8 text-green-500 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Progress Tracking</h3>
            <p className="text-sm text-gray-600">
              Real-time mood tracking and session analysis help monitor your therapeutic journey.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Crisis Support</h3>
            <p className="text-sm text-gray-600">
              Built-in safety protocols and crisis detection ensure you get help when you need it most.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}