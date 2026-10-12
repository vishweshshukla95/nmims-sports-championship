import React from "react";
import Image from "next/image";
import {
  Phone,
  MessageSquare,
  MapPin,
  ExternalLink,
  Shield,
  Users,
} from "lucide-react";
import NavyPatchBackground from "@/components/ui/NavyPatchBackground";
import { TOURNAMENT_CONFIG } from "@/config/tournament";
import { CONTACTS_CONFIG } from "@/config/contacts";

export const metadata = {
  title: "Contact",
  description:
    "Official contacts for SVKM'S NMIMS Inter Campus Sports Championship 2026-27. Sports Director Tushar Jain and Organising Committee.",
};

export default function ContactPage() {
  const director = CONTACTS_CONFIG.find((c) => c.group === "director");
  const committee = CONTACTS_CONFIG.filter((c) => c.group === "committee");

  return (
    <NavyPatchBackground variant="calm" className="min-h-screen pb-24">
      {/* 1. Header Banner: highlight-06-felicitation.webp */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden border-b border-[rgba(217,178,111,0.25)]">
        <Image
          src="/images/gallery/highlight-06-felicitation.webp"
          alt="Felicitation of dignitaries"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B1F4B] via-[#161A40]/75 to-[#0F122E]/85" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative z-10 flex flex-col justify-end pb-8">
          <div className="title-ornament justify-start text-xs font-mono font-semibold uppercase tracking-widest text-gold mb-2">
            Organising Personnel
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black uppercase text-gold-gradient tracking-tight">
            CONTACT COMMITTEE
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#AEB3D6] max-w-xl">
            Reach out to the Sports Director and Organising Committee for arrivals, fixtures, emergencies, and coordination.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        {/* 2. Sports Director (Prominent Card) */}
        {director && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-gold">
                Leadership
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black uppercase text-gold-gradient mt-1">
                Sports Director
              </h2>
            </div>

            <div className="card-championship p-8 border-2 border-gold/40 shadow-gold-glow flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-br from-[#20255A] to-[#161A40]">
              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-serif font-bold text-gold-light">
                  {director.name}
                </h3>
                <p className="text-xs text-[#AEB3D6] mt-1 font-medium">
                  {director.role}
                </p>
                <p className="text-xs text-gold/80 font-mono mt-2">
                  MPTP Shirpur Campus, Dist. Dhule
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <a
                  href={`tel:${director.phone}`}
                  className="px-5 py-2.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {director.phone}</span>
                </a>

                <a
                  href={`https://wa.me/${director.cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-full btn-royal text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-success" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 3. Organising Committee (Cards) */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-gold">
              Coordinators
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black uppercase text-gold-gradient mt-1">
              Organising Committee
            </h2>
            <p className="text-xs sm:text-sm text-[#AEB3D6] mt-1">
              Available 24/7 for team assistance, scheduling updates, and pick-up logistics:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {committee.map((member) => (
              <div
                key={member.name}
                className="card-championship p-6 border border-[rgba(217,178,111,0.25)] flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#20255A] border border-gold/30 flex items-center justify-center text-gold mb-3">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-gold-light">
                    {member.name}
                  </h3>
                  <p className="text-xs text-[#AEB3D6] mt-0.5">
                    {member.role}
                  </p>
                  <a
                    href={`tel:${member.phone}`}
                    className="inline-block text-xs font-mono text-gold mt-2 hover:underline"
                  >
                    {member.phone}
                  </a>
                </div>

                <div className="pt-4 mt-4 border-t border-[rgba(217,178,111,0.15)] flex gap-2">
                  <a
                    href={`tel:${member.phone}`}
                    className="flex-1 py-2 rounded-lg bg-[#20255A] hover:bg-gold hover:text-indigo-black text-gold text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>

                  <a
                    href={`https://wa.me/${member.cleanPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 rounded-lg bg-[#161A40] border border-gold/30 hover:border-gold text-gold text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-success" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Venue Address Card with Map */}
        <div className="max-w-5xl mx-auto p-8 rounded-3xl bg-[#161A40] border-2 border-gold/30 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F122E] border border-gold/30 text-xs text-gold">
                <MapPin className="w-3.5 h-3.5" />
                <span>Host Venue Secretariat</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-gold-light">
                Mukesh Patel Technology Park
              </h3>
              <div className="p-4 rounded-xl bg-[#0F122E] border border-gold/20 text-xs text-[#F4EFE3] whitespace-pre-line leading-relaxed font-sans">
                {TOURNAMENT_CONFIG.venueAddress}
              </div>
              <a
                href={TOURNAMENT_CONFIG.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full btn-royal text-xs font-bold uppercase tracking-wider"
              >
                <span>Google Maps Directions</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="lg:col-span-7 h-72 rounded-2xl overflow-hidden border border-gold/30 shadow-lg">
              <iframe
                src={TOURNAMENT_CONFIG.googleMapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                title="Google Map MPTP Shirpur Contact"
              />
            </div>
          </div>
        </div>
      </div>
    </NavyPatchBackground>
  );
}
