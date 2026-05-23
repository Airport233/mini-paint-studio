import { useRef, useState, useCallback } from 'react';

interface ColorPickerProps {
  onColorPicked: (r: number, g: number, b: number) => void;
  initialColor?: { r: number; g: number; b: number };
}

export default function ColorPicker({ onColorPicked, initialColor }: ColorPickerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedColor, setSelectedColor] = useState<{ r: number; g: number; b: number } | null>(
    initialColor ?? null,
  );
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setError('请上传 JPG/PNG/WebP 格式的图片');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过 5MB');
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = canvasRef.current;
      if (!canvas) return;

      let w = img.width;
      let h = img.height;
      if (w > 1920) {
        h = Math.round(h * (1920 / w));
        w = 1920;
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      setImageLoaded(true);
    };
    img.onerror = () => {
      setError('图片加载失败，请重试');
    };
    img.src = url;
  }, []);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
      const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
      const ctx = canvas.getContext('2d')!;
      const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
      setSelectedColor({ r, g, b });
      onColorPicked(r, g, b);
    },
    [onColorPicked],
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}
      >
        <label
          style={{
            padding: 'var(--space-2) var(--space-4)',
            background: 'var(--accent)',
            color: 'var(--accent-on)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          上传图片
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
        {selectedColor && (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: `rgb(${selectedColor.r},${selectedColor.g},${selectedColor.b})`,
              border: '2px solid var(--border-soft)',
              flexShrink: 0,
            }}
          />
        )}
        {selectedColor && (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
            RGB({selectedColor.r}, {selectedColor.g}, {selectedColor.b})
          </span>
        )}
      </div>
      {error && (
        <p style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)' }}>{error}</p>
      )}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: '2px dashed var(--border-soft)',
          borderRadius: 'var(--radius-md)',
          minHeight: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surface-warm)',
          overflow: 'hidden',
        }}
      >
        {imageLoaded ? (
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            style={{
              maxWidth: '100%',
              maxHeight: 400,
              cursor: 'crosshair',
              objectFit: 'contain',
            }}
          />
        ) : (
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
            点击上传或拖拽图片到此处
          </p>
        )}
      </div>
    </div>
  );
}
