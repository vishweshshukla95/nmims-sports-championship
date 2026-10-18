import {
  getCampusDepartmentsAction,
  saveCampusDepartmentAction,
} from "@/app/actions/campuses";
import { CampusDepartmentPublic } from "@/types/tournament";

export type { CampusDepartmentPublic };
export type CampusDepartmentInfo = CampusDepartmentPublic;

export const INITIAL_CAMPUS_DEPARTMENTS: CampusDepartmentInfo[] = [
  {
    campusId: "mum",
    shortCode: "MUM",
    name: "Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    isHost: false,
    slug: "mumbai",
    menCount: 69,
    womenCount: 13,
    totalCount: 82,
    staffMen: 0,
    staffWomen: 0,
    officerName: "",
    officerPhone: "",
    officerEmail: "",
  },
  {
    campusId: "nvm",
    shortCode: "NVM",
    name: "Navi Mumbai",
    city: "Navi Mumbai",
    state: "Maharashtra",
    isHost: false,
    slug: "navi-mumbai",
    menCount: 69,
    womenCount: 24,
    totalCount: 93,
    staffMen: 6,
    staffWomen: 0,
    officerName: "",
    officerPhone: "",
    officerEmail: "",
  },
  {
    campusId: "ind",
    shortCode: "IND",
    name: "Indore",
    city: "Indore",
    state: "Madhya Pradesh",
    isHost: false,
    slug: "indore",
    menCount: 62,
    womenCount: 18,
    totalCount: 80,
    staffMen: 4,
    staffWomen: 1,
    officerName: "",
    officerPhone: "",
    officerEmail: "",
  },
  {
    campusId: "blr",
    shortCode: "BLR",
    name: "Bengaluru",
    city: "Bengaluru",
    state: "Karnataka",
    isHost: false,
    slug: "bengaluru",
    menCount: 58,
    womenCount: 18,
    totalCount: 76,
    staffMen: 4,
    staffWomen: 1,
    officerName: "",
    officerPhone: "",
    officerEmail: "",
  },
  {
    campusId: "hyd",
    shortCode: "HYD",
    name: "Hyderabad",
    city: "Hyderabad",
    state: "Telangana",
    isHost: false,
    slug: "hyderabad",
    menCount: 67,
    womenCount: 24,
    totalCount: 91,
    staffMen: 5,
    staffWomen: 2,
    officerName: "",
    officerPhone: "",
    officerEmail: "",
  },
  {
    campusId: "chd",
    shortCode: "CHD",
    name: "Chandigarh",
    city: "Chandigarh",
    state: "Punjab",
    isHost: false,
    slug: "chandigarh",
    menCount: 61,
    womenCount: 19,
    totalCount: 80,
    staffMen: 2,
    staffWomen: 1,
    officerName: "",
    officerPhone: "",
    officerEmail: "",
  },
  {
    campusId: "shi",
    shortCode: "SHI",
    name: "Shirpur (Host)",
    city: "Shirpur",
    state: "Maharashtra",
    isHost: true,
    slug: "shirpur",
    menCount: 0,
    womenCount: 0,
    totalCount: 0,
    staffMen: 0,
    staffWomen: 0,
    officerName: "Tushar Jain",
    officerPhone: "+91 95886 75238",
    officerEmail: "sports.shirpur@nmims.edu",
  },
];

let runtimeCampusCache: CampusDepartmentInfo[] = INITIAL_CAMPUS_DEPARTMENTS;

export function getCampusDepartments(): CampusDepartmentInfo[] {
  return runtimeCampusCache;
}

export async function fetchCampusDepartments(): Promise<CampusDepartmentInfo[]> {
  try {
    const list = await getCampusDepartmentsAction();
    runtimeCampusCache = list;
    return list;
  } catch (err) {
    console.warn("fetchCampusDepartments error:", err);
    return runtimeCampusCache;
  }
}

export async function saveCampusDepartment(
  updated: CampusDepartmentInfo
): Promise<{ success: boolean; error?: string }> {
  const list = [...runtimeCampusCache];
  const idx = list.findIndex((c) => c.campusId === updated.campusId);
  if (idx !== -1) {
    list[idx] = updated;
  } else {
    list.push(updated);
  }
  runtimeCampusCache = list;
  return await saveCampusDepartmentAction(updated);
}
