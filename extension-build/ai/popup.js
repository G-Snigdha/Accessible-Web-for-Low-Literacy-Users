// Utility function to show status messages
function showStatus(message, type = 'success') {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = type;
  statusEl.classList.remove('hidden');
  setTimeout(() => statusEl.classList.add('hidden'), 3000);
}

// Function to get selected text from the active tab
async function getSelectedText() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => window.getSelection().toString()
  });
  return result;
}

// Initialize buttons
document.addEventListener('DOMContentLoaded', () => {
  // Simplify Text
  document.getElementById('simplifyText').addEventListener('click', async () => {
    try {
      const text = await getSelectedText();
      if (!text) {
        showStatus('Please select text to simplify', 'error');
        return;
      }

      const response = await chrome.runtime.sendMessage({
        action: 'simplifyText',
        text
      });

      if (response.success) {
        // Send simplified text back to content script
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        await chrome.tabs.sendMessage(tab.id, {
          action: 'showResult',
          result: response.result
        });
      } else {
        showStatus('Failed to simplify text', 'error');
      }
    } catch (error) {
      showStatus(error.message, 'error');
    }
  });

  // Translate Text
  document.getElementById('translateText').addEventListener('click', async () => {
    try {
      const text = await getSelectedText();
      if (!text) {
        showStatus('Please select text to translate', 'error');
        return;
      }

      // Get user's preferred language from storage
      const { defaultLanguage } = await chrome.storage.local.get('defaultLanguage');
      
      const response = await chrome.runtime.sendMessage({
        action: 'translateText',
        text,
        targetLanguage: defaultLanguage || 'en'
      });

      if (response.success) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        await chrome.tabs.sendMessage(tab.id, {
          action: 'showResult',
          result: response.result
        });
      } else {
        showStatus('Failed to translate text', 'error');
      }
    } catch (error) {
      showStatus(error.message, 'error');
    }
  });

  // Proofread Text
  document.getElementById('proofreadText').addEventListener('click', async () => {
    try {
      const text = await getSelectedText();
      if (!text) {
        showStatus('Please select text to proofread', 'error');
        return;
      }

      const response = await chrome.runtime.sendMessage({
        action: 'proofreadText',
        text
      });

      if (response.success) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        await chrome.tabs.sendMessage(tab.id, {
          action: 'showResult',
          result: response.result
        });
      } else {
        showStatus('Failed to proofread text', 'error');
      }
    } catch (error) {
      showStatus(error.message, 'error');
    }
  });

  // Read Aloud
  document.getElementById('readAloud').addEventListener('click', async () => {
    try {
      const text = await getSelectedText();
      if (!text) {
        showStatus('Please select text to read', 'error');
        return;
      }

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.sendMessage(tab.id, {
        action: 'readAloud',
        text
      });
    } catch (error) {
      showStatus(error.message, 'error');
    }
  });
});