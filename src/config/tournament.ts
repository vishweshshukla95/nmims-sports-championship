export interface SportConfig {
  id: string;
  name: string;
  slug: string;
  hasMen: boolean;
  hasWomen: boolean;
  icon: string;
  image: string;
  description: string;
}

export interface CampusConfig {
  id: string;
  name: string;
  shortCode: string;
  city: string;
  state: string;
  isHost: boolean;
}

export const TOURNAMENT_CONFIG = {
  fullName: "SVKM'S NMIMS INTER CAMPUS SPORTS CHAMPIONSHIP 2026-27",
  shortName: "NMIMS Sports Championship 2026-27",
  pwaShortName: "NMIMS Sports 26-27",
  dates: "27th – 31st October 2026",
  dateRange: {
    start: "2026-10-27T09:00:00+05:30",
    end: "2026-10-31T20:00:00+05:30",
    reporting: "2026-10-26T12:00:00+05:30",
  },
  reportingText: "26th October 2026, 12:00 Noon",
  organizedBy: "Sports Department, SVKM's NMIMS",
  hostCampus: "Mukesh Patel Technology Park (MPTP), Shirpur Campus",
  venueAddress: `Mukesh Patel Technology Park – Shirpur Campus
Babulde, Near Tapi River Bridge, Mumbai-Agra Road (NH3),
Shirpur – 425405, Dist.: Dhule, Maharashtra, INDIA`,
  googleMapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3714.4754581404176!2d74.88719877604313!3d21.40958117450259!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdf4a320573e34b%3A0xb36340f1a9b24ce5!2sMukesh%20Patel%20Technology%20Park%20(MPTP)%20Shirpur!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
  directionsUrl: "https://maps.google.com/?q=Mukesh+Patel+Technology+Park+Shirpur",
  instagramHandle: "@nmimssports",
  edition: "2026-27",
  stats: {
    sports: 6,
    campuses: 7,
    categories: 10,
    days: 5,
  },
};

export const SPORTS_CONFIG: SportConfig[] = [
  {
    id: "cricket",
    name: "Cricket",
    slug: "cricket",
    hasMen: true,
    hasWomen: false,
    icon: "🏏",
    image: "/images/sports/cricket.webp",
    description: "T20 Championship matches under full tournament standards.",
  },
  {
    id: "football",
    name: "Football",
    slug: "football",
    hasMen: true,
    hasWomen: false,
    icon: "⚽",
    image: "/images/sports/football.webp",
    description: "High-intensity full-pitch inter-campus football battles.",
  },
  {
    id: "basketball",
    name: "Basketball",
    slug: "basketball",
    hasMen: true,
    hasWomen: true,
    icon: "🏀",
    image: "/images/sports/basketball.webp",
    description: "Fast-paced Men's and Women's indoor and outdoor basketball tournament.",
  },
  {
    id: "volleyball",
    name: "Volleyball",
    slug: "volleyball",
    hasMen: true,
    hasWomen: true,
    icon: "🏐",
    image: "/images/sports/volleyball.webp",
    description: "Spikes, digs, and team spirit in Men's and Women's volleyball.",
  },
  {
    id: "table-tennis",
    name: "Table Tennis",
    slug: "table-tennis",
    hasMen: true,
    hasWomen: false,
    icon: "🏓",
    image: "/images/sports/table-tennis.webp",
    description: "Precision singles, doubles, and rubber ties for Men.",
  },
  {
    id: "lawn-tennis",
    name: "Lawn Tennis",
    slug: "lawn-tennis",
    hasMen: true,
    hasWomen: false,
    icon: "🎾",
    image: "/images/sports/lawn-tennis.webp",
    description: "Singles and doubles sets on the Shirpur tennis courts.",
  },
];

export const CAMPUSES_CONFIG: CampusConfig[] = [
  {
    id: "mum",
    name: "NMIMS Mumbai",
    shortCode: "MUM",
    city: "Mumbai",
    state: "Maharashtra",
    isHost: false,
  },
  {
    id: "nvm",
    name: "NMIMS Navi Mumbai",
    shortCode: "NVM",
    city: "Navi Mumbai",
    state: "Maharashtra",
    isHost: false,
  },
  {
    id: "shi",
    name: "NMIMS Shirpur",
    shortCode: "SHI",
    city: "Shirpur",
    state: "Maharashtra",
    isHost: true,
  },
  {
    id: "ind",
    name: "NMIMS Indore",
    shortCode: "IND",
    city: "Indore",
    state: "Madhya Pradesh",
    isHost: false,
  },
  {
    id: "blr",
    name: "NMIMS Bengaluru",
    shortCode: "BLR",
    city: "Bengaluru",
    state: "Karnataka",
    isHost: false,
  },
  {
    id: "hyd",
    name: "NMIMS Hyderabad",
    shortCode: "HYD",
    city: "Hyderabad",
    state: "Telangana",
    isHost: false,
  },
  {
    id: "chd",
    name: "NMIMS Chandigarh",
    shortCode: "CHD",
    city: "Chandigarh",
    state: "Chandigarh",
    isHost: false,
  },
];

export const TOURNAMENT_DAYS = [
  { dayNumber: 1, label: "Day 1", date: "2026-10-27", display: "27 Oct 2026" },
  { dayNumber: 2, label: "Day 2", date: "2026-10-28", display: "28 Oct 2026" },
  { dayNumber: 3, label: "Day 3", date: "2026-10-29", display: "29 Oct 2026" },
  { dayNumber: 4, label: "Day 4", date: "2026-10-30", display: "30 Oct 2026" },
  { dayNumber: 5, label: "Day 5", date: "2026-10-31", display: "31 Oct 2026" },
];
