'use client';

import { useState } from 'react';
import { FileText, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface Patient {
  id: string;
  user_id: string;
  full_name: string;
  created_at: string;
  users?: { email: string };
}

interface PatientListProps {
  patients: Patient[];
  doctorId: string;
}

export default function PatientList({ patients, doctorId }: PatientListProps) {
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNote, setGeneratedNote] = useState<string>('');

  const togglePatient = (patientId: string) => {
    setExpandedPatient(expandedPatient === patientId ? null : patientId);
    setGeneratedNote('');
  };

  const handleGenerateSOAP = async (patientId: string) => {
    setIsGenerating(true);
    setGeneratedNote('');

    try {
      const response = await fetch('/api/soap-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId,
          doctorId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate SOAP note');
      }

      const data = await response.json();
      setGeneratedNote(JSON.stringify(data.soapNote, null, 2));
    } catch (error) {
      console.error('Error generating SOAP note:', error);
      setGeneratedNote('Error generating SOAP note. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6">
      {patients.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p>No patients registered yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {patients.map((patient) => (
            <div key={patient.id} className="border border-gray-200 rounded-lg">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => togglePatient(patient.user_id)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {patient.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{patient.full_name}</h3>
                    <p className="text-sm text-gray-500">{patient.users?.email}</p>
                  </div>
                </div>
                {expandedPatient === patient.user_id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>

              {expandedPatient === patient.user_id && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={() => window.location.href = `/doctor/analytics/${patient.user_id}`}
                      className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      View Analytics
                    </button>
                    <button
                      onClick={() => handleGenerateSOAP(patient.user_id)}
                      disabled={isGenerating}
                      className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      {isGenerating ? 'Generating...' : 'Generate SOAP Note'}
                    </button>
                  </div>

                  {generatedNote && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Generated SOAP Note</h4>
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                        {generatedNote}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
