"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Plus, Minus, Wind } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

export default function LightVideoLanding() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Clean scroll bindings for the hero title fading up
    const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
    const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

    useEffect(() => {
        // Slight delay to ensure video and fonts are ready
        const t = setTimeout(() => setIsLoaded(true), 300);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="bg-white min-h-screen text-neutral-900 font-sans selection:bg-neutral-200 overflow-x-hidden">

            {/* --- EDITORIAL NAVIGATION (LIGHT THEME) --- */}
            <motion.nav
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.1, ease: "easeOut" }}
                className="fixed top-0 left-0 w-full z-50 px-6 py-8 md:px-16 flex justify-between items-center bg-white/40 backdrop-blur-xl border-b border-neutral-200/50 transition-all duration-500"
            >
                <div className="w-1/3 flex items-center justify-start">
                    <Link href="/" scroll={false} className="group flex items-center gap-3 text-neutral-800 hover:text-black transition-colors">
                        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        <span className="text-xs uppercase tracking-[0.2em] font-semibold hidden sm:block">Archive</span>
                    </Link>
                </div>

                {/* Centered Serif Logo */}
                <div className="w-1/3 flex justify-center">
                    <div className="font-serif text-3xl md:text-4xl tracking-tight text-black flex items-center gap-2">
                        <Wind className="w-6 h-6 stroke-[1.5]" />
                        Zephyr
                    </div>
                </div>

                {/* Right Side Cart/Menu */}
                <div className="w-1/3 flex items-center justify-end gap-10">
                    <span className="text-xs uppercase tracking-[0.2em] font-semibold hidden lg:block cursor-pointer hover:opacity-50 transition-opacity">Journal</span>
                    <span className="text-xs uppercase tracking-[0.2em] font-semibold hidden md:block cursor-pointer hover:opacity-50 transition-opacity">Cart (0)</span>
                    <button aria-label="Menu" className="text-xs uppercase tracking-[0.2em] font-semibold hover:opacity-50 transition-opacity">
                        Menu
                    </button>
                </div>
            </motion.nav>

            {/* --- PURE WHITE HERO SECTION WITH VIDEO --- */}
            <div ref={containerRef} className="relative w-full h-[100dvh] overflow-hidden flex flex-col justify-end pb-16 md:pb-24 px-6 md:px-16">

                {/* Background Video */}
                <motion.div
                    initial={{ scale: 1.05, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="absolute inset-0 z-0 bg-neutral-100"
                >
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover object-center opacity-80 mix-blend-multiply"
                    >
                        <source src="/video_4.mp4" type="video/mp4" />
                    </video>

                    {/* White Vignette to blend the edges into the next section */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,white_120%)] pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent pointer-events-none" />
                </motion.div>

                {/* Hero Overlay Details */}
                <motion.div
                    style={{ y: heroY, opacity: heroOpacity }}
                    className="relative z-20 flex flex-col items-center text-center pointer-events-none"
                >
                    {/* Tiny Kicker */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neutral-300 bg-white/60 backdrop-blur-md text-neutral-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-10 pointer-events-auto shadow-sm"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse border border-neutral-400" />
                        The Spring Collection
                    </motion.div>

                    {/* Massive Light Serif Headline */}
                    <div className="overflow-hidden mb-8">
                        <motion.h1
                            initial={{ y: "100%" }}
                            animate={isLoaded ? { y: "0%" } : {}}
                            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="text-6xl sm:text-7xl md:text-[9vw] font-serif tracking-tighter leading-none text-black"
                        >
                            Breathe <span className="italic font-light text-neutral-500">Light.</span>
                        </motion.h1>
                    </div>

                    {/* Minimal Description */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={isLoaded ? { opacity: 1 } : {}}
                        transition={{ duration: 1.5, delay: 1 }}
                        className="text-lg md:text-2xl text-neutral-600 font-light leading-relaxed max-w-2xl mx-auto"
                    >
                        Embrace the purity of form. A visual exploration of unburdened space and natural elements curated for absolute clarity.
                    </motion.p>

                </motion.div>
            </div>

            {/* --- CLEAN WHITE CONTENT LAYOUT --- */}
            <div className="relative z-20 bg-white">

                <div className="max-w-[1600px] mx-auto px-6 md:px-16 py-32 md:py-48">

                    {/* Elegant Feature Split */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-center border-b border-neutral-200 pb-32 mb-32">

                        {/* Text Left */}
                        <div className="md:col-span-5 md:pr-12">
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 mb-6 block">01 / Philosophy</span>
                            <h2 className="text-4xl md:text-5xl font-serif leading-tight mb-8">
                                The elegance of <br />omission.
                            </h2>
                            <p className="text-neutral-500 font-light leading-relaxed mb-10 text-lg">
                                By removing the unnecessary, we elevate the essential. Zephyr is an homage to empty space—where the absence of noise creates the loudest impact. Designed for those who seek tranquility in everyday interaction.
                            </p>

                            {/* Clean Button */}
                            <button className="flex items-center gap-4 px-8 py-4 border border-black rounded-full hover:bg-black hover:text-white transition-all duration-300 font-semibold text-sm uppercase tracking-widest group">
                                Explore Our Roots <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                            </button>
                        </div>

                        {/* Minimal Image Cards Right */}
                        <div className="md:col-span-7 grid grid-cols-2 gap-8">
                            <div className="aspect-[3/4] rounded-2xl bg-neutral-100 overflow-hidden relative group">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490260400179-d656f04de422?w=1000&auto=format&fit=crop')] bg-cover bg-center grayscale opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-out" />
                            </div>
                            <div className="aspect-[3/4] rounded-2xl bg-neutral-100 overflow-hidden relative group translate-y-16">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1510925758641-869d353cecc7?w=1000&auto=format&fit=crop')] bg-cover bg-center grayscale opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-out" />
                            </div>
                        </div>

                    </div>

                    {/* Minimalist Accordion / Details */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-16">

                        {/* Left Static Heading */}
                        <div className="md:col-span-4">
                            <h3 className="text-3xl font-serif text-black leading-tight sticky top-40">
                                Curated experiences, <br />distilled perfectly.
                            </h3>
                        </div>

                        {/* Right Accordion List */}
                        <div className="md:col-span-8 border-t border-neutral-200">
                            {[
                                { title: "Sartorial Collections", desc: "A seasonal offering focused on organic cottons, washed linens, and timeless draping." },
                                { title: "Architectural Objects", desc: "Select pieces crafted from unglazed ceramic and raw timber to ground your living spaces." },
                                { title: "Olfactory Signatures", desc: "Botanical extractions designed to linger softly, turning any room into a sanctuary." }
                            ].map((item, i) => (
                                <div key={i} className="group border-b border-neutral-200 py-10 cursor-pointer">
                                    <div className="flex justify-between items-center mb-0 group-hover:mb-6 transition-all duration-300">
                                        <h4 className="text-2xl font-serif group-hover:pl-4 transition-all duration-300">{item.title}</h4>
                                        <div className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center group-hover:bg-neutral-100 transition-colors">
                                            <Plus className="w-5 h-5 text-neutral-400 group-hover:text-black transition-colors" />
                                        </div>
                                    </div>
                                    <p className="text-neutral-500 font-light leading-relaxed pl-4 max-h-0 overflow-hidden group-hover:max-h-40 transition-all duration-500 opacity-0 group-hover:opacity-100">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Light Theme Footer */}
                <footer className="bg-neutral-50 py-24 md:py-32 border-t border-neutral-200 text-center">
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="flex justify-center mb-12">
                            <Wind className="w-10 h-10 stroke-[1]" />
                        </div>
                        <h2 className="text-4xl md:text-6xl font-serif tracking-tighter mb-8 text-black">
                            Join the movement.
                        </h2>
                        <p className="text-neutral-500 font-light mb-12 max-w-xl mx-auto">
                            Subscribe to our intimate journal for thoughts on design, light, and living well. Occasional dispatches, never noise.
                        </p>

                        <form className="max-w-md mx-auto flex gap-4 border-b border-black pb-2">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                className="w-full bg-transparent outline-none text-black placeholder:text-neutral-400 font-light"
                            />
                            <button type="button" className="text-xs font-bold uppercase tracking-widest text-black hover:opacity-50 transition-opacity">
                                Submit
                            </button>
                        </form>

                        <div className="mt-32 pt-8 flex flex-col md:flex-row justify-between items-center text-xs font-semibold text-neutral-400 uppercase tracking-widest gap-6">
                            <span>© 2026 Zephyr Studios</span>
                            <div className="flex gap-8">
                                <span className="hover:text-black cursor-pointer transition-colors">Terms</span>
                                <span className="hover:text-black cursor-pointer transition-colors">Privacy</span>
                                <span className="hover:text-black cursor-pointer transition-colors">Instagram</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

        </div>
    );
}
