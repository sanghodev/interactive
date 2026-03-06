"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { ArrowLeft, Cpu, Hexagon, Network } from "lucide-react";
import { motion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function VectorScrollExperiment() {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const pathRefs = useRef<(SVGPathElement | null)[]>([]);

    useGSAP(() => {
        // 1. Initial State: Prepare SVG paths for "drawing" by setting dasharray
        pathRefs.current.forEach((path) => {
            if (!path) return;
            const length = path.getTotalLength();
            gsap.set(path, {
                strokeDasharray: length,
                strokeDashoffset: length, // Hide initially
            });
        });

        // 2. Main Hero Scroll Sequence
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "+=2000", // Scroll duration for the pinned section
                pin: true,
                scrub: 1, // Smooth scrubbing
            },
        });

        // Draw the network paths
        tl.to(pathRefs.current, {
            strokeDashoffset: 0,
            duration: 3,
            stagger: 0.2, // Draw paths one after another
            ease: "power2.inOut",
        }, 0);

        // Fade in glowing nodes at path intersections
        tl.to(".svg-node", {
            opacity: 1,
            scale: 1,
            duration: 1,
            stagger: 0.1,
            ease: "back.out(1.7)",
        }, 1.5);

        // Scale the entire SVG infinitely to transition to the next section
        tl.to(svgRef.current, {
            scale: 15, // Massive scale
            opacity: 0, // Fade out softly as it gets too large
            duration: 3,
            ease: "power3.in",
        }, 2.5);

        // Hero Text Animations
        tl.to(".hero-title-1", { y: -100, opacity: 0, duration: 1 }, 0);
        tl.fromTo(".hero-title-2", { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5 }, 1);
        tl.to(".hero-title-2", { scale: 1.5, opacity: 0, duration: 2, ease: "power2.in" }, 2.5);

    }, { scope: containerRef });

    return (
        <div className="bg-[#030303] min-h-screen text-white font-sans selection:bg-cyan-500/30">
            {/* Navigation */}
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
                <div className="font-mono text-xs tracking-widest uppercase opacity-50">
                    Experiment_04 // Vector Logic
                </div>
            </nav>

            {/* Pinned SVG Hero Section */}
            <div ref={containerRef} className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-radial-gradient from-neutral-900 to-black">

                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                    <h1 className="hero-title-1 text-5xl md:text-8xl font-bold tracking-tighter text-center bg-clip-text text-transparent bg-gradient-to-b from-white to-white/20">
                        Infinite Resolution.
                    </h1>
                    <h2 className="hero-title-2 absolute text-4xl md:text-6xl font-light tracking-tight text-center text-cyan-400 opacity-0">
                        Mathematically Perfect.
                    </h2>
                </div>

                {/* The Scalable Vector Graphic */}
                <svg
                    ref={svgRef}
                    className="w-full max-w-4xl h-auto absolute z-0 opacity-80"
                    viewBox="0 0 800 600"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Ambient Glow Filter */}
                    <defs>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="8" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Central Hexagon */}
                    <path
                        ref={(el) => { if (el) pathRefs.current[0] = el; }}
                        d="M400 150 L530 225 L530 375 L400 450 L270 375 L270 225 Z"
                        stroke="#06b6d4" // Cyan 500
                        strokeWidth="2"
                        fill="rgba(6, 182, 212, 0.05)"
                        filter="url(#glow)"
                    />

                    {/* Connecting Lines */}
                    <path ref={(el) => { if (el) pathRefs.current[1] = el; }} d="M400 150 L400 50" stroke="#3b82f6" strokeWidth="1.5" />
                    <path ref={(el) => { if (el) pathRefs.current[2] = el; }} d="M530 225 L650 150" stroke="#3b82f6" strokeWidth="1.5" />
                    <path ref={(el) => { if (el) pathRefs.current[3] = el; }} d="M530 375 L650 450" stroke="#3b82f6" strokeWidth="1.5" />
                    <path ref={(el) => { if (el) pathRefs.current[4] = el; }} d="M400 450 L400 550" stroke="#3b82f6" strokeWidth="1.5" />
                    <path ref={(el) => { if (el) pathRefs.current[5] = el; }} d="M270 375 L150 450" stroke="#3b82f6" strokeWidth="1.5" />
                    <path ref={(el) => { if (el) pathRefs.current[6] = el; }} d="M270 225 L150 150" stroke="#3b82f6" strokeWidth="1.5" />

                    {/* Inner Geometry */}
                    <path ref={(el) => { if (el) pathRefs.current[7] = el; }} d="M400 150 L400 450" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="5,5" />
                    <path ref={(el) => { if (el) pathRefs.current[8] = el; }} d="M270 225 L530 375" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="5,5" />
                    <path ref={(el) => { if (el) pathRefs.current[9] = el; }} d="M270 375 L530 225" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="5,5" />

                    {/* Glowing Nodes (Circles at intersections) */}
                    <g className="svg-node opacity-0" style={{ transformOrigin: "400px 150px" }}><circle cx="400" cy="150" r="6" fill="#06b6d4" filter="url(#glow)" /></g>
                    <g className="svg-node opacity-0" style={{ transformOrigin: "530px 225px" }}><circle cx="530" cy="225" r="6" fill="#06b6d4" filter="url(#glow)" /></g>
                    <g className="svg-node opacity-0" style={{ transformOrigin: "530px 375px" }}><circle cx="530" cy="375" r="6" fill="#06b6d4" filter="url(#glow)" /></g>
                    <g className="svg-node opacity-0" style={{ transformOrigin: "400px 450px" }}><circle cx="400" cy="450" r="6" fill="#06b6d4" filter="url(#glow)" /></g>
                    <g className="svg-node opacity-0" style={{ transformOrigin: "270px 375px" }}><circle cx="270" cy="375" r="6" fill="#06b6d4" filter="url(#glow)" /></g>
                    <g className="svg-node opacity-0" style={{ transformOrigin: "270px 225px" }}><circle cx="270" cy="225" r="6" fill="#06b6d4" filter="url(#glow)" /></g>
                    <g className="svg-node opacity-0" style={{ transformOrigin: "400px 300px" }}><circle cx="400" cy="300" r="10" fill="#ffffff" filter="url(#glow)" /></g>
                </svg>
            </div>

            {/* Content Section Following the Massive Zoom */}
            <div className="relative z-20 bg-[#030303] py-32 md:py-48 -mt-[50vh]">
                {/* Top fade out from black */}
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-transparent to-[#030303] -translate-y-full pointer-events-none" />

                <div className="max-w-6xl mx-auto px-6">

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-32">
                        <div>
                            <h3 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
                                Precision at <span className="text-cyan-400">any scale.</span>
                            </h3>
                            <p className="text-lg text-neutral-400 font-light leading-relaxed mb-6">
                                Unlike raster graphics (JPEG, PNG) or heavily compressed MP4 videos, Scalable Vector Graphics (SVG) are mathematically defined.
                            </p>
                            <p className="text-lg text-neutral-400 font-light leading-relaxed">
                                This means you can scale a visual element from 10 pixels to 10,000 pixels during a scroll interaction without losing a single drop of fidelity. Perfect for premium brand aesthetics and technical product showcases.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-20 pt-10 px-8">
                            <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col items-start gap-4 hover:border-cyan-500/30 transition-colors">
                                <Network className="w-8 h-8 text-cyan-400" />
                                <h4 className="text-xl font-semibold">DrawSVG Magic</h4>
                                <p className="text-sm text-neutral-500">Animates the precise `stroke-dashoffset` property along complex bezier curves.</p>
                            </div>
                            <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col items-start gap-4 hover:border-blue-500/30 transition-colors translate-y-0 sm:translate-y-12">
                                <Cpu className="w-8 h-8 text-blue-400" />
                                <h4 className="text-xl font-semibold">Tiny Payload</h4>
                                <p className="text-sm text-neutral-500">Less than 5KB for massive animations compared to 5MB+ for equivalent video files.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
