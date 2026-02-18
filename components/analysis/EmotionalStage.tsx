'use client';

import { useState } from 'react';
import { Heart, ArrowRight } from '@/components/icons';

interface EmotionalStageProps {
  sourcePreview: string;
  onSubmit: (response: string) => void;
}

const emotionalOptions = [
  { id: 'angry', label: 'Angry / Frustrated', emoji: '😠', archetype: 'Fire' },
  { id: 'anxious', label: 'Anxious / Worried', emoji: '😰', archetype: 'Earth' },
  { id: 'confused', label: 'Confused / Uncertain', emoji: '😕', archetype: 'Water' },
  { id: 'skeptical', label: 'Skeptical / Suspicious', emoji: '🤔', archetype: 'Metal' },
  { id: 'sympathetic', label: 'Sympathetic / Concerned', emoji: '💚', archetype: 'Wood' },
  { id: 'curious', label: 'Curious / Neutral', emoji: '🧐', archetype: 'Space' },
];

export function EmotionalStage({ sourcePreview, onSubmit }: EmotionalStageProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [customResponse, setCustomResponse] = useState('');

  const handleSubmit = () => {
    const response = selectedEmotion 
      ? `${emotionalOptions.find(e => e.id === selectedEmotion)?.label}. ${customResponse}`
      : customResponse;
    onSubmit(response);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 border border-accent/30 rounded-full flex items-center justify-center mx-auto mb-4 glow-red">
          <Heart className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-2xl font-black text-text-primary">EMOTIONAL GROUNDING</h2>
        <p className="text-text-secondary">
          Before analysis, we must understand your position in the field
        </p>
      </div>

      {/* Source Preview */}
      {sourcePreview && (
        <div className="bg-surface border border-border p-4 rounded">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Source Material</p>
          <p className="text-text-primary text-sm line-clamp-3">{sourcePreview}</p>
        </div>
      )}

      {/* Emotional Selector */}
      <div className="space-y-3">
        <p className="text-sm text-text-primary font-medium">How does this narrative make you feel?</p>
        <div className="grid grid-cols-2 gap-3">
          {emotionalOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedEmotion(option.id)}
              className={`p-4 border text-left transition-all ${
                selectedEmotion === option.id
                  ? 'border-accent bg-accent/10'
                  : 'border-border hover:border-accent/50'
              }`}
            >
              <span className="text-2xl mr-3">{option.emoji}</span>
              <span className="text-text-primary text-sm">{option.label}</span>
              <span className="block text-xs text-text-muted mt-1 uppercase tracking-wider">
                Element: {option.archetype}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Response */}
      <div className="space-y-2">
        <p className="text-sm text-text-primary font-medium">
          Elaborate on your perspective (optional)
        </p>
        <textarea
          value={customResponse}
          onChange={(e) => setCustomResponse(e.target.value)}
          placeholder="What stands out to you? What feels off? What resonates?"
          className="w-full h-32 p-4 bg-surface border border-border text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none transition-colors resize-none"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!selectedEmotion && !customResponse.trim()}
        className="w-full py-3 bg-accent hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
      >
        CONTINUE TO ANALYSIS
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Sutra Reference */}
      <div className="text-center text-xs text-text-muted">
        <p>Sutra 5: The Oceanic Grounding</p>
        <p className="italic mt-1">&ldquo;Be the container, not the storm&rdquo;</p>
      </div>
    </div>
  );
}
