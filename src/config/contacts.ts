export interface ContactPerson {
  name: string;
  role: string;
  phone: string;
  cleanPhone: string;
  group: "director" | "committee";
}

export const CONTACTS_CONFIG: ContactPerson[] = [
  {
    name: "Tushar Jain",
    role: "Sports Director, MPTP Shirpur Campus",
    phone: "+91 95886 75238",
    cleanPhone: "919588675238",
    group: "director",
  },
  {
    name: "Aryan Pawar",
    role: "Organising Committee",
    phone: "+91 91569 88019",
    cleanPhone: "919156988019",
    group: "committee",
  },
  {
    name: "Mehi Manswa",
    role: "Organising Committee",
    phone: "+91 93249 79109",
    cleanPhone: "919324979109",
    group: "committee",
  },
  {
    name: "Vishwesh Shukla",
    role: "Organising Committee",
    phone: "+91 95993 33064",
    cleanPhone: "919599333064",
    group: "committee",
  },
];
