"use client";

import Link from "next/link";
import { ArrowLeft, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

type QuantumMode = "superposition" | "interference" | "entanglement";

const MODES: Array<{
  id: QuantumMode;
  label: string;
  number: string;
  title: string;
  description: string;
}> = [
  {
    id: "superposition",
    label: "중첩",
    number: "01",
    title: "하나이면서, 동시에 여럿.",
    description: "관측되기 전의 장면은 서로 다른 가능성으로 함께 존재합니다.",
  },
  {
    id: "interference",
    label: "간섭",
    number: "02",
    title: "가능성이 서로를 그린다.",
    description: "두 상태가 포개지며 밝고 어두운 리듬을 만들어냅니다.",
  },
  {
    id: "entanglement",
    label: "얽힘",
    number: "03",
    title: "멀리 있어도, 하나처럼.",
    description: "떨어진 두 장면은 같은 순간과 움직임을 공유합니다.",
  },
];

export default function PastelProbabilityPage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const collapseTimerRef = useRef<number | null>(null);
  const [mode, setMode] = useState<QuantumMode>("superposition");
  const [collapsed, setCollapsed] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [observations, setObservations] = useState(0);

  const syncVideos = useCallback(() => {
    const videos = videoRefs.current.filter((video): video is HTMLVideoElement => Boolean(video));
    const source = videos[0];
    if (!source) return;
    videos.slice(1).forEach((video) => {
      if (Math.abs(video.currentTime - source.currentTime) > 0.08) {
        video.currentTime = source.currentTime;
      }
    });
  }, []);

  useEffect(() => {
    syncVideos();
  }, [mode, syncVideos]);

  useEffect(() => {
    return () => {
      if (collapseTimerRef.current) window.clearTimeout(collapseTimerRef.current);
    };
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    const moveX = (x - 0.5) * 58;
    const moveY = (y - 0.5) * 34;

    event.currentTarget.style.setProperty("--pointer-x", `${x * 100}%`);
    event.currentTarget.style.setProperty("--pointer-y", `${y * 100}%`);
    event.currentTarget.style.setProperty("--move-x", `${moveX}px`);
    event.currentTarget.style.setProperty("--move-y", `${moveY}px`);
    event.currentTarget.style.setProperty("--move-x-negative", `${-moveX}px`);
    event.currentTarget.style.setProperty("--move-y-negative", `${-moveY}px`);
    event.currentTarget.style.setProperty("--move-x-soft", `${moveX * 0.18}px`);
    event.currentTarget.style.setProperty("--move-y-soft", `${moveY * 0.18}px`);
    event.currentTarget.style.setProperty("--move-x-soft-negative", `${moveX * -0.18}px`);
    event.currentTarget.style.setProperty("--move-y-soft-negative", `${moveY * -0.18}px`);
  };

  const resetPointer = () => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.setProperty("--pointer-x", "50%");
    stage.style.setProperty("--pointer-y", "50%");
    stage.style.setProperty("--move-x", "0px");
    stage.style.setProperty("--move-y", "0px");
    stage.style.setProperty("--move-x-negative", "0px");
    stage.style.setProperty("--move-y-negative", "0px");
    stage.style.setProperty("--move-x-soft", "0px");
    stage.style.setProperty("--move-y-soft", "0px");
    stage.style.setProperty("--move-x-soft-negative", "0px");
    stage.style.setProperty("--move-y-soft-negative", "0px");
  };

  const observe = () => {
    syncVideos();
    setCollapsed(true);
    setObservations((value) => value + 1);
    if (collapseTimerRef.current) window.clearTimeout(collapseTimerRef.current);
    collapseTimerRef.current = window.setTimeout(() => setCollapsed(false), 1300);
  };

  const togglePlayback = () => {
    const next = !playing;
    videoRefs.current.forEach((video) => {
      if (!video) return;
      if (next) void video.play().catch(() => undefined);
      else video.pause();
    });
    setPlaying(next);
  };

  const activeMode = MODES.find((item) => item.id === mode) ?? MODES[0];

  return (
    <main className={styles.page} data-mode={mode} data-collapsed={collapsed}>
      <div className={styles.ambient} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <header className={styles.header}>
        <Link href="/" className={styles.backLink} aria-label="실험 아카이브로 돌아가기">
          <ArrowLeft size={16} strokeWidth={1.5} />
          <span>Archive</span>
        </Link>
        <p className={styles.experimentNumber}>Experiment 049</p>
        <button
          type="button"
          className={styles.playButton}
          onClick={togglePlayback}
          aria-label={playing ? "영상 일시정지" : "영상 재생"}
        >
          {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
          <span>{playing ? "Pause" : "Play"}</span>
        </button>
      </header>

      <section className={styles.intro} aria-labelledby="quantum-title">
        <p className={styles.kicker}>Pastel probability · Quantum film study</p>
        <h1 id="quantum-title">
          하나의 순간,
          <br />
          <em>여러 개의 가능성.</em>
        </h1>
        <p className={styles.introText}>
          영상을 움직여 가능성을 펼치고,
          <br />
          클릭해 하나의 현실로 관측해보세요.
        </p>
      </section>

      <section className={styles.visualSection} aria-label="양자 상태 영상 실험">
        <div
          ref={stageRef}
          className={styles.stage}
          role="button"
          tabIndex={0}
          aria-label="양자 상태 관측하기"
          onPointerMove={handlePointerMove}
          onPointerLeave={resetPointer}
          onClick={observe}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              observe();
            }
          }}
        >
          <div className={`${styles.videoLayer} ${styles.stateA}`}>
            <video
              ref={(node) => { videoRefs.current[0] = node; }}
              src="/video_13.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
          </div>
          <div className={`${styles.videoLayer} ${styles.stateB}`}>
            <video
              ref={(node) => { videoRefs.current[1] = node; }}
              src="/video_13.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
          </div>
          <div className={`${styles.videoLayer} ${styles.stateMain}`}>
            <video
              ref={(node) => { videoRefs.current[2] = node; }}
              src="/video_13.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
          </div>

          <div className={styles.orbit} aria-hidden="true" />
          <div className={styles.observer} aria-hidden="true">
            <span />
          </div>
          <p className={styles.observeHint}>{collapsed ? "관측됨" : "Click to observe"}</p>
        </div>

        <div className={styles.modeCopy} aria-live="polite">
          <p>{activeMode.title}</p>
          <span>{activeMode.description}</span>
        </div>
      </section>

      <footer className={styles.controls}>
        <div className={styles.modePicker} role="tablist" aria-label="양자 현상 선택">
          {MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={mode === item.id}
              className={mode === item.id ? styles.activeMode : ""}
              onClick={() => {
                setMode(item.id);
                setCollapsed(false);
              }}
            >
              <span>{item.number}</span>
              {item.label}
            </button>
          ))}
        </div>
        <p className={styles.observationCount}>
          관측 <span>{observations.toString().padStart(2, "0")}</span>
        </p>
      </footer>
    </main>
  );
}
