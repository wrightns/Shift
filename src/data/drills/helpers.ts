import type { Drill } from "../../types";
import { newId } from "../../lib/id";

export function makeDrillFactory(sport: string) {
  return (
    name: string,
    category: string,
    description: string,
    equipment: string,
    defaultMinutes: number,
    tags: string[],
  ): Drill => ({ id: newId(), name, sport, category, description, equipment, defaultMinutes, tags });
}
