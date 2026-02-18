'use client';

import { useState } from 'react';
import { FileText, ExternalLink, Users, AlertTriangle, CheckCircle, RefreshCw, Download } from '@/components/icons';
import type { AnalysisReport } from '@/hooks/useAnalysisWorkflow';

interface ReportStageProps {
  report: AnalysisReport;
  onReset: () => void;
}

export function ReportStage({ report, onReset }: ReportStageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'parties' | 'links'>('overview');

  const downloadReport = () => {
    const reportText = `
FORENSIC ANALYSIS REPORT
========================

SUMMARY:
${report.summary}

THE NOISE (Surface Narrative):
${report.noise}

THE SILENCE (What's Hidden):
${report.silence}

THE REALITY (Reconstructed Truth):
${report.reality}

PARTIES INVOLVED:
${report.parties.map(p => `
- ${p.name} (${p.archetype}, ${p.element})
  Motivation: ${p.motivation}
  Tactics: ${p.tactics.join(', ')}
  Silences: ${p.silences.join(', ')}
`).join('')}

SYSTEMIC SHADOW (Silent Stakeholders):
${report.systemicShadow.map(s => `- ${s}`).join('\n')}

GOLDEN SEAMS (Path to Resolution):
${report.goldenSeams.map(s => `- ${s}`).join('\n')}

REFERENCE LINKS:
${report.links.map(l => `- ${l.title}: ${l.url}`).join('\n')}
`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'forensic-analysis-report.txt';
    a.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 border border-accent/30 rounded-full flex items-center justify-center glow-red">
            <FileText className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-black text-text-primary">FORENSIC ANALYSIS COMPLETE</h2>
            <p className="text-text-secondary text-sm">Obsidian Prism Deconstruction Report</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadReport}
            className="px-4 py-2 border border-border hover:border-accent text-text-muted hover:text-accent transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 bg-accent hover:bg-accent-dark text-white transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            New Analysis
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-surface border border-border p-6">
        <h3 className="text-sm font-bold text-accent uppercase tracking-wider mb-3">Executive Summary</h3>
        <p className="text-text-primary leading-relaxed">{report.summary}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {[
          { id: 'overview', label: 'Overview', icon: AlertTriangle },
          { id: 'parties', label: 'Parties', icon: Users },
          { id: 'links', label: 'References', icon: ExternalLink },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 text-sm font-medium uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* The Noise */}
            <div className="border-l-4 border-red-500 pl-4 py-2">
              <h4 className="text-red-500 font-bold uppercase tracking-wider text-sm mb-2">THE NOISE</h4>
              <p className="text-text-secondary">{report.noise}</p>
            </div>

            {/* The Silence */}
            <div className="border-l-4 border-yellow-500 pl-4 py-2">
              <h4 className="text-yellow-500 font-bold uppercase tracking-wider text-sm mb-2">THE SILENCE</h4>
              <p className="text-text-secondary">{report.silence}</p>
            </div>

            {/* The Reality */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h4 className="text-green-500 font-bold uppercase tracking-wider text-sm mb-2">THE REALITY</h4>
              <p className="text-text-primary">{report.reality}</p>
            </div>

            {/* Systemic Shadow */}
            <div className="bg-surface/50 border border-border p-4">
              <h4 className="text-text-muted font-bold uppercase tracking-wider text-sm mb-3">Systemic Shadow (Silent Stakeholders)</h4>
              <div className="flex flex-wrap gap-2">
                {report.systemicShadow.map((shadow, i) => (
                  <span key={i} className="px-3 py-1 bg-background border border-border text-text-secondary text-sm">
                    {shadow}
                  </span>
                ))}
              </div>
            </div>

            {/* Golden Seams */}
            <div className="bg-accent/5 border border-accent/30 p-4">
              <h4 className="text-accent font-bold uppercase tracking-wider text-sm mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Golden Seams (Path Forward)
              </h4>
              <ul className="space-y-2">
                {report.goldenSeams.map((seam, i) => (
                  <li key={i} className="text-text-primary flex items-start gap-2">
                    <span className="text-accent">{i + 1}.</span>
                    {seam}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'parties' && (
          <div className="space-y-4">
            {report.parties.map((party, index) => (
              <div key={party.id} className="bg-surface border border-border p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-text-primary font-bold">{party.name}</h4>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-accent/10 text-accent">{party.archetype}</span>
                      <span className="text-xs px-2 py-0.5 bg-border text-text-muted">{party.element}</span>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-text-muted">{String(index + 1).padStart(2, '0')}</span>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-text-muted uppercase tracking-wider text-xs">Motivation:</span>
                    <p className="text-text-secondary mt-1">{party.motivation}</p>
                  </div>
                  
                  <div>
                    <span className="text-text-muted uppercase tracking-wider text-xs">Tactics:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {party.tactics.map((tactic, i) => (
                        <span key={i} className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs">
                          {tactic}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-text-muted uppercase tracking-wider text-xs">Silences (What they hide):</span>
                    <ul className="mt-1 space-y-1">
                      {party.silences.map((silence, i) => (
                        <li key={i} className="text-yellow-500/80 flex items-center gap-2">
                          <span className="w-1 h-1 bg-yellow-500 rounded-full" />
                          {silence}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'links' && (
          <div className="space-y-3">
            <p className="text-text-muted text-sm mb-4">Reference materials for further investigation:</p>
            {report.links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-surface border border-border hover:border-accent p-4 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
                    <span className="text-text-primary group-hover:text-accent transition-colors">
                      {link.title}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted uppercase tracking-wider">{link.url}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-text-muted border-t border-border pt-4">
        <p>Generated by Burrow Forensic Engine using the Maha-Tahto Sutra framework</p>
        <p className="mt-1 italic">&ldquo;The wound is the doorway for the Light&rdquo;</p>
      </div>
    </div>
  );
}
