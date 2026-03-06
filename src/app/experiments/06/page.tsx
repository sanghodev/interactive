"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { ArrowLeft, Aperture, Ghost, Eclipse, Wind } from "lucide-react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

// Helper array for colorful independent characters
const colors = [
    "from-fuchsia-400 to-purple-600",
    "from-cyan-400 to-blue-600",
    "from-yellow-400 to-orange-600",
    "from-emerald-400 to-teal-600",
    "from-pink-400 to-rose-600",
    "from-indigo-400 to-purple-600",
    "from-white to-neutral-400"
];

declare global {
    interface Window {
        UnicornStudio: any;
    }
}

export default function HypnoticWebGL() {
    const [isHovered, setIsHovered] = useState(false);

    // Custom Cursor Position Tracking
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    // Normalized coordinates for subtle parallax shifts (-1 to 1)
    const mouseNormX = useMotionValue(0);
    const mouseNormY = useMotionValue(0);

    // Smooth springs for the outer ring trailing the dot
    const springX = useSpring(mouseX, { stiffness: 100, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 100, damping: 20 });
    const slowSpringX = useSpring(mouseX, { stiffness: 40, damping: 30 });
    const slowSpringY = useSpring(mouseY, { stiffness: 40, damping: 30 });

    // Parallax springs for typography mapping -1..1 to pixels (-30px to 30px)
    const parallaxX = useSpring(useTransform(mouseNormX, [-1, 1], [-40, 40]), { stiffness: 50, damping: 20 });
    const parallaxY = useSpring(useTransform(mouseNormY, [-1, 1], [-40, 40]), { stiffness: 50, damping: 20 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Offset by half the cursor size to center
            mouseX.set(e.clientX - 16);
            mouseY.set(e.clientY - 16);

            // Normalize (-1 to 1)
            mouseNormX.set((e.clientX / window.innerWidth) * 2 - 1);
            mouseNormY.set((e.clientY / window.innerHeight) * 2 - 1);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY, mouseNormX, mouseNormY]);

    return (
        // 'cursor-none' hides the default browser pointer everywhere
        <div className="bg-[#020005] min-h-screen text-white font-sans selection:bg-fuchsia-500/30 cursor-none relative overflow-x-hidden">

            {/* --- CUSTOM CURSOR LAYER --- */}
            {/* 1. Inner fast dot */}
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 rounded-full bg-white mix-blend-difference pointer-events-none z-[100] flex items-center justify-center transition-transform duration-300"
                style={{ x: mouseX, y: mouseY, scale: isHovered ? 2 : 0.5 }}
            />
            {/* 2. Outer glowing trail ring */}
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 rounded-full border border-fuchsia-500/50 pointer-events-none z-[99]"
                style={{ x: springX, y: springY, scale: isHovered ? 3 : 1.5 }}
            />
            {/* 3. Slow aura smear */}
            <motion.div
                className="fixed top-0 left-0 w-32 h-32 -ml-12 -mt-12 rounded-full bg-fuchsia-600/10 blur-xl pointer-events-none z-[98]"
                style={{ x: slowSpringX, y: slowSpringY }}
            />

            {/* --- SCRIPT INJECTION --- */}
            <Script
                src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.5/dist/unicornStudio.umd.js"
                strategy="lazyOnload"
                onLoad={() => {
                    if (window.UnicornStudio && window.UnicornStudio.init) {
                        window.UnicornStudio.init();
                    }
                }}
            />

            {/* --- HOLOGRAPHIC NAVIGATION (Dummy) --- */}
            <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-center pointer-events-none text-white mix-blend-difference">
                {/* Back Link */}
                <Link
                    href="/"
                    className="pointer-events-auto"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="flex items-center gap-3">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium tracking-wide">Index</span>
                    </div>
                </Link>

                {/* Dummy Logo Center */}
                <div className="absolute left-1/2 -translate-x-1/2 font-black text-2xl tracking-tighter uppercase flex items-center gap-2">
                    <Eclipse className="w-8 h-8" />
                    LUCID.
                </div>

                {/* Dummy Top-Right Menu */}
                <div className="hidden md:flex gap-8 text-sm font-semibold tracking-widest uppercase pointer-events-auto">
                    <span onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className="hover:text-fuchsia-400">Visions</span>
                    <span onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className="hover:text-fuchsia-400">Artists</span>
                    <span onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className="hover:text-fuchsia-400">Contact</span>
                </div>
            </nav>

            {/* --- HYPNOTIC HERO CANVAS --- */}
            <div className="relative w-full h-screen overflow-hidden flex items-center justify-center">

                {/* The Unicorn Studio WebGL embed */}
                <div
                    className="absolute inset-0 z-0 opacity-80 mix-blend-screen pointer-events-none md:pointer-events-auto"
                    data-us-project="nbP7kwrxuNVWtDU5iJod"
                    style={{ width: "100%", height: "100%" }}
                />

                {/* Color Overlay Gradients for the "Hallucinatory" feel */}
                <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(60,10,100,0.5)_100%)] pointer-events-none" />
                <div className="absolute inset-0 z-10 bg-[linear-gradient(to_bottom,transparent_50%,#020005_100%)] pointer-events-none" />

                {/* Staggered Independent Character Typography */}
                <div className="relative z-20 text-center pointer-events-none mix-blend-plus-lighter max-w-5xl mx-auto flex flex-col items-center justify-center h-full gap-4">

                    {/* First Line: Surrender */}
                    <div className="flex justify-center flex-wrap">
                        {"Surrender".split("").map((char, index) => {
                            // Assign pseudorandom depth multiplier between 0.5 and 2.5
                            const depth = 0.5 + (index % 3) * 0.7;
                            const colorClass = colors[index % colors.length];

                            // Independent transform for each character
                            const x = useSpring(useTransform(mouseNormX, [-1, 1], [-50 * depth, 50 * depth]), { stiffness: 40, damping: 20 });
                            const y = useSpring(useTransform(mouseNormY, [-1, 1], [-50 * depth, 50 * depth]), { stiffness: 40, damping: 20 });

                            return (
                                <motion.span
                                    key={`s1-${index}`}
                                    style={{ x, y }}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 1, delay: index * 0.1, type: "spring" }}
                                    className={`inline-block text-6xl md:text-[9vw] font-bold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br ${colorClass}`}
                                >
                                    {char}
                                </motion.span>
                            );
                        })}
                    </div>

                    {/* Second Line: to the Void. */}
                    <div className="flex justify-center flex-wrap gap-x-4 md:gap-x-8">
                        {"to the Void.".split(" ").map((word, wIdx) => (
                            <div key={`w-${wIdx}`} className="flex">
                                {word.split("").map((char, index) => {
                                    // Assign different deterministic depth based on string length to spread them out
                                    const depth = 0.8 + ((index + wIdx) % 3) * 0.9;
                                    // Use different offset in colors array
                                    const colorClass = colors[(index + wIdx + 3) % colors.length];

                                    const x = useSpring(useTransform(mouseNormX, [-1, 1], [-40 * depth, 40 * depth]), { stiffness: 50, damping: 15 });
                                    const y = useSpring(useTransform(mouseNormY, [-1, 1], [-40 * depth, 40 * depth]), { stiffness: 50, damping: 15 });

                                    return (
                                        <motion.span
                                            key={`s2-${wIdx}-${index}`}
                                            style={{ x, y }}
                                            initial={{ opacity: 0, filter: "blur(10px)" }}
                                            animate={{ opacity: 1, filter: "blur(0px)" }}
                                            transition={{ duration: 1.5, delay: 0.5 + (index * 0.05), ease: "easeOut" }}
                                            className={`inline-block text-5xl md:text-[8vw] font-bold tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-tr ${colorClass}`}
                                        >
                                            {char}
                                        </motion.span>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 1.5 }}
                        className="text-xl md:text-3xl font-light text-fuchsia-300/60 max-w-2xl mx-auto italic mt-8"
                    >
                        Where colors bleed into consciousness.
                    </motion.p>
                </div>
            </div>

            {/* --- DUMMY LAYOUT (Hallucinatory Content) --- */}
            <div className="relative z-20 bg-[#020005] py-32 border-t border-fuchsia-900/30">
                <div className="max-w-7xl mx-auto px-6">

                    {/* Large Staggered Abstract Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-24 gap-x-12 mb-48">

                        <div
                            className="flex flex-col items-center text-center group pointer-events-auto"
                            onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
                        >
                            <Aperture className="w-16 h-16 text-fuchsia-500 mb-8 group-hover:rotate-90 transition-transform duration-1000" />
                            <h2 className="text-5xl font-black mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-fuchsia-400 group-hover:to-cyan-400 transition-all">Infinite</h2>
                            <p className="text-neutral-400 leading-relaxed font-light">Endless procedural generation mapping human cursor inputs directly to WebGL tensor fields, creating a unique state for every single user session.</p>
                        </div>

                        <div
                            className="flex flex-col items-center text-center group pointer-events-auto mt-0 md:mt-24"
                            onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
                        >
                            <Ghost className="w-16 h-16 text-cyan-500 mb-8 group-hover:-translate-y-4 group-hover:opacity-50 transition-all duration-700" />
                            <h2 className="text-5xl font-black mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-yellow-400 transition-all">Ethereal</h2>
                            <p className="text-neutral-400 leading-relaxed font-light">Custom mouse logic removes the standard mechanical pointer, replacing it with a fluid spring-physics entity that responds naturally.</p>
                        </div>

                        <div
                            className="flex flex-col items-center text-center group pointer-events-auto mt-0 md:-mt-12"
                            onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
                        >
                            <Wind className="w-16 h-16 text-yellow-500 mb-8" />
                            <h2 className="text-5xl font-black mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-fuchsia-400 transition-all">Visceral</h2>
                            <p className="text-neutral-400 leading-relaxed font-light">Blend modes such as screen, difference, and color-dodge merge the HTML DOM layers physically into the raw GPU pixel buffer seamlessly.</p>
                        </div>

                    </div>

                    {/* Mega Footer CTA */}
                    <div
                        className="relative rounded-[4rem] overflow-hidden p-20 text-center border border-white/5 pointer-events-auto"
                        onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900/20 to-cyan-900/20 z-0" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-500/20 blur-[150px] rounded-full z-0 pointer-events-none" />

                        <h3 className="relative z-10 text-4xl md:text-7xl font-bold tracking-tight mb-8 mix-blend-overlay">Awaken.</h3>
                        <button className="relative z-10 px-12 py-5 bg-white/10 hover:bg-white border border-white/20 hover:text-black rounded-full font-bold text-lg uppercase tracking-widest transition-all duration-500 backdrop-blur-md">
                            Enter the Archive
                        </button>
                    </div>

                </div>
            </div>

        </div>
    );
}
