import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { aiClient } from '../../src-shared/ai/aiClient';
import '../../src-shared/styles/base.css';
import './styles/extension.css';

interface PopupState {
  sidebarEnabled: boolean;
  lastSimplification: string;
  selectedLanguage: string;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  isProcessing: boolean;
}

const Popup: React.FC = () => {
  const [state, setState] = useState<PopupState>({
    sidebarEnabled: false,
    lastSimplification: '',
    selectedLanguage: 'en',
    fontSize: 'medium',
    isProcessing: false
  });

  useEffect(() => {
    // Load settings from chrome.storage
    chrome.storage.local.get(['sidebarEnabled', 'lastSimplification', 'selectedLanguage', 'fontSize'], (result) => {
      setState(prev => ({ ...prev, ...result }));
    });
  }, []);

  const toggleSidebar = async () => {
    const newState = !state.sidebarEnabled;
    setState(prev => ({ ...prev, sidebarEnabled: newState }));
    
    // Save to storage
    chrome.storage.local.set({ sidebarEnabled: newState });
    
    // Send message to content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { 
        action: 'toggle-sidebar',
        enabled: newState 
      });
    }
  };

  const simplifyCurrentPage = async () => {
    setState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'simplify-page' }, (response) => {
          if (response && response.success) {
            setState(prev => ({ 
              ...prev, 
              lastSimplification: response.data.summary,
              isProcessing: false 
            }));
            chrome.storage.local.set({ lastSimplification: response.data.summary });
          } else {
            setState(prev => ({ ...prev, isProcessing: false }));
          }
        });
      }
    } catch (error) {
      console.error('Failed to simplify page:', error);
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const changeLanguage = (language: string) => {
    setState(prev => ({ ...prev, selectedLanguage: language }));
    chrome.storage.local.set({ selectedLanguage: language });
  };

  const readLastSimplification = async () => {
    if (state.lastSimplification) {
      const result = await aiClient.readAloud(state.lastSimplification, {
        rate: 0.8,
        language: state.selectedLanguage
      });
      
      if (!result.success) {
        console.error('TTS failed:', result.error);
      }
    }
  };

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="extension-popup">
      <h1>🌟 Accessible Web</h1>
      
      <div className="actions">
        <a 
          href="#"
          className={`quick-action ${state.sidebarEnabled ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); toggleSidebar(); }}
          aria-label={state.sidebarEnabled ? 'Hide sidebar' : 'Show sidebar'}
        >
          <div className="icon">📖</div>
          <div className="text">
            <div className="title">
              {state.sidebarEnabled ? 'Hide Sidebar' : 'Show Sidebar'}
            </div>
            <p className="description">Toggle reading assistance panel</p>
          </div>
        </a>

        <a 
          href="#"
          className="quick-action"
          onClick={(e) => { e.preventDefault(); simplifyCurrentPage(); }}
          aria-label="Simplify current page"
        >
          <div className="icon">✨</div>
          <div className="text">
            <div className="title">
              {state.isProcessing ? 'Simplifying...' : 'Simplify Page'}
            </div>
            <p className="description">Make content easier to understand</p>
          </div>
        </a>

        {state.lastSimplification && (
          <a 
            href="#"
            className="quick-action"
            onClick={(e) => { e.preventDefault(); readLastSimplification(); }}
            aria-label="Read last simplification aloud"
          >
            <div className="icon">🔊</div>
            <div className="text">
              <div className="title">Read Aloud</div>
              <p className="description">Hear the simplified content</p>
            </div>
          </a>
        )}

        <a 
          href="#"
          className="quick-action"
          onClick={(e) => { e.preventDefault(); openOptionsPage(); }}
        >
          <div className="icon">⚙️</div>
          <div className="text">
            <div className="title">Settings</div>
            <p className="description">Customize accessibility options</p>
          </div>
        </a>
      </div>

      <div className="mb-lg">
        <label htmlFor="language-select">Language for translations:</label>
        <select
          id="language-select"
          value={state.selectedLanguage}
          onChange={(e) => changeLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="it">Italian</option>
          <option value="pt">Portuguese</option>
        </select>
      </div>

      {state.lastSimplification && (
        <div className="card">
          <h3>Last Simplification:</h3>
          <p>{state.lastSimplification}</p>
        </div>
      )}
    </div>
  );
};

// Initialize popup
const container = document.getElementById('popup-root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}