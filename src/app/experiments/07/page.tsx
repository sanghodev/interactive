"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import { ArrowLeft, ArrowRight, ShieldCheck, Zap, LineChart, Globe, Lock, PlayCircle } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

declare global {
    interface Window {
        UnicornStudio: any;
    }
}

export default function ProfessionalWebGL() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Subtle parallax for the Hero Text
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

    return (
        <div className="bg-[#0A0A0B] min-h-screen text-slate-100 font-sans selection:bg-blue-600/30 overflow-x-hidden">

            {/* 
         Unicorn Studio Integration Strategy: lazyOnload to prevent blocking critical React rendering
      */}
            <Script
                src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.5/dist/unicornStudio.umd.js"
                strategy="lazyOnload"
                onLoad={() => {
                    if (window.UnicornStudio && window.UnicornStudio.init) {
                        window.UnicornStudio.init();
                    }
                }}
            />

            {/* --- PROFESSIONAL GLOBAL HEADER --- */}
            <header className="fixed top-0 left-0 w-full z-50 px-6 py-5 md:px-12 flex justify-between items-center bg-[#0A0A0B]/60 backdrop-blur-xl border-b border-white/5 transition-all duration-300">

                {/* Logo / Brand */}
                <div className="flex items-center gap-12">
                    <Link href="/" scroll={false} className="group flex items-center gap-2 text-white">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-sm tracking-tighter mr-2 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-transform group-hover:scale-105">
                            QX
                        </div>
                        <span className="font-semibold tracking-wide text-lg">QuantumXP</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
                        <span className="cursor-pointer hover:text-white transition-colors">Platform</span>
                        <span className="cursor-pointer hover:text-white transition-colors">Solutions</span>
                        <span className="cursor-pointer hover:text-white transition-colors">Customers</span>
                        <span className="cursor-pointer hover:text-white transition-colors">Resources</span>
                    </nav>
                </div>

                <div className="flex items-center gap-6 text-sm font-medium">
                    <Link href="/" scroll={false} className="hidden sm:flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Archive Index
                    </Link>
                    <button className="hidden md:block text-slate-300 hover:text-white transition-colors">Sign In</button>
                    <button className="px-5 py-2.5 bg-white text-black rounded-full hover:bg-slate-200 transition-colors shadow-lg">
                        Get Started
                    </button>
                </div>
            </header>


            {/* --- ULTRA-CLEAN WEBGL HERO --- */}
            <div ref={containerRef} className="relative w-full h-screen min-h-[800px] flex flex-col justify-center overflow-hidden">

                {/* The Unicorn Studio WebGL embed dynamically rendered absolute full-bleed */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none md:pointer-events-auto opacity-80"
                    data-us-project="LSQgTk0jCdIb1WF13Dsu"
                    style={{ width: "100%", height: "100%" }}
                />

                {/* Gradients to ensure text readability over the WebGL canvas */}
                <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#0A0A0B]/40 via-transparent to-[#0A0A0B] pointer-events-none" />
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#0A0A0B]/60 via-transparent to-[#0A0A0B]/60 pointer-events-none" />

                {/* Hero Content Overlay */}
                <motion.div
                    style={{ y, opacity }}
                    className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-12 pt-20"
                >
                    <div className="max-w-3xl">

                        {/* Pill Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-8 backdrop-blur-md"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Quantum Engine v4.0 Released
                        </motion.div>

                        {/* Main Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                            className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[1.05] mb-8"
                        >
                            Data infrastructure, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">beautifully engineered.</span>
                        </motion.h1>

                        {/* Subheadline */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                            className="text-lg md:text-2xl text-slate-400 font-light leading-relaxed mb-12 max-w-2xl"
                        >
                            Empowering modern enterprises with real-time analytics, uncompromised security, and infinitely scalable architecture.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                            className="flex flex-col sm:flex-row items-center gap-4"
                        >
                            <button className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-slate-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2">
                                Start Free Trial <ArrowRight className="w-5 h-5" />
                            </button>
                            <button className="w-full sm:w-auto px-8 py-4 bg-[#141517] border border-white/10 text-white rounded-full font-semibold text-lg hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                                <PlayCircle className="w-5 h-5 text-slate-400" /> Watch Demo
                            </button>
                        </motion.div>

                    </div>
                </motion.div>

            </div>


            {/* --- BUSINESS / ENTERPRISE CONTENT SECTIONS --- */}
            <div className="relative z-20 bg-[#0A0A0B]">

                {/* Logo Cloud (Social Proof) */}
                <div className="border-y border-white/5 bg-[#0D0E10]">
                    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-8 opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100">
                        <span className="text-sm font-semibold uppercase tracking-widest text-slate-500 md:mr-12 shrink-0">Trusted By</span>
                        <div className="flex justify-between w-full gap-8 overflow-x-auto no-scrollbar items-center">
                            {/* Dummy Corporate Logos */}
                            <div className="font-bold text-xl md:text-2xl font-serif">Acantha</div>
                            <div className="font-bold text-xl md:text-2xl tracking-tighter">VERTEX</div>
                            <div className="font-bold text-xl md:text-2xl flex items-center gap-1"><Globe className="w-6 h-6" /> GlobalNet</div>
                            <div className="font-bold text-xl md:text-2xl font-mono uppercase">Syndicate</div>
                            <div className="font-bold text-xl md:text-2xl italic">Lumina</div>
                        </div>
                    </div>
                </div>

                {/* Core Features Grid */}
                <section className="py-24 md:py-40 max-w-7xl mx-auto px-6 md:px-12">
                    <div className="text-center max-w-3xl mx-auto mb-20 md:mb-32">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                            Built for scale. <br className="hidden md:block" />Designed for humans.
                        </h2>
                        <p className="text-lg text-slate-400 leading-relaxed font-light">
                            We stripped away the complexity of managing global data clusters. You get absolute performance with a radically simple primitive.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {/* Card 1 */}
                        <div className="bg-[#101114] border border-white/5 rounded-[2rem] p-10 hover:border-blue-500/30 hover:bg-[#14151A] transition-all duration-300 group">
                            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-8 mt-2 group-hover:scale-110 transition-transform">
                                <Zap className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Sub-millisecond Latency</h3>
                            <p className="text-slate-400 leading-relaxed">Global edge routing ensures that your data is always served closest to the user, virtually eliminating wait times.</p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-[#101114] border border-white/5 rounded-[2rem] p-10 hover:border-indigo-500/30 hover:bg-[#14151A] transition-all duration-300 group">
                            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-8 mt-2 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Bank-grade Security</h3>
                            <p className="text-slate-400 leading-relaxed">End-to-end AES-256 encryption, automatic rotational keys, and SOC2 compliance out of the box.</p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-[#101114] border border-white/5 rounded-[2rem] p-10 hover:border-purple-500/30 hover:bg-[#14151A] transition-all duration-300 group">
                            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mb-8 mt-2 group-hover:scale-110 transition-transform">
                                <LineChart className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Real-time Telemetry</h3>
                            <p className="text-slate-400 leading-relaxed">Visualize your entire infrastructure immediately. No complex setups; just immediate, actionable insights.</p>
                        </div>
                    </div>
                </section>

                {/* Deep Dive Section Details */}
                <section className="border-t border-white/5 bg-[#0D0E10] py-24 md:py-40">
                    <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                        {/* Visual Mockup Placeholder */}
                        <div className="relative aspect-square md:aspect-[4/3] rounded-[3rem] bg-gradient-to-tr from-blue-900/20 to-indigo-900/20 border border-white/10 overflow-hidden flex items-center justify-center p-8">
                            {/* Decorative background grid */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:2rem_2rem]" />

                            {/* Abstract Chart UI Dummy */}
                            <div className="relative w-full h-full bg-[#0A0A0B] rounded-2xl border border-white/5 shadow-2xl p-6 flex flex-col justify-end gap-4">
                                <div className="flex justify-between items-center mb-auto">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                    </div>
                                    <div className="w-24 h-4 bg-white/5 rounded-full" />
                                </div>

                                {/* Fake Bar Chart */}
                                <div className="flex items-end justify-between h-48 gap-4 px-4 overflow-hidden">
                                    {[20, 45, 30, 80, 60, 90, 40].map((h, i) => (
                                        <div key={i} className="w-full bg-gradient-to-t from-blue-600/50 to-indigo-400 rounded-t-sm" style={{ height: `${h}%` }}>
                                            <div className="w-full h-1 bg-white/50 rounded-t-sm" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/5 text-slate-300 text-xs font-bold uppercase tracking-wider mb-6">
                                <Lock className="w-3 h-3" /> Compliance First
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
                                Control your data across every dimension.
                            </h2>
                            <p className="text-lg text-slate-400 font-light leading-relaxed mb-10">
                                Granular access controls meet intuitive policy engines. Specify exactly who can query, mutate, and observe your clusters globally without writing a single line of IAM-specific logic.
                            </p>

                            <div className="space-y-6">
                                {[
                                    "Zero-trust architecture enforced natively.",
                                    "Automated daily backups across multi-region nodes.",
                                    "Customizable alerts and webhook payload delivery."
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-start">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                                            <Zap className="w-3 h-3" />
                                        </div>
                                        <span className="text-slate-300 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </section>

                {/* Final CTA / Footer */}
                <footer className="relative py-32 md:py-48 text-center overflow-hidden border-t border-white/5">
                    <div className="absolute inset-0 bg-blue-900/10 pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

                    <div className="relative z-10 max-w-4xl mx-auto px-6">
                        <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-8">
                            Ready to scale infinity?
                        </h2>
                        <p className="text-xl text-slate-400 font-light mb-12 max-w-2xl mx-auto">
                            Join thousands of forward-thinking teams migrating their critical infrastructure to QuantumXP.
                        </p>
                        <button className="px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.15)] mb-20">
                            Create Free Output Account
                        </button>

                        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-slate-500 border-t border-white/10 pt-10">
                            <div className="flex items-center gap-2 mb-4 md:mb-0">
                                <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-white font-bold text-[10px]">QX</div>
                                <span>© 2026 QuantumXP Inc. All rights reserved.</span>
                            </div>
                            <div className="flex gap-6">
                                <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
                                <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
                                <span className="hover:text-white cursor-pointer transition-colors">Security</span>
                            </div>
                        </div>
                    </div>
                </footer>

            </div>
        </div>
    );
}
