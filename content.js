// Create the floating button element
const floatingBtn = document.createElement('button');
floatingBtn.innerText = '🖨️ Extract & Print Slip';
floatingBtn.id = 'floating-triage-print-btn';

// Style it to stay locked onto the bottom right viewport area safely
Object.assign(floatingBtn.style, {
  position: 'fixed',
  top: '54px',
  right: '25px',
  zIndex: '10000',
  backgroundColor: '#c9234b', //c9234b
  color: '#ffffff',
  border: 'none',
  borderRadius: '30px',
  padding: '9px 12px', // Adjusted padding for better button size 12px 24px
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  transition: 'all 0.2s ease-in-out'
});

// Add basic interactive scaling feedback on hover
floatingBtn.addEventListener('mouseenter', () => {
  floatingBtn.style.transform = 'scale(1.06)';
  floatingBtn.style.backgroundColor = '#b01e40';
});
floatingBtn.addEventListener('mouseleave', () => {
  floatingBtn.style.transform = 'scale(1)';
  floatingBtn.style.backgroundColor = '#c9234b';
});

// Clicking this button clicks the extension trigger logic
floatingBtn.addEventListener('click', () => {
  // Dispatches a global extension signal message back to open the layout window
  chrome.runtime.sendMessage({ action: "trigger_print" });
});

// Inject into the page document body structure
document.body.appendChild(floatingBtn);