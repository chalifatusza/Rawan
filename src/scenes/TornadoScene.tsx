import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { soundEngine } from '../audio/soundEngine';
import { 
  Wind, 
  AlertTriangle, 
  ShieldCheck, 
  AlertOctagon, 
  CloudLightning,
  Zap,
  Radio,
  Truck,
  HeartPulse,
  Sparkles
} from 'lucide-react';

export type TornadoStage = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface TornadoSceneProps {
  isSimulating?: boolean;
  tornadoStage?: TornadoStage;
  onActionClick?: (actionId: string) => void;
  showCutaway?: boolean;
}

// ─── ATMOSPHERIC SKY & FOG SETUP (Crisp & Bright, Never Pitch Black) ───
const TornadoAtmosphere: React.FC<{ stage: TornadoStage }> = ({ stage }) => {
  const { scene } = useThree();

  useEffect(() => {
    const isStormy = stage >= 1 && stage <= 5;
    const isAfter = stage === 6;

    const skyColor = isStormy
      ? new THREE.Color(stage >= 3 ? '#1e293b' : '#334155') // Atmospheric storm slate (bright and clear)
      : isAfter
      ? new THREE.Color('#38bdf8') // Fresh clear post-storm sky
      : new THREE.Color('#38bdf8'); // Clear bright sunny sky

    scene.background = skyColor;
    scene.fog = isStormy
      ? new THREE.Fog(stage >= 3 ? '#1e293b' : '#334155', 38, 105)
      : isAfter
      ? new THREE.Fog('#38bdf8', 42, 115)
      : new THREE.Fog('#38bdf8', 45, 120);

    return () => {
      scene.background = null;
      scene.fog = null;
    };
  }, [scene, stage]);

  return null;
};

// ─── REALISTIC GABLE ROOF GEOMETRY HELPER ───
function createGableRoofGeometry(width: number, height: number, length: number, overhang = 0.2) {
  const halfW = width / 2 + overhang;
  const shape = new THREE.Shape();
  shape.moveTo(-halfW, 0);
  shape.lineTo(0, height);
  shape.lineTo(halfW, 0);
  shape.closePath();

  const extrudeSettings = {
    steps: 1,
    depth: length + overhang * 2,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.04,
    bevelSegments: 1,
  };
  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.translate(0, 0, -(length + overhang * 2) / 2);
  return geo;
}

// ─── HUMAN CHARACTER (Drop, Cover, Hold Or Rescue Worker) ───
const HumanFigure: React.FC<{
  position: [number, number, number];
  pose?: 'STAND' | 'CROUCH' | 'RESCUE';
  shirtColor?: string;
  rotationY?: number;
}> = ({ position, pose = 'STAND', shirtColor = '#0284c7', rotationY = 0 }) => {
  if (pose === 'CROUCH') {
    return (
      <group position={position} rotation={[0, rotationY, 0]}>
        <mesh position={[0, 0.26, 0.1]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#fed7aa" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.32, 0.1]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.24, 0.07, 0.13]} />
          <meshStandardMaterial color={shirtColor} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.18, 0]} rotation={[0.6, 0, 0]}>
          <boxGeometry args={[0.2, 0.22, 0.14]} />
          <meshStandardMaterial color={shirtColor} roughness={0.6} />
        </mesh>
        <mesh position={[-0.07, 0.06, -0.06]}>
          <boxGeometry args={[0.07, 0.1, 0.16]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0.07, 0.06, -0.06]}>
          <boxGeometry args={[0.07, 0.1, 0.16]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
    );
  }

  // Standing / Rescue Worker with Safety Helmet
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Head */}
      <mesh position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#fed7aa" roughness={0.5} />
      </mesh>
      {/* Safety Helmet if rescue */}
      {pose === 'RESCUE' && (
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.12, 8, 6]} />
          <meshStandardMaterial color="#facc15" roughness={0.3} metalness={0.2} />
        </mesh>
      )}
      {/* Torso / Safety Vest */}
      <mesh position={[0, 0.44, 0]}>
        <boxGeometry args={[0.24, 0.32, 0.14]} />
        <meshStandardMaterial color={pose === 'RESCUE' ? '#ea580c' : shirtColor} roughness={0.6} />
      </mesh>
      {pose === 'RESCUE' && (
        <mesh position={[0, 0.44, 0.075]}>
          <boxGeometry args={[0.25, 0.06, 0.01]} />
          <meshStandardMaterial color="#fef08a" />
        </mesh>
      )}
      {/* Legs */}
      <mesh position={[-0.07, 0.15, 0]}>
        <boxGeometry args={[0.08, 0.3, 0.1]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.07, 0.15, 0]}>
        <boxGeometry args={[0.08, 0.3, 0.1]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
};

