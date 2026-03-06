"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Edit3, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function InfiniteLineExperiment() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mounted, setMounted] = useState(false);
    const requestRef = useRef<number>(undefined);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);
    const offsetRef = useRef(0);
    const timeRef = useRef(0);

    useEffect(() => {
        setMounted(true);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.strokeStyle = "#fefce8"; // Creamy white
            ctx.shadowBlur = 0; // Removing wide blur for sharper splatters

            // Reset if resized
            lastPointRef.current = { x: canvas.width / 2, y: 0 };
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };

        window.addEventListener("resize", resize);
        resize();

        const draw = () => {
            timeRef.current += 0.015;

            if (!lastPointRef.current) return;

            // 1. Calculate Core Path with Organic Sway
            const centerX = canvas.width / 2;
            const sway = Math.sin(timeRef.current * 0.4) * 60 + Math.sin(timeRef.current * 1.1) * 20;
            const jitterX = (Math.random() - 0.5) * 1.2;
            const nextX = centerX + sway + jitterX;
            const nextY = lastPointRef.current.y + 2.5;

            // 2. Variable Pressure / Line Width
            const baseWidth = 1.8;
            const pressure = 0.5 + Math.sin(timeRef.current * 0.8) * 0.3 + Math.random() * 0.2;
            const currentWidth = baseWidth * pressure;

            // 3. Draw MULTI-LAYERED STROKE
            // --- Ghost Fibers (Paper texture) ---
            if (Math.random() > 0.1) {
                const fOff = (Math.random() - 0.5) * 12;
                ctx.beginPath();
                ctx.globalAlpha = 0.08;
                ctx.lineWidth = 0.3;
                ctx.moveTo(lastPointRef.current.x + fOff * 0.9, lastPointRef.current.y);
                ctx.lineTo(nextX + fOff, nextY);
                ctx.stroke();
            }

            // --- The "Echo" Stroke (Secondary thin line) ---
            const echoOffX = Math.sin(timeRef.current * 2) * 2.5;
            ctx.beginPath();
            ctx.globalAlpha = 0.15 * pressure;
            ctx.lineWidth = 0.6;
            ctx.moveTo(lastPointRef.current.x + echoOffX, lastPointRef.current.y);
            ctx.lineTo(nextX + echoOffX, nextY);
            ctx.stroke();

            // --- The Main Ink Path ---
            ctx.beginPath();
            ctx.globalAlpha = 0.9 * pressure;
            ctx.lineWidth = currentWidth;
            ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
            ctx.lineTo(nextX, nextY);
            ctx.stroke();

            // --- Micro-Splatters ---
            if (Math.random() > 0.94) {
                const sDist = 5 + Math.random() * 15;
                const sAge = Math.random() * Math.PI * 2;
                ctx.beginPath();
                ctx.globalAlpha = 0.2;
                ctx.arc(
                    nextX + Math.cos(sAge) * sDist,
                    nextY + Math.sin(sAge) * sDist,
                    Math.random() * 0.8,
                    0, Math.PI * 2
                );
                ctx.fill();
            }

            ctx.globalAlpha = 1.0;
            lastPointRef.current = { x: nextX, y: nextY };

            // Infinite Scrolling
            if (nextY > canvas.height * 0.65) {
                const shiftAmount = 2.5;
                const tempCanvas = document.createElement("canvas");
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const tempCtx = tempCanvas.getContext("2d");
                if (tempCtx) {
                    tempCtx.drawImage(canvas, 0, 0);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(tempCanvas, 0, -shiftAmount);
                    lastPointRef.current.y -= shiftAmount;
                }
            }

            requestRef.current = requestAnimationFrame(draw);
        };

        requestRef.current = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener("resize", resize);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return (
        <div className="relative min-h-screen bg-[#050505] text-white overflow-hidden font-light selection:bg-yellow-500/30">
            <canvas ref={canvasRef} className="fixed inset-0 z-0 touch-none" />

            {/* Decorative Texture Overlay */}
            <div className="fixed inset-0 z-10 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-center pointer-events-none">
                <Link href="/" scroll={false} className="pointer-events-auto">
                    <motion.div
                        whileHover={{ x: -2, opacity: 0.7 }}
                        className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-3xl text-[9px] font-black tracking-[0.6em] uppercase transition-all cursor-pointer"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Archive / 026</span>
                    </motion.div>
                </Link>
                <div className="flex flex-col items-end gap-1">
                    <div className="text-[10px] font-black tracking-[0.4em] uppercase text-yellow-100/40">Manual Synthesis</div>
                </div>
            </nav>

            {/* Hero Overlay */}
            <main className="relative z-20 min-h-screen flex flex-col items-center justify-between p-10 pointer-events-none">
                <div className="w-full flex justify-between items-start opacity-20">
                    <div className="text-[10px] font-bold tracking-[0.3em] uppercase vertical-text rotate-180 flex flex-col items-center gap-4">
                        <div className="h-20 w-px bg-white" />
                        CONTINUUM
                    </div>
                    <div className="text-[10px] font-bold tracking-[0.3em] uppercase vertical-text flex flex-col items-center gap-4">
                        PATHWAY
                        <div className="h-20 w-px bg-white" />
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="text-center space-y-2 mb-20"
                >
                    <h1 className="text-[10vw] font-black tracking-[-0.05em] text-white/5 uppercase italic">Infinite Path</h1>
                    <p className="text-[10px] font-bold tracking-[1em] uppercase text-white/20">The hand of the unknown</p>
                </motion.div>

                <div className="w-full flex justify-center opacity-10">
                    <div className="flex items-center gap-12">
                        <span className="text-[9px] font-black tracking-widest uppercase">Organic Oscillations</span>
                        <div className="w-24 h-[1px] bg-white" />
                        <span className="text-[9px] font-black tracking-widest uppercase">Ink Persistence</span>
                    </div>
                </div>
            </main>

            {/* Status Details */}
            <div className="fixed left-10 bottom-10 z-30 opacity-20 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <Edit3 className="w-3 h-3" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Manual Inscription Mode</span>
                </div>
                <div className="flex items-center gap-3">
                    <RefreshCw className="w-3 h-3 animate-spin-slow" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Active Stream: Path.026</span>
                </div>
            </div>

            <style jsx global>{`
        body {
          background-color: #050505;
          cursor: none;
        }
        .vertical-text {
          writing-mode: vertical-rl;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
        </div>
    );
}
