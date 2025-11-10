import React from 'react';

interface ProcessingIndicatorProps {
  isLocal: boolean;
  isProcessing: boolean;
}

export const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({ 
  isLocal, 
  isProcessing 
}) => {
  if (!isProcessing) return null;

  const type = isLocal ? 'local' : 'cloud';
  const label = isLocal ? 'Processing Locally' : 'Using Cloud';
  const description = isLocal 
    ? 'Your data stays on your device'
    : 'Processing with online AI service';

  return (
    <div 
      className={`processing-indicator processing-indicator--${type}`}
      role="status"
      aria-live="polite"
      aria-label={`${label}. ${description}`}
    >
      <span>{label}</span>
    </div>
  );
};

interface ReadingLevelIndicatorProps {
  level: string;
  isOptimal?: boolean;
}

export const ReadingLevelIndicator: React.FC<ReadingLevelIndicatorProps> = ({ 
  level, 
  isOptimal = false 
}) => {
  const className = isOptimal 
    ? 'reading-level-indicator reading-level-indicator--grade-5'
    : 'reading-level-indicator';

  return (
    <div 
      className={className}
      role="status"
      aria-label={`Reading level: ${level}`}
    >
      <span>📖</span>
      <span>{level}</span>
      {isOptimal && <span>✓</span>}
    </div>
  );
};

interface ProgressIndicatorProps {
  progress: number; // 0-100
  label?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  progress, 
  label = 'Processing' 
}) => (
  <div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
    {label && (
      <div className="progress-label" style={{ marginBottom: 'var(--space-xs)' }}>
        {label}: {Math.round(progress)}%
      </div>
    )}
    <div className="progress-bar">
      <div 
        className="progress-bar__fill" 
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

interface VocabularyHelpProps {
  word: string;
  simpleDefinition: string;
  children: React.ReactNode;
}

export const VocabularyHelp: React.FC<VocabularyHelpProps> = ({ 
  word, 
  simpleDefinition, 
  children 
}) => (
  <span 
    className="vocabulary-help"
    role="button"
    tabIndex={0}
    aria-label={`${word} means ${simpleDefinition}`}
    title={`${word}: ${simpleDefinition}`}
  >
    {children}
    <span className="vocabulary-help__tooltip">
      {simpleDefinition}
    </span>
  </span>
);

interface FloatingActionButtonProps {
  onClick: () => void;
  label: string;
  icon?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ 
  onClick, 
  label,
  icon = "❓" 
}) => (
  <button
    className="fab"
    onClick={onClick}
    aria-label={label}
    title={label}
  >
    <span style={{ fontSize: '24px' }} role="img" aria-hidden="true">
      {icon}
    </span>
  </button>
);