import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { aiClient } from '../../../src-shared/ai/aiClient';
// TODO: Add status indicators
// import { ProcessingIndicator, ReadingLevelIndicator, VocabularyHelp } from '../../../src-shared/components';

interface AppSettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  language: string;
  highContrast: boolean;
  reduceMotion: boolean;
  darkMode: boolean;
}

interface ReaderProps {
  settings: AppSettings;
  updateSetting: (key: keyof AppSettings, value: any) => void;
  isOnline: boolean;
  aiAvailability: any;
}

interface ProcessingResults {
  simplified?: string;
  translated?: string;
  rewritten?: string;
  proofread?: string;
}

const Reader: React.FC<ReaderProps> = ({ settings, updateSetting }) => {
  const { sharedText } = useParams();
  const [searchParams] = useSearchParams();

  const [inputText, setInputText] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [currentText, setCurrentText] = useState('');
  const [results, setResults] = useState<ProcessingResults>({});
  const [currentAction, setCurrentAction] = useState<string>('none');
  const [activeResult, setActiveResult] = useState<string>('original');
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [textAnalysis, setTextAnalysis] = useState<{
    readingLevel: string;
    complexity: 'low' | 'medium' | 'high';
    suggestions: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
  } | null>(null);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);

  useEffect(() => {
    // Handle shared text from URL params or search params
    if (sharedText) {
      try {
        const decodedText = decodeURIComponent(sharedText);
        setCurrentText(decodedText);
        setInputText(decodedText);
      } catch (error) {
        console.error('Failed to decode shared text:', error);
      }
    }

    const urlText = searchParams.get('text');
    const urlUrl = searchParams.get('url');
    const title = searchParams.get('title');

    if (urlText) {
      setCurrentText(urlText);
      setInputText(urlText);
    } else if (title && urlUrl) {
      setInputUrl(urlUrl);
      fetchUrlContent(urlUrl);
    }
  }, [sharedText, searchParams]);

  useEffect(() => {
    // Calculate word count and reading time
    const words = currentText.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setReadingTime(Math.ceil(words.length / 200)); // Average 200 words per minute
    
    // Clear validation errors when text changes
    setValidationErrors({});
    setErrorMessage('');

    // Analyze text complexity and provide suggestions
    if (currentText.trim().length > 50) {
      analyzeText(currentText);
    } else {
      setTextAnalysis(null);
      setSmartSuggestions([]);
    }
  }, [currentText]);

  const analyzeText = (text: string) => {
    const words = text.trim().split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = words.length / sentences.length;
    
    // Simple complexity analysis
    const longWords = words.filter(word => word.length > 6).length;
    const complexityScore = (longWords / words.length) + (avgWordsPerSentence / 20);
    
    let complexity: 'low' | 'medium' | 'high';
    let readingLevel: string;
    let suggestions: string[] = [];

    if (complexityScore < 0.3) {
      complexity = 'low';
      readingLevel = 'Elementary (Grade 1-5)';
      suggestions = ['✅ This text is already easy to read!'];
    } else if (complexityScore < 0.6) {
      complexity = 'medium';
      readingLevel = 'Middle School (Grade 6-8)';
      suggestions = [
        '✨ Try Simplify to make it easier',
        '📝 Consider Rewrite for better clarity'
      ];
    } else {
      complexity = 'high';
      readingLevel = 'High School+ (Grade 9+)';
      suggestions = [
        '✨ Simplify is highly recommended',
        '📝 Rewrite can improve readability',
        '🔊 Read Aloud can help with comprehension'
      ];
    }

    // Detect sentiment (simple keyword-based)
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'positive', 'success'];
    const negativeWords = ['bad', 'terrible', 'awful', 'negative', 'problem', 'error', 'fail'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    let sentiment: 'positive' | 'neutral' | 'negative';
    if (positiveCount > negativeCount) {
      sentiment = 'positive';
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
    } else {
      sentiment = 'neutral';
    }

    setTextAnalysis({
      readingLevel,
      complexity,
      suggestions,
      sentiment
    });

    // Set smart suggestions based on analysis
    const smartSugs = [...suggestions];
    if (words.length > 500) {
      smartSugs.push('📄 Text is quite long - consider breaking it into sections');
    }
    if (avgWordsPerSentence > 25) {
      smartSugs.push('📝 Sentences are long - Rewrite can help shorten them');
    }
    
    setSmartSuggestions(smartSugs);
  };

  // Validation functions
  const validateInput = (text: string, url: string): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!text.trim() && !url.trim()) {
      errors.general = 'Please enter some text or a URL to continue.';
    } else if (text.trim() && text.length < 10) {
      errors.text = 'Please enter at least 10 characters for meaningful processing.';
    } else if (text.trim() && text.length > 50000) {
      errors.text = 'Text is too long. Please keep it under 50,000 characters.';
    } else if (url.trim() && !isValidUrl(url)) {
      errors.url = 'Please enter a valid URL (starting with http:// or https://).';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return string.startsWith('http://') || string.startsWith('https://');
    } catch (_) {
      return false;
    }
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 8000);
  };

  const fetchUrlContent = async (url: string) => {
    if (!validateInput('', url)) {
      return;
    }

    setCurrentAction('fetching');
    setIsProcessing(true);
    setProgress(10);
    
    try {
      setProgress(30);
      // Note: This will likely fail due to CORS in most cases
      // In a real implementation, you'd need a proxy service or browser extension
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      setProgress(60);
      const html = await response.text();
      
      // Basic HTML text extraction (would need better parsing in production)
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Remove scripts, styles, nav, footer
      const elementsToRemove = doc.querySelectorAll('script, style, nav, header, footer, .sidebar, .advertisement');
      elementsToRemove.forEach(el => el.remove());
      
      // Get main content
      const mainContent = doc.querySelector('main, article, .content, #content') || doc.body;
      const text = mainContent?.textContent?.trim() || '';
      
      if (!text) {
        throw new Error('No readable content found on this page.');
      }
      
      setProgress(90);
      setCurrentText(text);
      setInputText(text);
      setProgress(100);
      
      showSuccessMessage(`Successfully loaded ${text.split(' ').length} words from the webpage!`);
      
    } catch (error) {
      console.error('Failed to fetch URL content:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      showErrorMessage(`Could not load webpage: ${errorMsg}. Try copying and pasting the text directly.`);
    } finally {
      setCurrentAction('none');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleProcessText = async (action: string) => {
    if (!validateInput(currentText, '')) {
      return;
    }

    const actionLabels = {
      simplify: 'Simplifying',
      translate: 'Translating', 
      rewrite: 'Rewriting',
      proofread: 'Proofreading'
    };

    setCurrentAction(action);
    setIsProcessing(true);
    setProgress(10);

    try {
      let result: any;
      
      setProgress(30);
      
      switch (action) {
        case 'simplify':
          result = await aiClient.summarize(currentText, {
            maxSentences: Math.max(3, Math.ceil(wordCount / 50)),
            readingLevel: 'very-simple'
          });
          if (result?.success && result?.data) {
            setResults(prev => ({ ...prev, simplified: result.data.summary }));
            setActiveResult('simplified');
            showSuccessMessage('Text has been simplified successfully!');
          } else {
            throw new Error(result?.error || 'Failed to simplify text');
          }
          break;

        case 'translate':
          const targetLang = settings.language === 'en' ? 'es' : 'en';
          result = await aiClient.translate(currentText, {
            targetLanguage: targetLang
          });
          if (result?.success && result?.data) {
            setResults(prev => ({ ...prev, translated: result.data.translatedText }));
            setActiveResult('translated');
            showSuccessMessage(`Text has been translated to ${targetLang === 'es' ? 'Spanish' : 'English'}!`);
          } else {
            throw new Error(result?.error || 'Failed to translate text');
          }
          break;

        case 'rewrite':
          result = await aiClient.rewrite(currentText, {
            style: 'simple',
            readingLevel: 'very-simple',
            tone: 'neutral'
          });
          if (result?.success && result?.data) {
            setResults(prev => ({ ...prev, rewritten: result.data.rewrittenText }));
            setActiveResult('rewritten');
            showSuccessMessage('Text has been rewritten for better clarity!');
          } else {
            throw new Error(result?.error || 'Failed to rewrite text');
          }
          break;

        case 'proofread':
          result = await aiClient.proofread(currentText, {
            checkGrammar: true,
            checkSpelling: true,
            simplifyLanguage: true
          });
          if (result?.success && result?.data) {
            setResults(prev => ({ ...prev, proofread: result.data.correctedText }));
            setActiveResult('proofread');
            showSuccessMessage('Text has been proofread and corrected!');
          } else {
            throw new Error(result?.error || 'Failed to proofread text');
          }
          break;
      }
      
      setProgress(100);
      
    } catch (error) {
      console.error(`${action} failed:`, error);
      const errorMsg = error instanceof Error ? error.message : 'An unknown error occurred';
      showErrorMessage(`${actionLabels[action as keyof typeof actionLabels]} failed: ${errorMsg}`);
    } finally {
      setCurrentAction('none');
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleReadAloud = async (text?: string) => {
    const textToRead = text || getActiveText();
    if (!textToRead.trim()) return;

    setCurrentAction('reading');

    try {
      await aiClient.readAloud(textToRead, {
        rate: 0.8,
        language: settings.language,
        pitch: 1.0,
        volume: 0.8
      });
    } catch (error) {
      console.error('Read aloud failed:', error);
    } finally {
      setCurrentAction('none');
    }
  };

  const stopReading = () => {
    aiClient.stopSpeech();
    setCurrentAction('none');
  };

  const getActiveText = () => {
    switch (activeResult) {
      case 'simplified': return results.simplified || '';
      case 'translated': return results.translated || '';
      case 'rewritten': return results.rewritten || '';
      case 'proofread': return results.proofread || '';
      default: return currentText;
    }
  };

  const clearAll = () => {
    setInputText('');
    setInputUrl('');
    setCurrentText('');
    setResults({});
    setActiveResult('original');
  };

  return (
    <div className="reader-page">
      <div className="container">
        {/* Input Section */}
        <section className="input-section">
          <h1>📖 Text Reader</h1>
          <p>Paste text or enter a URL to make it easier to read</p>

          {/* Notification Messages */}
          {(errorMessage || successMessage) && (
            <div className="notification-area">
              {errorMessage && (
                <div className="notification error" role="alert">
                  <span className="notification-icon">⚠️</span>
                  <span className="notification-text">{errorMessage}</span>
                  <button 
                    className="notification-close"
                    onClick={() => setErrorMessage('')}
                    aria-label="Close error message"
                  >
                    ✕
                  </button>
                </div>
              )}
              {successMessage && (
                <div className="notification success" role="status">
                  <span className="notification-icon">✅</span>
                  <span className="notification-text">{successMessage}</span>
                  <button 
                    className="notification-close"
                    onClick={() => setSuccessMessage('')}
                    aria-label="Close success message"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Progress Bar */}
          {progress > 0 && (
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="progress-text">
                {progress < 100 ? `Processing... ${progress}%` : 'Complete!'}
              </div>
            </div>
          )}

          <div className="input-tabs">
            <div className="tab-buttons">
              <button 
                className={`tab-btn ${!inputUrl ? 'active' : ''}`}
                onClick={() => setInputUrl('')}
              >
                📝 Text
              </button>
              <button 
                className={`tab-btn ${inputUrl ? 'active' : ''}`}
                onClick={() => setInputText('')}
              >
                🌐 URL
              </button>
            </div>

            {!inputUrl ? (
              <div className="text-input-section">
                <label htmlFor="text-input" className="input-label">
                  Paste your text here:
                </label>
                <textarea
                  id="text-input"
                  className={`text-input large ${validationErrors.text ? 'error' : ''}`}
                  placeholder="Paste any text you want to make easier to read. This could be an article, email, document, or any other text..."
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setCurrentText(e.target.value);
                  }}
                  rows={6}
                  aria-describedby={validationErrors.text ? "text-error" : undefined}
                />
                {validationErrors.text && (
                  <div id="text-error" className="validation-error" role="alert">
                    <span className="error-icon">⚠️</span>
                    {validationErrors.text}
                  </div>
                )}
              </div>
            ) : (
              <div className="url-input-section">
                <label htmlFor="url-input" className="input-label">
                  Enter a webpage URL:
                </label>
                <div className="url-input-group">
                  <input
                    id="url-input"
                    type="url"
                    className={`url-input ${validationErrors.url ? 'error' : ''}`}
                    placeholder="https://example.com/article"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    aria-describedby={validationErrors.url ? "url-error" : undefined}
                  />
                  <button
                    className="fetch-btn"
                    onClick={() => fetchUrlContent(inputUrl)}
                    disabled={!inputUrl.trim() || currentAction === 'fetching' || isProcessing}
                  >
                    {currentAction === 'fetching' ? '📥 Loading...' : '📥 Load'}
                  </button>
                </div>
                {validationErrors.url && (
                  <div id="url-error" className="validation-error" role="alert">
                    <span className="error-icon">⚠️</span>
                    {validationErrors.url}
                  </div>
                )}
                <p className="url-help">
                  Note: Some websites may block loading due to security restrictions.
                  If this doesn't work, try copying and pasting the text directly.
                </p>
              </div>
            )}

            {currentText && (
              <div className="text-analysis-section">
                <div className="text-stats">
                  <span className="stat">📊 {wordCount} words</span>
                  <span className="stat">⏱️ {readingTime} min read</span>
                  {textAnalysis && (
                    <span className={`stat complexity ${textAnalysis.complexity}`}>
                      📈 {textAnalysis.readingLevel}
                    </span>
                  )}
                  <button className="clear-btn" onClick={clearAll}>
                    🗑️ Clear
                  </button>
                </div>

                {textAnalysis && smartSuggestions.length > 0 && (
                  <div className="smart-suggestions">
                    <h4 className="suggestions-title">
                      <span className="title-icon">💡</span>
                      Smart Suggestions for Your Text:
                    </h4>
                    <div className="suggestions-list">
                      {smartSuggestions.map((suggestion, index) => (
                        <div key={index} className="suggestion-item">
                          <span className="suggestion-text">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                    {textAnalysis.complexity === 'high' && (
                      <div className="complexity-warning">
                        <span className="warning-icon">⚠️</span>
                        <span className="warning-text">
                          This text might be difficult for people with reading challenges. 
                          We recommend using Simplify first.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Empty State */}
        {!currentText && !inputUrl && !inputText && (
          <section className="empty-state">
            <div className="empty-content">
              <div className="empty-icon">📖</div>
              <h2 className="empty-title">Ready to Make Text Easier?</h2>
              <p className="empty-description">
                Start by pasting some text or entering a webpage URL above. 
                We'll help you simplify, translate, or improve any content.
              </p>
              <div className="empty-examples">
                <h3>Try these examples:</h3>
                <div className="example-buttons">
                  <button 
                    className="example-btn"
                    onClick={() => {
                      const exampleText = "The comprehensive implementation of sustainable development initiatives requires multifaceted collaboration between governmental entities, private sector stakeholders, and community organizations to effectuate meaningful environmental preservation outcomes.";
                      setInputText(exampleText);
                      setCurrentText(exampleText);
                    }}
                  >
                    📄 Complex Academic Text
                  </button>
                  <button 
                    className="example-btn"
                    onClick={() => {
                      const exampleText = "Please be advised that your account will be temporarily suspended pending verification of your identity documents. This process typically takes 3-5 business days to complete.";
                      setInputText(exampleText);
                      setCurrentText(exampleText);
                    }}
                  >
                    📧 Formal Email
                  </button>
                  <button 
                    className="example-btn"
                    onClick={() => {
                      const exampleText = "The patient should discontinue the medication immediately if experiencing any adverse reactions including but not limited to nausea, dizziness, or respiratory complications.";
                      setInputText(exampleText);
                      setCurrentText(exampleText);
                    }}
                  >
                    🏥 Medical Instructions
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Action Buttons */}
        {currentText && (
          <section className="actions-section">
            <h2>🛠️ Choose an Action</h2>
            <p className="section-hint">Select what you'd like to do with your text:</p>
            
            <div className="action-buttons">
              <button
                className="action-btn primary"
                onClick={() => handleProcessText('simplify')}
                disabled={currentAction !== 'none' || isProcessing || !currentText.trim()}
                title={!currentText.trim() ? 'Please enter some text first' : 'Make text simpler and easier to read'}
              >
                <span className="btn-icon">✨</span>
                <span className="btn-text">
                  {currentAction === 'simplify' ? 'Simplifying...' : 'Simplify'}
                </span>
              </button>

              <button
                className="action-btn"
                onClick={() => handleProcessText('translate')}
                disabled={currentAction !== 'none' || isProcessing || !currentText.trim()}
                title={!currentText.trim() ? 'Please enter some text first' : 'Translate to another language'}
              >
                <span className="btn-icon">🌍</span>
                <span className="btn-text">
                  {currentAction === 'translate' ? 'Translating...' : 'Translate'}
                </span>
              </button>

              <button
                className="action-btn"
                onClick={() => handleReadAloud()}
                disabled={currentAction === 'reading' || isProcessing || !currentText.trim()}
                title={!currentText.trim() ? 'Please enter some text first' : 'Listen to the text being read aloud'}
              >
                <span className="btn-icon">🔊</span>
                <span className="btn-text">
                  {currentAction === 'reading' ? 'Reading...' : 'Read Aloud'}
                </span>
              </button>

              {currentAction === 'reading' && (
                <button
                  className="action-btn stop"
                  onClick={stopReading}
                >
                  <span className="btn-icon">⏹️</span>
                  <span className="btn-text">Stop</span>
                </button>
              )}

              <button
                className="action-btn"
                onClick={() => handleProcessText('rewrite')}
                disabled={currentAction !== 'none' || isProcessing || !currentText.trim()}
                title={!currentText.trim() ? 'Please enter some text first' : 'Improve text clarity and style'}
              >
                <span className="btn-icon">📝</span>
                <span className="btn-text">
                  {currentAction === 'rewrite' ? 'Rewriting...' : 'Rewrite'}
                </span>
              </button>

              <button
                className="action-btn"
                onClick={() => handleProcessText('proofread')}
                disabled={currentAction !== 'none' || isProcessing || !currentText.trim()}
                title={!currentText.trim() ? 'Please enter some text first' : 'Check and fix spelling and grammar'}
              >
                <span className="btn-icon">✏️</span>
                <span className="btn-text">
                  {currentAction === 'proofread' ? 'Proofreading...' : 'Proofread'}
                </span>
              </button>
            </div>
          </section>
        )}

        {/* Results Section */}
        {(currentText || Object.keys(results).length > 0) && (
          <section className="results-section">
            <h2>📄 Results</h2>

            {/* Result tabs */}
            <div className="result-tabs">
              <button
                className={`result-tab ${activeResult === 'original' ? 'active' : ''}`}
                onClick={() => setActiveResult('original')}
              >
                📝 Original
              </button>

              {results.simplified && (
                <button
                  className={`result-tab ${activeResult === 'simplified' ? 'active' : ''}`}
                  onClick={() => setActiveResult('simplified')}
                >
                  ✨ Simplified
                </button>
              )}

              {results.translated && (
                <button
                  className={`result-tab ${activeResult === 'translated' ? 'active' : ''}`}
                  onClick={() => setActiveResult('translated')}
                >
                  🌍 Translated
                </button>
              )}

              {results.rewritten && (
                <button
                  className={`result-tab ${activeResult === 'rewritten' ? 'active' : ''}`}
                  onClick={() => setActiveResult('rewritten')}
                >
                  📝 Rewritten
                </button>
              )}

              {results.proofread && (
                <button
                  className={`result-tab ${activeResult === 'proofread' ? 'active' : ''}`}
                  onClick={() => setActiveResult('proofread')}
                >
                  ✏️ Proofread
                </button>
              )}
            </div>

            {/* Active result content */}
            <div className="result-content">
              <div className="result-text">
                {getActiveText()}
              </div>

              <div className="result-actions">
                <button
                  className="result-action-btn"
                  onClick={() => handleReadAloud(getActiveText())}
                  disabled={currentAction === 'reading'}
                >
                  🔊 Read This Version
                </button>

                <button
                  className="result-action-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(getActiveText());
                  }}
                >
                  📋 Copy Text
                </button>

                <button
                  className="result-action-btn"
                  onClick={() => {
                    const text = encodeURIComponent(getActiveText());
                    const shareUrl = `${window.location.origin}/reader/${text}`;
                    navigator.clipboard.writeText(shareUrl);
                  }}
                >
                  🔗 Share Link
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Help Section */}
        <section className="help-section" id="help-section">
          <h3>❓ Need Help?</h3>
          <div className="help-content">
            <div className="keyboard-shortcuts">
              <h4>⌨️ Keyboard Shortcuts</h4>
              <div className="shortcuts-grid">
                <div className="shortcut-item">
                  <kbd>Alt + C</kbd>
                  <span>Toggle High Contrast</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Alt + D</kbd>
                  <span>Toggle Dark Mode</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Alt + +</kbd>
                  <span>Increase Font Size</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Alt + -</kbd>
                  <span>Decrease Font Size</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Tab</kbd>
                  <span>Navigate Between Elements</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Space</kbd>
                  <span>Activate Focused Button</span>
                </div>
              </div>
            </div>
            <div className="help-cards">
              <div className="help-card">
                <h4>✨ Simplify</h4>
                <p>Makes complex text easier to read by using simpler words and shorter sentences. Perfect for difficult articles or documents.</p>
              </div>
              <div className="help-card">
                <h4>🌍 Translate</h4>
                <p>Converts text to your preferred language. Supports over 100 languages including Spanish, French, German, and more.</p>
              </div>
              <div className="help-card">
                <h4>🔊 Read Aloud</h4>
                <p>Converts text to speech so you can listen instead of reading. Great for people with reading difficulties or when multitasking.</p>
              </div>
              <div className="help-card">
                <h4>📝 Rewrite</h4>
                <p>Improves the clarity and flow of text while keeping the same meaning. Useful for making your own writing better.</p>
              </div>
              <div className="help-card">
                <h4>✏️ Proofread</h4>
                <p>Checks for spelling and grammar mistakes, then suggests corrections. Helps make your writing more professional.</p>
              </div>
              <div className="help-card">
                <h4>🔒 Privacy</h4>
                <p>All processing happens on your device. Your text never leaves your browser, ensuring complete privacy and security.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Settings */}
        <section className="quick-settings-section">
          <h3>⚙️ Quick Settings</h3>
          <p className="section-hint">Customize your reading experience:</p>
          <div className="settings-grid">
            <div className="setting-item">
              <label>Text Size:</label>
              <select
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', e.target.value)}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="extra-large">Extra Large</option>
              </select>
            </div>

            <div className="setting-item">
              <label>Language:</label>
              <select
                value={settings.language}
                onChange={(e) => updateSetting('language', e.target.value)}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
              </select>
            </div>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={(e) => updateSetting('highContrast', e.target.checked)}
                />
                High Contrast
              </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Reader;