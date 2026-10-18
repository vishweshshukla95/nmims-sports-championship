export type SportType =
  | "cricket"
  | "football"
  | "basketball"
  | "volleyball"
  | "table-tennis"
  | "lawn-tennis";

export type CategoryGender = "men" | "women";

export type MatchStatus =
  | "Scheduled"
  | "Postponed"
  | "Completed"
  | "Cancelled"
  | "Walkover";

export type MatchRound =
  | "Group A"
  | "Group B"
  | "League"
  | "Group Stage"
  | "Quarter-Final"
  | "Semi-Final"
  | "3rd Place"
  | "Final";

export interface Campus {
  id: string;
  name: string;
  shortCode: string;
  city: string;
  state: string;
  isHost: boolean;
  logoUrl?: string;
}

export interface Team {
  id: string;
  campusId: string;
  sportId: SportType;
  category: CategoryGender;
  name: string;
  squadSize?: number;
  players?: Player[];
}

export interface Player {
  id: string;
  teamId: string;
  name: string;
  role?: string;
  jerseyNo?: number | string;
  photoUrl?: string;
  isCaptain?: boolean;
  isWk?: boolean;
}

export interface MatchScoreDetails {
  // Cricket
  teamARuns?: number;
  teamAWickets?: number;
  teamAOvers?: string;
  teamBRuns?: number;
  teamBWickets?: number;
  teamBOvers?: string;
  tossWinner?: string;
  tossDecision?: "bat" | "bowl";

  // Football
  teamAGoals?: number;
  teamBGoals?: number;
  scorersA?: string[];
  scorersB?: string[];

  // Basketball
  teamAPoints?: number;
  teamBPoints?: number;
  quarters?: { q1A: number; q1B: number; q2A: number; q2B: number; q3A: number; q3B: number; q4A: number; q4B: number };

  // Volleyball
  teamASets?: number;
  teamBSets?: number;
  setScores?: string[]; // e.g. ["25-20", "22-25", "25-18", "25-21"]

  // Table Tennis & Tennis
  teamAGames?: number;
  teamBGames?: number;
  rubberScores?: string[]; // e.g. ["11-8, 11-9, 11-7"]
  toss?: string;
  scorersText?: string;
}

export interface MatchPlayerStat {
  playerId: string;
  playerName: string;
  campusCode: string;
  statsText: string;
  mvpPoints?: number;
}

export interface PlayerStatSummary {
  playerId?: string;
  playerName: string;
  campusCode: string;
  category?: string;
  runs?: number;
  wickets?: number;
  goals?: number;
  points?: number;
}

export interface Match {
  id: string;
  edition: string;
  sportId: SportType;
  category: CategoryGender;
  matchNo: number;
  round: MatchRound;
  teamAId: string;
  teamAName: string;
  teamAShortCode: string;
  teamBId: string;
  teamBName: string;
  teamBShortCode: string;
  playerAName?: string; // For TT & Tennis singles
  playerBName?: string;
  scheduledAt: string; // ISO date string
  venue: string; // e.g. "Main Cricket Ground", "Court 1", "Table 2"
  status: MatchStatus;
  winnerId?: string;
  winnerName?: string;
  resultText?: string;
  scoreSummary?: string;
  scoreText?: string;
  scoreDetails?: MatchScoreDetails;
  isWalkover?: boolean;
  notes?: string;
  motmPlayerId?: string;
  motmPlayerName?: string;
  motmCampus?: string;
  motmCampusCode?: string;
  motmPhotoUrl?: string;
  motmNote?: string;
  playerStats?: MatchPlayerStat[];
  groupId?: string;
  isDemo?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  campusCode: string;
  value: number | string;
  secondaryValue?: string;
  motmAwards?: number;
  matchesPlayed?: number;
}

export interface Group {
  id: string;
  sportId: string;
  categoryId?: string;
  name: string;
  sortOrder: number;
  createdAt?: string;
}

export interface TeamGroup {
  id: string;
  teamId: string;
  groupId: string;
  groupName?: string;
  sportId?: string;
  categoryId?: string;
}

export interface CampusDepartmentPublic {
  id?: string;
  campusId: string;
  shortCode: string;
  name: string;
  city: string;
  state: string;
  isHost?: boolean;
  slug: string;
  menCount: number;
  womenCount: number;
  totalCount: number;
  staffMen: number;
  staffWomen: number;
  officerName?: string;
  officerPhone?: string;
  officerEmail?: string;
  updatedAt?: string;
}

export type CampusDepartment = CampusDepartmentPublic;

export interface CampusAccommodation {
  campusId: string;
  dayScholar: number;
  hosteller: number;
  updatedAt?: string;
}

export interface CampusDepartmentAdmin extends CampusDepartmentPublic {
  dayScholar: number;
  hosteller: number;
}

export interface PortalUser {
  id: string;
  email: string;
  role: "admin" | "viewer";
  createdAt: string;
}

export interface PointsTableRow {
  pos: number;
  teamId: string;
  teamName: string;
  shortCode: string;
  played: number;
  won: number;
  lost: number;
  drawn?: number;
  noResult?: number;
  points: number;
  // Cricket
  nrr?: number;
  // Football
  gf?: number;
  ga?: number;
  gd?: number;
  // Basketball
  pf?: number;
  pa?: number;
  diff?: number;
  // Volleyball
  setsWon?: number;
  setsLost?: number;
  qualified?: boolean;
}

