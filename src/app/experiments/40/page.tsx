"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Shield, Zap, Heart, MessageSquare, Compass, Map as MapIcon, ChevronRight } from "lucide-react";

// --- RPG Logic Constants ---
const INITIAL_STATS = {
    hp: 100,
    maxHp: 100,
    mana: 80,
    maxMana: 100,
    xp: 0,
    level: 1,
    echoes: 0
};

// --- Types ---
interface Monolith {
    x: number;
    y: number;
    id: string;
    type: "Echo" | "ManaSource" | "Rift";
    discovered: boolean;
    size: number;
    pulse: number;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
}

export default function SoulSeekerRPG() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stats, setStats] = useState(INITIAL_STATS);
    const [logs, setLogs] = useState<string[]>(["Awakened in the Void.", "Seek the echoes of the past."]);
    const [isInteracting, setIsInteracting] = useState(false);
    
    // Engine State
    const playerRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, angle: 0 });
    const mouseRef = useRef({ x: 0, y: 0 });
    const monolithsRef = useRef<Monolith[]>([]);
    const particlesRef = useRef<Particle[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;
        playerRef.current.x = w / 2;
        playerRef.current.y = h / 2;

        // Initialize world objects
        const spawnMonoliths = () => {
            const types: ("Echo" | "ManaSource" | "Rift")[] = ["Echo", "ManaSource", "Rift"];
            monolithsRef.current = Array.from({ length: 8 }, (_, i) => ({
                x: Math.random() * (w - 200) + 100,
                y: Math.random() * (h - 200) + 100,
                id: `m-${i}`,
                type: types[i % types.length],
                discovered: false,
                size: 20 + Math.random() * 30,
                pulse: 0
            }));
        };
        spawnMonoliths();

        const handleResize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("mousemove", handleMouseMove);

        let frameId: number;
        const render = () => {
            ctx.fillStyle = "rgba(4, 8, 15, 0.4)";
            ctx.fillRect(0, 0, w, h);

            // --- Movement Physics (Easing) ---
            const dx = mouseRef.current.x - playerRef.current.x;
            const dy = mouseRef.current.y - playerRef.current.y;
            playerRef.current.vx += (dx * 0.015 - playerRef.current.vx) * 0.1;
            playerRef.current.vy += (dy * 0.015 - playerRef.current.vy) * 0.1;
            playerRef.current.x += playerRef.current.vx;
            playerRef.current.y += playerRef.current.vy;
            playerRef.current.angle = Math.atan2(playerRef.current.vx, -playerRef.current.vy);

            // --- Monoliths (Interactables) ---
            monolithsRef.current.forEach(m => {
                m.pulse += 0.02;
                const dist = Math.hypot(m.x - playerRef.current.x, m.y - playerRef.current.y);

                if (dist < 150) {
                    // Interaction Bloom
                    ctx.beginPath();
                    ctx.arc(m.x, m.y, m.size + Math.sin(m.pulse) * 10, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(100, 255, 255, ${0.5 - dist/300})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    if (dist < m.size + 10 && !m.discovered) {
                        m.discovered = true;
                        handleInteraction(m);
                    }
                }

                // Draw Monolith
                ctx.save();
                ctx.translate(m.x, m.y);
                ctx.rotate(m.pulse * 0.5);
                ctx.shadowBlur = 20;
                ctx.shadowColor = m.discovered ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 255, 250, 0.3)";
                ctx.strokeStyle = m.discovered ? "white" : "rgba(0, 255, 250, 0.6)";
                ctx.lineWidth = 2;
                ctx.strokeRect(-m.size/2, -m.size/2, m.size, m.size);
                
                // Tech decor inside
                ctx.beginPath();
                ctx.arc(0, 0, 2, 0, Math.PI * 2);
                ctx.fillStyle = "cyan";
                ctx.fill();
                ctx.restore();
            });

            // --- Soul Rendering (Player) ---
            // Trail
            particlesRef.current.push({
                x: playerRef.current.x,
                y: playerRef.current.y,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 1,
                color: `hsla(180, 100%, 70%, ${0.5})`
            });

            particlesRef.current.forEach((p, idx) => {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.02;
                if (p.life <= 0) {
                    particlesRef.current.splice(idx, 1);
                    return;
                }
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.life * 4, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            });

            // Core
            ctx.save();
            ctx.translate(playerRef.current.x, playerRef.current.y);
            ctx.rotate(playerRef.current.angle);
            ctx.shadowBlur = 30;
            ctx.shadowColor = "cyan";
            ctx.fillStyle = "white";
            
            // Abstract "Soul" Shape (Diamond)
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(8, 0);
            ctx.lineTo(0, 15);
            ctx.lineTo(-8, 0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            frameId = requestAnimationFrame(render);
        };

        const handleInteraction = (m: Monolith) => {
            const messages = {
                Echo: "You absorbed an ancient Echo. (+10 XP)",
                ManaSource: "Vibrant energy restores your spirit. (+20 Mana)",
                Rift: "You touched a Void Rift. Be careful."
            };
            
            setLogs(prev => [messages[m.type], ...prev].slice(0, 10));
            
            setStats(prev => ({
                ...prev,
                xp: m.type === "Echo" ? prev.xp + 20 : prev.xp,
                mana: m.type === "ManaSource" ? Math.min(prev.maxMana, prev.mana + 20) : prev.mana,
                echoes: m.type === "Echo" ? prev.echoes + 1 : prev.echoes
            }));

            // Level Up logic
            setStats(prev => {
                if (prev.xp >= 100) {
                    setLogs(l => ["LEVEL UP! The Soul grows stronger.", ...l].slice(0, 10));
                    return { ...prev, xp: 0, level: prev.level + 1, maxHp: prev.maxHp + 20, maxMana: prev.maxMana + 20 };
                }
                return prev;
            });
        };

        render();

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(frameId);
        };
    }, []);

    return (
        <div className="relative w-full h-screen bg-[#04080f] text-white font-sans overflow-hidden cursor-none selection:bg-cyan-900/30">
            <canvas ref={canvasRef} className="absolute inset-0 z-0" />

            {/* --- RPG HUD Layer --- */}
            <div className="relative z-10 w-full h-full flex flex-col pointer-events-none p-6 md:p-8">
                
                {/* Header Stats */}
                <header className="flex justify-between items-start">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="pointer-events-auto">
                            <motion.div whileHover={{ scale: 1.1 }} className="p-3 bg-white/5 border border-white/10 backdrop-blur-xl">
                                <ArrowLeft className="w-5 h-5 text-cyan-400" />
                            </motion.div>
                        </Link>
                        <div className="flex flex-col">
                            <span className="text-[10px] tracking-[0.4em] uppercase text-cyan-400 font-bold mb-1">Soul Seeker</span>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black uppercase tracking-tight">Level {stats.level}</h1>
                                <div className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-[9px] uppercase font-bold text-cyan-400">Arch-Spirit</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <StatBar icon={Heart} color="red" current={stats.hp} max={stats.maxHp} label="Vitality" />
                        <StatBar icon={Zap} color="cyan" current={stats.mana} max={stats.maxMana} label="Spirit" />
                    </div>
                </header>

                {/* Left Narrative Log */}
                <div className="mt-auto flex flex-col gap-4 w-full md:w-80">
                    <div className="flex flex-col gap-2 bg-gradient-to-t from-black/80 to-transparent p-4 border-l border-cyan-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="w-3 h-3 text-cyan-500" />
                            <span className="text-[9px] uppercase tracking-widest text-cyan-500 font-bold">Chronicle</span>
                        </div>
                        <AnimatePresence>
                            {logs.map((log, i) => (
                                <motion.div
                                    key={`${log}-${i}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1 - i * 0.2, x: 0 }}
                                    className="text-xs text-white/60 font-medium tracking-tight"
                                >
                                    <span className="text-cyan-600 mr-2">»</span> {log}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Center Navigation UI */}
                <div className="absolute top-1/2 right-8 -translate-y-1/2 flex flex-col gap-6 items-end">
                    <div className="relative w-32 h-32 border border-white/10 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md">
                        <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping" />
                        <Compass className="w-10 h-10 text-cyan-500/30" />
                        
                        {/* Interactive Markers on Map Edge */}
                        {monolithsRef.current.map((m, i) => {
                             const angle = Math.atan2(m.y - playerRef.current.y, m.x - playerRef.current.x);
                             return (
                                <div 
                                    key={m.id}
                                    className={`absolute w-1 h-1 rounded-full ${m.discovered ? "bg-white" : "bg-cyan-400 shadow-[0_0_5px_cyan]"}`}
                                    style={{
                                        transform: `rotate(${angle}rad) translate(64px)`
                                    }}
                                />
                             )
                        })}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] uppercase tracking-widest text-white/30">Location</span>
                        <span className="text-xs font-mono text-cyan-400">VOID_SECTOR_40</span>
                    </div>
                </div>

                {/* Bottom Experience Bar */}
                <div className="mt-8 flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] tracking-[0.2em] uppercase font-black text-white/40">XP Progression</span>
                            <span className="text-[10px] font-mono text-cyan-500">{stats.xp} / 100</span>
                        </div>
                        <div className="flex gap-4">
                             <div className="flex items-center gap-2">
                                <span className="text-[9px] uppercase text-white/30">Echoes Found:</span>
                                <span className="text-xs font-bold text-white">{stats.echoes}</span>
                             </div>
                        </div>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 border border-white/10 overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.xp}%` }}
                            className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]" 
                        />
                    </div>
                </div>
            </div>

            {/* Hint Overlay */}
            <div className="absolute bottom-8 right-8 pointer-events-none text-right">
                <span className="text-[10px] uppercase tracking-widest text-white/20">Movement Mode</span>
                <p className="text-xs text-white/40 italic">Control the Soul with your cursor.<br />Discover Monoliths to grow stronger.</p>
            </div>
        </div>
    );
}

function StatBar({ icon: Icon, color, current, max, label }: any) {
    const percentage = (current / max) * 100;
    const colorMap: any = {
        cyan: "bg-cyan-500",
        red: "bg-red-500",
        purple: "bg-purple-500"
    };

    return (
        <div className="flex flex-col items-end gap-1.5 min-w-[140px]">
            <div className="flex items-center gap-2">
                <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-white/40">{label}</span>
                <Icon className={`w-3 h-3 ${color === "cyan" ? "text-cyan-500" : "text-red-500"}`} />
            </div>
            <div className="w-full h-1 bg-white/5 border border-white/10 rounded-full overflow-hidden">
                <motion.div 
                    animate={{ width: `${percentage}%` }}
                    className={`h-full ${colorMap[color]} shadow-lg`}
                />
            </div>
            <span className="text-[9px] font-mono text-white/30">{current} / {max}</span>
        </div>
    );
}
