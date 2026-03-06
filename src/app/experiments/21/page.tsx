"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { ArrowLeft, RefreshCw, Layout, MousePointer2, Sparkles } from "lucide-react";
import Link from "next/link";

// Define different SVG paths for morphing
// These are balanced paths (same number of points) for optimal morphing
const paths = {
    circle: "M 50,50 m -40,0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0",
    blob: "M 50,50 m -40,0 c 0,-20 20,-40 40,-40 c 20,0 40,20 40,40 c 0,20 -20,40 -40,40 c -20,0 -40,-20 -40,-40",
    star: "M 50,10 L 60,35 L 85,35 L 65,55 L 75,80 L 50,65 L 25,80 L 35,55 L 15,35 L 40,35 Z",
    diamond: "M 50,5 L 90,50 L 50,95 L 10,50 Z",
    organic: "M 50,50 m -45,0 c 0,-30 40,-45 45,-45 c 5,0 45,15 45,45 c 0,30 -40,45 -45,45 c -5,0 -45,-15 -45,-45"
};

type ShapeKey = keyof typeof paths;

export default function SVGMorphingExperiment() {
    const [activeShape, setActiveShape] = useState<ShapeKey>("circle");
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth springs for mouse interaction
    const springConfig = { damping: 25, stiffness: 150 };
    const floatX = useSpring(mouseX, springConfig);
    const floatY = useSpring(mouseY, springConfig);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            mouseX.set(x * 40);
            mouseY.set(y * 40);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    const cycleShape = () => {
        const keys = Object.keys(paths) as ShapeKey[];
        const currentIndex = keys.indexOf(activeShape);
        const nextIndex = (currentIndex + 1) % keys.length;
        setActiveShape(keys[nextIndex]);
    };

    return (
        <div ref={containerRef} className="relative min-h-screen bg-[#030303] text-white overflow-hidden selection:bg-indigo-500/30">
            {/* Background Gradients */}
            <div className="absolute inset-0 z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-600/10 blur-[150px] rounded-full"
                />
            </div>

            {/* Navigation */}
            <nav className="absolute top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-center">
                <Link href="/" scroll={false}>
                    <motion.div
                        whileHover={{ x: -4 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Archive</span>
                    </motion.div>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold tracking-widest uppercase text-indigo-300">
                        SVG Topology
                    </div>
                    <div className="text-xs tracking-widest uppercase font-semibold text-white/50">
                        Experiment 21
                    </div>
                </div>
            </nav>

            {/* Main Experience */}
            <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
                <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* SVG Canvas Side */}
                    <div className="relative flex items-center justify-center aspect-square">
                        <motion.div
                            style={{ x: floatX, y: floatY }}
                            className="relative w-full h-full flex items-center justify-center"
                        >
                            <svg viewBox="0 0 100 100" className="w-[80%] h-[80%] drop-shadow-[0_0_50px_rgba(99,102,241,0.5)]">
                                <defs>
                                    <linearGradient id="morphGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="50%" stopColor="#a855f7" />
                                        <stop offset="100%" stopColor="#06b6d4" />
                                    </linearGradient>
                                    <filter id="goo">
                                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                                    </filter>
                                </defs>

                                <motion.path
                                    d={paths[activeShape]}
                                    fill="url(#morphGradient)"
                                    animate={{ d: paths[activeShape] }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 80,
                                        damping: 15,
                                        mass: 1
                                    }}
                                    className="filter-none"
                                />
                            </svg>

                            {/* Particle glow follow */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.5, 0.8, 0.5],
                                }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute inset-0 bg-indigo-500/10 blur-[60px] rounded-full -z-10"
                            />
                        </motion.div>
                    </div>

                    {/* Controls Side */}
                    <div className="flex flex-col gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Path Interpolation</span>
                            </div>
                            <h1 className="text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-300 to-neutral-500">
                                SVG Morphing <br /> Pipeline
                            </h1>
                            <p className="text-neutral-400 leading-relaxed font-light mb-8 max-w-md">
                                Exploring fluid vector transitions using pure CSS paths and Framer Motion's geometry engine.
                                Interact with the control matrix below to distort topology in real-time.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-2 gap-4">
                            {Object.keys(paths).map((shape) => (
                                <button
                                    key={shape}
                                    onClick={() => setActiveShape(shape as ShapeKey)}
                                    className={`group relative p-4 rounded-2xl border transition-all duration-500 ${activeShape === shape
                                            ? "bg-white/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                                            : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/[0.07]"
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-[10px] font-bold tracking-widest uppercase ${activeShape === shape ? "text-indigo-300" : "text-neutral-500"}`}>
                                            {shape}
                                        </span>
                                        <Layout className={`w-3.5 h-3.5 ${activeShape === shape ? "text-indigo-400" : "text-neutral-600"}`} />
                                    </div>
                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={false}
                                            animate={{ width: activeShape === shape ? "100%" : "0%" }}
                                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                                        />
                                    </div>
                                </button>
                            ))}

                            <button
                                onClick={cycleShape}
                                className="col-span-2 group flex items-center justify-center gap-3 p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 shadow-xl shadow-indigo-600/20"
                            >
                                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                                <span className="text-sm font-bold tracking-wide">Randomize Topology</span>
                            </button>
                        </div>

                        {/* Interaction hint */}
                        <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                                <MousePointer2 className="w-4 h-4" />
                                <span>Move mouse to tilt</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-neutral-700" />
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                                <Layout className="w-4 h-4" />
                                <span>Click to morph</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Decorative text */}
            <div className="absolute bottom-10 right-10 z-0 opacity-10 pointer-events-none select-none">
                <h2 className="text-[120px] font-black leading-none tracking-tighter">VECTOR</h2>
            </div>
        </div>
    );
}
