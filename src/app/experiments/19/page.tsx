"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame, extend, useThree } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

// ==========================================
// 1. Interactive Point Cloud Shaders
// ==========================================

const vertexShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform float uClick;

attribute vec2 reference;
varying vec2 vUv;
varying float vRepulsion;

void main() {
  vUv = reference;
  vec3 pos = position;

  // Local position is -0.5 to 0.5. Normalize to -1 to 1 to calculate distance to mouse
  vec2 normalizedPos = pos.xy * 2.0; 
  float dist = distance(normalizedPos, uMouse);
  
  // Normal hover repulsion (magnetic force)
  // Reduced radius from 0.5 to 0.15 for a much tighter, smaller interaction area
  float repulsion = smoothstep(0.15, 0.0, dist);
  
  // Click shockwave (explosive force)
  float shock = smoothstep(1.2, 0.0, dist) * uClick;
  
  vRepulsion = repulsion + shock;
  
  if (vRepulsion > 0.0) {
    vec2 dir = normalize(normalizedPos - uMouse);
    
    // Push away randomly in XY - reduced multiplier from 0.4 to 0.1 for subtler movement
    pos.xy += dir * repulsion * 0.1 * uHover;
    pos.xy += dir * shock * 0.8;
    
    // Pop out in Z - reduced multiplier from 0.6 to 0.2
    pos.z += repulsion * 0.2 * uHover;
    pos.z += shock * 1.5;
  }
  
  pos.z += sin(pos.x * 10.0 + uTime) * cos(pos.y * 10.0 + uTime) * 0.02;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  
  // Size grows slightly when repelled or clicked - reduced growth from 12.0 to 4.0
  gl_PointSize = (3.0 + (vRepulsion * 4.0)) * (3.0 / - mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
uniform float uTime;
varying vec2 vUv;
varying float vRepulsion;

// Cosine based palette generation
vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
    return a + b*cos( 6.28318*(c*t+d) );
}

void main() {
  // Make the particles perfect little circles
  float distToCenter = distance(gl_PointCoord, vec2(0.5));
  if (distToCenter > 0.5) {
    discard; 
  }

  // Generate an iridescent base color 
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.263, 0.416, 0.557); 
  
  float phaseOffset = length(vUv - 0.5) * 2.0;
  vec3 baseColor = palette(uTime * 0.2 + phaseOffset, a, b, c, d);
  
  // When repelled (exploded), flash brightly to absolute white
  vec3 finalColor = mix(baseColor, vec3(1.0, 1.0, 1.0), vRepulsion * 0.9);

  // Intense glow effect inside additive blending
  float alpha = 1.0 - (distToCenter * 2.0);

  gl_FragColor = vec4(finalColor, alpha);
}
`;

// Create a proper R3F Shader Material class to guarantee uniform reactivity
const ParticleMaterial = shaderMaterial(
    {
        uTime: 0,
        uMouse: new THREE.Vector2(-999, -999),
        uHover: 0,
        uClick: 0,
    },
    vertexShader,
    fragmentShader
);

extend({ ParticleMaterial });

declare module "@react-three/fiber" {
    interface ThreeElements {
        particleMaterial: any;
    }
}

// ==========================================
// 2. WebGL Particle System Mesh Component
// ==========================================

function PointCloudGrid() {
    const materialRef = useRef<any>(null);
    const { viewport } = useThree();

    const targetMouse = useRef(new THREE.Vector2(-999, -999));
    const targetHover = useRef(0);
    const targetClick = useRef(0);

    const widthSegment = 300;
    const heightSegment = 300;

    const { positions, uvs } = useMemo(() => {
        const totalPoints = widthSegment * heightSegment;
        const positions = new Float32Array(totalPoints * 3);
        const uvs = new Float32Array(totalPoints * 2);

        let idx = 0;
        for (let i = 0; i < widthSegment; i++) {
            for (let j = 0; j < heightSegment; j++) {
                const u = i / (widthSegment - 1);
                const v = j / (heightSegment - 1);

                const x = (u - 0.5);
                const y = (v - 0.5);
                const z = 0;

                positions[idx * 3] = x;
                positions[idx * 3 + 1] = y;
                positions[idx * 3 + 2] = z;

                uvs[idx * 2] = u;
                uvs[idx * 2 + 1] = v;

                idx++;
            }
        }
        return { positions, uvs };
    }, [widthSegment, heightSegment]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = -(e.clientY / window.innerHeight) * 2 + 1;

            targetMouse.current.set(x, y);
            targetHover.current = 1.0;
        };

        const handleMouseLeave = () => {
            targetMouse.current.set(-999, -999);
            targetHover.current = 0.0;
        };

        const handleMouseDown = () => {
            targetClick.current = 1.0;
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseleave", handleMouseLeave);
        window.addEventListener("mousedown", handleMouseDown);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseleave", handleMouseLeave);
            window.removeEventListener("mousedown", handleMouseDown);
        };
    }, []);

    useFrame((state) => {
        if (materialRef.current) {
            // Update time
            materialRef.current.uTime = state.clock.elapsedTime;

            // Smoothly lerp uniforms using object mutation (Drei handles uniformsNeedUpdate automatically)
            materialRef.current.uMouse.lerp(targetMouse.current, 0.15);
            materialRef.current.uHover = THREE.MathUtils.lerp(
                materialRef.current.uHover,
                targetHover.current,
                0.05
            );

            // Shockwave rapidly decays
            targetClick.current = THREE.MathUtils.lerp(targetClick.current, 0.0, 0.05);
            materialRef.current.uClick = targetClick.current;
        }
    });

    const scale = [viewport.width, viewport.height, 1] as [number, number, number];

    return (
        <points scale={scale}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-reference"
                    args={[uvs, 2]}
                />
            </bufferGeometry>
            {/* Using our custom class material ensures robust uniform reactivity */}
            <particleMaterial
                ref={materialRef}
                transparent={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

// ==========================================
// 3. Main Page Layout Wrapper
// ==========================================

export default function PointCloudExperiment() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden font-sans cursor-crosshair">
            <div className="absolute inset-0 z-0">
                {mounted && (
                    <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
                        <color attach="background" args={["#000000"]} />
                        <PointCloudGrid />
                    </Canvas>
                )}
            </div>

            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8 md:p-12 mix-blend-difference text-white">
                <header className="flex items-start justify-between w-full">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col gap-1.5"
                    >
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                            Particle <br /> <span className="text-white/40">Continuum</span>
                        </h1>
                        <p className="text-xs font-mono tracking-widest text-white/50 mt-2">EXP // 019 // CLOUD</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className="pointer-events-auto"
                    >
                        <Link
                            href="/"
                            className="group flex flex-col items-end gap-1 px-4 py-3 hover:bg-white/5 border border-transparent hover:border-white/20 rounded-xl transition-all duration-300"
                        >
                            <ArrowLeft className="w-5 h-5 text-white/50 group-hover:text-white group-hover:-translate-x-1 transition-all" />
                            <span className="text-[10px] font-mono tracking-widest uppercase text-white/50 group-hover:text-white mt-1">Exit Render</span>
                        </Link>
                    </motion.div>
                </header>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none opacity-20">
                    <Sparkles className="w-16 h-16 mb-4" strokeWidth={0.5} />
                    <div className="w-px h-24 bg-gradient-to-b from-white to-transparent" />
                </div>

                <footer className="flex items-end justify-between w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.9 }}
                        className="max-w-xl"
                    >
                        <p className="text-xs md:text-sm font-medium tracking-wide leading-relaxed text-white/80">
                            Procedural 90,000-Point Cloud Geometry. <br />
                            <span className="text-white/40 font-light">An algorithmically generated iridescent color spectrum mapped across an array of isolated vertex particles. Use the cursor to initiate magnetic repulsion, or click to trigger a massive explosive shockwave.</span>
                        </p>
                    </motion.div>
                </footer>
            </div>
        </div>
    );
}
