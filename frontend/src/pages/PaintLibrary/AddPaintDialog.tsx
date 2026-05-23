import { useState } from 'react';
import ColorPicker from '../../components/ColorPicker';
import { createPaint } from '../../services/paintService';
import { Brand } from '../../types/paint';

interface AddPaintDialogProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function AddPaintDialog({ onClose, onSaved }: AddPaintDialogProps) {
  const [step, setStep] = useState<'pick' | 'form'>('pick');
  const [r, setR] = useState(0);
  const [g, setG] = useState(0);
  const [b, setB] = useState(0);
  const [brand, setBrand] = useState<Brand>(Brand.GW);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!brand || !code.trim() || !name.trim()) {
      setError('请填写品牌、色号和名称');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append(
        'paint',
        new Blob([JSON.stringify({ brand, code: code.trim(), name: name.trim(), r, g, b })], {
          type: 'application/json',
        }),
      );
      await createPaint(fd);
      onSaved();
    } catch {
      setError('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: 560,
          maxHeight: '90vh',
          overflow: 'auto',
          padding: 'var(--space-6)',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-soft)',
          boxShadow: 'var(--elev-raised)',
        }}
      >
        <h3
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 700,
            color: 'var(--fg-2)',
            marginBottom: 'var(--space-6)',
            fontFamily: 'var(--font-display)',
          }}
        >
          添加漆料
        </h3>

        {step === 'pick' ? (
          <>
            <ColorPicker
              onColorPicked={(cr, cg, cb) => {
                setR(cr);
                setG(cg);
                setB(cb);
                setStep('form');
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
              <button
                onClick={onClose}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  background: 'transparent',
                  color: 'var(--muted)',
                  border: 'none',
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 'var(--radius-sm)',
                  background: `rgb(${r},${g},${b})`,
                  border: '2px solid var(--border-soft)',
                  flexShrink: 0,
                }}
              />
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                RGB({r}, {g}, {b})
                <br />
                <button
                  onClick={() => setStep('pick')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    fontSize: 'var(--text-xs)',
                    padding: 0,
                    marginTop: 4,
                  }}
                >
                  重新取色
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value as Brand)}
                style={{
                  padding: '10px 12px',
                  background: 'var(--surface-warm)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--fg)',
                  fontSize: 'var(--text-base)',
                }}
              >
                {Object.values(Brand).map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="色号（如 70.950 Black）"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{
                  padding: '10px 12px',
                  background: 'var(--surface-warm)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--fg)',
                  fontSize: 'var(--text-base)',
                  outline: 'none',
                }}
              />
              <input
                type="text"
                placeholder="名称（自定义名称）"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  padding: '10px 12px',
                  background: 'var(--surface-warm)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--fg)',
                  fontSize: 'var(--text-base)',
                  outline: 'none',
                }}
              />
            </div>

            {error && (
              <p style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-3)' }}>
                {error}
              </p>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 'var(--space-3)',
                marginTop: 'var(--space-6)',
              }}
            >
              <button
                onClick={onClose}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  background: 'transparent',
                  color: 'var(--muted)',
                  border: 'none',
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: 'var(--space-2) var(--space-6)',
                  background: 'var(--accent)',
                  color: 'var(--accent-on)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  cursor: saving ? 'default' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
