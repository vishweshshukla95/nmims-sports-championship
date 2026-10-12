import { CAMPUSES_CONFIG, SPORTS_CONFIG } from "@/config/tournament";
import { Team, Match, LeaderboardEntry, SportType, CategoryGender } from "@/types/tournament";

// Generate all 70 seeded teams: 7 Campuses × 10 Categories
export function getSeededTeams(): Team[] {
  const teams: Team[] = [];

  CAMPUSES_CONFIG.forEach((campus) => {
    SPORTS_CONFIG.forEach((sport) => {
      if (sport.hasMen) {
        teams.push({
          id: `${campus.shortCode.toLowerCase()}-${sport.slug}-men`,
          campusId: campus.id,
          sportId: sport.slug as SportType,
          category: "men",
          name: `${campus.name} – ${sport.name} (Men)`,
          players: [],
        });
      }
      if (sport.hasWomen) {
        teams.push({
          id: `${campus.shortCode.toLowerCase()}-${sport.slug}-women`,
          campusId: campus.id,
          sportId: sport.slug as SportType,
          category: "women",
          name: `${campus.name} – ${sport.name} (Women)`,
          players: [],
        });
      }
    });
  });

  return teams;
}

// Global in-memory / localStorage storage helper for client & demo interaction
let customMatches: Match[] = [];

export function getMatches(): Match[] {
  // If user or admin added matches in browser session:
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("nmims_matches");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      // Fallback
    }
  }
  return customMatches;
}

export function saveMatch(match: Match): void {
  const current = getMatches();
  const index = current.findIndex((m) => m.id === match.id);
  let updated: Match[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = match;
  } else {
    updated = [match, ...current];
  }
  customMatches = updated;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("nmims_matches", JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  }
}

export function deleteMatch(id: string): void {
  const current = getMatches();
  const updated = current.filter((m) => m.id !== id);
  customMatches = updated;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("nmims_matches", JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  }
}

export function clearDemoMatches(): void {
  const current = getMatches();
  const updated = current.filter((m) => !m.isDemo);
  customMatches = updated;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("nmims_matches", JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  }
}
