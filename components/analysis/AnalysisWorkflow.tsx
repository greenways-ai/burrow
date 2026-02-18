'use client';

import { useState } from 'react';
import { useAnalysisWorkflow, type AnalysisReport } from '@/hooks/useAnalysisWorkflow';
import { InputStage } from './InputStage';
import { EmotionalStage } from './EmotionalStage';
import { ReportStage } from './ReportStage';
import { Loader2 } from '@/components/icons';

interface AnalysisWorkflowProps {
  onComplete?: () => void;
}

export function AnalysisWorkflow({ onComplete }: AnalysisWorkflowProps) {
  const { 
    stage, 
    data, 
    submitInput, 
    submitEmotionalResponse, 
    submitAnalysis,
    reset 
  } = useAnalysisWorkflow();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleEmotionalSubmit = async (response: string) => {
    submitEmotionalResponse(response);
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch('/api/analyze/conflict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: data.sourceContent,
          emotionalResponse: response,
        }),
      });

      if (!res.ok) {
        throw new Error('Analysis failed');
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let fullContent = '';
      let report: AnalysisReport | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          try {
            const parsed = JSON.parse(trimmed.slice(6));
            
            if (parsed.report) {
              report = parsed.report;
            } else if (parsed.content) {
              fullContent += parsed.content;
            }
          } catch {
            continue;
          }
        }
      }

      // If we got a structured report, use it
      if (report) {
        submitAnalysis(report);
      } else {
        // Fallback: create a basic report from raw content
        const fallbackReport: AnalysisReport = {
          summary: 'Analysis completed. Raw output below.',
          noise: fullContent.slice(0, 500),
          silence: 'See full output',
          reality: fullContent,
          parties: [],
          systemicShadow: [],
          goldenSeams: [],
          links: [],
        };
        submitAnalysis(fallbackReport);
      }

      onComplete?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      setAnalysisError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Render appropriate stage
  switch (stage) {
    case 'INIT':
    case 'INPUT':
      return <InputStage onSubmit={submitInput} />;

    case 'EMOTIONAL':
      return (
        <EmotionalStage 
          sourcePreview={data.sourceContent.slice(0, 200) + '...'}
          onSubmit={handleEmotionalSubmit}
        />
      );

    case 'ANALYZING':
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin mb-4" />
          <h3 className="text-xl font-bold text-text-primary mb-2">ANALYZING NARRATIVE</h3>
          <p className="text-text-secondary">The Obsidian Prism is deconstructing the fracture...</p>
          {analysisError && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 text-red-400">
              Error: {analysisError}
              <button onClick={reset} className="ml-4 underline">Try Again</button>
            </div>
          )}
        </div>
      );

    case 'REPORT':
      if (!data.analysisReport) return null;
      return <ReportStage report={data.analysisReport} onReset={reset} />;

    default:
      return null;
  }
}
