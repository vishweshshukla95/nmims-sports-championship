import { CAMPUSES_CONFIG, SPORTS_CONFIG } from "@/config/tournament";
import { Team, SportType } from "@/types/tournament";

// Official squad sizes and participation lookup
export const OFFICIAL_SQUAD_SIZES: Record<string, Record<string, number>> = {
  "basketball-men": { HYD: 12, BLR: 12, NVM: 12, IND: 12, CHD: 12, MUM: 12, SHI: 12 },
  "basketball-women": { HYD: 10, BLR: 8, NVM: 12, IND: 9, CHD: 10, MUM: 12, SHI: 12 },
  "cricket-men": { HYD: 16, BLR: 15, NVM: 16, IND: 16, CHD: 16, MUM: 17, SHI: 16 },
  "football-men": { HYD: 20, BLR: 14, NVM: 18, IND: 18, CHD: 18, MUM: 18, SHI: 20 },
  "volleyball-men": { HYD: 12, BLR: 7, NVM: 12, IND: 12, CHD: 11, MUM: 12, SHI: 12 },
  "volleyball-women": { HYD: 10, BLR: 8, NVM: 12, IND: 8, CHD: 8, SHI: 12 },
  "lawn-tennis-men": { HYD: 2, BLR: 2, CHD: 2, MUM: 5, SHI: 5 },
  "table-tennis-men": { BLR: 4, NVM: 5, MUM: 5, SHI: 5 },
};

// Generate exactly 50 participating teams per official participation roster
export function getSeededTeams(): Team[] {
  const teams: Team[] = [];

  CAMPUSES_CONFIG.forEach((campus) => {
    SPORTS_CONFIG.forEach((sport) => {
      if (sport.hasMen) {
        const squadSize = OFFICIAL_SQUAD_SIZES[`${sport.slug}-men`]?.[campus.shortCode];
        if (squadSize !== undefined) {
          teams.push({
            id: `${campus.shortCode.toLowerCase()}-${sport.slug}-men`,
            campusId: campus.id,
            sportId: sport.slug as SportType,
            category: "men",
            name: `${campus.name} – ${sport.name} (Men)`,
            squadSize,
            players: [],
          });
        }
      }
      if (sport.hasWomen) {
        const squadSize = OFFICIAL_SQUAD_SIZES[`${sport.slug}-women`]?.[campus.shortCode];
        if (squadSize !== undefined) {
          teams.push({
            id: `${campus.shortCode.toLowerCase()}-${sport.slug}-women`,
            campusId: campus.id,
            sportId: sport.slug as SportType,
            category: "women",
            name: `${campus.name} – ${sport.name} (Women)`,
            squadSize,
            players: [],
          });
        }
      }
    });
  });

  return teams;
}