// ─── RESIDENTIAL SUBURBAN HOUSE (PROPER GABLE ROOF, PORCH, SAFE ROOM CUTAWAY & WRECKAGE) ───
const SuburbanHouse: React.FC<{
  position: [number, number, number];
  rotationY?: number;
  wallColor?: string;
  roofColor?: string;
  damageLevel?: 0 | 1 | 2 | 3; // 0=Intact, 1=Minor, 2=Severe (Torn Roof), 3=Complete Wreckage
  isSafeRoomDemo?: boolean;
  showCutaway?: boolean;
}> = ({
  position,
  rotationY = 0,
  wallColor = '#f8fafc',
  roofColor = '#c2410c',
  damageLevel = 0,
  isSafeRoomDemo = false,
  showCutaway = false
}) => {
  const roofGeom = useMemo(() => createGableRoofGeometry(3.6, 1.1, 2.8, 0.25), []);
  const showInterior = isSafeRoomDemo && showCutaway;
  const isSeverelyDamaged = damageLevel >= 2;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Concrete Foundation Slab */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 0.2, 3.0]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} />
      </mesh>

      {/* ─── WALL STRUCTURE ─── */}
      {showInterior ? (
        // Cutaway Architectural View: Back & Sides closed, Front open so inside is crystal clear
        <group>
          <mesh position={[0, 1.0, -1.35]} castShadow receiveShadow>
            <boxGeometry args={[3.6, 1.8, 0.15]} />
            <meshStandardMaterial color={wallColor} roughness={0.6} />
          </mesh>
          <mesh position={[-1.75, 1.0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.15, 1.8, 2.85]} />
            <meshStandardMaterial color={wallColor} roughness={0.6} />
          </mesh>
          <mesh position={[1.75, 1.0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.15, 1.8, 2.85]} />
            <meshStandardMaterial color={wallColor} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.28, 1.35]} castShadow>
            <boxGeometry args={[3.6, 0.36, 0.15]} />
            <meshStandardMaterial color={wallColor} roughness={0.6} />
          </mesh>
          <mesh position={[-1.75, 1.0, 1.35]}>
            <boxGeometry args={[0.16, 1.8, 0.16]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[1.75, 1.0, 1.35]}>
            <boxGeometry args={[0.16, 1.8, 0.16]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </group>
      ) : isSeverelyDamaged ? (
        // Ripped Damaged Walls with Cracks and Broken Sections
        <group>
          <mesh position={[0, 0.9, -1.35]} rotation={[0, 0, 0.02]} castShadow>
            <boxGeometry args={[3.6, 1.6, 0.15]} />
            <meshStandardMaterial color={wallColor} roughness={0.8} />
          </mesh>
          <mesh position={[-1.75, 0.8, 0]} rotation={[0.04, 0, 0]} castShadow>
            <boxGeometry args={[0.15, 1.4, 2.8]} />
            <meshStandardMaterial color={wallColor} roughness={0.8} />
          </mesh>
          <mesh position={[1.75, 0.65, 0]} rotation={[-0.03, 0, 0]} castShadow>
            <boxGeometry args={[0.15, 1.1, 2.8]} />
            <meshStandardMaterial color={wallColor} roughness={0.8} />
          </mesh>
          <mesh position={[0.7, 0.6, 1.35]} castShadow>
            <boxGeometry args={[2.0, 1.0, 0.15]} />
            <meshStandardMaterial color={wallColor} roughness={0.8} />
          </mesh>
          {/* Exposed Wooden Ceiling Joists & Trusses */}
          {[-1.2, -0.6, 0, 0.6, 1.2].map((jx, i) => (
            <mesh key={`joist-${i}`} position={[jx, 1.82, (i % 2 === 0 ? 0.2 : -0.2)]} rotation={[0, 0, (i % 2 === 0 ? 0.08 : -0.06)]}>
              <boxGeometry args={[0.08, 0.1, 2.9]} />
              <meshStandardMaterial color="#78350f" roughness={0.9} />
            </mesh>
          ))}
          {/* Broken Front Door Hanging on Hinge */}
          <mesh position={[-0.9, 0.5, 1.4]} rotation={[0, 0.8, 0.3]}>
            <boxGeometry args={[0.6, 1.1, 0.04]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </mesh>
        </group>
      ) : (
        // Full Solid Exterior Walls
        <group>
          <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.6, 1.8, 2.8]} />
            <meshStandardMaterial color={wallColor} roughness={0.6} />
          </mesh>
          {/* Front Entrance Door */}
          <mesh position={[0.9, 0.8, 1.41]}>
            <boxGeometry args={[0.6, 1.2, 0.04]} />
            <meshStandardMaterial color="#78350f" roughness={0.5} />
          </mesh>
          {/* Doorknob */}
          <mesh position={[1.12, 0.8, 1.44]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <meshStandardMaterial color="#facc15" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Front Windows */}
          {[-1.0, -0.1].map((wx, i) => (
            <group key={`win-${i}`} position={[wx, 1.05, 1.41]}>
              <mesh>
                <boxGeometry args={[0.75, 0.75, 0.04]} />
                <meshStandardMaterial 
                  color="#38bdf8" 
                  roughness={0.1} 
                  metalness={0.8} 
                  wireframe={damageLevel === 1} 
                />
              </mesh>
              <mesh position={[0, 0, 0.01]}>
                <boxGeometry args={[0.82, 0.82, 0.02]} />
                <meshStandardMaterial color="#334155" />
              </mesh>
            </group>
          ))}
          {/* Front Porch Canopy */}
          <group position={[0.9, 1.55, 1.75]}>
            <mesh castShadow>
              <boxGeometry args={[1.1, 0.08, 0.7]} />
              <meshStandardMaterial color={roofColor} roughness={0.6} />
            </mesh>
            <mesh position={[-0.45, -0.72, 0.25]} castShadow>
              <cylinderGeometry args={[0.035, 0.035, 1.45, 6]} />
              <meshStandardMaterial color="#e2e8f0" />
            </mesh>
            <mesh position={[0.45, -0.72, 0.25]} castShadow>
              <cylinderGeometry args={[0.035, 0.035, 1.45, 6]} />
              <meshStandardMaterial color="#e2e8f0" />
            </mesh>
          </group>
        </group>
      )}

      {/* ─── GABLE ROOF / RIPPED ROOF SECTION ─── */}
      {isSeverelyDamaged ? (
        // Half Ripped Off Roof Tilted & Blown to the Side
        <group position={[1.4, 1.6, 0.4]} rotation={[0.2, 0.35, -0.42]}>
          <mesh geometry={roofGeom} scale={[0.55, 1.0, 0.9]} castShadow>
            <meshStandardMaterial color={roofColor} roughness={0.6} />
          </mesh>
        </group>
      ) : (
        // Regular Roof (or partly tilted if minor damage)
        <group 
          position={[0, 1.9, 0]} 
          rotation={[0, 0, damageLevel === 1 ? 0.15 : 0]}
        >
          <mesh 
            geometry={roofGeom} 
            position={[damageLevel === 1 ? 0.2 : 0, damageLevel === 1 ? 0.08 : 0, 0]} 
            castShadow 
            receiveShadow
          >
            <meshStandardMaterial 
              color={roofColor} 
              roughness={0.55} 
              transparent={showInterior} 
              opacity={showInterior ? 0.35 : 1.0} 
            />
          </mesh>
        </group>
      )}

      {/* ─── INTERIOR CENTRAL SAFE ROOM (BUNKER / WINDOWLESS INNER ROOM) ─── */}
      {(showInterior || (isSafeRoomDemo && isSeverelyDamaged)) && (
        <group position={[0, 0.2, 0]}>
          {/* Reinforced Concrete Safe Room Enclosure */}
          <mesh position={[0, 0.7, 0]} castShadow>
            <boxGeometry args={[1.5, 1.2, 1.3]} />
            <meshStandardMaterial 
              color="#0284c7" 
              emissive="#0369a1" 
              emissiveIntensity={0.5} 
              transparent 
              opacity={0.85} 
            />
          </mesh>

          {/* Heavy Solid Wood Protection Table */}
          <mesh position={[0, 0.48, 0]} castShadow>
            <boxGeometry args={[1.0, 0.08, 0.9]} />
            <meshStandardMaterial color="#451a03" roughness={0.8} />
          </mesh>
          {[[-0.42, -0.38], [0.42, -0.38], [-0.42, 0.38], [0.42, 0.38]].map(([tx, tz], i) => (
            <mesh key={`tleg-${i}`} position={[tx, 0.24, tz]}>
              <cylinderGeometry args={[0.035, 0.035, 0.46, 6]} />
              <meshStandardMaterial color="#2d1708" />
            </mesh>
          ))}

          {/* Sheltered Family Members Under Table */}
          <HumanFigure position={[-0.2, 0.02, 0]} pose="CROUCH" shirtColor="#10b981" />
          <HumanFigure position={[0.2, 0.02, 0]} pose="CROUCH" shirtColor="#ec4899" />

          {/* Emergency First Aid Kit Backpack */}
          <mesh position={[-0.45, 0.14, 0.25]} rotation={[0, 0.3, 0]}>
            <boxGeometry args={[0.22, 0.24, 0.14]} />
            <meshStandardMaterial color="#ef4444" roughness={0.4} />
          </mesh>

          {/* Emergency Battery Radio & Flashlight */}
          <mesh position={[0, 0.56, 0]}>
            <boxGeometry args={[0.16, 0.09, 0.07]} />
            <meshStandardMaterial color="#eab308" />
          </mesh>
          <mesh position={[0.25, 0.54, 0.1]} rotation={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.14, 6]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>

          {/* Protective Safety Shield Aura */}
          <mesh position={[0, 0.6, 0]}>
            <sphereGeometry args={[1.1, 14, 14]} />
            <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.5} />
          </mesh>
        </group>
      )}
    </group>
  );
};

// ─── PARKED / OVERTURNED VEHICLE ───
const SuburbanCar: React.FC<{
  position: [number, number, number];
  rotationY?: number;
  color?: string;
  isFlipped?: boolean;
}> = ({
  position,
  rotationY = 0,
  color = '#2563eb',
  isFlipped = false
}) => (
  <group 
    position={position} 
    rotation={[isFlipped ? 1.4 : 0, rotationY, isFlipped ? 0.6 : 0]}
  >
    <mesh position={[0, 0.25, 0]} castShadow>
      <boxGeometry args={[1.2, 0.32, 2.4]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
    </mesh>
    <mesh position={[0, 0.52, -0.1]} castShadow>
      <boxGeometry args={[1.05, 0.3, 1.3]} />
      <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.8} />
    </mesh>
    {[[-0.62, 0.14, 0.7], [0.62, 0.14, 0.7], [-0.62, 0.14, -0.7], [0.62, 0.14, -0.7]].map((w, i) => (
      <mesh key={`cw-${i}`} position={w as any} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.14, 0.14, 0.1, 8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    ))}
  </group>
);

