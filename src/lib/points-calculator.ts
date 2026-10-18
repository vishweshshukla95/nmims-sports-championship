import {
  Match,
  Team,
  TeamGroup,
  SportType,
  CategoryGender,
  PointsTableRow,
} from "@/types/tournament";

export interface PointsRules {
  win: number;
  draw: number;
  loss: number;
  nr: number;
}

export interface PointAdjustment {
  teamId: string;
  field: string;
  delta: number;
  reason?: string;
}

export const DEFAULT_POINTS_RULES: Record<SportType, PointsRules> = {
  cricket: { win: 2, draw: 0, loss: 0, nr: 1 },
  football: { win: 3, draw: 1, loss: 0, nr: 0 },
  basketball: { win: 2, draw: 0, loss: 0, nr: 0 },
  volleyball: { win: 2, draw: 0, loss: 0, nr: 0 },
  "table-tennis": { win: 2, draw: 0, loss: 0, nr: 0 },
  "lawn-tennis": { win: 2, draw: 0, loss: 0, nr: 0 },
};

function parseOvers(oversStr?: string): number {
  if (!oversStr) return 0;
  const parts = oversStr.split(".");
  const overs = parseFloat(parts[0]) || 0;
  const balls = parseFloat(parts[1]) || 0;
  return overs + balls / 6;
}

