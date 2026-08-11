"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RotateCcw, 
  Grid, 
  Disc, 
  Maximize2, 
  Activity, 
  Play, 
  Pause,
  Sliders,
  HelpCircle,
  X
} from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";


// ═══════════════════════════════════════════════════════════════
//  TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════
interface TouchPoint {
  id: number;
  x: number; // [-0.5, 0.5]
  y: number; // [-0.5, 0.5]
  radius: number;
}

interface Preset {
  name: string;
  n: number;
  m: number;
  A: number;
  B: number;
  shape: "square" | "circle";
  description: string;
}

// ═══════════════════════════════════════════════════════════════
//  PHYSICS CONFIG & PRESETS
// ═══════════════════════════════════════════════════════════════
const PARTICLE_COUNT = 15000;

const MATERIAL_PRESETS = {
  brass: {
    name: "Classic Brass",
    drag: 0.94,
    forceScale: 0.035,
    noiseScale: 0.003,
    color: "#f59e0b", // Golden
    particleColor: "rgba(245, 158, 11, 0.8)",
    particle3DColor: [0.96, 0.62, 0.04],
    description: "High density metal with low friction. Patterns form sharply and remain highly stable."
  },
  steel: {
    name: "Chrome Steel",
    drag: 0.91,
    forceScale: 0.025,
    noiseScale: 0.006,
    color: "#a1a1aa", // Steel gray
    particleColor: "rgba(6, 182, 212, 0.8)", // Cyan
    particle3DColor: [0.02, 0.71, 0.83],
    description: "Standard elastic metal. Balanced speed of pattern formation with slight organic jitter."
  },
  glass: {
    name: "Silica Glass",
    drag: 0.86,
    forceScale: 0.015,
    noiseScale: 0.015,
    color: "#38bdf8", // Sky blue
    particleColor: "rgba(56, 189, 248, 0.75)",
    particle3DColor: [0.22, 0.74, 0.97],
    description: "Brittle silica plate. Intense resonant vibration leads to high noise and chaotic particle dance."
  },
  bismuth: {
    name: "Holographic Bismuth",
    drag: 0.97,
    forceScale: 0.008,
    noiseScale: 0.001,
    color: "#ec4899", // Neon pink
    particleColor: "rgba(236, 72, 153, 0.8)",
    particle3DColor: [0.92, 0.28, 0.6],
    description: "Superconductive quantum bismuth. Extremely slow movement creating flowing orbital lines."
  }
};

const SYSTEM_PRESETS: Preset[] = [
  { name: "Resonant Clover", n: 2, m: 2, A: 1, B: -1, shape: "square", description: "Classic symmetrical square harmonics showing 4 distinct quadrants." },
  { name: "Cymatic Mandala", n: 3, m: 4, A: 1, B: 1, shape: "square", description: "Intricate interlaced wave geometry reminiscent of spiritual art." },
  { name: "Star Grid", n: 5, m: 5, A: 1, B: -1, shape: "square", description: "High-frequency modal lines dividing the plate into 25 vibrating cells." },
  { name: "Golden Rings", n: 0, m: 3, A: 1, B: 0, shape: "circle", description: "Concentric circular ripples mimicking water waves." },
  { name: "Radial Sunburst", n: 6, m: 1, A: 1, B: 0, shape: "circle", description: "Spoke-like angular wedges dividing the disk into segments." },
  { name: "Cosmic Shield", n: 4, m: 4, A: 1, B: 1, shape: "circle", description: "Beautiful hybrid of circular rings and radial spokes." }
];

// ═══════════════════════════════════════════════════════════════
//  MATHEMATICAL CORE DISPLACEMENT
// ═══════════════════════════════════════════════════════════════
const getDisplacement = (
  x: number,
  y: number,
  n: number,
  m: number,
  A: number,
  B: number,
  shape: "square" | "circle",
  touches: TouchPoint[]
): number => {
  let z = 0;
  
  if (shape === "square") {
    // Standard Chladni plate vibration equations
    z = A * Math.cos(n * Math.PI * x) * Math.cos(m * Math.PI * y) + 
        B * Math.cos(m * Math.PI * x) * Math.cos(n * Math.PI * y);
  } else {
    // Circular plate polar coordinate approximation
    const r = Math.sqrt(x * x + y * y);
    const theta = Math.atan2(y, x);
    z = A * Math.cos(m * Math.PI * r * 2) * Math.cos(n * theta);
  }

  // Apply damping points from user interaction
  if (touches.length > 0) {
    let factor = 1.0;
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const dx = x - touch.x;
      const dy = y - touch.y;
      const distSq = dx * dx + dy * dy;
      const sigmaSq = touch.radius * touch.radius;
      // Vibration is clamped to 0 at the center of damping points
      factor *= (1.0 - Math.exp(-distSq / (2 * sigmaSq)));
    }
    z *= factor;
  }

  return z;
};

