/**
 * DOM Utilities for extracting and manipulating text content
 * Used by both extension content scripts and web app
 */

/**
 * Extracts the main readable content from the current page
 * @returns The main text content of the page
 */
export function getMainArticleText(): string {
  // Priority selectors for main content
  const mainSelectors = [
    'main',
    'article', 
    '[role="main"]',
    '.main-content',
    '.content',
    '#content',
    '.post-content',
    '.entry-content',
    '.article-content',
    '.story-body',
    '.post-body'
  ];

  // Try each selector in order of preference
  for (const selector of mainSelectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      const text = Array.from(elements)
        .map(el => el.textContent?.trim())
        .filter(text => text && text.length > 100) // Filter out short content
        .join('\n\n');
      
      if (text.length > 200) { // Ensure we have substantial content
        return text;
      }
    }
  }

  // Fallback: extract from body while excluding navigation elements
  return getBodyTextExcludingNavigation();
}

/**
 * Gets text from document body while excluding navigation and other non-content elements
 * @returns Clean text content from the page body
 */
export function getBodyTextExcludingNavigation(): string {
  // Clone the body to avoid modifying the original
  const bodyClone = document.body.cloneNode(true) as HTMLElement;
  
  // Elements to exclude from text extraction
  const excludeSelectors = [
    'nav', 'header', 'footer', 'aside',
    '.nav', '.navigation', '.navbar', '.menu',
    '.sidebar', '.side-nav', '.secondary',
    '.ads', '.advertisement', '.banner',
    '.cookie-notice', '.popup', '.modal',
    '.social-share', '.related-articles',
    'script', 'style', 'noscript',
    '[role="banner"]', '[role="navigation"]', 
    '[role="complementary"]', '[role="contentinfo"]'
  ];

  // Remove excluded elements
  excludeSelectors.forEach(selector => {
    const elements = bodyClone.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });

  return bodyClone.textContent?.trim() || '';
}

/**
 * Gets the currently selected text on the page
 * @returns The selected text or empty string if none
 */
export function getSelectedText(): string {
  const selection = window.getSelection();
  return selection ? selection.toString().trim() : '';
}

/**
 * Highlights text on the page (useful for showing what was processed)
 * @param text - Text to highlight
 * @param className - CSS class to apply to highlights
 */
export function highlightText(text: string, className: string = 'accessible-web-highlight'): void {
  if (!text.trim()) return;

  // Create a simple highlight by wrapping text in spans
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null
  );

  const textNodes: Text[] = [];
  let node: Text | null;

  // Collect all text nodes
  while (node = walker.nextNode() as Text) {
    if (node.textContent && node.textContent.includes(text)) {
      textNodes.push(node);
    }
  }

  // Highlight matching text in each node
  textNodes.forEach(textNode => {
    if (!textNode.parentElement) return;

    const parent = textNode.parentElement;
    const content = textNode.textContent || '';
    
    if (content.includes(text)) {
      const parts = content.split(text);
      const fragment = document.createDocumentFragment();

      for (let i = 0; i < parts.length; i++) {
        if (parts[i]) {
          fragment.appendChild(document.createTextNode(parts[i]));
        }
        
        if (i < parts.length - 1) {
          const highlight = document.createElement('span');
          highlight.className = className;
          highlight.textContent = text;
          fragment.appendChild(highlight);
        }
      }

      parent.replaceChild(fragment, textNode);
    }
  });
}

/**
 * Removes all highlights created by highlightText
 * @param className - CSS class of highlights to remove
 */
export function removeHighlights(className: string = 'accessible-web-highlight'): void {
  const highlights = document.querySelectorAll(`.${className}`);
  highlights.forEach(highlight => {
    const parent = highlight.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(highlight.textContent || ''), highlight);
      parent.normalize(); // Merge adjacent text nodes
    }
  });
}

/**
 * Scrolls an element into view with smooth scrolling
 * @param element - Element to scroll to
 * @param behavior - Scroll behavior
 */
export function scrollToElement(element: Element, behavior: ScrollBehavior = 'smooth'): void {
  element.scrollIntoView({
    behavior,
    block: 'center',
    inline: 'nearest'
  });
}

/**
 * Checks if an element is currently visible in the viewport
 * @param element - Element to check
 * @returns True if element is visible
 */
export function isElementVisible(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Creates a notification element that appears on the page
 * @param message - Message to display
 * @param type - Type of notification (success, error, info)
 * @param duration - How long to show notification (ms)
 */
export function showPageNotification(
  message: string, 
  type: 'success' | 'error' | 'info' = 'info',
  duration: number = 3000
): void {
  const notification = document.createElement('div');
  notification.className = `accessible-web-notification ${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    z-index: 1000000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  notification.textContent = message;
  document.body.appendChild(notification);

  // Animate in
  requestAnimationFrame(() => {
    notification.style.transform = 'translateX(0)';
  });

  // Auto-remove
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 300);
  }, duration);
}

/**
 * Safely extracts text from HTML string
 * @param html - HTML string to extract text from
 * @returns Clean text content
 */
export function extractTextFromHtml(html: string): string {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Remove script and style elements
  const scripts = tempDiv.querySelectorAll('script, style');
  scripts.forEach(el => el.remove());
  
  return tempDiv.textContent?.trim() || '';
}

/**
 * Calculates approximate reading time for text
 * @param text - Text to calculate reading time for
 * @param wordsPerMinute - Average reading speed (default: 200)
 * @returns Reading time in minutes
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 200): number {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return Math.ceil(words.length / wordsPerMinute);
}

/**
 * Counts words in text
 * @param text - Text to count words in
 * @returns Number of words
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Estimates reading level of text (simplified calculation)
 * @param text - Text to analyze
 * @returns Reading level estimate
 */
export function estimateReadingLevel(text: string): 'very-simple' | 'simple' | 'intermediate' | 'advanced' {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  
  if (sentences.length === 0 || words.length === 0) return 'simple';
  
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = words.reduce((sum, word) => sum + countSyllables(word), 0) / words.length;
  
  // Simplified Flesch-Kincaid calculation
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  
  if (score >= 90) return 'very-simple';
  if (score >= 70) return 'simple';
  if (score >= 50) return 'intermediate';
  return 'advanced';
}

/**
 * Counts syllables in a word (simplified algorithm)
 * @param word - Word to count syllables in
 * @returns Number of syllables
 */
function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  
  const vowels = 'aeiouy';
  let count = 0;
  let previousWasVowel = false;
  
  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !previousWasVowel) {
      count++;
    }
    previousWasVowel = isVowel;
  }
  
  // Handle silent e
  if (word.endsWith('e')) count--;
  
  return Math.max(1, count);
}