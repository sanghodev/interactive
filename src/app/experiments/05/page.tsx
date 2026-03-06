"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import { ArrowLeft, Sparkles, Layers, Box, Maximize } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

// Declare global variable for TS compiler
declare global {
    interface Window {
        UnicornStudio: any;
    }
}

export default function UnicornWebGL() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Parallax effects for the overlay UI
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-purple-500/30">

            {/* 
         1. Next.js Script Tag Integration
         This safely loads the Unicorn Studio library on the client 
         and initializes it exactly when the script has finished downloading.
      */}
            <Script
                src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.5/dist/unicornStudio.umd.js"
                strategy="lazyOnload"
                onLoad={() => {
                    if (window.UnicornStudio && window.UnicornStudio.init) {
                        window.UnicornStudio.init();
                    }
                }}
            />

            {/* 2. Global Navigation */}
            <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-center pointer-events-none mix-blend-difference text-white">
                <Link href="/" scroll={false} className="pointer-events-auto">
                    <motion.div
                        whileHover={{ x: -4 }}
                        className="flex items-center gap-2 px-4 py-2 font-medium transition-opacity hover:opacity-70"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Archive Index</span>
                    </motion.div>
                </Link>
                <div className="font-mono text-xs tracking-widest uppercase opacity-60 flex gap-2 items-center">
                    <Sparkles className="w-3 h-3" />
                    WebGL
                </div>
            </nav>

            {/* 3. Immersive WebGL Hero Section */}
            <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center">

                {/* The Unicorn Studio WebGL Canvas Embed */}
                {/* We override the inline style to fill the entire viewport responsively */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none md:pointer-events-auto"
                    data-us-project="IP4GlTs6QS27AZvsDPSU"
                    style={{ width: "100%", height: "100%" }}
                />

                {/* Subtle overlay gradients for UI legibility */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-10" />
                <div className="absolute inset-0 bg-black/10 pointer-events-none z-10" />

                {/* Floating Typography & Foreground UI */}
                <motion.div
                    style={{ y, opacity }}
                    className="relative z-20 text-center px-6 pointer-events-none mt-32 md:mt-0"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    >
                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-purple-500/50">
                            Digital
                            <br />
                            Immersion.
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="text-lg md:text-2xl text-neutral-300 font-light max-w-xl mx-auto mb-10"
                    >
                        Transcend flat interfaces with real-time WebGL engines. Explore 3D fluidity seamlessly integrated into modern React architectures.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 1 }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 pointer-events-auto hover:bg-white/10 transition-colors"
                    >
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-sm font-medium">Interactive Canvas Active</span>
                    </motion.div>
                </motion.div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 opacity-50">
                    <span className="text-[10px] uppercase tracking-widest font-mono">Scroll Context</span>
                    <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
                </div>
            </div>

            {/* 4. Premium Landing Page Dummy Content */}
            <div className="relative z-20 bg-[#050505]">
                <div className="max-w-7xl mx-auto px-6 py-32 md:py-48">

                    {/* Section Heading */}
                    <div className="max-w-2xl mb-24">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
                            Beyond the Document Object Model.
                        </h2>
                        <p className="text-neutral-400 text-lg md:text-xl font-light leading-relaxed">
                            WebGL bypasses standard DOM rendering constraints, communicating directly with the GPU. This allows for millions of fluid particles, complex shaders, and massive volumetric lighting effects that traditional HTML/CSS simply cannot compute natively.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                        {[
                            {
                                icon: Layers,
                                title: "Shader Architectures",
                                desc: "Custom GLSL fragment shaders enabling liquid distortion and mesmerizing real-time light refractions."
                            },
                            {
                                icon: Box,
                                title: "Unicorn Studio Wrap",
                                desc: "Securely embedded via Next.js <Script> tags, preventing hydration mismatches and memory leaks on unmount."
                            },
                            {
                                icon: Maximize,
                                title: "Fullscreen Fluidity",
                                desc: "Canvas scaling inherently mapped to the viewport unit (100vh), guaranteeing edge-to-edge immersive environments."
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="glass-panel p-10 rounded-3xl hover:-translate-y-2 transition-transform duration-500">
                                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Abstract Content Block */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center rounded-[3rem] bg-neutral-900 border border-neutral-800 p-8 md:p-16 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

                        <div className="relative z-10">
                            <h3 className="text-3xl md:text-4xl font-bold mb-6">Next.js Meets<br />High-End VFX</h3>
                            <p className="text-neutral-400 mb-8 leading-relaxed">
                                By isolating the computational heavy-lifting to a dedicated canvas layer integrated via Unicorn Studio, the primary React application thread remains entirely unblocked and responsive for standard UI interactions.
                            </p>
                            <button className="px-8 py-4 bg-white text-black rounded-full font-bold transition-transform hover:scale-105">
                                Explore Technical Specs
                            </button>
                        </div>

                        {/* Visual Placeholder for additional content */}
                        <div className="relative h-64 md:h-full min-h-[300px] rounded-2xl bg-black border border-neutral-800 flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-purple-500/10" />
                            {/* Abstract CSS Grid Background */}
                            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(var(--neutral-800) 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.3 }} />

                            <div className="relative w-32 h-32 rounded-full border border-purple-500/30 flex items-center justify-center">
                                <div className="w-24 h-24 rounded-full border border-purple-500/50 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 blur-xl animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