// ═══════════════════════════════════════════════════════════════
//  3D COMPONENTS (REACT THREE FIBER)
// ═══════════════════════════════════════════════════════════════
interface Plate3DProps {
  n: number;
  m: number;
  A: number;
  B: number;
  shape: "square" | "circle";
  amplitude: number;
  touchPoints: TouchPoint[];
  color: string;
}

function Plate3D({ n, m, A, B, shape, amplitude, touchPoints, color }: Plate3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);
  const touchPointsRef = useRef<TouchPoint[]>(touchPoints);
  
  useEffect(() => {
    touchPointsRef.current = touchPoints;
  }, [touchPoints]);

  useFrame((state) => {
    if (!meshRef.current || !wireframeRef.current) return;
    
    const geom = meshRef.current.geometry;
    const wireGeom = wireframeRef.current.geometry;
    
    const pos = geom.attributes.position;
    const wirePos = wireGeom.attributes.position;
    
    const time = state.clock.elapsedTime;
    
    // Scale vibration speed with frequency
    const speed = 12 + Math.sqrt(n * n + m * m) * 2;
    const osc = Math.sin(time * speed) * amplitude;

    for (let i = 0; i < pos.count; i++) {
      // Mesh geometry is size 4x4 (range: [-2, 2]). Normalize to [-0.5, 0.5]
      const rx = pos.getX(i);
      const ry = pos.getY(i);
      const px = rx / 4;
      const py = ry / 4;
      
      const zVal = getDisplacement(px, py, n, m, A, B, shape, touchPointsRef.current);
      const zDisp = zVal * osc * 3.5; // Scale up for 3D visual height
      
      pos.setZ(i, zDisp);
      wirePos.setZ(i, zDisp);
    }
    
    pos.needsUpdate = true;
    wirePos.needsUpdate = true;
    
    geom.computeVertexNormals();
  });

  return (
    <group>
      {/* Solid metallic plate */}
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
        {shape === "square" ? (
          <planeGeometry args={[4, 4, 45, 45]} />
        ) : (
          <circleGeometry args={[2, 60]} />
        )}
        <meshStandardMaterial
          color="#16161a"
          roughness={0.25}
          metalness={0.85}
          transparent={true}
          opacity={0.88}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Glow Wireframe Overlay */}
      <mesh ref={wireframeRef} rotation={[-Math.PI / 2, 0, 0]}>
        {shape === "square" ? (
          <planeGeometry args={[4, 4, 45, 45]} />
        ) : (
          <circleGeometry args={[2, 60]} />
        )}
        <meshBasicMaterial
          color={color}
          wireframe={true}
          transparent={true}
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

interface ParticleCloud3DProps {
  n: number;
  m: number;
  A: number;
  B: number;
  shape: "square" | "circle";
  amplitude: number;
  touchPoints: TouchPoint[];
  particlesRef: React.MutableRefObject<Float32Array>;
  baseColor: number[]; // RGB [r, g, b]
}

