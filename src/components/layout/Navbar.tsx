"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Shield } from "lucide-react";
import { TOURNAMENT_CONFIG } from "@/config/tournament";
import BrandLogos from "@/components/ui/BrandLogos";

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
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
  }

  const navLinks = [
    { label: "Home", href: "/home" },
    { label: "Sports", href: "/sports" },
    { label: "Teams", href: "/teams" },
    { label: "Campuses", href: "/campuses" },
    { label: "Points & Stats", href: "/standings" },
    { label: "Gallery", href: "/gallery" },
    { label: "Travel & Stay", href: "/travel" },
    { label: "Contact", href: "/contact" },
  ];

  const moreLinks = [
    { label: "Rules & Eligibility", href: "/rules" },
    { label: "Previous Edition", href: "/previous-edition" },
    { label: "FAQ", href: "/rules#faq" },
  ];

  const isActive = (href: string) => {
    if (href === "/home") return pathname === "/home";
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0F122E]/90 backdrop-blur-md shadow-lg border-b border-[rgba(217,178,111,0.2)]"
          : "bg-[#0F122E]/75 backdrop-blur-sm border-b border-[rgba(217,178,111,0.12)]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BrandLogos
          size="lg"
          mobileSize="md"
          className="h-[72px] md:h-24"
          rightAddon={
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Small Admin link at far right just before NMIMS logo */}
              <Link
                href="/admin/login"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[rgba(217,178,111,0.3)] bg-[#161A40]/80 hover:bg-gold/15 text-gold text-xs font-semibold tracking-wider transition-all"
                title="Organisers / Admin Login"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>

              {/* Mobile hamburger button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-lg text-gold hover:text-gold-light focus:outline-none focus:ring-2 focus:ring-gold"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          }
        >
          {/* CENTRE: Navigation Links */}
          <div className="hidden xl:flex flex-col items-center justify-center flex-1 px-4">
            <nav className="flex items-center space-x-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-2.5 py-1.5 text-xs lg:text-sm font-medium transition-colors duration-200 rounded-md ${
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
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs lg:text-sm font-medium transition-colors duration-200 rounded-md ${
                    pathname === "/rules" || pathname === "/previous-edition"
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

          {/* DESKTOP (LG but not XL): Condensed Links */}
          <div className="hidden lg:flex xl:hidden flex-1 px-2 justify-center">
            <nav className="flex items-center space-x-1">
              {navLinks.slice(0, 5).map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-2 py-1.5 text-xs font-medium transition-colors ${
                      active ? "text-gold font-semibold" : "text-[#F4EFE3] hover:text-gold"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {/* More Dropdown for medium-large */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  onBlur={() => setTimeout(() => setMoreDropdownOpen(false), 200)}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-[#F4EFE3] hover:text-gold"
                >
                  More <ChevronDown className="w-3 h-3" />
                </button>
                {moreDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#161A40] border border-[rgba(217,178,111,0.25)] shadow-xl py-1 z-50 backdrop-blur-md">
                    {[...navLinks.slice(5), ...moreLinks].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 text-xs text-[#F4EFE3] hover:bg-[#20255A] hover:text-gold"
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
            <Link href="/home" className="text-xs sm:text-sm font-serif font-semibold text-gold tracking-wide truncate max-w-[200px] sm:max-w-[260px]">
              {TOURNAMENT_CONFIG.shortName}
            </Link>
          </div>
        </BrandLogos>
      </div>

      {/* MOBILE FULL-SCREEN NAV OVERLAY */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[72px] z-40 bg-[#0F122E]/95 backdrop-blur-xl border-t border-[rgba(217,178,111,0.2)] flex flex-col justify-between p-6 overflow-y-auto animate-fadeIn">
          <div className="space-y-4 pt-2">
            <div className="text-center pb-3 border-b border-[rgba(217,178,111,0.15)]">
              <span className="text-[11px] uppercase tracking-widest text-[#AEB3D6]">
                {TOURNAMENT_CONFIG.organizedBy}
              </span>
              <h2 className="text-sm font-serif font-bold text-gold mt-0.5">
                {TOURNAMENT_CONFIG.fullName}
              </h2>
            </div>

            <nav className="flex flex-col space-y-1.5">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2.5 rounded-xl text-base font-medium transition-all ${
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
                <p className="px-4 text-xs font-semibold uppercase tracking-wider text-[#AEB3D6] mb-1.5">
                  More Resources
                </p>
                {moreLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2 rounded-lg text-sm text-[#F4EFE3] hover:text-gold hover:bg-[#161A40]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href="/admin/login"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gold/15 border border-gold/40 text-gold font-bold text-sm tracking-wide"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Portal Login</span>
                </Link>
              </div>
            </nav>
          </div>

          <div className="pt-4 border-t border-[rgba(217,178,111,0.15)] text-center text-xs text-[#AEB3D6]">
            <p>{TOURNAMENT_CONFIG.hostCampus}</p>
            <p className="mt-0.5 text-gold font-mono">{TOURNAMENT_CONFIG.dates}</p>
          </div>
        </div>
      )}
    </header>
  );
}
