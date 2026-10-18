export interface ContactPerson {
  name: string;
  role: string;
  phone?: string | null;
  cleanPhone?: string | null;
  group: "leadership" | "committee";
}

export const LEADERSHIP_CONFIG: ContactPerson = {
  name: "Dr. Kiran Anchan",
  role: "Director – Sports, SVKM's & NMIMS University",
  phone: null,
  cleanPhone: null,
  group: "leadership",
};

export const COMMITTEE_CONFIG: ContactPerson[] = [
  {
    name: "Tushar Jain",
    role: "Sports Incharge, MPTP Shirpur Campus",
    phone: "+91 95886 75238",
    cleanPhone: "919588675238",
    group: "committee",
  },
  {
    name: "Aryan Pawar",
    role: "Sports Council Member, MPTP Shirpur Campus",
    phone: "+91 91569 88019",
    cleanPhone: "919156988019",
    group: "committee",
  },
  {
    name: "Mehi Manswa",
    role: "Sports Council Member, MPTP Shirpur Campus",
    phone: "+91 93249 79109",
    cleanPhone: "919324979109",
    group: "committee",
  },
];

export const CONTACTS_CONFIG: ContactPerson[] = [
  LEADERSHIP_CONFIG,
  ...COMMITTEE_CONFIG,
];
