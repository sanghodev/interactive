"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, extend, useThree } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import Link from "next/link";
import { ArrowLeft, Grid3x3, Clock } from "lucide-react";
import { motion } from "framer-motion";

// ==========================================
// 1. Mosaic Temporal Tiling Shader
// ==========================================

const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform sampler2D uTexture3;
uniform float uTime;
uniform vec2 uResolution;

varying vec2 vUv;

float luma(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

void main() {
  float cols = 3.0; 
  float screenAspect = uResolution.x / uResolution.y;
  float videoAspect = 9.0 / 16.0; 
  float rows = cols * (videoAspect / screenAspect);
  vec2 grid = vec2(cols, rows);
  
  vec2 tiledUv = fract(vUv * grid);
  vec2 tileIndex = floor(vUv * grid);
  float colIndex = mod(tileIndex.x, 3.0);
  
  vec3 finalColor;
  
  // Sample a DIFFERENT texture per column (each texture has a different start time)
  if (colIndex == 0.0) {
      vec3 tex = texture2D(uTexture1, tiledUv).rgb;
      float r = smoothstep(0.2, 0.8, tex.r);
      finalColor = mix(vec3(0.05, 0.0, 0.0), vec3(1.0, 0.2, 0.0), r);
  } else if (colIndex == 1.0) {
      vec3 tex = texture2D(uTexture2, tiledUv).rgb;
      float g = smoothstep(0.3, 0.7, tex.g);
      finalColor = mix(vec3(0.0, 0.05, 0.0), vec3(0.4, 1.0, 0.2), g);
  } else {
      vec3 tex = texture2D(uTexture3, tiledUv).rgb;
      float b = smoothstep(0.2, 0.9, tex.b);
      vec3 tint = mix(vec3(0.0, 0.0, 0.1), vec3(0.0, 0.6, 1.0), b);
      finalColor = tint * (1.0 + sin(uTime * 3.0) * 0.05);
  }

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

const MosaicTemporalMaterial = shaderMaterial(
    {
        uTexture1: new THREE.Texture(),
        uTexture2: new THREE.Texture(),
        uTexture3: new THREE.Texture(),
        uTime: 0,
        uResolution: new THREE.Vector2(1, 1),
    },
    vertexShader,
    fragmentShader
);

extend({ MosaicTemporalMaterial });

declare module "@react-three/fiber" {
    interface ThreeElements {
        mosaicTemporalMaterial: any;
    }
}

// ==========================================
// 2. WebGL Component
// ==========================================

function MosaicVideo({ src }: { src: string }) {
    const materialRef = useRef<any>(null);
    const { viewport } = useThree();
    const [textures, setTextures] = useState<THREE.VideoTexture[]>([]);

    useEffect(() => {
        // Create 3 separate video elements to have independent temporal states
        const videoElements = [0, 1.2, 2.8].map((offset) => {
            const vid = document.createElement("video");
            vid.src = src;
            vid.loop = true;
            vid.muted = true;
            vid.playsInline = true;
            vid.crossOrigin = "anonymous";
            vid.currentTime = offset;
            vid.play();
            return vid;
        });

        const videoTextures = videoElements.map(vid => {
            const tex = new THREE.VideoTexture(vid);
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            return tex;
        });

        setTextures(videoTextures);

        // Resolution setup
        if (materialRef.current) {
            materialRef.current.uResolution.set(window.innerWidth, window.innerHeight);
        }

        const handleResize = () => {
            if (materialRef.current) {
                materialRef.current.uResolution.set(window.innerWidth, window.innerHeight);
            }
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            videoElements.forEach(vid => {
                vid.pause();
                vid.src = "";
                vid.load();
            });
            videoTextures.forEach(tex => tex.dispose());
        };
    }, [src]);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.elapsedTime;
        }
    });

    if (textures.length < 3) return null;

    const scale = [viewport.width, viewport.height, 1] as [number, number, number];

    return (
        <mesh scale={scale}>
            <planeGeometry args={[1, 1, 1, 1]} />
            <mosaicTemporalMaterial
                ref={materialRef}
                uTexture1={textures[0]}
                uTexture2={textures[1]}
                uTexture3={textures[2]}
            />
        </mesh>
    );
}

// ==========================================
// 3. Main Page Layout Wrapper
// ==========================================

export default function MosaicExperiment() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
            <div className="absolute inset-0 z-0">
                {mounted && (
                    <Canvas camera={{ position: [0, 0, 1] }}>
                        <MosaicVideo src="/video_13.mp4" />
                    </Canvas>
                )}
            </div>

            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6 md:p-10 border-[12px] border-black text-white/90 mix-blend-difference">
                <header className="flex items-start justify-between w-full border-b border-white/10 pb-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="flex items-center gap-4"
                    >
                        <div className="w-12 h-12 bg-white flex items-center justify-center rounded-sm">
                            <Clock className="w-6 h-6 text-black" strokeWidth={1} />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-light tracking-[0.2em] uppercase leading-none">
                                Temporal <span className="font-black">Mosaic</span>
                            </h1>
                            <p className="text-[10px] font-mono tracking-widest text-white/40 mt-1">GLSL // TIME DISPLACEMENT // EXP-020</p>
                        </div>
                    </motion.div>

                    <div className="pointer-events-auto flex items-center">
                        <Link
                            href="/"
                            className="group flex gap-3 px-5 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-md transition-all duration-300 items-center justify-center border border-white/10"
                        >
                            <ArrowLeft className="w-4 h-4 text-white/60 group-hover:text-white transition-all" />
                            <span className="text-[11px] font-mono tracking-widest uppercase text-white/80 group-hover:text-white mt-0.5">Return</span>
                        </Link>
                    </div>
                </header>

                <div className="absolute top-1/2 left-6 -translate-y-1/2 flex flex-col items-center gap-12 opacity-30 font-mono text-[9px] tracking-widest">
                    <span className="rotate-90">TX_OFFSET 01</span>
                    <div className="w-px h-24 bg-white/50" />
                    <span className="rotate-90">TX_OFFSET 02</span>
                </div>

                <div className="absolute top-1/2 right-6 -translate-y-1/2 flex flex-col items-center gap-12 opacity-30 font-mono text-[9px] tracking-widest">
                    <span className="-rotate-90">TX_OFFSET 03</span>
                    <div className="w-px h-24 bg-white/50" />
                    <span className="-rotate-90">ASYNC SYNC</span>
                </div>

                <footer className="flex items-end justify-between w-full pt-6 border-t border-white/10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.9 }}
                        className="max-w-lg"
                    >
                        <p className="text-[11px] md:text-sm font-light tracking-wide leading-relaxed text-white/60">
                            <strong className="text-white font-medium block mb-1">Temporal Asynchronicity</strong>
                            This experiment instantiates 3 independent <code className="px-1 py-0.5 bg-white/10 rounded font-mono text-[9px]">HTMLVideoElement</code> buffers from the same source, each injected with a unique <code className="px-1 py-0.5 bg-white/10 rounded font-mono text-[9px]">currentTime</code> offset. The Fragment Shader dynamically selects the indexical texture buffer per column, creating a disjointed temporal mosaic.
                        </p>
                    </motion.div>

                    <div className="hidden md:flex flex-col gap-2 items-end">
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-[9px] font-mono tracking-widest text-amber-400">OFFSET ENGAGED</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
