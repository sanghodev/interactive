"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, CircleHelp, MousePointer2, RefreshCw, Volume2, VolumeX, X } from "lucide-react";
import styles from "./page.module.css";

type Palette = {
  name: string;
  label: string;
  colors: [string, string, string];
  rgb: [[number, number, number], [number, number, number], [number, number, number]];
  frequency: number;
};

type Particle = { x: number; y: number; px: number; py: number; speed: number; life: number; maxLife: number; tone: number };
type Ripple = { x: number; y: number; born: number; hue: number };

const PALETTES: Palette[] = [
  {
    name: "AURORA",
    label: "Polar light",
    colors: ["#80ffd3", "#6a7dff", "#ff68c3"],
    rgb: [[128, 255, 211], [106, 125, 255], [255, 104, 195]],
    frequency: 0.00155,
  },
  {
    name: "SOLAR",
    label: "Molten sun",
    colors: ["#fff1a8", "#ff7657", "#ff3b97"],
    rgb: [[255, 241, 168], [255, 118, 87], [255, 59, 151]],
    frequency: 0.0012,
  },
  {
    name: "ABYSS",
    label: "Deep current",
    colors: ["#92e7ff", "#3264ff", "#9a5cff"],
    rgb: [[146, 231, 255], [50, 100, 255], [154, 92, 255]],
    frequency: 0.0019,
  },
];

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export default function LumenField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const paletteRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0, tx: 0, ty: 0, active: false, down: false });
  const ripplesRef = useRef<Ripple[]>([]);
  const resetRef = useRef(0);
  const audioRef = useRef<{
    context: AudioContext;
    master: GainNode;
    oscillators: OscillatorNode[];
    gains: GainNode[];
  } | null>(null);

  const [palette, setPalette] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [intro, setIntro] = useState(true);
  const [coordinates, setCoordinates] = useState("50.0 / 50.0");
  const [energy, setEnergy] = useState(18);

  useEffect(() => {
    paletteRef.current = palette;
  }, [palette]);

  const createRipple = useCallback((x: number, y: number) => {
    ripplesRef.current.push({ x, y, born: performance.now(), hue: Math.random() });
    if (ripplesRef.current.length > 7) ripplesRef.current.shift();

    const audio = audioRef.current;
    if (audio) {
      const now = audio.context.currentTime;
      const ping = audio.context.createOscillator();
      const gain = audio.context.createGain();
      const filter = audio.context.createBiquadFilter();
      ping.type = "sine";
      ping.frequency.setValueAtTime(190 + paletteRef.current * 55, now);
      ping.frequency.exponentialRampToValueAtTime(760 + Math.random() * 360, now + 1.4);
      filter.type = "lowpass";
      filter.frequency.value = 1600;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.09, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.45);
      ping.connect(filter).connect(gain).connect(audio.master);
      ping.start(now);
      ping.stop(now + 1.5);
    }
  }, []);

  const toggleSound = useCallback(async () => {
    if (audioRef.current) {
      const { context, master } = audioRef.current;
      const next = !soundOn;
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.linearRampToValueAtTime(next ? 0.22 : 0.0001, context.currentTime + 0.6);
      if (context.state === "suspended") await context.resume();
      setSoundOn(next);
      return;
    }

    const context = new window.AudioContext();
    const master = context.createGain();
    const filter = context.createBiquadFilter();
    master.gain.value = 0.0001;
    filter.type = "lowpass";
    filter.frequency.value = 820;
    filter.Q.value = 2.2;
    master.connect(filter).connect(context.destination);

    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];
    [55, 82.41, 110.83].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = index === 0 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      oscillator.detune.value = index * 5 - 3;
      gain.gain.value = [0.5, 0.13, 0.07][index];
      oscillator.connect(gain).connect(master);
      oscillator.start();
      oscillators.push(oscillator);
      gains.push(gain);
    });

    audioRef.current = { context, master, oscillators, gains };
    master.gain.linearRampToValueAtTime(0.22, context.currentTime + 1.2);
    setSoundOn(true);
  }, [soundOn]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIntro(false), 2100);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let lastHudUpdate = 0;

    const spawn = (particle?: Particle) => {
      const edge = Math.floor(Math.random() * 4);
      const margin = 30;
      let x = Math.random() * width;
      let y = Math.random() * height;
      if (edge === 0) y = -margin;
      if (edge === 1) x = width + margin;
      if (edge === 2) y = height + margin;
      if (edge === 3) x = -margin;
      const target = particle ?? ({} as Particle);
      target.x = x;
      target.y = y;
      target.px = x;
      target.py = y;
      target.speed = 0.45 + Math.random() * 1.1;
      target.life = 0;
      target.maxLife = 380 + Math.random() * 700;
      target.tone = Math.floor(Math.random() * 3);
      return target;
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.7);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(2200, Math.max(900, Math.floor((width * height) / 620)));
      particles = Array.from({ length: count }, () => spawn());
      pointerRef.current.x = pointerRef.current.tx = width * 0.5;
      pointerRef.current.y = pointerRef.current.ty = height * 0.5;
      context.fillStyle = "#030409";
      context.fillRect(0, 0, width, height);
    };

    const drawAtmosphere = (time: number, activePalette: Palette) => {
      context.globalCompositeOperation = "source-over";
      context.fillStyle = "rgba(3, 4, 9, 0.075)";
      context.fillRect(0, 0, width, height);

      const pointer = pointerRef.current;
      const glowRadius = Math.min(width, height) * (pointer.down ? 0.55 : 0.38);
      const glow = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, glowRadius);
      const [r, g, b] = activePalette.rgb[1];
      glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${pointer.active ? 0.085 : 0.035})`);
      glow.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, 0.018)`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      context.globalCompositeOperation = "lighter";
      context.lineWidth = 0.65;
      context.lineCap = "round";
      const waveTime = time * 0.00016;
      const frequency = activePalette.frequency;
      const centerX = width * (0.5 + Math.sin(time * 0.00007) * 0.09);
      const centerY = height * (0.5 + Math.cos(time * 0.00009) * 0.08);

      for (const particle of particles) {
        particle.px = particle.x;
        particle.py = particle.y;
        const nx = particle.x - centerX;
        const ny = particle.y - centerY;
        const dist = Math.sqrt(nx * nx + ny * ny) + 1;
        const baseAngle =
          Math.sin(particle.x * frequency * 2.2 + waveTime * 4.2) * 1.25 +
          Math.cos(particle.y * frequency * 2.7 - waveTime * 3.1) * 1.05 +
          Math.sin((particle.x + particle.y) * frequency * 0.7 + waveTime) * 0.8;
        let forceX = Math.cos(baseAngle) * particle.speed;
        let forceY = Math.sin(baseAngle) * particle.speed;

        const pdx = particle.x - pointer.x;
        const pdy = particle.y - pointer.y;
        const pointerDist = Math.sqrt(pdx * pdx + pdy * pdy) + 0.1;
        const influence = clamp(1 - pointerDist / (pointer.down ? 420 : 260), 0, 1);
        if (influence > 0 && pointer.active) {
          const pull = pointer.down ? -2.1 : 0.35;
          forceX += (-pdy / pointerDist) * influence * 3.2 + (pdx / pointerDist) * influence * pull;
          forceY += (pdx / pointerDist) * influence * 3.2 + (pdy / pointerDist) * influence * pull;
        }
        forceX += (-ny / dist) * 0.1;
        forceY += (nx / dist) * 0.1;
        particle.x += forceX;
        particle.y += forceY;
        particle.life += 1;

        if (particle.x < -60 || particle.x > width + 60 || particle.y < -60 || particle.y > height + 60 || particle.life > particle.maxLife) {
          spawn(particle);
          continue;
        }

        const alpha = Math.sin(Math.min(1, particle.life / 80) * Math.PI * 0.5) * 0.34;
        const [cr, cg, cb] = activePalette.rgb[particle.tone];
        context.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
        context.beginPath();
        context.moveTo(particle.px, particle.py);
        context.lineTo(particle.x, particle.y);
        context.stroke();
      }

      const now = performance.now();
      ripplesRef.current = ripplesRef.current.filter((ripple) => now - ripple.born < 2600);
      ripplesRef.current.forEach((ripple) => {
        const age = (now - ripple.born) / 2600;
        const radius = age * Math.min(width, height) * 0.72;
        const tone = activePalette.rgb[Math.floor(ripple.hue * 3) % 3];
        context.lineWidth = 1.2 + (1 - age) * 2;
        context.strokeStyle = `rgba(${tone[0]}, ${tone[1]}, ${tone[2]}, ${(1 - age) * 0.22})`;
        context.beginPath();
        context.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
        context.stroke();
      });
    };

    const animate = (time: number) => {
      const pointer = pointerRef.current;
      pointer.x += (pointer.tx - pointer.x) * 0.075;
      pointer.y += (pointer.ty - pointer.y) * 0.075;
      drawAtmosphere(time, PALETTES[paletteRef.current]);
      if (time - lastHudUpdate > 140) {
        const velocity = Math.hypot(pointer.tx - pointer.x, pointer.ty - pointer.y);
        setEnergy(Math.round(clamp(18 + velocity * 2.8 + ripplesRef.current.length * 8, 18, 99)));
        lastHudUpdate = time;
      }
      frameRef.current = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const audio = audioRef.current;
      if (!audio) return;
      const pointer = pointerRef.current;
      const x = pointer.x / Math.max(1, window.innerWidth);
      const y = pointer.y / Math.max(1, window.innerHeight);
      const now = audio.context.currentTime;
      audio.oscillators.forEach((oscillator, index) => {
        const base = [55, 82.41, 110.83][index] * (1 + palette * 0.12);
        oscillator.frequency.setTargetAtTime(base * (0.85 + x * 0.45), now, 0.12);
        audio.gains[index].gain.setTargetAtTime([0.5, 0.13, 0.07][index] * (1.15 - y * 0.45), now, 0.2);
      });
    }, 100);
    return () => window.clearInterval(interval);
  }, [palette]);

  useEffect(() => () => {
    const audio = audioRef.current;
    if (audio) void audio.context.close();
  }, []);

  const updatePointer = (clientX: number, clientY: number) => {
    const pointer = pointerRef.current;
    pointer.tx = clientX;
    pointer.ty = clientY;
    pointer.active = true;
    setCoordinates(`${((clientX / window.innerWidth) * 100).toFixed(1)} / ${((clientY / window.innerHeight) * 100).toFixed(1)}`);
  };

  const current = PALETTES[palette];

  return (
    <main
      className={styles.page}
      style={{ "--c1": current.colors[0], "--c2": current.colors[1], "--c3": current.colors[2] } as React.CSSProperties}
      onPointerMove={(event) => updatePointer(event.clientX, event.clientY)}
      onPointerDown={(event) => {
        pointerRef.current.down = true;
        updatePointer(event.clientX, event.clientY);
        createRipple(event.clientX, event.clientY);
      }}
      onPointerUp={() => { pointerRef.current.down = false; }}
      onPointerLeave={() => { pointerRef.current.active = false; pointerRef.current.down = false; }}
    >
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.noise} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />

      <div className={`${styles.intro} ${intro ? styles.introVisible : ""}`} aria-hidden="true">
        <span>EXPERIMENT 048</span><div className={styles.introLine} /><strong>INITIALIZING LIGHT</strong>
      </div>

      <header className={styles.header}>
        <Link href="/" className={styles.back} aria-label="Back to experiments">
          <ArrowLeft size={17} strokeWidth={1.5} /><span>ARCHIVE / 048</span>
        </Link>
        <div className={styles.headerCenter}><i />LIVE FIELD</div>
        <div className={styles.headerActions}>
          <button onClick={() => setHelpOpen(true)} aria-label="Open instructions"><CircleHelp size={18} strokeWidth={1.4} /></button>
          <button onClick={toggleSound} aria-label={soundOn ? "Mute sound" : "Enable sound"}>
            {soundOn ? <Volume2 size={18} strokeWidth={1.4} /> : <VolumeX size={18} strokeWidth={1.4} />}
          </button>
        </div>
      </header>

      <section className={styles.hero} aria-label="Lumen chromatic field">
        <p className={styles.eyebrow}>AN INTERACTIVE STUDY OF LIGHT &amp; GRAVITY</p>
        <h1 aria-label="Lumen"><span>LU</span><span>MEN</span></h1>
        <div className={styles.orbit} aria-hidden="true"><span /></div>
        <p className={styles.subtitle}>Bend the current. <em>Awaken the spectrum.</em></p>
      </section>

      <aside className={styles.leftRail} aria-label="Field data">
        <span className={styles.railLabel}>FIELD COORDINATES</span><strong>{coordinates}</strong>
        <div className={styles.dataLine} />
        <span className={styles.railLabel}>KINETIC ENERGY</span><strong>{String(energy).padStart(2, "0")}%</strong>
      </aside>

      <aside className={styles.rightRail} aria-label="Color field selection">
        <span className={styles.railLabel}>SPECTRUM</span>
        {PALETTES.map((item, index) => (
          <button key={item.name} className={index === palette ? styles.paletteActive : ""}
            onClick={(event) => { event.stopPropagation(); setPalette(index); createRipple(window.innerWidth * 0.5, window.innerHeight * 0.5); }}
            aria-pressed={index === palette}>
            <span style={{ background: item.colors[0] }} /><b>0{index + 1}</b><em>{item.name}</em>
          </button>
        ))}
      </aside>

      <div className={styles.bottomBar}>
        <div className={styles.gestureHint}><MousePointer2 size={15} /><span>MOVE TO BEND</span><i /><span>PRESS TO PULSE</span></div>
        <div className={styles.modeName}><small>CURRENT STATE</small><strong>{current.label}</strong></div>
        <button className={styles.reset} onClick={(event) => { event.stopPropagation(); ripplesRef.current = []; resetRef.current += 1; createRipple(window.innerWidth * 0.5, window.innerHeight * 0.5); }}>
          <RefreshCw size={14} /> RESET FIELD
        </button>
      </div>

      <div className={`${styles.help} ${helpOpen ? styles.helpOpen : ""}`} role="dialog" aria-modal="true" aria-hidden={!helpOpen}>
        <button className={styles.helpClose} onClick={() => setHelpOpen(false)} aria-label="Close instructions"><X size={20} /></button>
        <span className={styles.helpIndex}>048 / FIELD NOTES</span>
        <h2>LIGHT<br />REMEMBERS<br />YOUR TOUCH.</h2>
        <p>Every line is a living particle moving through a procedural vector field. Your presence curves its path; your touch releases a wave through the entire system.</p>
        <ol>
          <li><b>01</b><span>Move slowly to gather the current.</span></li>
          <li><b>02</b><span>Press and hold to collapse the field.</span></li>
          <li><b>03</b><span>Choose a spectrum to shift its energy.</span></li>
          <li><b>04</b><span>Enable sound to hear the field respond.</span></li>
        </ol>
        <button className={styles.enter} onClick={() => setHelpOpen(false)}>ENTER THE FIELD <span>↗</span></button>
      </div>
      {helpOpen && <button className={styles.helpBackdrop} onClick={() => setHelpOpen(false)} aria-label="Close instructions" />}
    </main>
  );
}
