"use client";

import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function FluidTypeExperiment() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Mouse position trackers for the 3D typography
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth springs for the 3D rotation
    const smoothX = useSpring(mouseX, { stiffness: 100, damping: 30, mass: 1 });
    const smoothY = useSpring(mouseY, { stiffness: 100, damping: 30, mass: 1 });

    // Map mouse position to rotation angles (subtle parallax)
    const rotateX = useTransform(smoothY, [-0.5, 0.5], [15, -15]);
    const rotateY = useTransform(smoothX, [-0.5, 0.5], [-15, 15]);

    // Shadow parallax mapping
    const shadowX = useTransform(smoothX, [-0.5, 0.5], [20, -20]);
    const shadowY = useTransform(smoothY, [-0.5, 0.5], [20, -20]);
    const textShadow = useTransform(
        [shadowX, shadowY],
        ([x, y]) => `${x}px ${y}px 40px rgba(0,0,0,0.8)`
    );

    // Handle mouse move across the whole screen
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Normalize mouse coordinates from -0.5 to 0.5 relative to the window center
            const x = (e.clientX / window.innerWidth) - 0.5;
            const y = (e.clientY / window.innerHeight) - 0.5;
            mouseX.set(x);
            mouseY.set(y);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    // Scroll logic for the reveal effect
    const { scrollYProgress } = useScroll({ target: containerRef });

    return (
        <div ref={containerRef} className="relative min-h-[150vh] bg-black overflow-hidden font-sans text-white">
            {/* 
        ========================================
        1. BASE VIDEO LAYER 
        ========================================
      */}
            <div className="fixed inset-0 w-full h-full z-0">
                <video
                    src="/video_12.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-80"
                />
                {/* Subtle base vignette */}
                <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black/90 pointer-events-none mix-blend-multiply" />
            </div>

            {/* 
        ========================================
        2. FLUID COLOR OVERLAY LAYER (MIX-BLEND-MODE)
        ========================================
        These massive blurred orbs use mix-blend-color or overlay to tint the video below
      */}
            <div className="fixed inset-0 w-full h-full pointer-events-none z-10 mix-blend-overlay opacity-80 will-change-transform">
                {/* Orb 1 - Deep Magenta */}
                <motion.div
                    animate={{
                        x: ["0vw", "40vw", "-20vw", "0vw"],
                        y: ["0vh", "-30vh", "50vh", "0vh"],
                        scale: [1, 1.5, 0.8, 1],
                    }}
                    transition={{ duration: 25, ease: "linear", repeat: Infinity }}
                    className="absolute top-[20%] left-[20%] w-[50vw] h-[50vh] bg-fuchsia-600/60 rounded-full blur-[120px]"
                />

                {/* Orb 2 - Cyan / Teal */}
                <motion.div
                    animate={{
                        x: ["0vw", "-50vw", "30vw", "0vw"],
                        y: ["0vh", "60vh", "-20vh", "0vh"],
                        scale: [1.2, 0.9, 1.4, 1.2],
                    }}
                    transition={{ duration: 30, ease: "linear", repeat: Infinity, delay: 2 }}
                    className="absolute top-[40%] right-[10%] w-[60vw] h-[60vh] bg-cyan-600/50 rounded-full blur-[150px]"
                />

                {/* Orb 3 - Deep Indigo */}
                <motion.div
                    animate={{
                        x: ["0vw", "30vw", "-40vw", "0vw"],
                        y: ["0vh", "20vh", "-50vh", "0vh"],
                        scale: [0.8, 1.3, 1, 0.8],
                    }}
                    transition={{ duration: 20, ease: "linear", repeat: Infinity, delay: 5 }}
                    className="absolute bottom-[10%] left-[30%] w-[40vw] h-[40vh] bg-indigo-700/70 rounded-full blur-[100px]"
                />
            </div>

            {/* 
        ========================================
        3. INTERACTIVE 3D TYPOGRAPHY LAYER
        ========================================
      */}
            <div className="relative z-20 w-full h-screen flex flex-col items-center justify-center pointer-events-none perspective-[1200px]">
                {/* 3D Wrapper */}
                <motion.div
                    style={{
                        rotateX,
                        rotateY,
                        transformStyle: "preserve-3d"
                    }}
                    className="text-center w-full max-w-7xl px-4 flex flex-col items-center justify-center gap-6"
                >
                    {/* Top small text */}
                    <motion.div
                        initial={{ opacity: 0, y: 50, translateZ: -100 }}
                        animate={{ opacity: 1, y: 0, translateZ: 50 }}
                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                        className="flex items-center gap-4 text-xs md:text-sm tracking-[0.3em] uppercase text-white/70 font-medium"
                        style={{ transform: "translateZ(50px)" }} // Push forward in 3D space
                    >
                        <span className="w-8 h-px bg-white/50" />
                        Fluid Dynamics
                        <span className="w-8 h-px bg-white/50" />
                    </motion.div>

                    {/* Massive Display Title */}
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                        className="text-7xl md:text-9xl lg:text-[12rem] font-black tracking-tighter leading-[0.85] uppercase text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 mix-blend-overlay"
                        style={{
                            textShadow, // Apply dynamic shadow mapped to mouse
                            transform: "translateZ(150px)" // Push title heavily forward
                        }}
                    >
                        Chroma
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-fuchsia-400 to-cyan-400 opacity-90">
                            Velocity
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
                        className="max-w-xl text-lg md:text-xl text-white/60 font-light mt-8 leading-relaxed mix-blend-overlay"
                        style={{ transform: "translateZ(80px)" }}
                    >
                        Utilizing mix-blend-modes and Framer Motion to paint generative, fluid light over monochrome video plates. Move your cursor to alter the parallax perspective.
                    </motion.p>
                </motion.div>
            </div>

            <div className="relative z-20 w-full h-[50vh] flex items-center justify-center bg-gradient-to-b from-transparent to-black/90">
                <p className="text-white/30 text-sm tracking-widest uppercase">Scroll completely to reveal bottom layer</p>
            </div>

            {/* Navigation Layer */}
            <div className="fixed top-8 left-8 z-50">
                <Link
                    href="/"
                    className="group flex items-center gap-3 px-5 py-2.5 bg-black/20 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-full backdrop-blur-xl transition-all duration-300 pointer-events-auto"
                >
                    <ArrowLeft className="w-4 h-4 text-white/70 group-hover:text-white group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-semibold tracking-widest text-white/70 group-hover:text-white uppercase">Return to Archive</span>
                </Link>
            </div>
        </div>
    );
}
