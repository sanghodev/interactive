"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

// --- Tendril Configuration ---
const TENDRIL_COUNT = 6;
const TRAIL_LENGTH = 80;
const BASE_HUE = 260; // Violet family

interface TendrilPoint {
    x: number;
    y: number;
}

class Tendril {
    points: TendrilPoint[] = [];
    angle: number;
    speed: number;
    hueOffset: number;
    friction: number;
    wobbleFreq: number;
    wobbleAmp: number;
    vx: number = 0;
    vy: number = 0;

    constructor(x: number, y: number, index: number) {
        this.angle = (Math.PI * 2 * index) / TENDRIL_COUNT + Math.random() * 0.5;
        this.speed = 1.5 + Math.random() * 1.5;
        this.hueOffset = index * 35;
        this.friction = 0.96 + Math.random() * 0.02;
        this.wobbleFreq = 0.02 + Math.random() * 0.03;
        this.wobbleAmp = 3 + Math.random() * 4;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;

        // Initialize trail with same starting point
        for (let i = 0; i < TRAIL_LENGTH; i++) {
            this.points.push({ x, y });
        }
    }

    update(mouseX: number, mouseY: number, w: number, h: number, time: number) {
        const head = this.points[0];

        // Autonomous wandering force
        const wobble = Math.sin(time * this.wobbleFreq * 60) * this.wobbleAmp;
        this.angle += Math.sin(time * 0.3 + this.hueOffset) * 0.04;

        // Mouse attraction (gentle pull)
        const dx = mouseX - head.x;
        const dy = mouseY - head.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const attractionRadius = 350;

        if (dist < attractionRadius && dist > 5) {
            const force = (attractionRadius - dist) / attractionRadius;
            const attractStrength = 0.15;
            this.vx += (dx / dist) * force * attractStrength;
            this.vy += (dy / dist) * force * attractStrength;

            // Add a perpendicular swirling force for orbital motion
            const perpX = -dy / dist;
            const perpY = dx / dist;
            this.vx += perpX * force * 0.08;
            this.vy += perpY * force * 0.08;
        }

        // Natural drift
        this.vx += Math.cos(this.angle) * 0.05 + (Math.random() - 0.5) * 0.1;
        this.vy += Math.sin(this.angle) * 0.05 + (Math.random() - 0.5) * 0.1 + wobble * 0.01;

        // Friction
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Speed clamp
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const maxSpeed = 5;
        if (currentSpeed > maxSpeed) {
            this.vx = (this.vx / currentSpeed) * maxSpeed;
            this.vy = (this.vy / currentSpeed) * maxSpeed;
        }

        // New head position
        const newX = head.x + this.vx;
        const newY = head.y + this.vy;

        // Soft edge wrapping
        const margin = 60;
        const wrapX = newX < -margin ? w + margin : newX > w + margin ? -margin : newX;
        const wrapY = newY < -margin ? h + margin : newY > h + margin ? -margin : newY;

        // Prepend new point, pop last
        this.points.unshift({ x: wrapX, y: wrapY });
        if (this.points.length > TRAIL_LENGTH) this.points.pop();
    }

