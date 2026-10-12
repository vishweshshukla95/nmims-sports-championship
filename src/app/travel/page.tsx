import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Plane,
  Train,
  Bus,
  Home,
  Utensils,
  Sun,
  CheckSquare,
  PhoneCall,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import NavyPatchBackground from "@/components/ui/NavyPatchBackground";
import { TOURNAMENT_CONFIG } from "@/config/tournament";

export const metadata = {
  title: "Travel & Stay",
  description:
    "Reporting details, complimentary pickup, accommodation at MPTP Shirpur & MRP School, meal timings, and travel guide.",
};

export default function TravelPage() {
  const transitHubs = [
    { name: "Indore International Airport", type: "flight", dist: "~200 km", icon: Plane },
    { name: "Nardana Railway Station", type: "train", dist: "~15 km", icon: Train },
    { name: "Sindkheda Railway Station", type: "train", dist: "~15 km", icon: Train },
    { name: "Shirpur Bus Stand", type: "bus", dist: "~8 km", icon: Bus },
    { name: "Dhule", type: "train/bus", dist: "~45 km", icon: Train },
    { name: "Jalgaon", type: "train/bus", dist: "~90 km", icon: Train },
    { name: "Bhusawal", type: "train/bus", dist: "~120 km", icon: Train },
    { name: "Manmad", type: "train/bus", dist: "~180 km", icon: Train },
    { name: "Indore Bus Stand and Railway Station", type: "train/bus", dist: "~200 km", icon: Train },
  ];

  const packingList = [
    "Official College Student ID card (mandatory for accreditation)",
    "Eligibility documents (fee proof, mark sheet, signed proforma)",
    "Championship playing kit and sport-specific footwear",
    "Personal medical supplies & required medications",
    "Light cotton clothes for daytime warmth",
    "Light layer / jacket for cooler late October evenings",
    "Reusable water bottle & sunscreen",
  ];

  return (
    <NavyPatchBackground variant="calm" className="min-h-screen pb-24">
      {/* 1. Header Banner with shirpur-campus.webp */}
      <div className="relative h-72 sm:h-96 w-full overflow-hidden border-b border-[rgba(217,178,111,0.25)]">
        <Image
          src="/images/shirpur-campus.webp"
          alt="Aerial view of Mukesh Patel Technology Park, Shirpur Campus"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B1F4B] via-[#161A40]/75 to-[#0F122E]/80" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative z-10 flex flex-col justify-end pb-8">
          <div className="title-ornament justify-start text-xs font-mono font-semibold uppercase tracking-widest text-gold mb-2">
            Host Destination
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black uppercase text-gold-gradient tracking-tight">
            TRAVEL AND STAY
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#AEB3D6] max-w-2xl">
            Everything players, coaches, and team managers need to know for arrival, airport/station pick-up, accommodation, and hospitality.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-16">
        {/* 2. Prominent Gold Reporting Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#20255A] via-[#161A40] to-[#20255A] border-2 border-gold shadow-gold-glow flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold flex-shrink-0 mx-auto sm:mx-0">
              <Clock className="w-8 h-8 text-gold-light" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-gold">
                Reporting Deadline
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-gold-light mt-1">
                Report on 26th October 2026 by 12:00 Noon
              </h2>
              <p className="text-xs sm:text-sm text-[#AEB3D6] mt-1">
                At Mukesh Patel Technology Park (MPTP), Shirpur Campus.
              </p>
            </div>
          </div>

          <Link
            href="/contact"
            className="flex-shrink-0 px-6 py-3 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Contact Organisers</span>
          </Link>
        </div>

        {/* 3. Venue Address & Google Map Embed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161A40] border border-gold/40 text-xs font-semibold text-gold">
              <MapPin className="w-3.5 h-3.5" />
              <span>Official Host Venue</span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-gold-light">
              Mukesh Patel Technology Park – Shirpur Campus
            </h3>
            <div className="p-4 rounded-xl bg-[#161A40] border border-[rgba(217,178,111,0.2)] text-xs text-[#F4EFE3] whitespace-pre-line leading-relaxed font-sans">
              {TOURNAMENT_CONFIG.venueAddress}
            </div>
            <a
              href={TOURNAMENT_CONFIG.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full btn-royal text-xs font-bold uppercase tracking-wider"
            >
              <span>Get Directions on Google Maps</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Embedded Map */}
          <div className="lg:col-span-7 h-80 rounded-2xl overflow-hidden border-2 border-gold/30 shadow-xl relative">
            <iframe
              src={TOURNAMENT_CONFIG.googleMapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Map MPTP Shirpur Campus"
            />
          </div>
        </div>

        {/* 4. Pick-up Facility Announcement Box */}
        <div className="p-8 rounded-3xl bg-[#161A40] border-2 border-gold/40 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚐</span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-gold">
              Complimentary Travel Pick-up Facility
            </h3>
          </div>
          <p className="text-sm sm:text-base text-[#F4EFE3] leading-relaxed">
            Pick-up will be arranged from <strong>all the nearest railway stations and airports</strong>. Please share your arrival details (mode of travel, station/airport, date, time, and total number of team members) with the Organising Committee in advance to ensure smooth transfer to campus.
          </p>
        </div>

        {/* 5. How to Reach: Transit Hubs with Distances */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="text-2xl sm:text-3xl font-serif font-black uppercase text-gold-gradient">
              How To Reach Shirpur
            </h3>
            <p className="text-xs sm:text-sm text-[#AEB3D6] mt-2">
              Approximate distances from nearest transit terminals to MPTP Shirpur Campus:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {transitHubs.map((hub, i) => {
              const Icon = hub.icon;
              return (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-[#161A40] border border-[rgba(217,178,111,0.2)] flex items-center justify-between hover:border-gold transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#0F122E] text-gold border border-gold/20">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#F4EFE3] leading-snug">
                        {hub.name}
                      </h4>
                      <span className="text-[11px] text-[#AEB3D6] uppercase tracking-wider">
                        {hub.type}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-gold text-base ml-2">
                    {hub.dist}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. Accommodation & Food Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Accommodation Card */}
          <div className="card-championship p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#20255A] text-gold border border-gold/30">
                <Home className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-gold-light">
                Player & Team Accommodation
              </h3>
            </div>
            <p className="text-sm text-[#F4EFE3] leading-relaxed">
              Accommodation (sharing basis, with comfortable bedding) will be provided at:
            </p>
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-[#0F122E] border border-gold/20">
                <div className="font-bold text-gold text-sm">MPTP Shirpur Campus</div>
                <div className="text-xs text-[#AEB3D6]">On-campus residential hostels with security and amenities.</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0F122E] border border-gold/20">
                <div className="font-bold text-gold text-sm">MRP School</div>
                <div className="text-xs text-[#AEB3D6]">Designated delegate and team lodging wing with bedding.</div>
              </div>
            </div>
          </div>

          {/* Food Card */}
          <div className="card-championship p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#20255A] text-gold border border-gold/30">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-gold-light">
                Food & Dining Timings
              </h3>
            </div>
            <p className="text-sm text-[#F4EFE3] leading-relaxed">
              Wholesome vegetarian meals are served daily in the dining hall:
            </p>
            <div className="space-y-2 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-[#0F122E] flex justify-between items-center border border-[rgba(217,178,111,0.1)]">
                <span className="font-bold text-[#F4EFE3]">Breakfast</span>
                <span className="font-mono text-gold">7:00 AM – 9:30 AM</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0F122E] flex justify-between items-center border border-[rgba(217,178,111,0.1)]">
                <span className="font-bold text-[#F4EFE3]">Lunch</span>
                <span className="font-mono text-gold">12:00 PM – 2:00 PM</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0F122E] flex justify-between items-center border border-[rgba(217,178,111,0.1)]">
                <span className="font-bold text-[#F4EFE3]">Campus Canteen</span>
                <span className="font-mono text-gold">4:00 PM – 7:00 PM</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0F122E] flex justify-between items-center border border-[rgba(217,178,111,0.1)]">
                <span className="font-bold text-[#F4EFE3]">Dinner</span>
                <span className="font-mono text-gold">8:00 PM – 10:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* 7. Weather & What to Carry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Weather */}
          <div className="card-championship p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#20255A] text-gold border border-gold/30">
                <Sun className="w-6 h-6 text-gold" />
              </div>
              <h3 className="text-xl font-serif font-bold text-gold-light">
                Shirpur Weather in Late October
              </h3>
            </div>
            <p className="text-sm text-[#AEB3D6] leading-relaxed">
              Late October in Shirpur is generally warm and dry during the afternoon (28°C–33°C) and pleasantly cool in the early morning and late evenings (18°C–22°C).
            </p>
            <p className="text-xs text-[#F4EFE3]/90 leading-relaxed">
              Athletes should ensure adequate daytime hydration and sunscreen, while bringing light cotton clothing plus a light pullover or jacket for evening events.
            </p>
          </div>

          {/* Checklist */}
          <div className="card-championship p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#20255A] text-gold border border-gold/30">
                <CheckSquare className="w-6 h-6 text-gold" />
              </div>
              <h3 className="text-xl font-serif font-bold text-gold-light">
                Participant Checklist
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-[#F4EFE3]">
              {packingList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-gold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </NavyPatchBackground>
  );
}
