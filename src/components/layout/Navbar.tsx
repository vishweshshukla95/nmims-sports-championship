"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { TOURNAMENT_CONFIG } from "@/config/tournament";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Sports", href: "/sports" },
    { label: "Teams", href: "/teams" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Gallery", href: "/gallery" },
    { label: "Previous Edition", href: "/previous-edition" },
    { label: "Travel & Stay", href: "/travel" },
    { label: "Contact", href: "/contact" },
  ];

  const moreLinks = [
    { label: "Rules & Eligibility", href: "/rules" },
    { label: "FAQ", href: "/rules#faq" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0F122E]/85 backdrop-blur-md shadow-lg border-b border-[rgba(217,178,111,0.2)]"
          : "bg-[#0F122E]/70 backdrop-blur-sm border-b border-[rgba(217,178,111,0.12)]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* FAR LEFT: SVKM Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              href="/"
              className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
              title="SVKM - Shri Vile Parle Kelavani Mandal"
            >
              <div className="relative h-10 w-24 sm:h-12 sm:w-28 md:h-[52px] md:w-32 flex items-center">
                <Image
                  src="/images/svkm-logo.webp"
                  alt="SVKM Logo"
                  width={130}
                  height={52}
                  className="object-contain h-full w-auto max-h-10 md:max-h-[52px]"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* CENTRE: Championship Name & Desktop Navigation */}
          <div className="hidden lg:flex flex-col items-center justify-center flex-1 px-4">
            <nav className="flex items-center space-x-1 xl:space-x-2">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-3 py-1.5 text-sm font-medium transition-colors duration-200 rounded-md ${
                      active
                        ? "text-gold font-semibold"
                        : "text-[#F4EFE3] hover:text-gold-light"
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-[#D9B26F] to-transparent" />
                    )}
                  </Link>
                );
              })}

              {/* More Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  onBlur={() => setTimeout(() => setMoreDropdownOpen(false), 200)}
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium transition-colors duration-200 rounded-md ${
                    pathname === "/rules"
                      ? "text-gold font-semibold"
                      : "text-[#F4EFE3] hover:text-gold-light"
                  }`}
                  aria-expanded={moreDropdownOpen}
                >
                  More
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {moreDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#161A40] border border-[rgba(217,178,111,0.25)] shadow-xl py-1 z-50 backdrop-blur-md">
                    {moreLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-[#F4EFE3] hover:bg-[#20255A] hover:text-gold transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* MOBILE: Center Short Title */}
          <div className="flex lg:hidden flex-1 px-2 justify-center text-center">
            <span className="text-xs sm:text-sm font-serif font-semibold text-gold tracking-wide truncate max-w-[200px] sm:max-w-[260px]">
              {TOURNAMENT_CONFIG.shortName}
            </span>
          </div>

          {/* FAR RIGHT: Mobile Menu Toggle + NMIMS Logo */}
          <div className="flex-shrink-0 flex items-center space-x-2 sm:space-x-3">
            {/* Mobile hamburger button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-gold hover:text-gold-light focus:outline-none focus:ring-2 focus:ring-gold"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* FAR RIGHT: NMIMS Logo White */}
            <Link
              href="/"
              className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
              title="NMIMS Deemed-to-be University"
            >
              <div className="relative h-10 w-24 sm:h-12 sm:w-28 md:h-[52px] md:w-36 flex items-center justify-end">
                <Image
                  src="/images/nmims-logo-white.webp"
                  alt="NMIMS Crest"
                  width={140}
                  height={52}
                  className="object-contain h-full w-auto max-h-10 md:max-h-[52px]"
                  priority
                />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* MOBILE FULL-SCREEN NAV OVERLAY */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-40 bg-[#0F122E]/95 backdrop-blur-xl border-t border-[rgba(217,178,111,0.2)] flex flex-col justify-between p-6 overflow-y-auto animate-fadeIn">
          <div className="space-y-4 pt-4">
            <div className="text-center pb-4 border-b border-[rgba(217,178,111,0.15)]">
              <span className="text-xs uppercase tracking-widest text-[#AEB3D6]">
                {TOURNAMENT_CONFIG.organizedBy}
              </span>
              <h2 className="text-base font-serif font-bold text-gold mt-1">
                {TOURNAMENT_CONFIG.fullName}
              </h2>
            </div>

            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-3 rounded-xl text-lg font-medium transition-all ${
                      active
                        ? "bg-[#20255A] text-gold font-bold border-l-4 border-gold"
                        : "text-[#F4EFE3] hover:bg-[#161A40] hover:text-gold"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="pt-2 border-t border-[rgba(217,178,111,0.15)]">
                <p className="px-4 text-xs font-semibold uppercase tracking-wider text-[#AEB3D6] mb-2">
                  More Resources
                </p>
                {moreLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2.5 rounded-lg text-base text-[#F4EFE3] hover:text-gold hover:bg-[#161A40]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>

          <div className="pt-6 border-t border-[rgba(217,178,111,0.15)] text-center text-xs text-[#AEB3D6]">
            <p>{TOURNAMENT_CONFIG.hostCampus}</p>
            <p className="mt-1 text-gold">{TOURNAMENT_CONFIG.dates}</p>
          </div>
        </div>
      )}
    </header>
  );
}
