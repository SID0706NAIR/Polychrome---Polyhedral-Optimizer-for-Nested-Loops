import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Float, Text } from '@react-three/drei';
import * as THREE from 'three';

const IterationPoints = ({ points, highlight }) => {
  const pointsRef = useRef();
  
  const { positions, colors, sizes, highlightedPos } = useMemo(() => {
    const pos = new Float32Array(points.length * 3);
    const col = new Float32Array(points.length * 3);
    const siz = new Float32Array(points.length);
    let hPos = null;
    
    points.forEach((point, idx) => {
      pos[idx * 3] = point.current[0];
      pos[idx * 3 + 1] = point.current[1];
      pos[idx * 3 + 2] = point.current[2];

      const [i, j, k] = point.original;
      const isHighlighted = highlight.i === i && highlight.j === j && highlight.k === k;

      let pointColor = new THREE.Color().setHSL(0.6, 0.8, 0.5 + (point.current[0] / 20));
      if (isHighlighted) {
        pointColor = new THREE.Color('#ff3e3e');
        hPos = [...point.current];
      }

      col[idx * 3] = pointColor.r;
      col[idx * 3 + 1] = pointColor.g;
      col[idx * 3 + 2] = pointColor.b;

      siz[idx] = isHighlighted ? 1.0 : 0.2;
    });
    
    return { positions: pos, colors: col, sizes: siz, highlightedPos: hPos };
  }, [points, highlight]);

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.25} 
          vertexColors 
          transparent 
          opacity={0.8} 
          sizeAttenuation 
          blending={THREE.AdditiveBlending}
        />
      </points>
      {highlightedPos && (
        <group position={highlightedPos}>
          <pointLight color="#ff3e3e" intensity={5} distance={5} />
          <mesh>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial color="#ff3e3e" transparent opacity={0.6} />
          </mesh>
          <mesh scale={[1.5, 1.5, 1.5]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial color="#ff3e3e" transparent opacity={0.2} />
          </mesh>
        </group>
      )}
    </group>
  );
};

const GridLines = ({ size = 20 }) => {
  return (
    <group>
      <gridHelper 
        args={[size, size, 0x333333, 0x111111]} 
        rotation={[Math.PI / 2, 0, 0]} 
      />
      <gridHelper 
        args={[size, size, 0x333333, 0x111111]} 
        rotation={[0, 0, 0]} 
      />
      <axesHelper args={[10]} />
    </group>
  );
};

export default function VisualizerContainer({ points, highlight }) {
  const hasPoints = points && points.length > 0;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#0a0a0c' }}>
      <Canvas dpr={[1, 2]}>
        <color attach="background" args={['#0a0a0c']} />
        <PerspectiveCamera makeDefault position={[12, 12, 18]} fov={50} />
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        
        {hasPoints && (
          <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
            <IterationPoints points={points} highlight={highlight} />
            <GridLines />
          </Float>
        )}

        <Text
          position={[0, -2, 0]}
          fontSize={0.5}
          color="#3b82f6"
          anchorX="center"
          anchorY="middle"
        >
          {hasPoints ? 'Iteration Domain (i, j, k)' : 'Initializing Engine...'}
        </Text>
      </Canvas>
      {!hasPoints && (
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'var(--accent-color)',
          background: 'rgba(10, 10, 12, 0.8)',
          backdropFilter: 'blur(4px)',
          zIndex: 5
        }}>
          <div className="glass-panel" style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', gap: '15px' }}>
             <div className="spinner" style={{ width: '20px', height: '20px', border: '2px solid var(--accent-color)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
             Loading Iteration Space...
          </div>
        </div>
      )}
    </div>
  );
}
