"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Hexagon, Component, ShieldAlert } from "lucide-react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

// Helper component for an individual glass shard to manage its own parallax
const ParallaxShard = ({
    scrollYProgress,
    speed,
    clipPath,
    filters,
    top,
    left,
    width,
    height,
    zIndex
}: {
    scrollYProgress: MotionValue<number>,
    speed: number,
    clipPath: string,
    filters: string,
    top: string,
    left: string,
    width: string,
    height: string,
    zIndex: number
}) => {
    // Parallax Math: We map [0,1] scroll progress to a vertical offset pixel range.
    // Higher speed = moves further up/down based on scroll.
    const yOffset = useTransform(scrollYProgress, [0, 1], [0, speed * -1000]);

    // We also spin them slightly as they fall to increase the chaotic feel
    const rotation = useTransform(scrollYProgress, [0, 1], [0, speed * 25]);

    return (
        <motion.div
            className="absolute rounded-md border border-white/5 bg-white/5 mix-blend-hard-light shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            style={{
                top,
                left,
                width,
                height,
                zIndex,
                clipPath,
                backdropFilter: filters,
                WebkitBackdropFilter: filters, // Safari support
                y: yOffset,
                rotate: rotation
            }}
        />
    );
};

export default function FracturedPrism() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    // We must not pass an unhydrated ref to useScroll during SSR
    const { scrollYProgress } = useScroll(
        mounted
            ? { target: containerRef, offset: ["start start", "end end"] }
            : undefined // Fallback for SSR where window/ref doesn't exist
    );

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setMounted(true);
    }, []);

    // Configuration map for our shattered glass shards.
    // Each object defines a unique polygon shape, physical CSS filter, and parallax scrolling speed.
    const SHARDS = [
        { speed: 1.5, clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)", filters: "blur(20px) contrast(150%) hue-rotate(45deg)", top: "15%", left: "10%", width: "40vw", height: "40vw", zIndex: 10 },
        { speed: 0.8, clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)", filters: "blur(10px) brightness(1.5)", top: "45%", left: "60%", width: "25vw", height: "25vw", zIndex: 5 },
        { speed: 2.2, clipPath: "polygon(0 0, 100% 0, 100% 100%)", filters: "blur(5px) invert(100%) opacity(0.8)", top: "60%", left: "15%", width: "20vw", height: "30vw", zIndex: 20 },
        { speed: 1.1, clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)", filters: "blur(30px) saturate(200%) hue-rotate(-90deg)", top: "80%", left: "45%", width: "35vw", height: "35vw", zIndex: 12 },
        { speed: 3.0, clipPath: "polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)", filters: "blur(12px) contrast(180%) sepia(50%)", top: "120%", left: "25%", width: "45vw", height: "20vw", zIndex: 30 },
        { speed: 0.5, clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", filters: "blur(40px) brightness(0.5)", top: "150%", left: "70%", width: "50vw", height: "50vw", zIndex: 2 },
        { speed: 1.8, clipPath: "polygon(0% 15%, 15% 15%, 15% 0%, 85% 0%, 85% 15%, 100% 15%, 100% 85%, 85% 85%, 85% 100%, 15% 100%, 15% 85%, 0% 85%)", filters: "blur(25px) hue-rotate(180deg) contrast(120%)", top: "190%", left: "5%", width: "30vw", height: "30vw", zIndex: 15 },
        { speed: 2.5, clipPath: "polygon(10% 25%, 35% 25%, 35% 0%, 65% 0%, 65% 25%, 90% 25%, 90% 50%, 65% 50%, 65% 100%, 35% 100%, 35% 50%, 10% 50%)", filters: "blur(8px) invert(80%) sepia(20%)", top: "240%", left: "55%", width: "40vw", height: "50vw", zIndex: 25 },
    ];

    if (!mounted) return <div className="min-h-screen bg-black" />;

    return (
        <div className="bg-black text-white selection:bg-purple-500/30 font-sans">

            {/* 
         THE FIXED BACKGROUND LAYER 
         video_9.mp4 plays constantly in the rearmost layer, completely locked to the viewport geometry.
       */}
            <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-black pointer-events-none">
                <video
                    src="/video_9.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105" // slight scale prevents edge-bleed from heavy blurs
                    style={{ filter: "contrast(110%) saturate(120%)" }}
                />
                {/* Dark Vignette to ground the chaos */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#000_100%)] opacity-80" />
            </div>

            {/* 
         THE FOREGROUND STATIC UI
         Fixed to viewport. Provides navigation and telemetry while the scroll container moves beneath it.
       */}
            <div className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-start pointer-events-none">
                <Link href="/" scroll={false} className="pointer-events-auto group flex items-center gap-3 bg-black/40 hover:bg-black/80 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full transition-all duration-300">
                    <ArrowLeft className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                    <span className="text-xs font-mono tracking-widest uppercase text-white/70 group-hover:text-white">
                        ABORT
                    </span>
                </Link>

                <div className="flex flex-col items-end gap-2 text-right">
                    <div className="flex items-center gap-2 bg-red-900/30 border border-red-500/50 px-3 py-1.5 rounded-full text-[10px] font-mono tracking-widest text-red-400">
                        <ShieldAlert className="w-3 h-3 animate-pulse" /> CRITICAL FRACTURE DETECTED
                    </div>
                    <div className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em] mt-2">
                        Z-INDEX MULTIPLEXING ACTIVE
                    </div>
                </div>
            </div>

            {/* 
         THE MASSIVE SCROLL TRACK 
         This is the element that actually forces the browser to scroll.
         Inside it, we map the varying parallax shards.
       */}
            <div ref={containerRef} className="relative w-full h-[400vh] z-10 pointer-events-none">
                <div className="absolute top-[20vh] w-full flex flex-col items-center justify-center pointer-events-none z-20 mix-blend-overlay">
                    <h1 className="text-6xl md:text-[12vw] font-black uppercase tracking-tighter text-white drop-shadow-2xl">
                        PRISM
                    </h1>
                    <div className="flex items-center gap-4 text-white/40 font-mono text-sm tracking-widest uppercase mt-4">
                        <Hexagon className="w-4 h-4" /> <span>Scroll to separate</span>
                    </div>
                </div>

                {/* Render the chaotic glass shards */}
                {SHARDS.map((shard, idx) => (
                    <ParallaxShard
                        key={idx}
                        scrollYProgress={scrollYProgress}
                        {...shard}
                    />
                ))}

                <div className="absolute bottom-[20vh] w-full flex flex-col items-center justify-center pointer-events-none z-20">
                    <Component className="w-12 h-12 text-white/20 mb-6 animate-spin-slow" />
                    <h2 className="text-2xl md:text-5xl font-serif italic font-light text-white/60 tracking-tight text-center max-w-2xl leading-tight">
                        CSS Backdrop Filter<br />
                        <span className="font-sans font-black not-italic text-white uppercase tracking-tighter text-4xl md:text-7xl mix-blend-overlay">Aberration</span>
                    </h2>
                </div>
            </div>

        </div>
    );
}
