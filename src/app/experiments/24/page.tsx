"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowLeft, Minus, Plus, Search, Terminal } from "lucide-react";
import Link from "next/link";

const Section = ({ title, content, index }: { title: string; content: string; index: number }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const letterSpacing = useTransform(scrollYProgress, [0, 0.5, 1], ["0.5em", "0em", "0.5em"]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

    const smoothSpacing = useSpring(letterSpacing, { stiffness: 100, damping: 30 });

    return (
        <motion.section
            ref={ref}
            style={{ opacity, scale }}
            className="min-h-screen flex flex-col items-center justify-center p-6 md:p-24 border-b border-white/[0.05]"
        >
            <motion.h2
                style={{ letterSpacing: smoothSpacing }}
                className="text-4xl md:text-7xl font-light tracking-[0.5em] uppercase mb-12 text-center"
            >
                {title}
            </motion.h2>
            <p className="max-w-2xl text-center text-neutral-500 leading-relaxed font-light text-sm md:text-base">
                {content}
            </p>
            <div className="mt-12 w-px h-24 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.section>
    );
};

export default function StarkMinimalismExperiment() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll();

    const backgroundOpacity = useTransform(scrollYProgress, [0, 0.1], [0.05, 0.02]);
    const progressBarWidth = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    return (
        <div ref={containerRef} className="relative bg-[#000] text-white selection:bg-white selection:text-black">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-center bg-[#000]/50 backdrop-blur-md">
                <Link href="/" scroll={false}>
                    <motion.div
                        whileHover={{ x: -4 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>ARCHIVE / 024</span>
                    </motion.div>
                </Link>
                <div className="flex items-center gap-8">
                    <div className="hidden md:flex items-center gap-6 text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500">
                        <span>Grid.System</span>
                        <span>Typo.Graphy</span>
                        <span>Minimal.ism</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black">
                        <Plus className="w-4 h-4" />
                    </div>
                </div>
            </nav>

            {/* Progress Bar */}
            <motion.div
                style={{ scaleX: progressBarWidth, transformOrigin: "left" }}
                className="fixed top-0 left-0 w-full h-1 bg-white z-[60]"
            />

            {/* Hero Section */}
            <header className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
                <motion.div
                    style={{ opacity: backgroundOpacity }}
                    className="absolute inset-0 z-0 flex items-center justify-center"
                >
                    <h1 className="text-[25vw] font-black leading-none tracking-tighter text-white select-none">
                        STARK
                    </h1>
                </motion.div>

                <div className="relative z-10 flex flex-col items-center gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="w-px h-32 bg-white"
                    />
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col items-center gap-4"
                    >
                        <span className="text-[10px] font-bold tracking-[0.8em] uppercase text-neutral-400">Typography Experiment</span>
                        <h1 className="text-6xl md:text-9xl font-black tracking-tighter">MINIMAL</h1>
                    </motion.div>
                </div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30"
                >
                    <span className="text-[10px] uppercase tracking-widest font-bold">Scroll</span>
                    <Minus className="w-4 h-4 rotate-90" />
                </motion.div>
            </header>

            {/* Content Sections */}
            <Section
                title="Reduction"
                content="Minimalism is not a lack of something. It's simply the perfect amount of something. Stripping away the non-essential to reveal the core essence of form and function."
                index={1}
            />
            <Section
                title="Structure"
                content="The Swiss style prioritized cleanliness, readability, and objectivity. A rigid grid system provides the foundation for typographic harmony and spatial balance."
                index={2}
            />
            <Section
                title="Negative"
                content="Whitespace is not empty space; it is a powerful design element that guides the eye and provides breathing room for the essential content to resonate."
                index={3}
            />
            <Section
                title="Balance"
                content="Achieving equilibrium through asymmetrical layouts and deliberate typographic hierarchies. Every element serves a specific purpose in the visual narrative."
                index={4}
            />

            {/* Footer / Outro */}
            <footer className="h-[50vh] flex flex-col items-center justify-center bg-white text-black p-6">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8">LESS BUT BETTER</h2>
                <div className="flex gap-4">
                    <Link href="/" scroll={false}>
                        <button className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors">
                            Return to Catalog
                        </button>
                    </Link>
                </div>
            </footer>

            {/* UI Accents */}
            <div className="fixed top-1/2 left-10 -translate-y-1/2 hidden xl:flex flex-col gap-4 opacity-20 pointer-events-none">
                <Terminal className="w-4 h-4" />
                <div className="w-px h-20 bg-white" />
                <Search className="w-4 h-4" />
            </div>

            <style jsx global>{`
        body {
          background: #000;
        }
      `}</style>
        </div>
    );
}
