import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ==========================================
// PROCEDURAL ANIMATED 3D SUB-COMPONENTS
// ==========================================

function ApWaves({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      groupRef.current.children.forEach((child, i) => {
        const progress = (t * 0.4 + i * 0.33) % 1;
        const scale = 0.1 + progress * 2.0;
        child.scale.set(scale, scale, 1);
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.MeshBasicMaterial;
        if (material) {
          material.opacity = (1 - progress) * 0.45;
        }
      });
    }
  });

  return (
    <group ref={groupRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
      {Array.from({ length: 3 }).map((_, i) => (
        <mesh key={i}>
          <ringGeometry args={[0.2, 0.25, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function CameraLed() {
  const ledRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ledRef.current) {
      ledRef.current.visible = Math.floor(clock.getElapsedTime() * 2.5) % 2 === 0;
    }
  });
  return (
    <mesh ref={ledRef} position={[0, -0.05, 0.08]}>
      <sphereGeometry args={[0.015, 8, 8]} />
      <meshBasicMaterial color="#ef4444" />
    </mesh>
  );
}

function PanelIndicator() {
  const ledRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ledRef.current) {
      const glow = 0.5 + Math.sin(clock.getElapsedTime() * 4) * 0.5;
      const mat = ledRef.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = glow;
    }
  });
  return (
    <mesh ref={ledRef} position={[0.08, 0.15, 0.041]}>
      <sphereGeometry args={[0.015, 8, 8]} />
      <meshBasicMaterial color="#eab308" transparent opacity={1} />
    </mesh>
  );
}

// ==========================================
// PROCEDURAL 3D MESH GENERATION PER TYPE
// ==========================================

export function ProceduralModel({ type, color }: { type: string; color: string }) {
  switch (type) {
    case 'toilet':
      return (
        <group position={[0, -0.1, 0]}>
          {/* Porcelain Tank */}
          <mesh position={[0, 0.25, -0.15]}>
            <boxGeometry args={[0.36, 0.45, 0.18]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.1} metalness={0.05} />
          </mesh>
          {/* Bowl base */}
          <mesh position={[0, 0.1, 0.1]}>
            <cylinderGeometry args={[0.16, 0.14, 0.28, 16]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.1} metalness={0.05} />
          </mesh>
          {/* Seat Lid */}
          <mesh position={[0, 0.25, 0.1]} rotation={[-0.05, 0, 0]}>
            <boxGeometry args={[0.34, 0.02, 0.36]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.15} />
          </mesh>
          {/* Flush handle */}
          <mesh position={[0.14, 0.4, -0.05]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.01, 0.01, 0.05, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      );
    case 'water':
    case 'mixer':
      return (
        <group position={[0, -0.15, 0]}>
          {/* Faucet body */}
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.15, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.05} />
          </mesh>
          {/* Curved spout */}
          <mesh position={[0, 0.16, 0.04]} rotation={[Math.PI / 4, 0, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.08, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.05} />
          </mesh>
          {/* Knobs */}
          <mesh position={[-0.05, 0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.012, 0.012, 0.03, 8]} />
            <meshStandardMaterial color="#ef4444" roughness={0.2} />
          </mesh>
          <mesh position={[0.05, 0.12, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.012, 0.012, 0.03, 8]} />
            <meshStandardMaterial color="#3b82f6" roughness={0.2} />
          </mesh>
          {/* Flowing water cylinder */}
          <mesh position={[0, -0.05, 0.06]}>
            <cylinderGeometry args={[0.008, 0.008, 0.12, 8]} />
            <meshBasicMaterial color="#60a5fa" transparent opacity={0.5} />
          </mesh>
        </group>
      );
    case 'light':
      return (
        <group>
          {/* Ceiling connection base */}
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.02, 12]} />
            <meshStandardMaterial color="#475569" roughness={0.8} />
          </mesh>
          {/* Hanging cord from ceiling */}
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.32, 8]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
          {/* Chrome socket */}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.04, 8]} />
            <meshStandardMaterial color="#d1d5db" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Glass bulb sphere */}
          <mesh position={[0, -0.04, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color="#fef08a" emissive="#eab308" emissiveIntensity={2.0} roughness={0.05} />
          </mesh>
          {/* Golden glow aura */}
          <mesh position={[0, -0.04, 0]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial color="#fef08a" transparent opacity={0.12} depthWrite={false} />
          </mesh>
        </group>
      );
    case 'socket':
      return (
        <group rotation={[0, 0, 0]} position={[0, 0, -0.01]}>
          {/* Base plate */}
          <mesh>
            <boxGeometry args={[0.14, 0.14, 0.016]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.2} />
          </mesh>
          {/* Left outlet recess */}
          <mesh position={[-0.03, 0, 0.009]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.003, 16]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
          </mesh>
          {/* Right outlet recess */}
          <mesh position={[0.03, 0, 0.009]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.003, 16]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
          </mesh>
          {/* Ground pin */}
          <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.006, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
        </group>
      );
    case 'switch':
      return (
        <group position={[0, 0, -0.01]}>
          {/* Base plate */}
          <mesh>
            <boxGeometry args={[0.14, 0.14, 0.016]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.25} />
          </mesh>
          {/* Tilted toggle rocker */}
          <mesh position={[0, 0, 0.009]} rotation={[0.12, 0, 0]}>
            <boxGeometry args={[0.06, 0.09, 0.01]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.15} />
          </mesh>
        </group>
      );
    case 'panel':
      return (
        <group>
          {/* Main Enclosure */}
          <mesh>
            <boxGeometry args={[0.35, 0.5, 0.08]} />
            <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.3} />
          </mesh>
          {/* Dark inner door panel */}
          <mesh position={[0, 0, 0.041]}>
            <boxGeometry args={[0.3, 0.44, 0.004]} />
            <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.2} />
          </mesh>
          {/* Status Indicators */}
          <mesh position={[-0.1, 0.18, 0.043]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
          <mesh position={[-0.06, 0.18, 0.043]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          {/* Animated blinking diagnostic warning indicator */}
          <PanelIndicator />
        </group>
      );
    case 'ethernet':
      return (
        <group position={[0, 0, -0.01]}>
          {/* Plate */}
          <mesh>
            <boxGeometry args={[0.14, 0.14, 0.016]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
          {/* RJ45 blue surround */}
          <mesh position={[0, 0, 0.009]}>
            <boxGeometry args={[0.05, 0.05, 0.004]} />
            <meshStandardMaterial color="#2563eb" roughness={0.4} />
          </mesh>
          {/* Dark RJ45 socket hole */}
          <mesh position={[0, 0, 0.011]}>
            <boxGeometry args={[0.026, 0.024, 0.003]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
        </group>
      );
    case 'ap':
      return (
        <group position={[0, 0, 0]}>
          {/* Sleek round AP disc */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.04, 24]} />
            <meshStandardMaterial color="#ffffff" roughness={0.15} />
          </mesh>
          {/* Pulsing blue LED status dot */}
          <mesh position={[0, 0.021, 0]}>
            <sphereGeometry args={[0.014, 8, 8]} />
            <meshBasicMaterial color="#22d3ee" />
          </mesh>
          {/* Beautiful interactive wireless pulsing waves! */}
          <ApWaves color={color} />
        </group>
      );
    case 'camera':
      return (
        <group position={[0, 0.05, 0]}>
          {/* Ceiling Mount Cover */}
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.016, 16]} />
            <meshStandardMaterial color="#475569" roughness={0.5} />
          </mesh>
          {/* Dark glass dome sphere */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.05} transparent opacity={0.8} />
          </mesh>
          {/* Blinking indicator LED */}
          <CameraLed />
        </group>
      );
    case 'solar_panel':
      return (
        <group rotation={[Math.PI / 6, 0, 0]}>
          {/* Silver framing */}
          <mesh>
            <boxGeometry args={[0.7, 1.0, 0.04]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.05} />
          </mesh>
          {/* Solar blue active grid */}
          <mesh position={[0, 0, 0.005]}>
            <boxGeometry args={[0.66, 0.96, 0.035]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.1} metalness={0.6} />
          </mesh>
          {/* Metallic stand struts */}
          <mesh position={[0, -0.3, -0.2]} rotation={[Math.PI / 3, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.5, 8]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
        </group>
      );
    case 'door':
      return (
        <group position={[0, 0, 0]}>
          {/* Left Frame Side */}
          <mesh position={[-0.45, 0.9, 0]}>
            <boxGeometry args={[0.05, 1.8, 0.08]} />
            <meshStandardMaterial color="#a16207" roughness={0.4} />
          </mesh>
          {/* Right Frame Side */}
          <mesh position={[0.45, 0.9, 0]}>
            <boxGeometry args={[0.05, 1.8, 0.08]} />
            <meshStandardMaterial color="#a16207" roughness={0.4} />
          </mesh>
          {/* Top header */}
          <mesh position={[0, 1.8, 0]}>
            <boxGeometry args={[0.95, 0.05, 0.08]} />
            <meshStandardMaterial color="#a16207" roughness={0.4} />
          </mesh>
          {/* Door panel slightly ajar (40 deg) */}
          <group position={[-0.42, 0, 0]} rotation={[0, Math.PI / 4.5, 0]}>
            <mesh position={[0.42, 0.9, 0]}>
              <boxGeometry args={[0.82, 1.76, 0.03]} />
              <meshStandardMaterial color="#d97706" roughness={0.35} />
            </mesh>
            {/* Gold lever handles */}
            <mesh position={[0.74, 0.9, 0.03]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.008, 0.008, 0.06, 8]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.05} />
            </mesh>
            <mesh position={[0.74, 0.9, -0.03]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.008, 0.008, 0.06, 8]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.05} />
            </mesh>
          </group>
        </group>
      );
    case 'window':
      return (
        <group position={[0, 0.5, 0]}>
          {/* Outer Vinyl Frame */}
          <mesh>
            <boxGeometry args={[0.8, 1.0, 0.1]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
          {/* Translucent cyan window panes */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.72, 0.92, 0.015]} />
            <meshStandardMaterial color="#38bdf8" opacity={0.25} transparent roughness={0.05} metalness={0.1} />
          </mesh>
          {/* Frame division sash */}
          <mesh position={[0, 0, 0.01]}>
            <boxGeometry args={[0.05, 0.92, 0.04]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
        </group>
      );
    default:
      // Slick interactive glow connection pin (Default Mesh fallback)
      return (
        <group>
          {/* Stalk */}
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.16, 8]} />
            <meshStandardMaterial color={color} roughness={0.3} />
          </mesh>
          {/* Glowing node sphere */}
          <mesh position={[0, 0.18, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.1} />
          </mesh>
        </group>
      );
  }
}
