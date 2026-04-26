import Link from 'next/link';
import { Activity, Users, MessageCircle } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            TherapAI
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Serverless Mental Health Platform with AI-Powered Care
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            A scalable, secure platform connecting patients with mental health professionals,
            enhanced by AI-driven insights and analytics.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
          {/* Patient Portal Card - Local Version */}
          <Link
            href="/patient-local"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border-2 border-green-200"
          >
            <div className="flex items-center mb-4">
              <MessageCircle className="w-12 h-12 text-green-600 mr-4" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Patient Portal</h2>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">No Setup Required</span>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Access your AI-powered mental health assistant. Works immediately with local storage.
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>• Chat with Dr. Sarah (AI therapist)</li>
              <li>• Automatic mood tracking</li>
              <li>• Session history & analytics</li>
              <li>• Crisis detection & resources</li>
            </ul>
          </Link>

          {/* Doctor Dashboard Card */}
          <Link
            href="/demo"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center mb-4">
              <Users className="w-12 h-12 text-indigo-600 mr-4" />
              <h2 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Experience the clinical interface for healthcare providers.
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>• Patient analytics & reports</li>
              <li>• AI-generated SOAP notes</li>
              <li>• Treatment progress tracking</li>
              <li>• Risk assessment tools</li>
            </ul>
          </Link>
        </div>

        {/* Demo Link */}
        <div className="text-center mb-8">
          <Link
            href="/demo"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Activity className="w-5 h-5 mr-2" />
            Try Interactive Demo
          </Link>
          <p className="text-sm text-gray-600 mt-2">
            Experience the interface without any setup
          </p>
        </div>

        <div className="mt-16 text-center">
          <div className="flex items-center justify-center space-x-8 text-gray-600 mb-4">
            <div className="flex items-center">
              <Activity className="w-6 h-6 mr-2 text-green-600" />
              <span>No Database Required</span>
            </div>
            <div className="flex items-center">
              <Activity className="w-6 h-6 mr-2 text-purple-600" />
              <span>Local Storage</span>
            </div>
            <div className="flex items-center">
              <Activity className="w-6 h-6 mr-2 text-blue-600" />
              <span>AI-Powered</span>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <a
              href="/status"
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              System Status
            </a>
            <span className="text-gray-300">•</span>
            <a
              href="https://github.com/AidanSYu/TherapAI"
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              GitHub
            </a>
            <span className="text-gray-300">•</span>
            <a
              href="/SETUP_GUIDE.md"
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Setup Guide
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
