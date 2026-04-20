import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Float, Text } from '@react-three/drei';
import * as THREE from 'three';

const IterationPoint = ({ position, color, delay = 0 }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Subtle breathing animation
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(t * 2 + delay) * 0.1);
    }
  });

  return (
    <mesh position={position} ref={meshRef}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={0.5} 
        toneMapped={false} 
      />
    </mesh>
  );
};

const GridLines = ({ size = 20 }) => {
  return (
    <gridHelper 
      args={[size, size, 0x333333, 0x111111]} 
      rotation={[Math.PI / 2, 0, 0]} 
    />
  );
};

const IterationSpace = ({ points }) => {
  return (
    <group>
      {points.map((point, idx) => (
        <IterationPoint 
          key={point.id} 
          position={point.current} 
          color={new THREE.Color().setHSL(0.6, 0.8, 0.5 + (point.current[0] / 20))}
          delay={idx * 0.1}
        />
      ))}
      <GridLines />
    </group>
  );
};

export default function VisualizerContainer({ points }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas shadows dpr={[1, 2]}>
        <color attach="background" args={['#0a0a0c']} />
        <PerspectiveCamera makeDefault position={[10, 10, 15]} fov={50} />
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 20, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <IterationSpace points={points} />
        </Float>

        <Text
          position={[0, -2, 0]}
          fontSize={0.5}
          color="#3b82f6"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
        >
          Iteration Domain (i, j)
        </Text>
      </Canvas>
    </div>
  );
}
