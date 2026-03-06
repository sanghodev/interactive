"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { ArrowLeft, Play, Diamond, MoveUpRight, Hexagon, ChevronDown, ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

declare global {
    interface Window {
        UnicornStudio: any;
    }
}

// Staggered text reveal utility
const SplitText = ({ children, delayOffset = 0 }: { children: string, delayOffset?: number }) => {
    return (
        <span className="inline-block overflow-hidden pb-2">
            {children.split(" ").map((word, wordIndex) => (
                <span key={wordIndex} className="inline-block whitespace-nowrap overflow-hidden mr-[0.25em]">
                    {word.split("").map((char, charIndex) => (
                        <motion.span
                            key={charIndex}
                            className="inline-block"
                            initial={{ y: "120%", rotateX: -90, opacity: 0 }}
                            animate={{ y: "0%", rotateX: 0, opacity: 1 }}
                            transition={{
                                duration: 1.2,
                                ease: [0.16, 1, 0.3, 1],
                                delay: delayOffset + (wordIndex * 0.1) + (charIndex * 0.02)
                            }}
                        >
                            {char}
                        </motion.span>
                    ))}
                </span>
            ))}
        </span>
    );
};

export default function UltimateUXWebGL() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Parallax bindings
    const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
    const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scaleImage = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

    useEffect(() => {
        // Trigger intro animations shortly after mount
        const t = setTimeout(() => setIsLoaded(true), 500);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="bg-[#030303] min-h-screen text-[#EAEAEA] font-sans selection:bg-rose-500/30 overflow-x-hidden">

            <Script
                src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.5/dist/unicornStudio.umd.js"
                strategy="lazyOnload"
                onLoad={() => {
                    if (window.UnicornStudio && window.UnicornStudio.init) {
                        window.UnicornStudio.init();
                    }
                }}
            />

            {/* --- EDITORIAL NAVIGATION --- */}
            <motion.nav
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="fixed top-0 left-0 w-full z-50 px-6 py-6 md:px-16 flex justify-between items-center mix-blend-difference text-white pointer-events-none"
            >
                <div className="flex items-center gap-16 pointer-events-auto">
                    <Link href="/" scroll={false} className="group flex items-center gap-3">
                        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        <span className="text-xs uppercase tracking-[0.2em] font-medium hidden sm:block">Archive</span>
                    </Link>

                    {/* Invisible on mobile, editorial links */}
                    <div className="hidden lg:flex gap-10 text-xs uppercase tracking-[0.2em] font-medium">
                        <span className="cursor-pointer hover:opacity-50 transition-opacity">Collection</span>
                        <span className="cursor-pointer hover:opacity-50 transition-opacity">Manifesto</span>
                        <span className="cursor-pointer hover:opacity-50 transition-opacity">Journal</span>
                    </div>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto">
                    <div className="font-serif text-2xl tracking-widest uppercase italic font-light drop-shadow-2xl">
                        Aether<span className="font-sans not-italic font-bold">.</span>
                    </div>
                </div>

                <div className="flex items-center gap-8 pointer-events-auto">
                    <span className="text-xs uppercase tracking-[0.2em] font-medium hidden md:block cursor-pointer hover:opacity-50 transition-opacity">Boutique</span>
                    <button aria-label="Menu" className="relative w-10 h-10 rounded-full border border-white/20 flex flex-col justify-center items-center gap-1.5 hover:bg-white hover:text-black transition-colors duration-500 group">
                        <div className="w-4 h-[1px] bg-current group-hover:w-5 transition-all" />
                        <div className="w-4 h-[1px] bg-current group-hover:w-3 transition-all" />
                    </button>
                </div>
            </motion.nav>

            {/* --- HIGH-END EDITORIAL HERO --- */}
            <div ref={containerRef} className="relative w-full h-[100dvh] overflow-hidden flex flex-col justify-end pb-12 md:pb-24 px-6 md:px-16 perspective-1000">

                {/* WebGL Canvas Background */}
                <motion.div style={{ scale: scaleImage }} className="absolute inset-0 z-0 opacity-90 overflow-hidden transform-gpu">
                    <div
                        className="w-full h-full pointer-events-none md:pointer-events-auto mix-blend-screen"
                        data-us-project="hxXs29o0GBJEUGS6zfDK"
                    />
                    {/* Luxury Vignette & Deep Shadows */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030303_120%)] pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030303]/90 via-[#030303]/20 to-transparent pointer-events-none" />
                </motion.div>

                {/* Hero Content Overlay */}
                <motion.div
                    style={{ y: heroY, opacity: heroOpacity }}
                    className="relative z-20 flex flex-col md:flex-row justify-between items-end gap-10 md:gap-0 pointer-events-none"
                >
                    {/* Massive Typography - Asymmetrical Left */}
                    <div className="w-full md:w-3/4">
                        <h1 className="text-[12vw] md:text-[8vw] font-serif font-light leading-[0.85] tracking-tighter mix-blend-plus-lighter">
                            {isLoaded && (
                                <>
                                    <div className="italic pr-4"><SplitText delayOffset={0.2}>Ethereal</SplitText></div>
                                    <div className="font-sans font-bold uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#EAEAEA] to-[#555]">
                                        <SplitText delayOffset={0.6}>Symphony</SplitText>
                                    </div>
                                </>
                            )}
                        </h1>
                    </div>

                    {/* Minimalist Info - Asymmetrical Right */}
                    <div className="w-full md:w-1/4 flex flex-col items-start md:items-end text-left md:text-right">
                        <AnimatePresence>
                            {isLoaded && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }}
                                >
                                    <p className="text-sm md:text-base font-light text-neutral-400 mb-6 max-w-[280px] leading-relaxed">
                                        Experience the intersection of haute couture and procedural particle physics. A digital sanctuary forged by mathematics.
                                    </p>

                                    {/* Magnetic Button Simulation (CSS mostly) */}
                                    <div className="group relative inline-flex items-center justify-center pointer-events-auto cursor-pointer">
                                        {/* Expanding glow on hover */}
                                        <div className="absolute inset-0 bg-white/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                        <button className="relative flex items-center gap-4 pl-6 pr-2 py-2 rounded-full border border-white/20 bg-black/40 backdrop-blur-xl overflow-hidden hover:bg-white/10 transition-colors duration-500">
                                            <span className="text-xs uppercase tracking-[0.2em] font-medium pt-0.5">Discover the Collection</span>
                                            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center transform group-hover:scale-90 transition-transform duration-500">
                                                <MoveUpRight className="w-4 h-4" />
                                            </div>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
                >
                    <span className="text-[9px] uppercase tracking-[0.3em] font-medium">Scroll to explore</span>
                    <ChevronDown className="w-4 h-4 animate-bounce" />
                </motion.div>
            </div>

            {/* --- ASYMMETRICAL LUXURY LAYOUT (Dark Mode Editorial) --- */}
            <div className="relative z-20 bg-[#030303] text-[#EAEAEA]">

                <div className="max-w-[1600px] mx-auto px-6 md:px-16 py-32 md:py-48">

                    {/* Staggered Grid Presentation */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-x-12 md:gap-y-32">

                        {/* Text Block (Col 1-5) */}
                        <div className="md:col-span-5 md:col-start-2 pt-12 md:pt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <Diamond className="w-5 h-5 text-neutral-500" />
                                <span className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-500">Volumetric Canvas</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-serif font-light leading-tight mb-8">
                                Transcending the physical boundaries of <span className="italic text-neutral-400">digital space.</span>
                            </h2>
                            <p className="text-lg text-neutral-400 font-light leading-relaxed mb-12">
                                Aether utilizes real-time GPU hardware acceleration to craft environments that breathe. By escaping the DOM, we unlock millions of individual light calculations previously restricted to pre-rendered cinema.
                            </p>
                            {/* Ultra-minimal link */}
                            <div className="inline-flex items-center gap-3 text-sm font-medium uppercase tracking-[0.15em] border-b border-white/20 pb-2 hover:border-white transition-colors cursor-pointer group">
                                Read the Manifesto <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                            </div>
                        </div>

                        {/* Deep Glassmorphism Image Block (Col 8-12) */}
                        <div className="md:col-span-5 md:col-start-8 relative">
                            <div className="aspect-[3/4] rounded-sm bg-neutral-900 border border-white/5 overflow-hidden relative group">

                                {/* Fake Image Background */}
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity group-hover:opacity-60 transition-opacity duration-1000 group-hover:scale-105 transform ease-out" />

                                {/* The "Deep Glass" floating card overlay */}
                                <div className="absolute top-1/2 left-0 -translate-x-8 -translate-y-1/2 w-64 p-6 rounded-xl bg-white/5 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
                                    <Hexagon className="w-8 h-8 text-white/50 mb-6" />
                                    <h4 className="font-bold text-lg mb-2">Computational Beauty</h4>
                                    <p className="text-xs text-neutral-400 leading-relaxed font-light">Shader topologies that warp the fabric of the browser, mapping mathematical noise to human interaction.</p>
                                </div>
                            </div>
                        </div>

                        {/* Full Width Cinematic Quote */}
                        <div className="md:col-span-10 md:col-start-2 py-20 text-center relative border-y border-white/10 mt-16 md:mt-0">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
                            <h3 className="text-3xl md:text-6xl font-serif font-light italic text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 leading-tight">
                                "The screen is no longer a surface.<br />It is an infinite depth."
                            </h3>
                        </div>

                    </div>
                </div>

                {/* Sub-Footer Marquee / Credits */}
                <footer className="border-t border-white/10 py-12 text-center text-xs uppercase tracking-[0.2em] text-neutral-600 font-medium">
                    <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto px-6 gap-6 md:gap-0">
                        <span>© 2026 AETHER EXCLUSIVE STUDIOS</span>
                        <div className="flex items-center gap-6">
                            <span className="cursor-pointer hover:text-white transition-colors">Instagram</span>
                            <span className="cursor-pointer hover:text-white transition-colors">Twitter</span>
                            <span className="cursor-pointer hover:text-white transition-colors">Legal</span>
                        </div>
                        <span>Designed by Gravity</span>
                    </div>
                </footer>
            </div>

        </div>
    );
}
