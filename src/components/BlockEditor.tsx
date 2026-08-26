import type { Block, Drill, SegmentKind } from "../types";
import {
  blockDurationSeconds,
  newGroupBlock,
  newIntervalBlock,
  newSingleBlock,
  SEGMENT_KIND_ICON,
  SEGMENT_KIND_LABEL,
} from "../lib/blocks";
import { formatMinutesLabel } from "../lib/time";

const KIND_OPTIONS: SegmentKind[] = ["warmup", "drill", "game", "talk", "break", "transition", "other"];

interface BlockEditorProps {
  blocks: Block[];
  drills: Drill[];
  depth: number;
  expanded: Set<string>;
  onToggleExpand: (id: string) => void;
  onUpdate: (id: string, updater: (b: Block) => Block) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onAddChild: (groupId: string, block: Block) => void;
}

function blockIcon(block: Block): string {
  if (block.type === "single") return SEGMENT_KIND_ICON[block.kind];
  if (block.type === "interval") return "🔁";
  return "🗂️";
}

function blockSummary(block: Block): string {
  if (block.type === "single") return SEGMENT_KIND_LABEL[block.kind];
  if (block.type === "interval") {
    const reps = Math.floor((block.totalMinutes * 60) / (block.workSeconds + block.breakSeconds || 1));
    return `${reps} reps · ${block.workSeconds}s / ${block.breakSeconds}s`;
  }
  return `${block.children.length} step${block.children.length === 1 ? "" : "s"}`;
}

