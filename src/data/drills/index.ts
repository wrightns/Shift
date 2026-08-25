import type { Drill } from "../../types";
import { soccerDrills } from "./soccer";
import { hockeyDrills } from "./hockey";
import { lacrosseDrills } from "./lacrosse";
import { footballDrills } from "./football";
import { basketballDrills } from "./basketball";
import { baseballDrills } from "./baseball";
import { softballDrills } from "./softball";
import { fieldHockeyDrills } from "./fieldHockey";
import { trackRunningDrills } from "./trackRunning";
import { trackSprintingDrills } from "./trackSprinting";
import { swimmingDrills } from "./swimming";
import { tennisDrills } from "./tennis";
import { volleyballDrills } from "./volleyball";

export const allDrills: Drill[] = [
  ...soccerDrills,
  ...hockeyDrills,
  ...lacrosseDrills,
  ...footballDrills,
  ...basketballDrills,
  ...baseballDrills,
  ...softballDrills,
  ...fieldHockeyDrills,
  ...trackRunningDrills,
  ...trackSprintingDrills,
  ...swimmingDrills,
  ...tennisDrills,
  ...volleyballDrills,
];
