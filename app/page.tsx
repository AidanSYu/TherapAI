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

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Patient Portal Card */}
          <Link
            href="/patient"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center mb-4">
              <MessageCircle className="w-12 h-12 text-blue-600 mr-4" />
              <h2 className="text-2xl font-bold text-gray-900">Patient Portal</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Access your AI-powered mental health assistant and manage your therapy sessions.
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>• Chat with AI therapist</li>
              <li>• View session history</li>
              <li>• Track your progress</li>
            </ul>
          </Link>

          {/* Doctor Dashboard Card */}
          <Link
            href="/doctor"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center mb-4">
              <Users className="w-12 h-12 text-indigo-600 mr-4" />
              <h2 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Monitor patients, view analytics, and generate AI-powered SOAP notes.
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>• Patient analytics</li>
              <li>• AI-generated SOAP notes</li>
              <li>• Session management</li>
            </ul>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <div className="flex items-center justify-center space-x-8 text-gray-600">
            <div className="flex items-center">
              <Activity className="w-6 h-6 mr-2 text-green-600" />
              <span>Serverless Architecture</span>
            </div>
            <div className="flex items-center">
              <Activity className="w-6 h-6 mr-2 text-purple-600" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center">
              <Activity className="w-6 h-6 mr-2 text-blue-600" />
              <span>AI-Powered</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
