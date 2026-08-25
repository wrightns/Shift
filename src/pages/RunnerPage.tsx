import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { PracticePlan, Segment } from "../types";
import { loadPlans } from "../lib/storage";
import { flattenBlocks, SEGMENT_KIND_COLOR, SEGMENT_KIND_LABEL } from "../lib/blocks";
import { formatClock } from "../lib/time";
import { playPracticeComplete, playSegmentAlarm, playTick, primeAudio } from "../lib/sound";

interface WakeLockSentinelLike {
  release: () => Promise<void>;
}
type NavigatorWithWakeLock = Navigator & {
  wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinelLike> };
};

export function RunnerPage() {
  const { planId } = useParams();
  const [plan, setPlan] = useState<PracticePlan | null | undefined>(undefined);

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
        Plan not found. <Link to="/plans" className="text-emerald-600 underline">Back to plans</Link>
      </div>
    );
  }

  if (segments.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center text-slate-500">
        <p className="mb-3">This plan has no timed blocks yet.</p>
        <Link to={`/plans/${plan.id}`} className="text-emerald-600 underline">
          Add some blocks
        </Link>
      </div>
    );
  }

  const current = segments[index];
  const totalSeconds = segments.reduce((s, seg) => s + seg.seconds, 0);
  const elapsedBefore = segments.slice(0, index).reduce((s, seg) => s + seg.seconds, 0);
  const elapsedInCurrent = Math.max(0, current.seconds - remaining);
  const elapsedTotal = completed ? totalSeconds : elapsedBefore + elapsedInCurrent;
  const overallProgress = totalSeconds === 0 ? 1 : elapsedTotal / totalSeconds;
  const segmentProgress = current.seconds === 0 ? 1 : 1 - remaining / current.seconds;
  const next = segments[index + 1];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <Link to="/plans" className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to plans
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">{plan.name}</span>
          <button
            onClick={() => setMuted((m) => !m)}
            className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-50"
          >
            {muted ? "🔇 Muted" : "🔊 Sound On"}
          </button>
        </div>
      </div>

      {/* Overall progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Overall progress</span>
          <span>
            {formatClock(elapsedTotal)} / {formatClock(totalSeconds)}
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${Math.min(100, overallProgress * 100)}%` }}
          />
        </div>
      </div>

      {completed ? (
        <div className="text-center bg-emerald-50 border border-emerald-200 rounded-xl p-10 mb-6">
          <p className="text-3xl mb-2">🎉</p>
          <h2 className="text-2xl font-bold text-emerald-800 mb-1">Practice Complete!</h2>
          <p className="text-emerald-700 text-sm mb-4">
            Total time: {formatClock(totalSeconds)}
          </p>
          <button
            onClick={restartPractice}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-semibold hover:bg-emerald-700"
          >
            Restart Practice
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-8 mb-6 text-center shadow-sm">
          {current.breadcrumb.length > 0 && (
            <p className="text-xs text-slate-400 mb-1">{current.breadcrumb.join(" › ")}</p>
          )}
          <span
            className={`inline-block text-[11px] uppercase tracking-wide text-white px-2 py-0.5 rounded-full mb-2 ${SEGMENT_KIND_COLOR[current.kind]}`}
          >
            {SEGMENT_KIND_LABEL[current.kind]}
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{current.label}</h2>
          <div className="text-7xl font-mono font-bold text-slate-900 tabular-nums mb-4">
            {formatClock(remaining)}
          </div>
          <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden max-w-xs mx-auto mb-6">
            <div
              className="h-full bg-sky-500 transition-all duration-200"
              style={{ width: `${Math.min(100, segmentProgress * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={skipPrev}
              disabled={index === 0}
              className="px-3 py-2 rounded-md border border-slate-300 text-sm hover:bg-slate-50 disabled:opacity-30"
            >
              ⏮ Prev
            </button>
            <button
              onClick={restartSegment}
              className="px-3 py-2 rounded-md border border-slate-300 text-sm hover:bg-slate-50"
            >
              ⟲ Restart Segment
            </button>
            {running ? (
              <button
                onClick={pause}
                className="px-6 py-2 rounded-md bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600"
              >
                ⏸ Pause
              </button>
            ) : (
              <button
                onClick={start}
                className="px-6 py-2 rounded-md bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
              >
                ▶ {index === 0 && remaining === current.seconds ? "Start Practice" : "Resume"}
              </button>
            )}
            <button
              onClick={skipNext}
              className="px-3 py-2 rounded-md border border-slate-300 text-sm hover:bg-slate-50"
            >
              Next ⏭
            </button>
          </div>

          {next && <p className="text-xs text-slate-400 mt-4">Up next: {next.label}</p>}
        </div>
      )}

      <h3 className="text-sm font-semibold text-slate-700 mb-2">Full Schedule</h3>
      <ol className="space-y-1">
        {segments.map((seg, i) => (
          <li key={seg.id}>
            <button
              onClick={() => goToSegment(i, running)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md text-left text-sm transition-colors ${
                i === index
                  ? "bg-emerald-50 border border-emerald-300"
                  : i < index || completed
                    ? "text-slate-400"
                    : "hover:bg-slate-50 border border-transparent"
              }`}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${SEGMENT_KIND_COLOR[seg.kind]}`} />
                <span className="truncate">
                  {seg.breadcrumb.length > 0 ? `${seg.breadcrumb.join(" › ")} — ` : ""}
                  {seg.label}
                </span>
              </span>
              <span className="shrink-0 tabular-nums">{formatClock(seg.seconds)}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