function ParticleCloud3D({ n, m, A, B, shape, amplitude, touchPoints, particlesRef, baseColor }: ParticleCloud3DProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const touchPointsRef = useRef<TouchPoint[]>(touchPoints);
  
  useEffect(() => {
    touchPointsRef.current = touchPoints;
  }, [touchPoints]);

  const positions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  const colors = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position;
    const colAttr = geom.attributes.color;
    
    const posArray = posAttr.array as Float32Array;
    const colArray = colAttr.array as Float32Array;
    
    const data = particlesRef.current;
    const time = state.clock.elapsedTime;
    
    const speed = 12 + Math.sqrt(n * n + m * m) * 2;
    const osc = Math.sin(time * speed) * amplitude;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const px = data[i * 4];
      const py = data[i * 4 + 1];
      
      const zVal = getDisplacement(px, py, n, m, A, B, shape, touchPointsRef.current);
      const zDisp = zVal * osc * 3.5;
      
      // Scale from [-0.5, 0.5] range to R3F 4x4 coordinate space
      posArray[i * 3] = px * 4;
      posArray[i * 3 + 1] = py * 4;
      // Sit slightly above plate surface to avoid clipping
      posArray[i * 3 + 2] = zDisp + 0.02;

      // Color coding: settled particles take the base color, vibrating particles glow hot
      const energy = zVal * zVal;
      if (energy > 0.04) {
        // High vibration: white-hot
        colArray[i * 3] = 1.0;
        colArray[i * 3 + 1] = 1.0;
        colArray[i * 3 + 2] = 1.0;
      } else if (energy > 0.005) {
        // Shaking: transition color (violet/indigo)
        colArray[i * 3] = 0.6;
        colArray[i * 3 + 1] = 0.35;
        colArray[i * 3 + 2] = 0.95;
      } else {
        // Calm nodes: Base material color
        colArray[i * 3] = baseColor[0];
        colArray[i * 3 + 1] = baseColor[1];
        colArray[i * 3 + 2] = baseColor[2];
      }
    }
    
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors={true}
        transparent={true}
        opacity={0.85}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function CymaticSandbox() {
  const [mounted, setMounted] = useState(false);
  
  // Simulation Settings
  const [shape, setShape] = useState<"square" | "circle">("square");
  const [n, setN] = useState<number>(3);
  const [m, setM] = useState<number>(4);
  const [ampA, setAmpA] = useState<number>(1.0);
  const [ampB, setAmpB] = useState<number>(1.0);
  const [ampScale, setAmpScale] = useState<number>(0.5); // Plate vibration level
  
  const [material, setMaterial] = useState<keyof typeof MATERIAL_PRESETS>("steel");
  const [viewMode, setViewMode] = useState<"2D" | "3D">("2D");
  const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  // Audio Synthesizer Settings
  const [isSynthPlaying, setIsSynthPlaying] = useState(false);
  const [oscType, setOscType] = useState<OscillatorType>("sine");
  const [volume, setVolume] = useState<number>(0.15);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentFreq, setCurrentFreq] = useState<number>(440);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const oscilloscopeRef = useRef<HTMLCanvasElement>(null);
  
  // Shared Particle coordinates: Float32Array storing [x, y, vx, vy] per particle
  const particles = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 4));
  
  // React state mirroring refs for dynamic updates in physics ticks
  const currentParams = useRef({ n, m, ampA, ampB, shape, ampScale, material });
  const touchPointsRef = useRef<TouchPoint[]>([]);

  // Web Audio Context Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscNodeRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  // Sync refs with state
  useEffect(() => {
    currentParams.current = { n, m, ampA, ampB, shape, ampScale, material };
  }, [n, m, ampA, ampB, shape, ampScale, material]);

  useEffect(() => {
    touchPointsRef.current = touchPoints;
  }, [touchPoints]);

  useEffect(() => {
    setMounted(true);
    initializeParticles(shape);
    return () => {
      // Clean up Audio Context on unmount
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // Initialize particles in random coordinates on square or circle
  const initializeParticles = (currentShape: "square" | "circle") => {
    const data = particles.current;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let x = 0;
      let y = 0;
      if (currentShape === "square") {
        x = Math.random() - 0.5; // range [-0.5, 0.5]
        y = Math.random() - 0.5;
      } else {
        // Uniform distribution inside circle of radius 0.5
        const r = 0.5 * Math.sqrt(Math.random());
        const theta = Math.random() * Math.PI * 2;
        x = r * Math.cos(theta);
        y = r * Math.sin(theta);
      }
      data[i * 4] = x;
      data[i * 4 + 1] = y;
      data[i * 4 + 2] = 0; // vx
      data[i * 4 + 3] = 0; // vy
    }
  };

  // Switch shapes and reinitialize particles
  const handleShapeChange = (newShape: "square" | "circle") => {
    setShape(newShape);
    initializeParticles(newShape);
    setTouchPoints([]); // Clear touch points on shape swap
  };

  // ═══════════════════════════════════════════════════════════════
  //  WEB AUDIO SYNTHESIZER
  // ═══════════════════════════════════════════════════════════════
  const startAudio = () => {
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
      setIsSynthPlaying(true);
      return;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const analyser = ctx.createAnalyser();

    // Soften higher harmonics (for sawtooth/square waves)
    filter.type = "lowpass";
    filter.frequency.value = 1000;

    osc.type = oscType;
    osc.frequency.value = currentFreq;

    gain.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(analyser);
    analyser.connect(ctx.destination);

    osc.start();

    oscNodeRef.current = osc;
    gainNodeRef.current = gain;
    filterNodeRef.current = filter;
    analyserRef.current = analyser;

    setIsSynthPlaying(true);
  };

  const stopAudio = () => {
    if (audioCtxRef.current && audioCtxRef.current.state === "running") {
      audioCtxRef.current.suspend();
    }
    setIsSynthPlaying(false);
  };

  const toggleSynth = () => {
    if (isSynthPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  // Adjust volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (gainNodeRef.current && audioCtxRef.current && !isMuted) {
      gainNodeRef.current.gain.linearRampToValueAtTime(vol, audioCtxRef.current.currentTime + 0.05);
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(
        nextMute ? 0 : volume, 
        audioCtxRef.current.currentTime + 0.1
      );
    }
  };

  // Update oscillator waveform
  const handleWaveformChange = (type: OscillatorType) => {
    setOscType(type);
    if (oscNodeRef.current) {
      oscNodeRef.current.type = type;
    }
  };

  // Physical frequency relationship: f is proportional to sqrt(n^2 + m^2)
  // Base frequency: 65Hz (C2)
  useEffect(() => {
    const baseFreq = 65;
    let computed = baseFreq * Math.sqrt(n * n + m * m);
    // Circular plates base frequency adjustment
    if (shape === "circle") {
      computed *= 0.85; 
    }
    
    const roundedFreq = Math.round(computed * 100) / 100;
    setCurrentFreq(roundedFreq);

    if (oscNodeRef.current && audioCtxRef.current) {
      // Glide frequency change smoothly to create a sci-fi synth sweep
      oscNodeRef.current.frequency.setTargetAtTime(roundedFreq, audioCtxRef.current.currentTime, 0.12);
    }
  }, [n, m, shape]);

  // ═══════════════════════════════════════════════════════════════
  //  PHYSICS ENGINE TICK LOOP
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    let animId: number;
    
    const tick = () => {
      const { n: cn, m: cm, ampA: cA, ampB: cB, shape: cShape, ampScale: cAmp, material: cMat } = currentParams.current;
      const matConfig = MATERIAL_PRESETS[cMat];
      const data = particles.current;
      const activeTouches = touchPointsRef.current;

      // Numerical gradient delta
      const epsilon = 0.008;
      // Adjust scales based on the material config and user amplitude slider
      const dragFactor = matConfig.drag;
      const pushForce = matConfig.forceScale * cAmp * 2.0;
      const jitterFactor = matConfig.noiseScale * cAmp;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        let x = data[i * 4];
        let y = data[i * 4 + 1];
        let vx = data[i * 4 + 2];
        let vy = data[i * 4 + 3];

        // Compute local vibration energy gradient via finite differences
        const z_x1 = getDisplacement(x + epsilon, y, cn, cm, cA, cB, cShape, activeTouches);
        const z_x2 = getDisplacement(x - epsilon, y, cn, cm, cA, cB, cShape, activeTouches);
        const z_y1 = getDisplacement(x, y + epsilon, cn, cm, cA, cB, cShape, activeTouches);
        const z_y2 = getDisplacement(x, y - epsilon, cn, cm, cA, cB, cShape, activeTouches);

        // Gradient of energy: d(Z^2)/dx
        const dz2_dx = (z_x1 * z_x1 - z_x2 * z_x2) / (2 * epsilon);
        const dz2_dy = (z_y1 * z_y1 - z_y2 * z_y2) / (2 * epsilon);

        // Force direction opposes energy gradient (points toward nodes)
        const fx = -pushForce * dz2_dx;
        const fy = -pushForce * dz2_dy;

        // Vibrational bouncing (jitter) is proportional to the local wave energy
        const zLocal = getDisplacement(x, y, cn, cm, cA, cB, cShape, activeTouches);
        const localEnergy = zLocal * zLocal;
        
        const rx = (Math.random() - 0.5) * jitterFactor * localEnergy;
        const ry = (Math.random() - 0.5) * jitterFactor * localEnergy;

        // Apply forces, inertia and drag
        vx = vx * dragFactor + fx + rx;
        vy = vy * dragFactor + fy + ry;

        x += vx;
        y += vy;

        // Keep particles bounded to the plate geometry
        if (cShape === "square") {
          if (x < -0.5) { x = -0.5; vx *= -0.4; }
          if (x > 0.5) { x = 0.5; vx *= -0.4; }
          if (y < -0.5) { y = -0.5; vy *= -0.4; }
          if (y > 0.5) { y = 0.5; vy *= -0.4; }
        } else {
          // Circular boundary limit
          const r = Math.sqrt(x * x + y * y);
          if (r > 0.5) {
            const nx = x / r;
            const ny = y / r;
            x = nx * 0.5;
            y = ny * 0.5;
            // Elastic boundary bounce
            const dot = vx * nx + vy * ny;
            vx = (vx - 2 * dot * nx) * -0.4;
            vy = (vy - 2 * dot * ny) * -0.4;
          }
        }

        // Write updated physics variables back to shared memory buffer
        data[i * 4] = x;
        data[i * 4 + 1] = y;
        data[i * 4 + 2] = vx;
        data[i * 4 + 3] = vy;
      }

      // Render loop (2D canvas context only; R3F Canvas manages its own 3D loop asynchronously)
      if (viewMode === "2D" && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          const size = Math.min(w, h) * 0.85;

          // Ghosting trails effect: draw semi-transparent black background
          ctx.fillStyle = "rgba(5, 5, 8, 0.18)";
          ctx.fillRect(0, 0, w, h);

          // Draw grid pattern in the background
          ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          const gridSpace = 40;
          for (let gx = 0; gx < w; gx += gridSpace) {
            ctx.moveTo(gx, 0); ctx.lineTo(gx, h);
          }
          for (let gy = 0; gy < h; gy += gridSpace) {
            ctx.moveTo(0, gy); ctx.lineTo(w, gy);
          }
          ctx.stroke();

          // Render plate outline
          ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
          ctx.lineWidth = 3;
          ctx.fillStyle = "rgba(20, 20, 25, 0.4)";
          ctx.beginPath();
          if (cShape === "square") {
            ctx.rect(w / 2 - size / 2, h / 2 - size / 2, size, size);
          } else {
            ctx.arc(w / 2, h / 2, size / 2, 0, Math.PI * 2);
          }
          ctx.fill();
          ctx.stroke();

          // Double glowing edge highlights
          ctx.strokeStyle = "rgba(99, 102, 241, 0.15)";
          ctx.lineWidth = 10;
          ctx.beginPath();
          if (cShape === "square") {
            ctx.rect(w / 2 - size / 2, h / 2 - size / 2, size, size);
          } else {
            ctx.arc(w / 2, h / 2, size / 2, 0, Math.PI * 2);
          }
          ctx.stroke();

          // Render user-placed damping pegs
          ctx.shadowBlur = 12;
          ctx.shadowColor = "#f43f5e";
          ctx.fillStyle = "#ef4444";
          for (let k = 0; k < activeTouches.length; k++) {
            const touch = activeTouches[k];
            const tx = w / 2 + touch.x * size;
            const ty = h / 2 + touch.y * size;
            ctx.beginPath();
            ctx.arc(tx, ty, 6, 0, Math.PI * 2);
            ctx.fill();
            // Outer pulse
            ctx.strokeStyle = "rgba(239, 68, 68, 0.3)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(tx, ty, 14, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.shadowBlur = 0; // Reset shadow

          // Render 15,000 particles
          ctx.fillStyle = matConfig.particleColor;
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            const px = w / 2 + data[i * 4] * size;
            const py = h / 2 + data[i * 4 + 1] * size;
            
            // Add visual sparks for high energy particles
            const pVal = getDisplacement(data[i * 4], data[i * 4 + 1], cn, cm, cA, cB, cShape, activeTouches);
            if (pVal * pVal > 0.05 && Math.random() < 0.05) {
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(px - 0.5, py - 0.5, 2.5, 2.5);
            } else {
              ctx.fillStyle = matConfig.particleColor;
              ctx.fillRect(px, py, 1.5, 1.5);
            }
          }
        }
      }

      // Draw Web Audio Oscilloscope Visualizer
      if (analyserRef.current && oscilloscopeRef.current) {
        const visualizer = oscilloscopeRef.current;
        const vCtx = visualizer.getContext("2d");
        if (vCtx) {
          const vw = visualizer.width;
          const vh = visualizer.height;
          const bufferLength = analyserRef.current.fftSize;
          const timeData = new Uint8Array(bufferLength);
          
          analyserRef.current.getByteTimeDomainData(timeData);
          
          vCtx.fillStyle = "#09090b";
          vCtx.fillRect(0, 0, vw, vh);

          vCtx.strokeStyle = "rgba(99, 102, 241, 0.4)";
          vCtx.lineWidth = 1.5;
          vCtx.beginPath();

          const sliceWidth = vw / bufferLength;
          let vx = 0;

          for (let idx = 0; idx < bufferLength; idx++) {
            const v = timeData[idx] / 128.0; // range [0, 2]
            const vy = (v * vh) / 2;

            if (idx === 0) {
              vCtx.moveTo(vx, vy);
            } else {
              vCtx.lineTo(vx, vy);
            }
            vx += sliceWidth;
          }

          vCtx.lineTo(vw, vh / 2);
          vCtx.stroke();
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [viewMode]);

  // ═══════════════════════════════════════════════════════════════
  //  USER CANVAS MOUSE/TOUCH INTERACTION
  // ═══════════════════════════════════════════════════════════════
  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Normalized position [-0.5, 0.5]
    const size = Math.min(canvas.width, canvas.height) * 0.85;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    const px = (mx - canvas.width / 2) / size;
    const py = (my - canvas.height / 2) / size;

    // Check boundary
    if (shape === "square") {
      if (Math.abs(px) > 0.5 || Math.abs(py) > 0.5) return;
    } else {
      if (px * px + py * py > 0.25) return; // outside circle
    }

    // On mousedown/drag, we add or update a damping point
    const id = 999; // Temp active drag point ID
    const newTouch: TouchPoint = { id, x: px, y: py, radius: 0.07 };

    // Update touchPoints list, filtering out the previous temp drag point
    setTouchPoints(prev => [...prev.filter(t => t.id !== id), newTouch]);
  };

  const handleCanvasMouseUp = () => {
    // Release active mouse drag: convert to persistent peg if click, or just discard
    // For simplicity: dragging places a temp point, releasing discards it.
    // Clicking (tap without long drag) adds a permanent peg!
    setTouchPoints(prev => {
      const activeDrag = prev.find(t => t.id === 999);
      const others = prev.filter(t => t.id !== 999);
      
      if (activeDrag) {
        // If there are less than 4 persistent pegs, spawn a new one where released!
        if (others.length < 4) {
          const newPeg: TouchPoint = {
            id: Date.now(),
            x: activeDrag.x,
            y: activeDrag.y,
            radius: 0.08
          };
          return [...others, newPeg];
        }
      }
      return others;
    });
  };

  const clearDampingPoints = () => {
    setTouchPoints([]);
  };

  // Resize 2D canvas handler
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
        canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // trigger initial resize
    
    return () => window.removeEventListener("resize", handleResize);
  }, [viewMode]);

  // Load a preset
  const loadPreset = (preset: Preset) => {
    setShape(preset.shape);
    initializeParticles(preset.shape);
    setN(preset.n);
    setM(preset.m);
    setAmpA(preset.A);
    setAmpB(preset.B);
    setTouchPoints([]);
  };

  const activeMaterial = MATERIAL_PRESETS[material];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050508] text-neutral-200 font-sans select-none">
      
      {/* 1. Fullscreen Main Viewport */}
      <div className="absolute inset-0 z-0 w-full h-full">
        {viewMode === "2D" ? (
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair block"
            onMouseMove={handleCanvasInteraction}
            onMouseDown={handleCanvasInteraction}
            onMouseUp={handleCanvasMouseUp}
          />
        ) : (
          <div className="w-full h-full bg-[#050508]">
            {mounted && (
              <Canvas camera={{ position: [0, 3.8, 3.8], fov: 55 }}>
                <color attach="background" args={["#050508"]} />
                <ambientLight intensity={0.4} />
                <pointLight position={[5, 10, 5]} intensity={1.5} />
                <pointLight position={[-5, -10, -5]} intensity={0.5} />
                
                <Plate3D
                  n={n}
                  m={m}
                  A={ampA}
                  B={ampB}
                  shape={shape}
                  amplitude={ampScale}
                  touchPoints={touchPoints}
                  color={activeMaterial.color}
                />
                
                <ParticleCloud3D
                  n={n}
                  m={m}
                  A={ampA}
                  B={ampB}
                  shape={shape}
                  amplitude={ampScale}
                  touchPoints={touchPoints}
                  particlesRef={particles}
                  baseColor={activeMaterial.particle3DColor}
                />
                
                <OrbitControls 
                  enableZoom={true} 
                  maxPolarAngle={Math.PI / 2 - 0.05} 
                  minDistance={2}
                  maxDistance={8}
                />
              </Canvas>
            )}
            
            {/* 3D Navigation Tip Overlay */}
            <div className="absolute bottom-6 right-6 z-10 glass-panel px-4 py-2 text-xs font-mono text-indigo-300 pointer-events-none rounded-full flex items-center gap-2 border border-white/5">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Left click + drag to rotate plate in 3D
            </div>
          </div>
        )}
      </div>

      {/* 2. Laboratory Control Center Overlay */}
      <div className="absolute top-4 left-4 bottom-4 w-[380px] z-20 flex flex-col pointer-events-none">
        
        {/* Scrollable controls panel */}
        <div className="w-full h-full glass-panel rounded-2xl border border-white/5 overflow-y-auto pointer-events-auto flex flex-col p-5 bg-zinc-950/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] scrollbar-thin">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
            <div className="flex items-center gap-2.5">
              <Link href="/">
                <motion.div
                  whileHover={{ scale: 1.05, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-white/5 cursor-pointer hover:bg-white/10"
                >
                  <ArrowLeft className="w-4 h-4" />
                </motion.div>
              </Link>
              <div>
                <h1 className="text-sm font-black tracking-widest text-white uppercase">Cymatics Resonance</h1>
                <p className="text-[10px] font-mono text-indigo-400">EXP-047 // WAVE FIELD LAB</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowHelp(true)}
              className="text-neutral-500 hover:text-white transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          {/* Core Controls Section */}
          <div className="flex-grow flex flex-col gap-5">
            
            {/* View Mode & Plate Shape */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Viewport</span>
                <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5">
                  <button 
                    onClick={() => setViewMode("2D")}
                    className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${viewMode === "2D" ? "bg-indigo-600 text-white shadow-lg" : "text-neutral-400 hover:text-white"}`}
                  >
                    2D
                  </button>
                  <button 
                    onClick={() => setViewMode("3D")}
                    className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${viewMode === "3D" ? "bg-indigo-600 text-white shadow-lg" : "text-neutral-400 hover:text-white"}`}
                  >
                    3D
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Plate Shape</span>
                <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5">
                  <button 
                    onClick={() => handleShapeChange("square")}
                    className={`flex-1 py-1 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${shape === "square" ? "bg-indigo-600 text-white shadow-lg" : "text-neutral-400 hover:text-white"}`}
                  >
                    <Grid className="w-3.5 h-3.5" /> Square
                  </button>
                  <button 
                    onClick={() => handleShapeChange("circle")}
                    className={`flex-1 py-1 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${shape === "circle" ? "bg-indigo-600 text-white shadow-lg" : "text-neutral-400 hover:text-white"}`}
                  >
                    <Disc className="w-3.5 h-3.5" /> Circle
                  </button>
                </div>
              </div>
            </div>

            {/* Resonance Parameters */}
            <div className="flex flex-col gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-1">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  Wave Parameters
                </div>
                <div className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">
                  N={n} M={m}
                </div>
              </div>

              {/* Slider N */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px] font-mono text-neutral-300">
                  <span>Frequency Factor (N)</span>
                  <span>{n}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={n}
                  onChange={(e) => setN(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 bg-white/10 h-1 rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider M */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px] font-mono text-neutral-300">
                  <span>Frequency Factor (M)</span>
                  <span>{m}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={m}
                  onChange={(e) => setM(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 bg-white/10 h-1 rounded-lg cursor-pointer"
                />
              </div>

              {/* Mixing Ratios: Amp A & B (Only active in square) */}
              {shape === "square" && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono text-neutral-400">Coeff A ({ampA.toFixed(1)})</span>
                    <input 
                      type="range" 
                      min="-1" 
                      max="1" 
                      step="0.5" 
                      value={ampA} 
                      onChange={(e) => setAmpA(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 bg-white/10 h-1 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono text-neutral-400">Coeff B ({ampB.toFixed(1)})</span>
                    <input 
                      type="range" 
                      min="-1" 
                      max="1" 
                      step="0.5" 
                      value={ampB} 
                      onChange={(e) => setAmpB(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 bg-white/10 h-1 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Vibration Amplitude */}
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex justify-between text-[11px] font-mono text-neutral-300">
                  <span>Energy Amplitude</span>
                  <span>{Math.round(ampScale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.05"
                  value={ampScale}
                  onChange={(e) => setAmpScale(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 bg-white/10 h-1 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Audio Synthesizer */}
            <div className="flex flex-col gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-1">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white">
                  <Activity className="w-3.5 h-3.5 text-pink-500" />
                  Acoustic Resonance
                </div>
                <div className="text-[10px] font-mono text-pink-400">
                  {currentFreq} Hz
                </div>
              </div>

              {/* Waveform type */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono text-neutral-400 uppercase">Synth Waveform</span>
                <div className="grid grid-cols-4 gap-1 p-0.5 bg-white/5 rounded-lg border border-white/5">
                  {(["sine", "triangle", "sawtooth", "square"] as OscillatorType[]).map((wType) => (
                    <button
                      key={wType}
                      onClick={() => handleWaveformChange(wType)}
                      className={`py-1 text-[9px] font-mono uppercase font-bold rounded transition-all ${oscType === wType ? "bg-pink-600 text-white" : "text-neutral-400 hover:text-white"}`}
                    >
                      {wType.substring(0, 4)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start/Mute buttons */}
              <div className="flex gap-2 items-center">
                <button
                  onClick={toggleSynth}
                  className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all ${isSynthPlaying ? "bg-emerald-600 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300"}`}
                >
                  {isSynthPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" /> Stop Sound
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" /> Play Sound
                    </>
                  )}
                </button>

                <button
                  onClick={handleToggleMute}
                  disabled={!isSynthPlaying}
                  className={`px-3 py-2 rounded-lg border flex items-center justify-center transition-all ${!isSynthPlaying ? "opacity-30 border-white/5 text-neutral-600" : isMuted ? "bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30" : "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300"}`}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px] font-mono text-neutral-300">
                  <span>Synthesizer Volume</span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.4"
                  step="0.02"
                  value={volume}
                  disabled={!isSynthPlaying}
                  onChange={handleVolumeChange}
                  className="w-full accent-pink-500 bg-white/10 h-1 rounded-lg cursor-pointer disabled:opacity-30"
                />
              </div>

              {/* Real-time Oscilloscope */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-neutral-400 uppercase">Acoustic Oscilloscope</span>
                <div className="h-16 w-full rounded-lg overflow-hidden border border-white/5">
                  <canvas ref={oscilloscopeRef} className="w-full h-full" width={300} height={64} />
                </div>
              </div>
            </div>

            {/* Material Presets */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Plate Material</span>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(MATERIAL_PRESETS) as Array<keyof typeof MATERIAL_PRESETS>).map((matKey) => {
                  const matConf = MATERIAL_PRESETS[matKey];
                  return (
                    <button
                      key={matKey}
                      onClick={() => setMaterial(matKey)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col gap-0.5 transition-all ${material === matKey ? "bg-white/5 border-indigo-500/70" : "bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-white/10"}`}
                    >
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: matConf.color }} />
                        {matConf.name}
                      </span>
                      <span className="text-[9px] font-light leading-tight text-neutral-400 line-clamp-1">{matConf.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mathematical Formula HUD */}
            <div className="p-3 bg-zinc-900/40 border border-white/5 rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase">Harmonic Wave Function</span>
              <div className="text-xs font-mono py-1 px-2 bg-black/40 rounded border border-white/5 text-cyan-400 break-all text-center">
                {shape === "square" ? (
                  <>
                    Z = {ampA.toFixed(2)}•cos({n}πx)•cos({m}πy) {ampB >= 0 ? "+" : "-"} {Math.abs(ampB).toFixed(2)}•cos({m}πx)•cos({n}πy)
                  </>
                ) : (
                  <>
                    Z = {ampA.toFixed(2)}•cos({m}πr)•cos({n}θ)
                  </>
                )}
              </div>
              {touchPoints.length > 0 && (
                <div className="text-[9px] font-mono text-red-400 text-center">
                  * Multiplied by {touchPoints.length} damping touch constraint(s)
                </div>
              )}
            </div>

          </div>

          {/* Damping Constraint Panel */}
          <div className="mt-5 pt-4 border-t border-white/5 flex gap-2">
            <button
              onClick={clearDampingPoints}
              disabled={touchPoints.length === 0}
              className="flex-1 py-2 rounded-lg text-xs font-bold border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-neutral-300 disabled:opacity-20 flex items-center justify-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Pegs
            </button>
            <button
              onClick={() => initializeParticles(shape)}
              className="flex-1 py-2 rounded-lg text-xs font-bold border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-neutral-300 flex items-center justify-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Scatter Sand
            </button>
          </div>

        </div>
      </div>

      {/* 3. Preset Gallery Overlay (Bottom Center) */}
      <div className="absolute bottom-4 left-[405px] right-4 z-20 pointer-events-none flex justify-center">
        <div className="max-w-2xl w-full glass-panel p-4 rounded-xl border border-white/5 pointer-events-auto bg-zinc-950/70 backdrop-blur-md shadow-2xl flex flex-col gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Harmonic Resonance Presets
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {SYSTEM_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => loadPreset(preset)}
                className={`py-1.5 px-2 rounded-lg border text-center text-[10px] font-bold transition-all ${
                  shape === preset.shape && n === preset.n && m === preset.m
                    ? "bg-indigo-600/30 border-indigo-500/70 text-white shadow-lg"
                    : "bg-white/[0.01] border-white/5 text-neutral-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Instructions/Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-950/95 border border-white/10 p-6 rounded-2xl max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowHelp(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <h2 className="text-lg font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Cymatics Sandbox Guide
              </h2>
              
              <div className="text-sm text-neutral-300 space-y-4 font-light leading-relaxed">
                <p>
                  <strong>Cymatics</strong> is the physical phenomenon of sound waves making patterns in matter. This simulator models <strong>Chladni Patterns</strong>, where vibrations on a plate arrange 15,000 sand particles.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex gap-2">
                    <span className="text-indigo-400 font-mono">1.</span>
                    <p>Change <strong>Frequency Factors (N & M)</strong> to sweep through different harmonics, changing the geometric lines.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-indigo-400 font-mono">2.</span>
                    <p>In <strong>2D Mode</strong>, click or drag on the plate to place up to 4 <strong>damping pegs</strong> (red dots) that absorb vibrations. Watch the pattern warp around your fingers.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-indigo-400 font-mono">3.</span>
                    <p>In <strong>3D Mode</strong>, drag with the mouse to rotate the metal plate and watch the particles bounce dynamically in 3D space.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-indigo-400 font-mono">4.</span>
                    <p>Turn on <strong>Acoustic Resonance</strong> to synthesize the pure frequency corresponding to the visual harmonic sweep using Web Audio API.</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setShowHelp(false)}
                className="w-full mt-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase rounded-lg shadow-lg"
              >
                Enter Laboratory
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
