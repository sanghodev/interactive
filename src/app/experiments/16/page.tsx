"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Wind, MoveRight, Maximize } from "lucide-react";
import Lenis from "lenis";
import { motion, useScroll, useVelocity, useSpring, useTransform } from "framer-motion";

export default function VelocityHorizontalTrack() {
    const horizontalContainerRef = useRef<HTMLDivElement>(null);

    // 1. Initialize Lenis Smooth Scroll Backbone
    useEffect(() => {
        // slightly looser easing for a "heavier" vehicle feel, enhancing the velocity effect
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            wheelMultiplier: 1.0,
            touchMultiplier: 2,
            infinite: false,
        });

        let rafId: number;
        function raf(time: number) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, []);

    // 2. The G-Force Velocity Physics Engine
    // We capture raw global scroll progress...
    const { scrollY } = useScroll();

    // ...calculate how fast the user is scrolling right now (pixels per frame basically)...
    const scrollVelocity = useVelocity(scrollY);

    // ...and smooth out those raw velocity spikes using a spring physics model so it snaps back like elastic.
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400
    });

    // Determine the Skew boundaries.
    // If scrolling down fast (+3000 vel), skew negative (-15deg).
    // If scrolling up fast (-3000 vel), skew positive (+15deg).
    const velocitySkew = useTransform(smoothVelocity, [-3000, 0, 3000], [15, 0, -15]);
    // As velocity increases in either direction, scale the item up slightly to emphasize the G-force stretch.
    const velocityScale = useTransform(smoothVelocity, [-3000, 0, 3000], [1.1, 1, 1.1]);

    // 3. Horizontal Scroll Hijack Math
    // We target a massive 400vh wrapper container...
    const { scrollYProgress: horizontalProgress } = useScroll({
        target: horizontalContainerRef,
        offset: ["start start", "end end"]
    });
    // ...and map its 0 to 1 progress to a horizontal sliding translation (-75% means moving 3 out of 4 panels left)
    const xSlider = useTransform(horizontalProgress, [0, 1], ["0%", "-75%"]);


    return (
        <div className="bg-[#0a0a0a] text-white min-h-screen overflow-x-hidden selection:bg-rose-500/30 font-sans">

            {/* Header Navigation */}
            <div className="fixed top-0 w-full z-50 p-6 md:p-10 flex justify-between items-start pointer-events-none mix-blend-difference">
                <Link href="/" scroll={false} className="pointer-events-auto flex items-center gap-3 bg-white/10 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/20 px-5 py-3 rounded-full transition-all duration-300">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-xs font-mono tracking-widest uppercase">
                        ABORT
                    </span>
                </Link>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-[10px] font-mono tracking-widest text-white/50">
                        <Wind className="w-3 h-3 text-rose-500" /> VELOCITY TRACKING ENABLED
                    </div>
                </div>
            </div>

            {/* 
              SECTION 1: VELOCITY DISTORTION (G-FORCE LAB)
              The faster you scroll, the more the entire layout leans and stretches.
            */}
            <div className="relative h-[200vh] w-full pt-40 px-8 md:px-16 flex flex-col gap-32">
                <div className="max-w-4xl">
                    <h1 className="text-4xl md:text-8xl font-medium tracking-tight leading-[0.9] text-white/90">
                        Scroll with Force.
                    </h1>
                    <p className="mt-6 text-xl text-white/40 font-light max-w-xl">
                        Framer Motion calculates your scroll wheel's temporal velocity. As acceleration spikes, elements undergo elastic skew physics, snapping back perfectly when you stop.
                    </p>
                </div>

                {/* The Video that distorts itself */}
                <motion.div
                    className="w-full md:w-3/4 mx-auto aspect-video rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl origin-center"
                    style={{
                        skewY: velocitySkew,
                        scale: velocityScale,
                        willChange: "transform"
                    }}
                >
                    <video
                        src="/video_11.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                    <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                        <h2 className="text-4xl md:text-7xl font-sans tracking-tighter uppercase font-black text-rose-50 text-shadow-sm">
                            React <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-300">G-Force</span>
                        </h2>
                        <Maximize className="w-8 h-8 text-white/50" />
                    </div>
                </motion.div>

                {/* Typography that heavily distorts */}
                <motion.div
                    className="w-full text-center py-32 origin-center"
                    style={{
                        skewY: velocitySkew,
                    }}
                >
                    <h1 className="text-[12vw] font-black tracking-tighter uppercase leading-none opacity-20">
                        ELASTICITY
                    </h1>
                </motion.div>
            </div>


            {/* 
              SECTION 2: HORIZONTAL SCROLL HIJACK
              We bind a 400vh container to vertical scroll.
              Inside it, a 100vh sticky window holds a massive wide flexbox.
            */}
            <div ref={horizontalContainerRef} className="relative w-full h-[400vh] bg-neutral-950 mt-32">
                {/* 
                  Sticky Viewport: Locks to screen while user scrolls through the 400vh wrapper 
                */}
                <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">

                    {/* The Rail: Pushed leftward by the xSlider mapping */}
                    <motion.div
                        className="flex w-[400vw] h-full"
                        style={{ x: xSlider }}
                    >
                        {/* Panel 1 */}
                        <div className="w-screen h-full flex flex-col justify-center px-16 md:px-32 border-r border-white/5 relative shrink-0">
                            <h2 className="text-7xl md:text-9xl font-light tracking-tight text-white mb-8">
                                Horizontal<br /><span className="text-rose-500 font-medium">Hijack.</span>
                            </h2>
                            <p className="text-2xl text-white/40 max-w-lg font-light">
                                By mapping vertical scroll progress [0,1] to horizontal X-translation [0%, -75%], we create an infinitely smooth sideways documentary.
                            </p>
                            <MoveRight className="absolute right-16 bottom-16 w-16 h-16 text-white/20 animate-pulse" />
                        </div>

                        {/* Panel 2 */}
                        <div className="w-screen h-full flex items-center justify-center relative p-16 shrink-0 border-r border-white/5 overflow-hidden">
                            {/* Re-using video_11 but wildly scaled up to act as a texture */}
                            <video
                                src="/video_11.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover opacity-10 scale-150 grayscale"
                            />
                            <div className="relative z-10 w-full max-w-4xl p-16 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[3rem]">
                                <h3 className="text-4xl mb-6">Seamless Lenis Integration</h3>
                                <p className="text-white/60 text-lg leading-relaxed">
                                    Unlike traditional scroll hijacking which feels jerky and unnatural, utilizing strict Framer Motion offset mapping combined with the physical mass of the `lenis` wheel listener guarantees a butter-smooth 60fps translation across the X-axis regardless of the user's erratic mouse inputs.
                                </p>
                            </div>
                        </div>

                        {/* Panel 3 */}
                        <div className="w-screen h-full flex items-center justify-between px-16 md:px-32 shrink-0 border-r border-white/5 bg-rose-950/20">
                            <h2 className="text-[15vw] font-black uppercase text-rose-500/10 tracking-tighter select-none">
                                Cinematic
                            </h2>
                            <div className="w-[30vw] aspect-[3/4] rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(225,29,72,0.15)] bg-rose-500/10 border border-rose-500/20 flex flex-col p-8 justify-between">
                                <div className="w-8 h-8 rounded-full bg-rose-500 blur-md animate-pulse" />
                                <div className="space-y-2">
                                    <div className="h-1 w-1/3 bg-white/20 rounded-full" />
                                    <div className="h-1 w-1/2 bg-white/10 rounded-full" />
                                </div>
                            </div>
                        </div>

                        {/* Panel 4 / End */}
                        <div className="w-screen h-full flex flex-col items-center justify-center p-16 shrink-0 relative bg-black">
                            <div className="w-32 h-32 rounded-full border border-white/10 flex items-center justify-center mb-8 bg-white/5 backdrop-blur-md">
                                <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                            <h2 className="text-5xl font-light text-center">
                                End of Track.
                            </h2>
                            <p className="mt-4 text-white/30 text-center max-w-sm">
                                Continue scrolling downwards to exit the hijacking and resume the vertical document flow.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>


        </div>
    );
}
