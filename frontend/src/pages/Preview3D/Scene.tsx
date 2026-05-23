import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { Suspense } from 'react';

type GeometryType = 'sphere' | 'cube' | 'cylinder';
interface SceneProps {
  geometry: GeometryType;
  color: string;
  roughness: number;
  metalness: number;
  lights: LightDef[];
}

export interface LightDef {
  index: number;
  type: 'directional' | 'point';
  position: [number, number, number];
  color: string;
  intensity: number;
  enabled: boolean;
}

export function Scene({ geometry, color, roughness, metalness, lights }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [3, 2, 5], fov: 50 }}
      style={{ background: '#808080', borderRadius: 'var(--radius-md)' }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.3} />
        {lights
          .filter((l) => l.enabled)
          .map((l) =>
            l.type === 'directional' ? (
              <directionalLight
                key={l.index}
                position={l.position}
                intensity={l.intensity}
                color={l.color}
              />
            ) : (
              <pointLight
                key={l.index}
                position={l.position}
                intensity={l.intensity}
                color={l.color}
              />
            ),
          )}
        <mesh>
          {geometry === 'sphere' ? (
            <sphereGeometry args={[1, 32, 32]} />
          ) : geometry === 'cube' ? (
            <boxGeometry args={[1.5, 1.5, 1.5]} />
          ) : (
            <cylinderGeometry args={[1, 1, 2, 32]} />
          )}
          <meshStandardMaterial
            color={color}
            roughness={roughness}
            metalness={metalness}
          />
        </mesh>
        <Grid infiniteGrid fadeDistance={30} />
        <OrbitControls />
      </Suspense>
    </Canvas>
  );
}

export default function SceneWrapper(props: SceneProps) {
  return (
    <div style={{ height: 500, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <Scene {...props} />
    </div>
  );
}
