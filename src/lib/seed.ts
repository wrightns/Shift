import type { Drill, PracticePlan } from "../types";
import { newGroupBlock, newIntervalBlock, newSingleBlock } from "./blocks";
import { newId } from "./id";

export const seedDrills: Drill[] = [
  {
    id: newId(),
    name: "Dynamic Warmup",
    sport: "Soccer",
    category: "Warmup",
    description: "Jogging, high knees, butt kicks, lateral shuffles, and dynamic stretches to raise heart rate and prep joints.",
    equipment: "Cones",
    defaultMinutes: 15,
    tags: ["warmup", "no-ball"],
  },
  {
    id: newId(),
    name: "Small-Sided Games (4v4)",
    sport: "Soccer",
    category: "Small-Sided Games",
    description: "4v4 possession games in a tight grid to maximize touches and force quick decisions.",
    equipment: "Cones, pinnies, 4+ balls",
    defaultMinutes: 15,
    tags: ["ssg", "possession"],
  },
  {
    id: newId(),
    name: "Passing Station",
    sport: "Soccer",
    category: "Technical",
    description: "Partner passing progressing from stationary to one-touch, focused on first-touch quality.",
    equipment: "Cones, balls",
    defaultMinutes: 10,
    tags: ["passing", "station"],
  },
  {
    id: newId(),
    name: "Shooting Station",
    sport: "Soccer",
    category: "Technical",
    description: "Rotating shooting reps on goal from the top of the box with a server feeding balls.",
    equipment: "Goals, balls, cones",
    defaultMinutes: 10,
    tags: ["shooting", "station"],
  },
  {
    id: newId(),
    name: "Full-Field Scrimmage",
    sport: "Soccer",
    category: "Game",
    description: "Full-sided scrimmage to close practice and apply the day's theme in game conditions.",
    equipment: "Goals, balls, pinnies",
    defaultMinutes: 10,
    tags: ["game", "scrimmage"],
  },
];

function buildSampleSoccerPlan(): PracticePlan {
  const warmup = newSingleBlock({
    kind: "warmup",
    name: "Warmup (Assistant Coach)",
    minutes: 15,
    seconds: 0,
    notes: "Run by the assistant coach while I set up the small-sided game grids.",
  });

  const smallSidedGames = newIntervalBlock({
    name: "Small-Sided Games",
    totalMinutes: 15,
    workLabel: "Small-Sided Games",
    workKind: "game",
    workSeconds: 150,
    breakLabel: "Team Talk",
    breakKind: "talk",
    breakSeconds: 30,
    notes: "Break into groups. Stop every 3 minutes for a 30s-1min check-in on how the drill is going.",
  });

  const stationSession = newGroupBlock({
    name: "Station Session",
    notes: "Two stations, players rotate at the halfway point.",
    children: [
      newSingleBlock({ kind: "drill", name: "Station 1: Passing", minutes: 10, seconds: 0 }),
      newSingleBlock({ kind: "drill", name: "Station 2: Shooting", minutes: 10, seconds: 0 }),
    ],
  });

  const gameSession = newGroupBlock({
    name: "Final Game Session",
    notes: "",
    children: [
      newSingleBlock({ kind: "talk", name: "Set Up Teams / Coach Talk", minutes: 5, seconds: 0 }),
      newSingleBlock({ kind: "game", name: "Game", minutes: 10, seconds: 0 }),
    ],
  });

  const now = new Date().toISOString();
  return {
    id: newId(),
    name: "Soccer Practice - 90 Min",
    sport: "Soccer",
    targetMinutes: 90,
    notes: "Sample plan modeled on a real practice: warmup, small-sided games with talk breaks, two stations, and a closing game.",
    blocks: [warmup, smallSidedGames, stationSession, gameSession],
    createdAt: now,
    updatedAt: now,
  };
}

export const seedPlans: PracticePlan[] = [buildSampleSoccerPlan()];
