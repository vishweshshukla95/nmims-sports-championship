"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trophy,
  ArrowRight,
  ChevronDown,
  MapPin,
  Calendar,
  Users,
  Award,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import NavyPatchBackground from "@/components/ui/NavyPatchBackground";
import CountdownTimer from "@/components/ui/CountdownTimer";
import AnnouncementTicker from "@/components/ui/AnnouncementTicker";
import CampusBadge from "@/components/ui/CampusBadge";
import FAQAccordion from "@/components/ui/FAQAccordion";
import ImageLightbox, { LightboxImage } from "@/components/ui/ImageLightbox";
import {
  TOURNAMENT_CONFIG,
  SPORTS_CONFIG,
  CAMPUSES_CONFIG,
} from "@/config/tournament";

export default function HomePage() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Gallery highlight items for preview
  const galleryHighlights: LightboxImage[] = [
    {
      src: "/images/gallery/highlight-01-champions.webp",
      alt: "Champions with the trophy",
      caption: "Champions celebrating with the championship trophy",
    },
    {
      src: "/images/gallery/highlight-02-all-campuses-group.webp",
      alt: "All seven campuses together",
      caption: "Athletes and officials from all 7 NMIMS campuses together",
    },
    {
      src: "/images/gallery/highlight-03-campus-captains.webp",
      alt: "Campus captains at march-past",
      caption: "Campus team captains at the ceremonial march-past",
    },
    {
      src: "/images/gallery/highlight-04-opening-ceremony-anthem.webp",
      alt: "Opening ceremony national anthem",
      caption: "Opening ceremony and national anthem",
    },
    {
      src: "/images/gallery/highlight-07-trophies.webp",
      alt: "The championship trophies",
      caption: "Championship trophies awaiting this year's champions",
    },
    {
      src: "/images/gallery/highlight-08-closing-group.webp",
      alt: "Closing ceremony celebration",
      caption: "Closing ceremony gathering of athletes and dignitaries",
    },
    {
      src: "/images/gallery/highlight-09-in-the-news.webp",
      alt: "In the News – Punya Nagari",
      caption: "Featured in Punya Nagari, Dhule Edition",
    },
  ];

  const openLightboxAt = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="relative bg-navy text-text-main overflow-hidden">
      {/* 1. HERO SECTION (Front Cover) */}
      <section className="relative min-h-[95vh] flex flex-col justify-between overflow-hidden">
        {/* Background Image with Ken Burns Zoom & Navy Overlay */}
        <div className="absolute inset-0 -z-30 overflow-hidden">
          <Image
            src="/images/hero-cover.webp"
            alt="SVKM'S NMIMS Inter Campus Sports Championship Champions"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center scale-105 animate-kenBurns"
          />
          {/* Layered overlays: navy tint + angled royal patch texture */}
          <div
            className="absolute inset-0 -z-20 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(15,18,46,0.55) 0%, rgba(27,31,75,0.85) 60%, #1B1F4B 100%)",
            }}
          />
        </div>

        {/* Navy Patch background angled shapes on top of image */}
        <div className="absolute inset-0 -z-10 pointer-events-none opacity-40">
          <NavyPatchBackground variant="hero" className="w-full h-full" />
        </div>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-16 flex-1 flex flex-col justify-center items-center text-center">
          {/* Small Gold Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#161A40]/90 border border-gold/40 text-xs sm:text-sm font-semibold uppercase tracking-widest text-gold mb-6 shadow-md backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-gold-light" />
            <span>{TOURNAMENT_CONFIG.organizedBy}</span>
          </div>

          {/* Official Championship Title (2-3 lines in Cinzel serif) */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-black tracking-tight leading-tight uppercase max-w-5xl text-gold-gradient drop-shadow-md">
            SVKM&apos;S NMIMS
            <br />
            INTER CAMPUS SPORTS CHAMPIONSHIP
            <br />
            <span className="tracking-widest">2026-27</span>
          </h1>

          {/* Subline */}
          <p className="mt-6 text-base sm:text-xl md:text-2xl text-[#F4EFE3] font-light max-w-3xl drop-shadow">
            {TOURNAMENT_CONFIG.dates} · {TOURNAMENT_CONFIG.hostCampus}
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
            <Link
              href="#sports"
              className="w-full sm:w-auto px-8 py-4 rounded-full btn-gold text-sm sm:text-base font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-glow"
            >
              <span>Explore Sports</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/travel"
              className="w-full sm:w-auto px-8 py-4 rounded-full btn-royal text-sm sm:text-base font-semibold tracking-wide flex items-center justify-center gap-2"
            >
              <span>Travel & Stay</span>
              <MapPin className="w-4 h-4 text-gold" />
            </Link>
          </div>
        </div>

        {/* Scroll Cue */}
        <div className="pb-8 flex flex-col items-center justify-center text-gold/70 animate-bounce">
          <span className="text-[11px] uppercase tracking-widest font-mono">
            Scroll to Explore
          </span>
          <ChevronDown className="w-5 h-5 text-gold mt-1" />
        </div>
      </section>

      {/* 2. COUNTDOWN TIMER */}
      <CountdownTimer />

      {/* 3. ANNOUNCEMENT TICKER */}
      <div className="mt-8">
        <AnnouncementTicker />
      </div>

      {/* 4. SPORTS SECTION: "Choose Your Sport" */}
      <section id="sports" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="title-ornament text-xs font-mono font-semibold uppercase tracking-widest text-gold mb-2">
            Championship Disciplines
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black uppercase text-gold-gradient">
            Choose Your Sport
          </h2>
          <p className="mt-4 text-base text-[#AEB3D6]">
            Six disciplines, 10 categories, and 70 inter-campus teams competing for glory in Shirpur.
          </p>
        </div>

        {/* Grid of 6 Sports Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SPORTS_CONFIG.map((sport) => (
            <div
              key={sport.id}
              className="group card-championship overflow-hidden flex flex-col relative h-[420px]"
            >
              {/* Sport Photo with Navy Gradient */}
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
                    <h3 className="text-2xl font-serif font-bold text-gold-light group-hover:text-gold transition-colors">
                      {sport.name}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#AEB3D6] leading-relaxed line-clamp-2">
                    {sport.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[rgba(217,178,111,0.15)] flex items-center justify-between">
                  <span className="text-xs text-gold/80 font-mono">
                    {sport.hasMen && sport.hasWomen ? "2 Categories" : "1 Category"}
                  </span>
                  <Link
                    href={`/sports/${sport.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#20255A] hover:bg-gold hover:text-indigo-black border border-gold/40 text-xs font-bold text-gold uppercase tracking-wider transition-all"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. STATS STRIP (Animated Counters) */}
      <section className="py-14 bg-gradient-to-r from-[#0F122E] via-[#161A40] to-[#0F122E] border-y border-[rgba(217,178,111,0.25)] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { label: "SPORTS DISCIPLINES", count: "6", icon: "🏆" },
              { label: "NMIMS CAMPUSES", count: "7", icon: "🏛️" },
              { label: "COMPETITION CATEGORIES", count: "10", icon: "⚡" },
              { label: "CHAMPIONSHIP DAYS", count: "5", icon: "📅" },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[#0F122E]/60 border border-[rgba(217,178,111,0.18)] flex flex-col items-center justify-center shadow-inner"
              >
                <span className="text-2xl mb-1">{stat.icon}</span>
                <span className="text-4xl sm:text-5xl font-mono font-black text-gold-gradient tracking-tight">
                  {stat.count}
                </span>
                <span className="text-xs font-semibold text-[#AEB3D6] tracking-widest uppercase mt-2">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PARTICIPATING CAMPUSES */}
      <section className="py-20 relative overflow-hidden">
        {/* Background photo: highlight-03-campus-captains.webp (darkened) */}
        <div className="absolute inset-0 -z-20">
          <Image
            src="/images/gallery/highlight-03-campus-captains.webp"
            alt="Captains of participating NMIMS campuses"
            fill
            sizes="100vw"
            className="object-cover object-center opacity-15 filter brightness-50"
          />
          <div className="absolute inset-0 bg-[#1B1F4B]/90" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="title-ornament text-xs font-mono font-semibold uppercase tracking-widest text-gold mb-2">
              Pan-India Athletic Pride
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black uppercase text-gold-gradient">
              Participating Campuses
            </h2>
            <p className="mt-4 text-base text-[#AEB3D6]">
              Athletes representing seven premier NMIMS campuses convene at Mukesh Patel Technology Park.
            </p>
          </div>

          {/* 7 Campus Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {CAMPUSES_CONFIG.map((campus) => (
              <Link
                key={campus.id}
                href={`/teams?campus=${campus.shortCode}`}
                className="group p-6 rounded-2xl bg-[#161A40]/85 border border-[rgba(217,178,111,0.2)] hover:border-gold hover:shadow-gold-glow transition-all duration-300 flex flex-col items-center text-center relative"
              >
                {/* Host ribbon */}
                {campus.isHost && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-gold via-gold-light to-gold text-indigo-black font-black text-[10px] uppercase tracking-wider shadow">
                    HOST
                  </div>
                )}

                <CampusBadge
                  shortCode={campus.shortCode}
                  size="lg"
                  isHost={campus.isHost}
                  className="mb-4"
                />

                <h3 className="text-lg font-serif font-bold text-gold-light group-hover:text-gold transition-colors">
                  {campus.name}
                </h3>
                <p className="text-xs text-[#AEB3D6] mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gold/70" />
                  <span>
                    {campus.city}, {campus.state}
                  </span>
                </p>

                <div className="mt-4 pt-3 border-t border-[rgba(217,178,111,0.15)] w-full text-center">
                  <span className="text-[11px] font-semibold text-gold/80 group-hover:text-gold uppercase tracking-wider flex items-center justify-center gap-1">
                    View Squads <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. ABOUT THE CHAMPIONSHIP */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Image col: highlight-02-all-campuses-group.webp */}
          <div className="lg:col-span-6 relative h-[380px] sm:h-[460px] rounded-3xl overflow-hidden border-2 border-gold/30 shadow-2xl">
            <Image
              src="/images/gallery/highlight-02-all-campuses-group.webp"
              alt="All seven NMIMS campuses gathered at the championship"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F122E]/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-[#0F122E]/80 backdrop-blur-md border border-gold/20 text-xs text-[#AEB3D6]">
              All 7 campuses united at Mukesh Patel Technology Park, Shirpur.
            </div>
          </div>

          {/* Text col */}
          <div className="lg:col-span-6 space-y-6">
            <div className="title-ornament justify-start text-xs font-mono font-semibold uppercase tracking-widest text-gold">
              Excellence in Collegiate Athletics
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black uppercase text-gold-gradient leading-tight">
              About The Championship
            </h2>
            <p className="text-base text-[#F4EFE3]/90 leading-relaxed font-normal">
              Organised by the <strong>Sports Department, SVKM&apos;s NMIMS</strong>, the Inter Campus Sports Championship is the pinnacle athletic summit bringing together over 800 student-athletes from Mumbai, Navi Mumbai, Shirpur, Indore, Bengaluru, Hyderabad, and Chandigarh.
            </p>
            <p className="text-base text-[#AEB3D6] leading-relaxed">
              Hosted at the world-class sports complex of <strong>Mukesh Patel Technology Park (MPTP), Shirpur Campus</strong>, the five-day tournament features standard international facilities, floodlit arenas, professional federation officiating, and spirited collegiate camaraderie.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                href="/rules"
                className="px-6 py-3 rounded-full btn-outline-gold text-xs sm:text-sm uppercase tracking-wider font-semibold"
              >
                Rules & Eligibility
              </Link>
              <Link
                href="/travel"
                className="px-6 py-3 rounded-full btn-royal text-xs sm:text-sm tracking-wider font-semibold"
              >
                Host Venue Details
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. GALLERY PREVIEW ("Highlights") */}
      <section className="py-20 bg-[#161A40]/40 border-y border-[rgba(217,178,111,0.2)] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
            <div>
              <div className="title-ornament justify-start text-xs font-mono font-semibold uppercase tracking-widest text-gold mb-2">
                Memories in Motion
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-black uppercase text-gold-gradient">
                Championship Highlights
              </h2>
            </div>

            <Link
              href="/gallery"
              className="px-6 py-3 rounded-full btn-gold text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <span>View Tournament Gallery</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 6 Photos Masonry Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryHighlights.slice(0, 6).map((item, idx) => (
              <div
                key={idx}
                onClick={() => openLightboxAt(idx)}
                className="group relative h-48 sm:h-64 rounded-2xl overflow-hidden cursor-pointer border border-[rgba(217,178,111,0.2)] hover:border-gold hover:shadow-gold-glow transition-all duration-300"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F122E]/90 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                <div className="absolute bottom-3 left-3 right-3 text-xs font-serif font-bold text-gold-light truncate drop-shadow">
                  {item.caption}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. "WHO WILL LIFT THE TROPHY?" */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#161A40] via-[#20255A] to-[#0F122E] border-2 border-gold/40 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Text info */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-xs font-bold text-gold uppercase tracking-wider">
                <Trophy className="w-4 h-4 text-gold-light" />
                <span>The Ultimate Prize</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black uppercase text-gold-gradient">
                Who Will Lift The Trophy?
              </h2>
              <p className="text-sm sm:text-base text-[#F4EFE3]/90 leading-relaxed">
                Six prestigious trophies await the victors across Cricket, Football, Basketball, Volleyball, Table Tennis, and Lawn Tennis. Seven campuses arrive with determination, but only one champion will claim each crown.
              </p>
              <div className="pt-2 flex flex-wrap gap-3 text-xs text-gold/90 font-mono">
                <span className="px-3 py-1 rounded-lg bg-[#0F122E] border border-gold/20">
                  🏅 Official MVP Awards
                </span>
                <span className="px-3 py-1 rounded-lg bg-[#0F122E] border border-gold/20">
                  ⭐ Man of the Match Honours
                </span>
                <span className="px-3 py-1 rounded-lg bg-[#0F122E] border border-gold/20">
                  🏆 Overall Campus Champions
                </span>
              </div>
            </div>

            {/* Photo: highlight-07-trophies.webp */}
            <div className="lg:col-span-5 relative h-64 sm:h-80 rounded-2xl overflow-hidden border border-gold/30 shadow-lg">
              <Image
                src="/images/gallery/highlight-07-trophies.webp"
                alt="Six championship trophies on display table"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F122E]/60 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* 10. IN THE NEWS */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="title-ornament text-xs font-mono font-semibold uppercase tracking-widest text-gold mb-2">
              Media Coverage
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-black uppercase text-gold-gradient">
              In The News
            </h2>
          </div>

          <div
            onClick={() => openLightboxAt(6)}
            className="group card-championship p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 cursor-pointer hover:border-gold hover:shadow-gold-glow"
          >
            <div className="relative w-full md:w-60 h-48 sm:h-56 rounded-xl overflow-hidden border border-gold/30 flex-shrink-0">
              <Image
                src="/images/gallery/highlight-09-in-the-news.webp"
                alt="Featured in Punya Nagari newspaper clipping"
                fill
                sizes="(max-width: 768px) 100vw, 240px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-indigo-black/20 group-hover:bg-transparent transition-colors" />
            </div>

            <div className="space-y-3 flex-1">
              <span className="px-3 py-1 rounded-full bg-gold/15 text-gold text-xs font-bold uppercase tracking-wider">
                Press Release & Coverage
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-gold-light group-hover:text-gold transition-colors">
                Featured in Punya Nagari, Dhule Edition
              </h3>
              <p className="text-sm text-[#AEB3D6] leading-relaxed">
                Extensive regional media coverage celebrating the inauguration and athletic spirit of the SVKM&apos;s NMIMS Inter Campus Sports Championship hosted in Shirpur. Click to view the full newspaper clipping with pinch-zoom.
              </p>
              <span className="text-xs font-bold text-gold inline-flex items-center gap-1 group-hover:underline">
                Open in Lightbox <ExternalLink className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 11. TOP PERFORMERS (Conditional on results; placeholder card) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="title-ornament text-xs font-mono font-semibold uppercase tracking-widest text-gold mb-2">
            Athletic Excellence
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-black uppercase text-gold-gradient">
            Top Performers & MVPs
          </h2>
          <p className="text-sm text-[#AEB3D6] mt-2">
            The #1 athletes leading MVP standings in each sport will be celebrated here as matches conclude.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-[#161A40]/70 border border-[rgba(217,178,111,0.2)] text-center max-w-2xl mx-auto">
          <Award className="w-10 h-10 text-gold mx-auto mb-3" />
          <h3 className="text-lg font-serif font-bold text-gold-light">
            Leaderboard Updates Begin Day 1
          </h3>
          <p className="text-xs text-[#AEB3D6] mt-2 leading-relaxed">
            All player stats, Man of the Match awards, and MVP leaderboards are computed dynamically from official match records.
          </p>
          <div className="mt-5">
            <Link
              href="/leaderboard"
              className="inline-block px-5 py-2.5 rounded-full btn-outline-gold text-xs font-bold uppercase tracking-wider"
            >
              View Leaderboards Overview
            </Link>
          </div>
        </div>
      </section>

      {/* 12. FAQ ACCORDION */}
      <section className="py-20 relative overflow-hidden">
        {/* Background photo: highlight-08-closing-group.webp (heavily darkened) */}
        <div className="absolute inset-0 -z-20">
          <Image
            src="/images/gallery/highlight-08-closing-group.webp"
            alt="FAQ Background"
            fill
            sizes="100vw"
            className="object-cover object-center opacity-10 filter brightness-40"
          />
          <div className="absolute inset-0 bg-[#0F122E]/90" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="title-ornament text-xs font-mono font-semibold uppercase tracking-widest text-gold mb-2">
              Need Assistance?
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black uppercase text-gold-gradient">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-base text-[#AEB3D6]">
              Essential details regarding reporting, travel pick-up, accommodation, food, and rules.
            </p>
          </div>

          <FAQAccordion />
        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      <ImageLightbox
        images={galleryHighlights}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNext={() =>
          setLightboxIndex((prev) => (prev + 1) % galleryHighlights.length)
        }
        onPrev={() =>
          setLightboxIndex(
            (prev) =>
              (prev - 1 + galleryHighlights.length) % galleryHighlights.length
          )
        }
      />
    </div>
  );
}
