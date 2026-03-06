"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowLeft, Maximize2, Move, Zap, Info } from "lucide-react";
import Link from "next/link";

const TEXT = "LIQUID KINETICS";
const REPEATS = 40; // Total lines of text

const KineticChar = ({ char, mouseX, mouseY }: { char: string; mouseX: any; mouseY: any }) => {
    const ref = useRef<HTMLSpanElement>(null);

    // Base position and movement
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useMotionValue(0);
    const scale = useMotionValue(1);

    // Smooth springs
    const springX = useSpring(x, { stiffness: 100, damping: 20 });
    const springY = useSpring(y, { stiffness: 100, damping: 20 });
    const springRotate = useSpring(rotate, { stiffness: 100, damping: 20 });
    const springScale = useSpring(scale, { stiffness: 100, damping: 20 });

    useEffect(() => {
        const update = () => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            const charX = rect.left + rect.width / 2;
            const charY = rect.top + rect.height / 2;

            const deltaX = mouseX.get() - charX;
            const deltaY = mouseY.get() - charY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            const radius = 250;
            if (distance < radius) {
                const power = (1 - distance / radius);
                x.set(deltaX * power * -0.5);
                y.set(deltaY * power * -0.5);
                rotate.set(deltaX * power * 0.2);
                scale.set(1 + power * 0.5);
            } else {
                x.set(0);
                y.set(0);
                rotate.set(0);
                scale.set(1);
            }
        };

        const unsubscribeX = mouseX.on("change", update);
        const unsubscribeY = mouseY.on("change", update);
        return () => {
            unsubscribeX();
            unsubscribeY();
        };
    }, [mouseX, mouseY]);

    return (
        <motion.span
            ref={ref}
            style={{
                x: springX,
                y: springY,
                rotate: springRotate,
                scale: springScale,
                display: "inline-block",
            }}
            className="select-none transition-colors duration-300 hover:text-indigo-400"
        >
            {char === " " ? "\u00A0" : char}
        </motion.span>
    );
};

const KineticLine = ({ text, mouseX, mouseY }: { text: string; mouseX: any; mouseY: any }) => {
    return (
        <div className="flex justify-center gap-[0.1em] text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter whitespace-nowrap opacity-40 hover:opacity-100 transition-opacity">
            {text.split("").map((char, i) => (
                <KineticChar key={i} char={char} mouseX={mouseX} mouseY={mouseY} />
            ))}
        </div>
    );
};

export default function KineticTypographyExperiment() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const lines = useMemo(() => Array.from({ length: REPEATS }), []);

    return (
        <div ref={containerRef} className="relative min-h-screen bg-[#000] text-white overflow-hidden flex flex-col items-center justify-center py-20">
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
                    <div className="px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-[10px] font-bold tracking-widest uppercase text-fuchsia-300">
                        Kinetic Engine
                    </div>
                    <div className="text-xs tracking-widest uppercase font-semibold text-white/50">
                        Experiment 22
                    </div>
                </div>
            </nav>

            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-fuchsia-600/5 blur-[150px] rounded-full" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
            </div>

            {/* Interaction Surface */}
            <div className="relative z-10 flex flex-col gap-2 w-full">
                {lines.map((_, i) => (
                    <KineticLine key={i} text={i % 2 === 0 ? TEXT : "FLUID TYPE"} mouseX={mouseX} mouseY={mouseY} />
                ))}
            </div>

            {/* Floating Info UI */}
            <div className="fixed bottom-10 left-10 z-50 flex flex-col gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-6 max-w-sm rounded-[2rem] border border-white/10"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-fuchsia-400" />
                        </div>
                        <h3 className="font-bold text-lg">Mechanical Fluidity</h3>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                        A real-time physics simulation calculating character displacement based on proximity indices.
                        Optimized for 60fps interaction using Framer Motion's internal update loop.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                            <Move className="w-3 h-3" />
                            <span>Attraction</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                            <Maximize2 className="w-3 h-3" />
                            <span>Scalability</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Center Label Overlay */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none opacity-20 flex flex-col items-center">
                <div className="w-px h-20 bg-gradient-to-b from-transparent to-white/50 mb-4" />
                <span className="text-[10px] font-bold tracking-[0.5em] uppercase text-white/50">Geometric Interaction System</span>
                <div className="w-px h-20 bg-gradient-to-t from-transparent to-white/50 mt-4" />
            </div>

            {/* Viewport grain overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100]"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E")' }}
            />
        </div>
    );
}
