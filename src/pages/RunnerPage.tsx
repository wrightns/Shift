import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { PracticePlan, Segment } from "../types";
import { loadPlans } from "../lib/storage";
import { flattenBlocks, SEGMENT_KIND_COLOR, SEGMENT_KIND_ICON, SEGMENT_KIND_LABEL, SEGMENT_KIND_SOFT } from "../lib/blocks";
import { formatClock } from "../lib/time";
import { playPracticeComplete, playSegmentAlarm, playTick, primeAudio } from "../lib/sound";
import { ProgressRing } from "../components/ProgressRing";

interface WakeLockSentinelLike {
  release: () => Promise<void>;
}
type NavigatorWithWakeLock = Navigator & {
  wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinelLike> };
};

export function RunnerPage() {
  const { planId } = useParams();
  const [plan, setPlan] = useState<PracticePlan | null | undefined>(undefined);
  const [scheduleOpen, setScheduleOpen] = useState(true);

  useEffect(() => {
    const plans = loadPlans();
    setPlan(plans.find((p) => p.id === planId) ?? null);
  }, [planId]);

  const segments = useMemo<Segment[]>(() => (plan ? flattenBlocks(plan.blocks) : []), [plan]);

  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [muted, setMuted] = useState(false);

  const lastTickRef = useRef<number | null>(null);
  const wakeLockRef = useRef<WakeLockSentinelLike | null>(null);

  // Reset the runner whenever the plan (and thus its segments) changes.
  useEffect(() => {
    setIndex(0);
    setRunning(false);
    setEndAt(null);
    setCompleted(false);
    setRemaining(segments[0]?.seconds ?? 0);
    lastTickRef.current = null;
  }, [segments]);

  async function requestWakeLock() {
    try {
      const nav = navigator as NavigatorWithWakeLock;
      if (nav.wakeLock) {
        wakeLockRef.current = await nav.wakeLock.request("screen");
      }
    } catch {
      // Wake lock isn't critical to functioning; ignore if unsupported/denied.
    }
  }

  function releaseWakeLock() {
    wakeLockRef.current?.release().catch(() => undefined);
    wakeLockRef.current = null;
  }

  useEffect(() => () => releaseWakeLock(), []);

  const advanceRef = useRef<() => void>(() => undefined);
  useEffect(() => {
    advanceRef.current = () => {
      if (!muted) playSegmentAlarm();
      setIndex((i) => {
        const nextIndex = i + 1;
        if (nextIndex >= segments.length) {
          setRunning(false);
          setEndAt(null);
          setCompleted(true);
          setRemaining(0);
          releaseWakeLock();
          if (!muted) setTimeout(() => playPracticeComplete(), 250);
          return i;
        }
        const secs = segments[nextIndex].seconds;
        setRemaining(secs);
        setEndAt(Date.now() + secs * 1000);
        lastTickRef.current = null;
        return nextIndex;
      });
    };
  }, [segments, muted]);

  useEffect(() => {
    if (!running || endAt == null) return;
    const id = window.setInterval(() => {
      const rem = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setRemaining(rem);
      if (rem <= 3 && rem > 0) {
        if (lastTickRef.current !== rem) {
          lastTickRef.current = rem;
          if (!muted) playTick();
        }
      }
      if (rem <= 0) {
        window.clearInterval(id);
        advanceRef.current();
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [running, endAt, muted]);

  function goToSegment(i: number, keepRunning: boolean) {
    if (i < 0 || i >= segments.length) return;
    setIndex(i);
    const secs = segments[i].seconds;
    setRemaining(secs);
    lastTickRef.current = null;
    setCompleted(false);
    if (keepRunning) {
      setEndAt(Date.now() + secs * 1000);
      setRunning(true);
    } else {
      setEndAt(null);
      setRunning(false);
    }
  }

  function start() {
    if (segments.length === 0) return;
    primeAudio();
    requestWakeLock();
    const secs = remaining > 0 ? remaining : segments[index]?.seconds ?? 0;
    setRemaining(secs);
    setEndAt(Date.now() + secs * 1000);
    setRunning(true);
    setCompleted(false);
  }

  function pause() {
    if (endAt != null) {
      setRemaining(Math.max(0, Math.ceil((endAt - Date.now()) / 1000)));
    }
    setEndAt(null);
    setRunning(false);
    releaseWakeLock();
  }

  function skipNext() {
    if (index >= segments.length - 1) {
      setRunning(false);
      setEndAt(null);
      setCompleted(true);
      setRemaining(0);
      releaseWakeLock();
      return;
    }
    goToSegment(index + 1, running);
  }

  function skipPrev() {
    goToSegment(Math.max(0, index - 1), running);
  }

  function restartSegment() {
    goToSegment(index, running);
  }

  function restartPractice() {
    setRunning(false);
    setEndAt(null);
    setCompleted(false);
    setIndex(0);
    setRemaining(segments[0]?.seconds ?? 0);
    lastTickRef.current = null;
    releaseWakeLock();
  }

  if (plan === undefined) return null;
  if (plan === null) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center text-slate-500">
        Plan not found.{" "}
        <Link to="/plans" className="text-teal-600 underline">
          Back to plans
        </Link>
      </div>
    );
  }

  if (segments.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center text-slate-500">
        <p className="mb-3">This plan has no timed blocks yet.</p>
        <Link to={`/plans/${plan.id}`} className="text-teal-600 underline">
          Add some blocks
        </Link>
      </div>
    );
  }

  const current = segments[index];
  const soft = SEGMENT_KIND_SOFT[current.kind];
  const totalSeconds = segments.reduce((s, seg) => s + seg.seconds, 0);
  const elapsedBefore = segments.slice(0, index).reduce((s, seg) => s + seg.seconds, 0);
  const elapsedInCurrent = Math.max(0, current.seconds - remaining);
  const elapsedTotal = completed ? totalSeconds : elapsedBefore + elapsedInCurrent;
  const overallProgress = totalSeconds === 0 ? 1 : elapsedTotal / totalSeconds;
  const segmentProgress = current.seconds === 0 ? 1 : 1 - remaining / current.seconds;
  const next = segments[index + 1];
  const urgent = running && remaining <= 3 && remaining > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-8">
      <div className="flex items-center justify-between mb-4">
        <Link to="/plans" className="btn btn-ghost !px-2">
          ← Back
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700 hidden sm:inline">{plan.name}</span>
          <button onClick={() => setMuted((m) => !m)} className="btn btn-secondary !py-1.5 !px-3 text-xs">
            {muted ? "🔇 Muted" : "🔊 Sound"}
          </button>
        </div>
      </div>

      {/* Overall progress */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium">
          <span>Overall progress</span>
          <span className="tabular-nums">
            {formatClock(elapsedTotal)} / {formatClock(totalSeconds)}
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${Math.min(100, overallProgress * 100)}%` }}
          />
        </div>
      </div>

      {completed ? (
        <div className="text-center bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-10 mb-6 animate-in">
          <p className="text-5xl mb-3">🎉</p>
          <h2 className="font-display text-2xl font-bold text-emerald-800 mb-1">Practice Complete!</h2>
          <p className="text-emerald-700 text-sm mb-5">Total time: {formatClock(totalSeconds)}</p>
          <button onClick={restartPractice} className="btn btn-primary btn-lg">
            ↻ Restart Practice
          </button>
        </div>
      ) : (
        <div className={`rounded-2xl p-6 sm:p-8 mb-6 text-center shadow-sm border ${soft.bg} border-white/60 animate-in`}>
          {current.breadcrumb.length > 0 && <p className="text-xs text-slate-500 mb-1">{current.breadcrumb.join(" › ")}</p>}
          <span className={`chip ${soft.text} bg-white/70 mb-3`}>
            {SEGMENT_KIND_ICON[current.kind]} {SEGMENT_KIND_LABEL[current.kind]}
          </span>
          <h2 className="font-display text-2xl font-bold text-slate-900 mb-5">{current.label}</h2>

          <ProgressRing
            progress={segmentProgress}
            size={220}
            strokeWidth={12}
            trackColor="rgba(255,255,255,0.7)"
            progressColor={urgent ? "#f43f5e" : "#0d9488"}
            className={urgent ? "pulse-warn" : ""}
          >
            <span className={`font-display text-6xl font-bold tabular-nums ${urgent ? "text-rose-600" : "text-slate-900"}`}>
              {formatClock(remaining)}
            </span>
          </ProgressRing>

          <div className="flex items-center justify-center gap-2 flex-wrap mt-6">
            <button onClick={skipPrev} disabled={index === 0} className="btn btn-secondary btn-icon" aria-label="Previous segment" title="Previous segment">
              ⏮
            </button>
            <button onClick={restartSegment} className="btn btn-secondary" title="Restart this segment">
              ⟲ Restart
            </button>
            {running ? (
              <button onClick={pause} className="btn btn-warn btn-lg">
                ⏸ Pause
              </button>
            ) : (
              <button onClick={start} className="btn btn-primary btn-lg">
                ▶ {index === 0 && remaining === current.seconds ? "Start Practice" : "Resume"}
              </button>
            )}
            <button onClick={skipNext} className="btn btn-secondary" title="Skip to next segment">
              Next ⏭
            </button>
          </div>

          {next && <p className="text-xs text-slate-500 mt-4">Up next: {next.label}</p>}
        </div>
      )}

      <button
        onClick={() => setScheduleOpen((v) => !v)}
        className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 mb-2 py-1"
      >
        <span>
          Full Schedule <span className="text-slate-400 font-normal">({segments.length} segments)</span>
        </span>
        <span className={`text-slate-400 transition-transform ${scheduleOpen ? "rotate-180" : ""}`} aria-hidden>
          ⌄
        </span>
      </button>
      {scheduleOpen && (
        <ol className="space-y-1 animate-in">
          {segments.map((seg, i) => {
            const isDone = i < index || completed;
            const isCurrent = i === index && !completed;
            return (
              <li key={seg.id}>
                <button
                  onClick={() => goToSegment(i, running)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors border ${
                    isCurrent
                      ? `${SEGMENT_KIND_SOFT[seg.kind].bg} border-transparent ring-1 ${SEGMENT_KIND_SOFT[seg.kind].ring}`
                      : isDone
                        ? "text-slate-400 border-transparent hover:bg-slate-50"
                        : "hover:bg-slate-50 border-transparent"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${SEGMENT_KIND_COLOR[seg.kind]} ${isDone ? "opacity-40" : ""}`} />
                  <span className="flex-1 min-w-0 truncate">
                    {seg.breadcrumb.length > 0 ? `${seg.breadcrumb.join(" › ")} — ` : ""}
                    {seg.label}
                  </span>
                  {isDone && <span aria-hidden>✓</span>}
                  <span className="shrink-0 tabular-nums font-medium">{formatClock(seg.seconds)}</span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
