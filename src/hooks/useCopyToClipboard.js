import { useState } from 'react';

export const useCopyToClipboard = () => {
  const [copiedText, setCopiedText] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [error, setError] = useState(false);

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label || 'Texto');
      setError(false);
      setShowSnackbar(true);
      return true;
    } catch (err) {
      console.error('Error al copiar:', err);
      setError(true);
      setCopiedText('Error');
      setShowSnackbar(true);
      return false;
    }
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  return {
    copyToClipboard,
    showSnackbar,
    handleCloseSnackbar,
    copiedText,
    error
  };
};