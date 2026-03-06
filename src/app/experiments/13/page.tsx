"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Video, Crosshair, Focus } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function CinematicViewfinder() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Hook into the scroll progress of the extremely tall container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // 1. The Clip-Path Expansion
    // We start at a tiny 5% vw circle in the center.
    // As the user scrolls (progress 0 -> 0.4), it stays fairly small to build tension.
    // Then (0.4 -> 0.8), it explodes into a massive circle covering the >100% viewport width.
    const clipSize = useTransform(
        scrollYProgress,
        [0, 0.3, 0.8, 1],
        ["circle(5vmax at 50% 50%)", "circle(10vmax at 50% 50%)", "circle(150vmax at 50% 50%)", "circle(150vmax at 50% 50%)"]
    );

    // 2. The Inner Video Scale
    // The video itself starts slightly zoomed out, and zooms in slightly as the viewfinder expands, 
    // giving a counter-parallax pushing feel.
    const videoScale = useTransform(
        scrollYProgress,
        [0, 1],
        [1.1, 1.0]
    );

    // 3. UI Element Fades
    // All the tactical/director's cut UI fades out right before the video hits full screen.
    const uiOpacity = useTransform(
        scrollYProgress,
        [0, 0.6, 0.8],
        [1, 0.8, 0]
    );

    // 4. Background Opacity 
    // The pitch black background fades slightly if we want, but keeping it black is most dramatic.

    return (
        <div className="bg-black text-white selection:bg-white/30">

            {/* 
         THE TALL SCROLL TRACK 
         This creates 4 viewports of scrolling space to drive the animation 
       */}
            <div ref={containerRef} className="relative h-[400vh] w-full">

                {/* THE STICKY VIEWPORT CONTAINER */}
                <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">

                    {/* 
                  THE MASKED VIDEO LAYER 
                  Renders the video wrapped by the dynamic clip-path radius
                */}
                    <motion.div
                        className="absolute inset-0 z-10 w-full h-full flex items-center justify-center bg-transparent pointer-events-none"
                        style={{ clipPath: clipSize }}
                    >
                        <motion.video
                            src="/video_8.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{ scale: videoScale }}
                        />

                        {/* Inner Crosshair that locks onto the video center but only draws inside the mask */}
                        <motion.div
                            className="absolute w-[10vmax] h-[10vmax] flex items-center justify-center opacity-50 mix-blend-overlay"
                            style={{ opacity: uiOpacity }}
                        >
                            <div className="absolute w-full h-[1px] bg-white" />
                            <div className="absolute h-full w-[1px] bg-white" />
                            <div className="absolute w-[8vmax] h-[8vmax] rounded-full border border-white" />
                        </motion.div>
                    </motion.div>


                    {/* 
                  THE CONSTANT FOREGROUND UI LAYER 
                  Always stays on top of the black mask or the video.
                */}
                    <div className="absolute inset-0 z-50 pointer-events-none flex flex-col justify-between p-8 md:p-12">

                        {/* Top Bar */}
                        <motion.div
                            className="flex justify-between items-start font-mono text-[10px] uppercase tracking-[0.3em] text-white/50"
                            style={{ opacity: uiOpacity }}
                        >
                            <div className="flex flex-col gap-2 pointer-events-auto">
                                <Link href="/" scroll={false} className="inline-flex items-center gap-3 hover:text-white transition-colors group px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
                                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> BACK
                                </Link>

                                <div className="mt-4 flex flex-col gap-1 ml-2">
                                    <div>[ LENS: 24MM PRIME ]</div>
                                    <div>[ APERTURE: F/1.4 ]</div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-2 text-white">
                                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                    REC
                                </div>
                                <div className="text-white/30">00:00:24:08</div>
                            </div>
                        </motion.div>

                        {/* Center Instructional Text (Fades out quickly) */}
                        <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 mix-blend-difference text-white/40"
                            style={{
                                opacity: useTransform(scrollYProgress, [0, 0.1, 0.2], [1, 0.5, 0]),
                                y: useTransform(scrollYProgress, [0, 0.2], [0, -20])
                            }}
                        >
                            <Focus className="w-6 h-6 animate-spin-slow" />
                            <span className="font-mono text-xs tracking-widest uppercase">Scroll to expand aperture</span>
                        </motion.div>

                        {/* Bottom Bar Cinematic Data */}
                        <motion.div
                            className="flex justify-between flex-col md:flex-row items-end pb-4 font-mono text-[9px] uppercase tracking-widest text-white/30 border-b border-white/10"
                            style={{ opacity: uiOpacity }}
                        >
                            <div className="flex flex-col gap-1">
                                <div>SCENE 13_EXT.</div>
                                <div className="text-white/60 font-medium">CINEMATIC VIEWFINDER</div>
                            </div>

                            <div className="hidden md:flex gap-16 mt-4 md:mt-0">
                                <div className="w-px h-12 bg-white/20" />
                                <div className="flex flex-col justify-end">
                                    <div>EXP: 1/48 SEC</div>
                                    <div>ISO: 800 (DYNAMIC)</div>
                                </div>
                                <div className="w-px h-12 bg-white/20" />
                                <div className="flex flex-col justify-end text-right">
                                    <div>TARGET: VIDEO_8.MP4</div>
                                    <div>ASPECT: 2.35:1 (ANAMORPHIC)</div>
                                </div>
                            </div>

                            <div className="mt-4 md:mt-0">
                                <Video className="w-5 h-5 text-white/40" />
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>

            {/* 
         THE EPILOGUE SECTION
         This flows naturally after the 400vh clip-path scroll lock has finished.
         The video is now edge-to-edge full screen sticky above, and content flows below.
       */}
            <div className="relative z-20 bg-black min-h-screen border-t border-white/10 px-8 py-32 md:p-32 flex flex-col gap-20">

                <div className="max-w-4xl">
                    <h2 className="text-4xl md:text-6xl font-serif font-light tracking-tight mb-8">
                        The Grand<br />Reveal.
                    </h2>
                    <div className="w-24 h-px bg-white/20 mb-12" />
                    <p className="text-lg md:text-2xl font-light text-white/50 leading-relaxed max-w-2xl">
                        By tying a mathematical CSS <code className="text-sm bg-white/10 px-2 py-1 rounded">clip-path</code> radius directly to the viewport&apos;s vertical scroll progression, we forge a deeply physical connection between the user&apos;s action and the digital canvas.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 font-mono text-sm">
                    <div className="flex flex-col gap-4">
                        <div className="text-white/30 uppercase tracking-widest text-[10px]">Methodology 01</div>
                        <h3 className="text-white font-medium">Sticky Containers</h3>
                        <p className="text-white/40 leading-relaxed">
                            A 400vh tall wrapper intercepts the scroll event, while the sticky inner `h-screen` viewport renders the frames over an extended distance.
                        </p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="text-white/30 uppercase tracking-widest text-[10px]">Methodology 02</div>
                        <h3 className="text-white font-medium">Mask Interpolation</h3>
                        <p className="text-white/40 leading-relaxed">
                            Framer motion smoothly maps the `[0, 1]` scroll progress to a `circle(X% at 50% 50%)` radius, driving the explosive geometry.
                        </p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="text-white/30 uppercase tracking-widest text-[10px]">Methodology 03</div>
                        <h3 className="text-white font-medium">Counter Parallax</h3>
                        <p className="text-white/40 leading-relaxed">
                            The inner video subtly scales down (`1.1` to `1.0`) as the outer mask expands, creating an optical illusion of pushing a lens deeper into the frame.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