export function BlockEditor({
  blocks,
  drills,
  depth,
  expanded,
  onToggleExpand,
  onUpdate,
  onRemove,
  onMove,
  onAddChild,
}: BlockEditorProps) {
  return (
    <div className="space-y-3">
      {blocks.map((block, idx) => {
        const isOpen = expanded.has(block.id);
        return (
          <div
            key={block.id}
            className="card overflow-hidden animate-in"
            style={{ marginLeft: depth * 20 }}
          >
            <button
              type="button"
              onClick={() => onToggleExpand(block.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-2/80 transition-colors"
            >
              <span className="text-lg shrink-0" aria-hidden>
                {blockIcon(block)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-ink truncate">{block.name || "Untitled block"}</span>
                  <span className="text-[10px] uppercase tracking-wide font-bold text-ink-faint shrink-0">
                    {block.type === "single" ? "" : block.type === "interval" ? "Interval" : "Group"}
                  </span>
                </span>
                <span className="block text-xs text-ink-dim truncate">{blockSummary(block)}</span>
              </span>
              <span className="text-sm font-semibold text-ink-dim tabular-nums shrink-0">
                {formatMinutesLabel(blockDurationSeconds(block) / 60)}
              </span>
              <span className={`text-ink-faint transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`} aria-hidden>
                ⌄
              </span>
            </button>

            <div className="flex items-center gap-1 px-4 pb-2 -mt-1">
              <IconButton label="Move up" onClick={() => onMove(block.id, -1)} disabled={idx === 0}>
                ↑
              </IconButton>
              <IconButton label="Move down" onClick={() => onMove(block.id, 1)} disabled={idx === blocks.length - 1}>
                ↓
              </IconButton>
              <IconButton label="Delete" onClick={() => onRemove(block.id)} danger>
                🗑
              </IconButton>
            </div>

            {isOpen && (
              <div className="px-4 pb-4 pt-1 border-t border-border animate-in">
                {block.type === "single" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                    <label className="text-xs font-semibold text-ink-dim sm:col-span-2">
                      Name
                      <input
                        className="input mt-1"
                        value={block.name}
                        onChange={(e) => onUpdate(block.id, (b) => (b.type === "single" ? { ...b, name: e.target.value } : b))}
                      />
                    </label>
                    <label className="text-xs font-semibold text-ink-dim">
                      Type
                      <select
                        className="input mt-1"
                        value={block.kind}
                        onChange={(e) => onUpdate(block.id, (b) => (b.type === "single" ? { ...b, kind: e.target.value as SegmentKind } : b))}
                      >
                        {KIND_OPTIONS.map((k) => (
                          <option key={k} value={k}>
                            {SEGMENT_KIND_ICON[k]} {SEGMENT_KIND_LABEL[k]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs font-semibold text-ink-dim">
                      Link a drill (optional)
                      <select
                        className="input mt-1"
                        value={block.drillId ?? ""}
                        onChange={(e) => {
                          const drillId = e.target.value || undefined;
                          const drill = drills.find((d) => d.id === drillId);
                          onUpdate(block.id, (b) =>
                            b.type === "single"
                              ? {
                                  ...b,
                                  drillId,
                                  name: drill ? drill.name : b.name,
                                  minutes: drill ? Math.floor(drill.defaultMinutes) : b.minutes,
                                  seconds: drill ? Math.round((drill.defaultMinutes % 1) * 60) : b.seconds,
                                }
                              : b,
                          );
                        }}
                      >
                        <option value="">None</option>
                        {drills.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs font-semibold text-ink-dim">
                      Minutes
                      <input
                        type="number"
                        min={0}
                        className="input mt-1"
                        value={block.minutes}
                        onChange={(e) => onUpdate(block.id, (b) => (b.type === "single" ? { ...b, minutes: Number(e.target.value) } : b))}
                      />
                    </label>
                    <label className="text-xs font-semibold text-ink-dim">
                      Seconds
                      <input
                        type="number"
                        min={0}
                        max={59}
                        className="input mt-1"
                        value={block.seconds}
                        onChange={(e) => onUpdate(block.id, (b) => (b.type === "single" ? { ...b, seconds: Number(e.target.value) } : b))}
                      />
                    </label>
                    <label className="text-xs font-semibold text-ink-dim sm:col-span-2">
                      Notes
                      <input
                        className="input mt-1"
                        value={block.notes}
                        onChange={(e) => onUpdate(block.id, (b) => (b.type === "single" ? { ...b, notes: e.target.value } : b))}
                      />
                    </label>
                  </div>
                )}

                {block.type === "interval" && (
                  <div className="space-y-3 pt-3">
                    <label className="text-xs font-semibold text-ink-dim block">
                      Name
                      <input
                        className="input mt-1"
                        value={block.name}
                        onChange={(e) => onUpdate(block.id, (b) => (b.type === "interval" ? { ...b, name: e.target.value } : b))}
                      />
                    </label>
                    <label className="text-xs font-semibold text-ink-dim block w-40">
                      Total minutes
                      <input
                        type="number"
                        min={0}
                        className="input mt-1"
                        value={block.totalMinutes}
                        onChange={(e) => onUpdate(block.id, (b) => (b.type === "interval" ? { ...b, totalMinutes: Number(e.target.value) } : b))}
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-3 bg-surface-2 rounded-xl p-3">
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-ink-dim uppercase tracking-wide">▶ Work interval</p>
                        <input
                          className="input"
                          placeholder="Label"
                          value={block.workLabel}
                          onChange={(e) => onUpdate(block.id, (b) => (b.type === "interval" ? { ...b, workLabel: e.target.value } : b))}
                        />
                        <select
                          className="input"
                          value={block.workKind}
                          onChange={(e) => onUpdate(block.id, (b) => (b.type === "interval" ? { ...b, workKind: e.target.value as SegmentKind } : b))}
                        >
                          {KIND_OPTIONS.map((k) => (
                            <option key={k} value={k}>
                              {SEGMENT_KIND_ICON[k]} {SEGMENT_KIND_LABEL[k]}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min={1}
                          className="input"
                          placeholder="Seconds"
                          value={block.workSeconds}
                          onChange={(e) => onUpdate(block.id, (b) => (b.type === "interval" ? { ...b, workSeconds: Number(e.target.value) } : b))}
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-ink-dim uppercase tracking-wide">⏸ Break interval</p>
                        <input
                          className="input"
                          placeholder="Label"
                          value={block.breakLabel}
                          onChange={(e) => onUpdate(block.id, (b) => (b.type === "interval" ? { ...b, breakLabel: e.target.value } : b))}
                        />
                        <select
                          className="input"
                          value={block.breakKind}
                          onChange={(e) => onUpdate(block.id, (b) => (b.type === "interval" ? { ...b, breakKind: e.target.value as SegmentKind } : b))}
                        >
                          {KIND_OPTIONS.map((k) => (
                            <option key={k} value={k}>
                              {SEGMENT_KIND_ICON[k]} {SEGMENT_KIND_LABEL[k]}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min={0}
                          className="input"
                          placeholder="Seconds"
                          value={block.breakSeconds}
                          onChange={(e) => onUpdate(block.id, (b) => (b.type === "interval" ? { ...b, breakSeconds: Number(e.target.value) } : b))}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-brand bg-brand-soft rounded-lg px-3 py-2 inline-block">
                      ≈ {Math.floor((block.totalMinutes * 60) / (block.workSeconds + block.breakSeconds || 1))} reps of{" "}
                      {block.workSeconds}s work / {block.breakSeconds}s break
                    </p>
                    <label className="text-xs font-semibold text-ink-dim block">
                      Notes
                      <input
                        className="input mt-1"
                        value={block.notes}
                        onChange={(e) => onUpdate(block.id, (b) => (b.type === "interval" ? { ...b, notes: e.target.value } : b))}
                      />
                    </label>
                  </div>
                )}

                {block.type === "group" && (
                  <div className="space-y-3 pt-3">
                    <label className="text-xs font-semibold text-ink-dim block">
                      Name
                      <input
                        className="input mt-1"
                        value={block.name}
                        onChange={(e) => onUpdate(block.id, (b) => (b.type === "group" ? { ...b, name: e.target.value } : b))}
                      />
                    </label>
                    <label className="text-xs font-semibold text-ink-dim block">
                      Notes
                      <input
                        className="input mt-1"
                        value={block.notes}
                        onChange={(e) => onUpdate(block.id, (b) => (b.type === "group" ? { ...b, notes: e.target.value } : b))}
                      />
                    </label>

                    <div className="border-t border-dashed border-border-strong pt-3">
                      <BlockEditor
                        blocks={block.children}
                        drills={drills}
                        depth={depth + 1}
                        expanded={expanded}
                        onToggleExpand={onToggleExpand}
                        onUpdate={onUpdate}
                        onRemove={onRemove}
                        onMove={onMove}
                        onAddChild={onAddChild}
                      />
                      <AddBlockButtons onAdd={(newBlock) => onAddChild(block.id, newBlock)} compact />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function IconButton({
  children,
  onClick,
  disabled,
  danger,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      className={`w-7 h-7 flex items-center justify-center rounded-md text-xs border transition-colors ${
        danger
          ? "border-transparent text-danger/70 hover:bg-danger-soft hover:text-danger"
          : "border-transparent text-ink-faint hover:bg-surface-2 hover:text-ink"
      } disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
    >
      {children}
    </button>
  );
}

export function AddBlockButtons({ onAdd, compact }: { onAdd: (block: Block) => void; compact?: boolean }) {
  const options: { label: string; icon: string; hint: string; make: () => Block }[] = [
    { label: "Single Block", icon: "⏱️", hint: "One timed segment", make: () => newSingleBlock() },
    { label: "Interval", icon: "🔁", hint: "Repeating work / break", make: () => newIntervalBlock() },
    { label: "Group", icon: "🗂️", hint: "Sequential stations", make: () => newGroupBlock() },
  ];
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 ${compact ? "mt-3" : "mt-4"}`}>
      {options.map((opt) => (
        <button
          key={opt.label}
          type="button"
          onClick={() => onAdd(opt.make())}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-border-strong text-left hover:border-brand hover:bg-brand-soft/50 transition-colors"
        >
          <span className="text-lg" aria-hidden>
            {opt.icon}
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink">+ {opt.label}</span>
            <span className="block text-[11px] text-ink-faint">{opt.hint}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
