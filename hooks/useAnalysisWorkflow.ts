'use client';

import { useState, useCallback } from 'react';

export type AnalysisStage = 
  | 'INIT'
  | 'INPUT'
  | 'EMOTIONAL'
  | 'ANALYZING'
  | 'REPORT';

export interface AnalysisData {
  sourceType: 'url' | 'file' | null;
  sourceContent: string;
  sourceUrl?: string;
  fileName?: string;
  fileType?: string;
  emotionalResponse: string;
  analysisReport: AnalysisReport | null;
}

export interface ConflictParty {
  id: string;
  name: string;
  archetype: string;
  element: string;
  motivation: string;
  tactics: string[];
  silences: string[];
}

export interface AnalysisReport {
  summary: string;
  noise: string;
  silence: string;
  reality: string;
  parties: ConflictParty[];
  systemicShadow: string[];
  goldenSeams: string[];
  links: { title: string; url: string }[];
}

interface UseAnalysisWorkflowReturn {
  stage: AnalysisStage;
  data: AnalysisData;
  setStage: (stage: AnalysisStage) => void;
  submitInput: (type: 'url' | 'file', content: string, metadata?: { fileName?: string; fileType?: string; url?: string }) => void;
  submitEmotionalResponse: (response: string) => void;
  submitAnalysis: (report: AnalysisReport) => void;
  reset: () => void;
}

const initialData: AnalysisData = {
  sourceType: null,
  sourceContent: '',
  emotionalResponse: '',
  analysisReport: null,
};

export function useAnalysisWorkflow(): UseAnalysisWorkflowReturn {
  const [stage, setStage] = useState<AnalysisStage>('INIT');
  const [data, setData] = useState<AnalysisData>(initialData);

  const submitInput = useCallback((
    type: 'url' | 'file', 
    content: string, 
    metadata?: { fileName?: string; fileType?: string; url?: string }
  ) => {
    setData(prev => ({
      ...prev,
      sourceType: type,
      sourceContent: content,
      fileName: metadata?.fileName,
      fileType: metadata?.fileType,
      sourceUrl: metadata?.url,
    }));
    setStage('EMOTIONAL');
  }, []);

  const submitEmotionalResponse = useCallback((response: string) => {
    setData(prev => ({
      ...prev,
      emotionalResponse: response,
    }));
    setStage('ANALYZING');
  }, []);

  const submitAnalysis = useCallback((report: AnalysisReport) => {
    setData(prev => ({
      ...prev,
      analysisReport: report,
    }));
    setStage('REPORT');
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
    setStage('INIT');
  }, []);

  return {
    stage,
    data,
    setStage,
    submitInput,
    submitEmotionalResponse,
    submitAnalysis,
    reset,
  };
}
