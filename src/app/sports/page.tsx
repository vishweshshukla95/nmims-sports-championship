import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Trophy, Calendar, CheckCircle2 } from "lucide-react";
import NavyPatchBackground from "@/components/ui/NavyPatchBackground";
import { SPORTS_CONFIG, TOURNAMENT_CONFIG } from "@/config/tournament";

export const metadata = {
  title: "Sports Overview",
  description:
    "Explore all 6 disciplines and 10 categories at the SVKM'S NMIMS Inter Campus Sports Championship 2026-27.",
};

export default function SportsOverviewPage() {
  return (
    <NavyPatchBackground variant="calm" className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="title-ornament text-xs font-mono font-semibold uppercase tracking-widest text-gold mb-2">
            Athletic Disciplines
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black uppercase text-gold-gradient tracking-tight">
            Championship Sports
          </h1>
          <p className="mt-4 text-base text-[#AEB3D6]">
            Select a sport to view its live fixtures schedule, completed match scorecards, Man of the Match awards, and official statistical leaderboards.
          </p>
        </div>

        {/* 6 Sport Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SPORTS_CONFIG.map((sport) => (
            <div
              key={sport.id}
              className="card-championship overflow-hidden flex flex-col group h-[440px] relative"
            >
              {/* Photo Banner */}
              <div className="relative w-full h-56 overflow-hidden">
                <Image
                  src={sport.image}
                  alt={`${sport.name} Championship`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161A40] via-[#161A40]/40 to-transparent" />

                {/* Category Chips */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {sport.hasMen && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#161A40]/90 border border-men text-[11px] font-bold text-men uppercase tracking-wider backdrop-blur-md">
                      Men
                    </span>
                  )}
                  {sport.hasWomen && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#161A40]/90 border border-women text-[11px] font-bold text-women uppercase tracking-wider backdrop-blur-md">
                      Women
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{sport.icon}</span>
                    <h2 className="text-2xl font-serif font-bold text-gold-light group-hover:text-gold transition-colors">
                      {sport.name}
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-[#AEB3D6] line-clamp-2 leading-relaxed">
                    {sport.description}
                  </p>
                </div>

                {/* Counters of Matches Scheduled and Completed */}
                <div className="space-y-4 pt-4 border-t border-[rgba(217,178,111,0.15)]">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-[#0F122E] border border-[rgba(217,178,111,0.1)] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gold" />
                      <span className="text-[#AEB3D6]">Fixtures Pending</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#0F122E] border border-[rgba(217,178,111,0.1)] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                      <span className="text-[#AEB3D6]">0 Completed</span>
                    </div>
                  </div>

                  <Link
                    href={`/sports/${sport.slug}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider shadow-sm"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </NavyPatchBackground>
  );
}