// ─── BPBD / SAR EMERGENCY RESCUE VEHICLE (STAGE 6) ───
const RescueVehicle: React.FC<{ position: [number, number, number]; rotationY?: number }> = ({ position, rotationY = 0 }) => (
  <group position={position} rotation={[0, rotationY, 0]}>
    {/* Truck Body */}
    <mesh position={[0, 0.45, 0]} castShadow>
      <boxGeometry args={[1.3, 0.65, 2.6]} />
      <meshStandardMaterial color="#ea580c" roughness={0.4} />
    </mesh>
    {/* White Cabin Top */}
    <mesh position={[0, 0.88, -0.3]} castShadow>
      <boxGeometry args={[1.15, 0.4, 1.4]} />
      <meshStandardMaterial color="#ffffff" roughness={0.4} />
    </mesh>
    {/* Windshield */}
    <mesh position={[0, 0.88, 0.45]} rotation={[0.3, 0, 0]}>
      <boxGeometry args={[1.05, 0.32, 0.05]} />
      <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} />
    </mesh>
    {/* Lightbar */}
    <mesh position={[0, 1.12, -0.1]}>
      <boxGeometry args={[0.7, 0.09, 0.16]} />
      <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={3.0} />
    </mesh>
    <pointLight position={[0, 1.3, -0.1]} color="#38bdf8" intensity={4.5} distance={8} />
    {/* Wheels */}
    {[[-0.66, 0.2, 0.75], [0.66, 0.2, 0.75], [-0.66, 0.2, -0.75], [0.66, 0.2, -0.75]].map((w, i) => (
      <mesh key={`rw-${i}`} position={w as any} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.14, 10]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>
    ))}
  </group>
);

// ─── BPBD / PMI DISASTER RELIEF TENT (Tenda Posko Pengungsian) ───
const ReliefTent: React.FC<{ position: [number, number, number]; rotationY?: number }> = ({ position, rotationY = 0 }) => {
  const tentRoofGeom = useMemo(() => createGableRoofGeometry(2.4, 0.7, 3.2, 0.1), []);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* 4 Steel Corner Frame Posts */}
      {[[-1.1, -1.5], [1.1, -1.5], [-1.1, 1.5], [1.1, 1.5]].map(([tx, tz], i) => (
        <mesh key={`tpost-${i}`} position={[tx, 0.6, tz]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 1.2, 6]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
      ))}

      {/* Main Orange Waterproof Canvas Wall Body */}
      {/* Back Wall */}
      <mesh position={[0, 0.6, -1.55]} castShadow>
        <boxGeometry args={[2.3, 1.2, 0.04]} />
        <meshStandardMaterial color="#ea580c" roughness={0.7} />
      </mesh>
      {/* Left Wall */}
      <mesh position={[-1.15, 0.6, 0]} castShadow>
        <boxGeometry args={[0.04, 1.2, 3.1]} />
        <meshStandardMaterial color="#ea580c" roughness={0.7} />
      </mesh>
      {/* Right Wall */}
      <mesh position={[1.15, 0.6, 0]} castShadow>
        <boxGeometry args={[0.04, 1.2, 3.1]} />
        <meshStandardMaterial color="#ea580c" roughness={0.7} />
      </mesh>

      {/* Pitched Canvas Roof */}
      <mesh geometry={tentRoofGeom} position={[0, 1.2, 0]} castShadow>
        <meshStandardMaterial color="#ea580c" roughness={0.65} />
      </mesh>

      {/* Front Entrance Canopy Header Signboard */}
      <group position={[0, 1.1, 1.56]}>
        <mesh>
          <boxGeometry args={[2.1, 0.25, 0.04]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* White / Red Medical Badge */}
        <mesh position={[-0.8, 0, 0.025]}>
          <boxGeometry args={[0.18, 0.18, 0.01]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.8, 0, 0.03]}>
          <boxGeometry args={[0.12, 0.04, 0.01]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        <mesh position={[-0.8, 0, 0.03]}>
          <boxGeometry args={[0.04, 0.12, 0.01]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* Interior Medical Cot / Stretcher */}
      <group position={[0, 0.2, 0]}>
        <mesh position={[0, 0.1, 0]} castShadow>
          <boxGeometry args={[0.8, 0.08, 2.0]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        {[[-0.35, -0.8], [0.35, -0.8], [-0.35, 0.8], [0.35, 0.8]].map(([cx, cz], i) => (
          <mesh key={`cleg-${i}`} position={[cx, 0.05, cz]}>
            <cylinderGeometry args={[0.02, 0.02, 0.2, 6]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Aid Supply Emergency Boxes */}
      <mesh position={[0.65, 0.18, 0.9]} castShadow>
        <boxGeometry args={[0.4, 0.35, 0.4]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.6} />
      </mesh>
      <mesh position={[0.65, 0.48, 0.9]} castShadow>
        <boxGeometry args={[0.35, 0.25, 0.35]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
      </mesh>
    </group>
  );
};

// ─── SHADE TREE (NORMAL, BENDING OR SNAPPED TRUNK) ───
const SuburbTree: React.FC<{
  position: [number, number, number];
  scale?: number;
  tiltZ?: number;
  tiltX?: number;
  isBroken?: boolean;
}> = ({ position, scale = 1, tiltZ = 0, tiltX = 0, isBroken = false }) => {
  if (isBroken) {
    return (
      <group position={position} scale={[scale, scale, scale]}>
        {/* Broken Jagged Stump */}
        <mesh position={[0, 0.45, 0]} rotation={[0.1, 0, 0.15]} castShadow>
          <cylinderGeometry args={[0.12, 0.22, 0.9, 7]} />
          <meshStandardMaterial color="#451a03" roughness={0.95} />
        </mesh>
        {/* Fallen Crown & Limbs on Lawn */}
        <group position={[0.8, 0.35, 0.6]} rotation={[1.4, 0.3, 0.8]}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.13, 1.2, 6]} />
            <meshStandardMaterial color="#451a03" roughness={0.95} />
          </mesh>
          <mesh position={[0, 1.1, 0]} castShadow>
            <sphereGeometry args={[0.75, 8, 6]} />
            <meshStandardMaterial color="#14532d" roughness={0.8} />
          </mesh>
          <mesh position={[0.3, 1.3, 0.2]} castShadow>
            <sphereGeometry args={[0.55, 6, 6]} />
            <meshStandardMaterial color="#166534" roughness={0.8} />
          </mesh>
        </group>
      </group>
    );
  }

  return (
    <group position={position} scale={[scale, scale, scale]} rotation={[tiltX, 0, tiltZ]}>
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.2, 1.7, 8]} />
        <meshStandardMaterial color="#451a03" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.1, 0]} castShadow>
        <sphereGeometry args={[1.05, 10, 8]} />
        <meshStandardMaterial color="#15803d" roughness={0.7} />
      </mesh>
      <mesh position={[-0.35, 2.45, 0.25]} castShadow>
        <sphereGeometry args={[0.8, 8, 8]} />
        <meshStandardMaterial color="#166534" roughness={0.7} />
      </mesh>
      <mesh position={[0.35, 2.35, -0.25]} castShadow>
        <sphereGeometry args={[0.85, 8, 8]} />
        <meshStandardMaterial color="#14532d" roughness={0.7} />
      </mesh>
    </group>
  );
};

