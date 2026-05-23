import { useState, useRef, useCallback, useEffect } from 'react';
import { useColorStore } from '../store/colorStore';

interface ColorWheelPanelProps {
  onSelect?: (r: number, g: number, b: number) => void;
  compact?: boolean;
  sourcePage: string;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function drawWheel(
  ctx: CanvasRenderingContext2D,
  size: number,
  hue: number,
  sat: number,
) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 4;

  for (let angle = 0; angle < 360; angle += 0.5) {
    const rad = (angle - 90) * (Math.PI / 180);
    for (let r = 0; r <= radius; r += 1) {
      const s = r / radius;
      const [cr, cg, cb] = hslToRgb(angle, s, 0.5);
      ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
      ctx.fillRect(cx + Math.cos(rad) * r, cy + Math.sin(rad) * r, 2, 2);
    }
  }

  const hx = cx + Math.cos((hue - 90) * (Math.PI / 180)) * sat * radius;
  const hy = cy + Math.sin((hue - 90) * (Math.PI / 180)) * sat * radius;
  ctx.beginPath();
  ctx.arc(hx, hy, 6, 0, Math.PI * 2);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(hx, hy, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#000';
  ctx.fill();
}

const schemes = [
  { key: 'complementary', label: '互补色', angles: [180] },
  { key: 'triadic', label: '三等分色', angles: [120, 240] },
  { key: 'analogous', label: '邻近色', angles: [30, -30] },
  { key: 'splitComp', label: '分裂互补色', angles: [150, 210] },
];

export default function ColorWheelPanel({
  onSelect,
  compact = false,
  sourcePage,
}: ColorWheelPanelProps) {
  const setStoreColor = useColorStore((s) => s.setSelectedColor);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hue, setHue] = useState(0);
  const [sat, setSat] = useState(1);
  const size = compact ? 200 : 300;

  const selectedRgb = hslToRgb(hue, sat, 0.5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    drawWheel(ctx, size, hue, sat);
  }, [hue, sat, size]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const cx = size / 2;
      const x = e.clientX - rect.left - cx;
      const y = e.clientY - rect.top - cx;
      const dist = Math.sqrt(x * x + y * y) / cx;
      let angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
      if (angle < 0) angle += 360;
      setHue(Math.round(angle));
      setSat(Math.min(1, dist));
    },
    [size],
  );

  const handleSelect = () => {
    const [r, g, b] = selectedRgb;
    setStoreColor(r, g, b, sourcePage);
    onSelect?.(r, g, b);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        padding: 'var(--space-4)',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-soft)',
      }}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        onClick={handleCanvasClick}
        style={{ cursor: 'crosshair', borderRadius: '50%' }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--radius-sm)',
            background: `rgb(${selectedRgb[0]},${selectedRgb[1]},${selectedRgb[2]})`,
            border: '2px solid var(--border-soft)',
          }}
        />
        <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>
          #{selectedRgb[0].toString(16).padStart(2, '0')}
          {selectedRgb[1].toString(16).padStart(2, '0')}
          {selectedRgb[2].toString(16).padStart(2, '0')}
        </span>
        <button
          onClick={handleSelect}
          style={{
            marginLeft: 'auto',
            padding: '4px 12px',
            background: 'var(--accent)',
            color: 'var(--accent-on)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-xs)',
            cursor: 'pointer',
          }}
        >
          选择此色
        </button>
      </div>
      {schemes.map((s) => {
        const colors = s.angles.map((a) => {
          let nh = hue + a;
          if (nh >= 360) nh -= 360;
          if (nh < 0) nh += 360;
          return hslToRgb(nh, sat, 0.5);
        });
        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', width: 80, flexShrink: 0 }}>
              {s.label}
            </span>
            {colors.map(([r, g, b], i) => (
              <div
                key={i}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 'var(--radius-sm)',
                  background: `rgb(${r},${g},${b})`,
                  border: '1px solid var(--border-soft)',
                }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
