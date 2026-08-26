const CHIP_COLORS = [
  { bg: "bg-teal-500/15", text: "text-teal-300" },
  { bg: "bg-sky-500/15", text: "text-sky-300" },
  { bg: "bg-amber-500/15", text: "text-amber-300" },
  { bg: "bg-violet-500/15", text: "text-violet-300" },
  { bg: "bg-rose-500/15", text: "text-rose-300" },
  { bg: "bg-emerald-500/15", text: "text-emerald-300" },
  { bg: "bg-orange-500/15", text: "text-orange-300" },
  { bg: "bg-indigo-500/15", text: "text-indigo-300" },
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function categoryChipColor(category: string): { bg: string; text: string } {
  if (!category) return CHIP_COLORS[0];
  return CHIP_COLORS[hashString(category) % CHIP_COLORS.length];
}