    draw(ctx: CanvasRenderingContext2D, time: number) {
        if (this.points.length < 4) return;

        for (let i = 0; i < this.points.length - 1; i++) {
            const t = i / this.points.length;

            // Color: shift hue over length + time
            const hue = (BASE_HUE + this.hueOffset + t * 60 + time * 15) % 360;
            const sat = 70 + t * 20;
            const light = 65 - t * 30;
            const alpha = (1 - t) * 0.7;

            // Width: thick at head, thin at tail
            const width = (1 - t) * 3.5 + 0.3;

            ctx.beginPath();
            ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
            ctx.lineWidth = width;
            ctx.lineCap = "round";

            const p0 = this.points[i];
            const p1 = this.points[i + 1];

            // Skip if wrapping happened (large jump)
            if (Math.abs(p0.x - p1.x) > 200 || Math.abs(p0.y - p1.y) > 200) continue;

            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.stroke();
        }

        // Glow at the head
        const head = this.points[0];
        const headHue = (BASE_HUE + this.hueOffset + time * 15) % 360;
        const gradient = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 12);
        gradient.addColorStop(0, `hsla(${headHue}, 80%, 75%, 0.6)`);
        gradient.addColorStop(1, `hsla(${headHue}, 80%, 75%, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 12, 0, Math.PI * 2);
        ctx.fill();
    }
}

export default function ChromaticResonanceExperiment() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mounted, setMounted] = useState(false);
    const tendrilsRef = useRef<Tendril[]>([]);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const timeRef = useRef(0);
    const rafRef = useRef<number>(undefined);

    useEffect(() => {
        setMounted(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // Re-initialize tendrils at center
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            tendrilsRef.current = [];
            for (let i = 0; i < TENDRIL_COUNT; i++) {
                tendrilsRef.current.push(new Tendril(cx, cy, i));
            }
        };

        const handleMouse = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", handleMouse);
        resize();

        const animate = () => {
            timeRef.current += 0.016;
            const w = canvas.width;
            const h = canvas.height;

            // Fade: semi-transparent black overlay for trail persistence
            ctx.fillStyle = "rgba(5, 3, 8, 0.06)";
            ctx.fillRect(0, 0, w, h);

            // Update & draw tendrils
            for (const tendril of tendrilsRef.current) {
                tendril.update(mouseRef.current.x, mouseRef.current.y, w, h, timeRef.current);
                tendril.draw(ctx, timeRef.current);
            }

            // Subtle ambient particles
            if (Math.random() > 0.92) {
                const px = Math.random() * w;
                const py = Math.random() * h;
                const pHue = (BASE_HUE + Math.random() * 120) % 360;
                ctx.beginPath();
                ctx.fillStyle = `hsla(${pHue}, 60%, 70%, ${0.1 + Math.random() * 0.15})`;
                ctx.arc(px, py, Math.random() * 1.5, 0, Math.PI * 2);
                ctx.fill();
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouse);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <div className="relative min-h-screen bg-[#050308] text-white overflow-hidden font-light selection:bg-purple-500/30">
            <canvas ref={canvasRef} className="fixed inset-0 z-0" />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-center pointer-events-none">
                <Link href="/" scroll={false} className="pointer-events-auto">
                    <motion.div
                        whileHover={{ x: -2, opacity: 0.7 }}
                        className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-3xl text-[9px] font-black tracking-[0.6em] uppercase transition-all cursor-pointer"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Archive / 028</span>
                    </motion.div>
                </Link>
            </nav>

            {/* Central Title */}
            <main className="relative z-20 min-h-screen flex flex-col items-center justify-center pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="text-center space-y-3"
                >
                    <div className="flex items-center justify-center gap-3 mb-6 opacity-30">
                        <Sparkles className="w-3 h-3" />
                        <span className="text-[9px] font-black tracking-[1em] uppercase">Experiment 028</span>
                        <Sparkles className="w-3 h-3" />
                    </div>
                    <h1
                        className="text-[16vw] md:text-[10vw] font-black tracking-[-0.06em] leading-[0.85] uppercase select-none"
                        style={{
                            background: "linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(236,72,153,0.1) 50%, rgba(99,102,241,0.1) 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Chromatic<br />Resonance
                    </h1>
                    <p className="text-[10px] font-bold tracking-[0.8em] uppercase text-white/15 mt-4">
                        Move your cursor to conduct the light
                    </p>
                </motion.div>
            </main>

            {/* Bottom Info */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 opacity-15 flex items-center gap-8">
                <span className="text-[8px] font-black tracking-[0.4em] uppercase">Autonomous Tendrils</span>
                <div className="w-16 h-px bg-white/30" />
                <span className="text-[8px] font-black tracking-[0.4em] uppercase">HSL Cycling</span>
                <div className="w-16 h-px bg-white/30" />
                <span className="text-[8px] font-black tracking-[0.4em] uppercase">Trail Persistence</span>
            </div>

            <style jsx global>{`
        body { background: #050308; }
      `}</style>
        </div>
    );
}
