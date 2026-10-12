"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  BarChart2,
  Users,
  Trophy,
  Image as ImageIcon,
  Archive,
  Megaphone,
  Phone,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Simple client authentication check for /admin pages
    if (pathname === "/admin/login") {
      setIsAuthenticated(true);
      return;
    }

    const session = localStorage.getItem("nmims_admin_session");
    if (!session) {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Schedule & Results", href: "/admin/matches", icon: Calendar },
    { label: "Player Stats", href: "/admin/stats", icon: BarChart2 },
    { label: "Teams & Players", href: "/admin/teams", icon: Users },
    { label: "Leaderboards & MVP", href: "/admin/leaderboards", icon: Trophy },
    { label: "Gallery", href: "/admin/gallery", icon: ImageIcon },
    { label: "Archive (Prev)", href: "/admin/archive", icon: Archive },
    { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { label: "Contacts", href: "/admin/contacts", icon: Phone },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem("nmims_admin_session");
    router.push("/admin/login");
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0F122E] flex items-center justify-center text-gold font-serif">
        Verifying Admin Access...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy text-text-main flex flex-col md:flex-row">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0F122E] border-r border-[rgba(217,178,111,0.2)] p-4 select-none flex-shrink-0 min-h-screen">
        {/* Top Branding */}
        <div className="pb-6 mb-6 border-b border-[rgba(217,178,111,0.15)] flex items-center gap-3">
          <div className="relative h-10 w-28">
            <Image
              src="/images/nmims-logo-white.webp"
              alt="NMIMS"
              width={120}
              height={40}
              className="object-contain"
            />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-gold uppercase tracking-wider block">
              Admin Portal
            </span>
            <span className="text-xs font-serif font-bold text-[#F4EFE3]">
              2026-27 Edition
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${
                  active
                    ? "bg-[#20255A] text-gold font-bold border-l-4 border-gold shadow-sm"
                    : "text-[#AEB3D6] hover:bg-[#161A40] hover:text-[#F4EFE3]"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-gold" : "text-[#AEB3D6]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="pt-4 mt-4 border-t border-[rgba(217,178,111,0.15)]">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/40 transition-colors min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <header className="md:hidden flex items-center justify-between p-4 bg-[#0F122E] border-b border-[rgba(217,178,111,0.2)]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-serif font-bold text-gold">
            NMIMS Admin
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gold min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* MOBILE FULL DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 bg-[#0F122E] p-4 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold min-h-[48px] ${
                    active ? "bg-[#20255A] text-gold" : "text-[#AEB3D6]"
                  }`}
                >
                  <Icon className="w-5 h-5 text-gold" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[rgba(217,178,111,0.2)]">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 min-h-[48px]"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-8 md:p-10 overflow-y-auto max-w-7xl">
        {children}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden sticky bottom-0 z-40 bg-[#0F122E] border-t border-[rgba(217,178,111,0.25)] flex items-center justify-around p-2">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 rounded-lg text-[10px] min-h-[44px] min-w-[44px] ${
                active ? "text-gold font-bold" : "text-[#AEB3D6]"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="truncate max-w-[60px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
