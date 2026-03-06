"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowLeft, Box, Compass, Layers, MousePointer2 } from "lucide-react";
import Link from "next/link";

const PerspectiveBlock = ({
    text,
    mouseX,
    mouseY,
    index
}: {
    text: string;
    mouseX: any;
    mouseY: any;
    index: number
}) => {
    const ref = useRef<HTMLDivElement>(null);

    // Calculate center of this specific block
    const [center, setCenter] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            setCenter({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            });
        }
    }, []);

    // Calculate distance/angle from cursor
    const rotateX = useTransform(mouseY, (y: any) => {
        const val = typeof y === "number" ? y : 0;
        const deltaY = (val - center.y) / 20;
        return -deltaY;
    });

    const rotateY = useTransform(mouseX, (x: any) => {
        const val = typeof x === "number" ? x : 0;
        const deltaX = (val - center.x) / 20;
        return deltaX;
    });

    // Smooth springs for high-end feel
    const springConfig = { damping: 30, stiffness: 200, mass: 1 };
    const smoothRotateX = useSpring(rotateX, springConfig);
    const smoothRotateY = useSpring(rotateY, springConfig);

    // Z-axis displacement based on proximity
    const z = useTransform([mouseX, mouseY], (input: any) => {
        const [x, y] = input;
        const valX = typeof x === "number" ? x : 0;
        const valY = typeof y === "number" ? y : 0;
        const dx = valX - center.x;
        const dy = valY - center.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return Math.max(0, 100 - dist / 5);
    });
    const smoothZ = useSpring(z, springConfig);

    return (
        <motion.div
            ref={ref}
            style={{
                rotateX: smoothRotateX,
                rotateY: smoothRotateY,
                z: smoothZ,
                transformStyle: "preserve-3d",
                perspective: 1000,
            }}
            className="relative group w-full aspect-[4/1] flex items-center justify-center bg-white/[0.03] border border-white/[0.05] rounded-xl overflow-visible"
        >
            <span className="text-2xl md:text-4xl font-black tracking-tighter text-white/20 group-hover:text-cyan-400 group-hover:text-shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-colors duration-500">
                {text}
            </span>

            {/* Ghost layer for depth */}
            <motion.div
                style={{
                    z: -40,
                    opacity: 0.1,
                }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
                <span className="text-2xl md:text-4xl font-black tracking-tighter text-white">
                    {text}
                </span>
            </motion.div>
        </motion.div>
    );
};

export default function MagneticPerspectiveExperiment() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const blocks = [
        "PERSPECTIVE", "DIMENSION", "GEOMETRY", "SPATIAL",
        "INTERACTIVE", "KINETIC", "VOLUMETRIC", "MAGNETIC",
        "TOPOLOGY", "GRADIENT", "EXPERIMENTAL", "FUTURE"
    ];

    return (
        <div className="relative min-h-screen bg-[#050505] text-white overflow-hidden flex items-center justify-center p-6 md:p-12">
            {/* Background elements */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(15,15,35,1)_0%,rgba(0,0,0,1)_100%)]" />
                <div className="absolute top-[-10%] right-[10%] w-[400px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-cyan-600/10 blur-[150px] rounded-full" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-center pointer-events-none">
                <Link href="/" scroll={false} className="pointer-events-auto">
                    <motion.div
                        whileHover={{ x: -4 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Archive</span>
                    </motion.div>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold tracking-widest uppercase text-cyan-300">
                        3D Engine
                    </div>
                    <div className="text-xs tracking-widest uppercase font-semibold text-white/50">
                        Experiment 23
                    </div>
                </div>
            </nav>

            {/* Main Grid */}
            <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                style={{ perspective: "1500px" }}>
                {blocks.map((text, i) => (
                    <PerspectiveBlock key={i} text={text} mouseX={mouseX} mouseY={mouseY} index={i} />
                ))}
            </div>

            {/* Interface Labels */}
            <div className="fixed top-1/2 left-10 -translate-y-1/2 hidden xl:flex flex-col gap-12 opacity-30 select-none">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-xs font-bold tracking-[0.3em] uppercase">
                        <Compass className="w-4 h-4" />
                        <span>Vector Field</span>
                    </div>
                    <div className="w-full h-px bg-white/20" />
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-xs font-bold tracking-[0.3em] uppercase">
                        <Layers className="w-4 h-4" />
                        <span>Depth Map</span>
                    </div>
                    <div className="w-full h-px bg-white/20" />
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-xs font-bold tracking-[0.3em] uppercase">
                        <Box className="w-4 h-4" />
                        <span>Volumetric</span>
                    </div>
                    <div className="w-full h-px bg-white/20" />
                </div>
            </div>

            {/* Interaction Hint */}
            <div className="fixed bottom-10 right-10 flex items-center gap-4 text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                <MousePointer2 className="w-4 h-4" />
                <span>Tracking Active</span>
                <div className="flex gap-1">
                    <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1 h-1 rounded-full bg-cyan-500" />
                    <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }} className="w-1 h-1 rounded-full bg-cyan-500" />
                    <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 1 }} className="w-1 h-1 rounded-full bg-cyan-500" />
                </div>
            </div>
        </div>
    );
}
