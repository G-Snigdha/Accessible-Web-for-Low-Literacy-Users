# Contributing to Accessible Web for Low-Literacy Users

Thank you for your interest in contributing to this accessibility-focused project! This guide will help you get started with contributing code, documentation, or ideas.

## 🎯 Project Mission

We're building tools to make web content more accessible for users with:
- Reading difficulties (dyslexia, visual impairments)
- Language barriers (ESL learners)
- Cognitive challenges (processing disorders)
- Limited digital literacy

## 🤝 How to Contribute

### Types of Contributions Welcome

1. **🤖 AI & Machine Learning**
   - Improve text simplification algorithms
   - Add new AI provider integrations
   - Enhance language detection and translation
   - Optimize performance for on-device processing

2. **♿ Accessibility Features**
   - Enhance WCAG compliance
   - Add new assistive technologies
   - Improve keyboard navigation
   - Expand screen reader support

3. **🌍 Internationalization**
   - Add new language support
   - Improve RTL language handling
   - Cultural adaptation for different regions
   - Locale-specific accessibility features

4. **📱 User Experience**
   - Mobile responsiveness improvements
   - Intuitive interface design
   - User testing and feedback integration
   - Performance optimizations

5. **🔧 Developer Experience**
   - Build tooling improvements
   - Testing framework enhancements
   - Documentation updates
   - Code quality tools

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Chrome browser (for extension development)
- Basic knowledge of React, TypeScript, and accessibility principles

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/accessible-web-low-literacy.git
   cd accessible-web-low-literacy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

4. **Load extension in Chrome**
   - Go to `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked" and select the `extension/` folder

## 📋 Development Workflow

### 1. Choose an Issue or Create One

- Browse [existing issues](https://github.com/yourusername/accessible-web-low-literacy/issues)
- Look for issues labeled `good first issue` or `help wanted`
- Create new issues for bugs or feature requests

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 3. Make Your Changes

- Follow the [coding standards](#coding-standards) below
- Write tests for new functionality
- Update documentation as needed
- Test both extension and PWA functionality

### 4. Test Your Changes

```bash
# Run automated tests
npm run test

# Check code quality
npm run lint
npm run typecheck

# Test manually
npm run dev  # Test both extension and PWA
```

### 5. Submit a Pull Request

- Push your branch to your fork
- Create a pull request with:
  - Clear description of changes
  - Screenshots/videos for UI changes
  - Test results and verification steps
  - Link to related issues

## 📏 Coding Standards

### TypeScript & React

```typescript
// Use descriptive function names
const simplifyTextForUser = async (text: string, options: SimplificationOptions) => {
  // Implementation
};

// Prefer functional components with hooks
const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ settings }) => {
  const [isLoading, setIsLoading] = useState(false);
  // Component logic
};

// Use proper TypeScript types
interface UserSettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  language: string;
}
```

### Accessibility Guidelines

```tsx
// Always include ARIA labels
<button 
  aria-label="Increase text size"
  onClick={increaseFontSize}
>
  A+
</button>

// Use semantic HTML
<main role="main">
  <section aria-labelledby="reading-tools">
    <h2 id="reading-tools">Reading Tools</h2>
    {/* Content */}
  </section>
</main>

// Ensure keyboard navigation
<div 
  role="button"
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  onClick={handleClick}
>
  Interactive Element
</div>
```

### CSS Guidelines

```css
/* Use CSS custom properties for theming */
:root {
  --color-primary: #0052cc;
  --font-size-base: 18px;
  --space-md: 1rem;
}

/* Follow BEM naming convention */
.accessibility-panel {
  /* Block styles */
}

.accessibility-panel__tool {
  /* Element styles */
}

.accessibility-panel__tool--active {
  /* Modifier styles */
}

/* Ensure sufficient color contrast */
.high-contrast-text {
  color: #000000;
  background-color: #ffffff;
  /* Contrast ratio: 21:1 (AAA level) */
}
```

## 🧪 Testing Guidelines

### Unit Tests

```typescript
// Test AI client functionality
describe('AIClient', () => {
  test('should simplify text with appropriate reading level', async () => {
    const result = await aiClient.simplify(complexText, {
      readingLevel: 'elementary'
    });
    
    expect(result.success).toBe(true);
    expect(result.data.readingLevel).toBeLessThanOrEqual(6);
  });
});

// Test accessibility features
describe('AccessibilityPanel', () => {
  test('should be keyboard navigable', () => {
    render(<AccessibilityPanel />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('tabIndex', '0');
    });
  });
});
```

### Manual Testing Checklist

**Chrome Extension:**
- [ ] Popup displays correctly in all supported browsers
- [ ] Settings persist across browser sessions
- [ ] Content scripts inject properly on various websites
- [ ] Sidebar overlay doesn't interfere with page functionality
- [ ] All AI features work with fallbacks

**PWA Web Application:**
- [ ] Responsive design on mobile and desktop
- [ ] PWA install prompt appears appropriately
- [ ] Offline functionality works as expected
- [ ] Reader tools handle various text inputs
- [ ] Accessibility features function correctly

**Cross-Platform:**
- [ ] Shared utilities work in both contexts
- [ ] CSS styles render consistently
- [ ] TypeScript types are properly shared

## 🌟 Feature Development Guidelines

### Adding AI Features

1. **Start with stubs**: Add Chrome Built-in AI stubs first
2. **Implement fallbacks**: Ensure functionality without AI APIs
3. **Privacy-first**: Keep processing local when possible
4. **Error handling**: Gracefully handle API unavailability
5. **User consent**: Ask before using network-based AI

### Accessibility Feature Development

1. **WCAG compliance**: Target AA+ level compliance
2. **Progressive enhancement**: Ensure basic functionality for all users
3. **User testing**: Include users with disabilities in testing
4. **Multiple input methods**: Support mouse, keyboard, and assistive devices
5. **Customization**: Allow users to adjust features to their needs

### Performance Considerations

1. **Lazy loading**: Load heavy features on demand
2. **Bundle size**: Keep extension and PWA bundles small
3. **Memory usage**: Be mindful of memory consumption
4. **Battery usage**: Optimize for mobile devices
5. **Accessibility tree**: Don't overwhelm screen readers

## 📚 Resources

### Accessibility References
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Chrome Extension Accessibility](https://developer.chrome.com/docs/extensions/mv3/a11y/)

### Development Tools
- [axe DevTools](https://www.deque.com/axe/devtools/) - Accessibility testing
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance and accessibility audits
- [NVDA Screen Reader](https://www.nvaccess.org/) - Free screen reader for testing

### AI and NLP Resources
- [Chrome Built-in AI APIs](https://developer.chrome.com/docs/ai/) - Browser-native AI
- [Web Speech API](https://developer.mozilla.org/docs/Web/API/Web_Speech_API) - Text-to-speech
- [Readability Algorithms](https://en.wikipedia.org/wiki/Readability) - Text complexity analysis

## 🎉 Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Hall of Fame (for significant contributions)
- Conference talks and presentations (with permission)

## ❓ Questions?

- 💬 **General Questions**: Use [GitHub Discussions](https://github.com/yourusername/accessible-web-low-literacy/discussions)
- 🐛 **Bug Reports**: Create [GitHub Issues](https://github.com/yourusername/accessible-web-low-literacy/issues)
- 🔒 **Security Issues**: Email security@yourproject.com
- 💡 **Feature Ideas**: Start a discussion or create a feature request

## 📜 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). Please be respectful and inclusive in all interactions.

---

Thank you for helping make the web more accessible for everyone! 🌟