export function computePointsTable(
  groupId: string,
  groupName: string,
  sportId: SportType,
  category: CategoryGender,
  teams: Team[],
  teamGroups: TeamGroup[],
  matches: Match[],
  rulesOverride?: Partial<Record<SportType, PointsRules>>,
  adjustments: PointAdjustment[] = []
): PointsTableRow[] {
  const rules =
    rulesOverride?.[sportId] || DEFAULT_POINTS_RULES[sportId] || { win: 2, draw: 0, loss: 0, nr: 0 };

  // Filter teams assigned to this group
  const assignedTeamIds = new Set(
    teamGroups
      .filter(
        (g) =>
          g.groupId === groupId ||
          (g.groupName && g.groupName.toLowerCase() === groupName.toLowerCase()) ||
          g.id === groupId
      )
      .map((g) => g.teamId)
  );

  const groupTeams = teams.filter(
    (t) =>
      t.sportId === sportId &&
      t.category === category &&
      assignedTeamIds.has(t.id)
  );

  if (groupTeams.length === 0) {
    return [];
  }

  // Filter completed matches for this group
  const targetRound = `Group ${groupName}`;
  const groupMatches = matches.filter(
    (m) =>
      m.sportId === sportId &&
      m.category === category &&
      m.status === "Completed" &&
      (
        (m.groupId && m.groupId === groupId) ||
        (!m.groupId && (
          m.round === targetRound ||
          (m.round === "Group Stage" && assignedTeamIds.has(m.teamAId) && assignedTeamIds.has(m.teamBId))
        ))
      )
  );

  const rows: PointsTableRow[] = groupTeams.map((team) => {
    let played = 0;
    let won = 0;
    let lost = 0;
    let drawn = 0;
    let noResult = 0;
    let points = 0;

    let gf = 0;
    let ga = 0;
    let pf = 0;
    let pa = 0;
    let setsWon = 0;
    let setsLost = 0;

    let runsScored = 0;
    let oversFaced = 0;
    let runsConceded = 0;
    let oversBowled = 0;

    groupMatches.forEach((m) => {
      const isTeamA = m.teamAId === team.id;
      const isTeamB = m.teamBId === team.id;

      if (!isTeamA && !isTeamB) return;

      played += 1;

      // Determine Winner / Loss / Draw
      if (m.winnerId) {
        if (m.winnerId === team.id) {
          won += 1;
          points += rules.win;
        } else {
          lost += 1;
          points += rules.loss;
        }
      } else {
        // No winner recorded: check if drawn or no-result
        const isFootball = sportId === "football";
        const goalsA = m.scoreDetails?.teamAGoals ?? 0;
        const goalsB = m.scoreDetails?.teamBGoals ?? 0;

        if (isFootball && goalsA === goalsB && m.status === "Completed") {
          drawn += 1;
          points += rules.draw;
        } else {
          noResult += 1;
          points += rules.nr;
        }
      }

      // Sport specific score aggregations
      if (sportId === "football") {
        const teamGoals = isTeamA ? m.scoreDetails?.teamAGoals ?? 0 : m.scoreDetails?.teamBGoals ?? 0;
        const oppGoals = isTeamA ? m.scoreDetails?.teamBGoals ?? 0 : m.scoreDetails?.teamAGoals ?? 0;
        gf += teamGoals;
        ga += oppGoals;
      } else if (sportId === "basketball") {
        const teamPts = isTeamA ? m.scoreDetails?.teamAPoints ?? 0 : m.scoreDetails?.teamBPoints ?? 0;
        const oppPts = isTeamA ? m.scoreDetails?.teamBPoints ?? 0 : m.scoreDetails?.teamAPoints ?? 0;
        pf += teamPts;
        pa += oppPts;
      } else if (sportId === "volleyball") {
        const teamSets = isTeamA ? m.scoreDetails?.teamASets ?? 0 : m.scoreDetails?.teamBSets ?? 0;
        const oppSets = isTeamA ? m.scoreDetails?.teamBSets ?? 0 : m.scoreDetails?.teamASets ?? 0;
        setsWon += teamSets;
        setsLost += oppSets;
      } else if (sportId === "cricket") {
        const teamRuns = isTeamA ? m.scoreDetails?.teamARuns ?? 0 : m.scoreDetails?.teamBRuns ?? 0;
        const oppRuns = isTeamA ? m.scoreDetails?.teamBRuns ?? 0 : m.scoreDetails?.teamARuns ?? 0;
        const tOvers = parseOvers(isTeamA ? m.scoreDetails?.teamAOvers : m.scoreDetails?.teamBOvers) || 20;
        const oOvers = parseOvers(isTeamA ? m.scoreDetails?.teamBOvers : m.scoreDetails?.teamAOvers) || 20;
        runsScored += teamRuns;
        oversFaced += tOvers;
        runsConceded += oppRuns;
        oversBowled += oOvers;
      }
    });

    let gd = gf - ga;
    let diff = pf - pa;
    let nrr =
      oversFaced > 0 && oversBowled > 0
        ? parseFloat((runsScored / oversFaced - runsConceded / oversBowled).toFixed(3))
        : 0;

    // Apply manual admin adjustments for this team
    const teamAdjs = adjustments.filter((a) => a.teamId === team.id);
    teamAdjs.forEach((adj) => {
      if (adj.field === "played") played += adj.delta;
      else if (adj.field === "won") won += adj.delta;
      else if (adj.field === "lost") lost += adj.delta;
      else if (adj.field === "drawn") drawn += adj.delta;
      else if (adj.field === "noResult") noResult += adj.delta;
      else if (adj.field === "points") points += adj.delta;
      else if (adj.field === "gd") gd += adj.delta;
      else if (adj.field === "diff") diff += adj.delta;
      else if (adj.field === "nrr") nrr += adj.delta;
    });

    const shortCode = team.campusId.toUpperCase();

    return {
      pos: 0,
      teamId: team.id,
      teamName: team.name,
      shortCode,
      played,
      won,
      lost,
      drawn: sportId === "football" ? drawn : undefined,
      noResult: sportId === "cricket" ? noResult : undefined,
      points,
      nrr: sportId === "cricket" ? parseFloat(nrr.toFixed(3)) : undefined,
      gf: sportId === "football" ? gf : undefined,
      ga: sportId === "football" ? ga : undefined,
      gd: sportId === "football" ? gd : undefined,
      pf: sportId === "basketball" ? pf : undefined,
      pa: sportId === "basketball" ? pa : undefined,
      diff: sportId === "basketball" ? diff : undefined,
      setsWon: sportId === "volleyball" ? setsWon : undefined,
      setsLost: sportId === "volleyball" ? setsLost : undefined,
    };
  });

  // Sort rows based on sport tiebreaker rules
  rows.sort((a, b) => {
    // 1. Points descending
    if (b.points !== a.points) return b.points - a.points;

    // 2. Sport tiebreakers
    if (sportId === "cricket") {
      return (b.nrr ?? 0) - (a.nrr ?? 0);
    }
    if (sportId === "football") {
      if ((b.gd ?? 0) !== (a.gd ?? 0)) return (b.gd ?? 0) - (a.gd ?? 0);
      return (b.gf ?? 0) - (a.gf ?? 0);
    }
    if (sportId === "basketball") {
      return (b.diff ?? 0) - (a.diff ?? 0);
    }
    if (sportId === "volleyball") {
      const ratioA = (a.setsWon ?? 0) / (a.setsLost ? a.setsLost : 1);
      const ratioB = (b.setsWon ?? 0) / (b.setsLost ? b.setsLost : 1);
      return ratioB - ratioA;
    }
    return b.won - a.won;
  });

  // Assign positions and top-2 qualified chip
  return rows.map((row, idx) => ({
    ...row,
    pos: idx + 1,
    qualified: idx < 2 && rows.length >= 2,
  }));
}
