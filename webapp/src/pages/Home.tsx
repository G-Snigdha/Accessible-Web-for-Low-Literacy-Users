import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { aiClient } from '../../../src-shared/ai/aiClient';

interface AppSettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  language: string;
  highContrast: boolean;
  reduceMotion: boolean;
  darkMode: boolean;
}

interface HomeProps {
  settings: AppSettings;
  updateSetting: (key: keyof AppSettings, value: any) => void;
  isOnline: boolean;
  aiAvailability: any;
}

const Home: React.FC<HomeProps> = ({ settings }) => {
  const [quickText, setQuickText] = useState('');
  const [quickResult, setQuickResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [userProgress, setUserProgress] = useState({
    hasTriedDemo: false,
    hasVisitedReader: false,
    hasUsedFeature: false
  });

  const handleQuickSimplify = async () => {
    if (!quickText.trim()) return;

    setIsProcessing(true);
    try {
      const result = await aiClient.summarize(quickText, {
        maxSentences: 2,
        readingLevel: 'very-simple'
      });

      if (result.success && result.data) {
        setQuickResult(result.data.summary);
      } else {
        setQuickResult('Sorry, could not simplify this text.');
      }
    } catch (error) {
      setQuickResult('Error occurred while processing text.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickRead = async () => {
    const textToRead = quickResult || quickText;
    if (!textToRead.trim()) return;

    try {
      await aiClient.readAloud(textToRead, {
        rate: 0.8,
        language: settings.language
      });
    } catch (error) {
      console.error('Read aloud failed:', error);
    }
  };

  return (
    <div className="home-page">
      {/* Welcome Banner */}
      {showWelcomeMessage && (
        <div className="welcome-banner">
          <div className="container">
            <div className="welcome-content">
              <div className="welcome-icon">👋</div>
              <div className="welcome-text">
                <h3>Welcome! Let's make reading easier together</h3>
                <p>This tool helps make complex text simple and clear for everyone</p>
              </div>
              <button 
                className="welcome-close"
                onClick={() => setShowWelcomeMessage(false)}
                aria-label="Close welcome message"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-icon">🎯</span>
              <span className="badge-text">Perfect for Low-Literacy Users</span>
            </div>
            
            <h1 className="hero-title">
              Turn Complex Text Into 
              <span className="title-highlight"> Simple Words</span>
            </h1>
            <p className="hero-subtitle">
              Our AI helps millions of people understand difficult text by making it simpler, 
              translating it, or reading it aloud. Perfect for anyone who struggles with reading.
            </p>

            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Texts Simplified</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">100+</div>
                <div className="stat-label">Languages Supported</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">5⭐</div>
                <div className="stat-label">User Rating</div>
              </div>
            </div>
            
            <div className="hero-actions">
              <Link 
                to="/reader" 
                className="cta-button primary"
                onClick={() => setUserProgress(prev => ({ ...prev, hasVisitedReader: true }))}
              >
                <span className="cta-icon">�</span>
                <span className="cta-text">
                  <strong>Try It Free Now</strong>
                  <small>Start simplifying text instantly</small>
                </span>
              </Link>
              <button 
                className="cta-button secondary"
                onClick={() => {
                  document.getElementById('quick-demo')?.scrollIntoView({ behavior: 'smooth' });
                  setCurrentStep(2);
                }}
              >
                <span className="cta-icon">▶️</span>
                <span className="cta-text">
                  <strong>Watch Demo</strong>
                  <small>See how it works (30 sec)</small>
                </span>
              </button>
            </div>

            {/* Status badges */}
            <div className="status-badges">
              <div className="badge">
                <span className="badge-icon">🔒</span>
                <span className="badge-text">Privacy First</span>
              </div>
              <div className="badge">
                <span className="badge-icon">🌐</span>
                <span className="badge-text">Works Offline</span>
              </div>
              <div className="badge">
                <span className="badge-icon">♿</span>
                <span className="badge-text">Accessible</span>
              </div>
              <div className="badge">
                <span className="badge-icon">🆓</span>
                <span className="badge-text">Free to Use</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Try Section */}
      <section className="quick-try" id="quick-demo">
        <div className="container">
          <div className="section-header">
            <div className="step-indicator">
              <span className="step-number">{currentStep}</span>
              <span className="step-total">/ 3</span>
            </div>
            <h2 className="section-title">✨ Try It Right Now</h2>
            <p className="section-subtitle">
              See the magic happen! Paste any complex text and watch it become simple:
            </p>
          </div>

          <div className="demo-examples">
            <h3 className="examples-title">Quick Examples to Try:</h3>
            <div className="example-buttons">
              <button 
                className="example-pill"
                onClick={() => {
                  const text = "The comprehensive implementation of sustainable development initiatives requires multifaceted collaboration.";
                  setQuickText(text);
                  setCurrentStep(3);
                }}
              >
                📚 Academic Text
              </button>
              <button 
                className="example-pill"
                onClick={() => {
                  const text = "Your account will be temporarily suspended pending verification of identity documents.";
                  setQuickText(text);
                  setCurrentStep(3);
                }}
              >
                📧 Official Email
              </button>
              <button 
                className="example-pill"
                onClick={() => {
                  const text = "Discontinue medication immediately if experiencing adverse reactions including nausea or respiratory complications.";
                  setQuickText(text);
                  setCurrentStep(3);
                }}
              >
                🏥 Medical Text
              </button>
            </div>
          </div>

          <div className="quick-demo">
            <div className="input-section">
              <div className="input-header">
                <label htmlFor="quick-text" className="input-label">
                  <span className="label-icon">📝</span>
                  Paste your complex text here:
                </label>
                <div className="character-counter">
                  {quickText.length} / 1000 characters
                </div>
              </div>
              
              <div className="input-wrapper">
                <textarea
                  id="quick-text"
                  className={`text-input large ${quickText.length > 0 ? 'has-content' : ''}`}
                  placeholder="Try pasting a difficult paragraph from a news article, legal document, or academic paper..."
                  value={quickText}
                  onChange={(e) => {
                    setQuickText(e.target.value);
                    if (e.target.value.length > 10 && currentStep === 2) {
                      setCurrentStep(3);
                    }
                  }}
                  rows={4}
                  maxLength={1000}
                />
                {quickText.length === 0 && (
                  <div className="input-hint">
                    💡 Tip: Try one of the examples above or paste your own text
                  </div>
                )}
              </div>
              
              <div className="input-actions">
                <button
                  className="action-btn primary large"
                  onClick={() => {
                    handleQuickSimplify();
                    setUserProgress(prev => {
                      const newProgress = { ...prev, hasTriedDemo: true };
                      // Track user progress for potential analytics or personalization
                      console.log('User progress updated:', newProgress, 'Current:', userProgress);
                      return newProgress;
                    });
                  }}
                  disabled={!quickText.trim() || isProcessing}
                >
                  <span className="btn-icon">{isProcessing ? '⏳' : '✨'}</span>
                  <span className="btn-content">
                    <strong>{isProcessing ? 'Making it Simple...' : 'Make it Simple!'}</strong>
                    <small>{isProcessing ? 'Processing your text' : 'Transform complex text instantly'}</small>
                  </span>
                </button>
                
                {(quickResult || quickText) && (
                  <button
                    className="action-btn secondary"
                    onClick={handleQuickRead}
                    title="Listen to the text being read aloud"
                  >
                    <span className="btn-icon">🔊</span>
                    <span className="btn-text">Listen</span>
                  </button>
                )}

                {quickText.length > 0 && (
                  <button
                    className="action-btn outline"
                    onClick={() => {
                      setQuickText('');
                      setQuickResult('');
                      setCurrentStep(2);
                    }}
                    title="Clear text and start over"
                  >
                    <span className="btn-icon">🗑️</span>
                    <span className="btn-text">Clear</span>
                  </button>
                )}
              </div>
            </div>

            {quickResult && (
              <div className="result-section">
                <div className="result-header">
                  <div className="result-badge success">
                    <span className="badge-icon">✅</span>
                    <span className="badge-text">Simplified Successfully!</span>
                  </div>
                  <div className="improvement-stats">
                    <div className="stat">
                      <span className="stat-icon">📊</span>
                      <span className="stat-text">Easier to read</span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">⚡</span>
                      <span className="stat-text">Faster to understand</span>
                    </div>
                  </div>
                </div>
                
                <div className="comparison-view">
                  <div className="text-comparison">
                    <div className="comparison-side original">
                      <h4 className="comparison-title">
                        <span className="title-icon">📝</span>
                        Original (Complex)
                      </h4>
                      <div className="text-box">
                        <p className="comparison-text">{quickText}</p>
                        <div className="text-metrics">
                          <span className="metric difficulty">Difficulty: Hard</span>
                          <span className="metric words">{quickText.split(' ').length} words</span>
                        </div>
                      </div>
                    </div>

                    <div className="comparison-arrow">
                      <div className="arrow-icon">→</div>
                      <div className="arrow-label">Simplified</div>
                    </div>

                    <div className="comparison-side simplified">
                      <h4 className="comparison-title">
                        <span className="title-icon">✨</span>
                        Simplified (Easy)
                      </h4>
                      <div className="text-box">
                        <p className="comparison-text">{quickResult}</p>
                        <div className="text-metrics">
                          <span className="metric difficulty easy">Difficulty: Easy</span>
                          <span className="metric words">{quickResult.split(' ').length} words</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="result-actions">
                  <Link 
                    to="/reader" 
                    className="cta-button primary"
                    onClick={() => setUserProgress(prev => ({ ...prev, hasUsedFeature: true }))}
                  >
                    <span className="cta-icon">🚀</span>
                    <span className="cta-text">Try More Features</span>
                  </Link>
                  <button
                    className="action-btn secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(quickResult);
                      // Could add a toast notification here
                    }}
                  >
                    <span className="btn-icon">📋</span>
                    <span className="btn-text">Copy Result</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">🚀 What We Can Do</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h3 className="feature-title">Simplify Text</h3>
              <p className="feature-description">
                Turn complex sentences into simple, easy-to-understand language.
                Perfect for people with reading difficulties.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3 className="feature-title">Translate</h3>
              <p className="feature-description">
                Translate text to your preferred language. 
                Works with over 100 languages worldwide.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔊</div>
              <h3 className="feature-title">Read Aloud</h3>
              <p className="feature-description">
                Listen to any text with natural-sounding voice synthesis.
                Adjustable speed and voice options.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3 className="feature-title">Rewrite</h3>
              <p className="feature-description">
                Improve clarity and readability of your own writing.
                Get suggestions for better word choices.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✏️</div>
              <h3 className="feature-title">Proofread</h3>
              <p className="feature-description">
                Check spelling and grammar errors automatically.
                Get helpful suggestions to improve your writing.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3 className="feature-title">Works Everywhere</h3>
              <p className="feature-description">
                Use as a web app or install our Chrome extension.
                Works on phone, tablet, and computer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">📋 How It Works</h2>
          
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>📝 Add Your Text</h3>
                <p>Paste text, type directly, or share a webpage URL</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>⚡ Choose Your Tool</h3>
                <p>Click Simplify, Translate, Read Aloud, or other options</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>✅ Get Results</h3>
                <p>See the improved text instantly. All processing happens on your device!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Accessibility Section */}
      <section className="privacy-accessibility">
        <div className="container">
          <div className="content-grid">
            <div className="content-block">
              <h2>🔒 Your Privacy Matters</h2>
              <ul className="feature-list">
                <li>✅ All text processing happens on your device</li>
                <li>✅ No data sent to external servers</li>
                <li>✅ No tracking or analytics</li>
                <li>✅ Works completely offline</li>
                <li>✅ Open source and transparent</li>
              </ul>
            </div>

            <div className="content-block">
              <h2>♿ Built for Accessibility</h2>
              <ul className="feature-list">
                <li>✅ Large, clear text options</li>
                <li>✅ High contrast mode</li>
                <li>✅ Keyboard navigation support</li>
                <li>✅ Screen reader compatible</li>
                <li>✅ Simple, clear language</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="get-started">
        <div className="container">
          <div className="get-started-content">
            <h2>🎯 Ready to Get Started?</h2>
            <p>
              Choose how you want to use Accessible Web:
            </p>

            <div className="options-grid">
              <Link to="/reader" className="option-card">
                <div className="option-icon">📖</div>
                <h3>Use Web App</h3>
                <p>Start reading right now in your browser</p>
                <span className="option-action">Try Now →</span>
              </Link>

              <div className="option-card">
                <div className="option-icon">🔧</div>
                <h3>Install Extension</h3>
                <p>Add to Chrome for any website</p>
                <span className="option-action">Get Extension →</span>
              </div>

              <div className="option-card">
                <div className="option-icon">📱</div>
                <h3>Install App</h3>
                <p>Add to home screen for offline use</p>
                <span className="option-action">Install PWA →</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;