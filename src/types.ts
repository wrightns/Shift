export type Sport = string;

export interface Drill {
  id: string;
  name: string;
  sport: Sport;
  category: string;
  description: string;
  equipment: string;
  defaultMinutes: number;
  tags: string[];
}

export type SegmentKind =
  | "warmup"
  | "drill"
  | "game"
  | "talk"
  | "break"
  | "transition"
  | "other";

/** A single, non-repeating timed item. */
export interface SingleBlock {
  id: string;
  type: "single";
  kind: SegmentKind;
  name: string;
  minutes: number;
  seconds: number;
  notes: string;
  drillId?: string;
}

/**
 * A repeating work/rest cycle that fills a total duration, e.g. "15 minutes
 * of small-sided games, stopping for a 30s team talk every 3 minutes".
 */
export interface IntervalBlock {
  id: string;
  type: "interval";
  name: string;
  totalMinutes: number;
  workLabel: string;
  workKind: SegmentKind;
  workSeconds: number;
  breakLabel: string;
  breakKind: SegmentKind;
  breakSeconds: number;
  notes: string;
}

/** A sequential container of child blocks, e.g. rotating stations. */
export interface GroupBlock {
  id: string;
  type: "group";
  name: string;
  notes: string;
  children: Block[];
}

export type Block = SingleBlock | IntervalBlock | GroupBlock;

export interface PracticePlan {
  id: string;
  name: string;
  sport: Sport;
  targetMinutes: number;
  notes: string;
  blocks: Block[];
  createdAt: string;
  updatedAt: string;
}

export interface Segment {
  id: string;
  sourceBlockId: string;
  label: string;
  breadcrumb: string[];
  kind: SegmentKind;
  seconds: number;
}
