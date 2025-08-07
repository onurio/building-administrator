// Accessibility utilities and helpers

// ARIA label helpers
export const createAriaLabel = (action, target) => {
  return `${action} ${target}`;
};

export const createScreenReaderText = (text) => ({
  position: 'absolute',
  left: '-10000px',
  top: 'auto',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
});

// Keyboard navigation helpers
export const handleEnterKeyPress = (callback) => (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    callback(event);
  }
};

export const handleEscapeKey = (callback) => (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    callback(event);
  }
};

// Focus management
export const trapFocus = (element) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);
  
  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

// Color contrast utilities
export const getContrastRatio = (color1, color2) => {
  const getLuminance = (color) => {
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    
    const [rNorm, gNorm, bNorm] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

// Accessible form helpers
export const getFormFieldAria = (fieldName, error, helperText) => ({
  'aria-label': fieldName,
  'aria-invalid': !!error,
  'aria-describedby': error ? `${fieldName}-error` : helperText ? `${fieldName}-helper` : undefined,
});

// Skip link component
export const SkipLink = ({ href, children }) => ({
  position: 'absolute',
  left: '-10000px',
  top: 'auto',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  zIndex: 999999,
  padding: '8px 16px',
  background: '#000',
  color: '#fff',
  textDecoration: 'none',
  borderRadius: '4px',
  '&:focus': {
    position: 'static',
    width: 'auto',
    height: 'auto',
    overflow: 'visible',
  },
});

// Announce to screen readers
export const announce = (message, priority = 'polite') => {
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', priority);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.style.position = 'absolute';
  announcer.style.left = '-10000px';
  announcer.style.width = '1px';
  announcer.style.height = '1px';
  announcer.style.overflow = 'hidden';
  
  document.body.appendChild(announcer);
  announcer.textContent = message;
  
  setTimeout(() => {
    document.body.removeChild(announcer);
  }, 1000);
};

// Keyboard shortcuts
export const keyboardShortcuts = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
};

// Touch target minimum size (44px per Apple and Android guidelines)
export const MINIMUM_TOUCH_TARGET = 44;

export const ensureMinimumTouchTarget = (theme) => ({
  minWidth: `${MINIMUM_TOUCH_TARGET}px`,
  minHeight: `${MINIMUM_TOUCH_TARGET}px`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export default {
  createAriaLabel,
  createScreenReaderText,
  handleEnterKeyPress,
  handleEscapeKey,
  trapFocus,
  getContrastRatio,
  getFormFieldAria,
  SkipLink,
  announce,
  keyboardShortcuts,
  MINIMUM_TOUCH_TARGET,
  ensureMinimumTouchTarget,
};