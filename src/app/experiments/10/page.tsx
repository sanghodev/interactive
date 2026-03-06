"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MoveDown, Grid3X3, Zap, Cpu, ScanLine } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function KineticVideoMask() {
    const containerRef = useRef<HTMLDivElement>(null);

    // We map the initial 300vh scroll sequence to scale the text mask aggressively.
    // The user scrolls down, the mask scales up until a white portion covers the center screen.
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Scale the mask exponentially so it blows up massive
    const maskScale = useTransform(scrollYProgress, [0, 0.6], [1, 150]);

    // Fade out brutalist header instructions as the user scrolls
    const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

    // Translate the mask slightly so the vertical stroke of a letter is centered
    const maskX = useTransform(scrollYProgress, [0, 0.6], ["0%", "5%"]);

    return (
        <div className="bg-black min-h-screen text-white font-sans selection:bg-[#FF3366] overflow-x-hidden">

            {/* --- STICKY INTRO HERO (MASKING KINETIC SEQUENCE) --- */}
            <div className="relative w-full h-[300dvh]" ref={containerRef}>
                <div className="sticky top-0 w-full h-screen overflow-hidden bg-black flex flex-col items-center justify-center">

                    {/* Brutalist Abstract Header */}
                    <motion.header
                        style={{ opacity: headerOpacity }}
                        className="absolute top-0 left-0 w-full p-6 md:p-12 z-50 flex justify-between items-start mix-blend-difference pointer-events-none"
                    >
                        <div className="flex flex-col gap-4 pointer-events-auto">
                            <Link href="/" scroll={false} className="inline-flex items-center gap-3 text-white hover:text-[#FF3366] transition-colors font-mono uppercase tracking-widest text-sm font-bold">
                                <ArrowLeft className="w-5 h-5" /> Back to Base
                            </Link>
                            <div className="font-mono text-[10px] text-neutral-400 max-w-[200px] leading-tight mt-4">
                                SYS.SEQ: 10.0.1<br />
                                STATUS: KINETIC_PENDING<br />
                                ACTION: SCROLL_TO_INITIALIZE
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 text-right">
                            <div className="w-16 h-16 bg-white flex items-center justify-center rounded-none mb-4 mix-blend-exclusion">
                                <span className="text-black font-black text-2xl tracking-tighter">10</span>
                            </div>
                            <span className="font-mono text-sm font-bold uppercase tracking-widest text-[#FF3366] flex items-center gap-2">
                                <ScanLine className="w-4 h-4" /> Kinetic Mode
                            </span>
                        </div>
                    </motion.header>

                    {/* Scroll Indicator */}
                    <motion.div
                        style={{ opacity: headerOpacity }}
                        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4 mix-blend-difference pointer-events-none"
                    >
                        <span className="font-mono text-[10px] uppercase tracking-[0.4em] font-bold text-neutral-300">Initiate Sequence</span>
                        <div className="w-px h-16 bg-gradient-to-b from-white to-transparent" />
                    </motion.div>

                    {/* THE VIDEO BACKGROUND */}
                    <video
                        src="/video_5.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover z-0 filter contrast-[1.2] saturate-[1.5]"
                    >
                    </video>

                    {/* 
               THE MAGIC MASK LAYER 
               Using mix-blend-multiply on a black bg with white text:
               - The black background renders as solid black (hiding the video).
               - The white text renders as transparent (multiplying white 1.0 * video RGB = video RGB), revealing the video ONLY inside the text.
            */}
                    <motion.div
                        style={{ scale: maskScale, x: maskX }}
                        className="absolute inset-0 z-10 bg-black text-white mix-blend-multiply flex items-center justify-center transform-gpu origin-center pointer-events-none"
                    >
                        <h1 className="text-[25vw] sm:text-[28vw] md:text-[32vw] font-black uppercase tracking-[-0.08em] leading-none m-0 p-0 text-center select-none will-change-transform">
                            Visi<span className="text-white">o</span>n
                        </h1>
                    </motion.div>

                </div>
            </div>

            {/* --- BRUTALIST UI CONTENT SECTION --- */}
            {/* This comes into view naturally after scrolling past the 300vh sticky container */}
            <div className="relative z-20 bg-black text-[#EFEFEF] border-t-8 border-[#FF3366]">

                <div className="max-w-[1800px] mx-auto">

                    {/* Massive Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-neutral-800">

                        {/* Massive Text Callout */}
                        <div className="lg:col-span-8 p-10 md:p-20 border-b lg:border-b-0 lg:border-r border-neutral-800 flex flex-col justify-center">
                            <div className="inline-block px-4 py-2 border border-[#FF3366] text-[#FF3366] font-mono text-sm font-bold uppercase tracking-widest mb-12 self-start uppercase">
                                01 // Expansion Logic
                            </div>
                            <h2 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-white">
                                Scale beyond <br />
                                <span className="text-transparent" style={{ WebkitTextStroke: "2px white" }}>the canvas</span>.
                            </h2>
                        </div>

                        {/* Tech Spec Box */}
                        <div className="lg:col-span-4 bg-[#0a0a0a] p-10 md:p-20 flex flex-col justify-between">
                            <Grid3X3 className="w-12 h-12 text-[#FF3366] mb-12" />
                            <div>
                                <h3 className="text-2xl font-bold uppercase tracking-tight mb-4 text-white">Multiply Blending</h3>
                                <p className="font-mono text-sm text-neutral-400 leading-relaxed mb-8">
                                    By applying `mix-blend-multiply` to a black DOM container carrying white typography, the browser math effortlessly burns the white pixels out completely, tunneling your vision directly into the underlying HTML5 &lt;video&gt; layer.
                                </p>

                                <div className="w-full h-px bg-neutral-800 mb-8" />

                                <ul className="flex flex-col gap-4 font-mono text-xs text-neutral-500 uppercase">
                                    <li className="flex justify-between"><span>Render Engine</span> <span className="text-white font-bold">Framer Motion</span></li>
                                    <li className="flex justify-between"><span>Frame Target</span> <span className="text-white font-bold">60 FPS</span></li>
                                    <li className="flex justify-between"><span>Blend Mode</span> <span className="text-white font-bold">Multiply</span></li>
                                </ul>
                            </div>
                        </div>

                    </div>

                    {/* Modular Features */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-b border-neutral-800">
                        {[
                            { icon: <Zap className="w-8 h-8" />, title: "Hardware Accel", desc: "Forcing GPU layers via transform-gpu scales vectors up to 15,000% without tearing." },
                            { icon: <Cpu className="w-8 h-8" />, title: "React Scroll", desc: "Virtual scroll tracking feeds continuous numeric boundaries into spring animations." },
                            { icon: <ScanLine className="w-8 h-8" />, title: "Raw Brutalism", desc: "No rounded corners, no gradients. Pure HTML structural lines and mono fonts." }
                        ].map((mod, idx) => (
                            <div key={idx} className="p-12 border-b md:border-b-0 md:border-r border-neutral-800 last:border-r-0 hover:bg-[#FF3366] hover:text-black transition-colors duration-300 group cursor-crosshair">
                                <div className="text-neutral-600 group-hover:text-black transition-colors mb-10">
                                    {mod.icon}
                                </div>
                                <h4 className="text-3xl font-black uppercase tracking-tight mb-4">{mod.title}</h4>
                                <p className="font-mono text-sm leading-relaxed opacity-70">
                                    {mod.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Brutalist Footer */}
                    <div className="p-10 md:p-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-16 md:gap-0">
                        <div>
                            <h2 className="text-[10vw] font-black leading-none tracking-tighter text-transparent" style={{ WebkitTextStroke: "2px #EFEFEF" }}>
                                END_SEQ
                            </h2>
                        </div>
                        <div className="flex flex-col items-end text-right gap-6">
                            <div className="w-24 h-4 bg-[#FF3366]" />
                            <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-bold max-w-xs">
                                WARNING: Excessive kinetic scaling may result in unexpected visual supremacy.
                            </p>
                            <p className="font-mono text-[10px] text-neutral-700 mt-4">
                                © 2026 / KINETIC EXPERIMENT / GRAVITY
                            </p>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}
