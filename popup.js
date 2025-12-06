// popup.js - Popup UI logic

document.addEventListener('DOMContentLoaded', async () => {
  const toggle = document.getElementById('bookModeToggle');
  const statusEl = document.getElementById('status');
  
  // Load current state
  const result = await chrome.storage.sync.get(['bookModeEnabled']);
  const isEnabled = result.bookModeEnabled !== false; // Default to true
  toggle.checked = isEnabled;
  updateStatus(isEnabled);
  
  // Handle toggle changes
  toggle.addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    
    // Save to storage
    await chrome.storage.sync.set({ bookModeEnabled: enabled });
    
    // Send message to content script
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab && tab.id) {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'toggleBookMode',
          enabled: enabled
        });
        
        updateStatus(enabled);
      }
    } catch (error) {
      console.error('Error sending message to content script:', error);
      // Show error but keep the toggle state
      showError();
    }
  });
  
  function updateStatus(enabled) {
    statusEl.className = 'status ' + (enabled ? 'active' : 'inactive');
    statusEl.textContent = enabled ? 'Book Mode Active' : 'Book Mode Disabled';
  }
  
  function showError() {
    statusEl.className = 'status inactive';
    statusEl.textContent = 'Please refresh the page';
    setTimeout(() => {
      updateStatus(toggle.checked);
    }, 3000);
  }
});