// ─── POWER UTILITY POLE & OVERHEAD WIRES ───
const UtilityPole: React.FC<{
  position: [number, number, number];
  isSparking?: boolean;
  sway?: number;
  isFallen?: boolean;
}> = ({ position, isSparking = false, sway = 0, isFallen = false }) => (
  <group 
    position={position} 
    rotation={[isFallen ? 0.35 : 0, 0, isFallen ? -0.7 : sway]}
  >
    <mesh position={[0, 2.2, 0]} castShadow>
      <cylinderGeometry args={[0.07, 0.11, 4.4, 8]} />
      <meshStandardMaterial color="#64748b" roughness={0.7} />
    </mesh>
    <mesh position={[0, 4.1, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <boxGeometry args={[0.07, 1.3, 0.08]} />
      <meshStandardMaterial color="#475569" roughness={0.6} />
    </mesh>
    {[-0.55, 0, 0.55].map((iz, i) => (
      <mesh key={`ins-${i}`} position={[0, 4.2, iz]}>
        <cylinderGeometry args={[0.03, 0.04, 0.14, 6]} />
        <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.6} />
      </mesh>
    ))}
    <mesh position={[0.22, 3.4, 0]} castShadow>
      <cylinderGeometry args={[0.16, 0.16, 0.55, 10]} />
      <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.4} />
    </mesh>
    {isSparking && (
      <pointLight position={[0.25, 3.5, 0]} color="#38bdf8" intensity={12.0 + Math.random() * 8.0} distance={10} />
    )}
  </group>
);

