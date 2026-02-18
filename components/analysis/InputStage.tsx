'use client';

import { useState, useRef } from 'react';
import { Link, FileText, Upload, Globe, Scan } from '@/components/icons';

interface InputStageProps {
  onSubmit: (type: 'url' | 'file', content: string, metadata?: { fileName?: string; fileType?: string; url?: string }) => void;
}

export function InputStage({ onSubmit }: InputStageProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'file'>('url');
  const [url, setUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlSubmit = async () => {
    if (!url.trim()) return;
    setIsLoading(true);
    
    try {
      // Fetch URL content via API
      const response = await fetch('/api/analyze/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      if (!response.ok) throw new Error('Failed to fetch URL');
      
      const data = await response.json();
      onSubmit('url', data.content, { url, fileName: data.title });
    } catch (error) {
      console.error('URL fetch error:', error);
      // Fallback: submit URL as-is
      onSubmit('url', url, { url });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/analyze/document', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Failed to process document');
      
      const data = await response.json();
      onSubmit('file', data.content, { 
        fileName: file.name, 
        fileType: file.type 
      });
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const supportedTypes = 'PDF, Word, Images (.jpg, .png), Text files';

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 border border-accent/30 rounded-full flex items-center justify-center mx-auto mb-4 glow-red">
          <Scan className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-2xl font-black text-text-primary">BEGIN FORENSIC ANALYSIS</h2>
        <p className="text-text-secondary">
          Submit a narrative for the Obsidian Prism deconstruction
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-3 text-sm font-medium uppercase tracking-wider transition-colors ${
            activeTab === 'url'
              ? 'text-accent border-b-2 border-accent'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Globe className="w-4 h-4 inline mr-2" />
          URL
        </button>
        <button
          onClick={() => setActiveTab('file')}
          className={`flex-1 py-3 text-sm font-medium uppercase tracking-wider transition-colors ${
            activeTab === 'file'
              ? 'text-accent border-b-2 border-accent'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Document
        </button>
      </div>

      {/* URL Input */}
      {activeTab === 'url' && (
        <div className="space-y-4">
          <div className="relative">
            <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste article URL..."
              className="w-full pl-12 pr-4 py-4 bg-surface border border-border text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            />
          </div>
          <button
            onClick={handleUrlSubmit}
            disabled={!url.trim() || isLoading}
            className="w-full py-3 bg-accent hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold uppercase tracking-wider transition-all"
          >
            {isLoading ? 'FETCHING...' : 'ANALYZE URL'}
          </button>
        </div>
      )}

      {/* File Upload */}
      {activeTab === 'file' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-accent bg-accent/5'
              : 'border-border hover:border-accent/50'
          }`}
        >
          <Upload className="w-12 h-12 text-accent mx-auto mb-4" />
          <p className="text-text-primary font-medium mb-2">
            Drop document here or click to browse
          </p>
          <p className="text-text-muted text-sm">
            {supportedTypes}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
          />
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center gap-3 py-4">
          <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <span className="text-accent uppercase tracking-wider text-sm">Processing narrative...</span>
        </div>
      )}
    </div>
  );
}
