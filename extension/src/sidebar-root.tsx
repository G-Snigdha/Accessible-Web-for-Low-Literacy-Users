import React, { useState, useEffect } from 'react';
// createRoot import removed - using ReactDOM.render for now
import { aiClient } from '@/ai/aiClient';
import './styles/extension.css';
import '../../src-shared/styles/base.css';

interface SidebarState {
  isVisible: boolean;
  selectedText: string;
  currentAction: 'none' | 'simplifying' | 'translating' | 'rewriting' | 'proofreading' | 'reading';
  results: {
    simplified?: string;
    translated?: string;
    rewritten?: string;
    proofread?: string;
  };
  settings: {
    fontSize: 'small' | 'medium' | 'large' | 'extra-large';
    language: string;
    highContrast: boolean;
  };
}

const Sidebar: React.FC = () => {
  const [state, setState] = useState<SidebarState>({
    isVisible: true,
    selectedText: '',
    currentAction: 'none',
    results: {},
    settings: {
      fontSize: 'medium',
      language: 'en',
      highContrast: false
    }
  });

  useEffect(() => {
    // Load settings
    chrome.storage.local.get(['fontSize', 'language', 'highContrast'], (result) => {
      if (result) {
        setState(prev => ({
          ...prev,
          settings: { ...prev.settings, ...result }
        }));
      }
    });

    // Listen for text selection
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection ? selection.toString().trim() : '';
      if (text) {
        setState(prev => ({ ...prev, selectedText: text }));
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleSelection);
    };
  }, []);

  const getMainContent = (): string => {
    // Try to find main content using various selectors
    const selectors = [
      'main',
      'article',
      '[role="main"]',
      '.main-content',
      '.content',
      '#content',
      '.post-content',
      '.entry-content'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.textContent?.trim() || '';
      }
    }

    // Fallback: get text from body, excluding navigation and sidebar elements
    const body = document.body.cloneNode(true) as HTMLElement;
    const excludeSelectors = ['nav', 'header', 'footer', '.sidebar', '.navigation', '#sidebar', 'script', 'style'];
    
    excludeSelectors.forEach(selector => {
      const elements = body.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    return body.textContent?.trim() || '';
  };

  const handleSimplify = async () => {
    const text = state.selectedText || getMainContent();
    if (!text) return;

    setState(prev => ({ ...prev, currentAction: 'simplifying' }));

    try {
      const result = await aiClient.summarize(text, {
        maxSentences: 3,
        readingLevel: 'very-simple'
      });

      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          currentAction: 'none',
          results: { ...prev.results, simplified: result.data?.summary || 'Simplification failed' }
        }));
      } else {
        console.error('Simplification failed:', result.error);
        setState(prev => ({ ...prev, currentAction: 'none' }));
      }
    } catch (error) {
      console.error('Simplification error:', error);
      setState(prev => ({ ...prev, currentAction: 'none' }));
    }
  };

  const handleTranslate = async (targetLanguage: string) => {
    const text = state.selectedText || state.results.simplified || getMainContent();
    if (!text) return;

    setState(prev => ({ ...prev, currentAction: 'translating' }));

    try {
      const result = await aiClient.translate(text, {
        targetLanguage,
        sourceLanguage: 'auto'
      });

      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          currentAction: 'none',
          results: { ...prev.results, translated: result.data?.translatedText || 'Translation failed' }
        }));
      }
    } catch (error) {
      console.error('Translation error:', error);
      setState(prev => ({ ...prev, currentAction: 'none' }));
    }
  };

  const handleRewrite = async () => {
    const text = state.selectedText || getMainContent();
    if (!text) return;

    setState(prev => ({ ...prev, currentAction: 'rewriting' }));

    try {
      const result = await aiClient.rewrite(text, {
        style: 'simple',
        readingLevel: 'very-simple',
        tone: 'encouraging'
      });

      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          currentAction: 'none',
          results: { ...prev.results, rewritten: result.data?.rewrittenText || 'Rewriting failed' }
        }));
      }
    } catch (error) {
      console.error('Rewrite error:', error);
      setState(prev => ({ ...prev, currentAction: 'none' }));
    }
  };

  const handleProofread = async () => {
    const text = state.selectedText;
    if (!text) return;

    setState(prev => ({ ...prev, currentAction: 'proofreading' }));

    try {
      const result = await aiClient.proofread(text, {
        checkGrammar: true,
        checkSpelling: true,
        simplifyLanguage: true
      });

      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          currentAction: 'none',
          results: { ...prev.results, proofread: result.data?.correctedText || 'Proofreading failed' }
        }));
      }
    } catch (error) {
      console.error('Proofread error:', error);
      setState(prev => ({ ...prev, currentAction: 'none' }));
    }
  };

  const handleReadAloud = async (text?: string) => {
    const textToRead = text || state.results.simplified || state.selectedText || getMainContent();
    if (!textToRead) return;

    setState(prev => ({ ...prev, currentAction: 'reading' }));

    try {
      const result = await aiClient.readAloud(textToRead, {
        rate: 0.8,
        language: state.settings.language
      });

      setState(prev => ({ ...prev, currentAction: 'none' }));

      if (!result.success) {
        console.error('Read aloud failed:', result.error);
      }
    } catch (error) {
      console.error('Read aloud error:', error);
      setState(prev => ({ ...prev, currentAction: 'none' }));
    }
  };

  const stopSpeech = () => {
    aiClient.stopSpeech();
    setState(prev => ({ ...prev, currentAction: 'none' }));
  };

  const closeSidebar = () => {
    setState(prev => ({ ...prev, isVisible: false }));
    // Notify content script to hide sidebar
    window.postMessage({ type: 'HIDE_SIDEBAR' }, '*');
  };

  if (!state.isVisible) return null;

  return (
    <div 
      className={`accessible-sidebar ${state.settings.fontSize} ${state.settings.highContrast ? 'high-contrast' : ''}`}
      role="complementary"
      aria-label="Accessibility Tools"
    >
      <div className="sidebar-header">
        <h2>🌟 Accessible Tools</h2>
        <button 
          className="close-btn"
          onClick={closeSidebar}
          aria-label="Close accessibility tools"
        >
          ✕
        </button>
      </div>

      <div className="sidebar-content">
        {state.selectedText && (
          <div className="selected-text">
            <h3>Selected Text:</h3>
            <p className="text-preview">{state.selectedText.substring(0, 100)}...</p>
          </div>
        )}

        <div className="action-buttons">
          <button 
            className="action-btn primary"
            onClick={handleSimplify}
            disabled={state.currentAction === 'simplifying'}
            aria-label="Simplify text to make it easier to read"
          >
            <span className="btn-icon">✨</span>
            <span className="btn-text">
              {state.currentAction === 'simplifying' ? 'Simplifying...' : 'Simplify'}
            </span>
          </button>

          <button 
            className="action-btn"
            onClick={() => handleTranslate(state.settings.language === 'en' ? 'es' : 'en')}
            disabled={state.currentAction === 'translating'}
            aria-label="Translate text to another language"
          >
            <span className="btn-icon">🌍</span>
            <span className="btn-text">
              {state.currentAction === 'translating' ? 'Translating...' : 'Translate'}
            </span>
          </button>

          <button 
            className="action-btn"
            onClick={() => handleReadAloud()}
            disabled={state.currentAction === 'reading'}
            aria-label="Read text aloud"
          >
            <span className="btn-icon">🔊</span>
            <span className="btn-text">
              {state.currentAction === 'reading' ? 'Reading...' : 'Read Aloud'}
            </span>
          </button>

          {state.currentAction === 'reading' && (
            <button 
              className="action-btn stop"
              onClick={stopSpeech}
              aria-label="Stop reading aloud"
            >
              <span className="btn-icon">⏹️</span>
              <span className="btn-text">Stop</span>
            </button>
          )}

          <button 
            className="action-btn"
            onClick={handleRewrite}
            disabled={state.currentAction === 'rewriting'}
            aria-label="Rewrite text for better clarity"
          >
            <span className="btn-icon">📝</span>
            <span className="btn-text">
              {state.currentAction === 'rewriting' ? 'Rewriting...' : 'Rewrite'}
            </span>
          </button>

          {state.selectedText && (
            <button 
              className="action-btn"
              onClick={handleProofread}
              disabled={state.currentAction === 'proofreading'}
              aria-label="Check spelling and grammar"
            >
              <span className="btn-icon">✏️</span>
              <span className="btn-text">
                {state.currentAction === 'proofreading' ? 'Checking...' : 'Proofread'}
              </span>
            </button>
          )}
        </div>

        <div className="results">
          {state.results.simplified && (
            <div className="result-item">
              <h4>📖 Simplified:</h4>
              <p className="result-text">{state.results.simplified}</p>
              <button 
                className="read-btn"
                onClick={() => handleReadAloud(state.results.simplified)}
                aria-label="Read simplified text aloud"
              >
                🔊 Read This
              </button>
            </div>
          )}

          {state.results.translated && (
            <div className="result-item">
              <h4>🌍 Translated:</h4>
              <p className="result-text">{state.results.translated}</p>
              <button 
                className="read-btn"
                onClick={() => handleReadAloud(state.results.translated)}
                aria-label="Read translated text aloud"
              >
                🔊 Read This
              </button>
            </div>
          )}

          {state.results.rewritten && (
            <div className="result-item">
              <h4>📝 Rewritten:</h4>
              <p className="result-text">{state.results.rewritten}</p>
              <button 
                className="read-btn"
                onClick={() => handleReadAloud(state.results.rewritten)}
                aria-label="Read rewritten text aloud"
              >
                🔊 Read This
              </button>
            </div>
          )}

          {state.results.proofread && (
            <div className="result-item">
              <h4>✏️ Proofread:</h4>
              <p className="result-text">{state.results.proofread}</p>
            </div>
          )}
        </div>

        <div className="quick-settings">
          <h4>Quick Settings:</h4>
          <div className="setting-controls">
            <label>
              Text Size:
              <select 
                value={state.settings.fontSize}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  settings: { ...prev.settings, fontSize: e.target.value as any }
                }))}
              >
                <option value="small">A</option>
                <option value="medium">A+</option>
                <option value="large">A++</option>
                <option value="extra-large">A+++</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <p>🔒 Privacy-first • All processing on-device</p>
      </div>
    </div>
  );
};

export default Sidebar;