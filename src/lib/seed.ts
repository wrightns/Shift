import type { PracticePlan } from "../types";
import { newGroupBlock, newIntervalBlock, newSingleBlock } from "./blocks";
import { newId } from "./id";
import { allDrills } from "../data/drills";

export const seedDrills = allDrills;

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
