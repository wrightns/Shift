import type { Block, GroupBlock, IntervalBlock, Segment, SegmentKind, SingleBlock } from "../types";
import { newId } from "./id";

export function blockDurationSeconds(block: Block): number {
  switch (block.type) {
    case "single":
      return block.minutes * 60 + block.seconds;
    case "interval":
      return Math.round(block.totalMinutes * 60);
    case "group":
      return block.children.reduce((sum, c) => sum + blockDurationSeconds(c), 0);
  }
}

export function totalDurationSeconds(blocks: Block[]): number {
  return blocks.reduce((sum, b) => sum + blockDurationSeconds(b), 0);
}

/** Flattens a block tree into the ordered leaf segments the runner plays. */
export function flattenBlocks(blocks: Block[], breadcrumb: string[] = []): Segment[] {
  const segments: Segment[] = [];
  for (const block of blocks) {
    segments.push(...flattenBlock(block, breadcrumb));
  }
  return segments;
}

function flattenBlock(block: Block, breadcrumb: string[]): Segment[] {
  switch (block.type) {
    case "single":
      return [flattenSingle(block, breadcrumb)];
    case "interval":
      return flattenInterval(block, breadcrumb);
    case "group":
      return flattenBlocks(block.children, [...breadcrumb, block.name]);
  }
}

function flattenSingle(block: SingleBlock, breadcrumb: string[]): Segment {
  return {
    id: block.id,
    sourceBlockId: block.id,
    label: block.name,
    breadcrumb,
    kind: block.kind,
    seconds: block.minutes * 60 + block.seconds,
  };
}

function flattenInterval(block: IntervalBlock, breadcrumb: string[]): Segment[] {
  const total = Math.round(block.totalMinutes * 60);
  const cycle = block.workSeconds + block.breakSeconds;
  const segments: Segment[] = [];
  const crumb = [...breadcrumb, block.name];

  if (total <= 0 || cycle <= 0) return segments;

  let elapsed = 0;
  let rep = 1;
  while (elapsed < total) {
    const remaining = total - elapsed;
    const work = Math.min(block.workSeconds, remaining);
    if (work > 0) {
      segments.push(mkIntervalSegment(block, crumb, block.workLabel, block.workKind, work, rep));
      elapsed += work;
    }
    if (elapsed >= total) break;

    const restRemaining = total - elapsed;
    const rest = Math.min(block.breakSeconds, restRemaining);
    if (rest > 0) {
      segments.push(mkIntervalSegment(block, crumb, block.breakLabel, block.breakKind, rest, rep));
      elapsed += rest;
    }
    rep += 1;
  }
  return segments;
}

function mkIntervalSegment(
  block: IntervalBlock,
  breadcrumb: string[],
  label: string,
  kind: SegmentKind,
  seconds: number,
  rep: number,
): Segment {
  return {
    id: `${block.id}-r${rep}-${label}`,
    sourceBlockId: block.id,
    label: `${label} (Rep ${rep})`,
    breadcrumb,
    kind,
    seconds,
  };
}

export function newSingleBlock(overrides: Partial<SingleBlock> = {}): SingleBlock {
  return {
    id: newId(),
    type: "single",
    kind: "drill",
    name: "New Drill",
    minutes: 10,
    seconds: 0,
    notes: "",
    ...overrides,
  };
}

export function newIntervalBlock(overrides: Partial<IntervalBlock> = {}): IntervalBlock {
  return {
    id: newId(),
    type: "interval",
    name: "New Interval",
    totalMinutes: 15,
    workLabel: "Work",
    workKind: "drill",
    workSeconds: 150,
    breakLabel: "Break",
    breakKind: "break",
    breakSeconds: 30,
    notes: "",
    ...overrides,
  };
}

export function newGroupBlock(overrides: Partial<GroupBlock> = {}): GroupBlock {
  return {
    id: newId(),
    type: "group",
    name: "New Group",
    notes: "",
    children: [],
    ...overrides,
  };
}

export function updateBlockInTree(blocks: Block[], id: string, updater: (b: Block) => Block): Block[] {
  return blocks.map((b) => {
    if (b.id === id) return updater(b);
    if (b.type === "group") return { ...b, children: updateBlockInTree(b.children, id, updater) };
    return b;
  });
}

export function removeBlockFromTree(blocks: Block[], id: string): Block[] {
  return blocks
    .filter((b) => b.id !== id)
    .map((b) => (b.type === "group" ? { ...b, children: removeBlockFromTree(b.children, id) } : b));
}

export function moveBlockInTree(blocks: Block[], id: string, direction: -1 | 1): Block[] {
  const idx = blocks.findIndex((b) => b.id === id);
  if (idx !== -1) {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= blocks.length) return blocks;
    const copy = [...blocks];
    [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
    return copy;
  }
  return blocks.map((b) => (b.type === "group" ? { ...b, children: moveBlockInTree(b.children, id, direction) } : b));
}

export function addChildToGroup(blocks: Block[], groupId: string, child: Block): Block[] {
  return blocks.map((b) => {
    if (b.id === groupId && b.type === "group") return { ...b, children: [...b.children, child] };
    if (b.type === "group") return { ...b, children: addChildToGroup(b.children, groupId, child) };
    return b;
  });
}

export const SEGMENT_KIND_LABEL: Record<SegmentKind, string> = {
  warmup: "Warmup",
  drill: "Drill",
  game: "Game",
  talk: "Coach Talk",
  break: "Break",
  transition: "Transition",
  other: "Other",
};

export const SEGMENT_KIND_COLOR: Record<SegmentKind, string> = {
  warmup: "bg-amber-500",
  drill: "bg-sky-500",
  game: "bg-emerald-500",
  talk: "bg-violet-500",
  break: "bg-slate-400",
  transition: "bg-slate-400",
  other: "bg-slate-500",
};

export const SEGMENT_KIND_SOFT: Record<SegmentKind, { bg: string; text: string; ring: string }> = {
  warmup: { bg: "bg-blue-400/10", text: "text-blue-300", ring: "ring-blue-400/30" },
  drill: { bg: "bg-sky-500/10", text: "text-sky-300", ring: "ring-sky-500/30" },
  game: { bg: "bg-emerald-500/10", text: "text-emerald-300", ring: "ring-emerald-500/30" },
  talk: { bg: "bg-violet-500/10", text: "text-violet-300", ring: "ring-violet-500/30" },
  break: { bg: "bg-surface-3", text: "text-ink-dim", ring: "ring-border-strong" },
  transition: { bg: "bg-surface-3", text: "text-ink-dim", ring: "ring-border-strong" },
  other: { bg: "bg-surface-3", text: "text-ink-dim", ring: "ring-border-strong" },
};

export const SEGMENT_KIND_ICON: Record<SegmentKind, string> = {
  warmup: "🔥",
  drill: "🏃",
  game: "🏆",
  talk: "💬",
  break: "☕",
  transition: "🔄",
  other: "📌",
};
