'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface SystemStatus {
  geminiAPI: 'working' | 'error' | 'checking';
  localStorage: 'working' | 'error' | 'checking';
  fileStorage: 'working' | 'error' | 'checking';
}

export default function StatusPage() {
  const [status, setStatus] = useState<SystemStatus>({
    geminiAPI: 'checking',
    localStorage: 'checking',
    fileStorage: 'checking'
  });

  const [geminiError, setGeminiError] = useState<string>('');

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    // Check localStorage
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      setStatus(prev => ({ ...prev, localStorage: 'working' }));
    } catch (error) {
      setStatus(prev => ({ ...prev, localStorage: 'error' }));
    }

    // Check Gemini API
    try {
      const response = await fetch('/api/chat-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hello, this is a test',
          userId: 'test-user'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        if (data.usingFallback) {
          setStatus(prev => ({ ...prev, geminiAPI: 'error' }));
          setGeminiError('Using fallback responses - Gemini API not configured or not working');
        } else {
          setStatus(prev => ({ ...prev, geminiAPI: 'working' }));
        }
      } else {
        setStatus(prev => ({ ...prev, geminiAPI: 'error' }));
        setGeminiError(data.error || 'Unknown error');
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, geminiAPI: 'error' }));
      setGeminiError('Failed to connect to API');
    }

    // Check file storage (always working in this implementation)
    setStatus(prev => ({ ...prev, fileStorage: 'working' }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'working':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'checking':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'working':
        return 'Working';
      case 'error':
        return 'Error';
      case 'checking':
        return 'Checking...';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'checking':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">TherapAI System Status</h1>
            <p className="text-gray-600">Current status of all system components</p>
          </div>

          {/* Overall Status */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Overall System Status</h2>
                <p className="text-gray-600 mt-1">
                  {status.localStorage === 'working' && status.fileStorage === 'working' 
                    ? 'System is operational' 
                    : 'Some components have issues'}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full border ${
                status.localStorage === 'working' && status.fileStorage === 'working'
                  ? 'text-green-600 bg-green-50 border-green-200'
                  : 'text-yellow-600 bg-yellow-50 border-yellow-200'
              }`}>
                {status.localStorage === 'working' && status.fileStorage === 'working' 
                  ? 'Operational' 
                  : 'Partial Outage'}
              </div>
            </div>
          </div>

          {/* Component Status */}
          <div className="grid md:grid-cols-1 gap-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Component Status</h3>
              </div>
              <div className="p-6 space-y-4">
                {/* Google Gemini API */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(status.geminiAPI)}
                    <div>
                      <h4 className="font-medium text-gray-900">Google Gemini API</h4>
                      <p className="text-sm text-gray-600">AI-powered therapeutic responses</p>
                      {geminiError && (
                        <p className="text-sm text-red-600 mt-1">{geminiError}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full border text-sm ${getStatusColor(status.geminiAPI)}`}>
                    {getStatusText(status.geminiAPI)}
                  </span>
                </div>

                {/* Local Storage */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(status.localStorage)}
                    <div>
                      <h4 className="font-medium text-gray-900">Browser Storage</h4>
                      <p className="text-sm text-gray-600">Client-side data persistence</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full border text-sm ${getStatusColor(status.localStorage)}`}>
                    {getStatusText(status.localStorage)}
                  </span>
                </div>

                {/* File Storage */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(status.fileStorage)}
                    <div>
                      <h4 className="font-medium text-gray-900">File Storage</h4>
                      <p className="text-sm text-gray-600">Server-side data persistence</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full border text-sm ${getStatusColor(status.fileStorage)}`}>
                    {getStatusText(status.fileStorage)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <h3 className="font-semibold text-blue-900 mb-3">Troubleshooting</h3>
            
            {status.geminiAPI === 'error' && (
              <div className="mb-4">
                <h4 className="font-medium text-blue-800 mb-2">Google Gemini API Issues:</h4>
                <ul className="text-sm text-blue-700 space-y-1 ml-4">
                  <li>• Check if your API key is correct in the .env file</li>
                  <li>• Ensure Gemini API is enabled in Google Cloud Console</li>
                  <li>• Verify billing is enabled for your Google Cloud project</li>
                  <li>• Try generating a new API key at: https://makersuite.google.com/app/apikey</li>
                  <li>• The system will use fallback responses until API is fixed</li>
                </ul>
              </div>
            )}

            <div className="mb-4">
              <h4 className="font-medium text-blue-800 mb-2">Current Configuration:</h4>
              <ul className="text-sm text-blue-700 space-y-1 ml-4">
                <li>• <strong>Storage:</strong> Local browser storage + file system</li>
                <li>• <strong>AI:</strong> Google Gemini with intelligent fallbacks</li>
                <li>• <strong>Database:</strong> No external database required</li>
                <li>• <strong>Authentication:</strong> Simple local authentication</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-blue-800 mb-2">Quick Actions:</h4>
              <div className="flex space-x-3">
                <button
                  onClick={checkSystemStatus}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Refresh Status
                </button>
                <a
                  href="/patient-local"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                >
                  Try Patient Portal
                </a>
                <a
                  href="/demo"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                >
                  View Demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}