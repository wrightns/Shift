import type { DrillDiagram as DrillDiagramSpec, Sport } from "../../types";
import { CourtSurface, DiamondSurface, FieldSurface, FootballFieldSurface, LaneSurface, RinkSurface } from "./Surfaces";
import { ArrowDefs } from "./primitives";
import { renderTemplate } from "./templates";

function surfaceForSport(sport: Sport): React.ReactNode {
  const key = sport.trim().toLowerCase();
  switch (key) {
    case "soccer":
      return <FieldSurface goalStyle="box" />;
    case "field hockey":
      return <FieldSurface goalStyle="d-circle" />;
    case "lacrosse":
      return <FieldSurface goalStyle="crease" />;
    case "football":
      return <FootballFieldSurface />;
    case "basketball":
      return <CourtSurface variant="basketball" />;
    case "tennis":
      return <CourtSurface variant="tennis" />;
    case "volleyball":
      return <CourtSurface variant="volleyball" />;
    case "baseball":
    case "softball":
      return <DiamondSurface />;
    case "hockey":
      return <RinkSurface />;
    case "track (running)":
    case "track (sprinting)":
      return <LaneSurface theme="track" />;
    case "swimming":
      return <LaneSurface theme="pool" lanes={7} />;
    default:
      return <FieldSurface goalStyle="box" />;
  }
}

export function DrillDiagram({ sport, diagram, className }: { sport: Sport; diagram: DrillDiagramSpec; className?: string }) {
  return (
    <svg
      viewBox="0 0 100 60"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role="img"
      aria-label={`Diagram for a ${diagram.template.replace("-", " ")} drill`}
    >
      <ArrowDefs />
      {surfaceForSport(sport)}
      {renderTemplate(diagram.template, { players: diagram.players, defenders: diagram.defenders, equipment: diagram.equipment })}
    </svg>
  );
}
