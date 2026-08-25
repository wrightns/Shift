import type { DiagramEquipment, DiagramTemplate } from "../../types";
import { Arrow, Ball, Coach, Defender, EquipmentIcon, Player, Zone } from "./primitives";

export interface TemplateParams {
  players?: number;
  defenders?: number;
  equipment?: DiagramEquipment[];
}

function EquipmentCourse({ equipment }: TemplateParams) {
  const items: DiagramEquipment[] = equipment && equipment.length > 0 ? equipment : ["cone", "cone", "cone", "cone", "cone"];
  const startX = 14;
  const endX = 86;
  const step = items.length > 1 ? (endX - startX) / (items.length - 1) : 0;
  const points = items.map((_, i) => startX + step * i);
  return (
    <>
      <Player x={8} y={30} />
      <Arrow x1={8} y1={30} x2={points[0] ?? 20} y2={30} kind="dribble" />
      {points.map((x, i) => (
        <Arrow key={`seg-${i}`} x1={x} y1={30} x2={points[i + 1] ?? 92} y2={30} kind="dribble" />
      ))}
      {items.map((kind, i) => (
        <EquipmentIcon key={i} kind={kind} x={points[i]} y={30} />
      ))}
    </>
  );
}

function StationCircuit() {
  const stations: [number, number][] = [
    [25, 30],
    [50, 15],
    [75, 30],
  ];
  return (
    <>
      {stations.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="6" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="1.2,1" />
          <text x={x} y={y + 1} textAnchor="middle" fontSize="3.4" fontWeight="700" fill="white">
            {i + 1}
          </text>
        </g>
      ))}
      <Arrow x1={30} y1={26} x2={45} y2={17} kind="run" />
      <Arrow x1={55} y1={17} x2={70} y2={26} kind="run" />
      <Arrow x1={70} y1={35} x2={30} y2={35} kind="run" />
    </>
  );
}

function PassingPattern({ players = 3 }: TemplateParams) {
  if (players <= 2) {
    return (
      <>
        <Player x={20} y={30} label="1" />
        <Player x={80} y={30} label="2" />
        <Arrow x1={24} y1={27} x2={76} y2={27} kind="pass" />
        <Arrow x1={76} y1={33} x2={24} y2={33} kind="pass" />
        <Ball x={50} y={30} />
      </>
    );
  }
  if (players === 4) {
    const pts: [number, number][] = [
      [20, 12],
      [80, 12],
      [80, 48],
      [20, 48],
    ];
    return (
      <>
        {pts.map(([x, y], i) => (
          <Player key={i} x={x} y={y} label={String(i + 1)} />
        ))}
        {pts.map(([x, y], i) => {
          const [nx, ny] = pts[(i + 1) % pts.length];
          return <Arrow key={`a${i}`} x1={x} y1={y} x2={nx} y2={ny} kind="pass" />;
        })}
        <Ball x={50} y={30} />
      </>
    );
  }
  const pts: [number, number][] = [
    [50, 10],
    [18, 50],
    [82, 50],
  ];
  return (
    <>
      {pts.map(([x, y], i) => (
        <Player key={i} x={x} y={y} label={String(i + 1)} />
      ))}
      {pts.map(([x, y], i) => {
        const [nx, ny] = pts[(i + 1) % pts.length];
        return <Arrow key={`a${i}`} x1={x} y1={y} x2={nx} y2={ny} kind="pass" />;
      })}
      <Ball x={50} y={35} />
    </>
  );
}

function WallDrill() {
  return (
    <>
      <EquipmentIcon kind="wall" x={8} y={30} />
      <Player x={24} y={30} />
      <Arrow x1={21} y1={28} x2={10} y2={28} kind="pass" />
      <Arrow x1={10} y1={32} x2={21} y2={32} kind="run" />
      <Ball x={16} y={30} />
    </>
  );
}

function Duel1v1() {
  return (
    <>
      <Player x={14} y={30} />
      <Defender x={38} y={30} />
      <Arrow x1={17} y1={28} x2={88} y2={22} kind="dribble" />
    </>
  );
}

function NumbersUp({ players = 3, defenders = 1 }: TemplateParams) {
  const attackers: [number, number][] = Array.from({ length: Math.max(2, players) }).map((_, i, arr) => [
    14,
    30 - ((arr.length - 1) * 9) / 2 + i * 9,
  ]);
  const defs: [number, number][] = Array.from({ length: Math.max(1, defenders) }).map((_, i, arr) => [
    45,
    30 - ((arr.length - 1) * 10) / 2 + i * 10,
  ]);
  return (
    <>
      {attackers.map(([x, y], i) => (
        <Player key={i} x={x} y={y} label={String(i + 1)} />
      ))}
      {defs.map(([x, y], i) => (
        <Defender key={i} x={x} y={y} />
      ))}
      {attackers.slice(0, -1).map(([x, y], i) => {
        const [nx, ny] = attackers[i + 1];
        return <Arrow key={`p${i}`} x1={x} y1={y} x2={nx} y2={ny} kind="pass" />;
      })}
      <Arrow x1={attackers[attackers.length - 1][0]} y1={attackers[attackers.length - 1][1]} x2={92} y2={30} kind="run" />
    </>
  );
}

