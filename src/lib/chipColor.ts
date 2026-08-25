const CHIP_COLORS = [
  { bg: "bg-teal-50", text: "text-teal-700" },
  { bg: "bg-sky-50", text: "text-sky-700" },
  { bg: "bg-amber-50", text: "text-amber-700" },
  { bg: "bg-violet-50", text: "text-violet-700" },
  { bg: "bg-rose-50", text: "text-rose-700" },
  { bg: "bg-emerald-50", text: "text-emerald-700" },
  { bg: "bg-orange-50", text: "text-orange-700" },
  { bg: "bg-indigo-50", text: "text-indigo-700" },
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
