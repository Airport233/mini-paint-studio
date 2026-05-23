import { useState, useCallback } from 'react';

interface ScreenshotButtonProps {
  onScreenshot: (dataUrl: string) => void;
}

export default function ScreenshotButton({ onScreenshot }: ScreenshotButtonProps) {
  const [captured, setCaptured] = useState(false);

  const handleCapture = useCallback(() => {
    const canvases = document.querySelectorAll('canvas');
    if (canvases.length === 0) return;
    const dataUrl = canvases[0].toDataURL('image/png');
    onScreenshot(dataUrl);
    setCaptured(true);
    setTimeout(() => setCaptured(false), 1500);
  }, [onScreenshot]);

  return (
    <button
      onClick={handleCapture}
      style={{
        padding: 'var(--space-2) var(--space-4)',
        background: captured ? 'var(--success)' : 'var(--surface)',
        color: captured ? 'var(--accent-on)' : 'var(--fg)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--radius-sm)',
        fontSize: 'var(--text-sm)',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      {captured ? '已截图' : '截图取色'}
    </button>
  );
}