// ─── SCATTERED DEBRIS WRECKAGE ITEMS (ROOF ZINC, PLANKS, BRICKS) ───
const WreckageDebrisField: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;

  return (
    <group position={[0, 0.03, 0]}>
      {/* Bent Corrugated Zinc Roofing Sheets */}
      {[
        [-1.5, 0.04, 0.6, 0.3, 0.4, 0.1],
        [1.8, 0.04, -1.2, -0.2, 0.8, -0.15],
        [3.5, 0.04, 1.4, 0.1, -0.5, 0.25],
        [-4.2, 0.04, -0.8, -0.3, 0.2, 0.1],
        [5.2, 0.04, -3.2, 0.4, 1.2, -0.2],
        [-0.5, 0.04, 2.2, -0.1, -0.8, 0.3]
      ].map(([x, y, z, rx, ry, rz], i) => (
        <mesh key={`zinc-${i}`} position={[x, y, z]} rotation={[rx, ry, rz]} castShadow>
          <boxGeometry args={[1.2, 0.02, 0.7]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.65} roughness={0.35} />
        </mesh>
      ))}

      {/* Scattered Timber Wood Planks & Broken Studs */}
      {[
        [0.2, 0.03, 0.8, 0, 0.6, 0],
        [-2.0, 0.03, -1.5, 0, -0.4, 0],
        [2.6, 0.03, -0.5, 0, 1.1, 0],
        [4.8, 0.03, 0.3, 0, -0.9, 0],
        [-3.8, 0.03, 1.6, 0, 0.3, 0],
        [1.2, 0.03, -3.5, 0, 0.8, 0]
      ].map(([x, y, z, rx, ry, rz], i) => (
        <mesh key={`plank-${i}`} position={[x, y, z]} rotation={[rx, ry, rz]} castShadow>
          <boxGeometry args={[1.5, 0.06, 0.12]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
      ))}

      {/* Terracotta Clay Shards Piles */}
      {[
        [1.5, 0.02, -3.8],
        [3.0, 0.02, -3.5],
        [-1.0, 0.02, 1.2],
        [6.2, 0.02, -2.8]
      ].map(([x, y, z], i) => (
        <group key={`shards-${i}`} position={[x, y, z]}>
          {[-0.2, 0, 0.2].map((ox, j) => (
            <mesh key={`sh-${j}`} position={[ox, 0.02, (j % 2 === 0 ? 0.1 : -0.1)]} rotation={[0.2, j * 1.2, 0]}>
              <boxGeometry args={[0.25, 0.03, 0.2]} />
              <meshStandardMaterial color="#c2410c" roughness={0.7} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Hazard Safety Cones along dangerous area */}
      {[
        [-2.8, 0.18, -1.2],
        [-1.8, 0.18, -1.0],
        [-0.8, 0.18, -0.8]
      ].map(([cx, cy, cz], i) => (
        <group key={`cone-${i}`} position={[cx, cy, cz]}>
          <mesh>
            <coneGeometry args={[0.12, 0.36, 8]} />
            <meshStandardMaterial color="#ea580c" roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.02, 0]}>
            <cylinderGeometry args={[0.08, 0.09, 0.06, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ─── SUPERCELL CUMULONIMBUS CONTINUOUS STORM CANOPY ───
const SupercellCanopy: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  return (
    <group position={[0, 8.4, 0]}>
      {/* Dense Overcast Cloud Base Deck Covering Upper Sky */}
      {[
        [-10.0, 0.6, -3.0, 4.2, 1.4, 3.8, '#1e293b'],
        [-6.5, 0.4, 2.5, 4.5, 1.5, 4.0, '#0f172a'],
        [-3.0, 0.8, -2.0, 4.8, 1.6, 4.2, '#1e293b'],
        [0.0, 0.5, 0.0, 5.2, 1.7, 4.8, '#0f172a'],
        [3.5, 0.7, -2.5, 4.6, 1.5, 4.0, '#1e293b'],
        [7.0, 0.3, 2.0, 4.5, 1.4, 4.2, '#0f172a'],
        [10.5, 0.5, -2.0, 4.0, 1.3, 3.6, '#1e293b'],
        [-7.5, 1.2, -4.5, 4.0, 1.5, 3.5, '#334155'],
        [-1.5, 1.4, 3.5, 4.2, 1.6, 4.0, '#1e293b'],
        [4.5, 1.1, 3.2, 4.4, 1.5, 3.8, '#334155'],
        [8.0, 1.3, -4.0, 3.8, 1.4, 3.6, '#1e293b'],
        [-4.5, 0.9, 0.5, 4.6, 1.5, 4.2, '#0f172a'],
        [2.0, 0.8, 0.8, 4.8, 1.6, 4.4, '#1e293b']
      ].map(([cx, cy, cz, sx, sy, sz, color], i) => (
        <mesh key={`canopy-${i}`} position={[cx as number, cy as number, cz as number]} scale={[sx as number, sy as number, sz as number]}>
          <sphereGeometry args={[1.0, 12, 10]} />
          <meshStandardMaterial color={color as string} roughness={0.96} />
        </mesh>
      ))}
    </group>
  );
};

// ─── MAIN TORNADO SCENE COMPONENT ───
export const TornadoScene: React.FC<TornadoSceneProps> = ({
  isSimulating = true,
  tornadoStage = 0,
  onActionClick,
  showCutaway: externalCutaway
}) => {
  const [internalShowCutaway] = useState(true);
  const showCutaway = externalCutaway !== undefined ? externalCutaway : internalShowCutaway;

  // ─── REFS ───
  const dioramaGroupRef     = useRef<THREE.Group>(null);
  const vortexGroupRef      = useRef<THREE.Group>(null);
  const innerFunnelMeshRef  = useRef<THREE.Mesh>(null);
  const outerFunnelMeshRef  = useRef<THREE.Mesh>(null);
  const wallCloudRef        = useRef<THREE.Group>(null);
  const groundDustRef       = useRef<THREE.InstancedMesh>(null);
  const flyingDebrisRef     = useRef<THREE.InstancedMesh>(null);
  const rainRef             = useRef<THREE.InstancedMesh>(null);
  const lightningLightRef   = useRef<THREE.PointLight>(null);

  // ─── STAGE VARIABLES (Strictly Clamped so Tornado is 100% GONE in Stage 6 Aftermath) ───
  const isNormal      = tornadoStage === 0;
  const isSupercell   = tornadoStage >= 1 && tornadoStage <= 5;
  const isMesocyclone = tornadoStage >= 2 && tornadoStage <= 5;
  const isFunnelDown  = tornadoStage >= 3 && tornadoStage <= 5;
  const isTouchdown   = tornadoStage === 4;
  const isSafeShelter = tornadoStage === 5;
  const isAftermath   = tornadoStage === 6;

  // ─── PROCEDURAL HYPERBOLIC VORTEX FUNNEL GEOMETRIES ───
  const { innerFunnelGeom, outerFunnelGeom, origInnerPos, origOuterPos } = useMemo(() => {
    const innerGeom = new THREE.CylinderGeometry(3.5, 0.35, 5.8, 32, 32, true);
    innerGeom.translate(0, 2.9, 0);
    const origInner = innerGeom.attributes.position.clone();

    const outerGeom = new THREE.CylinderGeometry(4.4, 0.65, 6.0, 32, 32, true);
    outerGeom.translate(0, 3.0, 0);
    const origOuter = outerGeom.attributes.position.clone();

    return {
      innerFunnelGeom: innerGeom,
      outerFunnelGeom: outerGeom,
      origInnerPos: origInner,
      origOuterPos: origOuter
    };
  }, []);

  // ─── PARTICLES SETUP (Rain, Ground Dust Bowl, Debris) ───
  const rainCount = 420;
  const dustCount = 180;
  const debrisCount = 80;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const rainData = useMemo(() => {
    return Array.from({ length: rainCount }).map(() => ({
      x: (Math.random() - 0.5) * 24.0,
      y: Math.random() * 10.5 + 1.0,
      z: (Math.random() - 0.5) * 16.0,
      speed: Math.random() * 0.38 + 0.28
    }));
  }, [rainCount]);

  const dustParticles = useMemo(() => {
    return Array.from({ length: dustCount }).map(() => ({
      y: Math.random() * 7.5,
      angle: Math.random() * Math.PI * 2,
      radialOffset: (Math.random() - 0.5) * 0.6,
      riseSpeed: 1.5 + Math.random() * 2.5,
      spinSpeed: 5.5 + Math.random() * 5.0,
      scale: Math.random() * 0.28 + 0.08
    }));
  }, [dustCount]);

  const debrisParticles = useMemo(() => {
    return Array.from({ length: debrisCount }).map(() => ({
      y: Math.random() * 7.2,
      angle: Math.random() * Math.PI * 2,
      radialOffset: (Math.random() - 0.5) * 0.8,
      riseSpeed: 1.8 + Math.random() * 2.8,
      spinSpeed: 6.8 + Math.random() * 5.5,
      scale: Math.random() * 0.35 + 0.12,
      rotX: Math.random() * Math.PI,
      rotY: Math.random() * Math.PI,
      rotSpeedX: (Math.random() - 0.5) * 16.0,
      rotSpeedY: (Math.random() - 0.5) * 16.0
    }));
  }, [debrisCount]);

  // ─── AUDIO ENGINE CUES ───
  useEffect(() => {
    if (isTouchdown) {
      soundEngine.playTornadoWind(6);
    } else if (isFunnelDown || isMesocyclone) {
      soundEngine.playTornadoWind(3);
    }
  }, [tornadoStage, isTouchdown, isFunnelDown, isMesocyclone]);

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
    if (groundDustRef.current) {
      dustParticles.forEach((_, i) => {
        dummy.position.set(0, -10, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        groundDustRef.current!.setMatrixAt(i, dummy.matrix);
      });
      groundDustRef.current.instanceMatrix.needsUpdate = true;
    }
    if (flyingDebrisRef.current) {
      debrisParticles.forEach((_, i) => {
        dummy.position.set(0, -10, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        flyingDebrisRef.current!.setMatrixAt(i, dummy.matrix);
      });
      flyingDebrisRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [dummy, rainData, dustParticles, debrisParticles]);

  // ─── ANIMATION FRAME LOOP ───
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // 1. Slanted Rain Streaks
    if (rainRef.current) {
      if (isSupercell) {
        rainData.forEach((p, i) => {
          p.y -= p.speed * 2.6;
          p.x -= 0.14;
          if (p.y < 0.0) {
            p.y = 11.0;
            p.x = (Math.random() - 0.5) * 24.0;
            p.z = (Math.random() - 0.5) * 16.0;
          }
          dummy.position.set(p.x, p.y, p.z);
          dummy.scale.set(1.0, 1.0, 1.0);
          dummy.rotation.set(0.18, 0, 0.4);
          dummy.updateMatrix();
          rainRef.current!.setMatrixAt(i, dummy.matrix);
        });
        rainRef.current.instanceMatrix.needsUpdate = true;
      } else {
        rainData.forEach((p, i) => {
          dummy.position.set(p.x, p.y, p.z);
          dummy.scale.set(0, 0, 0);
          dummy.updateMatrix();
          rainRef.current!.setMatrixAt(i, dummy.matrix);
        });
        rainRef.current.instanceMatrix.needsUpdate = true;
      }
    }

    // 2. Stochastic Lightning Flash
    if (lightningLightRef.current && isSupercell) {
      const isFlash = Math.random() < 0.04;
      lightningLightRef.current.intensity = isFlash ? 40.0 : 0;
    }

    // 3. Rotating Wall Cloud Disk (Mesocyclone)
    if (wallCloudRef.current) {
      if (isMesocyclone) {
        wallCloudRef.current.visible = true;
        wallCloudRef.current.rotation.y += delta * 1.35;
        
        // Lower wall cloud naturally from the storm canopy (high above rooftops)
        const targetY = isTouchdown ? 5.9 : isFunnelDown ? 6.1 : 6.35;
        wallCloudRef.current.position.y = THREE.MathUtils.lerp(
          wallCloudRef.current.position.y,
          targetY,
          delta * 2.5
        );
      } else {
        wallCloudRef.current.visible = false;
      }
    }

    // 4. Dynamic Organic Deforming Funnel
    if (innerFunnelMeshRef.current && outerFunnelMeshRef.current && isFunnelDown) {
      const innerPos = innerFunnelGeom.attributes.position;
      const outerPos = outerFunnelGeom.attributes.position;

      // Inner Core
      for (let i = 0; i < innerPos.count; i++) {
        const x0 = origInnerPos.getX(i);
        const y0 = origInnerPos.getY(i);
        const z0 = origInnerPos.getZ(i);

        const h = Math.max(0, Math.min(1, y0 / 5.8));
        const rScale = 0.22 + 0.78 * Math.pow(h, 1.6);

        const swayX = Math.sin(t * 2.6 + h * 2.8) * 0.6 * h;
        const swayZ = Math.cos(t * 2.1 + h * 2.2) * 0.45 * h;

        const spinAngle = t * (10.0 - 5.5 * h);
        const cosA = Math.cos(spinAngle);
        const sinA = Math.sin(spinAngle);

        const rx = (x0 * cosA - z0 * sinA) * rScale + swayX;
        const rz = (x0 * sinA + z0 * cosA) * rScale + swayZ;

        innerPos.setXYZ(i, rx, y0 - 0.1, rz);
      }
      innerPos.needsUpdate = true;

      // Outer Sheath
      for (let i = 0; i < outerPos.count; i++) {
        const x0 = origOuterPos.getX(i);
        const y0 = origOuterPos.getY(i);
        const z0 = origOuterPos.getZ(i);

        const h = Math.max(0, Math.min(1, y0 / 6.0));
        const rScale = 0.24 + 0.76 * Math.pow(h, 1.5);

        const swayX = Math.sin(t * 2.3 + h * 3.0 + 0.4) * 0.7 * h;
        const swayZ = Math.cos(t * 1.9 + h * 2.4 + 0.4) * 0.52 * h;

        const spinAngle = -t * (8.5 - 4.5 * h);
        const cosA = Math.cos(spinAngle);
        const sinA = Math.sin(spinAngle);

        const rx = (x0 * cosA - z0 * sinA) * rScale + swayX;
        const rz = (x0 * sinA + z0 * cosA) * rScale + swayZ;

        outerPos.setXYZ(i, rx, y0 - 0.1, rz);
      }
      outerPos.needsUpdate = true;
    }

    // 5. Funnel Descent & Ground Path Wander
    if (vortexGroupRef.current) {
      if (isFunnelDown) {
        vortexGroupRef.current.visible = true;

        const pathX = isTouchdown ? Math.sin(t * 0.5) * 2.8 + Math.sin(t * 1.0) * 0.6 : -1.2;
        const pathZ = isTouchdown ? Math.cos(t * 0.38) * 1.4 - 0.2 : 0.0;

        let targetScaleY = 0.001;
        if (isTouchdown) targetScaleY = 1.0;
        else if (isFunnelDown) targetScaleY = 0.65;
        else if (isSafeShelter) targetScaleY = 0.85;

        vortexGroupRef.current.scale.y = THREE.MathUtils.lerp(
          vortexGroupRef.current.scale.y,
          targetScaleY,
          delta * 3.5
        );
        vortexGroupRef.current.position.x = pathX;
        vortexGroupRef.current.position.z = pathZ;
      } else {
        vortexGroupRef.current.visible = false;
        vortexGroupRef.current.scale.set(1, 0.001, 1);
      }
    }

    // 6. Upward Helical Spiral Dust Bowl & Flying Debris
    const vX = vortexGroupRef.current ? vortexGroupRef.current.position.x : 0;
    const vZ = vortexGroupRef.current ? vortexGroupRef.current.position.z : 0;

    if (groundDustRef.current) {
      if (isTouchdown || isFunnelDown) {
        dustParticles.forEach((p, i) => {
          p.y += p.riseSpeed * delta * (isTouchdown ? 1.0 : 0.5);
          p.angle += p.spinSpeed * delta;
          if (p.y > 8.0) {
            p.y = 0.1;
            p.angle = Math.random() * Math.PI * 2;
          }

          const hFrac = p.y / 8.0;
          const radius = (0.45 + 3.0 * Math.pow(hFrac, 1.4)) + p.radialOffset;
          const px = vX + Math.cos(p.angle) * radius;
          const pz = vZ + Math.sin(p.angle) * radius;

          dummy.position.set(px, p.y, pz);
          dummy.scale.set(p.scale, p.scale, p.scale);
          dummy.rotation.set(0, p.angle, 0);
          dummy.updateMatrix();
          groundDustRef.current!.setMatrixAt(i, dummy.matrix);
        });
        groundDustRef.current.instanceMatrix.needsUpdate = true;
      } else {
        dustParticles.forEach((_, i) => {
          dummy.position.set(0, -10, 0);
          dummy.scale.set(0, 0, 0);
          dummy.updateMatrix();
          groundDustRef.current!.setMatrixAt(i, dummy.matrix);
        });
        groundDustRef.current.instanceMatrix.needsUpdate = true;
      }
    }

    if (flyingDebrisRef.current) {
      if (isTouchdown) {
        debrisParticles.forEach((p, i) => {
          p.y += p.riseSpeed * delta;
          p.angle += p.spinSpeed * delta;
          p.rotX += p.rotSpeedX * delta;
          p.rotY += p.rotSpeedY * delta;
          if (p.y > 7.5) {
            p.y = 0.2;
            p.angle = Math.random() * Math.PI * 2;
          }

          const hFrac = p.y / 7.5;
          const radius = (0.55 + 3.4 * Math.pow(hFrac, 1.3)) + p.radialOffset;
          const px = vX + Math.cos(p.angle) * radius;
          const pz = vZ + Math.sin(p.angle) * radius;

          dummy.position.set(px, p.y, pz);
          dummy.scale.set(p.scale, p.scale * 0.4, p.scale);
          dummy.rotation.set(p.rotX, p.rotY, 0);
          dummy.updateMatrix();
          flyingDebrisRef.current!.setMatrixAt(i, dummy.matrix);
        });
        flyingDebrisRef.current.instanceMatrix.needsUpdate = true;
      } else {
        debrisParticles.forEach((_, i) => {
          dummy.position.set(0, -10, 0);
          dummy.scale.set(0, 0, 0);
          dummy.updateMatrix();
          flyingDebrisRef.current!.setMatrixAt(i, dummy.matrix);
        });
        flyingDebrisRef.current.instanceMatrix.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      <TornadoAtmosphere stage={tornadoStage} />

      {/* ─── SCENE LIGHTING (Bright & Vibrant, Never Muddy) ─── */}
      <ambientLight intensity={isSupercell ? 1.4 : 1.65} color={isSupercell ? '#cbd5e1' : '#f8fafc'} />
      <hemisphereLight args={['#ffffff', '#334155', isSupercell ? 1.1 : 1.35]} />
      <directionalLight
        position={[14, 24, 14]}
        intensity={isSupercell ? 2.2 : 3.0}
        color={isSupercell ? '#f1f5f9' : '#ffffff'}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight ref={lightningLightRef} position={[0, 12, 0]} color="#38bdf8" intensity={0} distance={60} />

      {/* ─── SUPERCELL CUMULONIMBUS CANOPY ─── */}
      <SupercellCanopy active={isSupercell} />

      {/* ─── MAIN SOLID DIORAMA GROUP ─── */}
      <group ref={dioramaGroupRef} position={[0, 0, 0]}>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 1. SOLID WATERTIGHT 3D SUBURBAN PEDESTAL BASE                       */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* Deep Bedrock Pedestal */}
        <mesh position={[0, -1.7, 0]} receiveShadow>
          <boxGeometry args={[22.0, 3.2, 14.0]} />
          <meshStandardMaterial color="#090d16" roughness={0.9} />
        </mesh>

        {/* Lush Green Lawn Surface Plate */}
        <mesh position={[0, -0.05, 0]} receiveShadow>
          <boxGeometry args={[22.0, 0.1, 14.0]} />
          <meshStandardMaterial color="#16a34a" roughness={0.8} />
        </mesh>

        {/* Tornado Ground Scour Path (Stages >= 4) */}
        {tornadoStage >= 4 && (
          <group position={[0.5, 0.015, -0.5]} rotation={[0, 0.25, 0]}>
            <mesh receiveShadow>
              <boxGeometry args={[4.2, 0.01, 13.5]} />
              <meshStandardMaterial color="#78350f" roughness={1.0} opacity={0.6} transparent />
            </mesh>
          </group>
        )}

        {/* ─── MAIN ASPHALT ROADWAY (Traversing X axis) ─── */}
        <mesh position={[0, 0.02, 0]} receiveShadow>
          <boxGeometry args={[22.0, 0.04, 3.4]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>

        {/* White Road Center Dash Lines */}
        {[-9, -6, -3, 0, 3, 6, 9].map((dx, i) => (
          <mesh key={`dash-${i}`} position={[dx, 0.045, 0]}>
            <boxGeometry args={[1.5, 0.01, 0.15]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
        ))}

        {/* Pedestrian Crosswalk (Zebra Cross) */}
        <group position={[-1.2, 0.045, 0]}>
          {[-1.2, -0.7, -0.2, 0.3, 0.8, 1.2].map((zx, i) => (
            <mesh key={`cross-${i}`} position={[0, 0, zx]}>
              <boxGeometry args={[0.35, 0.01, 0.28]} />
              <meshStandardMaterial color="#ffffff" roughness={0.3} />
            </mesh>
          ))}
        </group>

        {/* Concrete Sidewalks with Curbs */}
        {/* North Sidewalk */}
        <mesh position={[0, 0.08, -2.2]} receiveShadow>
          <boxGeometry args={[22.0, 0.12, 1.0]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.65} />
        </mesh>
        {/* South Sidewalk (Open Foreground Walkway) */}
        <mesh position={[0, 0.08, 2.2]} receiveShadow>
          <boxGeometry args={[22.0, 0.12, 1.0]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.65} />
        </mesh>

        {/* Concrete Driveways connecting road to North houses */}
        {[-6.0, 0.5, 7.0].map((dx, i) => (
          <mesh key={`dw-${i}`} position={[dx, 0.03, -2.2]}>
            <boxGeometry args={[2.0, 0.03, 1.0]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
          </mesh>
        ))}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 2. NORTH RESIDENTIAL HOUSES (Facing Street / Camera)                */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* House 1 (North-West): Safe Room Demonstration House */}
        <SuburbanHouse
          position={[-6.0, 0.0, -4.6]}
          wallColor="#f1f5f9"
          roofColor="#c2410c"
          damageLevel={tornadoStage >= 4 ? 1 : 0}
          isSafeRoomDemo={true}
          showCutaway={showCutaway}
        />

        {/* House 2 (North-Center): Terracotta Residence — Hit Directly by Tornado Vortex */}
        <SuburbanHouse
          position={[0.5, 0.0, -4.6]}
          wallColor="#fef3c7"
          roofColor="#b91c1c"
          damageLevel={tornadoStage >= 4 ? 2 : 0}
        />
        <SuburbanCar 
          position={[2.8, 0.0, -4.4]} 
          rotationY={tornadoStage >= 4 ? 0.4 : 0} 
          color="#2563eb" 
          isFlipped={tornadoStage >= 4} 
        />

        {/* House 3 (North-East): Blue Roof Suburban Residence */}
        <SuburbanHouse
          position={[7.0, 0.0, -4.6]}
          wallColor="#f8fafc"
          roofColor="#0284c7"
          damageLevel={tornadoStage >= 4 ? 1 : 0}
        />

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 3. FOREGROUND PARK & RECOVERY (Unobstructed Camera View)             */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* Low Park Lawn Benches on South Side */}
        {[-5.5, -1.5].map((bx, i) => (
          <group key={`bench-${i}`} position={[bx, 0.14, 3.6]}>
            <mesh position={[0, 0.22, 0]}>
              <boxGeometry args={[1.2, 0.06, 0.4]} />
              <meshStandardMaterial color="#78350f" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.42, 0.18]} rotation={[-0.1, 0, 0]}>
              <boxGeometry args={[1.2, 0.35, 0.05]} />
              <meshStandardMaterial color="#78350f" roughness={0.8} />
            </mesh>
            {[[-0.5, -0.15], [0.5, -0.15], [-0.5, 0.15], [0.5, 0.15]].map(([lx, lz], j) => (
              <mesh key={`bleg-${j}`} position={[lx, 0.1, lz]}>
                <cylinderGeometry args={[0.025, 0.025, 0.22, 6]} />
                <meshStandardMaterial color="#334155" metalness={0.8} />
              </mesh>
            ))}
          </group>
        ))}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 4. UTILITY POLES ON NORTH SIDE (Never Obstructing Camera View)     */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <UtilityPole position={[-8.5, 0.0, -2.8]} isSparking={isTouchdown} sway={isTouchdown ? 0.08 : 0} />
        <UtilityPole 
          position={[-2.5, 0.0, -2.8]} 
          isSparking={isTouchdown} 
          isFallen={tornadoStage >= 4} 
        />
        <UtilityPole position={[3.5, 0.0, -2.8]} isSparking={isTouchdown} sway={isTouchdown ? 0.06 : 0} />
        <UtilityPole position={[9.0, 0.0, -2.8]} isSparking={isTouchdown} sway={isTouchdown ? -0.05 : 0} />

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 5. DYNAMIC SUBURBAN SHADE TREES                                     */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <SuburbTree
          position={[-9.2, 0.0, -4.4]}
          scale={1.2}
          tiltZ={isTouchdown ? -0.85 : isFunnelDown ? -0.45 : isMesocyclone ? -0.2 : 0}
          tiltX={isTouchdown ? 0.35 : 0}
        />
        <SuburbTree
          position={[-2.8, 0.0, -4.6]}
          scale={1.15}
          isBroken={tornadoStage >= 4}
          tiltZ={isTouchdown ? -0.92 : isFunnelDown ? -0.5 : 0}
        />
        <SuburbTree
          position={[4.2, 0.0, -4.4]}
          scale={1.2}
          tiltZ={isTouchdown ? -0.75 : isFunnelDown ? -0.35 : 0}
        />
        <SuburbTree
          position={[-8.5, 0.0, 4.2]}
          scale={1.1}
          tiltZ={isTouchdown ? -0.8 : isFunnelDown ? -0.4 : 0}
        />
        <SuburbTree
          position={[8.5, 0.0, 4.2]}
          scale={1.2}
          isBroken={tornadoStage >= 4}
          tiltZ={isTouchdown ? -0.88 : isFunnelDown ? -0.45 : 0}
        />

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 6. SCATTERED DEBRIS WRECKAGE FIELD (Stages >= 4)                   */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <WreckageDebrisField active={tornadoStage >= 4} />

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 7. PASCA BENCANA & TIM SAR / BPBD (STAGE 6 AFTERMATH RECOVERY)      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {isAftermath && (
          <group>
            {/* BPBD / SAR Response Rescue Truck on Road */}
            <RescueVehicle position={[-4.0, 0.02, 0.4]} rotationY={0.15} />

            {/* Rescue Personnel Assessing Damage */}
            <HumanFigure position={[-2.2, 0.02, 0.5]} pose="RESCUE" rotationY={1.2} />
            <HumanFigure position={[-0.5, 0.02, -1.8]} pose="RESCUE" rotationY={-0.4} />

            {/* BPBD / PMI Disaster Relief Tent on Safe South Lawn */}
            <ReliefTent position={[5.2, 0.02, 4.4]} rotationY={0} />
          </group>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 8. ORGANIC VOLUMETRIC TORNADO VORTEX & ROTATING WALL CLOUD          */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* Rotating Mesocyclone Wall Cloud (Organic Billowing Multi-Tier Cloud Cluster) */}
        <group ref={wallCloudRef} position={[0, 6.35, 0]} visible={false}>
          {/* Central Boiling Core Clouds */}
          <mesh position={[0, 0.4, 0]} scale={[3.2, 1.2, 3.2]}>
            <sphereGeometry args={[1.0, 12, 10]} />
            <meshStandardMaterial color="#0f172a" roughness={0.95} />
          </mesh>
          <mesh position={[0, -0.2, 0]} scale={[2.4, 1.0, 2.4]}>
            <sphereGeometry args={[1.0, 12, 10]} />
            <meshStandardMaterial color="#111827" roughness={0.95} />
          </mesh>

          {/* Upper Tier: Overlapping Cloud Lobes Connecting to Canopy */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((ci) => {
            const ang = (ci / 8) * Math.PI * 2;
            const r = 3.6 + (ci % 2 === 0 ? 0.3 : -0.2);
            return (
              <mesh
                key={`tier1-${ci}`}
                position={[Math.cos(ang) * r, 0.6 + (ci % 3) * 0.15, Math.sin(ang) * r]}
                scale={[1.6, 1.1, 1.6]}
                castShadow
              >
                <sphereGeometry args={[1.0, 10, 8]} />
                <meshStandardMaterial color={ci % 2 === 0 ? '#1e293b' : '#334155'} roughness={0.94} />
              </mesh>
            );
          })}

          {/* Middle Tier: Churning Convective Inflow Cloud Shelf */}
          {[0, 1, 2, 3, 4, 5].map((ci) => {
            const ang = (ci / 6) * Math.PI * 2 + 0.4;
            const r = 2.6 + (ci % 2 === 0 ? 0.2 : -0.2);
            return (
              <mesh
                key={`tier2-${ci}`}
                position={[Math.cos(ang) * r, 0.05 + (ci % 2) * 0.1, Math.sin(ang) * r]}
                scale={[1.35, 0.95, 1.35]}
                castShadow
              >
                <sphereGeometry args={[1.0, 10, 8]} />
                <meshStandardMaterial color={ci % 2 === 0 ? '#0f172a' : '#1e293b'} roughness={0.96} />
              </mesh>
            );
          })}

          {/* Lower Tier: Inward Tapering Wall Cloud Lip / Collar */}
          {[0, 1, 2, 3, 4].map((ci) => {
            const ang = (ci / 5) * Math.PI * 2 + 0.2;
            const r = 1.6 + (ci % 2 === 0 ? 0.15 : -0.15);
            return (
              <mesh
                key={`tier3-${ci}`}
                position={[Math.cos(ang) * r, -0.55 + (ci % 2) * 0.08, Math.sin(ang) * r]}
                scale={[1.05, 0.8, 1.05]}
                castShadow
              >
                <sphereGeometry args={[1.0, 8, 8]} />
                <meshStandardMaterial color="#0f172a" roughness={0.98} />
              </mesh>
            );
          })}
        </group>

        {/* Organic Double-Sheath Serpentine Tornado Funnel (Only in active storm stages 3-5) */}
        <group ref={vortexGroupRef} position={[0, 0, 0]} visible={false}>
          {/* Inner Dark Condensation Funnel */}
          <mesh ref={innerFunnelMeshRef} geometry={innerFunnelGeom} castShadow>
            <meshStandardMaterial 
              color="#0f172a" 
              roughness={0.9} 
              side={THREE.DoubleSide} 
            />
          </mesh>

          {/* Outer Translucent Debris-Tinted Sheath */}
          <mesh ref={outerFunnelMeshRef} geometry={outerFunnelGeom}>
            <meshStandardMaterial
              color="#475569"
              roughness={0.8}
              transparent
              opacity={0.65}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 9. INSTANCED WEATHER PARTICLES (RAIN, GROUND DUST, FLYING DEBRIS)   */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* Rain Streaks */}
        <instancedMesh ref={rainRef} args={[undefined, undefined, rainCount]}>
          <cylinderGeometry args={[0.012, 0.012, 1.4, 4]} />
          <meshBasicMaterial color="#93c5fd" transparent opacity={0.35} />
        </instancedMesh>

        {/* Swirling Ground Dust Bowl */}
        <instancedMesh ref={groundDustRef} args={[undefined, undefined, dustCount]}>
          <sphereGeometry args={[0.85, 7, 7]} />
          <meshStandardMaterial color="#78350f" transparent opacity={0.35} depthWrite={false} roughness={1.0} />
        </instancedMesh>

        {/* Flying Zinc Roofing Sheets & Wood Shards */}
        <instancedMesh ref={flyingDebrisRef} args={[undefined, undefined, debrisCount]} castShadow>
          <boxGeometry args={[0.65, 0.04, 0.45]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
        </instancedMesh>

      </group>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 10. 3D SCIENTIFIC HUD LABELS & INTERACTIVE ACTIONS                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showCutaway && (
        <group>
          {/* Label: Mesocyclone Wall Cloud */}
          {isMesocyclone && !isAftermath && (
            <Html position={[0, 7.2, 0]} center distanceFactor={14}>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-amber-500 text-amber-200 text-[11px] font-bold shadow-md whitespace-nowrap pointer-events-none">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Dinding Awan Mesosiklon (Rotating Wall Cloud)</span>
              </div>
            </Html>
          )}

          {/* Label: Funnel Cloud / Touchdown */}
          {isFunnelDown && !isAftermath && (
            <Html position={[-1.2, 4.2, 0]} center distanceFactor={14}>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-rose-600 text-white text-[11px] font-bold shadow-md whitespace-nowrap pointer-events-none">
                <Wind className="w-3.5 h-3.5 text-rose-400" />
                <span>Pusaran Puting Beliung (Funnel Cloud EF-3)</span>
              </div>
            </Html>
          )}

          {/* Label: Safe Room Cutaway */}
          <Html position={[-6.0, 2.8, -4.6]} center distanceFactor={13}>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-emerald-500 text-emerald-200 text-[11px] font-bold shadow-md whitespace-nowrap pointer-events-none">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ruang Aman Tengah (Interior Safe Room)</span>
            </div>
          </Html>

          {/* Label: Damage Swath in Aftermath */}
          {isAftermath && (
            <Html position={[0.5, 2.4, -4.6]} center distanceFactor={13}>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-rose-500 text-rose-200 text-[11px] font-bold shadow-md whitespace-nowrap pointer-events-none">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                <span>Zona Kerusakan Parah & Atap Seng Robek</span>
              </div>
            </Html>
          )}

          {/* Label: SAR BPBD Recovery Station in Aftermath */}
          {isAftermath && (
            <Html position={[-4.0, 1.8, 0.4]} center distanceFactor={13}>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-amber-500 text-amber-200 text-[11px] font-bold shadow-md whitespace-nowrap pointer-events-none">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Posko Evakuasi & Tim SAR BPBD</span>
              </div>
            </Html>
          )}

          {/* Label: BPBD Relief Tent & Medical Station in Aftermath */}
          {isAftermath && (
            <Html position={[5.2, 1.8, 4.4]} center distanceFactor={13}>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-emerald-500 text-emerald-200 text-[11px] font-bold shadow-md whitespace-nowrap pointer-events-none">
                <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tenda Pengungsian & Posko Medis BPBD</span>
              </div>
            </Html>
          )}
        </group>
      )}

      {/* Interactive Mitigation Action Prompt Button */}
      {isSafeShelter && (
        <Html position={[-6.0, 3.8, -4.6]} center distanceFactor={12}>
          <button
            onClick={() => {
              soundEngine.playCorrect();
              if (onActionClick) onActionClick('SHELTER_SAFE_ROOM');
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md cursor-pointer hover:scale-105 transition-all whitespace-nowrap border-2 border-white pointer-events-auto"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white" />
            <span>BERLINDUNG DI RUANG TENGAH TANPA JENDELA (+50 XP)</span>
          </button>
        </Html>
      )}
    </group>
  );
};
