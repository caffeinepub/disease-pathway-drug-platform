import { Button } from "@/components/ui/button";
import {
  Database,
  Dna,
  FlaskConical,
  History,
  Menu,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";

type Page = "home" | "search" | "databases" | "history";

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const NAV_LINKS: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "home", label: "Home", icon: <Dna className="w-4 h-4" /> },
  { id: "search", label: "Search", icon: <Search className="w-4 h-4" /> },
  {
    id: "databases",
    label: "Databases",
    icon: <Database className="w-4 h-4" />,
  },
  { id: "history", label: "History", icon: <History className="w-4 h-4" /> },
];

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* HUD navbar */}
      <div
        className="relative navbar-hud"
        style={{
          background: "oklch(0.055 0.02 270 / 0.88)",
          backdropFilter: "blur(20px) saturate(1.4)",
          /* Top accent line */
          borderTop: "1px solid oklch(0.82 0.17 198 / 0.22)",
        }}
      >
        {/* Scanline separator at bottom */}
        <div className="navbar-scanline" />

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            type="button"
            className="flex items-center gap-3 group"
            onClick={() => onNavigate("home")}
            data-ocid="nav.home.link"
          >
            <div
              className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.82 0.17 198 / 0.25), oklch(0.55 0.22 295 / 0.25))",
                border: "1px solid oklch(0.82 0.17 198 / 0.45)",
                boxShadow:
                  "0 0 16px oklch(0.82 0.17 198 / 0.35), inset 0 1px 0 oklch(0.82 0.17 198 / 0.2)",
              }}
            >
              <FlaskConical
                className="w-4.5 h-4.5"
                style={{ color: "oklch(0.88 0.14 198)" }}
              />
            </div>
            <div className="hidden sm:block">
              <span
                className="block text-sm font-display font-extrabold leading-none tracking-tight"
                style={{ color: "oklch(0.88 0.14 198)" }}
              >
                DP–DR Platform
              </span>
              <span
                className="block text-[0.62rem] mt-0.5 tracking-widest uppercase"
                style={{ color: "oklch(0.45 0.06 260)" }}
              >
                Disease · Pathway · Drug
              </span>
            </div>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1.5">
            {NAV_LINKS.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => onNavigate(link.id)}
                  data-ocid={`nav.${link.id}.link`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${isActive ? "nav-active-pill" : "nav-inactive"}`}
                  style={{
                    color: isActive
                      ? "oklch(0.92 0.10 198)"
                      : "oklch(0.58 0.06 260)",
                  }}
                >
                  {/* Active dot indicator */}
                  {isActive && (
                    <span
                      className="w-1 h-1 rounded-full flex-shrink-0"
                      style={{
                        background: "oklch(0.82 0.17 198)",
                        boxShadow: "0 0 6px oklch(0.82 0.17 198)",
                      }}
                    />
                  )}
                  {link.icon}
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-xl"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              color: "oklch(0.82 0.17 198)",
              border: "1px solid oklch(0.82 0.17 198 / 0.2)",
              background: mobileOpen
                ? "oklch(0.82 0.17 198 / 0.1)"
                : "transparent",
            }}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden px-4 pb-4 pt-2 space-y-1"
            style={{ borderTop: "1px solid oklch(0.82 0.17 198 / 0.12)" }}
          >
            {NAV_LINKS.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => {
                    onNavigate(link.id);
                    setMobileOpen(false);
                  }}
                  data-ocid={`nav.${link.id}.link`}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? "nav-active-pill" : "nav-inactive"}`}
                  style={{
                    color: isActive
                      ? "oklch(0.92 0.10 198)"
                      : "oklch(0.62 0.06 260)",
                  }}
                >
                  {link.icon}
                  {link.label}
                  {isActive && (
                    <span
                      className="ml-auto w-1.5 h-1.5 rounded-full"
                      style={{
                        background: "oklch(0.82 0.17 198)",
                        boxShadow: "0 0 8px oklch(0.82 0.17 198)",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
