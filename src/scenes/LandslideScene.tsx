import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { soundEngine } from '../audio/soundEngine';
import { 
  Mountain, 
  AlertTriangle, 
  CloudLightning, 
  Zap, 
  AlertOctagon, 
  Wind,
  ShieldCheck,
  Compass,
  ArrowRight
} from 'lucide-react';

export type LandslideStage = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// ─── ATMOSPHERIC FOG & SKY SETUP ───
const LandslideSceneSetup: React.FC<{ stage: LandslideStage }> = ({ stage }) => {
  const { scene } = useThree();

  useEffect(() => {
    const isRainy = stage >= 1 && stage <= 4;
    const isAfter = stage >= 5;

    const skyColor = isRainy
      ? new THREE.Color('#475569') // Daytime overcast slate sky
      : isAfter
      ? new THREE.Color('#64748b') // Post-storm sky
      : new THREE.Color('#38bdf8'); // Clear mountain blue sky

    scene.background = skyColor;
    scene.fog = isRainy
      ? new THREE.Fog('#475569', 35, 95)
      : isAfter
      ? new THREE.Fog('#64748b', 35, 95)
      : new THREE.Fog('#38bdf8', 35, 95);

    return () => {
      scene.background = null;
      scene.fog = null;
    };
  }, [scene, stage]);

  return null;
};

// ─── PURE ELEVATION CALCULATION FUNCTION ───
export function getTerrainHeight(x: number, z: number): number {
  if (x < -2.0) {
    // Mountain slope on LEFT: X from -11 (peak) to -2 (toe)
    const t = THREE.MathUtils.clamp((-2.0 - x) / 9.0, 0, 1);
    const sH = Math.sin(t * Math.PI * 0.5);
    return sH * (4.8 + Math.cos(z * 0.5) * 0.5) + Math.sin(x * 0.8 + z * 0.6) * 0.15;
  } else if (x >= -2.0 && x <= 2.5) {
    // Center Valley Roadway & Toe area
    return 0.05 + Math.sin(x * 0.4 + z * 0.5) * 0.02;
  } else {
    // Safe Highland & Evacuation Terrace on RIGHT: X from 2.5 to 11
    const tRight = THREE.MathUtils.clamp((x - 2.5) / 8.5, 0, 1);
    return 0.05 + Math.sin(tRight * Math.PI * 0.5) * 0.95 + Math.sin(x * 0.5 + z * 0.4) * 0.08;
  }
}

