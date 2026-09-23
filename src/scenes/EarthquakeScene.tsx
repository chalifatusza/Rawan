import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { soundEngine } from '../audio/soundEngine';
import { 
  Activity, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  Zap, 
  ShieldCheck,
  Compass
} from 'lucide-react';

export type EarthquakeStage = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// ─── ATMOSPHERIC FOG SETUP ───
const EarthquakeSceneSetup: React.FC<{ stage: EarthquakeStage }> = ({ stage }) => {
  const { scene } = useThree();

  useEffect(() => {
    const fogColor = stage >= 4
      ? new THREE.Color('#94a3b8') // Dusty seismic atmosphere
      : stage >= 2
      ? new THREE.Color('#cbd5e1')
      : new THREE.Color('#bae6fd'); // Clear daylight
    scene.fog = new THREE.Fog(fogColor, 40, 110);
    return () => { scene.fog = null; };
  }, [scene, stage]);

  return null;
};

// ─── TROPICAL SHADE TREE ───
const ShadeTree: React.FC<{ position: [number, number, number]; scale?: number; sway?: number }> = ({ 
  position, 
  scale = 1,
  sway = 0
}) => (
  <group position={position} scale={[scale, scale, scale]} rotation={[sway * 0.08, 0, sway * 0.05]}>
    {/* Trunk */}
    <mesh position={[0, 0.8, 0]}>
      <cylinderGeometry args={[0.14, 0.2, 1.6, 8]} />
      <meshStandardMaterial color="#451a03" roughness={0.9} />
    </mesh>
    {/* Lush Foliage Canopy */}
    <mesh position={[0, 2.0, 0]}>
      <sphereGeometry args={[0.95, 12, 10]} />
      <meshStandardMaterial color="#15803d" roughness={0.7} />
    </mesh>
    <mesh position={[-0.35, 2.3, 0.25]}>
      <sphereGeometry args={[0.7, 10, 8]} />
      <meshStandardMaterial color="#166534" roughness={0.7} />
    </mesh>
    <mesh position={[0.35, 2.2, -0.25]}>
      <sphereGeometry args={[0.75, 10, 8]} />
      <meshStandardMaterial color="#14532d" roughness={0.7} />
    </mesh>
  </group>
);

