import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { soundEngine } from '../audio/soundEngine';

export type TsunamiStage = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const TsunamiSceneSetup: React.FC<{ stage: TsunamiStage }> = ({ stage }) => {
  const { scene } = useThree();

  useEffect(() => {
    const fogColor = stage >= 4
      ? new THREE.Color('#0a192f')
      : stage >= 1
      ? new THREE.Color('#0c243c')
      : new THREE.Color('#bae6fd');
    scene.fog = new THREE.Fog(fogColor, 45, 115);
    return () => { scene.fog = null; };
  }, [scene, stage]);

  return null;
};

// ─── REALISTIC TROPICAL PALM TREE COMPONENT ───
const PalmTree: React.FC<{
  position: [number, number, number];
  scale?: number;
  rotationY?: number;
  lean?: number;
  isDamaged?: boolean;
}> = ({
  position,
  scale = 1,
  rotationY = 0,
  lean = 0.12,
  isDamaged = false
}) => {
  const actualLean = isDamaged ? lean * 1.8 : lean;
  const frondColor1 = isDamaged ? '#65a30d' : '#16a34a';
  const frondColor2 = isDamaged ? '#854d0e' : '#15803d';

  return (
    <group position={position} scale={[scale, scale, scale]} rotation={[0, rotationY, actualLean]}>
      {/* Curved Segmented Trunk */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.13, 0.17, 0.8, 8]} />
        <meshStandardMaterial color="#78350f" roughness={0.88} />
      </mesh>
      <mesh position={[0.06, 1.15, 0]} rotation={[0, 0, -0.08]}>
        <cylinderGeometry args={[0.11, 0.13, 0.8, 8]} />
        <meshStandardMaterial color="#854d0e" roughness={0.88} />
      </mesh>
      <mesh position={[0.16, 1.9, 0]} rotation={[0, 0, -0.12]}>
        <cylinderGeometry args={[0.09, 0.11, 0.8, 8]} />
        <meshStandardMaterial color="#92400e" roughness={0.88} />
      </mesh>
      <mesh position={[0.3, 2.6, 0]} rotation={[0, 0, -0.16]}>
        <cylinderGeometry args={[0.08, 0.09, 0.7, 8]} />
        <meshStandardMaterial color="#78350f" roughness={0.88} />
      </mesh>

      {/* Coconut Cluster */}
      <group position={[0.38, 2.9, 0]}>
        {[-0.1, 0.1, 0].map((cx, i) => (
          <mesh key={`coco-${i}`} position={[cx, -0.05, (i === 2 ? 0.1 : -0.08)]}>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshStandardMaterial color="#713f12" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Realistic Curved Palm Fronds (8 Leaves in radial arch) */}
      <group position={[0.38, 2.95, 0]}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((f) => {
          const angle = (f / 8) * Math.PI * 2;
          return (
            <group key={`frond-${f}`} rotation={[0, angle, 0]}>
              <mesh position={[0.65, 0.15, 0]} rotation={[0, 0, -0.35]}>
                <boxGeometry args={[1.3, 0.03, 0.28]} />
                <meshStandardMaterial color={frondColor1} roughness={0.55} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[1.4, -0.22, 0]} rotation={[0, 0, -0.85]}>
                <boxGeometry args={[0.7, 0.02, 0.22]} />
                <meshStandardMaterial color={frondColor2} roughness={0.55} side={THREE.DoubleSide} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
};

// ─── REALISTIC FALLEN PALM LOG (Batang Kelapa Rebah di Tanah) ───
const FallenPalmTree: React.FC<{
  position: [number, number, number];
  rotationY?: number;
  scale?: number;
}> = ({ position, rotationY = 0, scale = 1 }) => {
  return (
    <group position={position} scale={[scale, scale, scale]} rotation={[0, rotationY, 0]}>
      {/* Root cluster upturned at the base */}
      <group position={[0, 0.18, 0]}>
        <mesh position={[0, 0, 0]}>
          <dodecahedronGeometry args={[0.26, 0]} />
          <meshStandardMaterial color="#451a03" roughness={0.95} />
        </mesh>
        {[-0.15, 0, 0.15].map((rx, ri) => (
          <mesh key={`root-tendril-${ri}`} position={[rx, -0.04, 0.08]} rotation={[0.4, ri * 0.5, 0]}>
            <cylinderGeometry args={[0.03, 0.04, 0.3, 5]} />
            <meshStandardMaterial color="#381e11" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Main Trunk lying flat along the ground */}
      <mesh position={[1.3, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.14, 2.4, 8]} />
        <meshStandardMaterial color="#78350f" roughness={0.88} />
      </mesh>

      {/* Fallen Fronds & Coconuts on the ground at the far end */}
      <group position={[2.5, 0.04, 0]}>
        {[-0.2, 0.1, 0.3].map((cx, i) => (
          <mesh key={`fallen-coco-${i}`} position={[cx, 0.04, (i === 1 ? -0.15 : 0.12)]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#713f12" roughness={0.7} />
          </mesh>
        ))}
        {[0.3, -0.4, 0.8, -0.9].map((rot, fi) => (
          <mesh key={`flat-frond-${fi}`} position={[0.3 + fi * 0.15, 0.02, 0]} rotation={[-Math.PI / 2, 0, rot]}>
            <planeGeometry args={[1.0, 0.25]} />
            <meshStandardMaterial color="#854d0e" roughness={0.7} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// ─── REALISTIC MANGROVE TREE COMPONENT ───
const MangroveTree: React.FC<{ position: [number, number, number]; scale?: number }> = ({
  position,
  scale = 1
}) => {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Arching Stilt Roots (Akar Tunjang) */}
      {[
        { rx: -0.35, rz: 0, rotZ: 0.45 },
        { rx: 0.35, rz: 0, rotZ: -0.45 },
        { rx: 0, rz: -0.35, rotZ: 0.45, rotY: Math.PI / 2 },
        { rx: 0, rz: 0.35, rotZ: -0.45, rotY: Math.PI / 2 },
        { rx: -0.22, rz: 0.22, rotZ: 0.4, rotY: Math.PI / 4 },
        { rx: 0.22, rz: -0.22, rotZ: -0.4, rotY: Math.PI / 4 }
      ].map((r, i) => (
        <mesh key={`root-${i}`} position={[r.rx, 0.3, r.rz]} rotation={[0, r.rotY || 0, r.rotZ]}>
          <cylinderGeometry args={[0.04, 0.06, 0.75, 6]} />
          <meshStandardMaterial color="#381e11" roughness={0.9} />
        </mesh>
      ))}

      {/* Main Trunk */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 0.7, 8]} />
        <meshStandardMaterial color="#451a03" roughness={0.85} />
      </mesh>

      {/* Dense Lush Canopy Clumps */}
      <mesh position={[0, 1.25, 0]}>
        <sphereGeometry args={[0.55, 12, 10]} />
        <meshStandardMaterial color="#14532d" roughness={0.7} />
      </mesh>
      <mesh position={[-0.25, 1.45, 0.2]}>
        <sphereGeometry args={[0.42, 10, 10]} />
        <meshStandardMaterial color="#166534" roughness={0.7} />
      </mesh>
      <mesh position={[0.25, 1.35, -0.2]}>
        <sphereGeometry args={[0.45, 10, 10]} />
        <meshStandardMaterial color="#15803d" roughness={0.7} />
      </mesh>
    </group>
  );
};

// ─── HIGHLAND PINE TREE (Pohon Pinus Dataran Tinggi - Solid Ground Anchor) ───
const HighlandTree: React.FC<{
  position: [number, number, number];
  scale?: number;
  rotationY?: number;
}> = ({
  position,
  scale = 1,
  rotationY = 0
}) => (
  <group position={position} scale={[scale, scale, scale]} rotation={[0, rotationY, 0]}>
    {/* Subterranean Trunk Plug (Extends into ground so tree never hovers on steep slopes) */}
    <mesh position={[0, -0.2, 0]}>
      <cylinderGeometry args={[0.12, 0.16, 0.5, 6]} />
      <meshStandardMaterial color="#2d1508" roughness={0.95} />
    </mesh>
    {/* Above-ground Trunk */}
    <mesh position={[0, 0.3, 0]}>
      <cylinderGeometry args={[0.07, 0.12, 0.65, 6]} />
      <meshStandardMaterial color="#451a03" roughness={0.9} />
    </mesh>
    {/* Layered Evergreen Pine Needles Canopy */}
    <mesh position={[0, 0.8, 0]}>
      <coneGeometry args={[0.55, 0.85, 7]} />
      <meshStandardMaterial color="#14532d" roughness={0.8} />
    </mesh>
    <mesh position={[0, 1.3, 0]}>
      <coneGeometry args={[0.42, 0.75, 7]} />
      <meshStandardMaterial color="#166534" roughness={0.8} />
    </mesh>
    <mesh position={[0, 1.75, 0]}>
      <coneGeometry args={[0.28, 0.6, 7]} />
      <meshStandardMaterial color="#15803d" roughness={0.8} />
    </mesh>
  </group>
);

// ─── PROCEDURAL ELEVATION FORMULA FOR ISLAND TERRAIN & MAJESTIC COASTAL MOUNTAIN RIDGE ───
export const getHillElevation = (x: number, z: number): number => {
  // 1. Ocean Seabed (Z >= 0.8)
  if (z >= 0.8) {
    return -1.8 + Math.sin(x * 0.3) * 0.02;
  }
  // 2. Beach Slope rising to island baseline Y = -1.0 (-0.8 <= Z < 0.8)
  if (z >= -0.8) {
    const t = (0.8 - z) / 1.6;
    let base = -1.8 + t * 0.8;
    // Coastal rocky bluff rising on the far right flank (X > 3.5)
    if (x > 3.5 && z < 0.2) {
      const tx = Math.min(1.0, (x - 3.5) / 4.0);
      const cliffH = tx * tx * (3.0 - 2.0 * tx) * (1.0 - Math.max(0, (z + 0.2) / 0.8)) * 1.5;
      base += cliffH;
    }
    return base;
  }

  // 3. Island Baseline Y = -1.0 (Z < -0.8)
  let y = -1.0;

  // 4. Majestic Coastal Mountain Ridge (X >= 0.8, Z <= -0.6)
  if (x > 0.8 && z < -0.6) {
    // Foothill progress along X: 0 at X=0.8, 1 at X=5.2
    const tx = Math.min(1.0, Math.max(0, (x - 0.8) / 4.4));
    const sx = tx * tx * (3.0 - 2.0 * tx); // Smooth S-curve transition from meadow

    // Shoreline distance factor along Z: 0 at Z=-0.6, 1 at Z=-2.4
    const tz = Math.min(1.0, Math.max(0, (-0.6 - z) / 1.8));
    const sz = tz * tz * (3.0 - 2.0 * tz);

    // Mountain bulk elevation (+3.5m above ground Y=-1.0, reaches Y = +2.5m)
    const baseMountainH = sx * sz * 3.5;

    // Organic geological ridges, erosion spurs, and natural undulations
    const geologicalVariance = (
      Math.sin(x * 0.75 + z * 0.55) * 0.22 +
      Math.cos(x * 1.3 - z * 0.95) * 0.14 +
      Math.sin(x * 2.2 + z * 1.6) * 0.06
    ) * sx * sz;

    // Scenic wide flat evacuation summit plateau around X = [4.8, 7.8], Z = [-5.8, -2.8]
    const distToSummitCenter = Math.hypot((x - 6.2) / 2.4, (z - (-4.2)) / 2.0);
    let summitBlend = 0;
    if (distToSummitCenter < 1.0) {
      summitBlend = Math.pow(1.0 - distToSummitCenter, 1.4);
    }

    let totalH = baseMountainH + geologicalVariance;
    totalH = THREE.MathUtils.lerp(totalH, 3.45, summitBlend * 0.85);

    y = -1.0 + totalH;
  }

  return y;
};

// ─── COASTAL SHRUB (Semak Pesisir) ───
const CoastalShrub: React.FC<{ position: [number, number, number]; scale?: number }> = ({ position, scale = 1 }) => (
  <group position={position} scale={[scale, scale, scale]}>
    <mesh position={[0, 0.2, 0]}>
      <dodecahedronGeometry args={[0.35, 0]} />
      <meshStandardMaterial color="#15803d" roughness={0.8} />
    </mesh>
    <mesh position={[0.15, 0.24, 0.1]}>
      <dodecahedronGeometry args={[0.25, 0]} />
      <meshStandardMaterial color="#166534" roughness={0.8} />
    </mesh>
  </group>
);

interface TsunamiSceneProps {
  isSimulating?: boolean;
  tsunamiStage?: TsunamiStage;
  onActionClick?: (actionId: string) => void;
  showCutaway?: boolean;
}

export const TsunamiScene: React.FC<TsunamiSceneProps> = ({
  isSimulating = true,
  tsunamiStage = 0,
  onActionClick,
  showCutaway: externalCutaway
}) => {
  // Animation Refs
  const oceanMeshRef = useRef<THREE.Mesh>(null);
  const waterLeftWallRef = useRef<THREE.Mesh>(null);
  const waterRightWallRef = useRef<THREE.Mesh>(null);
  const waterFrontWallRef = useRef<THREE.Mesh>(null);
  const sprayRef = useRef<THREE.InstancedMesh>(null);
  const flagRef = useRef<THREE.Mesh>(null);
  const sirenLightRef = useRef<THREE.PointLight>(null);
  const boatRef = useRef<THREE.Group>(null);
  const debrisGroupRef = useRef<THREE.Group>(null);
  const faultGlowRef = useRef<THREE.Mesh>(null);
  const terrainGroupRef = useRef<THREE.Group>(null);
  const houseGroupRef = useRef<THREE.Group>(null);

  const sprayCount = 80;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Cutaway View Override (Default from App or FALSE)
  const [internalShowCutaway] = useState<boolean>(false);
  const showCutaway = externalCutaway !== undefined ? externalCutaway : internalShowCutaway;

  // 1. PROCEDURAL 100% SOLID WATERTIGHT 3D ISLAND & MOUNTAIN DIORAMA GEOMETRY
  const solidIslandDiorama = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    const nx = 72;
    const nz = 54;
    const width = 24;
    const depth = 18;
    const baseY = -4.2;

    const cDeepSeabed    = new THREE.Color('#0284c7'); // Clear turquoise deep sea floor
    const cWetSand       = new THREE.Color('#ca8a04'); // Moist coastal beach sand
    const cGoldenSand    = new THREE.Color('#eab308'); // Warm golden sand
    const cCoastalDune   = new THREE.Color('#65a30d'); // Dunes transition
    const cLushGrass     = new THREE.Color('#15803d'); // Village coastal green
    const cMountainSlope = new THREE.Color('#166534'); // Highland slope forest
    const cDeepMountain  = new THREE.Color('#14532d'); // Mountain pine forest
    const cMountainRock  = new THREE.Color('#475569'); // Natural rock cliff face
    const cSummitPlateau = new THREE.Color('#64748b'); // Summit rock plateau
    const cBedrockWall   = new THREE.Color('#0b1329'); // Solid bedrock casing
    const cBottomBase    = new THREE.Color('#020617'); // Solid bottom plinth

    // 1. TOP SURFACE VERTICES
    for (let j = 0; j < nz; j++) {
      const z = -depth / 2 + (j / (nz - 1)) * depth;
      for (let i = 0; i < nx; i++) {
        const x = -width / 2 + (i / (nx - 1)) * width;
        const y = getHillElevation(x, z);
        positions.push(x, y, z);

        const color = new THREE.Color();
        if (z >= 1.0) {
          color.copy(cDeepSeabed);
        } else if (z >= 0.4) {
          const factor = (1.0 - z) / 0.6;
          color.copy(cDeepSeabed).lerp(cWetSand, factor);
        } else if (z >= 0.0) {
          const factor = (0.4 - z) / 0.4;
          color.copy(cWetSand).lerp(cGoldenSand, factor);
        } else if (z >= -0.6) {
          const factor = (0.0 - z) / 0.6;
          color.copy(cGoldenSand).lerp(cCoastalDune, factor);
        } else if (z >= -1.4 && y < -0.4) {
          const factor = (-0.6 - z) / 0.8;
          color.copy(cCoastalDune).lerp(cLushGrass, factor);
        } else {
          if (y < -0.4) {
            color.copy(cLushGrass);
          } else if (y < 0.6) {
            const factor = (y - (-0.4)) / 1.0;
            color.copy(cLushGrass).lerp(cMountainSlope, factor);
          } else if (y < 1.6) {
            const factor = (y - 0.6) / 1.0;
            color.copy(cMountainSlope).lerp(cDeepMountain, factor);
          } else if (y < 2.3) {
            const factor = (y - 1.6) / 0.7;
            color.copy(cDeepMountain).lerp(cMountainRock, factor);
          } else {
            const factor = Math.min(1.0, (y - 2.3) / 0.4);
            color.copy(cMountainRock).lerp(cSummitPlateau, factor);
          }
        }
        colors.push(color.r, color.g, color.b);
      }
    }

    // 2. BOTTOM SURFACE VERTICES
    const bottomOffset = nx * nz;
    for (let j = 0; j < nz; j++) {
      const z = -depth / 2 + (j / (nz - 1)) * depth;
      for (let i = 0; i < nx; i++) {
        const x = -width / 2 + (i / (nx - 1)) * width;
        positions.push(x, baseY, z);
        colors.push(cBottomBase.r, cBottomBase.g, cBottomBase.b);
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

    // 5. WATERTIGHT SIDE WALL TRIANGLES (Solid vertical bedrock casing)
    // Front Wall (+Z)
    for (let i = 0; i < nx - 1; i++) {
      const t1 = topIdx(i, nz - 1);
      const t2 = topIdx(i + 1, nz - 1);
      const b1 = btmIdx(i, nz - 1);
      const b2 = btmIdx(i + 1, nz - 1);
      indices.push(t1, b1, t2);
      indices.push(t2, b1, b2);
    }

    // Back Wall (-Z)
    for (let i = 0; i < nx - 1; i++) {
      const t1 = topIdx(i, 0);
      const t2 = topIdx(i + 1, 0);
      const b1 = btmIdx(i, 0);
      const b2 = btmIdx(i + 1, 0);
      indices.push(t1, t2, b1);
      indices.push(t2, b2, b1);
    }

    // Left Wall (-X)
    for (let j = 0; j < nz - 1; j++) {
      const t1 = topIdx(0, j);
      const t2 = topIdx(0, j + 1);
      const b1 = btmIdx(0, j);
      const b2 = btmIdx(0, j + 1);
      indices.push(t1, b1, t2);
      indices.push(t2, b1, b2);
    }

    // Right Wall (+X)
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
  }, []);

  // 2. DYNAMIC OCEAN SURFACE GEOMETRY (Matching 24 x 18 Bounding Block) - Optimized Resolution
  const oceanGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(24, 18, 48, 36);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  // Dynamic Volumetric Water Side Wall Geometries (Anchored from seabed Y=-1.8 up to dynamic wave surface)
  const waterSideWallGeo = useMemo(() => new THREE.PlaneGeometry(18, 1, 36, 1), []);
  const waterFrontWallGeo = useMemo(() => new THREE.PlaneGeometry(24, 1, 48, 1), []);

  // 3. CLEAN GEOLOGICAL CROSS-SECTION SHAPES (Seamless fit at Z = 9.04)
  const cutawayShapes = useMemo(() => {
    // 1. Oceanic Plate (Left slab dipping down-right at trench interface)
    const oceanShape = new THREE.Shape();
    oceanShape.moveTo(-12.0, -1.8);
    oceanShape.lineTo(-0.5, -1.8);
    oceanShape.lineTo(2.0, -3.6);
    oceanShape.lineTo(2.0, -4.2);
    oceanShape.lineTo(-12.0, -4.2);
    oceanShape.closePath();

    // Oceanic Top Sediment Thin Layer
    const oceanSedimentShape = new THREE.Shape();
    oceanSedimentShape.moveTo(-12.0, -1.8);
    oceanSedimentShape.lineTo(-0.5, -1.8);
    oceanSedimentShape.lineTo(2.0, -3.6);
    oceanSedimentShape.lineTo(2.0, -3.75);
    oceanSedimentShape.lineTo(-0.5, -1.95);
    oceanSedimentShape.lineTo(-12.0, -1.95);
    oceanSedimentShape.closePath();

    // 2. Continental Plate - Normal (Stage 0: Perfectly flush, side-by-side with oceanic slab)
    const contNormalShape = new THREE.Shape();
    contNormalShape.moveTo(-0.5, -1.8);
    contNormalShape.lineTo(0.5, -1.0);
    contNormalShape.lineTo(12.0, -1.0);
    contNormalShape.lineTo(12.0, -4.2);
    contNormalShape.lineTo(2.0, -4.2);
    contNormalShape.lineTo(2.0, -3.6);
    contNormalShape.closePath();

    // Continental Top Soil Strip - Normal
    const contSoilNormalShape = new THREE.Shape();
    contSoilNormalShape.moveTo(-0.5, -1.8);
    contSoilNormalShape.lineTo(0.5, -1.0);
    contSoilNormalShape.lineTo(12.0, -1.0);
    contSoilNormalShape.lineTo(12.0, -1.15);
    contSoilNormalShape.lineTo(0.5, -1.15);
    contSoilNormalShape.lineTo(-0.5, -1.92);
    contSoilNormalShape.closePath();

    // 3. Continental Plate - Ruptured / Uplifted (Stage >= 1: Tip snaps UPWARD creating vertical displacement)
    const contRuptureShape = new THREE.Shape();
    contRuptureShape.moveTo(-0.5, -1.35); // Uplifted tip by +0.45m
    contRuptureShape.lineTo(0.5, -0.85);
    contRuptureShape.lineTo(12.0, -1.0);
    contRuptureShape.lineTo(12.0, -4.2);
    contRuptureShape.lineTo(2.0, -4.2);
    contRuptureShape.lineTo(2.0, -3.6);
    contRuptureShape.closePath();

    // Continental Top Soil Strip - Ruptured
    const contSoilRuptureShape = new THREE.Shape();
    contSoilRuptureShape.moveTo(-0.5, -1.35);
    contSoilRuptureShape.lineTo(0.5, -0.85);
    contSoilRuptureShape.lineTo(12.0, -1.0);
    contSoilRuptureShape.lineTo(12.0, -1.15);
    contSoilRuptureShape.lineTo(0.5, -1.0);
    contSoilRuptureShape.lineTo(-0.5, -1.47);
    contSoilRuptureShape.closePath();

    // 4. Sliced Ocean Water Column Shape (Above seabed on left side)
    const oceanWaterShape = new THREE.Shape();
    oceanWaterShape.moveTo(-12.0, -1.8);
    oceanWaterShape.lineTo(-0.5, -1.8);
    oceanWaterShape.lineTo(-0.5, -1.35);
    oceanWaterShape.lineTo(-12.0, -1.35);
    oceanWaterShape.closePath();

    return {
      oceanGeo: new THREE.ShapeGeometry(oceanShape),
      oceanSedimentGeo: new THREE.ShapeGeometry(oceanSedimentShape),
      contNormalGeo: new THREE.ShapeGeometry(contNormalShape),
      contSoilNormalGeo: new THREE.ShapeGeometry(contSoilNormalShape),
      contRuptureGeo: new THREE.ShapeGeometry(contRuptureShape),
      contSoilRuptureGeo: new THREE.ShapeGeometry(contSoilRuptureShape),
      oceanWaterGeo: new THREE.ShapeGeometry(oceanWaterShape)
    };
  }, []);

  // Water spray particles
  const sprayParticles = useMemo(() => {
    return Array.from({ length: sprayCount }).map(() => ({
      x: (Math.random() - 0.5) * 16,
      y: 0.5,
      z: 2.0 + Math.random() * 2.0,
      vx: (Math.random() - 0.5) * 0.06,
      vy: 0.07 + Math.random() * 0.09,
      vz: -0.08 - Math.random() * 0.12,
      gravity: -0.004,
      scale: 0.08 + Math.random() * 0.12
    }));
  }, [sprayCount]);

  // Animation Loop
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Quake Tremor Shaking (Stage 1)
    if (terrainGroupRef.current) {
      if (tsunamiStage === 1) {
        terrainGroupRef.current.position.x = Math.sin(t * 38) * 0.035;
        terrainGroupRef.current.position.y = Math.cos(t * 32) * 0.025;
      } else {
        terrainGroupRef.current.position.x = 0;
        terrainGroupRef.current.position.y = 0;
      }
    }

    // Undersea Fault Glow pulse (Stage 1 or Cutaway mode)
    if (faultGlowRef.current) {
      const mat = faultGlowRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = (tsunamiStage === 1 || showCutaway) ? 5.0 + Math.sin(t * 12) * 3.0 : 1.0;
      }
    }

    // Siren Light Strobe (Active in stages 2-6)
    if (sirenLightRef.current) {
      sirenLightRef.current.intensity = tsunamiStage >= 2 ? 4.0 + Math.sin(t * 16) * 3.0 : 0.4;
    }

    // Flag Waving
    if (flagRef.current) {
      flagRef.current.rotation.y = Math.sin(t * 4.5) * 0.35;
    }

    // Houses sway/float when tsunami hits in stage 4 & 5
    if (houseGroupRef.current) {
      if (tsunamiStage === 4 || tsunamiStage === 5) {
        houseGroupRef.current.position.y = Math.sin(t * 2.5) * 0.18;
        houseGroupRef.current.rotation.z = Math.sin(t * 1.8) * 0.06;
      } else {
        houseGroupRef.current.position.y = 0;
        houseGroupRef.current.rotation.z = 0;
      }
    }

    // Boat motion & flood floating
    if (boatRef.current) {
      if (tsunamiStage === 0) {
        boatRef.current.position.set(-0.6, -1.2 + Math.sin(t * 1.8) * 0.12, 1.2);
        boatRef.current.rotation.set(Math.cos(t * 1.5) * 0.08, 0.35, Math.sin(t * 2.2) * 0.1);
      } else if (tsunamiStage === 1) {
        boatRef.current.position.set(-0.6, -1.2 + Math.sin(t * 4) * 0.25, 1.2);
        boatRef.current.rotation.set(Math.sin(t * 6) * 0.2, 0.35, Math.cos(t * 5) * 0.2);
      } else if (tsunamiStage === 2) {
        boatRef.current.position.set(-0.6, -1.7, 2.0);
        boatRef.current.rotation.set(0.3, 0.6, 0.35);
      } else if (tsunamiStage === 3) {
        boatRef.current.position.set(-1.2, 0.2 + Math.sin(t * 3.5) * 0.3, 0.5);
        boatRef.current.rotation.set(Math.sin(t * 4) * 0.3, t * 0.3, Math.cos(t * 3) * 0.35);
      } else if (tsunamiStage === 4 || tsunamiStage === 5) {
        // Boat carried inland by tsunami flood surge!
        boatRef.current.position.set(-4.5 + Math.sin(t * 1.2) * 0.5, 0.25 + Math.sin(t * 3.5) * 0.25, -1.5);
        boatRef.current.rotation.set(Math.sin(t * 3) * 0.35, 1.2 + Math.sin(t * 0.8) * 0.4, Math.cos(t * 2.5) * 0.3);
      } else {
        // Stage 6 (Pasca Tsunami): Capsized stranded boat washed inland into ruins
        boatRef.current.position.set(-5.2, -0.85, -1.2);
        boatRef.current.rotation.set(1.35, 0.45, -0.4);
      }
    }

    // Floating Tsunami Debris (Stage 4 & 5)
    if (debrisGroupRef.current) {
      if (tsunamiStage === 4 || tsunamiStage === 5) {
        debrisGroupRef.current.position.y = 0.25 + Math.sin(t * 2.8) * 0.15;
        debrisGroupRef.current.position.x = Math.sin(t * 1.4) * 0.3;
      }
    }

    // ─── TOWERING SOLID VOLUMETRIC TSUNAMI WAVE CALCULATION ───
    const getWaterY = (x: number, z: number) => {
      // Precise terrain elevation at (x, z)
      let yTerrain = -1.0;
      if (z >= 0.8) {
        yTerrain = -1.8;
      } else if (z >= -0.8) {
        const tSlope = (0.8 - z) / 1.6;
        yTerrain = -1.8 + tSlope * 0.8;
      }

      const ripple = Math.sin(x * 1.1 + t * 2.2) * 0.04 + Math.cos(z * 1.2 + t * 1.8) * 0.03;

      if (tsunamiStage <= 1) {
        // Normal & Quake stages: Ocean water active for z >= 0.0
        let seaLevel = -1.35 + ripple;
        if (tsunamiStage === 1 && z >= 1.0) {
          seaLevel += Math.sin(t * 8.0 + z * 1.5) * 0.22; // Seismic swell
        }
        return Math.max(yTerrain - 0.03, seaLevel);
      }

      if (tsunamiStage === 2) {
        // Water drawback (Surut Jauh): Sea draws far back into deep water
        const seaLevel = -2.15 + Math.sin(x * 1.2 + t * 1.8) * 0.04;
        return Math.max(yTerrain - 0.03, seaLevel);
      }

      if (tsunamiStage === 3) {
        // Approaching Giant Tsunami Wave: Smooth towering solitary wave travelling to shore (2.6m peak!)
        const waveCrestZ = 5.2 - ((t * 0.38) % 1) * 5.8;
        const dist = z - waveCrestZ;
        // Continuous asymmetric shoaling wave profile (steep front, deep volume behind)
        const sigma = dist > 0 ? 2.2 : 1.4;
        const waveHeight = Math.exp(-Math.pow(dist / sigma, 2)) * 2.6;
        const seaLevel = -1.35 + ripple + waveHeight;
        return Math.max(yTerrain - 0.03, seaLevel);
      }

      if (tsunamiStage === 4) {
        // Stage 4: Massive Destructive Wave Impact crashing over shore and village
        const waveCrestZ = -0.3 + Math.sin(t * 1.5) * 0.8;
        const dist = z - waveCrestZ;
        const surgeHeight = Math.exp(-Math.pow(dist / 1.8, 2)) * 2.2;
        const surgeLevel = -0.65 + ripple * 1.5 + surgeHeight;
        return Math.max(yTerrain - 0.03, surgeLevel);
      }

      if (tsunamiStage === 5) {
        // Stage 5: Deep Coastal Inundation across village (roaring flood water covering ground)
        const floodLevel = -0.2 + Math.sin(x * 0.8 + t * 2.0) * 0.06 + Math.cos(z * 0.7 + t * 1.6) * 0.05;
        // Tapers off gently near the high evacuation mountain ridge at (6.2, -4.2)
        const distToHill = Math.hypot(x - 6.2, z - (-4.2));
        const hillSafety = Math.min(1.0, Math.max(0, (distToHill - 3.0) / 2.8));
        const activeFlood = -1.0 + (floodLevel - (-1.0)) * hillSafety;
        return Math.max(yTerrain - 0.03, activeFlood);
      }

      // Stage 6: Receding water rushing back out to sea
      const recedingSea = -1.45 + ripple;
      return Math.max(yTerrain - 0.03, recedingSea);
    };

    // ─── UPDATE DYNAMIC VOLUMETRIC WATER BLOCK (TOP SURFACE & SOLID SIDE WALLS) ───
    if (oceanMeshRef.current) {
      const geo = oceanMeshRef.current.geometry as THREE.BufferGeometry;
      const pos = geo.attributes.position;
      const count = pos.count;

      for (let i = 0; i < count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        pos.setY(i, getWaterY(x, z));
      }

      pos.needsUpdate = true;
      geo.computeVertexNormals();

      // Left Water Wall (X = -12.0)
      if (waterLeftWallRef.current) {
        const wallGeo = waterLeftWallRef.current.geometry as THREE.BufferGeometry;
        const wallPos = wallGeo.attributes.position;
        for (let j = 0; j <= 36; j++) {
          const z = -9.0 + (j / 36) * 18.0;
          let yTerrain = -1.0;
          if (z >= 0.8) yTerrain = -1.8;
          else if (z >= -0.8) yTerrain = -1.8 + ((0.8 - z) / 1.6) * 0.8;

          const yTop = getWaterY(-12.0, z);
          wallPos.setY(j, yTop);           // Top edge
          wallPos.setY(j + 37, yTerrain);  // Bottom edge anchored flush to terrain
        }
        wallPos.needsUpdate = true;
      }

      // Right Water Wall (X = +12.0)
      if (waterRightWallRef.current) {
        const wallGeo = waterRightWallRef.current.geometry as THREE.BufferGeometry;
        const wallPos = wallGeo.attributes.position;
        for (let j = 0; j <= 36; j++) {
          const z = -9.0 + (j / 36) * 18.0;
          let yTerrain = -1.0;
          if (z >= 0.8) yTerrain = -1.8;
          else if (z >= -0.8) yTerrain = -1.8 + ((0.8 - z) / 1.6) * 0.8;

          const yTop = getWaterY(12.0, z);
          wallPos.setY(j, yTop);           // Top edge
          wallPos.setY(j + 37, yTerrain);  // Bottom edge anchored flush to terrain
        }
        wallPos.needsUpdate = true;
      }

      // Front Water Wall (Z = +9.0)
      if (waterFrontWallRef.current) {
        const wallGeo = waterFrontWallRef.current.geometry as THREE.BufferGeometry;
        const wallPos = wallGeo.attributes.position;
        for (let j = 0; j <= 48; j++) {
          const x = -12.0 + (j / 48) * 24.0;
          const yTop = getWaterY(x, 9.0);
          wallPos.setY(j, yTop);         // Top edge
          wallPos.setY(j + 49, -1.8);     // Bottom edge anchored to seabed
        }
        wallPos.needsUpdate = true;
      }
    }

    // Water Spray Droplets (Active during tsunami impact stages 3-5)
    if (sprayRef.current) {
      if (tsunamiStage >= 3 && tsunamiStage <= 5) {
        const waveCenterZ = tsunamiStage === 5 ? -1.5 : tsunamiStage === 4 ? -0.2 : 1.5;
        sprayParticles.forEach((sp, i) => {
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.z += sp.vz;
          sp.vy += sp.gravity;

          if (sp.y < -1.4 || sp.z < -3.5) {
            sp.x = (Math.random() - 0.5) * 16;
            sp.y = 0.6 + Math.random() * 0.6;
            sp.z = waveCenterZ + (Math.random() - 0.5) * 1.2;
            sp.vy = 0.08 + Math.random() * 0.09;
            sp.vz = -0.08 - Math.random() * 0.12;
          }

          dummy.position.set(sp.x, sp.y, sp.z);
          dummy.scale.set(sp.scale, sp.scale, sp.scale);
          dummy.rotation.set(t * 3 + i, t * 2, 0);
          dummy.updateMatrix();
          sprayRef.current!.setMatrixAt(i, dummy.matrix);
        });
        sprayRef.current.instanceMatrix.needsUpdate = true;
      } else {
        for (let i = 0; i < sprayCount; i++) {
          dummy.position.set(0, -999, 0);
          dummy.scale.set(0, 0, 0);
          dummy.updateMatrix();
          sprayRef.current.setMatrixAt(i, dummy.matrix);
        }
        sprayRef.current.instanceMatrix.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      <TsunamiSceneSetup stage={tsunamiStage} />

      {/* ── LIGHTING ── */}
      <ambientLight intensity={tsunamiStage >= 4 ? 0.9 : 1.4} />
      <hemisphereLight
        args={[
          tsunamiStage >= 4 ? '#0c243c' : '#38bdf8',
          '#1e293b',
          tsunamiStage >= 4 ? 0.9 : 1.3
        ]}
      />
      <directionalLight
        position={[10, 18, 12]}
        intensity={tsunamiStage >= 4 ? 1.6 : 3.0}
        color={tsunamiStage >= 4 ? '#bae6fd' : '#ffffff'}
        castShadow
      />
      <directionalLight position={[-10, 12, -8]} intensity={1.1} color="#38bdf8" />
      <pointLight ref={sirenLightRef} position={[6.2, 5.5, -4.2]} color="#f59e0b" distance={18} />

      {/* ── WATER SPRAY DROPLETS INSTANCE ── */}
      <instancedMesh ref={sprayRef} args={[undefined, undefined, sprayCount]}>
        <dodecahedronGeometry args={[0.15, 0]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </instancedMesh>

      {/* ── SCENE GEOMETRY GROUP ── */}
      <group ref={terrainGroupRef}>
        {/* 1. 100% WATERTIGHT SOLID 3D ISLAND & MOUNTAIN DIORAMA BLOCK (ZERO GAPS / ZERO HOLLOW CAVITIES) */}
        <mesh geometry={solidIslandDiorama} receiveShadow>
          <meshStandardMaterial vertexColors roughness={0.82} metalness={0.08} />
        </mesh>

        {/* 3. DYNAMIC TSUNAMI OCEAN WATER BLOCK (SOLID VOLUMETRIC BODY & WAVE WALLS) */}
        <group>
          {/* A. Top Dynamic Ocean Surface */}
          <mesh ref={oceanMeshRef} geometry={oceanGeometry} position={[0, 0, 0]} receiveShadow>
            <meshStandardMaterial
              color={tsunamiStage >= 4 ? '#0284c7' : '#0369a1'}
              roughness={0.14}
              metalness={0.22}
              emissive={tsunamiStage >= 4 ? '#024b70' : '#013a57'}
              emissiveIntensity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* B. Left Ocean Water Wall (X = -12.0) */}
          <mesh ref={waterLeftWallRef} geometry={waterSideWallGeo} position={[-12.0, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <meshStandardMaterial
              color={tsunamiStage >= 4 ? '#0284c7' : '#0369a1'}
              roughness={0.14}
              metalness={0.22}
              emissive={tsunamiStage >= 4 ? '#024b70' : '#013a57'}
              emissiveIntensity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* C. Right Ocean Water Wall (X = +12.0) */}
          <mesh ref={waterRightWallRef} geometry={waterSideWallGeo} position={[12.0, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <meshStandardMaterial
              color={tsunamiStage >= 4 ? '#0284c7' : '#0369a1'}
              roughness={0.14}
              metalness={0.22}
              emissive={tsunamiStage >= 4 ? '#024b70' : '#013a57'}
              emissiveIntensity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* D. Front Ocean Water Wall (Z = +9.0) */}
          <mesh ref={waterFrontWallRef} geometry={waterFrontWallGeo} position={[0, 0, 9.0]}>
            <meshStandardMaterial
              color={tsunamiStage >= 4 ? '#0284c7' : '#0369a1'}
              roughness={0.14}
              metalness={0.22}
              emissive={tsunamiStage >= 4 ? '#024b70' : '#013a57'}
              emissiveIntensity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>

        {/* 4. REALISTIC SUBTERRANEAN PROCESS & MEGATHRUST CUTAWAY (When "Tampilkan Proses" is Active) */}
        {showCutaway && (
          <group position={[0, 0, 9.04]}>
            {/* Diorama Front Cutaway Base Sliced Face Background */}
            <mesh position={[0, -2.4, 0.0]}>
              <boxGeometry args={[24.0, 4.2, 0.02]} />
              <meshStandardMaterial color="#0b1329" roughness={0.92} />
            </mesh>

            {/* ASTHENOSPHERE / UPPER MANTLE (Lapisan Astenosfer Panas Bawah) */}
            <mesh position={[0, -3.9, 0.02]}>
              <boxGeometry args={[23.8, 0.6, 0.02]} />
              <meshStandardMaterial
                color="#7c2d12"
                emissive="#9a3412"
                emissiveIntensity={0.35}
                roughness={0.7}
              />
            </mesh>

            {/* ── 1. LEMPENG SAMUDRA (OCEANIC PLATE) ── */}
            {/* Basaltic Crust Body */}
            <mesh geometry={cutawayShapes.oceanGeo} position={[0, 0, 0.04]}>
              <meshStandardMaterial
                color="#1e293b"
                roughness={0.85}
                polygonOffset
                polygonOffsetFactor={-1}
                polygonOffsetUnits={-1}
              />
            </mesh>
            {/* Pelagic Ocean Sediment Top Layer */}
            <mesh geometry={cutawayShapes.oceanSedimentGeo} position={[0, 0, 0.06]}>
              <meshStandardMaterial
                color="#0891b2"
                roughness={0.6}
                polygonOffset
                polygonOffsetFactor={-2}
                polygonOffsetUnits={-2}
              />
            </mesh>
            {/* Subduction Motion Vector (Arrow moving down-right ↘) */}
            <group position={[-6.0, -3.1, 0.08]} rotation={[0, 0, -Math.PI / 2 - 0.2]}>
              <mesh position={[0, 0.35, 0]}>
                <coneGeometry args={[0.2, 0.4, 8]} />
                <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={2.5} />
              </mesh>
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.07, 0.07, 0.5, 8]} />
                <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={2.0} />
              </mesh>
            </group>

            {/* ── 2. LEMPENG BENUA (CONTINENTAL CRUST) ── */}
            {/* In Stage 0: flush and side-by-side. In Stage >= 1: tip snaps UPWARD */}
            <mesh
              geometry={tsunamiStage === 0 ? cutawayShapes.contNormalGeo : cutawayShapes.contRuptureGeo}
              position={[0, 0, 0.04]}
            >
              <meshStandardMaterial
                color="#78350f"
                roughness={0.88}
                polygonOffset
                polygonOffsetFactor={-1}
                polygonOffsetUnits={-1}
              />
            </mesh>
            {/* Continental Top Soil Layer */}
            <mesh
              geometry={tsunamiStage === 0 ? cutawayShapes.contSoilNormalGeo : cutawayShapes.contSoilRuptureGeo}
              position={[0, 0, 0.06]}
            >
              <meshStandardMaterial
                color="#15803d"
                roughness={0.8}
                polygonOffset
                polygonOffsetFactor={-2}
                polygonOffsetUnits={-2}
              />
            </mesh>

            {/* Elastic Rebound Uplift Vector (When earthquake snaps the plate upward in stage >= 1) */}
            {tsunamiStage >= 1 && (
              <group position={[-0.5, -0.65, 0.09]}>
                <mesh position={[0, 0.4, 0]}>
                  <coneGeometry args={[0.22, 0.45, 8]} />
                  <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={4.0} />
                </mesh>
                <mesh position={[0, 0, 0]}>
                  <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
                  <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={3.0} />
                </mesh>
              </group>
            )}

            {/* ── 3. ZONA SESAR MEGATHRUST & HIPOSENTRUM (FAULT PLANE & HYPOCENTER) ── */}
            {/* Glowing Megathrust Fault Contact Seam along the exact plate boundary */}
            <mesh ref={faultGlowRef} position={[0.85, -2.8, 0.08]} rotation={[0, 0, -0.637]}>
              <boxGeometry args={[3.4, 0.08, 0.02]} />
              <meshStandardMaterial
                color="#ef4444"
                emissive="#ff0000"
                emissiveIntensity={tsunamiStage >= 1 ? 6.0 : 2.0}
                roughness={0.2}
              />
            </mesh>
            {/* Hypocenter Core (Pusat Pelepasan Gempa) */}
            <mesh position={[0.85, -2.8, 0.1]}>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ff3b30"
                emissiveIntensity={tsunamiStage >= 1 ? 8.0 : 3.0}
              />
            </mesh>

            {/* Concentric Seismic Rupture Shockwave Rings (Gelombang Gempa P & S) */}
            {tsunamiStage >= 1 && (
              <group position={[0.85, -2.8, 0.12]}>
                {[0.9, 1.8, 2.8].map((radius, ri) => (
                  <mesh key={`shockwave-${ri}`}>
                    <ringGeometry args={[radius - 0.06, radius + 0.06, 32]} />
                    <meshBasicMaterial color="#f87171" transparent opacity={0.75 - ri * 0.2} />
                  </mesh>
                ))}
              </group>
            )}

            {/* ── 4. WATER COLUMN THRUST CROSS-SECTION (KOLOM AIR LAUT) ── */}
            {/* Sliced front ocean water column above seabed on left side */}
            <mesh geometry={cutawayShapes.oceanWaterGeo} position={[0, 0, 0.07]}>
              <meshStandardMaterial
                color="#0284c7"
                emissive="#0369a1"
                emissiveIntensity={0.25}
                transparent
                opacity={0.65}
              />
            </mesh>

            {/* Massive Upward Kinetic Water Column Thrust Vectors (Stage >= 1) */}
            {tsunamiStage >= 1 && (
              <group position={[-0.5, -0.85, 0.12]}>
                {[-1.2, 0, 1.2].map((ux, ui) => (
                  <group key={`thrust-vec-${ui}`} position={[ux, 0, 0]}>
                    <mesh position={[0, 0.45, 0]}>
                      <coneGeometry args={[0.18, 0.38, 8]} />
                      <meshStandardMaterial color="#38bdf8" emissive="#00ffff" emissiveIntensity={4.0} />
                    </mesh>
                    <mesh position={[0, 0, 0]}>
                      <cylinderGeometry args={[0.06, 0.06, 0.6, 8]} />
                      <meshStandardMaterial color="#38bdf8" emissive="#00ffff" emissiveIntensity={3.0} />
                    </mesh>
                  </group>
                ))}
              </group>
            )}

            {/* Horizontal Wave Propagation Vector towards shore (Stage >= 3) */}
            {tsunamiStage >= 3 && (
              <group position={[1.8, -0.35, 0.12]} rotation={[0, 0, -Math.PI / 2]}>
                <mesh position={[0, 0.5, 0]}>
                  <coneGeometry args={[0.22, 0.45, 8]} />
                  <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={4.5} />
                </mesh>
                <mesh position={[0, 0, 0]}>
                  <cylinderGeometry args={[0.07, 0.07, 0.7, 8]} />
                  <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={3.5} />
                </mesh>
              </group>
            )}
          </group>
        )}

        {/* 5. INDONESIAN COASTAL FISHING VILLAGE (Rumah Panggung Nelayan Tradisional) */}
        {tsunamiStage < 5 ? (
          <group ref={houseGroupRef}>
            {/* House 1: Kampung Nelayan Utama (Intact) */}
            <group position={[-5.0, -0.3, -2.4]}>
              <mesh position={[0, 0.65, 0]}>
                <boxGeometry args={[2.4, 1.3, 2.0]} />
                <meshStandardMaterial color="#d97706" roughness={0.7} />
              </mesh>
              <mesh position={[0, 1.8, 0]} rotation={[0, Math.PI / 4, 0]}>
                <coneGeometry args={[2.0, 1.0, 4]} />
                <meshStandardMaterial color="#b45309" roughness={0.6} />
              </mesh>
              {[
                [-1.0, -0.35, -0.8],
                [1.0, -0.35, -0.8],
                [-1.0, -0.35, 0.8],
                [1.0, -0.35, 0.8]
              ].map(([px, py, pz], pi) => (
                <mesh key={`stilt1-${pi}`} position={[px, py, pz]}>
                  <cylinderGeometry args={[0.07, 0.07, 0.7, 6]} />
                  <meshStandardMaterial color="#451a03" roughness={0.9} />
                </mesh>
              ))}
            </group>

            {/* House 2: Pondok Nelayan (Intact) */}
            <group position={[-8.4, -0.35, -2.8]}>
              <mesh position={[0, 0.55, 0]}>
                <boxGeometry args={[1.8, 1.1, 1.6]} />
                <meshStandardMaterial color="#b45309" roughness={0.7} />
              </mesh>
              <mesh position={[0, 0.45, 0.81]}>
                <boxGeometry args={[0.45, 0.8, 0.04]} />
                <meshStandardMaterial color="#78350f" roughness={0.5} />
              </mesh>
              <mesh position={[0, 1.55, 0]} rotation={[0, Math.PI / 4, 0]}>
                <coneGeometry args={[1.5, 0.85, 4]} />
                <meshStandardMaterial color="#ea580c" roughness={0.6} />
              </mesh>
              {[
                [-0.7, -0.325, -0.6],
                [0.7, -0.325, -0.6],
                [-0.7, -0.325, 0.6],
                [0.7, -0.325, 0.6]
              ].map(([px, py, pz], pi) => (
                <mesh key={`stilt2-${pi}`} position={[px, py, pz]}>
                  <cylinderGeometry args={[0.06, 0.06, 0.65, 6]} />
                  <meshStandardMaterial color="#451a03" roughness={0.9} />
                </mesh>
              ))}
            </group>
          </group>
        ) : (
          /* REALISTIC POST-TSUNAMI COASTAL VILLAGE */
          <group ref={houseGroupRef}>
            {/* House 1: Rumah Panggung Miring & Amblas */}
            <group position={[-5.0, -0.6, -2.5]} rotation={[0.04, 0.12, -0.12]}>
              <mesh position={[0, 0.65, 0]}>
                <boxGeometry args={[2.4, 1.3, 2.0]} />
                <meshStandardMaterial color="#92400e" roughness={0.8} />
              </mesh>
              <mesh position={[0, 0.25, 0]}>
                <boxGeometry args={[2.42, 0.5, 2.02]} />
                <meshStandardMaterial color="#451a03" roughness={0.95} />
              </mesh>
              <mesh position={[0.1, 1.65, 0]} rotation={[0.06, Math.PI / 4, -0.1]}>
                <coneGeometry args={[1.95, 0.9, 4]} />
                <meshStandardMaterial color="#78350f" roughness={0.8} />
              </mesh>
              {[
                [-1.0, -0.35, -0.8],
                [1.0, -0.35, -0.8],
                [1.0, -0.35, 0.8]
              ].map(([px, py, pz], pi) => (
                <mesh key={`damaged-stilt-${pi}`} position={[px, py, pz]}>
                  <cylinderGeometry args={[0.07, 0.07, 0.7, 6]} />
                  <meshStandardMaterial color="#451a03" roughness={0.9} />
                </mesh>
              ))}
              <mesh position={[-1.0, -0.3, 0.8]} rotation={[0.3, 0, -0.4]}>
                <cylinderGeometry args={[0.07, 0.07, 0.6, 6]} />
                <meshStandardMaterial color="#451a03" roughness={0.9} />
              </mesh>
            </group>

            {/* House 2: Fondasi Rumah yang Hanyut */}
            <group position={[-8.4, -0.96, -2.8]}>
              <mesh position={[0, 0.04, 0]}>
                <boxGeometry args={[2.0, 0.08, 1.8]} />
                <meshStandardMaterial color="#78350f" roughness={0.9} />
              </mesh>
              {[
                [-0.8, 0.15, -0.7],
                [0.8, 0.15, -0.7],
                [-0.8, 0.15, 0.7],
                [0.8, 0.15, 0.7]
              ].map(([px, py, pz], pi) => (
                <mesh key={`stump-${pi}`} position={[px, py, pz]}>
                  <cylinderGeometry args={[0.06, 0.07, 0.25, 6]} />
                  <meshStandardMaterial color="#451a03" roughness={0.9} />
                </mesh>
              ))}
              <mesh position={[1.2, 0.2, 0.6]} rotation={[0.08, 0.4, 0.05]}>
                <coneGeometry args={[1.4, 0.5, 4]} />
                <meshStandardMaterial color="#854d0e" roughness={0.85} />
              </mesh>
            </group>
          </group>
        )}

        {/* 6. MANGROVE GREEN BELT (Sabuk Hijau Hutan Bakau Pesisir Alami) */}
        <group>
          <MangroveTree position={[-7.5, -1.8, 0.8]} scale={1.05} />
          <MangroveTree position={[-5.2, -1.8, 0.9]} scale={1.15} />
          <MangroveTree position={[-3.0, -1.8, 0.75]} scale={0.95} />
          <MangroveTree position={[-0.8, -1.8, 0.9]} scale={1.05} />
        </group>

        {/* 7. COASTAL TETRAPOD BREAKWATER (Pemecah Gelombang Beton) */}
        <group position={[1.2, -1.8, 1.4]}>
          {[-1.8, -0.9, 0, 0.9, 1.8].map((tx, ti) => (
            <group key={`tetra-${ti}`} position={[tx, 0, (ti % 2) * 0.4]}>
              <mesh position={[0, 0.25, 0]}>
                <dodecahedronGeometry args={[0.3, 0]} />
                <meshStandardMaterial color="#64748b" roughness={0.7} />
              </mesh>
              <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.12, 0.18, 0.45, 6]} />
                <meshStandardMaterial color="#475569" roughness={0.8} />
              </mesh>
            </group>
          ))}
        </group>

        {/* 8. INDONESIAN FISHING BOAT (Perahu Jukung Tradisional) */}
        <group ref={boatRef} position={[-4.5, -1.8, 1.3]} rotation={[0, 0.35, 0]}>
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[2.2, 0.35, 0.5]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.22, 0.26]}>
            <boxGeometry args={[2.1, 0.08, 0.02]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
          <mesh position={[0, 0.12, 0.26]}>
            <boxGeometry args={[2.1, 0.06, 0.02]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
          {[-0.6, 0.6].map((bx, bi) => (
            <mesh key={`boom-${bi}`} position={[bx, 0.25, 0.55]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.03, 0.03, 0.8]} />
              <meshStandardMaterial color="#facc15" />
            </mesh>
          ))}
          <mesh position={[0, 0.15, 0.95]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 2.0]} />
            <meshStandardMaterial color="#eab308" roughness={0.5} />
          </mesh>
        </group>

        {/* Floating Debris during Tsunami Surge (Stage 4 & 5) */}
        {(tsunamiStage === 4 || tsunamiStage === 5) && (
          <group ref={debrisGroupRef} position={[-5.0, 0.2, -1.8]}>
            <mesh position={[0.5, 0, 0.4]} rotation={[0.2, 0.8, 0.1]}>
              <boxGeometry args={[1.6, 0.12, 0.15]} />
              <meshStandardMaterial color="#78350f" roughness={0.7} />
            </mesh>
            <mesh position={[-0.8, 0, -0.3]} rotation={[-0.1, 1.4, 0.2]}>
              <boxGeometry args={[1.3, 0.1, 0.12]} />
              <meshStandardMaterial color="#92400e" roughness={0.7} />
            </mesh>
            <mesh position={[0.9, 0, -0.6]} rotation={[Math.PI / 2, 0, 0.5]}>
              <cylinderGeometry args={[0.2, 0.2, 0.55, 8]} />
              <meshStandardMaterial color="#b45309" roughness={0.6} />
            </mesh>
          </group>
        )}

        {/* Post-Tsunami Realistic Grounded Debris Field (Stage 6) */}
        {tsunamiStage === 6 && (
          <group position={[0, 0, 0]}>
            {/* Dark Wet Silt Mud Patches (Flush with ground at Y = -0.99) */}
            {[
              { pos: [-5.0, -0.99, -1.8], rx: 2.2, rz: 1.4 },
              { pos: [-8.2, -0.99, -2.4], rx: 1.8, rz: 1.2 },
              { pos: [-2.6, -0.99, -2.0], rx: 1.6, rz: 1.0 },
              { pos: [-4.8, -0.99, -0.8], rx: 2.0, rz: 1.1 }
            ].map((puddle, pi) => (
              <mesh key={`mud-patch-${pi}`} position={puddle.pos as [number, number, number]} rotation={[-Math.PI / 2, 0, pi * 0.5]}>
                <planeGeometry args={[puddle.rx, puddle.rz]} />
                <meshStandardMaterial color="#1e293b" roughness={0.15} metalness={0.4} />
              </mesh>
            ))}

            {/* Scattered Timber Planks Lying Flat on Ground (Y = -0.97) */}
            {[
              { pos: [-7.6, -0.97, -1.8], rotY: 0.4, size: [1.3, 0.03, 0.16] },
              { pos: [-5.6, -0.97, -2.6], rotY: 1.2, size: [1.6, 0.03, 0.15] },
              { pos: [-3.6, -0.97, -1.4], rotY: -0.6, size: [1.1, 0.03, 0.14] },
              { pos: [-1.8, -0.97, -2.2], rotY: 0.9, size: [1.4, 0.03, 0.16] }
            ].map((plank, pli) => (
              <mesh key={`plank-${pli}`} position={plank.pos as [number, number, number]} rotation={[0, plank.rotY, 0]}>
                <boxGeometry args={plank.size as [number, number, number]} />
                <meshStandardMaterial color={pli % 2 === 0 ? '#78350f' : '#92400e'} roughness={0.88} />
              </mesh>
            ))}

            {/* Driftwood Tree Log on Sand */}
            <mesh position={[-3.8, -0.94, -0.9]} rotation={[0, 0.6, Math.PI / 2]}>
              <cylinderGeometry args={[0.08, 0.11, 1.6, 8]} />
              <meshStandardMaterial color="#582900" roughness={0.9} />
            </mesh>

            {/* Tangled Green Fishing Net on Sand */}
            <mesh position={[-4.2, -0.98, -0.7]} rotation={[-Math.PI / 2, 0, 0.8]}>
              <circleGeometry args={[0.5, 12]} />
              <meshStandardMaterial color="#047857" roughness={0.9} transparent opacity={0.65} />
            </mesh>
          </group>
        )}

        {/* 9. REALISTIC TROPICAL PALM TREES (Solidly grounded on village turf) */}
        <PalmTree
          position={[-9.2, -1.0, -1.8]}
          scale={1.15}
          rotationY={0.4}
          lean={tsunamiStage >= 5 ? 0.28 : 0.12}
          isDamaged={tsunamiStage >= 5}
        />
        <PalmTree
          position={[-6.5, -1.0, -3.6]}
          scale={1.05}
          rotationY={1.2}
          lean={tsunamiStage >= 5 ? 0.25 : 0.12}
          isDamaged={tsunamiStage >= 5}
        />
        <PalmTree
          position={[-2.8, -1.0, -2.6]}
          scale={1.1}
          rotationY={2.1}
          lean={tsunamiStage >= 5 ? 0.2 : 0.08}
          isDamaged={tsunamiStage >= 5}
        />
        <PalmTree
          position={[-0.8, -1.0, -2.2]}
          scale={1.05}
          rotationY={0.8}
          lean={tsunamiStage >= 5 ? 0.18 : 0.1}
          isDamaged={tsunamiStage >= 5}
        />

        {/* Shoreline Palm Tree: Planted firmly on the coastal turf edge */}
        {tsunamiStage < 5 ? (
          <PalmTree position={[-8.8, -1.0, -0.9]} scale={1.2} rotationY={-0.6} lean={-0.16} />
        ) : (
          <FallenPalmTree position={[-8.8, -0.98, -0.9]} rotationY={0.35} scale={1.1} />
        )}

        {/* Coastal Ground Foliage */}
        <CoastalShrub position={[-7.5, -1.0, -1.8]} scale={1.1} />
        <CoastalShrub position={[-3.8, -1.0, -3.0]} scale={0.9} />
        {/* 10. MAJESTIC NATURAL COASTAL MOUNTAIN RIDGE & REALISTIC BNPB TES OUTPOST */}
        {/* A. Highland Pine Trees naturally scattered along the mountain ridge flanks */}
        <HighlandTree position={[2.2, getHillElevation(2.2, -3.2), -3.2]} scale={0.85} rotationY={0.5} />
        <HighlandTree position={[3.2, getHillElevation(3.2, -5.2), -5.2]} scale={0.9} rotationY={1.2} />
        <HighlandTree position={[7.2, getHillElevation(7.2, -2.8), -2.8]} scale={0.8} rotationY={2.1} />
        <HighlandTree position={[8.4, getHillElevation(8.4, -4.8), -4.8]} scale={0.85} rotationY={0.8} />
        <HighlandTree position={[4.2, getHillElevation(4.2, -2.4), -2.4]} scale={0.75} rotationY={1.7} />
        <HighlandTree position={[6.8, getHillElevation(6.8, -5.4), -5.4]} scale={0.7} rotationY={2.4} />
        <HighlandTree position={[3.6, getHillElevation(3.6, -4.6), -4.6]} scale={0.75} rotationY={0.3} />

        {/* B. Natural Low-Poly Rock Boulders embedded along the mountain flanks */}
        <mesh position={[4.0, getHillElevation(4.0, -3.0) + 0.05, -3.0]} rotation={[0.4, 0.5, 0.2]}>
          <dodecahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial color="#475569" roughness={0.88} />
        </mesh>
        <mesh position={[6.8, getHillElevation(6.8, -3.0) + 0.06, -3.0]} rotation={[-0.3, 0.7, 0.3]}>
          <dodecahedronGeometry args={[0.38, 0]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
        <mesh position={[7.6, getHillElevation(7.6, -4.6) + 0.05, -4.6]} rotation={[0.2, -0.3, 0.4]}>
          <dodecahedronGeometry args={[0.32, 0]} />
          <meshStandardMaterial color="#475569" roughness={0.88} />
        </mesh>

        {/* D. Summit Observation Terrace & Modern BNPB Evacuation Outpost (Scale 0.42) */}
        <group position={[6.0, getHillElevation(6.0, -4.2), -4.2]} scale={[0.42, 0.42, 0.42]}>
          {/* Deep Solid Reinforced Concrete Foundation Terrace Pad (Zero Overhang) */}
          <mesh position={[0, -0.15, 0]}>
            <boxGeometry args={[3.4, 0.45, 2.8]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.7} />
          </mesh>

          {/* Safety Perimeter Railing Posts & Bar */}
          <mesh position={[0, 0.45, 1.35]}>
            <boxGeometry args={[3.3, 0.04, 0.04]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.3} />
          </mesh>
          {[-1.5, -0.75, 0, 0.75, 1.5].map((rx, ri) => (
            <mesh key={`post-${ri}`} position={[rx, 0.25, 1.35]}>
              <cylinderGeometry args={[0.02, 0.02, 0.4, 6]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}

          {/* Modern BNPB TES Evacuation Building */}
          <group position={[-0.2, 0.16, -0.1]}>
            {/* Main Reinforced Wall Structure */}
            <mesh position={[0, 0.75, 0]}>
              <boxGeometry args={[2.3, 1.4, 1.9]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.35} />
            </mesh>
            {/* Modern Overhanging Flat Roof */}
            <mesh position={[0, 1.5, 0]}>
              <boxGeometry args={[2.7, 0.14, 2.3]} />
              <meshStandardMaterial color="#0284c7" roughness={0.4} />
            </mesh>
            {/* Solar Panels on Roof */}
            <mesh position={[0, 1.59, 0]}>
              <boxGeometry args={[2.1, 0.04, 1.7]} />
              <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
            </mesh>
            {/* Panoramic Safety Windows */}
            <mesh position={[0, 0.8, 0.98]}>
              <boxGeometry args={[1.7, 0.65, 0.04]} />
              <meshStandardMaterial color="#38bdf8" roughness={0.1} transparent opacity={0.75} />
            </mesh>
            {/* Red Cross Medical / Rescue Emblem */}
            <mesh position={[0, 1.25, 0.99]}>
              <boxGeometry args={[0.3, 0.09, 0.02]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0, 1.25, 0.99]}>
              <boxGeometry args={[0.09, 0.3, 0.02]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>

            {/* Evacuees Silhouettes Gathered Safely on Terrace */}
            {[-0.5, 0.5, 0].map((ex, ei) => (
              <group key={`evac-${ei}`} position={[ex, 0, 1.15]}>
                <mesh position={[0, 0.3, 0]}>
                  <cylinderGeometry args={[0.08, 0.1, 0.55, 6]} />
                  <meshStandardMaterial color="#0284c7" />
                </mesh>
                <mesh position={[0, 0.65, 0]}>
                  <sphereGeometry args={[0.09, 8, 8]} />
                  <meshStandardMaterial color="#fcd34d" />
                </mesh>
              </group>
            ))}
          </group>

          {/* BMKG EARLY WARNING SIREN TOWER */}
          <group position={[1.2, 0.16, 0.6]}>
            <mesh position={[0, 1.1, 0]}>
              <cylinderGeometry args={[0.05, 0.09, 2.2, 6]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.3} />
            </mesh>
            {[0, 1, 2, 3].map((s) => (
              <mesh key={`siren-${s}`} position={[0, 2.1, 0]} rotation={[0, (s * Math.PI) / 2, 0.2]}>
                <coneGeometry args={[0.13, 0.35, 8]} />
                <meshStandardMaterial color="#eab308" />
              </mesh>
            ))}
            <mesh position={[0, 2.4, 0]}>
              <sphereGeometry args={[0.11, 8, 8]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={tsunamiStage >= 2 ? 5.0 : 1.0} />
            </mesh>
          </group>

          {/* INDONESIAN MERAH PUTIH FLAG */}
          <group position={[-1.2, 0.16, 0.6]}>
            <mesh position={[0, 1.0, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 2.0]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
            </mesh>
            <mesh ref={flagRef} position={[0.38, 1.7, 0]}>
              <boxGeometry args={[0.65, 0.36, 0.02]} />
              <meshStandardMaterial color="#dc2626" />
            </mesh>
            <mesh position={[0.38, 1.5, 0]}>
              <boxGeometry args={[0.65, 0.18, 0.022]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        </group>
      </group>

      {/* ── CUTAWAY LABELS (DYNAMIC PER-STAGE DISPLAY DIRECTLY ON FRONT FACE) ── */}
      {showCutaway && (
        <group position={[0, 0, 10.35]}>
          {/* Main Top Banner Process Status Badge */}
          <Html position={[0, -0.6, 0]} center distanceFactor={14}>
            {tsunamiStage === 0 ? (
              <div className="px-3.5 py-1.5 rounded-xl bg-zinc-900 text-white font-bold text-[11px] tracking-wider border border-zinc-700 shadow-md whitespace-nowrap pointer-events-none flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>AKUMULASI REGANGAN: Lempeng Samudra Menunjam &amp; Lempeng Benua Terkunci</span>
              </div>
            ) : tsunamiStage === 1 ? (
              <div className="px-3.5 py-1.5 rounded-xl bg-red-950 text-white font-black text-[11px] tracking-wider border border-red-600 shadow-md whitespace-nowrap pointer-events-none flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>PELEPASAN GEMPA MEGATHRUST: Lempeng Benua Terpelanting &amp; Kolom Air Terangkat!</span>
              </div>
            ) : tsunamiStage === 2 ? (
              <div className="px-3.5 py-1.5 rounded-xl bg-amber-950 text-amber-200 font-black text-[11px] tracking-wider border border-amber-600 shadow-md whitespace-nowrap pointer-events-none flex items-center gap-2">
                <span>🌊 PALUNG GELOMBANG: Air Pesisir Tersedot Kuat Menuju Palung Patahan (Surut Mendadak)</span>
              </div>
            ) : tsunamiStage === 3 ? (
              <div className="px-3.5 py-1.5 rounded-xl bg-zinc-900 text-cyan-200 font-black text-[11px] tracking-wider border border-zinc-700 shadow-md whitespace-nowrap pointer-events-none flex items-center gap-2">
                <span>⚡ RAMBATAN ENERGI: Gelombang Tsunami Memadat &amp; Meninggi Menuju Daratan (Shoaling)</span>
              </div>
            ) : tsunamiStage === 4 ? (
              <div className="px-3.5 py-1.5 rounded-xl bg-red-950 text-white font-black text-[11px] tracking-wider border border-red-600 shadow-md whitespace-nowrap pointer-events-none flex items-center gap-2">
                <span>💥 HANTAMAN TSUNAMI: Energi Kinetik Menerjang Garis Pantai &amp; Merusak Permukiman</span>
              </div>
            ) : tsunamiStage === 5 ? (
              <div className="px-3.5 py-1.5 rounded-xl bg-blue-950 text-blue-200 font-black text-[11px] tracking-wider border border-blue-600 shadow-md whitespace-nowrap pointer-events-none flex items-center gap-2">
                <span>🌊 GENANGAN DARATAN: Gelombang Menggenangi Dataran Rendah hingga Kaki Bukit</span>
              </div>
            ) : (
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950 text-white font-bold text-[11px] tracking-wider border border-emerald-600 shadow-md whitespace-nowrap pointer-events-none flex items-center gap-2">
                <span>✅ PASCABENCANA: Air Surut Kembali, Tempat Evakuasi Sementara (TES) Menyelamatkan Warga</span>
              </div>
            )}
          </Html>

          {/* Left Plate Label */}
          <Html position={[-5.8, -2.5, 0]} center distanceFactor={14}>
            <div className="px-2.5 py-1.5 rounded-xl bg-zinc-900 text-cyan-200 font-bold text-[10px] tracking-wider border border-zinc-700 shadow-md whitespace-nowrap pointer-events-none">
              🌊 Lempeng Samudra (Subduksi ~6 cm/th)
            </div>
          </Html>

          {/* Center Fault Label */}
          <Html position={[0.85, -3.2, 0]} center distanceFactor={14}>
            <div className={`px-2.5 py-1.5 rounded-xl font-bold text-[10px] tracking-wider border shadow-md whitespace-nowrap pointer-events-none ${
              tsunamiStage >= 1
                ? 'bg-red-950 text-white border-red-600'
                : 'bg-zinc-900 text-amber-200 border-zinc-700'
            }`}>
              {tsunamiStage >= 1 ? '⚡ Patahan Megathrust (Slipped/Ruptured)' : '🔒 Zona Terkunci (Locked Fault)'}
            </div>
          </Html>

          {/* Right Plate Label */}
          <Html position={[5.8, -2.2, 0]} center distanceFactor={14}>
            <div className="px-2.5 py-1.5 rounded-xl bg-zinc-900 text-amber-200 font-bold text-[10px] tracking-wider border border-zinc-700 shadow-md whitespace-nowrap pointer-events-none">
              {tsunamiStage === 0 ? '🏔️ Lempeng Benua (Regangan Terkunci)' : '🏔️ Lempeng Benua (Terangkat / Rebound)'}
            </div>
          </Html>
        </group>
      )}

      {/* Interactive Evacuation Action Prompt Button */}
      <Html position={[6.0, getHillElevation(6.0, -4.2) + 1.2, -4.2]} center distanceFactor={8.5}>
        <button
          onClick={() => {
            soundEngine.playClick();
            if (onActionClick) onActionClick('EVACUATE_HILL');
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md cursor-pointer hover:scale-105 transition-all whitespace-nowrap border-2 border-white pointer-events-auto"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white" />
          <span>EVAKUASI KE BUKIT TINGGI (&gt;20 METER)</span>
        </button>
      </Html>
    </group>
  );
};
