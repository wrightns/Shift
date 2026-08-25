import type { DiagramEquipment } from "../../types";

export function ArrowDefs() {
  return (
    <defs>
      <marker id="diagram-arrow-run" markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="#475569" />
      </marker>
      <marker id="diagram-arrow-pass" markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="#7c3aed" />
      </marker>
      <marker id="diagram-arrow-shot" markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="#e11d48" />
      </marker>
      <marker id="diagram-arrow-dribble" markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="#0d9488" />
      </marker>
    </defs>
  );
}

export function Player({ x, y, label }: { x: number; y: number; label?: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r="2.6" fill="#0d9488" stroke="white" strokeWidth="0.5" />
      {label && (
        <text x={x} y={y + 1} textAnchor="middle" fontSize="2.6" fontWeight="700" fill="white">
          {label}
        </text>
      )}
    </g>
  );
}

export function Defender({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="2.6" fill="#e11d48" stroke="white" strokeWidth="0.5" />
      <text x={x} y={y + 1} textAnchor="middle" fontSize="2.8" fontWeight="700" fill="white">
        X
      </text>
    </g>
  );
}

export function Coach({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="2.3" fill="#f59e0b" stroke="white" strokeWidth="0.5" />
      <text x={x} y={y + 0.9} textAnchor="middle" fontSize="2.4" fontWeight="700" fill="white">
        C
      </text>
    </g>
  );
}

export function Ball({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="1.1" fill="#fef3c7" stroke="#78350f" strokeWidth="0.35" />;
}

export function Cone({ x, y }: { x: number; y: number }) {
  return <path d={`M${x},${y - 1.6} L${x + 1.4},${y + 1.4} L${x - 1.4},${y + 1.4} Z`} fill="#f97316" stroke="#7c2d12" strokeWidth="0.2" />;
}

export function EquipmentIcon({ kind, x, y }: { kind: DiagramEquipment; x: number; y: number }) {
  switch (kind) {
    case "cone":
      return <Cone x={x} y={y} />;
    case "ladder":
      return (
        <g stroke="#475569" strokeWidth="0.4">
          <line x1={x - 1.6} y1={y - 2.5} x2={x - 1.6} y2={y + 2.5} />
          <line x1={x + 1.6} y1={y - 2.5} x2={x + 1.6} y2={y + 2.5} />
          {[-1.6, -0.5, 0.6, 1.7].map((dy) => (
            <line key={dy} x1={x - 1.6} y1={y + dy} x2={x + 1.6} y2={y + dy} />
          ))}
        </g>
      );
    case "hurdle":
      return (
        <g stroke="#475569" strokeWidth="0.45" fill="none">
          <path d={`M${x - 1.6},${y + 1.8} L${x - 1.6},${y - 1} Q${x},${y - 2.6} ${x + 1.6},${y - 1} L${x + 1.6},${y + 1.8}`} />
        </g>
      );
    case "wicket":
      return (
        <g stroke="#475569" strokeWidth="0.4" fill="none">
          <path d={`M${x - 1.1},${y + 1.2} L${x - 1.1},${y - 0.6} Q${x},${y - 1.6} ${x + 1.1},${y - 0.6} L${x + 1.1},${y + 1.2}`} />
        </g>
      );
    case "block":
      return <rect x={x - 1.4} y={y - 0.9} width="2.8" height="1.8" fill="#475569" rx="0.3" />;
    case "wall":
      return <rect x={x - 0.6} y={y - 3} width="1.2" height="6" fill="#94a3b8" />;
    default:
      return null;
  }
}

type ArrowKind = "run" | "pass" | "dribble" | "shot";

const ARROW_STYLE: Record<ArrowKind, { stroke: string; width: number; dash?: string; marker: string }> = {
  run: { stroke: "#475569", width: 0.5, marker: "url(#diagram-arrow-run)" },
  pass: { stroke: "#7c3aed", width: 0.5, dash: "1.6,1.2", marker: "url(#diagram-arrow-pass)" },
  dribble: { stroke: "#0d9488", width: 0.5, marker: "url(#diagram-arrow-dribble)" },
  shot: { stroke: "#e11d48", width: 0.9, marker: "url(#diagram-arrow-shot)" },
};

export function Arrow({ x1, y1, x2, y2, kind }: { x1: number; y1: number; x2: number; y2: number; kind: ArrowKind }) {
  const style = ARROW_STYLE[kind];
  if (kind === "dribble") {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const mid1x = x1 + dx * 0.33 + nx * 2.2;
    const mid1y = y1 + dy * 0.33 + ny * 2.2;
    const mid2x = x1 + dx * 0.66 - nx * 2.2;
    const mid2y = y1 + dy * 0.66 - ny * 2.2;
    return (
      <path
        d={`M${x1},${y1} Q${mid1x},${mid1y} ${x1 + dx * 0.5},${y1 + dy * 0.5} Q${mid2x},${mid2y} ${x2},${y2}`}
        fill="none"
        stroke={style.stroke}
        strokeWidth={style.width}
        markerEnd={style.marker}
      />
    );
  }
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={style.stroke}
      strokeWidth={style.width}
      strokeDasharray={style.dash}
      markerEnd={style.marker}
    />
  );
}

export function Zone({ x, y, width, height, dashed }: { x: number; y: number; width: number; height: number; dashed?: boolean }) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="none"
      stroke="white"
      strokeOpacity="0.85"
      strokeWidth="0.5"
      strokeDasharray={dashed ? "1.5,1.2" : undefined}
    />
  );
}