// ─── PALM TREE ───
const PalmTree: React.FC<{ position: [number, number, number]; scale?: number; sway?: number }> = ({
  position,
  scale = 1,
  sway = 0
}) => (
  <group position={position} scale={[scale, scale, scale]} rotation={[sway * 0.1, 0, 0.08 + sway * 0.12]}>
    <mesh position={[0, 0.4, 0]}>
      <cylinderGeometry args={[0.12, 0.16, 0.8, 8]} />
      <meshStandardMaterial color="#78350f" roughness={0.88} />
    </mesh>
    <mesh position={[0.06, 1.15, 0]} rotation={[0, 0, -0.06]}>
      <cylinderGeometry args={[0.1, 0.12, 0.8, 8]} />
      <meshStandardMaterial color="#854d0e" roughness={0.88} />
    </mesh>
    <mesh position={[0.15, 1.9, 0]} rotation={[0, 0, -0.1]}>
      <cylinderGeometry args={[0.08, 0.1, 0.8, 8]} />
      <meshStandardMaterial color="#78350f" roughness={0.88} />
    </mesh>
    <mesh position={[0.26, 2.6, 0]} rotation={[0, 0, -0.15]}>
      <cylinderGeometry args={[0.07, 0.08, 0.65, 8]} />
      <meshStandardMaterial color="#854d0e" roughness={0.88} />
    </mesh>
    {/* Palm Fronds */}
    <group position={[0.32, 2.95, 0]}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((f) => {
        const angle = (f / 8) * Math.PI * 2;
        return (
          <group key={`frond-${f}`} rotation={[0, angle, sway * 0.15]}>
            <mesh position={[0.6, 0.12, 0]} rotation={[0, 0, -0.35]}>
              <boxGeometry args={[1.2, 0.02, 0.25]} />
              <meshStandardMaterial color="#16a34a" roughness={0.5} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[1.3, -0.2, 0]} rotation={[0, 0, -0.8]}>
              <boxGeometry args={[0.65, 0.02, 0.2]} />
              <meshStandardMaterial color="#15803d" roughness={0.5} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}
    </group>
  </group>
);

// ─── POWER UTILITY POLE & LINES ───
const UtilityPole: React.FC<{ 
  position: [number, number, number]; 
  sway?: number; 
  isSparking?: boolean;
  isDamaged?: boolean;
}> = ({ position, sway = 0, isSparking = false, isDamaged = false }) => {
  const tiltX = isDamaged ? 0.12 : sway * 0.08;
  const tiltZ = isDamaged ? -0.22 : sway * 0.06;
  return (
    <group position={position} rotation={[tiltX, 0, tiltZ]}>
      {/* Main Concrete Pole */}
      <mesh position={[0, 2.4, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 4.8, 8]} />
        <meshStandardMaterial color="#64748b" roughness={0.7} />
      </mesh>
      {/* Crossarm */}
      <mesh position={[0, 4.4, 0]} rotation={isDamaged ? [0.05, 0, -0.15] : [0, 0, 0]}>
        <boxGeometry args={[1.4, 0.1, 0.12]} />
        <meshStandardMaterial color="#475569" roughness={0.6} />
      </mesh>
      {/* Insulators */}
      {[-0.6, 0, 0.6].map((ix, i) => (
        <mesh key={`ins-${i}`} position={[ix, 4.52, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.16, 6]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} />
        </mesh>
      ))}
      {/* Cylindrical Transformer */}
      <mesh position={[0.28, 3.8, 0]} rotation={isDamaged ? [0.2, 0, 0.1] : [0, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.6, 12]} />
        <meshStandardMaterial color="#334155" roughness={0.5} />
      </mesh>

      {/* Dangling Power Wires when damaged */}
      {isDamaged && (
        <group position={[0, 4.3, 0]}>
          <mesh position={[0.4, -1.2, 0.1]} rotation={[0, 0, 0.2]}>
            <cylinderGeometry args={[0.015, 0.015, 2.5, 4]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[-0.3, -1.0, -0.1]} rotation={[0, 0, -0.25]}>
            <cylinderGeometry args={[0.015, 0.015, 2.0, 4]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>
      )}

      {/* Cracked Concrete Base Shards if Damaged */}
      {isDamaged && (
        <group position={[0, 0.05, 0]}>
          <mesh position={[0.2, 0.04, 0.15]} rotation={[0, 0.4, 0.1]}>
            <boxGeometry args={[0.25, 0.08, 0.25]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.9} />
          </mesh>
          <mesh position={[-0.18, 0.03, -0.12]} rotation={[0, -0.3, -0.08]}>
            <boxGeometry args={[0.2, 0.06, 0.2]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.9} />
          </mesh>
        </group>
      )}

      {/* Transformer Sparks during severe earthquake */}
      {isSparking && (
        <pointLight position={[0.3, 3.9, 0]} color="#38bdf8" intensity={8.0 + Math.random() * 8.0} distance={8} />
      )}
    </group>
  );
};

// ─── HUMAN CHARACTER (Drop, Cover, Hold or Evacuee) ───
const HumanFigure: React.FC<{
  position: [number, number, number];
  pose?: 'STAND' | 'CROUCH' | 'RUN';
  color?: string;
  label?: string;
}> = ({ position, pose = 'STAND', color = '#38bdf8' }) => {
  if (pose === 'CROUCH') {
    // Drop, Cover, Hold under desk posture
    return (
      <group position={position}>
        {/* Head tucked down */}
        <mesh position={[0, 0.28, 0.12]}>
          <sphereGeometry args={[0.11, 8, 8]} />
          <meshStandardMaterial color="#fbcfe8" roughness={0.5} />
        </mesh>
        {/* Arms covering head */}
        <mesh position={[0, 0.35, 0.12]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.26, 0.08, 0.14]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        {/* Crouched Torso */}
        <mesh position={[0, 0.2, 0]} rotation={[0.6, 0, 0]}>
          <boxGeometry args={[0.22, 0.24, 0.16]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        {/* Knees bent on floor */}
        <mesh position={[-0.08, 0.06, -0.08]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[0.08, 0.12, 0.18]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0.08, 0.06, -0.08]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[0.08, 0.12, 0.18]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
    );
  }

  // Standing / Evacuee figure
  return (
    <group position={position}>
      {/* Head */}
      <mesh position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#fbcfe8" roughness={0.5} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 0.44, 0]}>
        <boxGeometry args={[0.24, 0.32, 0.14]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
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

// ─── AMBULANCE / BPBD RESCUE VEHICLE ───
const RescueVehicle: React.FC<{ 
  position: [number, number, number]; 
  rotationY?: number;
  strobe?: boolean;
}> = ({ position, rotationY = 0, strobe = false }) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Main Body */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[1.2, 0.65, 2.2]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      {/* Orange/Red Emergency Stripe */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[1.22, 0.15, 2.22]} />
        <meshStandardMaterial color="#ea580c" roughness={0.4} />
      </mesh>
      {/* Cabin Roof */}
      <mesh position={[0, 0.85, -0.2]}>
        <boxGeometry args={[1.1, 0.35, 1.4]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 0.85, 0.52]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[1.02, 0.3, 0.05]} />
        <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Wheels */}
      {[-0.6, 0.6].map((wx, i) => (
        <group key={`wheels-${i}`}>
          <mesh position={[wx, 0.18, 0.6]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 0.12, 12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh position={[wx, 0.18, -0.6]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 0.12, 12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* Emergency Lightbar on Roof */}
      <mesh position={[0, 1.06, 0.1]}>
        <boxGeometry args={[0.6, 0.08, 0.15]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={strobe ? 4.0 : 0.5} />
      </mesh>
      {strobe && (
        <pointLight position={[0, 1.3, 0.1]} color="#ef4444" intensity={4.5} distance={10} />
      )}
    </group>
  );
};

// ─── RESIDENTIAL HOUSE (WITH DETAILED SEISMIC STRUCTURAL DAMAGE) ───
const ResidentialHouse: React.FC<{
  position: [number, number, number];
  rotationY?: number;
  sway?: number;
  isDamaged?: boolean;
}> = ({ position, rotationY = 0, sway = 0, isDamaged = false }) => {
  return (
    <group 
      position={position} 
      rotation={[
        isDamaged ? 0.04 : sway * 0.04, 
        rotationY + (isDamaged ? 0.02 : 0), 
        isDamaged ? -0.05 : sway * 0.03
      ]}
    >
      {/* Concrete Foundation Step */}
      <mesh position={[0, 0.08, 0.15]}>
        <boxGeometry args={[3.2, 0.16, 2.7]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
      </mesh>

      {/* Base Walls */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[2.8, 1.7, 2.4]} />
        <meshStandardMaterial color={isDamaged ? "#e2e8f0" : "#f8fafc"} roughness={0.6} />
      </mesh>

      {/* Front Door */}
      <mesh position={[0.5, 0.72, 1.21]} rotation={isDamaged ? [0, 0.25, 0.05] : [0, 0, 0]}>
        <boxGeometry args={[0.55, 1.25, 0.04]} />
        <meshStandardMaterial color="#78350f" roughness={0.5} />
      </mesh>

      {/* Window (Left) */}
      <group position={[-0.7, 1.05, 1.21]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.8, 0.8, 0.05]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>
        {!isDamaged ? (
          <mesh position={[0, 0, 0.01]}>
            <boxGeometry args={[0.68, 0.68, 0.02]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.7} transparent opacity={0.85} />
          </mesh>
        ) : (
          /* Shattered glass shards & open broken frame */
          <group position={[0, 0, 0.01]}>
            <mesh position={[-0.12, 0.1, 0]} rotation={[0, 0, 0.3]}>
              <boxGeometry args={[0.3, 0.35, 0.02]} />
              <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.7} transparent opacity={0.75} />
            </mesh>
            <mesh position={[0.15, -0.12, 0]} rotation={[0, 0, -0.4]}>
              <boxGeometry args={[0.25, 0.28, 0.02]} />
              <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.7} transparent opacity={0.75} />
            </mesh>
          </group>
        )}
      </group>

      {/* Front Porch Canopy / Veranda */}
      <group position={[0.45, 1.6, 1.55]}>
        <mesh position={[0, 0, 0]} rotation={isDamaged ? [0.15, 0, -0.1] : [0, 0, 0]}>
          <boxGeometry args={[1.2, 0.08, 0.8]} />
          <meshStandardMaterial color="#ea580c" roughness={0.5} />
        </mesh>
        <mesh 
          position={[0.5, -0.8, 0.35]} 
          rotation={isDamaged ? [0.2, 0, 0.15] : [0, 0, 0]}
        >
          <cylinderGeometry args={[0.04, 0.04, 1.5, 6]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      </group>

      {/* ── ROOF STRUCTURE ── */}
      {!isDamaged ? (
        /* Pristine Terracotta Pitched Roof */
        <mesh position={[0, 2.35, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[2.3, 1.2, 4]} />
          <meshStandardMaterial color="#ea580c" roughness={0.5} />
        </mesh>
      ) : (
        /* Damaged, Tilted, Partially Collapsed Roof */
        <group position={[0.1, 2.25, -0.05]} rotation={[0.08, 0.06, -0.14]}>
          {/* Main Tilted Roof Cone */}
          <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[2.25, 1.15, 4]} />
            <meshStandardMaterial color="#c2410c" roughness={0.6} />
          </mesh>

          {/* Exposed Wooden Roof Trusses Peeking Through Sagging Area */}
          <group position={[-0.6, 0.1, 0.5]} rotation={[0.2, 0.4, 0.3]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.08, 0.8, 0.08]} />
              <meshStandardMaterial color="#451a03" roughness={0.9} />
            </mesh>
            <mesh position={[0.2, 0.05, 0]}>
              <boxGeometry args={[0.08, 0.75, 0.08]} />
              <meshStandardMaterial color="#451a03" roughness={0.9} />
            </mesh>
            <mesh position={[0.1, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.06, 0.5, 0.06]} />
              <meshStandardMaterial color="#78350f" roughness={0.9} />
            </mesh>
          </group>

          {/* Loose / Sliding Roof Tiles dangling from Eaves */}
          <mesh position={[-0.8, -0.35, 0.7]} rotation={[0.4, 0.2, -0.5]}>
            <boxGeometry args={[0.4, 0.04, 0.3]} />
            <meshStandardMaterial color="#ea580c" roughness={0.6} />
          </mesh>
          <mesh position={[-0.4, -0.4, 0.9]} rotation={[0.5, -0.1, -0.3]}>
            <boxGeometry args={[0.35, 0.04, 0.25]} />
            <meshStandardMaterial color="#ea580c" roughness={0.6} />
          </mesh>
        </group>
      )}

      {/* ── EARTHQUAKE DAMAGE DETAILS (Active when isDamaged = true) ── */}
      {isDamaged && (
        <group>
          {/* 1. Diagonal Seismic Shear X-Cracks across Front Wall */}
          <group position={[0, 1.05, 1.22]}>
            {/* Main Diagonal Shear Fracture */}
            <mesh position={[-0.15, 0.1, 0]} rotation={[0, 0, 0.65]}>
              <boxGeometry args={[1.6, 0.035, 0.02]} />
              <meshStandardMaterial color="#0f172a" roughness={0.9} />
            </mesh>
            {/* Secondary Cross-Crack (X-Pattern) */}
            <mesh position={[-0.15, 0.1, 0]} rotation={[0, 0, -0.7]}>
              <boxGeometry args={[1.3, 0.03, 0.02]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>
            {/* Exposed Red Brick Patch underneath broken plaster */}
            <mesh position={[-0.15, 0.1, 0.01]}>
              <boxGeometry args={[0.4, 0.35, 0.015]} />
              <meshStandardMaterial color="#991b1b" roughness={0.8} />
            </mesh>
            {/* Minor Branching Wall Cracks */}
            <mesh position={[0.75, 0.45, 0]} rotation={[0, 0, 0.4]}>
              <boxGeometry args={[0.6, 0.025, 0.02]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[-0.8, -0.3, 0]} rotation={[0, 0, -0.35]}>
              <boxGeometry args={[0.5, 0.025, 0.02]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
          </group>

          {/* 2. Side Wall Diagonal Stress Cracks */}
          <group position={[1.41, 1.0, 0]}>
            <mesh position={[0, 0, 0]} rotation={[0.7, 0, 0]}>
              <boxGeometry args={[0.02, 0.035, 1.5]} />
              <meshStandardMaterial color="#0f172a" roughness={0.9} />
            </mesh>
            {/* Exposed Red Brick Patch */}
            <mesh position={[0.01, -0.1, 0.2]}>
              <boxGeometry args={[0.015, 0.3, 0.45]} />
              <meshStandardMaterial color="#b91c1c" roughness={0.8} />
            </mesh>
          </group>

          {/* 3. Scattered Debris, Fallen Bricks & Broken Tiles on the Ground */}
          <group position={[0, 0.05, 0]}>
            {/* Fallen Terracotta Roof Tile Shards on lawn */}
            {[
              [-1.2, 0.02, 1.5, 0.4, 0.2, 0.1],
              [-0.8, 0.03, 1.7, -0.3, 0.5, -0.2],
              [-0.3, 0.02, 1.6, 0.1, -0.4, 0.3],
              [1.1, 0.02, 1.4, -0.2, 0.3, 0.15],
              [-1.5, 0.02, 0.6, 0.3, 0.1, -0.4],
              [-1.6, 0.03, -0.5, -0.5, 0.2, 0.2],
            ].map(([dx, dy, dz, rx, ry, rz], i) => (
              <mesh key={`tile-${i}`} position={[dx, dy, dz]} rotation={[rx, ry, rz]}>
                <boxGeometry args={[0.22, 0.035, 0.16]} />
                <meshStandardMaterial color="#ea580c" roughness={0.6} />
              </mesh>
            ))}

            {/* Fallen Masonry Concrete / Plaster Rubble Blocks */}
            {[
              [-0.9, 0.04, 1.3, 0.15, 0.08, 0.12],
              [-0.6, 0.05, 1.4, 0.2, 0.1, 0.15],
              [0.8, 0.04, 1.3, 0.18, 0.07, 0.14],
              [1.3, 0.05, 0.4, 0.22, 0.09, 0.18],
              [-1.4, 0.04, 0.1, 0.16, 0.07, 0.14],
            ].map(([dx, dy, dz, sx, sy, sz], i) => (
              <mesh key={`rubble-${i}`} position={[dx, dy, dz]} rotation={[i * 0.4, i * 0.7, i * 0.3]}>
                <boxGeometry args={[sx, sy, sz]} />
                <meshStandardMaterial color="#94a3b8" roughness={0.9} />
              </mesh>
            ))}

            {/* Broken Red Brick Rubble */}
            {[
              [-0.7, 0.03, 1.55],
              [-0.4, 0.03, 1.75],
              [1.0, 0.03, 1.5],
            ].map(([bx, by, bz], i) => (
              <mesh key={`brick-${i}`} position={[bx, by, bz]} rotation={[0.2, i * 0.8, -0.1]}>
                <boxGeometry args={[0.16, 0.06, 0.08]} />
                <meshStandardMaterial color="#b91c1c" roughness={0.8} />
              </mesh>
            ))}
          </group>
        </group>
      )}
    </group>
  );
};

// ─── REALISTIC BRANCHING GROUND FISSURE & FAULT RUPTURE NETWORK ───
const RealisticFaultFissure: React.FC<{
  stage: EarthquakeStage;
}> = ({ stage }) => {
  if (stage < 4) return null;

  // Meandering main fracture segments zig-zagging across the entire diorama length
  const mainSegments = [
    { start: [-0.9, -7.4], end: [-0.6, -5.2], width: 0.34, depth: 0.42 },
    { start: [-0.6, -5.2], end: [-1.15, -3.0], width: 0.38, depth: 0.46 },
    { start: [-1.15, -3.0], end: [-0.7, -1.2], width: 0.44, depth: 0.52 },
    // Road crossing section (Heavily ruptured asphalt)
    { start: [-0.7, -1.2], end: [-0.98, 0.6], width: 0.50, depth: 0.58 },
    { start: [-0.98, 0.6], end: [-0.55, 2.2], width: 0.46, depth: 0.54 },
    // Front lawn & towards cutaway edge
    { start: [-0.55, 2.2], end: [-0.85, 4.8], width: 0.42, depth: 0.48 },
    { start: [-0.85, 4.8], end: [-0.75, 7.4], width: 0.36, depth: 0.42 },
  ];

  return (
    <group position={[0, 0.03, 0]}>
      {/* ── 1. MAIN JAGGED FAULT CHASM SEGMENTS ── */}
      {mainSegments.map((seg, i) => {
        const dx = seg.end[0] - seg.start[0];
        const dz = seg.end[1] - seg.start[1];
        const length = Math.sqrt(dx * dx + dz * dz);
        const midX = (seg.start[0] + seg.end[0]) / 2;
        const midZ = (seg.start[1] + seg.end[1]) / 2;
        const angle = Math.atan2(dx, dz);

        return (
          <group key={`main-seg-${i}`} position={[midX, 0, midZ]} rotation={[0, angle, 0]}>
            {/* Deep Dark Crevasse Interior */}
            <mesh position={[0, -seg.depth / 2, 0]}>
              <boxGeometry args={[seg.width, seg.depth, length + 0.06]} />
              <meshStandardMaterial color="#030712" roughness={0.98} />
            </mesh>

            {/* Earthy Subsoil Sidewalls / Lips */}
            <mesh position={[-seg.width / 2, -0.04, 0]} rotation={[0, 0, 0.2]}>
              <boxGeometry args={[0.08, 0.16, length]} />
              <meshStandardMaterial color="#451a03" roughness={0.95} />
            </mesh>
            <mesh position={[seg.width / 2, -0.04, 0]} rotation={[0, 0, -0.2]}>
              <boxGeometry args={[0.08, 0.16, length]} />
              <meshStandardMaterial color="#3d2314" roughness={0.95} />
            </mesh>
          </group>
        );
      })}

      {/* ── 2. BRANCHING SECONDARY TENSION CRACKS (Branch Fractures) ── */}
      {[
        { pos: [-0.9, 0, -3.8], length: 1.8, angle: -1.1, width: 0.14 },
        { pos: [-1.4, 0, -4.6], length: 1.2, angle: -0.6, width: 0.09 },
        { pos: [-0.8, 0, -0.3], length: 2.2, angle: 1.35, width: 0.18 },
        { pos: [0.6, 0, 0.1], length: 1.4, angle: 0.9, width: 0.12 },
        { pos: [-0.85, 0, 1.2], length: 2.0, angle: -1.25, width: 0.16 },
        { pos: [-2.1, 0, 1.6], length: 1.3, angle: -1.6, width: 0.11 },
        { pos: [-0.7, 0, 3.6], length: 2.1, angle: 1.2, width: 0.15 },
        { pos: [0.6, 0, 4.4], length: 1.5, angle: 0.8, width: 0.10 },
      ].map((b, i) => (
        <group key={`branch-${i}`} position={b.pos as [number, number, number]} rotation={[0, b.angle, 0]}>
          <mesh position={[0, -0.05, b.length / 2]}>
            <boxGeometry args={[b.width, 0.16, b.length]} />
            <meshStandardMaterial color="#090d16" roughness={0.95} />
          </mesh>
        </group>
      ))}

      {/* ── 3. BUCKLED & HEAVED ASPHALT SLABS (Pecahan Aspal Terangkat di Jalan) ── */}
      <group position={[0, 0, 0.5]}>
        {/* Raised broken asphalt slab 1 (Left of crack) */}
        <mesh position={[-1.25, 0.09, -0.4]} rotation={[0.08, 0.15, 0.12]}>
          <boxGeometry args={[0.9, 0.09, 1.1]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
        {/* Raised broken asphalt slab 2 (Right of crack, tilted oppositely) */}
        <mesh position={[-0.35, 0.12, 0.3]} rotation={[-0.1, -0.12, -0.15]}>
          <boxGeometry args={[0.85, 0.1, 1.2]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
        {/* Broken sunken slab fragment */}
        <mesh position={[-0.9, 0.02, 0.9]} rotation={[0.15, -0.2, 0.05]}>
          <boxGeometry args={[0.7, 0.08, 0.85]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
        {/* Ruptured road center paint line fragments */}
        <mesh position={[-0.4, 0.14, 0.1]} rotation={[-0.1, -0.12, -0.15]}>
          <boxGeometry args={[0.5, 0.02, 0.14]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>
        {/* Broken dislocated sidewalk curb chunks */}
        <mesh position={[-0.95, 0.14, 1.75]} rotation={[0.1, 0.3, 0.2]}>
          <boxGeometry args={[0.6, 0.12, 0.32]} />
          <meshStandardMaterial color="#64748b" roughness={0.7} />
        </mesh>
        <mesh position={[-0.55, 0.16, -1.75]} rotation={[-0.15, -0.25, -0.18]}>
          <boxGeometry args={[0.6, 0.12, 0.32]} />
          <meshStandardMaterial color="#64748b" roughness={0.7} />
        </mesh>
      </group>

      {/* ── 4. SCATTERED SEISMIC SOIL & ASPHALT RUBBLE ALONG CRACK ── */}
      {[
        [-0.45, 0.04, -5.8, 0.18, 0.06, 0.14],
        [-1.25, 0.04, -4.2, 0.22, 0.07, 0.16],
        [-0.5, 0.06, -2.4, 0.25, 0.08, 0.18],
        [-1.15, 0.07, -0.8, 0.3, 0.09, 0.22],
        [-0.25, 0.08, 0.6, 0.28, 0.08, 0.2],
        [-1.1, 0.06, 2.8, 0.24, 0.07, 0.16],
        [-0.4, 0.05, 5.2, 0.22, 0.06, 0.18],
        [-0.95, 0.04, 6.6, 0.2, 0.05, 0.15],
      ].map(([rx, ry, rz, sx, sy, sz], i) => (
        <mesh key={`fissure-rubble-${i}`} position={[rx, ry, rz]} rotation={[i * 0.3, i * 0.6, i * 0.2]}>
          <boxGeometry args={[sx, sy, sz]} />
          <meshStandardMaterial color={Math.abs(rz - 0.5) < 1.8 ? "#475569" : "#573516"} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};

interface EarthquakeSceneProps {
  isSimulating?: boolean;
  earthquakeStage?: EarthquakeStage;
  onActionClick?: (actionId: string) => void;
  showCutaway?: boolean;
}

export const EarthquakeScene: React.FC<EarthquakeSceneProps> = ({
  isSimulating = true,
  earthquakeStage = 0,
  onActionClick,
  showCutaway: externalCutaway
}) => {
  // ─── REFS ───
  const groundGroupRef       = useRef<THREE.Group>(null);
  const leftPlateref         = useRef<THREE.Group>(null);
  const rightPlateRef        = useRef<THREE.Group>(null);
  const hypocenterLightRef   = useRef<THREE.PointLight>(null);
  const hypocenterCoreRef    = useRef<THREE.Mesh>(null);
  const pWaveRef1            = useRef<THREE.Mesh>(null);
  const pWaveRef2            = useRef<THREE.Mesh>(null);
  const sWaveRef1            = useRef<THREE.Mesh>(null);
  const sWaveRef2            = useRef<THREE.Mesh>(null);
  const buildingRef          = useRef<THREE.Group>(null);
  const dustParticlesRef     = useRef<THREE.InstancedMesh>(null);
  const sparkParticlesRef    = useRef<THREE.InstancedMesh>(null);
  const sirenLightRef        = useRef<THREE.PointLight>(null);

  // Cutaway View Mode: Default true so the cross-section process is crystal clear!
  const [internalShowCutaway] = useState(true);
  const showCutaway = externalCutaway !== undefined ? externalCutaway : internalShowCutaway;

  // ─── STAGE VARIABLES ───
  const isNormal      = earthquakeStage === 0;
  const isStress      = earthquakeStage === 1;
  const isRupture     = earthquakeStage === 2;
  const isPWave       = earthquakeStage === 3;
  const isSWave       = earthquakeStage === 4;
  const isMitigation  = earthquakeStage === 5;
  const isAftermath   = earthquakeStage === 6;

  const isQuaking = isPWave || isSWave || isMitigation || (isSimulating && earthquakeStage > 0);

  // ─── PARTICLES SETUP ───
  const dustCount = 60;
  const sparkCount = 35;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const dustData = useMemo(() => {
    return Array.from({ length: dustCount }).map(() => ({
      x: (Math.random() - 0.5) * 14.0,
      y: Math.random() * 3.5 + 0.2,
      z: (Math.random() - 0.5) * 10.0,
      speed: Math.random() * 0.04 + 0.015,
      scale: Math.random() * 0.12 + 0.04
    }));
  }, [dustCount]);

  const sparkData = useMemo(() => {
    return Array.from({ length: sparkCount }).map(() => ({
      x: -1.2 + (Math.random() - 0.5) * 0.3,
      y: 3.8 + (Math.random() - 0.5) * 0.3,
      z: 1.0 + (Math.random() - 0.5) * 0.3,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      vz: (Math.random() - 0.5) * 0.15,
      life: Math.random()
    }));
  }, [sparkCount]);

  // ─── INITIALIZE INSTANCED PARTICLES (Prevents default (0,0,0) lump artifacts) ───
  useEffect(() => {
    if (dustParticlesRef.current) {
      dustData.forEach((p, i) => {
        dummy.position.set(p.x, p.y, p.z);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        dustParticlesRef.current!.setMatrixAt(i, dummy.matrix);
      });
      dustParticlesRef.current.instanceMatrix.needsUpdate = true;
    }
    if (sparkParticlesRef.current) {
      sparkData.forEach((s, i) => {
        dummy.position.set(s.x, s.y, s.z);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        sparkParticlesRef.current!.setMatrixAt(i, dummy.matrix);
      });
      sparkParticlesRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [dummy, dustData, sparkData]);

  // ─── AUDIO ENGINE INTEGRATION ───
  useEffect(() => {
    if (isRupture) {
      soundEngine.playEarthquakeRumble(3);
    } else if (isSWave) {
      soundEngine.playEarthquakeRumble(6);
    } else if (isPWave) {
      soundEngine.playEarthquakeRumble(2);
    }
  }, [earthquakeStage, isRupture, isSWave, isPWave]);

  // ─── FRAME ANIMATION LOOP ───
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // 1. Hypocenter Pulsing & Energy Release
    if (hypocenterCoreRef.current) {
      if (isStress) {
        const pulse = 1.0 + Math.sin(t * 4.0) * 0.25;
        hypocenterCoreRef.current.scale.set(pulse, pulse, pulse);
      } else if (isRupture) {
        const pulse = 1.6 + Math.sin(t * 12.0) * 0.5;
        hypocenterCoreRef.current.scale.set(pulse, pulse, pulse);
      } else if (isSWave) {
        const pulse = 1.2 + Math.sin(t * 8.0) * 0.3;
        hypocenterCoreRef.current.scale.set(pulse, pulse, pulse);
      } else {
        hypocenterCoreRef.current.scale.set(1.0, 1.0, 1.0);
      }
    }

    if (hypocenterLightRef.current) {
      if (isStress) {
        hypocenterLightRef.current.intensity = 6.0 + Math.sin(t * 5.0) * 3.0;
        hypocenterLightRef.current.color.set('#f59e0b');
      } else if (isRupture) {
        hypocenterLightRef.current.intensity = 18.0 + Math.sin(t * 20.0) * 8.0;
        hypocenterLightRef.current.color.set('#ef4444');
      } else if (isPWave) {
        hypocenterLightRef.current.intensity = 10.0 + Math.sin(t * 10.0) * 4.0;
        hypocenterLightRef.current.color.set('#38bdf8');
      } else if (isSWave) {
        hypocenterLightRef.current.intensity = 16.0 + Math.sin(t * 14.0) * 5.0;
        hypocenterLightRef.current.color.set('#dc2626');
      } else {
        hypocenterLightRef.current.intensity = isNormal ? 1.5 : 3.5;
        hypocenterLightRef.current.color.set('#eab308');
      }
    }

    // 2. Expanding P-Wave Spheres
    if (pWaveRef1.current && pWaveRef2.current) {
      if (isPWave || isRupture || (isSimulating && earthquakeStage >= 2 && earthquakeStage <= 5)) {
        pWaveRef1.current.visible = true;
        pWaveRef2.current.visible = true;

        const speedP = 3.8;
        const radius1 = ((t * speedP) % 8.5) + 0.5;
        const radius2 = (((t * speedP) + 4.25) % 8.5) + 0.5;

        pWaveRef1.current.scale.set(radius1, radius1, radius1);
        pWaveRef2.current.scale.set(radius2, radius2, radius2);

        const op1 = Math.max(0, 1.0 - radius1 / 8.5);
        const op2 = Math.max(0, 1.0 - radius2 / 8.5);
        (pWaveRef1.current.material as THREE.MeshBasicMaterial).opacity = op1 * 0.75;
        (pWaveRef2.current.material as THREE.MeshBasicMaterial).opacity = op2 * 0.75;
      } else {
        pWaveRef1.current.visible = false;
        pWaveRef2.current.visible = false;
      }
    }

    // 3. Expanding S-Wave Spheres (Violent Shearing Waves)
    if (sWaveRef1.current && sWaveRef2.current) {
      if (isSWave || isMitigation || (isSimulating && earthquakeStage >= 3 && earthquakeStage <= 5)) {
        sWaveRef1.current.visible = true;
        sWaveRef2.current.visible = true;

        const speedS = 2.4;
        const radius1 = ((t * speedS) % 7.5) + 0.4;
        const radius2 = (((t * speedS) + 3.75) % 7.5) + 0.4;

        sWaveRef1.current.scale.set(radius1, radius1, radius1);
        sWaveRef2.current.scale.set(radius2, radius2, radius2);

        const op1 = Math.max(0, 1.0 - radius1 / 7.5);
        const op2 = Math.max(0, 1.0 - radius2 / 7.5);
        (sWaveRef1.current.material as THREE.MeshBasicMaterial).opacity = op1 * 0.9;
        (sWaveRef2.current.material as THREE.MeshBasicMaterial).opacity = op2 * 0.9;
      } else {
        sWaveRef1.current.visible = false;
        sWaveRef2.current.visible = false;
      }
    }

    // 4. Ground Seismic Motion & Multi-Harmonic Elastic Vibration
    if (groundGroupRef.current) {
      if (isSWave) {
        // High magnitude S-wave + surface wave rolling
        const shakeX = Math.sin(t * 14.0) * 0.12 + Math.cos(t * 22.0) * 0.06;
        const shakeY = Math.abs(Math.sin(t * 16.0) * Math.cos(t * 11.0)) * 0.05;
        const shakeZ = Math.cos(t * 12.0) * 0.09 + Math.sin(t * 26.0) * 0.04;
        groundGroupRef.current.position.set(shakeX, shakeY, shakeZ);
        groundGroupRef.current.rotation.set(
          Math.sin(t * 10.0) * 0.018,
          0,
          Math.cos(t * 12.0) * 0.022
        );
      } else if (isPWave) {
        // Fast vertical P-wave compression tremor
        const shakeY = Math.sin(t * 28.0) * 0.035;
        const shakeX = Math.cos(t * 24.0) * 0.02;
        groundGroupRef.current.position.set(shakeX, shakeY, 0);
        groundGroupRef.current.rotation.set(0, 0, 0);
      } else if (isMitigation) {
        // Moderate shaking during mitigation
        const shakeX = Math.sin(t * 9.0) * 0.04;
        const shakeZ = Math.cos(t * 8.0) * 0.03;
        groundGroupRef.current.position.set(shakeX, 0, shakeZ);
        groundGroupRef.current.rotation.set(0, 0, 0);
      } else if (isAftermath) {
        // Occasional gentle aftershock
        const aftershock = Math.sin(t * 2.0) > 0.7 ? Math.sin(t * 14.0) * 0.02 : 0;
        groundGroupRef.current.position.set(aftershock, 0, 0);
        groundGroupRef.current.rotation.set(0, 0, 0);
      } else {
        groundGroupRef.current.position.set(0, 0, 0);
        groundGroupRef.current.rotation.set(0, 0, 0);
      }
    }

    // 5. Tectonic Plate Relative Dislocation (Slip along Fault Line)
    if (leftPlateref.current && rightPlateRef.current) {
      if (earthquakeStage >= 2) {
        const slip = isStress ? 0 : Math.min(0.28, (earthquakeStage - 1.5) * 0.09);
        leftPlateref.current.position.y = -slip * 0.5;
        leftPlateref.current.position.x = -slip * 0.4;
        rightPlateRef.current.position.y = slip * 0.5;
        rightPlateRef.current.position.x = slip * 0.4;
      } else {
        leftPlateref.current.position.set(0, 0, 0);
        rightPlateRef.current.position.set(0, 0, 0);
      }
    }

    // 6. Multi-Story Building Harmonic Resonance Sway
    if (buildingRef.current) {
      if (isSWave) {
        const swayZ = Math.sin(t * 6.5) * 0.08 + Math.cos(t * 11.0) * 0.04;
        const swayX = Math.cos(t * 5.8) * 0.07 + Math.sin(t * 9.5) * 0.03;
        buildingRef.current.rotation.z = swayZ;
        buildingRef.current.rotation.x = swayX;
      } else if (isPWave) {
        buildingRef.current.rotation.z = Math.sin(t * 18.0) * 0.02;
        buildingRef.current.rotation.x = 0;
      } else if (isMitigation) {
        buildingRef.current.rotation.z = Math.sin(t * 5.0) * 0.025;
        buildingRef.current.rotation.x = 0;
      } else {
        buildingRef.current.rotation.set(0, 0, 0);
      }
    }

    // 7. Instanced Dust Particles rising from Ground/Fissures
    if (dustParticlesRef.current && isQuaking) {
      dustData.forEach((p, i) => {
        p.y += p.speed * (isSWave ? 1.8 : 0.8);
        if (p.y > 3.8) {
          p.y = 0.1;
          p.x = (Math.random() - 0.5) * 14.0;
          p.z = (Math.random() - 0.5) * 10.0;
        }
        dummy.position.set(p.x, p.y, p.z);
        dummy.scale.set(p.scale, p.scale, p.scale);
        dummy.updateMatrix();
        dustParticlesRef.current!.setMatrixAt(i, dummy.matrix);
      });
      dustParticlesRef.current.instanceMatrix.needsUpdate = true;
    }

    // 8. Electrical Sparks from Power Transformer
    if (sparkParticlesRef.current && isSWave) {
      sparkData.forEach((s, i) => {
        s.life -= delta * 2.0;
        s.x += s.vx;
        s.y += s.vy - delta * 0.8; // gravity
        s.z += s.vz;
        if (s.life <= 0) {
          s.life = 1.0;
          s.x = -1.2 + (Math.random() - 0.5) * 0.3;
          s.y = 3.8 + (Math.random() - 0.5) * 0.3;
          s.z = 1.0 + (Math.random() - 0.5) * 0.3;
        }
        dummy.position.set(s.x, s.y, s.z);
        dummy.scale.set(0.04 * s.life, 0.04 * s.life, 0.04 * s.life);
        dummy.updateMatrix();
        sparkParticlesRef.current!.setMatrixAt(i, dummy.matrix);
      });
      sparkParticlesRef.current.instanceMatrix.needsUpdate = true;
    }

    // 9. Siren Light Flash
    if (sirenLightRef.current) {
      sirenLightRef.current.intensity = (isSWave || isMitigation || isAftermath)
        ? (Math.sin(t * 12.0) > 0 ? 5.0 : 0.4)
        : 0;
    }
  });

  const swayValue = isSWave ? 1.0 : isPWave ? 0.3 : isMitigation ? 0.5 : 0;

  return (
    <group>
      <EarthquakeSceneSetup stage={earthquakeStage} />

      {/* ─── SCENE LIGHTING ─── */}
      <ambientLight intensity={1.2} color="#f8fafc" />
      <hemisphereLight args={['#ffffff', '#64748b', 1.1]} />
      <directionalLight 
        position={[14, 22, 12]} 
        intensity={2.4} 
        color="#ffffff" 
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-12, 10, -8]} intensity={1.2} color="#38bdf8" />

      {/* Emergency Siren Light */}
      <pointLight ref={sirenLightRef} position={[4.0, 2.5, 3.5]} color="#ef4444" distance={15} />

      {/* ─── MAIN DIORAMA GROUP (With Dynamic Seismic Shake) ─── */}
      <group ref={groundGroupRef} position={[0, -0.4, 0]}>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 1. UNDERGROUND GEOLOGICAL STRATA & CRUST CUTAWAY BLOCK             */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <group>
          {/* Main Topsoil & Surface Ground Block (X: [-11, 11], Z: [-7.5, 7.5]) */}
          <mesh position={[0, -0.4, 0]} receiveShadow>
            <boxGeometry args={[22, 0.8, 15]} />
            <meshStandardMaterial color="#3f6212" roughness={0.85} />
          </mesh>

          {/* Sandstone / Clay Strata Layer */}
          <mesh position={[0, -1.6, 0]}>
            <boxGeometry args={[21.95, 1.6, 14.95]} />
            <meshStandardMaterial color="#854d0e" roughness={0.9} />
          </mesh>

          {/* Deep Crystalline Basaltic Bedrock Layer */}
          <mesh position={[0, -3.4, 0]}>
            <boxGeometry args={[21.9, 2.0, 14.9]} />
            <meshStandardMaterial color="#1e293b" roughness={0.95} />
          </mesh>

          {/* Solid Diorama Foundation Pedestal Base */}
          <mesh position={[0, -4.6, 0]}>
            <boxGeometry args={[22.4, 0.4, 15.4]} />
            <meshStandardMaterial color="#090d16" roughness={0.7} metalness={0.2} />
          </mesh>

          {/* Back Wall & Side Foundation Skirt Bevels */}
          <mesh position={[0, -2.4, -7.55]}>
            <boxGeometry args={[22.1, 4.8, 0.1]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh position={[-11.05, -2.4, 0]}>
            <boxGeometry args={[0.1, 4.8, 15.1]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh position={[11.05, -2.4, 0]}>
            <boxGeometry args={[0.1, 4.8, 15.1]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>

          {/* ─── FRONT CUTAWAY GEOLOGICAL SECTION (Visible from front Z = 7.55) ─── */}
          {showCutaway ? (
            <group position={[0, 0, 7.56]}>
              {/* Topsoil Layer Cross-Section */}
              <mesh position={[0, -0.4, 0]}>
                <boxGeometry args={[22.0, 0.8, 0.04]} />
                <meshStandardMaterial color="#4d7c0f" roughness={0.7} />
              </mesh>
              {/* Mid-Crust Sandstone & Clay Strata Layer */}
              <mesh position={[0, -1.6, 0]}>
                <boxGeometry args={[22.0, 1.6, 0.04]} />
                <meshStandardMaterial color="#a16207" roughness={0.8} />
              </mesh>
              {/* Deep Bedrock Lithosphere Layer */}
              <mesh position={[0, -3.3, 0]}>
                <boxGeometry args={[22.0, 1.8, 0.04]} />
                <meshStandardMaterial color="#1e293b" roughness={0.9} />
              </mesh>
              {/* Asthenosphere / Upper Mantle (Magma/Heat Zone) */}
              <mesh position={[0, -4.3, 0]}>
                <boxGeometry args={[22.0, 0.4, 0.04]} />
                <meshStandardMaterial 
                  color="#7c2d12" 
                  emissive="#9a3412" 
                  emissiveIntensity={0.6} 
                  roughness={0.6} 
                />
              </mesh>

              {/* ── ACTIVE FAULT PLANE (DIAGONAL CUTAWAY SLIP LINE) ── */}
              <group position={[-0.8, -2.4, 0.03]} rotation={[0, 0, -0.55]}>
                {/* Fault Rupture Interface Line */}
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.18, 5.5, 0.06]} />
                  <meshStandardMaterial 
                    color={isStress ? "#f59e0b" : isRupture ? "#ef4444" : isSWave ? "#dc2626" : "#e2e8f0"} 
                    emissive={isStress ? "#f59e0b" : isRupture ? "#ef4444" : isSWave ? "#ef4444" : "#f59e0b"}
                    emissiveIntensity={isRupture ? 5.0 : isStress ? 3.0 : isSWave ? 4.0 : 1.2}
                    roughness={0.2}
                  />
                </mesh>

                {/* Stress Accumulation Compression Vectors (Stage 1) */}
                {isStress && (
                  <group position={[0, 0, 0.04]}>
                    {[-1.5, 0, 1.5].map((vy, i) => (
                      <group key={`vec-${i}`} position={[0, vy, 0]}>
                        <mesh position={[-0.45, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                          <coneGeometry args={[0.15, 0.35, 6]} />
                          <meshBasicMaterial color="#eab308" />
                        </mesh>
                        <mesh position={[0.45, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                          <coneGeometry args={[0.15, 0.35, 6]} />
                          <meshBasicMaterial color="#ef4444" />
                        </mesh>
                      </group>
                    ))}
                  </group>
                )}
              </group>

              {/* ── HYPOCENTER / FOKUS GEMPA (Prominent Glowing Sphere on Front Cutaway) ── */}
              <group position={[-0.8, -2.8, 0.08]}>
                <mesh ref={hypocenterCoreRef}>
                  <sphereGeometry args={[0.48, 20, 20]} />
                  <meshStandardMaterial 
                    color="#ef4444" 
                    emissive="#f97316" 
                    emissiveIntensity={isRupture ? 8.0 : isStress ? 4.5 : 2.5}
                    roughness={0.1}
                  />
                </mesh>
                {/* Glowing Wireframe Energy Halo */}
                <mesh scale={[1.45, 1.45, 1.45]}>
                  <sphereGeometry args={[0.48, 14, 14]} />
                  <meshBasicMaterial 
                    color="#ef4444" 
                    wireframe 
                    transparent 
                    opacity={isRupture ? 0.85 : isStress ? 0.6 : 0.35} 
                  />
                </mesh>
                <pointLight 
                  ref={hypocenterLightRef} 
                  position={[0, 0, 0.2]} 
                  color="#ef4444" 
                  intensity={6.0} 
                  distance={14} 
                />

                {/* Expanding P-Wave Rings (Cyan Blue) */}
                <mesh ref={pWaveRef1} visible={false}>
                  <ringGeometry args={[0.9, 1.05, 32]} />
                  <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} transparent opacity={0.8} />
                </mesh>
                <mesh ref={pWaveRef2} visible={false}>
                  <ringGeometry args={[0.9, 1.05, 32]} />
                  <meshBasicMaterial color="#0284c7" side={THREE.DoubleSide} transparent opacity={0.8} />
                </mesh>

                {/* Expanding S-Wave Rings (Orange Red) */}
                <mesh ref={sWaveRef1} visible={false}>
                  <ringGeometry args={[0.85, 1.15, 32]} />
                  <meshBasicMaterial color="#f97316" side={THREE.DoubleSide} transparent opacity={0.9} />
                </mesh>
                <mesh ref={sWaveRef2} visible={false}>
                  <ringGeometry args={[0.85, 1.15, 32]} />
                  <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} transparent opacity={0.9} />
                </mesh>
              </group>

              {/* Vertical Seismic Depth Axis Beam (Linking Hypocenter to Epicenter) */}
              <mesh position={[-0.8, -1.4, 0.04]}>
                <cylinderGeometry args={[0.04, 0.04, 2.8, 8]} />
                <meshStandardMaterial 
                  color="#ef4444" 
                  emissive="#f97316" 
                  emissiveIntensity={isRupture || isPWave || isSWave ? 4.0 : 1.5} 
                  transparent 
                  opacity={0.85} 
                />
              </mesh>
            </group>
          ) : (
            /* Clean Solid Front Face when Cutaway is Hidden */
            <mesh position={[0, -2.4, 7.55]}>
              <boxGeometry args={[22.1, 4.8, 0.1]} />
              <meshStandardMaterial color="#0f172a" roughness={0.9} />
            </mesh>
          )}
        </group>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 2. SURFACE EPICENTER TARGET & ROADWAY INFRASTRUCTURE               */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <group>
          {/* EPISENTER MARKER (Directly above hypocenter on surface, only when Tampilkan Proses is active) */}
          {showCutaway && (
            <group position={[-0.8, 0.05, 0.5]}>
              {/* Concentric Seismic Wave Pulse Rings on Surface */}
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.3, 0.45, 32]} />
                <meshBasicMaterial 
                  color={isSWave ? "#ef4444" : isPWave ? "#38bdf8" : "#f59e0b"} 
                  side={THREE.DoubleSide} 
                  transparent
                  opacity={isQuaking ? 0.9 : 0.5}
                />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.9, 1.05, 32]} />
                <meshBasicMaterial 
                  color={isSWave ? "#ef4444" : isPWave ? "#38bdf8" : "#f59e0b"} 
                  side={THREE.DoubleSide} 
                  transparent 
                  opacity={isQuaking ? 0.6 : 0.3} 
                />
              </mesh>
            </group>
          )}

          {/* Asphalt Main Road traversing city */}
          <group position={[0, 0.02, 0.5]}>
            <mesh receiveShadow>
              <boxGeometry args={[22, 0.03, 3.2]} />
              <meshStandardMaterial color="#1e293b" roughness={0.7} />
            </mesh>
            {/* White Road Center Dash Lines */}
            {[-9, -6, -3, 0, 3, 6, 9].map((dx, i) => (
              <mesh key={`dash-${i}`} position={[dx, 0.02, 0]}>
                <boxGeometry args={[1.5, 0.01, 0.15]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.4} />
              </mesh>
            ))}
            {/* Pedestrian Crosswalk (Zebra Cross) */}
            <group position={[-0.8, 0.02, 0]}>
              {[-1.2, -0.7, -0.2, 0.3, 0.8, 1.2].map((zx, i) => (
                <mesh key={`cross-${i}`} position={[0, 0, zx]}>
                  <boxGeometry args={[0.4, 0.01, 0.3]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.3} />
                </mesh>
              ))}
            </group>
            {/* Sidewalk Curbs */}
            <mesh position={[0, 0.05, 1.75]}>
              <boxGeometry args={[22, 0.08, 0.3]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.05, -1.75]}>
              <boxGeometry args={[22, 0.08, 0.3]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.6} />
            </mesh>
          </group>

          {/* Realistic Dynamic Surface Ground Fissure / Retakan Sesar Aktif */}
          <RealisticFaultFissure stage={earthquakeStage} />
        </group>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 3. SURFACE URBAN SETTLEMENT & MITIGATION STRUCTURES                 */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        
        {/* ─── LEFT PLATE OBJECTS (Modern Building with Drop-Cover-Hold Interior) ─── */}
        <group ref={leftPlateref}>
          {/* MODERN MULTI-STORY BUILDING WITH OPEN ARCHITECTURAL CUTAWAY */}
          <group ref={buildingRef} position={[-5.5, 0, -3.2]}>
            {/* Back & Side Concrete Walls */}
            <mesh position={[0, 2.2, -2.0]}>
              <boxGeometry args={[4.8, 4.4, 0.2]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
            </mesh>
            <mesh position={[-2.3, 2.2, 0]}>
              <boxGeometry args={[0.2, 4.4, 4.2]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
            </mesh>
            <mesh position={[2.3, 2.2, 0]}>
              <boxGeometry args={[0.2, 4.4, 4.2]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
            </mesh>

            {/* Architectural Frame Columns on Front Corners */}
            <mesh position={[-2.3, 2.2, 2.0]}>
              <boxGeometry args={[0.25, 4.4, 0.25]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh position={[2.3, 2.2, 2.0]}>
              <boxGeometry args={[0.25, 4.4, 0.25]} />
              <meshStandardMaterial color="#475569" />
            </mesh>

            {/* Floor Slabs */}
            <mesh position={[0, 1.45, 0]}>
              <boxGeometry args={[4.7, 0.15, 4.1]} />
              <meshStandardMaterial color="#64748b" />
            </mesh>
            <mesh position={[0, 2.95, 0]}>
              <boxGeometry args={[4.7, 0.15, 4.1]} />
              <meshStandardMaterial color="#64748b" />
            </mesh>

            {/* Column shear stress cracks during earthquake */}
            {earthquakeStage >= 4 && (
              <group>
                <mesh position={[-2.3, 0.6, 2.14]} rotation={[0, 0, 0.4]}>
                  <boxGeometry args={[0.26, 0.02, 0.02]} />
                  <meshStandardMaterial color="#0f172a" />
                </mesh>
                <mesh position={[2.3, 0.7, 2.14]} rotation={[0, 0, -0.45]}>
                  <boxGeometry args={[0.26, 0.02, 0.02]} />
                  <meshStandardMaterial color="#0f172a" />
                </mesh>
              </group>
            )}

            {/* Ground Floor Interior: STURDY DESKS & DROP-COVER-HOLD MITIGATION */}
            <group position={[0, 0, 0.6]}>
              {/* Sturdy Wooden Desk 1 */}
              <group position={[-1.1, 0, 0]}>
                {/* Tabletop */}
                <mesh position={[0, 0.72, 0]}>
                  <boxGeometry args={[1.3, 0.08, 0.8]} />
                  <meshStandardMaterial color="#78350f" roughness={0.6} />
                </mesh>
                {/* 4 Sturdy Steel Legs */}
                {[[-0.55, -0.3], [0.55, -0.3], [-0.55, 0.3], [0.55, 0.3]].map(([lx, lz], i) => (
                  <mesh key={`leg1-${i}`} position={[lx, 0.36, lz]}>
                    <cylinderGeometry args={[0.03, 0.03, 0.68, 6]} />
                    <meshStandardMaterial color="#334155" metalness={0.8} />
                  </mesh>
                ))}
                {/* Person Crouching Under Desk (Drop, Cover, Hold On) */}
                <HumanFigure 
                  position={[0, 0.02, 0]} 
                  pose={earthquakeStage >= 4 ? 'CROUCH' : 'STAND'} 
                  color="#0284c7" 
                />

                {/* Protective Green Safety Shield Aura during Stage 5 */}
                {isMitigation && (
                  <mesh position={[0, 0.45, 0]}>
                    <sphereGeometry args={[0.75, 14, 14]} />
                    <meshBasicMaterial color="#22c55e" wireframe transparent opacity={0.7} />
                  </mesh>
                )}
              </group>

              {/* Sturdy Desk 2 */}
              <group position={[1.1, 0, 0]}>
                <mesh position={[0, 0.72, 0]}>
                  <boxGeometry args={[1.3, 0.08, 0.8]} />
                  <meshStandardMaterial color="#78350f" roughness={0.6} />
                </mesh>
                {[[-0.55, -0.3], [0.55, -0.3], [-0.55, 0.3], [0.55, 0.3]].map(([lx, lz], i) => (
                  <mesh key={`leg2-${i}`} position={[lx, 0.36, lz]}>
                    <cylinderGeometry args={[0.03, 0.03, 0.68, 6]} />
                    <meshStandardMaterial color="#334155" metalness={0.8} />
                  </mesh>
                ))}
                <HumanFigure 
                  position={[0, 0.02, 0]} 
                  pose={earthquakeStage >= 4 ? 'CROUCH' : 'STAND'} 
                  color="#ea580c" 
                />

                {isMitigation && (
                  <mesh position={[0, 0.45, 0]}>
                    <sphereGeometry args={[0.75, 14, 14]} />
                    <meshBasicMaterial color="#22c55e" wireframe transparent opacity={0.7} />
                  </mesh>
                )}
              </group>
            </group>

            {/* Rooftop Parapet */}
            <mesh position={[0, 4.5, 0]}>
              <boxGeometry args={[4.8, 0.2, 4.2]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
          </group>

          {/* Residential House 1 (Safely on spacious green lawn with realistic earthquake damage) */}
          <ResidentialHouse 
            position={[-8.0, 0, 4.8]} 
            rotationY={0} 
            sway={swayValue} 
            isDamaged={earthquakeStage >= 4} 
          />

          {/* Electric Utility Pole 1 (Beside fault rupture line, tilted with damage when stage >= 4) */}
          <UtilityPole 
            position={[-1.2, 0, 1.8]} 
            sway={swayValue} 
            isSparking={isSWave} 
            isDamaged={earthquakeStage >= 4}
          />
        </group>

        {/* ─── RIGHT PLATE OBJECTS (School, Assembly Point & SAR Post) ─── */}
        <group ref={rightPlateRef}>
          {/* INDONESIAN SCHOOL BUILDING (SD / SMP) */}
          <group position={[4.2, 0, -3.2]}>
            <mesh position={[0, 1.2, 0]}>
              <boxGeometry args={[5.2, 2.4, 3.2]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.5} />
            </mesh>
            {/* Terracotta Roof */}
            <mesh position={[0, 2.8, 0]} rotation={earthquakeStage >= 4 ? [0.02, 0, -0.03] : [0, 0, 0]}>
              <boxGeometry args={[5.6, 0.8, 3.6]} />
              <meshStandardMaterial color="#ea580c" roughness={0.5} />
            </mesh>

            {/* School Seismic Damage: Diagonal facade cracks & fallen plaster rubble */}
            {earthquakeStage >= 4 && (
              <group>
                <mesh position={[-1.2, 1.3, 1.62]} rotation={[0, 0, 0.6]}>
                  <boxGeometry args={[1.4, 0.03, 0.02]} />
                  <meshStandardMaterial color="#0f172a" roughness={0.9} />
                </mesh>
                <mesh position={[1.5, 1.1, 1.62]} rotation={[0, 0, -0.55]}>
                  <boxGeometry args={[1.1, 0.025, 0.02]} />
                  <meshStandardMaterial color="#1e293b" roughness={0.9} />
                </mesh>
                <mesh position={[-1.2, 0.05, 1.8]} rotation={[0.2, 0.4, 0]}>
                  <boxGeometry args={[0.2, 0.08, 0.15]} />
                  <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
                </mesh>
                <mesh position={[1.4, 0.04, 1.75]} rotation={[-0.1, 0.6, 0.3]}>
                  <boxGeometry args={[0.18, 0.06, 0.14]} />
                  <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
                </mesh>
              </group>
            )}

            {/* Indonesian Flag Pole (Tiang Bendera Merah Putih) */}
            <group position={[0, 0, 2.4]}>
              <mesh position={[0, 1.8, 0]}>
                <cylinderGeometry args={[0.03, 0.04, 3.6, 6]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.8} />
              </mesh>
              {/* Red White Flag */}
              <group position={[0.4, 3.2, 0]}>
                <mesh position={[0, 0.18, 0]}>
                  <boxGeometry args={[0.7, 0.35, 0.02]} />
                  <meshStandardMaterial color="#ef4444" roughness={0.4} />
                </mesh>
                <mesh position={[0, -0.18, 0]}>
                  <boxGeometry args={[0.7, 0.35, 0.02]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.4} />
                </mesh>
              </group>
            </group>
          </group>

          {/* OPEN EVACUATION ASSEMBLY POINT (Safely on spacious open green field, far from cracks & roads) */}
          {earthquakeStage >= 4 && (
            <group position={[6.5, 0, 4.8]}>
              {/* Green Lawn Circle for Assembly */}
              <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[2.5, 32]} />
                <meshStandardMaterial color="#15803d" roughness={0.8} />
              </mesh>

              {/* Painted White Circular Assembly Target (Encircling evacuees) */}
              <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.9, 1.15, 32]} />
                <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
              </mesh>

              {/* Assembly Point Signpost (Front-left) */}
              <group position={[-1.5, 0, 1.3]}>
                <mesh position={[0, 0.9, 0]}>
                  <cylinderGeometry args={[0.04, 0.04, 1.8, 6]} />
                  <meshStandardMaterial color="#94a3b8" />
                </mesh>
                <mesh position={[0, 1.8, 0]}>
                  <boxGeometry args={[0.6, 0.6, 0.04]} />
                  <meshStandardMaterial color="#16a34a" />
                </mesh>
              </group>

              {/* Emergency Medical Tent / Posko Darurat BPBD (Positioned with generous clearance on the left) */}
              <group position={[-1.7, 0, 0]} rotation={[0, 0, 0]}>
                <mesh position={[0, 0.65, 0]}>
                  <boxGeometry args={[1.3, 1.3, 1.3]} />
                  <meshStandardMaterial color="#ea580c" roughness={0.6} />
                </mesh>
                <mesh position={[0, 1.5, 0]} rotation={[0, Math.PI / 4, 0]}>
                  <coneGeometry args={[1.15, 0.7, 4]} />
                  <meshStandardMaterial color="#f97316" roughness={0.6} />
                </mesh>
              </group>

              {/* BPBD / SAR Rescue Ambulance Vehicle (Parked with generous clearance on the right) */}
              <RescueVehicle 
                position={[1.8, 0, 0]} 
                rotationY={0} 
                strobe={isSWave || isMitigation || isAftermath} 
              />

              {/* Group of Sheltered Citizens at Assembly Point (Safely in open center ring, zero overlap) */}
              <group position={[0, 0, 0]}>
                <HumanFigure position={[-0.3, 0, 0.25]} pose="STAND" color="#38bdf8" />
                <HumanFigure position={[0.3, 0, 0.25]} pose="STAND" color="#f43f5e" />
                <HumanFigure position={[0, 0, -0.35]} pose="STAND" color="#eab308" />
                <HumanFigure position={[0, 0, 0.35]} pose="STAND" color="#22c55e" />
              </group>
            </group>
          )}

          {/* Electric Utility Pole 2 */}
          <UtilityPole 
            position={[8.5, 0, 1.8]} 
            sway={swayValue} 
            isSparking={false} 
          />
        </group>

        {/* ─── TREES & URBAN LANDSCAPING ─── */}
        <ShadeTree position={[-9.5, 0, -5.5]} scale={1.2} sway={swayValue} />
        <ShadeTree position={[-2.5, 0, -5.8]} scale={1.0} sway={swayValue} />
        <PalmTree position={[8.8, 0, -5.2]} scale={1.1} sway={swayValue} />
        {/* Palm tree shifted safely to the corner away from Residential House at [-8.0, 0, 4.8] */}
        <PalmTree position={[-10.5, 0, 4.8]} scale={1.0} sway={swayValue} />
        <ShadeTree position={[9.5, 0, 5.2]} scale={1.0} sway={swayValue} />

        {/* ─── INSTANCED DUST PARTICLES ─── */}
        <instancedMesh ref={dustParticlesRef} args={[undefined, undefined, dustCount]} visible={isQuaking}>
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshStandardMaterial color="#94a3b8" transparent opacity={0.45} roughness={0.9} />
        </instancedMesh>

        {/* ─── INSTANCED ELECTRICAL SPARKS ─── */}
        <instancedMesh ref={sparkParticlesRef} args={[undefined, undefined, sparkCount]} visible={isSWave}>
          <boxGeometry args={[0.04, 0.04, 0.04]} />
          <meshBasicMaterial color="#38bdf8" />
        </instancedMesh>

      </group>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 4. 3D HUD PROCESS LABELS (When "Tampilkan Proses" is Active)        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showCutaway && (
        <group>
          {/* Label 1: Hypocenter / Fokus Gempa */}
          <Html position={[-0.8, -3.2, 7.8]} center distanceFactor={8.5}>
            <div className="px-3 py-1.5 rounded-xl bg-red-950 text-white font-black text-[10.5px] tracking-wider border border-red-600 shadow-md whitespace-nowrap pointer-events-none">
              💥 Hiposentrum (Fokus Gempa - Kedalaman 15 km)
            </div>
          </Html>

          {/* Label 2: Active Fault Plane */}
          <Html position={[-3.8, -1.6, 7.8]} center distanceFactor={8.5}>
            <div className="px-2.5 py-1.5 rounded-xl bg-amber-950 text-amber-200 font-bold text-[10px] tracking-wider border border-amber-600 shadow-md whitespace-nowrap pointer-events-none">
              ⚡ Bidang Patahan Sesar Aktif (Fault Plane Friction & Slip)
            </div>
          </Html>

          {/* Label 3: Epicenter on Surface */}
          <Html position={[-0.8, 0.8, 0.5]} center distanceFactor={8.5}>
            <div className="px-3 py-1.5 rounded-xl bg-zinc-900 text-white font-black text-[10.5px] tracking-wider border border-zinc-700 shadow-md whitespace-nowrap pointer-events-none">
              🎯 Episentrum (Titik Pusat Permukaan)
            </div>
          </Html>

          {/* Label 4: Drop, Cover, Hold On Indoor Mitigation */}
          <Html position={[-5.5, 3.2, -1.0]} center distanceFactor={8.5}>
            <div className="px-2.5 py-1.5 rounded-xl bg-emerald-950 text-emerald-200 font-bold text-[10px] tracking-wider border border-emerald-600 shadow-md whitespace-nowrap pointer-events-none">
              🛡️ Zona Mitigasi: Drop, Cover, Hold On (Bawah Meja)
            </div>
          </Html>

          {/* Label 5: Open Evacuation Assembly Point */}
          <Html position={[6.5, 2.2, 4.8]} center distanceFactor={8.5}>
            <div className="px-3 py-1.5 rounded-xl bg-blue-950 text-blue-200 font-bold text-[10px] tracking-wider border border-blue-600 shadow-md whitespace-nowrap pointer-events-none">
              📍 Titik Kumpul Terbuka (Bebas Bahaya Bangunan & Kaca)
            </div>
          </Html>
        </group>
      )}

      {/* Interactive Mitigation Action Prompt Button */}
      <Html position={[-5.5, 4.8, -1.0]} center distanceFactor={8.5}>
        <button
          onClick={() => {
            soundEngine.playClick();
            if (onActionClick) onActionClick('DROP_COVER_HOLD');
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md cursor-pointer hover:scale-105 transition-all whitespace-nowrap border-2 border-white pointer-events-auto"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white" />
          <span>DROP, COVER, HOLD ON (LINDUNGI DIRI DI BAWAH MEJA)</span>
        </button>
      </Html>
    </group>
  );
};
