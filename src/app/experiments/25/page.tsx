"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

const PARTICLE_COUNT = 40;

const EtherealParticle = ({ index, mouseX, mouseY }: { index: number; mouseX: any; mouseY: any }) => {
    // Random static properties
    const initialX = useMemo(() => Math.random() * 100, []);
    const initialY = useMemo(() => Math.random() * 100, []);
    const size = useMemo(() => 4 + Math.random() * 16, [index]); // 4x larger (prev: 1 + random*4)
    const baseOpacity = useMemo(() => 0.05 + Math.random() * 0.3, [index]); // Slightly lower base opacity for larger blobs
    const twinkleDuration = useMemo(() => 3 + Math.random() * 4, [index]);
    const twinkleDelay = useMemo(() => Math.random() * 5, [index]);
    const color = useMemo(() => {
        const colors = ["#d8b4fe", "#c084fc", "#818cf8", "#f472b6", "#ffffff"];
        return colors[index % colors.length];
    }, [index]);

    const x = useMotionValue(initialX);
    const y = useMotionValue(initialY);

    // Use spring for more natural feeling inertia
    const springX = useSpring(x, { damping: 30, stiffness: 50 });
    const springY = useSpring(y, { damping: 30, stiffness: 50 });

    useEffect(() => {
        let raf: number;
        let angle = Math.random() * Math.PI * 2;

        const animate = () => {
            const mx = mouseX.get();
            const my = mouseY.get();

            const px = (initialX / 100) * window.innerWidth;
            const py = (initialY / 100) * window.innerHeight;

            const dx = px - mx;
            const dy = py - my;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Subtle random drift (Brownian motion)
            angle += 0.01;
            const driftX = Math.cos(angle) * 0.2;
            const driftY = Math.sin(angle) * 0.2;

            if (dist < 250) {
                const force = (250 - dist) / 250;
                const targetX = initialX + (dx / dist) * force * 8 + driftX;
                const targetY = initialY + (dy / dist) * force * 8 + driftY;
                x.set(targetX);
                y.set(targetY);
            } else {
                x.set(initialX + driftX);
                y.set(initialY + driftY);
            }

            raf = requestAnimationFrame(animate);
        };
        raf = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(raf);
    }, [initialX, initialY, mouseX, mouseY, x, y]);

    return (
        <motion.div
            animate={{
                opacity: [baseOpacity, baseOpacity * 1.5, baseOpacity],
                scale: [1, 1.1, 1]
            }}
            transition={{
                duration: twinkleDuration,
                delay: twinkleDelay,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            style={{
                left: useTransform(springX, v => `${v}%`),
                top: useTransform(springY, v => `${v}%`),
                width: size,
                height: size,
                backgroundColor: color,
                boxShadow: size > 2 ? `0 0 ${size * 3}px ${color}` : 'none',
            }}
            className="absolute rounded-full pointer-events-none"
        />
    );
};

export default function EtherealDriftExperiment() {
    const [mounted, setMounted] = useState(false);
    const mouseX = useMotionValue(-1000);
    const mouseY = useMotionValue(-1000);

    useEffect(() => {
        setMounted(true);
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="relative min-h-screen bg-[#020205] text-white overflow-hidden font-light selection:bg-purple-500/30">
            {/* BACKGROUND NEBULA: CSS-ONLY HIGH PERFORMANCE GASEOUS LOOK */}
            <div className="fixed inset-0 z-0">
                {/* Deep background color */}
                <div className="absolute inset-0 bg-[#020205]" />

                {/* Animated Nebulous Clouds (Blurred CSS Blobs) */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                        y: [0, -30, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[10%] left-[20%] w-[60vw] h-[60vw] bg-purple-900/10 rounded-full blur-[150px]"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        x: [0, -40, 0],
                        y: [0, 60, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[20%] right-[10%] w-[50vw] h-[50vw] bg-blue-900/10 rounded-full blur-[180px]"
                />
                <motion.div
                    animate={{
                        opacity: [0.05, 0.15, 0.05],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[40vw] bg-magenta-900/5 rounded-full blur-[200px] rotate-45"
                />
            </div>

            {/* STARDUST: SPARSE RE-USABLE DOM PARTICLES */}
            <div className="fixed inset-0 z-10 pointer-events-none">
                {mounted && [...Array(PARTICLE_COUNT)].map((_, i) => (
                    <EtherealParticle key={i} index={i} mouseX={mouseX} mouseY={mouseY} />
                ))}
            </div>

            {/* NAVIGATION: GLASSMORPHISM */}
            <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-center pointer-events-none">
                <Link href="/" scroll={false} className="pointer-events-auto">
                    <motion.div
                        whileHover={{ x: -2, opacity: 0.7 }}
                        className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-3xl text-[9px] font-black tracking-[0.6em] uppercase transition-all cursor-pointer"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        <span>BIO-SPACE / 025</span>
                    </motion.div>
                </Link>
                <div className="flex flex-col items-end gap-1">
                    <div className="text-[10px] font-black tracking-[0.4em] uppercase text-purple-400 opacity-60">Unknown Entity</div>
                </div>
            </nav>

            {/* MAIN CONTENT: MINIMALIST OVERLAY */}
            <main className="relative z-20 min-h-screen flex items-center justify-center p-6 select-none">
                <div className="max-w-4xl w-full flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 3, ease: [0.23, 1, 0.32, 1] }}
                        className="relative"
                    >
                        <h1 className="text-[15vw] md:text-[10vw] font-black tracking-[-0.08em] text-white/5 leading-none uppercase select-none">
                            ETHEREAL
                        </h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                animate={{ opacity: [0.2, 0.5, 0.2] }}
                                transition={{ duration: 8, repeat: Infinity }}
                                className="text-[1.5vw] md:text-[0.8vw] font-bold tracking-[1.5em] uppercase text-purple-200/40 translate-y-4"
                            >
                                Infinite Drift
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* HUD ELEMENTS */}
                <div className="absolute bottom-12 left-10 md:left-24 space-y-8 pointer-events-none">
                    <div className="space-y-2">
                        <div className="w-8 h-px bg-white/20" />
                        <div className="text-[8px] font-black tracking-widest uppercase text-white/20 italic">Status: Stable</div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="text-[10px] font-bold tracking-[0.2em] text-white/60">"The void is not empty, it is merely waiting."</div>
                        <div className="text-[8px] opacity-20 uppercase tracking-tighter">Coord: Theta-9 Range</div>
                    </div>
                </div>

                <div className="absolute bottom-12 right-10 md:right-24 flex items-center gap-6 opacity-20 pointer-events-none">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black uppercase tracking-widest">Optimized 60FPS</span>
                        <span className="text-[8px] font-black uppercase tracking-widest">Low CPU Mode</span>
                    </div>
                    <Sparkles className="w-4 h-4" />
                </div>
            </main>

            <style jsx global>{`
        body {
          background-color: #020205;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
      `}</style>
        </div>
    );
}
