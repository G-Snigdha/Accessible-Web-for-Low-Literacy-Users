import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home.tsx';
import Reader from './pages/Reader.tsx';
import { aiClient } from '../../src-shared/ai/aiClient';
import '../../src-shared/styles/base.css';
import './styles/pwa.css';

interface AppSettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  language: string;
  highContrast: boolean;
  reduceMotion: boolean;
  darkMode: boolean;
}

// Breadcrumb component for better navigation
const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const getBreadcrumbName = (path: string) => {
    switch (path) {
      case 'reader': return '📖 Text Reader';
      case 'home': return '🏠 Home';
      default: return path.charAt(0).toUpperCase() + path.slice(1);
    }
  };

  if (pathnames.length === 0) return null;

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb navigation">
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">
          <Link to="/" className="breadcrumb-link">
            🏠 Home
          </Link>
        </li>
        {pathnames.map((path, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          
          return (
            <li key={path} className="breadcrumb-item">
              <span className="breadcrumb-separator" aria-hidden="true">›</span>
              {isLast ? (
                <span className="breadcrumb-current" aria-current="page">
                  {getBreadcrumbName(path)}
                </span>
              ) : (
                <Link to={routeTo} className="breadcrumb-link">
                  {getBreadcrumbName(path)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    fontSize: 'medium',
    language: 'en',
    highContrast: false,
    reduceMotion: false,
    darkMode: false
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [aiAvailability, setAiAvailability] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('accessibleWebSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }

    // Check AI availability
    const checkAI = async () => {
      const availability = aiClient.checkAIAvailability();
      setAiAvailability(availability);
    };
    checkAI();

    // Listen for online/offline status
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Keyboard navigation support
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close mobile menu with Escape key
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
      // Quick accessibility shortcuts
      if (e.altKey) {
        switch (e.key) {
          case 'c':
            e.preventDefault();
            updateSetting('highContrast', !settings.highContrast);
            break;
          case 'd':
            e.preventDefault();
            updateSetting('darkMode', !settings.darkMode);
            break;
          case '+':
          case '=':
            e.preventDefault();
            const sizes = ['small', 'medium', 'large', 'extra-large'] as const;
            const currentIndex = sizes.indexOf(settings.fontSize);
            if (currentIndex < sizes.length - 1) {
              updateSetting('fontSize', sizes[currentIndex + 1]);
            }
            break;
          case '-':
            e.preventDefault();
            const sizesDown = ['small', 'medium', 'large', 'extra-large'] as const;
            const currentIndexDown = sizesDown.indexOf(settings.fontSize);
            if (currentIndexDown > 0) {
              updateSetting('fontSize', sizesDown[currentIndexDown - 1]);
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Apply initial theme
    applyTheme();

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen, settings]);

  useEffect(() => {
    // Save settings to localStorage when they change
    localStorage.setItem('accessibleWebSettings', JSON.stringify(settings));
    applyTheme();
  }, [settings]);

  const applyTheme = () => {
    const root = document.documentElement;
    
    // Apply font size
    root.className = `font-${settings.fontSize}`;
    
    // Apply theme classes
    if (settings.highContrast) root.classList.add('high-contrast');
    else root.classList.remove('high-contrast');
    
    if (settings.reduceMotion) root.classList.add('reduce-motion');
    else root.classList.remove('reduce-motion');
    
    if (settings.darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  };

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Router>
      <div className={`pwa-app ${settings.fontSize} ${settings.highContrast ? 'high-contrast' : ''}`}>
        {/* Floating decoration elements */}
        <div className="floating-shapes" aria-hidden="true">
          <div className="floating-shape"></div>
          <div className="floating-shape"></div>
          <div className="floating-shape"></div>
        </div>
        
        {/* Skip link for accessibility */}
        <a href="#main-content" className="skip-link">Skip to main content</a>
        
        {/* Header */}
        <nav className="pwa-nav">
          <div className="container">
            <Link to="/" className="logo">
              <span className="icon">🌟</span>
              <span className="logo-text">Accessible Web</span>
            </Link>
            
            {/* Mobile menu button */}
            <button 
              className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>

            {/* Navigation links */}
            <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`} role="navigation" aria-label="Main navigation">
              <li>
                <Link 
                  to="/" 
                  className="nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  🏠 Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/reader" 
                  className="nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📖 Reader
                </Link>
              </li>
              <li>
                <button 
                  className="nav-link help-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    document.getElementById('help-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  ❓ Help
                </button>
              </li>
            </ul>

            {/* Quick settings */}
            <div className="quick-settings">
              <button
                className={`settings-toggle ${settings.highContrast ? 'active' : ''}`}
                onClick={() => updateSetting('highContrast', !settings.highContrast)}
                aria-label="Toggle high contrast"
                title="High Contrast Mode"
              >
                <span className="toggle-icon">👁️</span>
                <span className="toggle-label">Contrast</span>
              </button>

              <button
                className={`settings-toggle ${settings.darkMode ? 'active' : ''}`}
                onClick={() => updateSetting('darkMode', !settings.darkMode)}
                aria-label="Toggle dark mode" 
                title="Dark Mode"
              >
                <span className="toggle-icon">{settings.darkMode ? '☀️' : '🌙'}</span>
                <span className="toggle-label">{settings.darkMode ? 'Light' : 'Dark'}</span>
              </button>

              <button
                className="settings-toggle font-size-btn"
                onClick={() => {
                  const sizes = ['small', 'medium', 'large', 'extra-large'] as const;
                  const currentIndex = sizes.indexOf(settings.fontSize);
                  const nextIndex = (currentIndex + 1) % sizes.length;
                  updateSetting('fontSize', sizes[nextIndex]);
                }}
                aria-label="Cycle font size"
                title="Change Text Size"
              >
                <span className="toggle-icon">🔤</span>
                <span className="toggle-label">{settings.fontSize}</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Breadcrumb Navigation */}
        <Breadcrumb />

        {/* Main content */}
        <main className="pwa-main" id="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                <Home 
                  settings={settings}
                  updateSetting={updateSetting}
                  isOnline={isOnline}
                  aiAvailability={aiAvailability}
                />
              } 
            />
            <Route 
              path="/reader" 
              element={
                <Reader 
                  settings={settings}
                  updateSetting={updateSetting}
                  isOnline={isOnline}
                  aiAvailability={aiAvailability}
                />
              } 
            />
            <Route 
              path="/reader/:sharedText" 
              element={
                <Reader 
                  settings={settings}
                  updateSetting={updateSetting}
                  isOnline={isOnline}
                  aiAvailability={aiAvailability}
                />
              } 
            />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="pwa-footer">
          <div className="container">
            <div className="footer-content">
              <p>🔒 Privacy First • ♿ Accessible • 🌐 Offline Ready</p>
              <p>All processing happens on your device. No data leaves your browser.</p>
            </div>
            
            <div className="footer-links">
              <a href="/privacy">Privacy Policy</a>
              <a href="/help">Help</a>
              <a href="/about">About</a>
            </div>
          </div>
        </footer>

        {/* Install prompt for PWA */}
        <InstallPrompt />

        {/* Floating Help Button */}
        <button
          className="floating-help-btn"
          onClick={() => setShowTutorial(true)}
          aria-label="Show tutorial"
          title="Need help? Click for a quick tour!"
        >
          <span className="help-icon">❓</span>
          <span className="help-text">Help</span>
        </button>

        {/* Tutorial Overlay */}
        {showTutorial && <TutorialOverlay 
          step={tutorialStep} 
          onNext={() => setTutorialStep(prev => prev + 1)}
          onPrev={() => setTutorialStep(prev => Math.max(0, prev - 1))}
          onClose={() => {
            setShowTutorial(false);
            setTutorialStep(0);
          }}
        />}
      </div>
    </Router>
  );
};

// Tutorial Overlay Component
interface TutorialOverlayProps {
  step: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ step, onNext, onPrev, onClose }) => {
  const tutorialSteps = [
    {
      title: "Welcome to Accessible Web! 👋",
      content: "This tool helps make any text easier to read and understand. Perfect for people with reading difficulties or anyone dealing with complex text.",
      highlight: ".logo"
    },
    {
      title: "Quick Settings 🎛️",
      content: "Use these buttons to quickly adjust contrast, dark mode, and text size. Try Alt+C for contrast or Alt+D for dark mode!",
      highlight: ".quick-settings"
    },
    {
      title: "Text Reader 📖",
      content: "Click here to access our main tool where you can paste text or URLs to simplify, translate, or read aloud any content.",
      highlight: "[href='/reader']"
    },
    {
      title: "Try It Now ✨",
      content: "Scroll down to try our demo! Paste some complex text and see how we make it simpler instantly.",
      highlight: ".quick-demo"
    },
    {
      title: "You're All Set! 🎉",
      content: "That's the basics! Remember, all processing happens on your device - your privacy is protected. Need help anytime? Click the help button.",
      highlight: null
    }
  ];

  const currentStep = tutorialSteps[step] || tutorialSteps[0];
  const isLastStep = step >= tutorialSteps.length - 1;

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-backdrop" onClick={onClose}></div>
      <div className="tutorial-content">
        <div className="tutorial-header">
          <h3 className="tutorial-title">{currentStep.title}</h3>
          <button className="tutorial-close" onClick={onClose} aria-label="Close tutorial">✕</button>
        </div>
        
        <div className="tutorial-body">
          <p className="tutorial-text">{currentStep.content}</p>
        </div>
        
        <div className="tutorial-footer">
          <div className="tutorial-progress">
            <span className="progress-text">{step + 1} of {tutorialSteps.length}</span>
            <div className="progress-dots">
              {tutorialSteps.map((_, index) => (
                <div 
                  key={index} 
                  className={`progress-dot ${index === step ? 'active' : ''} ${index < step ? 'completed' : ''}`}
                ></div>
              ))}
            </div>
          </div>
          
          <div className="tutorial-actions">
            {step > 0 && (
              <button className="tutorial-btn secondary" onClick={onPrev}>
                ← Previous
              </button>
            )}
            {!isLastStep ? (
              <button className="tutorial-btn primary" onClick={onNext}>
                Next →
              </button>
            ) : (
              <button className="tutorial-btn primary" onClick={onClose}>
                Get Started! 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for PWA install prompt
const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="install-prompt">
      <div className="install-content">
        <div className="install-animation">
          <span className="install-icon">📱</span>
          <div className="install-pulse"></div>
        </div>
        <div className="install-text-section">
          <h3 className="install-title">Install for Better Experience</h3>
          <p className="install-description">Get offline access and faster loading</p>
        </div>
        <div className="install-actions">
          <button className="install-btn" onClick={handleInstall}>
            <span>⬇️</span>
            Install
          </button>
          <button 
            className="dismiss-btn" 
            onClick={() => setShowInstallPrompt(false)}
            aria-label="Dismiss install prompt"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;