function FinishingStation() {
  return (
    <>
      <Coach x={14} y={12} />
      <Player x={30} y={45} />
      <Arrow x1={30} y1={42} x2={68} y2={30} kind="run" />
      <Arrow x1={16} y1={14} x2={28} y2={44} kind="pass" />
      <Arrow x1={70} y1={30} x2={95} y2={22} kind="shot" />
      <Arrow x1={70} y1={30} x2={97} y2={30} kind="shot" />
      <Arrow x1={70} y1={30} x2={95} y2={38} kind="shot" />
    </>
  );
}

function TargetPractice() {
  return (
    <>
      <Player x={16} y={30} />
      {[16, 26, 38].map((y, i) => (
        <g key={i}>
          <circle cx={92} cy={y} r="3" fill="none" stroke="white" strokeDasharray="1,1" strokeWidth="0.5" />
          <Arrow x1={19} y1={30} x2={89} y2={y} kind="shot" />
        </g>
      ))}
    </>
  );
}

function SmallSidedGame() {
  const team: [number, number][] = [
    [30, 16],
    [30, 44],
    [45, 30],
  ];
  const opp: [number, number][] = [
    [70, 16],
    [70, 44],
    [55, 30],
  ];
  return (
    <>
      <Zone x={10} y={8} width={80} height={44} dashed />
      {team.map(([x, y], i) => (
        <Player key={i} x={x} y={y} />
      ))}
      {opp.map(([x, y], i) => (
        <Defender key={i} x={x} y={y} />
      ))}
      <Ball x={50} y={30} />
    </>
  );
}

function FullScrimmage() {
  const rows = [12, 24, 36, 48];
  return (
    <>
      {rows.map((y, i) => (
        <Player key={`p${i}`} x={22 + (i % 2) * 8} y={y} />
      ))}
      {rows.map((y, i) => (
        <Defender key={`d${i}`} x={78 - (i % 2) * 8} y={y} />
      ))}
      <Ball x={50} y={30} />
    </>
  );
}

function TeamShape() {
  const shape: [number, number][] = [
    [15, 30],
    [28, 14],
    [28, 46],
    [42, 22],
    [42, 38],
  ];
  return (
    <>
      <Zone x={8} y={6} width={44} height={48} dashed />
      {shape.map(([x, y], i) => (
        <Player key={i} x={x} y={y} label={String(i + 1)} />
      ))}
    </>
  );
}

function SetPiece() {
  return (
    <>
      <Player x={97} y={4} label="K" />
      {[[80, 18], [84, 30], [80, 42], [88, 24]].map(([x, y], i) => (
        <Player key={`a${i}`} x={x} y={y} />
      ))}
      {[[75, 22], [75, 30], [75, 38]].map(([x, y], i) => (
        <Defender key={`d${i}`} x={x} y={y} />
      ))}
      <Arrow x1={96} y1={5} x2={84} y2={30} kind="pass" />
    </>
  );
}

function LaneWork() {
  return (
    <>
      <Player x={8} y={30} />
      <Arrow x1={11} y1={30} x2={90} y2={30} kind="run" />
      <Zone x={62} y={18} width={16} height={24} />
      <Player x={70} y={30} />
    </>
  );
}

function RotationDiagram() {
  const positions: [number, number, string][] = [
    [58, 30, "4"],
    [58, 12, "3"],
    [58, 48, "5"],
    [80, 12, "2"],
    [80, 48, "6"],
    [80, 30, "1"],
  ];
  return (
    <>
      {positions.map(([x, y, label], i) => (
        <Player key={i} x={x} y={y} label={label} />
      ))}
      <path d="M85,42 Q92,30 85,18" fill="none" stroke="#475569" strokeWidth="0.5" markerEnd="url(#diagram-arrow-run)" />
    </>
  );
}

const TEMPLATES: Record<DiagramTemplate, (params: TemplateParams) => React.ReactNode> = {
  "equipment-course": EquipmentCourse,
  "station-circuit": StationCircuit,
  "passing-pattern": PassingPattern,
  "wall-drill": WallDrill,
  "duel-1v1": Duel1v1,
  "numbers-up": NumbersUp,
  "finishing-station": FinishingStation,
  "target-practice": TargetPractice,
  "small-sided-game": SmallSidedGame,
  "full-scrimmage": FullScrimmage,
  "team-shape": TeamShape,
  "set-piece": SetPiece,
  "lane-work": LaneWork,
  "rotation-diagram": RotationDiagram,
};

export function renderTemplate(template: DiagramTemplate, params: TemplateParams): React.ReactNode {
  const Component = TEMPLATES[template];
  return Component ? Component(params) : null;
}
