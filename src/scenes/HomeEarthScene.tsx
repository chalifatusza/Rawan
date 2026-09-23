import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export const HomeEarthScene: React.FC = () => {
  const earthGroupRef = useRef<THREE.Group>(null);
  const earthMeshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  // Load realistic NASA Earth textures
  const [dayMap, cloudsMap, specularMap, normalMap] = useLoader(THREE.TextureLoader, [
    '/textures/earth_day.jpg',
    '/textures/earth_clouds.png',
    '/textures/earth_specular.jpg',
    '/textures/earth_normal.jpg'
  ]);

  // Texture configuration for crisp photorealism
  useMemo(() => {
    dayMap.colorSpace = THREE.SRGBColorSpace;
    dayMap.anisotropy = 16;
    cloudsMap.colorSpace = THREE.SRGBColorSpace;
    cloudsMap.anisotropy = 16;
  }, [dayMap, cloudsMap]);

  // Frame animation: smooth rotation and subtle cloud drift
  useFrame((_, delta) => {
    if (earthMeshRef.current) {
      earthMeshRef.current.rotation.y += delta * 0.06;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.075;
    }
  });

  return (
    <group position={[0, 0.2, 0]}>
      {/* Crisp, Beautiful Studio & Solar Lighting */}
      {/* Key Sun Light: Illuminates front & continents brightly */}
      <directionalLight position={[5, 4, 10]} intensity={2.6} color="#ffffff" />
      
      {/* Soft Fill Light: Ensures the globe is vibrant, never pitch black */}
      <directionalLight position={[-6, 2, 7]} intensity={1.3} color="#e0f2fe" />
      
      {/* Subtle Rim/Back Light: Gives a delicate atmospheric space edge */}
      <directionalLight position={[0, -5, -8]} intensity={0.5} color="#34d399" />
      
      {/* Ambient Space Light: Keeps colors vivid and details clear */}
      <ambientLight intensity={0.85} color="#f8fafc" />

      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.25}>
        {/* Axial tilt of Earth: 23.4 degrees */}
        <group ref={earthGroupRef} rotation={[0, 0, 0.41]}>
          
          {/* Main Photorealistic Earth Sphere */}
          <mesh ref={earthMeshRef} rotation={[0, 4.6, 0]}>
            <sphereGeometry args={[2.5, 64, 64]} />
            <meshStandardMaterial
              map={dayMap}
              normalMap={normalMap}
              normalScale={new THREE.Vector2(0.6, 0.6)}
              roughnessMap={specularMap}
              roughness={0.45}
              metalness={0.05}
            />
          </mesh>

          {/* Natural Atmospheric Cloud Layer */}
          <mesh ref={cloudsRef} rotation={[0, 4.6, 0]} scale={1.008}>
            <sphereGeometry args={[2.5, 64, 64]} />
            <meshStandardMaterial
              map={cloudsMap}
              transparent
              opacity={0.42}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* Ultra-soft Single Layer Atmospheric Horizon Glow */}
          <mesh scale={1.02}>
            <sphereGeometry args={[2.5, 48, 48]} />
            <meshBasicMaterial
              color="#34d399"
              transparent
              opacity={0.12}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      </Float>

      {/* Gentle Star Sparkles in Background */}
      <Sparkles
        count={160}
        scale={14}
        size={2}
        speed={0.3}
        opacity={0.4}
        color="#a7f3d0"
      />
    </group>
  );
};
