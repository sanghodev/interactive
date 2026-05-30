"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Volume2, VolumeX, Sparkles, RefreshCw, Zap, Disc, Sliders, Radio } from "lucide-react";

// ═══════════════════════════════════════════════════════════════
//  TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseSize: number;
  size: number;
  hue: number;
  brightness: number;
  alpha: number;
  decay: number;
}

interface GravityNode {
  id: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  mass: number;
  hue: number;
  pulse: number;
  active: boolean;
}

interface SoundRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  hue: number;
}

// ═══════════════════════════════════════════════════════════════
//  PENTATONIC SCALE CONSTANTS (A Minor Pentatonic)
// ═══════════════════════════════════════════════════════════════
const NOTES = [110.00, 130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];

export default function ChromaResonance() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Audio state
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [activeSynth, setActiveSynth] = useState<"sine" | "triangle" | "sawtooth">("triangle");
  const [nodeCount, setNodeCount] = useState(0);
  const [particleCount, setParticleCount] = useState(6000);
  
  // Custom interactive parameters
  const [gravityStrength, setGravityStrength] = useState(1.2);
  const [trailLength, setTrailLength] = useState(0.08); // background clear alpha
  const [flowSpeed, setFlowSpeed] = useState(1.0);
  const [activePanel, setActivePanel] = useState<"audio" | "physics" | null>(null);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const delayFeedbackRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Animation & Audio State Sync refs (avoid closure issues in RAF loop)
  const stateRef = useRef({
    gravityStrength,
    trailLength,
    flowSpeed,
    audioEnabled,
    activeSynth,
  });

  useEffect(() => {
    stateRef.current = {
      gravityStrength,
      trailLength,
      flowSpeed,
      audioEnabled,
      activeSynth,
    };
  }, [gravityStrength, trailLength, flowSpeed, audioEnabled, activeSynth]);

  // ═══════════════════════════════════════════════════════════════
  //  AUDIO SYNTHESIZER INITIALIZATION
  // ═══════════════════════════════════════════════════════════════
  const initAudio = () => {
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      
      // Master Analyser
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.2, ctx.currentTime);

      // Delay Effect Setup
      const delay = ctx.createDelay(2.0);
      const feedback = ctx.createGain();
      
      delay.delayTime.setValueAtTime(0.4, ctx.currentTime);
      feedback.gain.setValueAtTime(0.45, ctx.currentTime);

      // Route: Source -> MasterGain -> Analyser -> Destination
      // Route: Source -> Delay -> Feedback -> Delay (Feedback loop)
      // Route: Delay -> MasterGain
      delay.connect(feedback);
      feedback.connect(delay);

      masterGain.connect(analyser);
      analyser.connect(ctx.destination);
      delay.connect(masterGain);

      audioCtxRef.current = ctx;
      masterGainRef.current = masterGain;
      delayNodeRef.current = delay;
      delayFeedbackRef.current = feedback;
      analyserRef.current = analyser;

      setAudioEnabled(true);
    } catch (e) {
      console.error("Failed to initialize Web Audio API:", e);
    }
  };

  const toggleAudio = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      initAudio();
      return;
    }

    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
      setAudioEnabled(true);
    } else if (audioCtxRef.current.state === "running") {
      audioCtxRef.current.suspend();
      setAudioEnabled(false);
    }
  };

  // Play a note with synth envelopes
  const playSynthesizerNote = (frequency: number, duration: number, panValue: number = 0) => {
    const ctx = audioCtxRef.current;
    if (!ctx || ctx.state !== "running") return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

    osc.type = stateRef.current.activeSynth;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Apply soft low-pass filter if sawtooth to make it warmer/ambient
    let finalSourceNode: AudioNode = osc;
    if (osc.type === "sawtooth") {
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.setValueAtTime(600, ctx.currentTime);
      osc.connect(lowpass);
      finalSourceNode = lowpass;
    }

    // Gain envelope (Attack-Decay-Sustain-Release)
    const t = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.25, t + 0.08); // attack
    gainNode.gain.exponentialRampToValueAtTime(0.08, t + 0.3); // decay
    gainNode.gain.setValueAtTime(0.08, t + duration * 0.7);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t + duration); // release

    // Route audio
    if (panner) {
      panner.pan.setValueAtTime(panValue, t);
      finalSourceNode.connect(panner);
      panner.connect(gainNode);
    } else {
      finalSourceNode.connect(gainNode);
    }

    // Send part of signal to master output and part to delay
    if (masterGainRef.current && delayNodeRef.current) {
      gainNode.connect(masterGainRef.current);
      gainNode.connect(delayNodeRef.current);
    }

    osc.start(t);
    osc.stop(t + duration + 0.1);
  };

  // ═══════════════════════════════════════════════════════════════
  //  CANVAS SIMULATION ENGINE
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    // Initial parameters
    const mouse = { x: w / 2, y: h / 2, px: w / 2, py: h / 2, vx: 0, vy: 0, down: false };
    const particles: Particle[] = [];
    const gravityNodes: GravityNode[] = [];
    const soundRipples: SoundRipple[] = [];

    // Create Gravity Node
    const createNode = (x: number, y: number) => {
      const id = Math.random().toString(36).substr(2, 9);
      const isMobile = w < 768;
      const hue = Math.floor(Math.random() * 60) + 260; // Blue/Violet palette
      const node: GravityNode = {
        id,
        x,
        y,
        radius: 4,
        maxRadius: isMobile ? 40 : 65,
        mass: 300,
        hue,
        pulse: 0,
        active: true
      };
      gravityNodes.push(node);
      setNodeCount(gravityNodes.length);

      // Trigger high note on node creation
      if (audioCtxRef.current) {
        const panValue = (x / w) * 2 - 1;
        const noteIndex = Math.floor((1 - (y / h)) * NOTES.length);
        const pitch = NOTES[Math.min(NOTES.length - 1, Math.max(0, noteIndex))];
        playSynthesizerNote(pitch * 2, 2.5, panValue);
      }

      // Add visual ripple
      soundRipples.push({
        x,
        y,
        radius: 0,
        maxRadius: 180,
        alpha: 0.8,
        hue
      });
    };

    // Spawn 1 preset gravity node at center to initiate interaction
    createNode(w / 2, h / 2);

    // Initial Particles
    const spawnParticle = (p: Partial<Particle> = {}): Particle => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2.5;
      const baseSize = 0.6 + Math.random() * 1.6;
      return {
        x: p.x ?? Math.random() * w,
        y: p.y ?? Math.random() * h,
        vx: p.vx ?? Math.cos(angle) * speed,
        vy: p.vy ?? Math.sin(angle) * speed,
        baseSize,
        size: baseSize,
        hue: p.hue ?? Math.floor(Math.random() * 90) + 180, // Blue-Teal-Magenta
        brightness: 50 + Math.random() * 50,
        alpha: 0.15 + Math.random() * 0.6,
        decay: 0.002 + Math.random() * 0.005,
      };
    };

    for (let i = 0; i < particleCount; i++) {
      particles.push(spawnParticle());
    }

    // Dynamic adjustment of particle count
    const updateParticleCount = (targetCount: number) => {
      if (particles.length < targetCount) {
        const diff = targetCount - particles.length;
        for (let i = 0; i < diff; i++) {
          particles.push(spawnParticle());
        }
      } else if (particles.length > targetCount) {
        particles.splice(targetCount);
      }
    };

    // Vector field calculation (Fluid turbulence flow)
    const getFlowVector = (x: number, y: number, time: number) => {
      const zoom = 0.003;
      const angle = Math.sin(x * zoom + time * 0.0005) * Math.cos(y * zoom - time * 0.0004) * Math.PI * 4;
      return {
        x: Math.cos(angle) * 0.12 * stateRef.current.flowSpeed,
        y: Math.sin(angle) * 0.12 * stateRef.current.flowSpeed
      };
    };

    // Event handlers
    const handleResize = () => {
      const prevW = w, prevH = h;
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;

      // Redistribute elements relative to screen size
      for (const p of particles) {
        p.x = (p.x / prevW) * w;
        p.y = (p.y / prevH) * h;
      }
      for (const n of gravityNodes) {
        n.x = (n.x / prevW) * w;
        n.y = (n.y / prevH) * h;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.vx = mouse.x - mouse.px;
      mouse.vy = mouse.y - mouse.py;
      mouse.px = mouse.x;
      mouse.py = mouse.y;

      // Synthesizer ambient modulation
      if (audioCtxRef.current && stateRef.current.audioEnabled && Math.random() < 0.05) {
        const vel = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
        if (vel > 3) {
          const panValue = (mouse.x / w) * 2 - 1;
          const noteIndex = Math.floor((1 - (mouse.y / h)) * NOTES.length);
          const baseNote = NOTES[Math.min(NOTES.length - 1, Math.max(0, noteIndex))];
          playSynthesizerNote(baseNote, 1.2, panValue);
        }
      }
    };

    const handleMouseDown = () => {
      mouse.down = true;
    };

    const handleMouseUp = (e: MouseEvent) => {
      mouse.down = false;
      // Spawn node on click if we click outside active HTML components
      const target = e.target as HTMLElement;
      if (target.closest(".interactive-hud") || target.closest(".back-btn-container")) return;

      // Limit max active gravity nodes to 6
      if (gravityNodes.length >= 6) {
        const oldestNode = gravityNodes.shift();
        if (oldestNode) {
          soundRipples.push({
            x: oldestNode.x,
            y: oldestNode.y,
            radius: 0,
            maxRadius: 100,
            alpha: 0.4,
            hue: 0
          });
        }
      }
      createNode(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        mouse.x = touch.clientX;
        mouse.y = touch.clientY;
        mouse.vx = mouse.x - mouse.px;
        mouse.vy = mouse.y - mouse.py;
        mouse.px = mouse.x;
        mouse.py = mouse.y;
      }
    };

    // Bind listeners
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    // Render loop variables
    let frameId: number;
    let time = 0;

    const render = () => {
      time = performance.now();
      
      // Update config parameters dynamically
      updateParticleCount(particleCount);

      // Canvas background trail clear
      ctx.fillStyle = `rgba(3, 3, 3, ${stateRef.current.trailLength})`;
      ctx.fillRect(0, 0, w, h);

      // Draw Grid System lines in background (futuristic schematic style)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.007)";
      ctx.lineWidth = 0.5;
      const gridSize = 80;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // ── Draw Gravity Nodes / Black Hole Wells ──
      for (const n of gravityNodes) {
        n.pulse += 0.02;
        const pulseRadius = n.radius + Math.sin(n.pulse * 2.5) * 2;
        
        // Halo Ring
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.shadowBlur = 30;
        ctx.shadowColor = `hsla(${n.hue}, 90%, 60%, 0.3)`;
        
        // Volumetric Glow
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.maxRadius);
        grad.addColorStop(0, `hsla(${n.hue}, 90%, 65%, 0.15)`);
        grad.addColorStop(0.3, `hsla(${n.hue}, 95%, 55%, 0.04)`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.maxRadius, 0, Math.PI * 2);
        ctx.fill();

        // Core Ring
        ctx.strokeStyle = `hsla(${n.hue}, 90%, 75%, 0.4)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, pulseRadius + 6, 0, Math.PI * 2);
        ctx.stroke();

        // Absolute Inner Core
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(n.x, n.y, pulseRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ── Draw ripples ──
      for (let i = soundRipples.length - 1; i >= 0; i--) {
        const r = soundRipples[i];
        r.radius += 2.2;
        r.alpha -= 0.008;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          soundRipples.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = `hsla(${r.hue}, 95%, 65%, ${r.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // ── Update & Draw Particles (Fast single-loop) ──
      ctx.save();
      // Use standard source-over or lighter depending on performance. Volumetric glow works best with lighter:
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Fluid Ambient Flow
        const flow = getFlowVector(p.x, p.y, time);
        p.vx += flow.x;
        p.vy += flow.y;

        // 2. Gravitational Node Pull (Orbital Accretion Physics)
        for (const n of gravityNodes) {
          const dx = n.x - p.x;
          const dy = n.y - p.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);

          if (dist < n.maxRadius * 2.5 && dist > 2) {
            const pullForce = (n.mass / distSq) * stateRef.current.gravityStrength * 0.55;
            
            // Radial gravity pull towards center
            p.vx += (dx / dist) * pullForce;
            p.vy += (dy / dist) * pullForce;

            // Tangential orbit vector forces (gives circular orbit feel)
            const tx = -dy / dist;
            const ty = dx / dist;
            const orbitMultiplier = Math.min(1.2, 80 / dist); // Stronger orbit spin closer in
            p.vx += tx * pullForce * orbitMultiplier * 0.9;
            p.vy += ty * pullForce * orbitMultiplier * 0.9;

            // Shift particle color towards node color when very close
            if (dist < n.maxRadius) {
              p.hue = p.hue * 0.95 + n.hue * 0.05;
              p.size = p.baseSize * (1 + (n.maxRadius - dist) / n.maxRadius);
            }
          }
        }

        // 3. Mouse Interaction Forces
        const mdx = mouse.x - p.x;
        const mdy = mouse.y - p.y;
        const mdistSq = mdx * mdx + mdy * mdy;
        if (mdistSq < 15000 && mdistSq > 10) {
          const mdist = Math.sqrt(mdistSq);
          const force = (1 - mdist / 122);
          
          if (mouse.down) {
            // Push particles away aggressively (Implosion/Explosion blast)
            p.vx -= (mdx / mdist) * force * 1.5;
            p.vy -= (mdy / mdist) * force * 1.5;
          } else {
            // Draw particles into mouse sweep vortex
            p.vx += mouse.vx * force * 0.12;
            p.vy += mouse.vy * force * 0.12;
          }
        }

        // Apply friction drag
        p.vx *= 0.945;
        p.vy *= 0.945;

        // Apply velocities
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around screen boundaries smoothly
        if (p.x < 0) { p.x = w; p.vx *= -0.2; }
        if (p.x > w) { p.x = 0; p.vx *= -0.2; }
        if (p.y < 0) { p.y = h; p.vy *= -0.2; }
        if (p.y > h) { p.y = 0; p.vy *= -0.2; }

        // Velocity dictates brightness & size
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const drawSize = Math.max(0.4, p.size + speed * 0.15);
        const alpha = Math.min(1.0, p.alpha + speed * 0.08);

        // Draw particle
        ctx.fillStyle = `hsla(${p.hue}, 95%, ${Math.min(95, p.brightness + speed * 8)}%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, drawSize, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Trigger automatic node ripple pulses occasionally
      if (Math.random() < 0.015 && gravityNodes.length > 0) {
        const node = gravityNodes[Math.floor(Math.random() * gravityNodes.length)];
        soundRipples.push({
          x: node.x,
          y: node.y,
          radius: 10,
          maxRadius: node.maxRadius * 3,
          alpha: 0.5,
          hue: node.hue
        });

        // Trigger procedural tone when ripple fires
        if (audioCtxRef.current && stateRef.current.audioEnabled) {
          const panValue = (node.x / w) * 2 - 1;
          const noteIndex = Math.floor((1 - (node.y / h)) * NOTES.length);
          const pitch = NOTES[Math.min(NOTES.length - 1, Math.max(0, noteIndex))];
          playSynthesizerNote(pitch, 3.0, panValue);
        }
      }

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      
      // Close audio context on cleanup if not already closed
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, [particleCount]);

  // Audio wave visualizer loop inside HUD
  const visualizerCanvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let animId: number;
    const vCanvas = visualizerCanvasRef.current;
    if (!vCanvas) return;
    const vCtx = vCanvas.getContext("2d");
    if (!vCtx) return;

    const dataArray = new Uint8Array(32);
    const drawVisualizer = () => {
      animId = requestAnimationFrame(drawVisualizer);
      vCtx.clearRect(0, 0, vCanvas.width, vCanvas.height);

      if (!analyserRef.current || !audioEnabled) {
        // Draw flat line
        vCtx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        vCtx.lineWidth = 2;
        vCtx.beginPath();
        vCtx.moveTo(0, vCanvas.height / 2);
        vCtx.lineTo(vCanvas.width, vCanvas.height / 2);
        vCtx.stroke();
        return;
      }

      analyserRef.current.getByteTimeDomainData(dataArray);

      vCtx.strokeStyle = "rgba(100, 180, 255, 0.85)";
      vCtx.lineWidth = 2.5;
      vCtx.beginPath();

      const sliceWidth = vCanvas.width / 32;
      let x = 0;

      for (let i = 0; i < 32; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * vCanvas.height) / 2;

        if (i === 0) {
          vCtx.moveTo(x, y);
        } else {
          vCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      vCtx.lineTo(vCanvas.width, vCanvas.height / 2);
      vCtx.stroke();
    };

    drawVisualizer();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [audioEnabled]);

  return (
    <div className="relative w-full h-screen bg-[#030303] overflow-hidden cursor-crosshair font-sans select-none text-neutral-200">
      {/* HTML5 Dynamic Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Atmospheric Blur Overlay */}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />

      {/* ─── HUD Interface Layout ─── */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between pointer-events-none p-6 md:p-8">
        
        {/* TOP BAR */}
        <header className="flex items-start justify-between w-full">
          <div className="back-btn-container pointer-events-auto">
            <Link href="/">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.07] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300 shadow-2xl"
              >
                <ArrowLeft className="w-4 h-4 text-neutral-400" />
                <span className="text-[11px] text-neutral-400 font-semibold tracking-wider uppercase">
                  Archive
                </span>
              </motion.div>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.07] pointer-events-auto shadow-2xl"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] text-neutral-300 font-mono tracking-widest uppercase">
              EXP-45: Chroma Resonance
            </span>
          </motion.div>
        </header>

        {/* CENTER COMPOSITION HELP */}
        <div className="flex-1 flex flex-col items-center justify-center pointer-events-none max-w-md mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="p-6 rounded-3xl bg-[#080808]/40 backdrop-blur-md border border-white/[0.04] shadow-3xl pointer-events-auto"
          >
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2 bg-gradient-to-r from-cyan-300 via-indigo-300 to-pink-300 bg-clip-text text-transparent">
              Chroma Resonance
            </h1>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              Click anywhere on the screen to spawn a **Resonant Gravity Node**. Drag the cursor to brush waves of glowing fluid particles, modulating and composing ambient harmony.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={toggleAudio}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 shadow-md ${
                  audioEnabled
                    ? "bg-indigo-600 text-white shadow-indigo-500/20"
                    : "bg-white text-black hover:bg-neutral-200"
                }`}
              >
                {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                {audioEnabled ? "Synth Active" : "Activate Synthesizer"}
              </button>
            </div>
          </motion.div>
        </div>

        {/* BOTTOM HUD CONTROLS */}
        <footer className="w-full max-w-5xl mx-auto interactive-hud pointer-events-auto mt-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel p-5 sm:p-6 rounded-[2rem] border border-white/[0.06] bg-[#07070a]/60 backdrop-blur-2xl shadow-3xl flex flex-col md:flex-row items-center justify-between gap-6"
          >
            
            {/* Column 1: Synth Settings & Scope */}
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
              {/* Audio Wave Visualizer */}
              <div className="flex flex-col items-center gap-2">
                <canvas
                  ref={visualizerCanvasRef}
                  width={140}
                  height={45}
                  className="rounded-xl border border-white/5 bg-black/40"
                />
                <span className="text-[9px] text-neutral-500 font-mono tracking-wider uppercase flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-cyan-400 animate-pulse" /> Oscilloscope Scope
                </span>
              </div>

              {/* Synth Select Buttons */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] text-neutral-400 font-bold tracking-widest uppercase">Synth Engine</span>
                <div className="flex gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
                  {(["sine", "triangle", "sawtooth"] as const).map((type) => (
                    <button
                      key={type}
                      disabled={!audioEnabled}
                      onClick={() => setActiveSynth(type)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all duration-300 ${
                        !audioEnabled ? "opacity-30 cursor-not-allowed" : ""
                      } ${
                        activeSynth === type
                          ? "bg-white text-black shadow-lg"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: Parameters Grid Slider */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 w-full md:w-auto flex-grow max-w-lg">
              
              {/* Particle Count Parameter */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400 uppercase">
                  <span>Fluid Particles</span>
                  <span className="font-mono text-cyan-400">{particleCount}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="12000"
                  step="500"
                  value={particleCount}
                  onChange={(e) => setParticleCount(Number(e.target.value))}
                  className="h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-cyan-400 border border-white/5"
                />
              </div>

              {/* Gravity Strength Parameter */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400 uppercase">
                  <span>Gravity Pull</span>
                  <span className="font-mono text-indigo-400">{gravityStrength.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={gravityStrength}
                  onChange={(e) => setGravityStrength(Number(e.target.value))}
                  className="h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-indigo-400 border border-white/5"
                />
              </div>

              {/* Glow Trail Duration Parameter */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400 uppercase">
                  <span>Glow Decay</span>
                  <span className="font-mono text-pink-400">{Math.round((1 - trailLength) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="0.4"
                  step="0.01"
                  value={trailLength}
                  onChange={(e) => setTrailLength(Number(e.target.value))}
                  className="h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-pink-400 border border-white/5"
                />
              </div>

            </div>

            {/* Column 3: Stats HUD */}
            <div className="flex items-center gap-4 bg-black/40 py-3.5 px-5 rounded-2xl border border-white/5 w-full md:w-auto justify-around">
              <div className="flex flex-col items-center gap-1">
                <Disc className="w-4 h-4 text-cyan-400" />
                <span className="text-[8px] font-mono text-neutral-500 uppercase">Gravity Wells</span>
                <span className="text-xs font-mono font-bold text-neutral-200">{nodeCount} / 6</span>
              </div>
              
              <div className="w-px h-8 bg-white/10" />

              <div className="flex flex-col items-center gap-1">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span className="text-[8px] font-mono text-neutral-500 uppercase">Vector Flow</span>
                <span className="text-xs font-mono font-bold text-neutral-200">{flowSpeed.toFixed(1)}x</span>
              </div>

              <div className="w-px h-8 bg-white/10" />

              <button
                onClick={() => {
                  setParticleCount(6000);
                  setGravityStrength(1.2);
                  setTrailLength(0.08);
                  setFlowSpeed(1.0);
                }}
                title="Reset simulation parameters to default"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 hover:text-white transition-all duration-300 text-neutral-400 border border-white/5"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

          </motion.div>
        </footer>

      </div>
    </div>
  );
}
