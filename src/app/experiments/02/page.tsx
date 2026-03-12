"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { ArrowLeft, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function ScrollVideoExperiment() {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useGSAP(() => {
        const video = videoRef.current;
        if (!video) return;

        // Ensure video metadata is loaded before creating ScrollTrigger
        const initScrollTrigger = () => {
            // Calculate how much we want to scroll based on video length
            // 1 second of video = 400px of scrolling roughly
            const scrollDuration = (video.duration || 10) * 400;

            // Normalize scroll for mobile touch devices
            ScrollTrigger.normalizeScroll(true);

            ScrollTrigger.create({
                trigger: containerRef.current,
                start: "top top",
                end: `+=${scrollDuration}`,
                pin: true,
                scrub: 0.5,
                anticipatePin: 1,
                onUpdate: (self) => {
                    if (video.duration) {
                        try {
                            // Using a more persistent seeking method for mobile
                            video.currentTime = video.duration * self.progress;
                        } catch (e) {
                            console.error("Video seeking error", e)
                        }
                    }
                },
            });

            // Text Animations inside the pinned container
            gsap.fromTo(
                ".hero-text",
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top top",
                        end: "+=300",
                        scrub: true
                    }
                }
            );

            gsap.to(".hero-text", {
                y: -100,
                opacity: 0,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top -10%",
                    end: "+=500",
                    scrub: true
                }
            })
        };

        if (video.readyState >= 1) {
            initScrollTrigger();
        } else {
            video.addEventListener("loadedmetadata", initScrollTrigger);
            return () => video.removeEventListener("loadedmetadata", initScrollTrigger);
        }
    }, { scope: containerRef });

    return (
        <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-indigo-500/30">

            {/* Navigation - Fixed over everything */}
            <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-center pointer-events-none">
                <Link href="/" scroll={false} className="pointer-events-auto">
                    <motion.div
                        whileHover={{ x: -4 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Archive</span>
                    </motion.div>
                </Link>
                <div className="text-xs tracking-widest uppercase font-semibold text-white/50 backdrop-blur-sm px-3 py-1 bg-black/20 rounded-full">
                    Experiment 02: Scroll Scrubbing
                </div>
            </nav>

            {/* Hero Pinned Section */}
            <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-black">
                {/* The target video */}
                <video
                    ref={videoRef}
                    src="/video_2.mp4"
                    className="absolute top-0 left-0 w-full h-full object-cover opacity-80"
                    muted
                    playsInline
                    preload="auto"
                />

                {/* Gradients for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />

                {/* Interactive Text Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 hero-text pointer-events-none">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/50">
                        Control the Flow.
                    </h1>
                    <p className="text-lg md:text-2xl text-white/60 font-light max-w-2xl bg-black/20 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/5">
                        Scroll down to scrub backwards and forwards through time. Seamlessly blending video production with web interaction.
                    </p>

                    <div className="absolute bottom-12 animate-bounce flex flex-col items-center gap-2 opacity-50">
                        <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
                        <ArrowDown className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Dummy Content Below Video (Simulates Landing Page) */}
            <div className="relative z-20 bg-[#050505]">
                <div className="max-w-7xl mx-auto px-6 py-32 md:py-48 grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-32 items-center">

                    <div className="space-y-8">
                        <div className="inline-block px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
                            Performance Optimized
                        </div>
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                            Hardware Accelerated <br /> Narrative.
                        </h2>
                        <p className="text-lg text-neutral-400 leading-relaxed font-light">
                            By relying on browser native HTML5 video and tying its currentTime property to requestAnimationFrame hooks exposed by GSAP, we achieve 60fps buttery smooth visual fidelity without the massive overhead of parsing sequence images (JPEG/WebP logic).
                        </p>
                    </div>

                    {/* Abstract art cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                        <div className="absolute -inset-4 bg-indigo-500/20 blur-[100px] rounded-full z-0" />

                        <div className="relative z-10 glass-panel p-8 rounded-3xl aspect-square flex flex-col justify-end translate-y-0 sm:-translate-y-8 hover:border-indigo-500/50 transition-colors">
                            <h3 className="text-xl font-bold mb-2">Lower Weight</h3>
                            <p className="text-sm text-neutral-400">Smaller payload compared to WebGL heavy assets.</p>
                        </div>

                        <div className="relative z-10 glass-panel p-8 rounded-3xl aspect-square flex flex-col justify-end translate-y-0 sm:translate-y-8 hover:border-violet-500/50 transition-colors">
                            <h3 className="text-xl font-bold mb-2">Native Support</h3>
                            <p className="text-sm text-neutral-400">Leveraging built-in decoding APIs.</p>
                        </div>
                    </div>
                </div>

                {/* Big Tygraphy Section */}
                <div className="py-24 border-t border-white/5 overflow-hidden">
                    <div className="flex whitespace-nowrap opacity-10 font-bold text-[10vw] uppercase leading-none tracking-tighter">
                        <span className="animate-[pulse_4s_ease-in-out_infinite]">INTERACTIVE ENVIRONMENT </span>
                        <span>— INTERACTIVE ENVIRONMENT</span>
                    </div>
                </div>
            </div>

        </div>
    );
}
