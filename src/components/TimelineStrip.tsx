import type { Block } from "../types";
import { flattenBlocks, SEGMENT_KIND_COLOR } from "../lib/blocks";
import { formatMinutesLabel } from "../lib/time";

export function TimelineStrip({ blocks, targetMinutes }: { blocks: Block[]; targetMinutes: number }) {
  const segments = flattenBlocks(blocks);
  const totalSeconds = segments.reduce((s, seg) => s + seg.seconds, 0);
  const targetSeconds = targetMinutes * 60;
  const scale = Math.max(totalSeconds, targetSeconds, 1);
  const targetPct = Math.min(100, (targetSeconds / scale) * 100);

  if (segments.length === 0) {
    return <div className="h-3.5 rounded-full bg-slate-100 border border-dashed border-slate-200" />;
  }

  return (
    <div className="relative h-3.5">
      <div className="absolute inset-0 rounded-full overflow-hidden flex bg-slate-100 ring-1 ring-slate-200/70">
        {segments.map((seg) => (
          <div
            key={seg.id}
            title={`${seg.label} — ${formatMinutesLabel(seg.seconds / 60)}`}
            className={`${SEGMENT_KIND_COLOR[seg.kind]} h-full`}
            style={{ width: `${(seg.seconds / scale) * 100}%` }}
          />
        ))}
      </div>
      {targetSeconds > 0 && targetSeconds < scale && (
        <div
          className="absolute top-[-3px] bottom-[-3px] w-0.5 bg-slate-800/70 rounded-full"
          style={{ left: `${targetPct}%` }}
          title={`Target: ${formatMinutesLabel(targetMinutes)}`}
        />
      )}
    </div>
  );
}
