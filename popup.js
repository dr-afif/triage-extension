document.getElementById('print-btn')?.addEventListener('click', () => {
  // Simple pass-through message when the optional toolbar extension menu is opened
  chrome.runtime.sendMessage({ action: "trigger_print" });
});