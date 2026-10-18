import React from "react";
import Link from "next/link";
import { MapPin, Phone, Trophy, Award } from "lucide-react";
import { TOURNAMENT_CONFIG, SPORTS_CONFIG } from "@/config/tournament";
import { LEADERSHIP_CONFIG, COMMITTEE_CONFIG } from "@/config/contacts";
import BrandLogos from "@/components/ui/BrandLogos";

export default function Footer() {
  return (
    <footer className="relative bg-[#0F122E] border-t border-[rgba(217,178,111,0.25)] text-[#F4EFE3] overflow-hidden pt-16 pb-12">
      {/* Background ambient texture */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-royal rounded-full filter blur-3xl"
          style={{ clipPath: "polygon(0 0, 100% 0, 80% 100%, 0 80%)" }}
        />
        <div className="absolute top-10 right-10 w-96 h-96 bg-cobalt rounded-full filter blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top bar with dual logos: BrandLogos size="md" (72x72) */}
        <div className="pb-10 border-b border-[rgba(217,178,111,0.15)]">
          <BrandLogos
            size="md"
            leftAddon={
              <div className="hidden sm:flex items-center space-x-4">
                <div className="h-8 w-px bg-[rgba(217,178,111,0.2)]" />
                <span className="text-xs text-[#AEB3D6]">
                  Shri Vile Parle Kelavani Mandal
                </span>
              </div>
            }
            rightAddon={
              <div className="hidden sm:flex items-center space-x-4">
                <span className="text-xs text-[#AEB3D6] text-right">
                  Deemed to be UNIVERSITY
                </span>
                <div className="h-8 w-px bg-[rgba(217,178,111,0.2)]" />
              </div>
            }
          />
        </div>

        {/* Main 4-column footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-12 border-b border-[rgba(217,178,111,0.15)]">
          {/* Col 1: Championship Info & Venue */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#161A40] border border-[rgba(217,178,111,0.3)] text-xs font-semibold text-gold">
              <Trophy className="w-3.5 h-3.5" />
              <span>Official Sports Portal</span>
            </div>
            <h3 className="text-lg font-serif font-bold text-gold-light leading-snug">
              {TOURNAMENT_CONFIG.fullName}
            </h3>
            <p className="text-xs text-[#AEB3D6] leading-relaxed">
              Hosted by {TOURNAMENT_CONFIG.hostCampus}
            </p>
            <div className="pt-2 text-xs text-[#AEB3D6] flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
              <div className="whitespace-pre-line leading-relaxed font-sans">
                {TOURNAMENT_CONFIG.venueAddress}
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold mb-4">
              Championship Links
            </h4>
            <ul className="space-y-2.5 text-sm text-[#AEB3D6]">
              <li>
                <Link href="/home" className="hover:text-gold transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link href="/sports" className="hover:text-gold transition-colors">
                  Sports & Fixtures
                </Link>
              </li>
              <li>
                <Link href="/teams" className="hover:text-gold transition-colors">
                  Participating Teams
                </Link>
              </li>
              <li>
                <Link href="/campuses" className="hover:text-gold transition-colors">
                  Campus Contingents
                </Link>
              </li>
              <li>
                <Link href="/standings" className="hover:text-gold transition-colors">
                  Points & Stats
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-gold transition-colors">
                  Tournament Gallery
                </Link>
              </li>
              <li>
                <Link href="/travel" className="hover:text-gold transition-colors">
                  Travel & Accommodation
                </Link>
              </li>
              <li>
                <Link href="/rules" className="hover:text-gold transition-colors">
                  Rules & Eligibility
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-gold transition-colors text-xs text-gold/70">
                  Admin Portal Login →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Sports Dashboards */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold mb-4">
              Sports Categories
            </h4>
            <ul className="space-y-2.5 text-sm text-[#AEB3D6]">
              {SPORTS_CONFIG.map((sport) => (
                <li key={sport.id}>
                  <Link
                    href={`/sports/${sport.slug}`}
                    className="hover:text-gold transition-colors flex items-center justify-between group"
                  >
                    <span>
                      {sport.icon} {sport.name}
                    </span>
                    <span className="text-xs text-gold/60 group-hover:text-gold">
                      {sport.hasMen && sport.hasWomen ? "M / W" : "Men"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Key Contacts */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold mb-4">
              Key Contacts
            </h4>
            <div className="space-y-4 text-xs">
              {/* Leadership (Single card, no phone number, no buttons) */}
              <div className="p-3 rounded-lg bg-[#161A40] border border-[rgba(217,178,111,0.25)]">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gold uppercase tracking-wider mb-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Leadership</span>
                </div>
                <div className="font-serif font-bold text-gold text-sm">{LEADERSHIP_CONFIG.name}</div>
                <div className="text-[#AEB3D6] text-[11px] mt-0.5">{LEADERSHIP_CONFIG.role}</div>
              </div>

              {/* Organising Committee */}
              <div className="space-y-2">
                <div className="font-semibold text-[#AEB3D6] text-[11px] uppercase tracking-wide">
                  Organising Committee:
                </div>
                {COMMITTEE_CONFIG.map((member) => (
                  <div key={member.name} className="flex items-center justify-between py-1 border-b border-[rgba(217,178,111,0.1)]">
                    <div>
                      <span className="text-[#F4EFE3] font-medium block">{member.name}</span>
                      <span className="text-[#AEB3D6] text-[10px] block">{member.role}</span>
                    </div>
                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className="text-gold hover:underline font-mono text-[11px] flex items-center gap-1 ml-2"
                      >
                        <Phone className="w-3 h-3 text-gold/70" />
                        <span>{member.phone}</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright, privacy notice, and navigation */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-[#AEB3D6] gap-4 text-center md:text-left">
          <div className="space-y-1">
            <p>© 2026 SVKM&apos;s NMIMS Sports Department. All rights reserved.</p>
            <p className="text-[11px] text-[#AEB3D6]/70">
              Privacy Notice: This site does not collect personal data from visitors.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/rules" className="hover:text-gold transition-colors">
              Eligibility Rules
            </Link>
            <Link href="/travel" className="hover:text-gold transition-colors">
              Reporting: 26 Oct 12:00 Noon
            </Link>
            <Link href="/contact" className="hover:text-gold transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
