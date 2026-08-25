import type { Block, Drill, SegmentKind } from "../types";
import { blockDurationSeconds, newGroupBlock, newIntervalBlock, newSingleBlock, SEGMENT_KIND_LABEL } from "../lib/blocks";
import { formatMinutesLabel } from "../lib/time";

const KIND_OPTIONS: SegmentKind[] = ["warmup", "drill", "game", "talk", "break", "transition", "other"];

interface BlockEditorProps {
  blocks: Block[];
  drills: Drill[];
  depth: number;
  onUpdate: (id: string, updater: (b: Block) => Block) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onAddChild: (groupId: string, block: Block) => void;
}

export function BlockEditor({ blocks, drills, depth, onUpdate, onRemove, onMove, onAddChild }: BlockEditorProps) {
  return (
    <div className="space-y-3">
      {blocks.map((block, idx) => (
        <div
          key={block.id}
          className="border border-slate-200 rounded-lg bg-white p-3 shadow-sm"
          style={{ marginLeft: depth * 16 }}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {block.type === "single" ? "Block" : block.type === "interval" ? "Interval" : "Group"}
              {" · "}
              {formatMinutesLabel(blockDurationSeconds(block) / 60)}
            </span>
            <div className="flex gap-1">
              <IconButton label="Move up" onClick={() => onMove(block.id, -1)} disabled={idx === 0}>
                ↑
              </IconButton>
              <IconButton label="Move down" onClick={() => onMove(block.id, 1)} disabled={idx === blocks.length - 1}>
                ↓
              </IconButton>
              <IconButton label="Delete" onClick={() => onRemove(block.id)} danger>
                ✕
              </IconButton>
            </div>
          </div>

          {block.type === "single" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="text-xs text-slate-500 sm:col-span-2">
                Name
                <input
                  className="input mt-1"
                  value={block.name}
                  onChange={(e) => onUpdate(block.id, (b) => (b.type === "single" ? { ...b, name: e.target.value } : b))}
                />
              </label>
              <label className="text-xs text-slate-500">
                Type
                <select
                  className="input mt-1"
                  value={block.kind}
                  onChange={(e) => onUpdate(block.id, (b) => (b.type === "single" ? { ...b, kind: e.target.value as SegmentKind } : b))}
                >
                  {KIND_OPTIONS.map((k) => (
                    <option key={k} value={k}>
                      {SEGMENT_KIND_LABEL[k]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-slate-500">
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
              <label className="text-xs text-slate-500">
                Minutes
                <input
                  type="number"
                  min={0}
                  className="input mt-1"
                  value={block.minutes}
                  onChange={(e) => onUpdate(block.id, (b) => (b.type === "single" ? { ...b, minutes: Number(e.target.value) } : b))}
                />
              </label>
              <label className="text-xs text-slate-500">
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
              <label className="text-xs text-slate-500 sm:col-span-2">
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
            <div className="space-y-2">
              <label className="text-xs text-slate-500 block">
                Name
                <input
                  className="input mt-1"
                  value={block.name}
                  onChange={(e) => onUpdate(block.id, (b) => (b.type === "interval" ? { ...b, name: e.target.value } : b))}
                />
              </label>
              <label className="text-xs text-slate-500 block w-40">
                Total minutes
                <input
                  type="number"
                  min={0}
                  className="input mt-1"
                  value={block.totalMinutes}
                  onChange={(e) => onUpdate(block.id, (b) => (b.type === "interval" ? { ...b, totalMinutes: Number(e.target.value) } : b))}
                />
              </label>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-md p-2">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500">Work interval</p>
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
                        {SEGMENT_KIND_LABEL[k]}
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
                  <p className="text-xs font-semibold text-slate-500">Break interval</p>
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
                        {SEGMENT_KIND_LABEL[k]}
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
              <p className="text-xs text-slate-400">
                ≈ {Math.floor((block.totalMinutes * 60) / (block.workSeconds + block.breakSeconds || 1))} reps of{" "}
                {block.workSeconds}s work / {block.breakSeconds}s break
              </p>
              <label className="text-xs text-slate-500 block">
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
            <div className="space-y-3">
              <label className="text-xs text-slate-500 block">
                Name
                <input
                  className="input mt-1"
                  value={block.name}
                  onChange={(e) => onUpdate(block.id, (b) => (b.type === "group" ? { ...b, name: e.target.value } : b))}
                />
              </label>
              <label className="text-xs text-slate-500 block">
                Notes
                <input
                  className="input mt-1"
                  value={block.notes}
                  onChange={(e) => onUpdate(block.id, (b) => (b.type === "group" ? { ...b, notes: e.target.value } : b))}
                />
              </label>

              <div className="border-t border-dashed border-slate-200 pt-3">
                <BlockEditor
                  blocks={block.children}
                  drills={drills}
                  depth={depth + 1}
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
      ))}
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
      onClick={onClick}
      disabled={disabled}
      className={`w-6 h-6 flex items-center justify-center rounded text-xs border ${
        danger ? "border-red-200 text-red-500 hover:bg-red-50" : "border-slate-200 text-slate-500 hover:bg-slate-100"
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

export function AddBlockButtons({ onAdd, compact }: { onAdd: (block: Block) => void; compact?: boolean }) {
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "mt-2" : "mt-4"}`}>
      <button
        type="button"
        onClick={() => onAdd(newSingleBlock())}
        className="px-3 py-1.5 border border-slate-300 rounded-md text-xs hover:bg-slate-50"
      >
        + Single Block
      </button>
      <button
        type="button"
        onClick={() => onAdd(newIntervalBlock())}
        className="px-3 py-1.5 border border-slate-300 rounded-md text-xs hover:bg-slate-50"
      >
        + Interval (repeating)
      </button>
      <button
        type="button"
        onClick={() => onAdd(newGroupBlock())}
        className="px-3 py-1.5 border border-slate-300 rounded-md text-xs hover:bg-slate-50"
      >
        + Group (stations)
      </button>
    </div>
  );
}
