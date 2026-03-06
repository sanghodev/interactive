"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useVideoTexture, shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { extend } from "@react-three/fiber";
import Link from "next/link";
import { ArrowLeft, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";

// ==========================================
// 1. GLSL Shaders
// ==========================================

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uTexture;
uniform vec2 uMouse;
uniform float uTime;
uniform float uAspect;
uniform float uHoverState;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  
  // Calculate distance from current pixel to mouse
  // Correct aspect ratio so the distortion isn't stretched
  vec2 currentUv = uv;
  currentUv.x *= uAspect;
  vec2 mouseUv = uMouse;
  mouseUv.x *= uAspect;

  float dist = distance(currentUv, mouseUv);
  
  // Create a rippling wave distortion effect based on distance to mouse
  float distortion = sin(dist * 20.0 - uTime * 5.0) * 0.05 * uHoverState;
  
  // Smoothly fade out the distortion the further away from the mouse it is
  float smoothDist = smoothstep(0.4, 0.0, dist);
  distortion *= smoothDist;

  // Apply RGB Chromatic Aberration shift driven by the distortion
  float r = texture2D(uTexture, uv + vec2(distortion, 0.0)).r;
  float g = texture2D(uTexture, uv + vec2(0.0, distortion)).g;
  float b = texture2D(uTexture, uv - vec2(distortion, 0.0)).b;

  // Base texture
  vec4 texColor = texture2D(uTexture, uv);
  
  // Mix the shifted RGB channels with the base video
  vec3 finalColor = mix(texColor.rgb, vec3(r, g, b), uHoverState * smoothDist);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

// Create the ShaderMaterial via Drei's helper
const DistortionMaterial = shaderMaterial(
    {
        uTexture: new THREE.Texture(),
        uMouse: new THREE.Vector2(0.5, 0.5),
        uTime: 0,
        uAspect: 1,
        uHoverState: 0, // 0 to 1 for smooth transitions
    },
    vertexShader,
    fragmentShader
);

// Register the material so we can use it declaratively as <distortionMaterial />
extend({ DistortionMaterial });

// Add TypeScript support for the custom material
declare global {
    namespace JSX {
        interface IntrinsicElements {
            distortionMaterial: any;
        }
    }
}

// ==========================================
// 2. WebGL Video mesh component
// ==========================================

function VideoDistortion({ src }: { src: string }) {
    const materialRef = useRef<any>(null);
    const { viewport } = useThree();

    // Automatically loads, plays, and converts the video to a THREE texture
    const videoTexture = useVideoTexture(src, { loop: true, muted: true, autoplay: true });

    // Target values for smooth interpolation
    const targetMouse = useRef(new THREE.Vector2(0.5, 0.5));
    const targetHover = useRef(0);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Map mouse from 0 to 1 (bottom left to top right to match WebGL UVs)
            const x = e.clientX / window.innerWidth;
            const y = 1.0 - (e.clientY / window.innerHeight);
            targetMouse.current.set(x, y);
            targetHover.current = 1.0; // Activate distortion
        };

        const handleMouseLeave = () => {
            targetHover.current = 0.0; // Deactivate smoothly
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    useFrame((state, delta) => {
        if (materialRef.current) {
            // Update time uniform
            materialRef.current.uTime = state.clock.elapsedTime;
            // Update aspect ratio uniform
            materialRef.current.uAspect = viewport.width / viewport.height;
            // Lerp mouse coordinates for butter-smooth lagging effect
            materialRef.current.uMouse.lerp(targetMouse.current, 0.1);
            // Lerp hover state for smooth entry/exit of the effect
            materialRef.current.uHoverState = THREE.MathUtils.lerp(materialRef.current.uHoverState, targetHover.current, 0.05);
        }
    });

    return (
        <mesh scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1, 32, 32]} />
            <distortionMaterial
                ref={materialRef}
                uTexture={videoTexture}
                transparent={true}
            />
        </mesh>
    );
}

// ==========================================
// 3. Main Page Layout Wrapper
// ==========================================

export default function WebGLShaderExperiment() {
    const [mounted, setMounted] = useState(false);

    // Prevent R3F from crashing on SSR before window exists
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden font-sans cursor-crosshair">

            {/* WebGL Canvas Layer */}
            <div className="absolute inset-0 z-0">
                {mounted && (
                    <Canvas orthographic camera={{ position: [0, 0, 1], zoom: 1 }}>
                        <VideoDistortion src="/video_12.mp4" />
                    </Canvas>
                )}
            </div>

            {/* 
        Ultra-minimalist High-Fashion / Tech Agency UI Layer 
        Pointer events none ensures the mouse events pass through to the Canvas listeners 
      */}
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8 md:p-12 mix-blend-difference text-white">

                {/* Top Header */}
                <header className="flex items-start justify-between w-full">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="flex flex-col gap-1"
                    >
                        <h1 className="text-xl md:text-2xl font-light tracking-[0.2em] uppercase">Fragment</h1>
                        <p className="text-xs font-mono tracking-widest text-white/50">GLSL // 018</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className="pointer-events-auto"
                    >
                        <Link
                            href="/"
                            className="group flex items-center gap-2 px-4 py-2 border border-white/20 rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                        >
                            <ArrowLeft className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
                            <span className="text-xs font-mono tracking-widest uppercase text-white/70 group-hover:text-white transition-colors">Archive</span>
                        </Link>
                    </motion.div>
                </header>

                {/* Center Reticle (Aesthetic) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-px h-12 bg-white" />
                    <div className="absolute w-12 h-px bg-white" />
                    <div className="absolute w-32 h-32 border border-white rounded-full" />
                </div>

                {/* Bottom Footer */}
                <footer className="flex items-end justify-between w-full mix-blend-difference">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.9 }}
                        className="max-w-md"
                    >
                        <p className="text-xs md:text-sm font-light tracking-widest leading-relaxed text-white/70 uppercase">
                            Web Graphic Library Real-Time Pixel Manipulation. <br />
                            Move your cursor to distort the algorithmic space constraints.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 1.1 }}
                        className="flex items-center gap-3"
                    >
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] uppercase font-mono tracking-widest text-white/50">Status</span>
                            <span className="text-xs uppercase tracking-widest text-white">Live Render</span>
                        </div>
                        <PlayCircle className="w-8 h-8 text-white animate-pulse" strokeWidth={1} />
                    </motion.div>
                </footer>
            </div>
        </div>
    );
}
