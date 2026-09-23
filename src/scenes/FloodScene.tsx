import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { soundEngine } from '../audio/soundEngine';

export type FloodStage = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const FloodSceneSetup: React.FC<{ stage: FloodStage }> = ({ stage }) => {
  const { scene } = useThree();

  useEffect(() => {
    const fogColor = stage >= 1 && stage <= 4
      ? new THREE.Color('#334155')
      : stage === 5
      ? new THREE.Color('#475569')
      : new THREE.Color('#93c5fd');
    scene.fog = new THREE.Fog(fogColor, 40, 110);
    return () => { scene.fog = null; };
  }, [scene, stage]);

  return null;
};

// ─── TROPICAL COCONUT PALM TREE ───
const PalmTree: React.FC<{ position: [number, number, number]; scale?: number; rotationY?: number; wind?: number }> = ({
  position,
  scale = 1,
  rotationY = 0,
  wind = 0
}) => (
  <group position={position} scale={[scale, scale, scale]} rotation={[wind * 0.05, rotationY, 0.08 + wind * 0.1]}>
    <mesh position={[0, 0.4, 0]}>
      <cylinderGeometry args={[0.13, 0.17, 0.8, 8]} />
      <meshStandardMaterial color="#78350f" roughness={0.85} />
    </mesh>
    <mesh position={[0.06, 1.15, 0]} rotation={[0, 0, -0.06]}>
      <cylinderGeometry args={[0.11, 0.13, 0.8, 8]} />
      <meshStandardMaterial color="#854d0e" roughness={0.85} />
    </mesh>
    <mesh position={[0.15, 1.9, 0]} rotation={[0, 0, -0.1]}>
      <cylinderGeometry args={[0.09, 0.11, 0.8, 8]} />
      <meshStandardMaterial color="#78350f" roughness={0.85} />
    </mesh>
    <mesh position={[0.26, 2.6, 0]} rotation={[0, 0, -0.15]}>
      <cylinderGeometry args={[0.08, 0.09, 0.65, 8]} />
      <meshStandardMaterial color="#854d0e" roughness={0.85} />
    </mesh>

    {/* Coconut Cluster */}
    <group position={[0.32, 2.9, 0]}>
      {[-0.09, 0.09, 0].map((cx, i) => (
        <mesh key={`coco-${i}`} position={[cx, -0.05, (i === 2 ? 0.09 : -0.07)]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshStandardMaterial color="#713f12" roughness={0.7} />
        </mesh>
      ))}
    </group>

    {/* Arching Palm Fronds */}
    <group position={[0.32, 2.95, 0]}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((f) => {
        const angle = (f / 8) * Math.PI * 2;
        return (
          <group key={`frond-${f}`} rotation={[0, angle, wind * 0.15]}>
            <mesh position={[0.65, 0.15, 0]} rotation={[0, 0, -0.35]}>
              <boxGeometry args={[1.3, 0.03, 0.28]} />
              <meshStandardMaterial color="#16a34a" roughness={0.5} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[1.4, -0.22, 0]} rotation={[0, 0, -0.85]}>
              <boxGeometry args={[0.7, 0.02, 0.22]} />
              <meshStandardMaterial color="#15803d" roughness={0.5} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}
    </group>
  </group>
);

// ─── TROPICAL BANANA PLANT ───
const BananaPlant: React.FC<{ position: [number, number, number]; scale?: number; wind?: number }> = ({ 
  position, 
  scale = 1,
  wind = 0
}) => (
  <group position={position} scale={[scale, scale, scale]} rotation={[0, 0, wind * 0.08]}>
    <mesh position={[0, 0.5, 0]}>
      <cylinderGeometry args={[0.1, 0.14, 1.0, 8]} />
      <meshStandardMaterial color="#65a30d" roughness={0.6} />
    </mesh>
    {[0, 1, 2, 3, 4].map((i) => (
      <mesh key={`leaf-${i}`} position={[0, 0.9, 0]} rotation={[0.4 + wind * 0.1, (i / 5) * Math.PI * 2, 0.35]}>
        <boxGeometry args={[0.4, 0.02, 1.3]} />
        <meshStandardMaterial color="#4d7c0f" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
    ))}
  </group>
);

// ─── SHADE TREE (Pohon Peneduh Perkotaan) ───
const ShadeTree: React.FC<{ position: [number, number, number]; scale?: number; wind?: number }> = ({ 
  position, 
  scale = 1,
  wind = 0
}) => (
  <group position={position} scale={[scale, scale, scale]} rotation={[0, 0, wind * 0.05]}>
    <mesh position={[0, 0.9, 0]}>
      <cylinderGeometry args={[0.18, 0.24, 1.8, 8]} />
      <meshStandardMaterial color="#451a03" roughness={0.85} />
    </mesh>
    <mesh position={[0, 2.2, 0]}>
      <sphereGeometry args={[1.1, 12, 10]} />
      <meshStandardMaterial color="#15803d" roughness={0.7} />
    </mesh>
    <mesh position={[-0.45, 2.5, 0.3]}>
      <sphereGeometry args={[0.85, 10, 8]} />
      <meshStandardMaterial color="#166534" roughness={0.7} />
    </mesh>
    <mesh position={[0.45, 2.4, -0.3]}>
      <sphereGeometry args={[0.9, 10, 8]} />
      <meshStandardMaterial color="#14532d" roughness={0.7} />
    </mesh>
  </group>
);

// ─── STORM CLOUD CLUSTER COMPONENT ───
const StormClouds: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  return (
    <group position={[0, 7.5, 0]}>
      {[-8, -4, 0, 4, 8].map((cx, i) => (
        <group key={`cloud-${i}`} position={[cx, Math.sin(i) * 0.4, Math.cos(i) * 2]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[2.8, 10, 8]} />
            <meshStandardMaterial color="#334155" roughness={0.9} transparent opacity={0.85} />
          </mesh>
          <mesh position={[1.6, 0.2, 0.5]}>
            <sphereGeometry args={[2.1, 8, 8]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} transparent opacity={0.85} />
          </mesh>
          <mesh position={[-1.5, -0.1, -0.4]}>
            <sphereGeometry args={[2.2, 8, 8]} />
            <meshStandardMaterial color="#475569" roughness={0.9} transparent opacity={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ─── HIGH-PERFORMANCE ULTRA-VISIBLE MONSOON RAIN SYSTEM ───
const MonsoonRain: React.FC<{ active: boolean; stage: FloodStage }> = ({ active, stage }) => {
  const rainLinesRef = useRef<THREE.LineSegments>(null);
  const splashRef = useRef<THREE.InstancedMesh>(null);
  const count = 900;
  const splashCount = 60;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Geometry and position arrays for LineSegments
  const [geometry, rainData] = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 6);
    const data: { x: number; y: number; z: number; speed: number; len: number }[] = [];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 32;
      const y = -1.0 + Math.random() * 14.0;
      const z = (Math.random() - 0.5) * 26;
      const speed = 0.4 + Math.random() * 0.28;
      const len = 1.1 + Math.random() * 0.8;

      data.push({ x, y, z, speed, len });

      const idx = i * 6;
      pos[idx] = x;
      pos[idx + 1] = y;
      pos[idx + 2] = z;
      pos[idx + 3] = x - 0.16; // wind slant
      pos[idx + 4] = y - len;
      pos[idx + 5] = z;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return [geo, data];
  }, [count]);

  const splashes = useMemo(() => {
    return Array.from({ length: splashCount }).map(() => ({
      x: (Math.random() - 0.5) * 24,
      z: (Math.random() - 0.5) * 20,
      scale: Math.random(),
      speed: 0.05 + Math.random() * 0.04
    }));
  }, [splashCount]);

  useFrame(() => {
    if (!active || !rainLinesRef.current) return;
    const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const d = rainData[i];
      d.y -= d.speed;
      d.x -= 0.035; // wind drift
      if (d.y < -1.8) {
        d.y = 9.5 + Math.random() * 3.5;
        d.x = (Math.random() - 0.5) * 32;
        d.z = (Math.random() - 0.5) * 26;
      }

      const idx = i * 6;
      arr[idx] = d.x;
      arr[idx + 1] = d.y;
      arr[idx + 2] = d.z;
      arr[idx + 3] = d.x - 0.16;
      arr[idx + 4] = d.y - d.len;
      arr[idx + 5] = d.z;
    }
    posAttr.needsUpdate = true;

    // Splash ripples animation
    if (splashRef.current) {
      splashes.forEach((sp, i) => {
        sp.scale += sp.speed;
        if (sp.scale > 1.0) {
          sp.scale = 0.05;
          sp.x = (Math.random() - 0.5) * 24;
          sp.z = (Math.random() - 0.5) * 20;
        }
        const waterY = stage <= 2 ? 0.02 : stage === 3 ? 0.28 : 0.95;
        dummy.position.set(sp.x, waterY, sp.z);
        dummy.rotation.set(-Math.PI / 2, 0, 0);
        dummy.scale.set(sp.scale * 0.7, sp.scale * 0.7, 1);
        dummy.updateMatrix();
        splashRef.current!.setMatrixAt(i, dummy.matrix);
      });
      splashRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  if (!active) return null;

  return (
    <group>
      <lineSegments ref={rainLinesRef} geometry={geometry}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.94} linewidth={2} />
      </lineSegments>

      {/* Splash rings on water/ground */}
      <instancedMesh ref={splashRef} args={[undefined, undefined, splashCount]}>
        <ringGeometry args={[0.15, 0.26, 16]} />
        <meshBasicMaterial color="#bae6fd" transparent opacity={0.7} side={THREE.DoubleSide} />
      </instancedMesh>
    </group>
  );
};

interface FloodSceneProps {
  isSimulating?: boolean;
  floodStage?: FloodStage;
  onActionClick?: (actionId: string) => void;
  showCutaway?: boolean;
}

export const FloodScene: React.FC<FloodSceneProps> = ({
  isSimulating = true,
  floodStage = 0,
  onActionClick,
  showCutaway: externalCutaway
}) => {
  // Animation Refs (Separated River Water and Urban Floodwater to PREVENT Z-fighting!)
  const riverWaterRef = useRef<THREE.Mesh>(null);
  const urbanFloodRef = useRef<THREE.Mesh>(null);
  const debrisCarRef = useRef<THREE.Group>(null);
  const rescueBoatRef = useRef<THREE.Group>(null);
  const sparkRef = useRef<THREE.PointLight>(null);
  const lightningLightRef = useRef<THREE.PointLight>(null);
  const trashPileRef = useRef<THREE.Group>(null);

  // Cutaway View Override (Default FALSE)
  const [internalShowCutaway] = useState<boolean>(false);
  const showCutaway = externalCutaway !== undefined ? externalCutaway : internalShowCutaway;

  // Wind calculation for swaying elements
  const [windFactor, setWindFactor] = useState(0);

  const isRainy = floodStage >= 1 && floodStage <= 5;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const currentWind = isRainy ? Math.sin(t * 4.0) * 0.6 : Math.sin(t * 1.5) * 0.1;
    setWindFactor(currentWind);

    // 1. RIVER WATER LEVEL (Inside River Trench from Y = -1.8 upwards)
    let targetRiverY = -1.2;
    if (floodStage === 0) targetRiverY = -1.2;
    else if (floodStage === 1) targetRiverY = -0.7;
    else if (floodStage === 2) targetRiverY = -0.25;
    else if (floodStage === 3) targetRiverY = 0.25; // spills over tanggul
    else if (floodStage === 4) targetRiverY = 0.85;
    else if (floodStage === 5) targetRiverY = 1.05;
    else if (floodStage === 6) targetRiverY = -0.9;

    const riverSurfaceY = targetRiverY + Math.sin(t * 3.0) * 0.02;

    if (riverWaterRef.current) {
      const bottomY = -1.8;
      const height = Math.max(0.1, riverSurfaceY - bottomY);
      riverWaterRef.current.scale.set(1, height, 1);
      riverWaterRef.current.position.set(-7.5, bottomY + height / 2, 0);
    }

    // 2. URBAN FLOODWATER LAYER (Active ONLY when stage >= 3 onto road & house!)
    if (urbanFloodRef.current) {
      if (floodStage >= 3 && floodStage <= 5) {
        let urbanDepth = 0.25;
        if (floodStage === 3) urbanDepth = 0.25;
        else if (floodStage === 4) urbanDepth = 0.85;
        else if (floodStage === 5) urbanDepth = 1.05;

        const currentUrbanDepth = urbanDepth + Math.sin(t * 2.5) * 0.02;
        urbanFloodRef.current.scale.set(1, currentUrbanDepth, 1);
        urbanFloodRef.current.position.set(3.0, 0.01 + currentUrbanDepth / 2, 0);
        urbanFloodRef.current.visible = true;
      } else {
        urbanFloodRef.current.visible = false;
        urbanFloodRef.current.position.set(3.0, -999, 0);
      }
    }

    // 3. SEDAN CAR (Rests on road at Y=0.02, floats when urban water rises!)
    if (debrisCarRef.current) {
      if (floodStage <= 2) {
        debrisCarRef.current.position.set(-1.2, 0.02, 1.2);
        debrisCarRef.current.rotation.set(0, 0, 0);
      } else if (floodStage === 3) {
        debrisCarRef.current.position.set(-1.2, 0.12 + Math.sin(t * 2.5) * 0.03, 1.2);
        debrisCarRef.current.rotation.set(0.04, 0.05, Math.sin(t * 2.0) * 0.04);
      } else if (floodStage === 4 || floodStage === 5) {
        // Drifting in current!
        debrisCarRef.current.position.set(
          -1.2 + Math.sin(t * 0.8) * 0.7,
          (floodStage === 4 ? 0.7 : 0.9) + Math.sin(t * 3.2) * 0.05,
          1.2 + Math.cos(t * 0.6) * 0.5
        );
        debrisCarRef.current.rotation.set(
          Math.sin(t * 2.2) * 0.09,
          0.35 + Math.sin(t * 0.5) * 0.25,
          Math.cos(t * 1.8) * 0.1
        );
      } else {
        debrisCarRef.current.position.set(-1.5, 0.02, 1.5);
        debrisCarRef.current.rotation.set(0.05, 0.3, -0.04);
      }
    }

    // 4. BNPB RESCUE BOAT (Stage 4 & 5)
    if (rescueBoatRef.current) {
      if (floodStage === 4 || floodStage === 5) {
        rescueBoatRef.current.position.set(
          -1.8 + Math.sin(t * 0.9) * 0.8,
          (floodStage === 4 ? 0.92 : 1.12) + Math.sin(t * 3.5) * 0.03,
          2.5 + Math.cos(t * 0.7) * 0.5
        );
        rescueBoatRef.current.rotation.set(
          Math.sin(t * 2.0) * 0.05,
          -0.3 + Math.sin(t * 0.6) * 0.2,
          Math.cos(t * 2.2) * 0.06
        );
      } else {
        rescueBoatRef.current.position.set(0, -999, 0);
      }
    }

    // 5. ELECTRICAL SPARKING ON POWER POLE (Stage 3 & 4)
    if (sparkRef.current) {
      sparkRef.current.intensity = (floodStage === 3 || floodStage === 4)
        ? (Math.random() > 0.7 ? 10.0 : 0.2)
        : 0;
    }

    // 6. THUNDERSTORM LIGHTNING FLASH
    if (lightningLightRef.current) {
      lightningLightRef.current.intensity = isRainy && Math.random() > 0.96 ? 5.5 : 0;
    }
  });

  return (
    <group>
      <FloodSceneSetup stage={floodStage} />

      {/* ── LIGHTING & ATMOSPHERE ── */}
      <ambientLight intensity={isRainy ? 0.75 : 1.3} />
      <hemisphereLight
        args={[
          isRainy ? '#475569' : '#bae6fd',
          '#1e293b',
          isRainy ? 0.9 : 1.2
        ]}
      />
      <directionalLight
        position={[8, 16, 10]}
        intensity={isRainy ? 1.4 : 2.6}
        color={isRainy ? '#94a3b8' : '#ffffff'}
        castShadow
      />
      <pointLight ref={lightningLightRef} position={[0, 10, 0]} color="#e0f2fe" distance={40} />
      <pointLight ref={sparkRef} position={[1.4, 2.0, -3.5]} color="#38bdf8" distance={10} />
      <pointLight position={[4.5, 3.5, -1.0]} intensity={floodStage >= 4 ? 3.5 : 1.0} color="#f59e0b" distance={10} />

      {/* ── STORM CLOUDS OVERHEAD ── */}
      <StormClouds active={isRainy} />

      {/* ── HIGH-PERFORMANCE MONSOON RAIN SYSTEM ── */}
      <MonsoonRain active={isRainy} stage={floodStage} />

      {/* ── MAIN SCENE GEOMETRY GROUP (Y=0 is Ground Surface) ── */}
      <group>
        
        {/* 1. SOLID UNDERGROUND FOUNDATION (Extends from Y=0 down to Y=-3.5) */}
        {/* Right side residential earth block */}
        <mesh position={[3.0, -1.75, 0]} receiveShadow>
          <boxGeometry args={[16.0, 3.5, 17.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
        {/* Left side riverbed base */}
        <mesh position={[-7.5, -2.65, 0]} receiveShadow>
          <boxGeometry args={[6.0, 1.7, 17.0]} />
          <meshStandardMaterial color="#0f172a" roughness={0.95} />
        </mesh>

        {/* 2. THE SUNKEN RIVER CHANNEL (Sunken -1.8m below ground level!) */}
        <group position={[-7.5, 0, 0]}>
          {/* Concrete Left Riverbank Slope */}
          <mesh position={[-3.1, -0.9, 0]} rotation={[0, 0, -0.2]}>
            <boxGeometry args={[0.5, 2.2, 17.0]} />
            <meshStandardMaterial color="#475569" roughness={0.8} />
          </mesh>

          {/* Concrete Right Riverbank (Tanggul Pembatas Sungai) with Parapet Wall */}
          <mesh position={[2.8, -0.9, 0]} rotation={[0, 0, 0.15]}>
            <boxGeometry args={[0.6, 2.2, 17.0]} />
            <meshStandardMaterial color="#64748b" roughness={0.8} />
          </mesh>
          {/* Concrete Tanggul Parapet (Height Y = 0.25 above road) */}
          <mesh position={[2.95, 0.12, 0]}>
            <boxGeometry args={[0.5, 0.35, 17.0]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.7} />
          </mesh>

          {/* Riverbed Rocks & Boulders at Bottom (Y = -1.7) */}
          {[-1.2, 0.5, -0.4].map((bx, bi) => (
            <mesh key={`rock-${bi}`} position={[bx, -1.65, bi * 4 - 4]}>
              <dodecahedronGeometry args={[0.35, 0]} />
              <meshStandardMaterial color="#334155" roughness={0.9} />
            </mesh>
          ))}

          {/* RIVER BRIDGE (Jembatan Jalan Beton - Level with road at Y=0.08) */}
          <group position={[0, 0.08, -3.5]}>
            {/* Bridge Roadway Deck */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[6.2, 0.2, 2.4]} />
              <meshStandardMaterial color="#334155" roughness={0.8} />
            </mesh>
            {/* Bridge Support Pillars descending into riverbed */}
            <mesh position={[-1.5, -0.9, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 1.8, 8]} />
              <meshStandardMaterial color="#64748b" />
            </mesh>
            <mesh position={[1.5, -0.9, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 1.8, 8]} />
              <meshStandardMaterial color="#64748b" />
            </mesh>
            {/* Yellow Bridge Safety Railings */}
            <mesh position={[0, 0.4, 1.15]}>
              <boxGeometry args={[6.2, 0.55, 0.08]} />
              <meshStandardMaterial color="#eab308" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.4, -1.15]}>
              <boxGeometry args={[6.2, 0.55, 0.08]} />
              <meshStandardMaterial color="#eab308" roughness={0.5} />
            </mesh>
          </group>

          {/* PEILSCHAAL (Mistar Ukur Ketinggian Air Sungai) on Riverbank */}
          <group position={[2.7, -0.6, 1.8]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.16, 2.4, 0.08]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
            {/* Siaga 1 Merah (Bencana > 2.5m) */}
            <mesh position={[0, 0.8, 0.05]}>
              <boxGeometry args={[0.18, 0.5, 0.03]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={floodStage >= 3 ? 2.5 : 0.8} />
            </mesh>
            {/* Siaga 2 Kuning (Kritis) */}
            <mesh position={[0, 0.3, 0.05]}>
              <boxGeometry args={[0.18, 0.5, 0.03]} />
              <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={floodStage === 2 ? 2.0 : 0.6} />
            </mesh>
            {/* Siaga 3 Hijau (Normal) */}
            <mesh position={[0, -0.35, 0.05]}>
              <boxGeometry args={[0.18, 0.8, 0.03]} />
              <meshStandardMaterial color="#22c55e" />
            </mesh>

            {/* 3D Label attached to Peilschaal */}
            <Html position={[0, 1.4, 0]} center distanceFactor={8.5}>
              <div className="px-2 py-0.5 rounded-lg bg-slate-950/95 text-cyan-300 font-black text-[9.5px] tracking-wider border border-cyan-500 shadow-md whitespace-nowrap pointer-events-none">
                📊 Peilschaal Sungai
              </div>
            </Html>
          </group>

          {/* River Signboard */}
          <group position={[1.5, 0.6, 5.0]} rotation={[0, -0.4, 0]}>
            <mesh position={[0, -0.3, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
              <meshStandardMaterial color="#64748b" />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[1.6, 0.5, 0.05]} />
              <meshStandardMaterial color="#0284c7" />
            </mesh>
            <Html position={[0, 0.2, 0.06]} center distanceFactor={7.5}>
              <div className="text-[8px] font-black text-white text-center leading-tight tracking-tight uppercase">
                Sungai Ciliwung<br/><span className="text-cyan-200 text-[6.5px]">Pos Pemantauan Debit</span>
              </div>
            </Html>
          </group>
        </group>

        {/* 3. DEDICATED RIVER WATER MESH (Contained strictly inside River Channel, No Z-fighting!) */}
        <mesh ref={riverWaterRef} position={[-7.5, -1.2, 0]}>
          <boxGeometry args={[5.4, 1.0, 16.6]} />
          <meshStandardMaterial
            color={floodStage >= 1 ? '#0284c7' : '#0369a1'}
            roughness={0.12}
            metalness={0.25}
            transparent
            opacity={0.88}
            emissive={floodStage >= 1 ? '#0284c7' : '#0369a1'}
            emissiveIntensity={0.25}
          />
        </mesh>

        {/* 4. DEDICATED URBAN FLOODWATER LAYER (Spreads over road & house when stage >= 3) */}
        <mesh ref={urbanFloodRef} position={[3.0, 0.1, 0]} visible={false}>
          <boxGeometry args={[15.6, 1.0, 16.6]} />
          <meshStandardMaterial
            color="#0284c7"
            roughness={0.12}
            metalness={0.25}
            transparent
            opacity={0.88}
            emissive="#0284c7"
            emissiveIntensity={0.25}
          />
        </mesh>

        {/* 5. GROUND SURFACE, ASPHALT ROAD & SIDEWALK (Surface Level at Y=0) */}
        {/* Asphalt Road */}
        <mesh position={[-1.2, 0.01, 0]}>
          <boxGeometry args={[6.6, 0.04, 17.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.85} />
        </mesh>
        {/* Yellow Road Lane Markings */}
        {[-6, -3.5, -1, 1.5, 4, 6.5].map((rz, ri) => (
          <mesh key={`marking-${ri}`} position={[-1.2, 0.035, rz]}>
            <boxGeometry args={[0.18, 0.01, 1.4]} />
            <meshStandardMaterial color="#facc15" />
          </mesh>
        ))}

        {/* Concrete Sidewalk (Trotoar Y = 0.12) */}
        <mesh position={[2.8, 0.08, 0]}>
          <boxGeometry args={[1.4, 0.16, 17.0]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.7} />
        </mesh>

        {/* 6. OPEN ROADSIDE DRAINAGE GUTTER (Got Pemukiman) */}
        <group position={[-4.1, -0.05, 0]}>
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[0.6, 0.3, 17.0]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        </group>

        {/* 7. STORMWATER DRAINAGE GRATE & TRASH CLOG (Gorong-gorong Jalan) */}
        <group position={[-2.2, 0.03, 0.5]}>
          {/* Steel Grate Frame */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.2, 0.04, 1.2]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} />
          </mesh>
          {/* Iron Bars */}
          {[-0.4, -0.2, 0, 0.2, 0.4].map((gx, gi) => (
            <mesh key={`grate-bar-${gi}`} position={[gx, 0.025, 0]}>
              <boxGeometry args={[0.04, 0.02, 1.1]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}

          {/* VISIBLE PILE OF TRASH / SAMPAH MENYUMBAT DRAINASE (Stage >= 2) */}
          {(floodStage >= 2 || showCutaway) && (
            <group ref={trashPileRef} position={[0, 0.12, 0]}>
              {/* Plastic Waste Bags */}
              <mesh position={[-0.2, 0.05, -0.15]}>
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshStandardMaterial color="#ef4444" roughness={0.4} />
              </mesh>
              <mesh position={[0.22, 0.08, 0.18]}>
                <sphereGeometry args={[0.22, 8, 8]} />
                <meshStandardMaterial color="#eab308" roughness={0.4} />
              </mesh>
              {/* Soda Bottles & Debris */}
              <mesh position={[0.05, 0.08, -0.2]} rotation={[0.4, 0.8, 0.2]}>
                <cylinderGeometry args={[0.06, 0.06, 0.3, 8]} />
                <meshStandardMaterial color="#06b6d4" transparent opacity={0.7} />
              </mesh>
              <mesh position={[-0.15, 0.06, 0.2]} rotation={[0.2, -0.6, 0.5]}>
                <boxGeometry args={[0.3, 0.08, 0.15]} />
                <meshStandardMaterial color="#78350f" roughness={0.9} />
              </mesh>

              {/* 3D Warning Badge directly over clogged drain */}
              <Html position={[0, 0.8, 0]} center distanceFactor={8.5}>
                <div className="px-2.5 py-1 rounded-xl bg-red-950 text-white font-black text-[10px] tracking-wider border border-red-600 shadow-md whitespace-nowrap pointer-events-none">
                  ⚠️ Drainase Tersumbat Sampah!
                </div>
              </Html>
            </group>
          )}
        </group>

        {/* 8. INDONESIAN 2-STORY HOUSE (Grounded at Y=0.0) */}
        <group position={[5.8, 0, -1.2]}>
          {/* Ground Floor (Y = 0.0 to 2.2) */}
          <mesh position={[0, 1.1, 0]}>
            <boxGeometry args={[4.6, 2.2, 4.2]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
          {/* Front Porch Concrete Pillars */}
          <mesh position={[-1.9, 1.1, 2.3]}>
            <cylinderGeometry args={[0.09, 0.09, 2.2, 8]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
          <mesh position={[1.9, 1.1, 2.3]}>
            <cylinderGeometry args={[0.09, 0.09, 2.2, 8]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
          {/* Ground Floor Door & Windows */}
          <mesh position={[-0.6, 0.85, 2.12]}>
            <boxGeometry args={[0.9, 1.6, 0.05]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          <mesh position={[1.2, 1.1, 2.12]}>
            <boxGeometry args={[1.3, 0.9, 0.05]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.2} />
          </mesh>

          {/* 2nd Floor (Lantai 2 Evakuasi Vertikal Y = 2.2 to 4.0) */}
          <mesh position={[0, 3.1, 0]}>
            <boxGeometry args={[4.6, 1.8, 4.2]} />
            <meshStandardMaterial color="#e0f2fe" roughness={0.4} />
          </mesh>
          {/* 2nd Floor Open Balcony Railing (Y = 2.2 to 2.9) */}
          <mesh position={[0, 2.6, 2.2]}>
            <boxGeometry args={[4.4, 0.7, 0.1]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
          {/* Balcony Door */}
          <mesh position={[0, 3.1, 2.12]}>
            <boxGeometry args={[1.2, 1.5, 0.05]} />
            <meshStandardMaterial color="#0369a1" />
          </mesh>

          {/* Terracotta Tiled Pitched Roof (Y = 4.0 to 5.6) */}
          <mesh position={[0, 4.75, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[3.8, 1.6, 4]} />
            <meshStandardMaterial color="#dc2626" roughness={0.55} />
          </mesh>

          {/* Interactive Safe 2nd Floor Evacuation Prompt */}
          <Html position={[0, 3.8, 2.3]} center distanceFactor={8.5}>
            <button
              onClick={() => {
                soundEngine.playClick();
                if (onActionClick) onActionClick('VERTICAL_EVACUATION');
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md cursor-pointer hover:scale-105 transition-all whitespace-nowrap border-2 border-white pointer-events-auto"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white" />
              <span>EVAKUASI KE LANTAI 2!</span>
            </button>
          </Html>
        </group>

        {/* 9. ELECTRICAL POWER POLE (PLN Hazard: Rooted at Y=0.0) */}
        <group position={[1.4, 0, -3.5]}>
          {/* Concrete Pole (Height 4.5m) */}
          <mesh position={[0, 2.25, 0]}>
            <cylinderGeometry args={[0.1, 0.14, 4.5, 8]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>
          {/* Crossarms */}
          <mesh position={[0, 4.1, 0]}>
            <boxGeometry args={[1.8, 0.1, 0.1]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          {[-0.7, 0, 0.7].map((ix, i) => (
            <mesh key={`insul-${i}`} position={[ix, 4.25, 0]}>
              <cylinderGeometry args={[0.04, 0.05, 0.25]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
          ))}

          {/* Yellow Electric MCB Circuit Breaker Box */}
          <mesh position={[0.22, 1.5, 0]}>
            <boxGeometry args={[0.32, 0.48, 0.24]} />
            <meshStandardMaterial color="#eab308" emissive="#f59e0b" emissiveIntensity={1.4} />
          </mesh>

          {/* Interactive MCB Power Cutoff Prompt */}
          <Html position={[0.22, 2.2, 0]} center distanceFactor={8.5}>
            <button
              onClick={() => {
                soundEngine.playClick();
                if (onActionClick) onActionClick('SHUTOFF_MCB');
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-black text-[11px] shadow-md cursor-pointer hover:scale-105 transition-all whitespace-nowrap border border-white pointer-events-auto"
            >
              <span>⚡ MATIKAN MCB LISTRIK!</span>
            </button>
          </Html>
        </group>

        {/* 10. SEDAN CAR (Mobil Warga) */}
        <group ref={debrisCarRef} position={[-1.2, 0.02, 1.2]}>
          {/* Car Lower Body */}
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[2.2, 0.55, 1.2]} />
            <meshStandardMaterial color="#dc2626" roughness={0.3} />
          </mesh>
          {/* Car Cabin */}
          <mesh position={[-0.1, 0.75, 0]}>
            <boxGeometry args={[1.3, 0.45, 1.05]} />
          </mesh>
          <mesh position={[1.12, 0.35, 0.38]}>
            <boxGeometry args={[0.05, 0.15, 0.22]} />
            <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={2.0} />
          </mesh>
          {/* Wheels */}
          {[
            [-0.65, 0.15, -0.6],
            [0.65, 0.15, -0.6],
            [-0.65, 0.15, 0.6],
            [0.65, 0.15, 0.6]
          ].map(([wx, wy, wz], wi) => (
            <mesh key={`wheel-${wi}`} position={[wx, wy, wz]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.14, 12]} />
              <meshStandardMaterial color="#0f172a" roughness={0.9} />
            </mesh>
          ))}
        </group>

        {/* 11. BNPB/SAR ORANGE INFLATABLE RESCUE BOAT */}
        <group ref={rescueBoatRef} position={[0, -999, 0]} rotation={[0, -0.3, 0]}>
          <mesh>
            <torusGeometry args={[1.1, 0.24, 12, 24]} />
            <meshStandardMaterial color="#ea580c" roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[2.0, 0.06, 1.3]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Outboard Motor */}
          <mesh position={[-1.15, 0.2, 0]}>
            <boxGeometry args={[0.25, 0.6, 0.3]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          {/* Rescue Life Ring */}
          <mesh position={[0.6, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.22, 0.06, 8, 16]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
          </mesh>
        </group>

        {/* 12. URBAN FLORA (Pohon Tropis & Peneduh) */}
        <PalmTree position={[8.5, 0, 3.2]} scale={1.1} rotationY={0.8} wind={windFactor} />
        <PalmTree position={[8.8, 0, -4.5]} scale={1.2} rotationY={-0.5} wind={windFactor} />
        <ShadeTree position={[2.2, 0, -5.5]} scale={1.1} wind={windFactor} />
        <BananaPlant position={[9.2, 0, -1.2]} scale={1.15} wind={windFactor} />

        {/* 13. SUBTERRANEAN PROCESS & DRAINAGE CUTAWAY (When "Tampilkan Proses" is Active) */}
        {showCutaway && (
          <group position={[0, 0, 8.52]}>
            {/* Diorama Front Cutaway Face Background (From Y=0 down to Y=-3.5) */}
            <mesh position={[0, -1.75, 0]}>
              <boxGeometry args={[22.0, 3.5, 0.08]} />
              <meshStandardMaterial color="#0f172a" roughness={0.9} />
            </mesh>

            {/* CUTAWAY SECTION 1: RIVER BED CROSS-SECTION (Left: x = -7.5) */}
            <group position={[-7.5, 0, 0.08]}>
              <mesh position={[0, -1.2, 0]}>
                <boxGeometry args={[5.5, 2.4, 0.04]} />
                <meshStandardMaterial color="#0369a1" transparent opacity={0.85} />
              </mesh>
              <mesh position={[0, -2.9, 0.01]}>
                <boxGeometry args={[5.5, 1.0, 0.04]} />
                <meshStandardMaterial color="#1e293b" roughness={0.9} />
              </mesh>
            </group>

            {/* CUTAWAY SECTION 2: UNDERGROUND DRAINAGE PIPE WITH TRASH PLUG (Center: x = -2.2) */}
            <group position={[-2.2, -1.1, 0.08]}>
              {/* Transparent Concrete Culvert Pipe */}
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.6, 0.6, 4.4, 16]} />
                <meshStandardMaterial color="#64748b" transparent opacity={0.65} />
              </mesh>
              {/* Massive Clogged Trash & Silt Plug */}
              <mesh position={[0.2, 0, 0]}>
                <dodecahedronGeometry args={[0.5, 0]} />
                <meshStandardMaterial color="#78350f" roughness={0.95} />
              </mesh>
              {/* Water backfilling arrow */}
              <group position={[-1.2, 0.5, 0]}>
                <mesh rotation={[0, 0, -Math.PI / 2]}>
                  <coneGeometry args={[0.2, 0.4, 8]} />
                  <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.5} />
                </mesh>
              </group>
            </group>

            {/* CUTAWAY SECTION 3: SATURATED GROUNDWATER INFILTRATION ZONE (Right: x = 4.5) */}
            <group position={[4.5, 0, 0.08]}>
              <mesh position={[0, -1.5, 0]}>
                <boxGeometry args={[7.0, 2.8, 0.04]} />
                <meshStandardMaterial color="#451a03" roughness={0.9} />
              </mesh>
              {/* Downward Saturation Vector Arrows */}
              {[-2.2, 0, 2.2].map((ax, ai) => (
                <group key={`infilt-cut-${ai}`} position={[ax, -0.6, 0]} rotation={[0, 0, Math.PI]}>
                  <mesh position={[0, 0.3, 0]}>
                    <coneGeometry args={[0.18, 0.35, 8]} />
                    <meshStandardMaterial color="#06b6d4" emissive="#0891b2" emissiveIntensity={2.5} />
                  </mesh>
                  <mesh position={[0, 0, 0]}>
                    <cylinderGeometry args={[0.06, 0.06, 0.35, 8]} />
                    <meshStandardMaterial color="#06b6d4" emissive="#0891b2" emissiveIntensity={2.0} />
                  </mesh>
                </group>
              ))}
            </group>
          </group>
        )}
      </group>

      {/* ── CUTAWAY LABELS & 3D HUD (When "Tampilkan Proses" is Active) ── */}
      {showCutaway && (
        <group>
          {/* Label 1: River Depth & Discharge */}
          <Html position={[-7.5, -1.2, 8.8]} center distanceFactor={8.5}>
            <div className="px-3 py-1.5 rounded-xl bg-zinc-900 text-cyan-200 font-bold text-[10px] tracking-wider border border-zinc-700 shadow-md whitespace-nowrap pointer-events-none">
              🌊 Penampang Palung Sungai (Debit Kritis)
            </div>
          </Html>

          {/* Label 2: Clogged Drainage Culvert */}
          <Html position={[-2.2, -2.4, 8.8]} center distanceFactor={8.5}>
            <div className="px-2.5 py-1.5 rounded-xl bg-amber-950 text-amber-200 font-black text-[10px] tracking-wider border border-amber-600 shadow-md whitespace-nowrap pointer-events-none">
              ⚠️ Gorong-gorong Tersumbat Sampah (Air Membalik!)
            </div>
          </Html>

          {/* Label 3: Soil Saturated Infiltration */}
          <Html position={[4.5, -1.2, 8.8]} center distanceFactor={8.5}>
            <div className="px-3 py-1.5 rounded-xl bg-blue-950 text-blue-200 font-bold text-[10px] tracking-wider border border-blue-600 shadow-md whitespace-nowrap pointer-events-none">
              ⬇️ Kapasitas Infiltrasi Jenuh (Resapan 0%)
            </div>
          </Html>
        </group>
      )}
    </group>
  );
};
