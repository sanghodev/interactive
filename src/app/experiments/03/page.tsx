"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { ArrowLeft, PlayCircle, BarChart3, Fingerprint, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function AdvancedGSAPLanding() {
    const mainRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);
    const videoMaskRef = useRef<HTMLDivElement>(null);
    const textContainerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: heroRef.current,
                start: "top top",
                end: "+=1500", // The duration of the pinned scroll
                pin: true,
                scrub: 1, // Smooth scrubbing
            },
        });

        // 1. Initial State Setup (Mask starts as a 200px circle in the center)
        gsap.set(videoMaskRef.current, {
            clipPath: "circle(100px at 50% 50%)",
        });

        // 2. Animation Sequence
        tl.to(videoMaskRef.current, {
            // Expand the clip-path to cover the entire screen
            clipPath: "circle(150% at 50% 50%)",
            duration: 2,
            ease: "power2.inOut",
        }, 0)

            // Scale up the video slightly for a parallax effect inwards
            .fromTo(".bg-video", { scale: 1.2 }, { scale: 1, duration: 2, ease: "none" }, 0)

            // Fade out the initial prominent text as the video expands
            .to(".intro-word", {
                y: -50,
                opacity: 0,
                stagger: 0.1,
                duration: 0.8,
                ease: "power1.in",
            }, 0)

            // Fade in the secondary hero text once the video is fully revealed
            .fromTo(".overlay-text", {
                y: 100,
                opacity: 0,
            }, {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power3.out",
            }, 1.5); // Start slightly before the mask finishes


        // Advanced Parallax for the content below the hero
        gsap.utils.toArray(".parallax-card").forEach((card: any, i) => {
            gsap.fromTo(card,
                { y: 100, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                        end: "top 50%",
                        scrub: 1
                    }
                }
            );
        });

    }, { scope: mainRef });

    return (
        <div ref={mainRef} className="bg-neutral-950 min-h-screen text-white font-sans selection:bg-indigo-500/30">
            {/* Navigation Layer */}
            <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center pointer-events-none mix-blend-difference text-white">
                <Link href="/" scroll={false} className="pointer-events-auto">
                    <motion.div
                        whileHover={{ x: -4 }}
                        className="flex items-center gap-2 px-4 py-2 font-medium transition-opacity hover:opacity-70"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Return</span>
                    </motion.div>
                </Link>
                <div className="font-mono text-xs tracking-widest uppercase">
                    03 / Advanced Flow
                </div>
            </nav>

            {/* Pinned Hero Sequence */}
            <div ref={heroRef} className="relative w-full h-screen overflow-hidden bg-neutral-950 flex items-center justify-center">

                {/* The Initial Foreground Text (Visible before mask expands) */}
                <div ref={textContainerRef} className="absolute z-20 flex gap-4 text-5xl md:text-8xl font-bold tracking-tighter uppercase mix-blend-difference pointer-events-none">
                    <span className="intro-word">Redefining</span>
                    <span className="intro-word text-transparent [-webkit-text-stroke:2px_white]">Visuals</span>
                </div>

                {/* The Masked Video Container */}
                <div ref={videoMaskRef} className="absolute inset-0 z-10 flex items-center justify-center bg-black">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        src="/video_3.mp4"
                        className="bg-video absolute top-0 left-0 w-full h-full object-cover opacity-70"
                    />

                    {/* Subtle gradient to ensure the secondary text is readable */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                    {/* Secondary Hero Text (Revealed after mask expands) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 md:pb-32 px-6 text-center z-30 pointer-events-none">
                        <div className="overlay-text">
                            <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-6">
                                Experience the <br className="hidden md:block" /> Unprecedented.
                            </h1>
                            <p className="text-lg md:text-xl text-neutral-300 font-light max-w-2xl mx-auto mb-8">
                                Seamless transitions, cinematic scales, and precision engineering. Welcome to the next generation of digital storytelling.
                            </p>
                            <div className="pointer-events-auto">
                                <button className="px-8 py-4 bg-white text-black rounded-full font-semibold flex items-center gap-2 mx-auto hover:bg-neutral-200 transition-colors">
                                    <PlayCircle className="w-5 h-5" />
                                    Watch Showreel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Premium Dummy Content (High Conversion Layout) */}
            <div className="relative z-20 bg-neutral-950 -mt-1 rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                <div className="max-w-7xl mx-auto px-6 py-32">

                    <div className="text-center max-w-3xl mx-auto mb-24">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Engineered for Impact</h2>
                        <p className="text-neutral-400 text-lg">We don't just build websites; we architect environments that capture attention and drive measurable results through kinetic design.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {[
                            { icon: Fingerprint, title: "Unique Identity", desc: "Stand out in a sea of templates with bespoke typographic animations and scroll logic." },
                            { icon: BarChart3, title: "Engagement Lift", desc: "Interactive environments consistently show a 40%+ increase in average session duration." },
                            { icon: ShieldCheck, title: "Performance First", desc: "Hardware-accelerated CSS and optimized rendering loops ensure butter-smooth framerates." }
                        ].map((feature, idx) => (
                            <div key={idx} className="parallax-card p-10 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors group">
                                <div className="w-14 h-14 rounded-2xl bg-neutral-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                                <p className="text-neutral-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}

                    </div>

                    {/* Massive Call to Action */}
                    <div className="mt-32 rounded-[3rem] bg-gradient-to-br from-indigo-900 via-neutral-900 to-black border border-indigo-500/20 p-12 md:p-24 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to evolve?</h2>
                            <p className="text-xl text-indigo-200 mb-10">Integrate dynamic spatial experiences into your brand's digital presence today.</p>
                            <button className="px-10 py-5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-full font-bold text-lg transition-colors shadow-[0_0_40px_rgba(99,102,241,0.4)]">
                                Initiate Protocol
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
