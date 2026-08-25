const ICONS: Record<string, string> = {
  soccer: "⚽",
  football: "🏈",
  basketball: "🏀",
  baseball: "⚾",
  softball: "🥎",
  hockey: "🏒",
  volleyball: "🏐",
  tennis: "🎾",
  swimming: "🏊",
  track: "🏃",
  "track and field": "🏃",
  lacrosse: "🥍",
  rugby: "🏉",
  golf: "⛳",
  wrestling: "🤼",
  cheer: "📣",
  gymnastics: "🤸",
  cross: "🏃",
};

export function sportIcon(sport: string): string {
  const key = sport.trim().toLowerCase();
  return ICONS[key] ?? "🏆";
}