// ─── SOLID 3D WATERTIGHT DIORAMA GENERATOR ───
function createSolidDioramaGeometry(
  width = 22,
  depth = 14,
  baseY = -3.6,
  nx = 46,
  nz = 32,
  heightFn: (x: number, z: number) => number = getTerrainHeight
) {
  const geo = new THREE.BufferGeometry();
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const cMountainLush  = new THREE.Color('#15803d');
  const cHighRidge     = new THREE.Color('#14532d');
  const cRockyCliff    = new THREE.Color('#57534e');
  const cClaySoil      = new THREE.Color('#78350f');
  const cValleyLawn    = new THREE.Color('#16a34a');
  const cDeepBedrock   = new THREE.Color('#1e293b');

  // 1. TOP SURFACE VERTICES
  for (let j = 0; j < nz; j++) {
    const z = -depth / 2 + (j / (nz - 1)) * depth;
    for (let i = 0; i < nx; i++) {
      const x = -width / 2 + (i / (nx - 1)) * width;
      const y = heightFn(x, z);
      positions.push(x, y, z);

      let col = cValleyLawn;
      if (x < -2.0) {
        if (y > 3.6) col = Math.sin(z * 1.5) > 0.2 ? cRockyCliff : cHighRidge;
        else if (y > 1.8) col = cMountainLush;
        else col = Math.sin(x * 2.0 + z) > 0.3 ? cClaySoil : cMountainLush;
      } else if (x > 2.5) {
        col = cMountainLush;
      }
      colors.push(col.r, col.g, col.b);
    }
  }

  // 2. BOTTOM SURFACE VERTICES
  const bottomOffset = nx * nz;
  for (let j = 0; j < nz; j++) {
    const z = -depth / 2 + (j / (nz - 1)) * depth;
    for (let i = 0; i < nx; i++) {
      const x = -width / 2 + (i / (nx - 1)) * width;
      positions.push(x, baseY, z);
      colors.push(cDeepBedrock.r, cDeepBedrock.g, cDeepBedrock.b);
    }
  }

  const topIdx = (i: number, j: number) => j * nx + i;
  const btmIdx = (i: number, j: number) => bottomOffset + j * nx + i;

  // 3. TOP SURFACE TRIANGLES
  for (let j = 0; j < nz - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const a = topIdx(i, j);
      const b = topIdx(i + 1, j);
      const c = topIdx(i, j + 1);
      const d = topIdx(i + 1, j + 1);
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  // 4. BOTTOM SURFACE TRIANGLES
  for (let j = 0; j < nz - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const a = btmIdx(i, j);
      const b = btmIdx(i + 1, j);
      const c = btmIdx(i, j + 1);
      const d = btmIdx(i + 1, j + 1);
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  // 5. SIDE WALLS:
  // South / Front (+Z)
  for (let i = 0; i < nx - 1; i++) {
    const t1 = topIdx(i, nz - 1);
    const t2 = topIdx(i + 1, nz - 1);
    const b1 = btmIdx(i, nz - 1);
    const b2 = btmIdx(i + 1, nz - 1);
    indices.push(t1, b1, t2);
    indices.push(t2, b1, b2);
  }

  // North / Back (-Z)
  for (let i = 0; i < nx - 1; i++) {
    const t1 = topIdx(i, 0);
    const t2 = topIdx(i + 1, 0);
    const b1 = btmIdx(i, 0);
    const b2 = btmIdx(i + 1, 0);
    indices.push(t1, t2, b1);
    indices.push(t2, b2, b1);
  }

  // West / Left (-X)
  for (let j = 0; j < nz - 1; j++) {
    const t1 = topIdx(0, j);
    const t2 = topIdx(0, j + 1);
    const b1 = btmIdx(0, j);
    const b2 = btmIdx(0, j + 1);
    indices.push(t1, b1, t2);
    indices.push(t2, b1, b2);
  }

  // East / Right (+X)
  for (let j = 0; j < nz - 1; j++) {
    const t1 = topIdx(nx - 1, j);
    const t2 = topIdx(nx - 1, j + 1);
    const b1 = btmIdx(nx - 1, j);
    const b2 = btmIdx(nx - 1, j + 1);
    indices.push(t1, t2, b1);
    indices.push(t2, b2, b1);
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  return geo;
}

// ─── REALISTIC TROPICAL PINE TREE ───
const PineTree: React.FC<{
  position: [number, number, number];
  scale?: number;
  tiltZ?: number;
  tiltX?: number;
}> = ({ position, scale = 1, tiltZ = 0, tiltX = 0 }) => (
  <group position={position} scale={[scale, scale, scale]} rotation={[tiltX, 0, tiltZ]}>
    <mesh position={[0, 0.5, 0]} castShadow>
      <cylinderGeometry args={[0.07, 0.12, 1.0, 7]} />
      <meshStandardMaterial color="#451a03" roughness={0.9} />
    </mesh>
    <mesh position={[0, 1.1, 0]} castShadow>
      <coneGeometry args={[0.8, 1.2, 7]} />
      <meshStandardMaterial color="#14532d" roughness={0.7} />
    </mesh>
    <mesh position={[0, 1.8, 0]} castShadow>
      <coneGeometry args={[0.6, 1.1, 7]} />
      <meshStandardMaterial color="#15803d" roughness={0.7} />
    </mesh>
    <mesh position={[0, 2.45, 0]} castShadow>
      <coneGeometry args={[0.4, 0.9, 7]} />
      <meshStandardMaterial color="#16a34a" roughness={0.65} />
    </mesh>
  </group>
);

// ─── SHADE TREE ───
const ShadeTree: React.FC<{
  position: [number, number, number];
  scale?: number;
  tiltZ?: number;
}> = ({ position, scale = 1, tiltZ = 0 }) => (
  <group position={position} scale={[scale, scale, scale]} rotation={[0, 0, tiltZ]}>
    <mesh position={[0, 0.6, 0]} castShadow>
      <cylinderGeometry args={[0.1, 0.16, 1.2, 8]} />
      <meshStandardMaterial color="#3e2723" roughness={0.9} />
    </mesh>
    <mesh position={[0, 1.6, 0]} castShadow>
      <sphereGeometry args={[0.8, 8, 8]} />
      <meshStandardMaterial color="#15803d" roughness={0.7} />
    </mesh>
    <mesh position={[-0.2, 1.85, 0.15]} castShadow>
      <sphereGeometry args={[0.55, 6, 6]} />
      <meshStandardMaterial color="#166534" roughness={0.7} />
    </mesh>
    <mesh position={[0.2, 1.8, -0.15]} castShadow>
      <sphereGeometry args={[0.6, 6, 6]} />
      <meshStandardMaterial color="#14532d" roughness={0.7} />
    </mesh>
  </group>
);

// ─── TEA BUSH ───
const TeaBush: React.FC<{ position: [number, number, number]; scale?: number }> = ({ 
  position, 
  scale = 1 
}) => (
  <mesh position={position} scale={[scale, scale * 0.7, scale]} castShadow>
    <sphereGeometry args={[0.35, 6, 6]} />
    <meshStandardMaterial color="#166534" roughness={0.8} />
  </mesh>
);

// ─── RESIDENTIAL MOUNTAIN VILLA ───
const MountainHouse: React.FC<{
  position: [number, number, number];
  rotationY?: number;
  scale?: number;
  wallColor?: string;
  roofColor?: string;
}> = ({ position, rotationY = 0, scale = 1, wallColor = '#f8fafc', roofColor = '#ea580c' }) => (
  <group position={position} rotation={[0, rotationY, 0]} scale={[scale, scale, scale]}>
    <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
      <boxGeometry args={[2.4, 0.3, 2.0]} />
      <meshStandardMaterial color="#475569" roughness={0.8} />
    </mesh>
    <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
      <boxGeometry args={[2.2, 1.4, 1.8]} />
      <meshStandardMaterial color={wallColor} roughness={0.5} />
    </mesh>
    <mesh position={[0.3, 0.75, 0.91]}>
      <boxGeometry args={[0.45, 1.0, 0.04]} />
      <meshStandardMaterial color="#78350f" roughness={0.6} />
    </mesh>
    <mesh position={[-0.45, 0.95, 0.91]}>
      <boxGeometry args={[0.55, 0.55, 0.04]} />
      <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.8} />
    </mesh>
    <mesh position={[0, 2.0, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <coneGeometry args={[1.8, 1.0, 4]} />
      <meshStandardMaterial color={roofColor} roughness={0.5} />
    </mesh>
  </group>
);

// ─── ROLLING DARK THUNDERSTORM CLOUDS ───
const StormClouds: React.FC<{ isRain: boolean }> = ({ isRain }) => {
  if (!isRain) return null;
  return (
    <group position={[0, 9.8, 0]}>
      {[
        [-8.5, 0.4, -2.5, 3.8],
        [-5.2, 0.9, 2.8, 4.2],
        [-2.0, 0.2, -1.2, 4.0],
        [1.8, 0.6, 2.2, 3.6],
        [5.5, 0.3, -2.8, 3.8],
        [-6.8, 1.1, 0.5, 4.5],
        [0.0, 1.0, 0.0, 4.8],
        [7.5, 0.5, 1.8, 3.6]
      ].map(([cx, cy, cz, cScale], i) => (
        <group key={`cloud-${i}`} position={[cx, cy, cz]} scale={[cScale, cScale * 0.42, cScale]}>
          <mesh>
            <dodecahedronGeometry args={[1.0, 1]} />
            <meshStandardMaterial color="#475569" roughness={0.9} />
          </mesh>
          <mesh position={[0.45, 0.15, 0.35]} scale={0.75}>
            <dodecahedronGeometry args={[1.0, 1]} />
            <meshStandardMaterial color="#64748b" roughness={0.9} />
          </mesh>
          <mesh position={[-0.45, 0.1, -0.35]} scale={0.8}>
            <dodecahedronGeometry args={[1.0, 1]} />
            <meshStandardMaterial color="#334155" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ─── REALISTIC BPBD / BNPB DISASTER RELIEF TENT (SEAMLESS GABLE FRAME) ───
const DisasterShelterTent: React.FC<{ position: [number, number, number]; rotationY?: number }> = ({ 
  position, 
  rotationY = 0 
}) => {
  const tentGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-1.3, 0);
    shape.lineTo(-1.3, 0.85);
    shape.lineTo(0, 1.85);
    shape.lineTo(1.3, 0.85);
    shape.lineTo(1.3, 0);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 2.8, bevelEnabled: false });
    geo.center();
    return geo;
  }, []);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Ground Mat Tarpaulin */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[3.0, 0.04, 3.2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      {/* Unified Seamless Gable Tent Body */}
      <mesh geometry={tentGeometry} position={[0, 0.92, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#ea580c" roughness={0.5} />
      </mesh>

      {/* Front Entrance Opening (Dark Interior) */}
      <mesh position={[0, 0.55, 1.41]}>
        <boxGeometry args={[0.95, 0.9, 0.02]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>

      {/* BPBD Emergency Sign on Front Gabel */}
      <mesh position={[0, 1.32, 1.42]}>
        <boxGeometry args={[1.2, 0.28, 0.02]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} />
      </mesh>
    </group>
  );
};

// ─── REALISTIC RESCUE AMBULANCE ───
const RescueAmbulance: React.FC<{ 
  position: [number, number, number]; 
  rotationY?: number; 
  strobe?: boolean 
}> = ({ position, rotationY = 0, strobe = false }) => (
  <group position={position} rotation={[0, rotationY, 0]}>
    {/* Main Van Body */}
    <mesh position={[0, 0.48, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.25, 0.65, 2.4]} />
      <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.2} />
    </mesh>
    {/* Front Cabin */}
    <mesh position={[0, 0.78, 0.55]} castShadow>
      <boxGeometry args={[1.2, 0.58, 1.05]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.3} />
    </mesh>
    {/* Windshield */}
    <mesh position={[0, 0.8, 1.08]} rotation={[-0.35, 0, 0]}>
      <boxGeometry args={[1.05, 0.4, 0.04]} />
      <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.1} />
    </mesh>
    {/* Orange/Red Stripe */}
    <mesh position={[0, 0.48, 0]}>
      <boxGeometry args={[1.27, 0.16, 2.35]} />
      <meshStandardMaterial color="#ea580c" roughness={0.4} />
    </mesh>
    {/* Wheels */}
    {[[-0.64, 0.2, 0.7], [0.64, 0.2, 0.7], [-0.64, 0.2, -0.7], [0.64, 0.2, -0.7]].map((wPos, i) => (
      <group key={`wheel-${i}`} position={wPos as any}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.12, 10]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
      </group>
    ))}
    {/* LED Lightbar on Cabin Roof */}
    <mesh position={[0, 1.12, 0.5]}>
      <boxGeometry args={[0.55, 0.08, 0.15]} />
      <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={strobe ? 4.5 : 0.6} />
    </mesh>
    {strobe && (
      <pointLight position={[0, 1.35, 0.5]} color="#ef4444" intensity={4.5} distance={10} />
    )}
  </group>
);

// ─── DETAILED 3D HUMAN FIGURE ───
const CharacterModel: React.FC<{
  position: [number, number, number];
  rotationY?: number;
  shirtColor?: string;
  isVolunteer?: boolean;
}> = ({ position, rotationY = 0, shirtColor = '#38bdf8', isVolunteer = false }) => (
  <group position={position} rotation={[0, rotationY, 0]}>
    {/* Head */}
    <mesh position={[0, 0.68, 0]} castShadow>
      <sphereGeometry args={[0.09, 8, 8]} />
      <meshStandardMaterial color="#fed7aa" roughness={0.6} />
    </mesh>
    {/* Volunteer Helmet */}
    {isVolunteer && (
      <mesh position={[0, 0.74, 0]}>
        <sphereGeometry args={[0.095, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#ea580c" roughness={0.3} />
      </mesh>
    )}
    {/* Torso */}
    <mesh position={[0, 0.42, 0]} castShadow>
      <boxGeometry args={[0.22, 0.32, 0.14]} />
      <meshStandardMaterial color={isVolunteer ? '#ea580c' : shirtColor} roughness={0.6} />
    </mesh>
    {/* High-Vis Vest Stripe */}
    {isVolunteer && (
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.23, 0.08, 0.15]} />
        <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={1.2} />
      </mesh>
    )}
    {/* Arms */}
    <mesh position={[-0.14, 0.4, 0]} castShadow>
      <boxGeometry args={[0.06, 0.26, 0.07]} />
      <meshStandardMaterial color={isVolunteer ? '#ea580c' : shirtColor} />
    </mesh>
    <mesh position={[0.14, 0.4, 0]} castShadow>
      <boxGeometry args={[0.06, 0.26, 0.07]} />
      <meshStandardMaterial color={isVolunteer ? '#ea580c' : shirtColor} />
    </mesh>
    {/* Legs */}
    <mesh position={[-0.06, 0.14, 0]} castShadow>
      <boxGeometry args={[0.07, 0.28, 0.09]} />
      <meshStandardMaterial color="#1e293b" />
    </mesh>
    <mesh position={[0.06, 0.14, 0]} castShadow>
      <boxGeometry args={[0.07, 0.28, 0.09]} />
      <meshStandardMaterial color="#1e293b" />
    </mesh>
  </group>
);

// ─── PROPS INTERFACE ───
interface LandslideSceneProps {
  isSimulating?: boolean;
  landslideStage?: LandslideStage;
  onActionClick?: (actionId: string) => void;
  showCutaway?: boolean;
}

export const LandslideScene: React.FC<LandslideSceneProps> = ({
  isSimulating = true,
  landslideStage = 0,
  onActionClick,
  showCutaway: externalCutaway
}) => {
  // ─── REFS ───
  const dioramaGroupRef     = useRef<THREE.Group>(null);
  const rainRef             = useRef<THREE.InstancedMesh>(null);
  const dustRef             = useRef<THREE.InstancedMesh>(null);
  const tumblingRocksRef    = useRef<THREE.InstancedMesh>(null);
  const debrisLobeRef       = useRef<THREE.Group>(null);
  const lightningLightRef   = useRef<THREE.PointLight>(null);
  const sirenLightRef       = useRef<THREE.PointLight>(null);

  // Cutaway View Mode
  const [internalShowCutaway] = useState(true);
  const showCutaway = externalCutaway !== undefined ? externalCutaway : internalShowCutaway;

  // ─── STAGE VARIABLES ───
  const isNormal      = landslideStage === 0;
  const isRain        = landslideStage >= 1 && landslideStage <= 4;
  const isSaturated   = landslideStage >= 2;
  const isCracking    = landslideStage >= 3;
  const isFailure     = landslideStage === 4;
  const isMitigation  = landslideStage === 5;
  const isAftermath   = landslideStage === 6;

  // ─── SOLID 3D VOLUMETRIC MOUNTAIN & VALLEY DIORAMA GEOMETRY ───
  const solidDioramaGeometry = useMemo(() => {
    return createSolidDioramaGeometry(22, 14, -3.8, 48, 32, getTerrainHeight);
  }, []);

  // ─── PARTICLES SETUP (Rain & Dust Mist) ───
  const rainCount = 450;
  const dustCount = 30;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const rainData = useMemo(() => {
    return Array.from({ length: rainCount }).map(() => ({
      x: (Math.random() - 0.5) * 26.0,
      y: Math.random() * 11.0 + 1.0,
      z: (Math.random() - 0.5) * 18.0,
      speed: Math.random() * 0.35 + 0.25
    }));
  }, [rainCount]);

  const dustData = useMemo(() => {
    return Array.from({ length: dustCount }).map(() => ({
      startX: -7.0 + Math.random() * 3.5,
      endX: -1.0 + Math.random() * 2.0,
      startZ: (Math.random() - 0.5) * 6.0,
      speed: 0.35 + Math.random() * 0.35,
      maxScale: 0.6 + Math.random() * 0.6,
      progress: Math.random()
    }));
  }, [dustCount]);

  // ─── ACTIVE ROCK AVALANCHE & TUMBLING BOULDERS SETUP ───
  const rockCount = 28;
  const tumblingRocksData = useMemo(() => {
    return Array.from({ length: rockCount }).map((_, i) => ({
      speed: 0.28 + Math.random() * 0.22,
      offset: i / rockCount,
      z: (Math.random() - 0.5) * 5.6,
      drift: (Math.random() - 0.5) * 1.6,
      scale: 0.28 + Math.random() * 0.42,
      bounceFreq: 6 + Math.floor(Math.random() * 6),
      bounceH: 0.25 + Math.random() * 0.35,
      rotSpeedX: (Math.random() - 0.5) * 16.0,
      rotSpeedY: (Math.random() - 0.5) * 14.0,
      rotSpeedZ: (Math.random() - 0.5) * 18.0,
      progress: 0,
      restX: -2.0 + Math.random() * 3.2,
      restY: 0.12 + Math.random() * 0.25,
      restZ: (Math.random() - 0.5) * 5.2,
      restRotX: Math.random() * Math.PI,
      restRotZ: Math.random() * Math.PI
    }));
  }, [rockCount]);

  // ─── 100% REALISTIC SOLID 3D LANDSLIDE VOLUMETRIC AVALANCHE & DEBRIS FAN ───
  const solidLandslideGeometry = useMemo(() => {
    const widthSegments = 32;
    const depthSegments = 26;
    const xMin = -3.8;
    const xMax = 1.5;
    const zMin = -3.8;
    const zMax = 3.8;

    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    const colDeepMud = new THREE.Color('#2b1406');
    const colWetClay = new THREE.Color('#4d2a10');
    const colEarthyTop = new THREE.Color('#613715');

    // Volumetric 3D height distribution hugging mountain slope & road surface
    const getElevation = (x: number, z: number) => {
      const normZ = THREE.MathUtils.clamp(Math.abs(z) / 3.6, 0, 1);
      const lateralFalloff = Math.cos(normZ * Math.PI * 0.5);
      if (lateralFalloff <= 0) return 0.02;

      let profileY = 0.02;
      if (x < -2.4) {
        // Upper slope section (connecting from mountain slope)
        const t = (x - xMin) / (-2.4 - xMin);
        profileY = THREE.MathUtils.lerp(1.75, 1.05, t);
      } else if (x >= -2.4 && x < -0.8) {
        // Crest overflowing retaining wall and roadside ditch
        const t = (x - (-2.4)) / 1.6;
        profileY = THREE.MathUtils.lerp(1.05, 0.55, t) + Math.sin(t * Math.PI) * 0.25;
      } else {
        // Debris apron spreading across asphalt road
        const t = (x - (-0.8)) / (xMax - (-0.8));
        profileY = 0.55 * Math.pow(Math.max(0, 1 - t), 1.6);
      }

      const soilWaves = Math.sin(x * 3.8 + z * 1.5) * 0.09 + Math.cos(x * 6.2 - z * 2.8) * 0.04;
      return Math.max(0.02, (profileY + soilWaves) * Math.sqrt(lateralFalloff));
    };

    const grid: number[][] = [];
    let vertCount = 0;

    for (let j = 0; j <= depthSegments; j++) {
      const z = THREE.MathUtils.lerp(zMin, zMax, j / depthSegments);
      grid[j] = [];
      for (let i = 0; i <= widthSegments; i++) {
        const x = THREE.MathUtils.lerp(xMin, xMax, i / widthSegments);
        const y = getElevation(x, z);

        positions.push(x, y, z);
        grid[j][i] = vertCount++;

        const mixed = colDeepMud.clone().lerp(colWetClay, Math.min(1, y / 0.8)).lerp(colEarthyTop, Math.min(1, Math.max(0, (y - 0.4) / 0.9)));
        colors.push(mixed.r, mixed.g, mixed.b);
      }
    }

    // Top surface triangles
    for (let j = 0; j < depthSegments; j++) {
      for (let i = 0; i < widthSegments; i++) {
        const a = grid[j][i];
        const b = grid[j][i + 1];
        const c = grid[j + 1][i + 1];
        const d = grid[j + 1][i];

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    // 3D Solid Watertight Skirt drop-down to Y = 0.01 (sealed against ground)
    const rimIndices: number[] = [];
    for (let i = 0; i <= widthSegments; i++) rimIndices.push(grid[0][i]);
    for (let j = 1; j <= depthSegments; j++) rimIndices.push(grid[j][widthSegments]);
    for (let i = widthSegments - 1; i >= 0; i--) rimIndices.push(grid[depthSegments][i]);
    for (let j = depthSegments - 1; j >= 1; j--) rimIndices.push(grid[j][0]);

    const baseIndices: number[] = [];
    for (const topIdx of rimIndices) {
      const px = positions[topIdx * 3];
      const pz = positions[topIdx * 3 + 2];
      positions.push(px, 0.01, pz);
      colors.push(colDeepMud.r * 0.7, colDeepMud.g * 0.7, colDeepMud.b * 0.7);
      baseIndices.push(vertCount++);
    }

    for (let k = 0; k < rimIndices.length; k++) {
      const nextK = (k + 1) % rimIndices.length;
      const t1 = rimIndices[k];
      const t2 = rimIndices[nextK];
      const b1 = baseIndices[k];
      const b2 = baseIndices[nextK];

      indices.push(t1, b1, t2);
      indices.push(t2, b1, b2);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, []);

  // ─── INITIALIZE INSTANCED PARTICLES ───
  useEffect(() => {
    if (rainRef.current) {
      rainData.forEach((p, i) => {
        dummy.position.set(p.x, p.y, p.z);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        rainRef.current!.setMatrixAt(i, dummy.matrix);
      });
      rainRef.current.instanceMatrix.needsUpdate = true;
    }
    if (dustRef.current) {
      dustData.forEach((_, i) => {
        dummy.position.set(0, -10, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        dustRef.current!.setMatrixAt(i, dummy.matrix);
      });
      dustRef.current.instanceMatrix.needsUpdate = true;
    }
    if (tumblingRocksRef.current) {
      tumblingRocksData.forEach((_, i) => {
        dummy.position.set(0, -10, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        tumblingRocksRef.current!.setMatrixAt(i, dummy.matrix);
      });
      tumblingRocksRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [dummy, rainData, dustData, tumblingRocksData]);

  // ─── AUDIO ENGINE INTEGRATION ───
  useEffect(() => {
    if (isFailure) {
      soundEngine.playEarthquakeRumble(6);
    } else if (isCracking) {
      soundEngine.playEarthquakeRumble(2);
    }
  }, [landslideStage, isFailure, isCracking]);

  // ─── FRAME ANIMATION LOOP ───
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // 1. Rain Precipitation Animation (Stages 1-4)
    if (rainRef.current && isRain) {
      rainData.forEach((p, i) => {
        p.y -= p.speed * 2.2;
        p.x -= 0.06;
        if (p.y < -0.4) {
          p.y = 11.0;
          p.x = (Math.random() - 0.5) * 26.0;
          p.z = (Math.random() - 0.5) * 18.0;
        }
        dummy.position.set(p.x, p.y, p.z);
        dummy.scale.set(1.0, 1.0, 1.0);
        dummy.rotation.set(0.1, 0, 0.28);
        dummy.updateMatrix();
        rainRef.current!.setMatrixAt(i, dummy.matrix);
      });
      rainRef.current.instanceMatrix.needsUpdate = true;
    } else if (rainRef.current && !isRain) {
      rainData.forEach((p, i) => {
        dummy.position.set(p.x, p.y, p.z);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        rainRef.current!.setMatrixAt(i, dummy.matrix);
      });
      rainRef.current.instanceMatrix.needsUpdate = true;
    }

    // 2. Storm Lightning Flash in Rain stages
    if (lightningLightRef.current && isRain) {
      const isFlash = Math.random() < 0.03;
      lightningLightRef.current.intensity = isFlash ? 35.0 : 0;
    }

    // 3. Dynamic Sliding Landslide Debris Avalanche (Stage 4, 5, 6)
    if (debrisLobeRef.current) {
      if (isFailure) {
        debrisLobeRef.current.visible = true;
        // Continuous surging avalanching motion: pulsating forward wave
        const wave = Math.sin(t * 4.0);
        const waveX = -0.35 + wave * 0.25;
        const waveY = 0.08 + Math.cos(t * 4.0) * 0.05;
        debrisLobeRef.current.position.set(waveX, waveY, 0);
        debrisLobeRef.current.scale.set(1.0 + wave * 0.06, 1.0 + Math.sin(t * 7.0) * 0.05, 1.0);
      } else if (isMitigation || isAftermath) {
        debrisLobeRef.current.visible = true;
        debrisLobeRef.current.scale.set(1.0, 1.0, 1.0);
        debrisLobeRef.current.position.set(0, 0, 0);
      } else {
        debrisLobeRef.current.visible = false;
        debrisLobeRef.current.scale.set(0.001, 0.001, 0.001);
      }
    }

    // 4. Active Tumbling & Rolling Boulders Avalanche
    if (tumblingRocksRef.current) {
      if (isFailure) {
        tumblingRocksData.forEach((rock, i) => {
          rock.progress = (t * rock.speed + rock.offset) % 1.0;
          // Tumbling path from crown crack (-7.6) all the way down to road (0.8)
          const px = THREE.MathUtils.lerp(-7.6, 0.8, rock.progress);
          const pz = rock.z + Math.sin(rock.progress * Math.PI) * rock.drift;
          const terrY = getTerrainHeight(px, pz);
          
          // Realistic surface tumbling with bounce:
          const slopeIntensity = Math.max(0, (-px) / 7.6);
          const bounce = Math.abs(Math.sin(rock.progress * Math.PI * rock.bounceFreq)) * rock.bounceH * (0.3 + slopeIntensity * 0.7);
          const py = terrY + rock.scale * 0.45 + bounce;

          dummy.position.set(px, py, pz);
          dummy.scale.set(rock.scale, rock.scale, rock.scale);
          dummy.rotation.set(t * rock.rotSpeedX, t * rock.rotSpeedY, t * rock.rotSpeedZ);
          dummy.updateMatrix();
          tumblingRocksRef.current!.setMatrixAt(i, dummy.matrix);
        });
        tumblingRocksRef.current.instanceMatrix.needsUpdate = true;
      } else if (isMitigation || isAftermath) {
        tumblingRocksData.forEach((rock, i) => {
          const terrY = getTerrainHeight(rock.restX, rock.restZ);
          dummy.position.set(rock.restX, terrY + rock.scale * 0.4, rock.restZ);
          dummy.scale.set(rock.scale, rock.scale, rock.scale);
          dummy.rotation.set(rock.restRotX, 0, rock.restRotZ);
          dummy.updateMatrix();
          tumblingRocksRef.current!.setMatrixAt(i, dummy.matrix);
        });
        tumblingRocksRef.current.instanceMatrix.needsUpdate = true;
      } else {
        tumblingRocksData.forEach((_, i) => {
          dummy.position.set(0, -10, 0);
          dummy.scale.set(0, 0, 0);
          dummy.updateMatrix();
          tumblingRocksRef.current!.setMatrixAt(i, dummy.matrix);
        });
        tumblingRocksRef.current.instanceMatrix.needsUpdate = true;
      }
    }

    // 5. Low-Altitude Ground-Hugging Dust & Soil Vapor during Failure
    if (dustRef.current && isFailure) {
      dustData.forEach((d, i) => {
        d.progress = (d.progress + delta * d.speed) % 1.0;
        const dx = THREE.MathUtils.lerp(d.startX, d.endX, d.progress);
        const dz = d.startZ + Math.sin(d.progress * Math.PI) * 0.8;
        const terrY = getTerrainHeight(dx, dz);
        const dy = terrY + 0.25 + d.progress * 0.6; // stays closely above ground
        const curScale = Math.sin(d.progress * Math.PI) * d.maxScale;

        dummy.position.set(dx, dy, dz);
        dummy.scale.set(curScale, curScale * 0.6, curScale);
        dummy.rotation.set(0, t * 0.4 + i, 0);
        dummy.updateMatrix();
        dustRef.current!.setMatrixAt(i, dummy.matrix);
      });
      dustRef.current.instanceMatrix.needsUpdate = true;
    } else if (dustRef.current && !isFailure) {
      dustData.forEach((d, i) => {
        dummy.position.set(0, -10, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        dustRef.current!.setMatrixAt(i, dummy.matrix);
      });
      dustRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <LandslideSceneSetup stage={landslideStage} />

      {/* ─── SCENE LIGHTING ─── */}
      <ambientLight intensity={isRain ? 1.05 : 1.35} color={isRain ? '#e2e8f0' : '#f8fafc'} />
      <hemisphereLight args={['#ffffff', '#475569', isRain ? 0.95 : 1.2]} />
      <directionalLight 
        position={[14, 22, 12]} 
        intensity={isRain ? 1.85 : 2.5} 
        color={isRain ? '#f8fafc' : '#ffffff'} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-12, 10, -8]} intensity={isRain ? 0.8 : 0.9} color="#93c5fd" />
      <pointLight ref={lightningLightRef} position={[0, 15, 0]} color="#f0fdf4" intensity={0} distance={60} />
      <pointLight ref={sirenLightRef} position={[7.5, 2.2, 0]} color="#ef4444" distance={15} intensity={isFailure || isMitigation ? 4.0 : 0} />

      {/* ─── STORM CLOUDS CANOPY ─── */}
      <StormClouds isRain={isRain} />

      {/* ─── MAIN DIORAMA GROUP ─── */}
      <group ref={dioramaGroupRef} position={[0, -0.4, 0]}>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 1. 100% SOLID WATERTIGHT 3D MOUNTAIN DIORAMA BLOCK                 */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <mesh geometry={solidDioramaGeometry} receiveShadow castShadow>
          <meshStandardMaterial 
            vertexColors 
            roughness={isRain ? 0.35 : 0.85} 
            metalness={isRain ? 0.15 : 0.0} 
          />
        </mesh>

        {/* Solid Foundation Pedestal Base Rim */}
        <mesh position={[0, -3.9, 0]}>
          <boxGeometry args={[22.4, 0.4, 14.4]} />
          <meshStandardMaterial color="#090d16" roughness={0.7} metalness={0.2} />
        </mesh>

        {/* ─── FRONT CUTAWAY GEOLOGICAL SECTION (Visible on front Z = 7.02) ─── */}
        {showCutaway && (
          <group position={[0, 0, 7.02]}>
            {/* ── CURVED SLIP SURFACE (BIDANG GELINCIR) UNDER MOUNTAIN ── */}
            <group position={[-5.5, -0.4, 0.03]} rotation={[0, 0, -0.45]}>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.16, 6.5, 0.06]} />
                <meshStandardMaterial 
                  color={isSaturated ? "#38bdf8" : isCracking ? "#f59e0b" : isFailure ? "#ef4444" : "#e2e8f0"} 
                  emissive={isSaturated ? "#0284c7" : isCracking ? "#f59e0b" : isFailure ? "#ef4444" : "#f59e0b"}
                  emissiveIntensity={isFailure ? 5.0 : isCracking ? 3.2 : isSaturated ? 2.0 : 0.8}
                />
              </mesh>

              {/* Pore Water Pressure Indicator Vectors (Stage 2 & 3) */}
              {isSaturated && (
                <group position={[0, 0.3, 0.03]}>
                  {[-2.0, -0.5, 1.0, 2.2].map((px, i) => (
                    <group key={`pore-arrow-${i}`} position={[px, 0, 0]}>
                      <mesh position={[0, 0.28, 0]}>
                        <coneGeometry args={[0.12, 0.28, 6]} />
                        <meshBasicMaterial color="#38bdf8" />
                      </mesh>
                      <mesh position={[0, 0, 0]}>
                        <cylinderGeometry args={[0.04, 0.04, 0.32, 6]} />
                        <meshBasicMaterial color="#0284c7" />
                      </mesh>
                    </group>
                  ))}
                </group>
              )}
            </group>
          </group>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 2. DYNAMIC LANDSLIDE DEBRIS AVALANCHE & MUDFLOW LOBE                */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <group ref={debrisLobeRef} position={[0, 0, 0]} visible={false}>
          {/* 1. Main Solid Watertight Volumetric Landslide Mud & Debris Deposit */}
          <mesh geometry={solidLandslideGeometry} castShadow receiveShadow>
            <meshStandardMaterial 
              vertexColors 
              roughness={0.86} 
              metalness={0.08} 
            />
          </mesh>

          {/* 2. Natural Jagged Boulders Embedded into Soil Mass */}
          {[
            [-2.8, 1.35, 0.5, 0.8, 0.4, -0.6, '#475569'],
            [-2.1, 1.12, -1.3, 0.95, -0.5, 0.8, '#334155'],
            [-1.5, 0.92, 1.2, 0.85, 0.2, 1.2, '#475569'],
            [-0.7, 0.65, -0.7, 0.75, 0.8, -0.3, '#64748b'],
            [0.1, 0.42, 0.8, 0.9, -0.3, 0.4, '#334155'],
            [0.7, 0.26, -0.4, 0.65, 0.6, 0.2, '#64748b'],
            [1.1, 0.14, 0.3, 0.55, -0.7, 0.5, '#475569'],
            [-1.8, 0.88, 1.9, 0.7, 0.3, -0.9, '#334155']
          ].map(([bx, by, bz, bScale, rX, rZ, color], i) => (
            <mesh 
              key={`boulder-${i}`} 
              position={[bx as number, by as number, bz as number]} 
              rotation={[rX as number, (i * 0.85), rZ as number]}
              scale={[bScale as number, (bScale as number) * 0.85, bScale as number]} 
              castShadow
            >
              <dodecahedronGeometry args={[0.55, 0]} />
              <meshStandardMaterial color={color as string} roughness={0.88} />
            </mesh>
          ))}

          {/* 4. Fallen Pine Trees Laying Flat on the Mud Mass */}
          {[
            [-2.3, 1.22, 0.8, 0.1, 0.6, -0.38, 2.6],
            [-1.1, 0.72, -1.2, -0.15, -0.7, -0.32, 2.8],
            [0.1, 0.38, 0.6, 0.05, 0.9, -0.22, 2.4],
            [-0.5, 0.55, -0.2, -0.12, 1.3, -0.28, 2.5]
          ].map(([tx, ty, tz, rotX, rotY, rotZ, length], i) => (
            <group key={`log-${i}`} position={[tx as number, ty as number, tz as number]} rotation={[rotX as number, rotY as number, rotZ as number]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.11, 0.15, length as number, 6]} />
                <meshStandardMaterial color="#2d1708" roughness={0.95} />
              </mesh>
              {/* Broken root stump flare */}
              <mesh position={[0, -(length as number) * 0.48, 0]}>
                <dodecahedronGeometry args={[0.22, 0]} />
                <meshStandardMaterial color="#1e0f05" roughness={0.9} />
              </mesh>
            </group>
          ))}

          {/* 5. Mud Splatter & Loose Gravel Fringe at Front Tongue on Road */}
          {[
            [1.2, 0.08, -1.2, 0.22],
            [1.4, 0.06, -0.4, 0.25],
            [1.5, 0.05, 0.3, 0.24],
            [1.3, 0.07, 1.1, 0.26],
            [0.9, 0.09, 1.8, 0.2],
            [-1.4, 0.12, 2.2, 0.24],
            [-2.0, 0.1, -2.0, 0.22]
          ].map(([gx, gy, gz, gRad], i) => (
            <mesh key={`gravel-${i}`} position={[gx, gy, gz]} castShadow>
              <dodecahedronGeometry args={[gRad, 0]} />
              <meshStandardMaterial color="#4a2e16" roughness={0.95} />
            </mesh>
          ))}
        </group>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 4. NATURAL MOUNTAIN VEGETATION (PINE TREES & TEA PLANTATION)        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <group>
          {/* Stable Mountain Peak Trees (Firmly rooted on top ridge) */}
          <PineTree position={[-9.8, getTerrainHeight(-9.8, -4.5) - 0.08, -4.5]} scale={1.3} />
          <PineTree position={[-9.2, getTerrainHeight(-9.2, -1.8) - 0.08, -1.8]} scale={1.4} />
          <PineTree position={[-9.6, getTerrainHeight(-9.6, 2.2) - 0.08, 2.2]} scale={1.3} />
          <PineTree position={[-8.8, getTerrainHeight(-8.8, 4.8) - 0.08, 4.8]} scale={1.2} />

          {/* Mid-Slope Trees (Firmly rooted on hillside, tilting locally without floating) */}
          <PineTree 
            position={[-7.2, getTerrainHeight(-7.2, -3.2) - 0.08, -3.2]} 
            scale={1.25} 
            tiltZ={isFailure || isMitigation || isAftermath ? -0.85 : isCracking ? -0.4 : 0} 
            tiltX={isFailure || isMitigation || isAftermath ? 0.3 : isCracking ? 0.15 : 0} 
          />
          <PineTree 
            position={[-6.5, getTerrainHeight(-6.5, 0.5) - 0.08, 0.5]} 
            scale={1.3} 
            tiltZ={isFailure || isMitigation || isAftermath ? -0.92 : isCracking ? -0.45 : 0} 
            tiltX={isFailure || isMitigation || isAftermath ? -0.25 : isCracking ? -0.12 : 0} 
          />
          <PineTree 
            position={[-5.8, getTerrainHeight(-5.8, 3.2) - 0.08, 3.2]} 
            scale={1.2} 
            tiltZ={isFailure || isMitigation || isAftermath ? -0.8 : isCracking ? -0.35 : 0} 
            tiltX={isFailure || isMitigation || isAftermath ? 0.2 : isCracking ? 0.1 : 0}
          />
          <PineTree 
            position={[-4.5, getTerrainHeight(-4.5, -2.5) - 0.08, -2.5]} 
            scale={1.15} 
            tiltZ={isFailure || isMitigation || isAftermath ? -0.88 : isCracking ? -0.35 : 0} 
            tiltX={isFailure || isMitigation || isAftermath ? -0.2 : isCracking ? -0.1 : 0} 
          />
          <PineTree 
            position={[-3.8, getTerrainHeight(-3.8, 2.0) - 0.08, 2.0]} 
            scale={1.1} 
            tiltZ={isFailure || isMitigation || isAftermath ? -0.95 : isCracking ? -0.3 : 0} 
            tiltX={isFailure || isMitigation || isAftermath ? 0.25 : isCracking ? 0.1 : 0} 
          />

          {/* Tea Plantation Bushes on Slope Face */}
          {[-7, -6, -5, -4].map((tx) => (
            [-3, -1, 1, 3].map((tz) => {
              const px = tx + (Math.sin(tz) * 0.4);
              return (
                <TeaBush 
                  key={`tea-${tx}-${tz}`} 
                  position={[px, getTerrainHeight(px, tz) - 0.04, tz]} 
                  scale={0.9} 
                />
              );
            })
          ))}

          {/* Roadside Trees in Valley */}
          <ShadeTree position={[-1.2, getTerrainHeight(-1.2, -4.8) - 0.05, -4.8]} scale={1.1} />
          <ShadeTree position={[-1.0, getTerrainHeight(-1.0, 5.0) - 0.05, 5.0]} scale={1.2} />

          {/* Safe Hillside Trees on the Right */}
          <ShadeTree position={[5.2, getTerrainHeight(5.2, -4.2) - 0.05, -4.2]} scale={1.1} />
          <ShadeTree position={[8.5, getTerrainHeight(8.5, -3.8) - 0.05, -3.8]} scale={1.25} />
          <PineTree position={[9.2, getTerrainHeight(9.2, 3.5) - 0.05, 3.5]} scale={1.2} />
          <PineTree position={[7.8, getTerrainHeight(7.8, 4.8) - 0.05, 4.8]} scale={1.1} />
        </group>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 5. ENGINEERED SLOPE MITIGATION (AT TOE OF MOUNTAIN X = -2.4)        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <group position={[-2.4, 0, 0]}>
          <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.45, 1.0, 13.0]} />
            <meshStandardMaterial color="#64748b" roughness={0.7} />
          </mesh>
          {/* Drainage Weep Holes */}
          {[-5, -3, -1, 1, 3, 5].map((wz, i) => (
            <mesh key={`weep-${i}`} position={[0.23, 0.35, wz]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.04, 0.04, 0.1, 8]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
          ))}
          {/* Wire-Mesh Stone Gabions */}
          {[-4.5, -1.5, 1.5, 4.5].map((gz, i) => (
            <mesh key={`gabion-${i}`} position={[0.35, 0.25, gz]} castShadow>
              <boxGeometry args={[0.35, 0.45, 2.2]} />
              <meshStandardMaterial color="#475569" wireframe={isCracking || isFailure} />
            </mesh>
          ))}
        </group>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 6. CENTER VALLEY HIGHWAY & ROADSIDE RESIDENCES (X = -0.5 to 2.5)    */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <group position={[0.5, 0.06, 0]}>
          <mesh receiveShadow>
            <boxGeometry args={[3.2, 0.04, 14.0]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>
          {/* White Center Dashed Markings */}
          {[-5.5, -3.5, -1.5, 0.5, 2.5, 4.5].map((dz, i) => (
            <mesh key={`dash-${i}`} position={[0, 0.03, dz]}>
              <boxGeometry args={[0.15, 0.01, 1.3]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.3} />
            </mesh>
          ))}
          {/* Road Guardrails */}
          <mesh position={[-1.55, 0.35, 0]}>
            <boxGeometry args={[0.06, 0.12, 14.0]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.7} />
          </mesh>
          <mesh position={[1.55, 0.35, 0]}>
            <boxGeometry args={[0.06, 0.12, 14.0]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.7} />
          </mesh>
        </group>

        {/* Mountain Residential Houses on Valley Roadside */}
        <MountainHouse 
          position={[3.0, 0.05, -3.8]} 
          rotationY={-Math.PI / 2} 
          scale={1.05} 
          wallColor="#f1f5f9" 
          roofColor="#ea580c" 
        />
        <MountainHouse 
          position={[3.2, 0.05, 3.8]} 
          rotationY={-Math.PI / 2} 
          scale={1.0} 
          wallColor="#fef08a" 
          roofColor="#c2410c" 
        />

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 7. SAFE EVACUATION ZONE & ASSEMBLY POINT (HIGHLAND ON RIGHT)        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <group position={[7.5, 0.6, 0]}>
          {/* Green Assembly Lawn */}
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[2.5, 32]} />
            <meshStandardMaterial color="#15803d" roughness={0.8} />
          </mesh>
          {/* White Assembly Ring */}
          <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.8, 2.05, 32]} />
            <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
          </mesh>

          {/* Assembly Signpost */}
          <group position={[-1.5, 0, -1.2]}>
            <mesh position={[0, 0.8, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 1.6, 6]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
            <mesh position={[0, 1.6, 0]}>
              <boxGeometry args={[0.65, 0.65, 0.04]} />
              <meshStandardMaterial color="#16a34a" />
            </mesh>
          </group>

          {/* High-Quality Seamless Disaster Shelter Tent */}
          <DisasterShelterTent position={[-0.2, 0, -2.2]} rotationY={0} />

          {/* High-Quality Rescue Ambulance Vehicle */}
          <RescueAmbulance 
            position={[0.2, 0, 2.2]} 
            rotationY={-Math.PI / 2} 
            strobe={isFailure || isMitigation || isAftermath} 
          />

          {/* Detailed Evacuees & Responders */}
          <CharacterModel position={[-0.6, 0, 0.2]} rotationY={1.2} shirtColor="#38bdf8" />
          <CharacterModel position={[0.5, 0, 0.4]} rotationY={-1.5} shirtColor="#ec4899" />
          <CharacterModel position={[-0.2, 0, -0.6]} rotationY={0.8} shirtColor="#a855f7" />
          <CharacterModel position={[1.0, 0, -0.2]} rotationY={-1.2} isVolunteer={true} />
        </group>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 8. INSTANCED WEATHER & DUST PARTICLES                               */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <instancedMesh ref={rainRef} args={[undefined, undefined, rainCount]}>
          <cylinderGeometry args={[0.012, 0.012, 1.2, 4]} />
          <meshBasicMaterial color="#bae6fd" transparent opacity={0.4} />
        </instancedMesh>

        {/* Soft Ground-Hugging Dust Mist */}
        <instancedMesh ref={dustRef} args={[undefined, undefined, dustCount]}>
          <sphereGeometry args={[0.9, 7, 7]} />
          <meshStandardMaterial color="#cbd5e1" transparent opacity={0.16} depthWrite={false} roughness={1.0} />
        </instancedMesh>

        {/* Dynamic Rolling & Tumbling Rock Avalanche Boulders */}
        <instancedMesh ref={tumblingRocksRef} args={[undefined, undefined, rockCount]} castShadow receiveShadow>
          <dodecahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial color="#334155" roughness={0.9} metalness={0.1} />
        </instancedMesh>

      </group>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 9. 3D SCIENTIFIC HUD LABELS & INTERACTIVE ACTIONS                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showCutaway && (
        <group>
          {/* Label: Mahkota Retakan */}
          <Html position={[-7.8, 5.2, 0]} center distanceFactor={12}>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/80 text-amber-300 text-[11px] font-bold shadow-xl backdrop-blur-md whitespace-nowrap animate-pulse pointer-events-none">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Mahkota Retakan (Crown Tension Crack)</span>
            </div>
          </Html>

          {/* Label: Bidang Gelincir */}
          <Html position={[-5.5, 2.2, 0]} center distanceFactor={12}>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-rose-500/80 text-rose-300 text-[11px] font-bold shadow-xl backdrop-blur-md whitespace-nowrap pointer-events-none">
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>Bidang Gelincir (Slip Surface)</span>
            </div>
          </Html>

          {/* Label: Dinding Penahan */}
          <Html position={[-2.4, 1.4, 0]} center distanceFactor={12}>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/80 text-cyan-300 text-[11px] font-bold shadow-xl backdrop-blur-md whitespace-nowrap pointer-events-none">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dinding Penahan & Bronjong</span>
            </div>
          </Html>

          {/* Label: Titik Kumpul Aman */}
          <Html position={[7.5, 3.2, 0]} center distanceFactor={12}>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-emerald-500 text-emerald-200 text-[11px] font-bold shadow-md whitespace-nowrap pointer-events-none">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Titik Kumpul Evakuasi Lateral</span>
            </div>
          </Html>
        </group>
      )}

      {/* Interactive Mitigation Evacuation Action Prompt Button */}
      <Html position={[7.5, 4.4, 0]} center distanceFactor={9.5}>
        <button
          onClick={() => {
            soundEngine.playClick();
            if (onActionClick) onActionClick('EVACUATE_LATERAL');
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md cursor-pointer hover:scale-105 transition-all whitespace-nowrap border-2 border-white pointer-events-auto"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white" />
          <span>EVAKUASI LATERAL (LARI MENYAMPING KE DATARAN TINGGI)</span>
        </button>
      </Html>
    </group>
  );
};
