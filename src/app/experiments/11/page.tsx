"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Activity, TerminalSquare, RefreshCw, Layers } from "lucide-react";

export default function CanvasVideoDistortion() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const requestRef = useRef<number>(0);
    const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

    const [fps, setFps] = useState(0);
    const fpsRef = useRef({ count: 0, lastTime: 0 });

    // Mouse tracking
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Normalize to -1 to 1 based on screen center
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            mouse.current.targetX = (e.clientX - centerX) / centerX;
            mouse.current.targetY = (e.clientY - centerY) / centerY;
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    // Main Canvas Render Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        // Handle Resize
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        // Ensure video is playing
        video.play().catch((e) => console.log("Video Autoplay Error:", e));

        // The Render Loop
        const render = (time: number) => {
            // FPS Calculation
            if (time - fpsRef.current.lastTime >= 1000) {
                setFps(fpsRef.current.count);
                fpsRef.current.count = 0;
                fpsRef.current.lastTime = time;
            }
            fpsRef.current.count++;

            // Smooth mouse interpolation (Lerp)
            mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.1;
            mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.1;

            // Make sure video has data before grabbing pixels
            if (video.readyState >= video.HAVE_CURRENT_DATA) {
                // Calculate dimensions to cover canvas (like object-fit: cover)
                const vRatio = video.videoWidth / video.videoHeight;
                const cRatio = canvas.width / canvas.height;
                let drawWidth, drawHeight, startX, startY;

                if (cRatio > vRatio) {
                    drawWidth = canvas.width;
                    drawHeight = canvas.width / vRatio;
                    startX = 0;
                    startY = (canvas.height - drawHeight) / 2;
                } else {
                    drawWidth = canvas.height * vRatio;
                    drawHeight = canvas.height;
                    startX = (canvas.width - drawWidth) / 2;
                    startY = 0;
                }

                // Draw original video frame
                ctx.drawImage(video, startX, startY, drawWidth, drawHeight);

                // --- THE ABERRATION ALGORITHM ---
                // We only manipulate pixels if the mouse is moving significantly
                const intensity = Math.abs(mouse.current.x) + Math.abs(mouse.current.y);

                if (intensity > 0.05) {
                    // Grab the raw pixels we just drew
                    const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = frameData.data;
                    const newFrameData = ctx.createImageData(canvas.width, canvas.height);
                    const newData = newFrameData.data;

                    // Calculate shift based on mouse position
                    // Max shift of 40 pixels on X axis and 20 on Y axis
                    const rShiftX = Math.floor(mouse.current.x * 20);
                    const rShiftY = Math.floor(mouse.current.y * 10);
                    const bShiftX = Math.floor(-mouse.current.x * 30);
                    const bShiftY = Math.floor(-mouse.current.y * 15);

                    for (let y = 0; y < canvas.height; y++) {
                        for (let x = 0; x < canvas.width; x++) {
                            const i = (y * canvas.width + x) * 4;

                            // Source indices for Red and Blue channels
                            const rY = Math.min(Math.max(y + rShiftY, 0), canvas.height - 1);
                            const rX = Math.min(Math.max(x + rShiftX, 0), canvas.width - 1);
                            const rI = (rY * canvas.width + rX) * 4;

                            const bY = Math.min(Math.max(y + bShiftY, 0), canvas.height - 1);
                            const bX = Math.min(Math.max(x + bShiftX, 0), canvas.width - 1);
                            const bI = (bY * canvas.width + bX) * 4;

                            // Apply Chromatic Aberration
                            newData[i] = data[rI];         // Red channel from shifted R
                            newData[i + 1] = data[i + 1];  // Green channel stays normal
                            newData[i + 2] = data[bI + 2]; // Blue channel from shifted B
                            newData[i + 3] = data[i + 3];  // Alpha stays normal
                        }
                    }

                    // Put the manipulated pixels back onto the canvas
                    ctx.putImageData(newFrameData, 0, 0);

                    // Artificial static/scanline noise layer
                    ctx.fillStyle = "rgba(0, 255, 0, 0.05)";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            }

            requestRef.current = requestAnimationFrame(render);
        };

        requestRef.current = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(requestRef.current);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden font-mono text-green-400 selection:bg-green-500/30 selection:text-black">

            {/* 
        HIDDEN VIDEO SOURCE
        The canvas engine reads frames from this invisible DOM element 
      */}
            <video
                ref={videoRef}
                src="/video_6.mp4"
                className="hidden"
                loop
                muted
                autoPlay
                playsInline
                crossOrigin="anonymous"
            />

            {/* 
        THE RENDER TARGET
        Displays the mathematically manipulated RGB pixel data
      */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-0 w-full h-full object-cover opacity-80 mix-blend-screen pointer-events-none"
            />
            <div className="absolute inset-0 z-0 bg-black/40 pointer-events-none" />

            {/* --- CYBERNETIC AVANT-GARDE UI --- */}
            <div className="relative z-10 w-full h-full p-6 md:p-10 pointer-events-none">

                {/* Top Left Navigation Node */}
                <div className="absolute top-10 left-10 pointer-events-auto border border-green-500/30 bg-black/50 backdrop-blur-md p-4 flex flex-col gap-4 max-w-[250px] shadow-[0_0_20px_rgba(0,255,0,0.1)]">
                    <Link href="/" scroll={false} className="inline-flex items-center gap-2 text-sm uppercase hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> [ EXIT_SECTOR ]
                    </Link>
                    <div className="text-[10px] leading-relaxed opacity-70">
                        You are interacting with raw graphical memory. Moving the cursor initiates dynamic chromatic displacement.
                    </div>
                </div>

                {/* Top Right Live Telemetry */}
                <div className="absolute top-10 right-10 flex flex-col items-end gap-2 text-[10px] uppercase tracking-widest text-right">
                    <div className="flex items-center gap-2 bg-green-950/50 border border-green-500/50 px-3 py-1 mb-2">
                        <TerminalSquare className="w-4 h-4" />
                        <span className="animate-pulse">SYSTEM ONLINE</span>
                    </div>
                    <div>RENDER_TARGET: CANVAS_2D</div>
                    <div>DATA_SOURCE: VIDEO_6_H264</div>
                    <div className="text-white mt-1 pt-1 border-t border-green-500/30 w-full">
                        FPS_LOCK: {fps}
                    </div>
                </div>

                {/* Bottom Left Status Matrix */}
                <div className="absolute bottom-10 left-10 hidden md:flex gap-4">
                    {[
                        { label: "R_SHIFT", val: "ACTIVE", icon: <Layers className="w-4 h-4" /> },
                        { label: "G_LOCKED", val: "STATIC", icon: <RefreshCw className="w-4 h-4 opacity-50" /> },
                        { label: "B_SHIFT", val: "ACTIVE", icon: <Activity className="w-4 h-4" /> }
                    ].map((node, i) => (
                        <div key={i} className="border border-green-500/30 bg-black/50 p-3 min-w-[120px] backdrop-blur-md flex flex-col gap-2">
                            <div className="text-green-500/50">{node.icon}</div>
                            <div className="text-[10px] text-green-500">{node.label}</div>
                            <div className="text-xs font-bold text-white">{node.val}</div>
                        </div>
                    ))}
                </div>

                {/* Bottom Right Glitch Title */}
                <div className="absolute bottom-10 right-10 text-right">
                    <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-t from-green-600 via-green-400 to-white mix-blend-screen m-0 leading-none">
                        PXL<br />MNPLTN
                    </h1>
                    <div className="text-sm mt-2 text-green-300">
                        [ PIXEL MANIPULATION ALGORITHM V1.0 ]
                    </div>
                </div>

                {/* Targeting Reticle Center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30vh] h-[30vh] border border-green-500/20 rounded-full flex items-center justify-center opacity-30 mix-blend-screen pointer-events-none">
                    <div className="w-px h-full bg-green-500/20" />
                    <div className="h-px w-full absolute bg-green-500/20" />
                    <div className="absolute w-2 h-2 bg-green-500 shadow-[0_0_10px_#00FF00]" />
                </div>

            </div>
        </div>
    );
}
