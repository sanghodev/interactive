"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause, Maximize, Volume2 } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";

export default function VideoLandingExperiment() {
    const [isPlaying, setIsPlaying] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="relative min-h-screen bg-black overflow-hidden selection:bg-indigo-500/30 font-sans text-white">
            {/* Absolute Video Background */}
            <div className="absolute inset-0 z-0">
                <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="object-cover w-full h-full opacity-60 transition-opacity duration-1000"
                    poster="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" // Temporary poster until video loads
                >
                    <source src="/video_1.mp4" type="video/mp4" />
                </video>

                {/* Gradients to ensure text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
            </div>

            {/* Navigation */}
            <nav className="absolute top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-center">
                <Link href="/" scroll={false}>
                    <motion.div
                        whileHover={{ x: -4 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Archive</span>
                    </motion.div>
                </Link>
                <div className="text-xs tracking-widest uppercase font-semibold text-white/50">
                    Experiment 01
                </div>
            </nav>

            {/* Main Content Overlay */}
            <main className="relative z-10 flex flex-col justify-center min-h-screen p-6 md:p-16 lg:p-24 w-full max-w-7xl mx-auto">
                <div className="max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                    >
                        <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-xs font-semibold tracking-wider text-green-50 uppercase">Live Preview</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.1] mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
                            Cinematic <br />
                            Experiences.
                        </h1>

                        <p className="text-lg md:text-xl text-white/70 max-w-xl leading-relaxed mb-12 font-light">
                            Transforming static landing pages into immersive, narrative-driven environments. Using modern video compression and hardware acceleration.
                        </p>

                        {/* Interactive Controls */}
                        <div className="flex items-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={togglePlay}
                                className="flex items-center justify-center w-14 h-14 rounded-full bg-white text-black hover:bg-gray-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.3)] cursor-pointer"
                                aria-label={isPlaying ? "Pause video" : "Play video"}
                            >
                                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                            </motion.button>

                            <div className="flex gap-2">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors group cursor-pointer">
                                    <Volume2 className="w-5 h-5 text-white/70 group-hover:text-white" />
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors group cursor-pointer">
                                    <Maximize className="w-5 h-5 text-white/70 group-hover:text-white" />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Decorative Elements */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-10 right-10 text-right z-10 hidden md:block"
            >
                <p className="text-xs tracking-widest uppercase text-white/50 mb-1">Location</p>
                <p className="text-sm font-medium">Digital Frontier</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-10 left-10 z-10"
            >
                <div className="flex gap-1 h-2 items-end">
                    <motion.div animate={{ height: isPlaying ? ["20%", "100%", "40%", "80%", "20%"] : "20%" }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }} className="w-1 bg-white/50 rounded-full" />
                    <motion.div animate={{ height: isPlaying ? ["60%", "20%", "100%", "30%", "60%"] : "20%" }} transition={{ repeat: Infinity, duration: 1.0, ease: "linear" }} className="w-1 bg-white/50 rounded-full" />
                    <motion.div animate={{ height: isPlaying ? ["100%", "50%", "20%", "90%", "100%"] : "20%" }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="w-1 bg-white/50 rounded-full" />
                    <motion.div animate={{ height: isPlaying ? ["30%", "80%", "50%", "100%", "30%"] : "20%" }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="w-1 bg-white/50 rounded-full" />
                </div>
                <p className="text-[10px] uppercase tracking-widest text-white/30 mt-2 font-mono">{isPlaying ? 'PLAYING' : 'PAUSED'}</p>
            </motion.div>

        </div>
    );
}
