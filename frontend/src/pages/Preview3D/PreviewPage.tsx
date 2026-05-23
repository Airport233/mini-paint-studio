import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SceneWrapper, { type LightDef } from './Scene';
import GeometrySelector from './GeometrySelector';
import MaterialPanel from './MaterialPanel';
import LightSystem from './LightSystem';
import StlUploader from './StlUploader';
import StlTransformPanel from './StlTransformPanel';
import ScreenshotButton from './ScreenshotButton';

type GeometryType = 'sphere' | 'cube' | 'cylinder';

const DEFAULT_LIGHTS: LightDef[] = [
  { index: 1, type: 'directional', position: [2, 3, 2], color: '#ffffff', intensity: 1.0, enabled: true },
  { index: 2, type: 'directional', position: [0, 3, -2], color: '#ffffff', intensity: 0.6, enabled: true },
];

export default function PreviewPage() {
  const [searchParams] = useSearchParams();
  const [geometry, setGeometry] = useState<GeometryType>('sphere');
  const [color, setColor] = useState('#808080');
  const [roughness, setRoughness] = useState(0.5);
  const [metalness, setMetalness] = useState(0.0);
  const [lights, setLights] = useState<LightDef[]>(DEFAULT_LIGHTS);
  const [stlRotation, setStlRotation] = useState({ x: 0, y: 0, z: 0 });
  const [stlHeight, setStlHeight] = useState(0);
  const [screenshotData, setScreenshotData] = useState<string | null>(null);

  useEffect(() => {
    const r = searchParams.get('r');
    const g = searchParams.get('g');
    const b = searchParams.get('b');
    const preset = searchParams.get('preset');

    if (r && g && b) {
      const hex =
        '#' +
        [Number(r), Number(g), Number(b)]
          .map((v) => v.toString(16).padStart(2, '0'))
          .join('');
      setColor(hex);
    }

    if (preset) {
      // TODO: fetch preset from API and restore geometry, material, lights
    }
  }, [searchParams]);

  // _colors reserved for future material-to-mix-engine integration

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
        3D 预览
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-6)', alignItems: 'start' }}>
        <div>
          <SceneWrapper
            geometry={geometry}
            color={color}
            roughness={roughness}
            metalness={metalness}
            lights={lights}
          />
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-3)',
              alignItems: 'center',
            }}
          >
            <GeometrySelector value={geometry} onChange={setGeometry} />
            <ScreenshotButton
              onScreenshot={(dataUrl) => setScreenshotData(dataUrl)}
            />
          </div>
          {screenshotData && (
            <div
              style={{
                marginTop: 'var(--space-3)',
                padding: 'var(--space-3)',
                background: 'var(--surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-soft)',
              }}
            >
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 'var(--space-2)' }}>
                截图已捕获，可点击颜色区域取色
              </p>
              <img
                src={screenshotData}
                alt="screenshot"
                style={{ maxWidth: '100%', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
          )}
          <div style={{ marginTop: 'var(--space-4)' }}>
            <StlUploader
              onUploaded={() => {
                // STL uploaded — in full implementation, switch geometry to STL
              }}
            />
          </div>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <StlTransformPanel
              rotation={stlRotation}
              heightOffset={stlHeight}
              onRotationChange={(axis, v) =>
                setStlRotation((prev) => ({ ...prev, [axis]: v }))
              }
              onHeightChange={setStlHeight}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
            padding: 'var(--space-4)',
            background: 'var(--surface-warm)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-soft)',
          }}
        >
          <MaterialPanel
            color={color}
            onColorChange={setColor}
            roughness={roughness}
            onRoughnessChange={setRoughness}
            metalness={metalness}
            onMetalnessChange={setMetalness}
          />
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)' }}>
            <LightSystem lights={lights} onChange={setLights} />
          </div>
        </div>
      </div>
    </div>
  );
}
