"use client";

import { useEffect, useRef, ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, LocateFixed, Activity } from "lucide-react";
import Lenis from "lenis";
import gsap from "gsap";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Custom gsapt-powered Magnetic Component
 * Wraps any React children and provides elastic physical pull towards the mouse pointer.
 */
function MagneticCTA({ children, strength = 0.5 }: { children: ReactNode, strength?: number }) {
    const magneticRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = magneticRef.current;
        if (!element) return;

        // Create highly optimized GSAP QuickTo functions for X and Y coordinate updates
        const xTo = gsap.quickTo(element, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
        const yTo = gsap.quickTo(element, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

        const mouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const { height, width, left, top } = element.getBoundingClientRect();

            // Calculate distance from center of element to mouse
            const hx = (clientX - (left + width / 2)) * strength;
            const hy = (clientY - (top + height / 2)) * strength;

            xTo(hx);
            yTo(hy);
        };

        const mouseLeave = () => {
            // Snap back to 0,0 instantly with elastic bounce
            xTo(0);
            yTo(0);
        };

        element.addEventListener("mousemove", mouseMove);
        element.addEventListener("mouseleave", mouseLeave);

        return () => {
            element.removeEventListener("mousemove", mouseMove);
            element.removeEventListener("mouseleave", mouseLeave);
        };
    }, [strength]);

    return (
        <div ref={magneticRef} className="inline-block">
            {children}
        </div>
    );
}

export default function SmoothMagneticFluid() {
    const containerRef = useRef<HTMLDivElement>(null);

    // 1. Initialize Lenis Smooth Scroll
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.5,      // The butter smooth drag multiplier
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            wheelMultiplier: 1.2,
            touchMultiplier: 2,
            infinite: false,
        });

        // Sync Lenis scroll data to requestAnimationFrame
        let rafId: number;

        function raf(time: number) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy(); // Cleanup to prevent memory leaks in React
        };
    }, []);

    // 2. Framer Motion Parallax for the Hero Video based on global scroll
    const { scrollYProgress } = useScroll();

    // Smoothly scale down and blur the video as the user scrolls away
    const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
    const heroRadius = useTransform(scrollYProgress, [0, 0.3], ["0rem", "3rem"]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

    return (
        // We ensure height is strictly determined by content to allow smooth scrolling
        <div ref={containerRef} className="w-full bg-[#111] text-[#E0E0E0] selection:bg-[#fff] selection:text-[#000]">

            {/* 
              HERO SECTION 
              Features the video with scroll-linked scaling and blurring
            */}
            <div className="relative h-screen w-full flex items-center justify-center p-8 overflow-hidden sticky top-0">
                <motion.div
                    className="absolute inset-0 w-full h-full overflow-hidden origin-center"
                    style={{
                        scale: heroScale,
                        borderRadius: heroRadius,
                        opacity: heroOpacity
                    }}
                >
                    <video
                        src="/video_10.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    {/* Deep shadow vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/30 to-transparent" />
                </motion.div>

                {/* Hero Foreground Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 pointer-events-none">
                    <h1 className="text-5xl md:text-9xl font-sans tracking-[-0.04em] font-medium leading-none text-white mix-blend-difference mb-6">
                        Inertia<br />
                        <span className="text-[#A0A0A0]">& Magnetism.</span>
                    </h1>

                    <div className="flex gap-4 pointer-events-auto">
                        <MagneticCTA strength={0.4}>
                            <button className="flex items-center gap-3 bg-white text-black px-8 py-5 rounded-full font-medium text-sm hover:scale-105 transition-transform duration-500">
                                Discover Studio
                                <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                            </button>
                        </MagneticCTA>

                        <MagneticCTA strength={0.8}>
                            <Link href="/" scroll={false} className="flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white hover:text-black transition-colors duration-500 text-white group">
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1" />
                            </Link>
                        </MagneticCTA>
                    </div>
                </div>
            </div>

            {/* 
              EDITORIAL CONTENT STREAM
              A vast, empty-space driven layout designed to make dragging the scroll wheel feel deeply satisfying. 
            */}
            <div className="relative z-10 w-full bg-[#111] rounded-t-[3rem] -mt-10 overflow-hidden pt-32 pb-64 px-8 md:px-16 flex flex-col gap-40">

                {/* Intro Section */}
                <div className="flex flex-col md:flex-row gap-20 items-start justify-between">
                    <div className="md:w-1/3 flex flex-col gap-8">
                        <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center p-[2px]">
                            <div className="w-full h-full rounded-full bg-white/50 animate-ping" />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-light tracking-tight leading-tight">
                            Hijacking the <br /><span className="italic text-white/50">native scroll.</span>
                        </h2>
                    </div>
                    <div className="md:w-1/2 flex flex-col gap-8 text-lg font-light text-white/60 leading-relaxed">
                        <p>
                            We abandon standard browser mechanics. By mapping wheel delta to a custom requestAnimationFrame loop using the `lenis` library, we generate artificial physical mass.
                        </p>
                        <p>
                            Scroll with intentionality. Notice how the page decelerates gracefully rather than stopping abruptly. This is momentum mathematical modeling applied to UI.
                        </p>
                    </div>
                </div>

                {/* Massive Typography Puller */}
                <div className="w-full border-t border-b border-white/10 py-32 flex justify-center">
                    <MagneticCTA strength={0.15}>
                        <div className="text-[10vw] md:text-[15vw] font-black tracking-tighter uppercase text-white cursor-crosshair leading-none hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-white hover:to-white/20 transition-all duration-700">
                            Frictionless
                        </div>
                    </MagneticCTA>
                </div>

                {/* Technical Demo Grid */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                    <div className="aspect-square bg-white/5 rounded-3xl p-12 flex flex-col justify-between border border-white/10 hover:bg-white/10 transition-colors group">
                        <LocateFixed className="w-8 h-8 text-white/30 group-hover:text-white transition-colors" />
                        <div>
                            <h3 className="text-2xl font-medium mb-3 relative z-10 w-fit">
                                Elastic UI Pull
                                {/* Hover interactive magnetic blob */}
                                <MagneticCTA strength={0.6}>
                                    <div className="absolute inset-0 bg-white/10 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </MagneticCTA>
                            </h3>
                            <p className="text-white/50 font-light">Hovering elements triggers GSAP `quickTo`, computing distance vectors to drag DOM nodes away from their rigid CSS definitions.</p>
                        </div>
                    </div>

                    <div className="aspect-square bg-[#050505] rounded-3xl p-12 flex flex-col justify-between border border-white/5 overflow-hidden relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05)_0%,transparent_60%)]" />
                        <Activity className="w-8 h-8 text-white/30" />
                        <div>
                            <MagneticCTA strength={0.3}>
                                <div className="hidden md:flex items-center justify-center w-32 h-32 rounded-full border border-white/20 bg-black mb-8 cursor-grab mx-auto hover:bg-white hover:text-black transition-colors duration-500">
                                    <ArrowUpRight className="w-6 h-6" />
                                </div>
                            </MagneticCTA>
                            <h3 className="text-2xl font-medium mb-3">Fluid Momentum</h3>
                            <p className="text-white/50 font-light">Combining Lerp (Linear Interpolation) with multi-axis easing functions generates a heavy, premium scrolling sensation.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
