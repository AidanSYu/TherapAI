'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, User, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface TherapeuticReport {
  id: string;
  patient_id: string;
  comprehensive_report: string;
  treatment_metrics: any;
  session_count: number;
  report_date: string;
  created_at: string;
}

interface Patient {
  id: string;
  full_name: string;
  age?: number;
  gender?: string;
}

interface TherapeuticReportViewerProps {
  doctorId: string;
  patients: Patient[];
}

export default function TherapeuticReportViewer({ doctorId, patients }: TherapeuticReportViewerProps) {
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [reports, setReports] = useState<TherapeuticReport[]>([]);
  const [currentReport, setCurrentReport] = useState<TherapeuticReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateReport = async (patientId: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/therapeutic-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId,
          doctorId,
          reportType: 'comprehensive'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();
      
      // Add the new report to the list
      const newReport: TherapeuticReport = {
        id: Date.now().toString(),
        patient_id: patientId,
        comprehensive_report: data.therapeuticReport,
        treatment_metrics: data.treatmentMetrics,
        session_count: data.sessionAnalysis?.totalSessions || 0,
        report_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      };
      
      setReports(prev => [newReport, ...prev]);
      setCurrentReport(newReport);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSOAPNote = async (patientId: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/soap-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId,
          doctorId,
          sessionCount: 10
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate SOAP note');
      }

      const data = await response.json();
      alert('SOAP note generated successfully!');
      console.log('SOAP Note:', data.soapNote);
    } catch (error) {
      console.error('Error generating SOAP note:', error);
      alert('Failed to generate SOAP note. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = (report: TherapeuticReport) => {
    const patient = patients.find(p => p.id === report.patient_id);
    const content = `
COMPREHENSIVE THERAPEUTIC REPORT
Generated: ${new Date(report.created_at).toLocaleDateString()}
Patient: ${patient?.full_name || 'Unknown'}
Sessions Analyzed: ${report.session_count}

${report.comprehensive_report}

---
Treatment Metrics:
${JSON.stringify(report.treatment_metrics, null, 2)}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `therapeutic-report-${patient?.full_name?.replace(/\s+/g, '-')}-${report.report_date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Therapeutic Reports</h1>
        <p className="text-gray-600">Generate and review comprehensive clinical reports for your patients</p>
      </div>

      {/* Patient Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Select Patient</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className={`p-4 border rounded-lg cursor-pointer transition ${
                selectedPatient === patient.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedPatient(patient.id)}
            >
              <div className="flex items-center space-x-3">
                <User className="w-8 h-8 text-gray-400" />
                <div>
                  <h3 className="font-medium">{patient.full_name}</h3>
                  <p className="text-sm text-gray-500">
                    {patient.age && `Age: ${patient.age}`}
                    {patient.age && patient.gender && ' • '}
                    {patient.gender}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedPatient && (
          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => generateReport(selectedPatient)}
              disabled={isGenerating}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center space-x-2"
            >
              <FileText className="w-5 h-5" />
              <span>{isGenerating ? 'Generating...' : 'Generate Comprehensive Report'}</span>
            </button>
            <button
              onClick={() => generateSOAPNote(selectedPatient)}
              disabled={isGenerating}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>{isGenerating ? 'Generating...' : 'Generate SOAP Note'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Current Report Display */}
      {currentReport && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Therapeutic Report</h2>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {patients.find(p => p.id === currentReport.patient_id)?.full_name}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(currentReport.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {currentReport.session_count} Sessions
                  </span>
                </div>
              </div>
              <button
                onClick={() => downloadReport(currentReport)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Treatment Metrics */}
          {currentReport.treatment_metrics && (
            <div className="p-6 border-b bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">Treatment Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentReport.treatment_metrics.treatment_duration_weeks && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {currentReport.treatment_metrics.treatment_duration_weeks}
                    </div>
                    <div className="text-sm text-gray-600">Weeks in Treatment</div>
                  </div>
                )}
                {currentReport.treatment_metrics.therapeutic_alliance_score && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {currentReport.treatment_metrics.therapeutic_alliance_score}/10
                    </div>
                    <div className="text-sm text-gray-600">Alliance Score</div>
                  </div>
                )}
                {currentReport.treatment_metrics.symptom_improvement_percentage && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {currentReport.treatment_metrics.symptom_improvement_percentage}
                    </div>
                    <div className="text-sm text-gray-600">Improvement</div>
                  </div>
                )}
                {currentReport.treatment_metrics.discharge_readiness_score && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {currentReport.treatment_metrics.discharge_readiness_score}/10
                    </div>
                    <div className="text-sm text-gray-600">Discharge Readiness</div>
                  </div>
                )}
              </div>

              {/* Risk Level Indicator */}
              {currentReport.treatment_metrics.risk_level_progression && (
                <div className="mt-4 flex items-center justify-center space-x-4">
                  <div className={`px-3 py-1 rounded-full border text-sm ${getRiskLevelColor(currentReport.treatment_metrics.risk_level_progression.initial)}`}>
                    Initial: {currentReport.treatment_metrics.risk_level_progression.initial?.toUpperCase()}
                  </div>
                  <span className="text-gray-400">→</span>
                  <div className={`px-3 py-1 rounded-full border text-sm ${getRiskLevelColor(currentReport.treatment_metrics.risk_level_progression.current)}`}>
                    Current: {currentReport.treatment_metrics.risk_level_progression.current?.toUpperCase()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Report Content */}
          <div className="p-6">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {currentReport.comprehensive_report}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!currentReport && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Report Selected</h3>
          <p className="text-gray-600">Select a patient and generate a comprehensive therapeutic report to get started.</p>
        </div>
      )}
    </div>
  );
}