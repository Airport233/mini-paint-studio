import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ColorPicker from '../../components/ColorPicker';
import ColorWheelPanel from '../../components/ColorWheelPanel';
import { postMix } from '../../services/mixService';
import type { MixResponse, MixCandidate } from '../../types/mix';

function TargetColorInput({
  onMixResult,
}: {
  onMixResult: (result: MixResponse) => void;
}) {
  const [tab, setTab] = useState<'picker' | 'wheel' | 'manual'>('manual');
  const [r, setR] = useState(128);
  const [g, setG] = useState(128);
  const [b, setB] = useState(128);
  const [hex, setHex] = useState('#808080');
  const [loading, setLoading] = useState(false);

  const handleHexChange = (value: string) => {
    setHex(value);
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);
    if (m) {
      setR(parseInt(m[1], 16));
      setG(parseInt(m[2], 16));
      setB(parseInt(m[3], 16));
    }
  };

  const handleCalculate = useCallback(async () => {
    setLoading(true);
    try {
      const result = await postMix(r, g, b);
      onMixResult(result);
    } catch {
      // API not ready
    } finally {
      setLoading(false);
    }
  }, [r, g, b, onMixResult]);

  return (
    <div>
      <div style={{ display: 'flex', marginBottom: 'var(--space-4)', background: 'var(--surface-warm)', borderRadius: 'var(--radius-sm)', padding: 2 }}>
        {(['manual', 'picker', 'wheel'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: 'var(--space-1) var(--space-3)',
              background: tab === t ? 'var(--accent)' : 'transparent',
              color: tab === t ? 'var(--accent-on)' : 'var(--muted)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {{ manual: '手动输入', picker: '取色器', wheel: '色轮' }[t]}
          </button>
        ))}
      </div>

      {tab === 'manual' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            {[
              ['R', r, setR, 255],
              ['G', g, setG, 255],
              ['B', b, setB, 255],
            ].map(([label, val, setFn, max]) => (
              <label key={label as string} style={{ flex: 1 }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{label as string}</span>
                <input
                  type="number"
                  min={0}
                  max={max as number}
                  value={val as number}
                  onChange={(e) => (setFn as (v: number) => void)(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: 'var(--surface-warm)',
                    border: '1px solid var(--border-soft)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--fg)',
                    fontSize: 'var(--text-base)',
                    outline: 'none',
                    marginTop: 4,
                  }}
                />
              </label>
            ))}
          </div>
          <input
            type="text"
            placeholder="#808080"
            value={hex}
            onChange={(e) => handleHexChange(e.target.value)}
            style={{
              padding: '8px 12px',
              background: 'var(--surface-warm)',
              border: '1px solid var(--border-soft)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--fg)',
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
            }}
          />
        </div>
      )}

      {tab === 'picker' && (
        <ColorPicker
          onColorPicked={(cr: number, cg: number, cb: number) => { setR(cr); setG(cg); setB(cb); }}
        />
      )}

      {tab === 'wheel' && (
        <ColorWheelPanel
          sourcePage="mix"
          onSelect={(cr: number, cg: number, cb: number) => { setR(cr); setG(cg); setB(cb); }}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-sm)',
            background: `rgb(${r},${g},${b})`,
            border: '2px solid var(--border-soft)',
          }}
        />
        <button
          onClick={handleCalculate}
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: loading ? 'var(--accent-hover)' : 'var(--accent)',
            color: 'var(--accent-on)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? '计算中...' : '计算混色'}
        </button>
      </div>
    </div>
  );
}

function CandidateList({ result }: { result: MixResponse }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {result.message && (
        <p style={{ color: 'var(--warn)', fontSize: 'var(--text-sm)', padding: 'var(--space-2) var(--space-3)', background: 'rgba(240, 178, 50, 0.1)', borderRadius: 'var(--radius-sm)' }}>
          {result.message}
        </p>
      )}

      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', fontWeight: 600 }}>
        混色方案 (TOP {result.candidates.length})
      </p>

      {result.candidates.map((c: MixCandidate, i: number) => (
        <div
          key={i}
          style={{
            padding: 'var(--space-4)',
            background: 'var(--surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-soft)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                background: `rgb(${c.mixedR},${c.mixedG},${c.mixedB})`,
                border: '2px solid var(--border)',
              }}
            />
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--fg-2)' }}>
              方案 {i + 1}
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              ΔE {c.deviation.toFixed(1)}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {c.paints.map((p, j) => (
              <span
                key={j}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 8px',
                  background: 'var(--surface-warm)',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: 'var(--text-xs)',
                }}
              >
                {p.name || p.code}
                <span style={{ fontWeight: 700, color: 'var(--fg-2)' }}>{p.parts}</span>
                {p.trace && (
                  <span style={{ color: 'var(--warn)', fontSize: 'var(--text-xs)' }}>少量</span>
                )}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
            <Link
              to={`/preview?r=${c.mixedR}&g=${c.mixedG}&b=${c.mixedB}`}
              style={{
                padding: '4px 12px',
                background: 'var(--accent)',
                color: 'var(--accent-on)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              3D 预览
            </Link>
          </div>
        </div>
      ))}

      {result.cmyRef.length > 0 && (
        <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-soft)' }}>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--fg-2)', marginBottom: 'var(--space-3)' }}>
            三原色参考 (CMY + 黑白)
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {result.cmyRef.map((p, i) => (
              <span
                key={i}
                style={{
                  padding: '2px 8px',
                  background: 'var(--surface-warm)',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: 'var(--text-xs)',
                }}
              >
                {p.name} <strong>{p.parts}</strong>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MixPage() {
  const [result, setResult] = useState<MixResponse | null>(null);

  return (
    <div>
      <h2
        style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 700,
          color: 'var(--fg-2)',
          fontFamily: 'var(--font-display)',
          marginBottom: 'var(--space-6)',
        }}
      >
        混色引擎
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '380px 1fr',
          gap: 'var(--space-6)',
          alignItems: 'start',
        }}
      >
        <TargetColorInput onMixResult={setResult} />
        <div>
          {result ? (
            <CandidateList result={result} />
          ) : (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 'var(--space-12)' }}>
              选择目标色开始混色计算
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
