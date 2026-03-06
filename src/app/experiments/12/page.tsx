"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Maximize2, MoveVertical } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function FloatingVideoGlass() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Motion Values for mouse tracking
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth Springs for natural feel
    const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
    const smoothMouseX = useSpring(mouseX, springConfig);
    const smoothMouseY = useSpring(mouseY, springConfig);

    // Transform Mouse position to Rotation degrees
    const rotateX = useTransform(smoothMouseY, [-1, 1], [15, -15]);
    const rotateY = useTransform(smoothMouseX, [-1, 1], [-15, 15]);

    // Transform Mouse position to subtle Parallax shifts for inner elements
    const parallaxX = useTransform(smoothMouseX, [-1, 1], [-20, 20]);
    const parallaxY = useTransform(smoothMouseY, [-1, 1], [-20, 20]);

    // Highlighting glow effect on the card
    const glareX = useTransform(smoothMouseX, [-1, 1], ["0%", "100%"]);
    const glareY = useTransform(smoothMouseY, [-1, 1], ["0%", "100%"]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Normalize mouse coordinates precisely across the entire screen
            const { innerWidth, innerHeight } = window;
            const nx = (e.clientX / innerWidth) * 2 - 1; // -1 to 1
            const ny = (e.clientY / innerHeight) * 2 - 1; // -1 to 1

            mouseX.set(nx);
            mouseY.set(ny);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-screen overflow-hidden bg-[#050505] font-sans selection:bg-white/20 text-neutral-200"
            style={{ perspective: "1500px" }}
        >
            {/* 
        AMBIENT LIGHTING LAYER
        We stretch video_7.mp4 fully but blur it into oblivion to act as a dynamic aura
      */}
            <div className="absolute inset-0 z-0 w-[120vw] h-[120vh] -left-[10vw] -top-[10vh]">
                <video
                    src="/video_7.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-60 blur-[120px] saturate-200 mix-blend-screen scale-110"
                />
                {/* Darkening vignette overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_80%)]" />
            </div>

            {/* TOP NAVIGATION TACTILE */}
            <div className="absolute top-0 left-0 w-full p-8 z-50 flex justify-between items-start pointer-events-none">
                <Link href="/" scroll={false} className="pointer-events-auto group flex items-center gap-3 bg-black/20 hover:bg-black/40 border border-white/5 backdrop-blur-2xl px-5 py-3 rounded-full transition-all duration-300">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:-translate-x-1 transition-transform">
                        <ArrowLeft className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium tracking-widest uppercase text-white/80 group-hover:text-white">
                        Back to Archive
                    </span>
                </Link>
                <div className="text-right pointer-events-none drop-shadow-2xl">
                    <div className="text-xs font-bold tracking-[0.3em] text-white/50 mb-1 uppercase">Experiment 12</div>
                    <div className="text-sm text-white/90 font-light">Tactile Video Glass</div>
                </div>
            </div>

            {/* 
        CENTRAL 3D TILT CONTAINER
        This wraps the entire center structure to intercept tracking and apply physical transforms
      */}
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                <motion.div
                    style={{
                        rotateX,
                        rotateY,
                        transformStyle: "preserve-3d" // CRITICAL for inner parallax
                    }}
                    className="relative w-[90%] max-w-5xl aspect-[16/9] md:aspect-auto md:h-[70vh] rounded-[2rem] md:rounded-[3rem] pointer-events-auto flex items-center justify-center group"
                >

                    {/* THE GLASS CARD ITSELF */}
                    <div
                        className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-[inherit] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.6)] overflow-hidden"
                        style={{ transform: "translateZ(0px)" }}
                    >
                        {/* Dynamic Glare following mouse */}
                        <motion.div
                            className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500 z-50 pointer-events-none mix-blend-overlay"
                            style={{
                                background: "radial-gradient(circle 800px at calc(var(--x, 50%)) calc(var(--y, 50%)), rgba(255,255,255,0.8), transparent 40%)",
                                // We use framer motion to set CSS variables for the gradient center
                                // Using a tricky approach to map the string percentages
                                // Alternatively, simple style mapping:
                            }}
                        />
                        {/* Since framer spring to string interpolation in background image is tricky inline, we use a simpler approach for the glare wrapper */}
                        <motion.div
                            className="absolute w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_50%)] rounded-full -top-1/2 -left-1/2 z-50 pointer-events-none mix-blend-color-dodge opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                            style={{
                                left: glareX,
                                top: glareY,
                                transform: "translate(-50%, -50%)"
                            }}
                        />
                    </div>

                    {/* FOREGROUND CRISP VIDEO (Popped out slightly) */}
                    <motion.div
                        className="absolute w-[80%] h-[80%] rounded-[1.5rem] overflow-hidden shadow-2xl border border-white/10"
                        style={{
                            transform: "translateZ(50px)", // Push it towards the viewer
                            x: parallaxX,
                            y: parallaxY
                        }}
                    >
                        <video
                            src="/video_7.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover scale-105" // slight scale to hide edges during parallax inner shift if needed
                        />

                        {/* Video Overlay UI */}
                        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                            <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex gap-3 text-xs tracking-wider items-center">
                                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                LIVE STREAM
                            </div>
                            <div className="flex gap-2">
                                <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                                    <Play className="w-4 h-4 ml-1" />
                                </button>
                                <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hidden md:flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                                    <Maximize2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* FLOATING TEXT ELEMENTS (Popped out even further) */}
                    <motion.div
                        className="absolute -right-6 md:-right-16 top-1/2 -translate-y-1/2 z-30"
                        style={{ transform: "translateZ(100px)" }}
                    >
                        <h1 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 tracking-tighter drop-shadow-xl" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                            TACTILE
                        </h1>
                    </motion.div>

                    <motion.div
                        className="absolute -left-6 md:-left-12 bottom-12 md:bottom-20 z-30 flex gap-4 items-center bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-2xl shadow-xl"
                        style={{ transform: "translateZ(80px)" }}
                    >
                        <MoveVertical className="w-6 h-6 text-white/50 animate-bounce" />
                        <div>
                            <div className="text-white font-bold text-sm tracking-widest uppercase">Depth Perception</div>
                            <div className="text-white/40 text-xs mt-1">Move cursor to tilt 3D axis</div>
                        </div>
                    </motion.div>

                </motion.div>
            </div>

        </div>
    );
}
