"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Code2,
  LayoutDashboard,
  UserPlus,
  Trophy,
  LogOut,
  Database,
  Sun,
  Moon,
} from "lucide-react";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [animate, setAnimate] = useState(false);

  /* Load saved theme or system preference on mount */
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.add(saved);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      setTheme("light");
      document.documentElement.classList.add("light");
    } else {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }

    // Listen for external theme changes (so other components can trigger toggle)
    const onThemeChange = (e: Event) => {
      const next = (e as CustomEvent).detail as "light" | "dark" | undefined;
      if (next) setTheme(next);
    };
    window.addEventListener("themechange", onThemeChange as EventListener);
    return () => window.removeEventListener("themechange", onThemeChange as EventListener);
  }, []);

  /* Check auth + scroll */
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  /* Apply theme to <html> */
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {}
    const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (meta) meta.setAttribute("content", theme === "dark" ? "#020617" : "#f8fafc");
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/login");
  };

  const isActive = (path: string) =>
    pathname === path
      ? "text-blue-400 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-blue-500/20"
      : "text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/10 border border-transparent";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-1 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 group-hover:border-blue-500/50 transition-all duration-300">
            <Code2 className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
          </div>
          <span className="text-xl font-bold logo-text transition-all">
            HirePrep
          </span>
        </Link>

        {/* Center nav */}
        <div className="hidden md:flex items-center gap-2 p-1 ml-32 mr-12 rounded-xl glass border border-white/5">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isActive(
              "/dashboard"
            )}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>

          <Link
            href="/companies"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isActive(
              "/companies"
            )}`}
          >
            <Trophy className="w-4 h-4" />
            Battleground
          </Link>

          <Link
            href="/sql"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isActive(
              "/sql"
            )}`}
          >
            <Database className="w-4 h-4" />
            SQL
          </Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3 " >
          {/* Theme toggle */}
          <button
            onClick={() => {
              // Toggle with a small animation
              const next = theme === "dark" ? "light" : "dark";
              setTheme(next);
              setAnimate(true);
              setTimeout(() => setAnimate(false), 450);
            }}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            {theme === "dark" ? (
              <span className={`theme-icon ${animate ? "animate" : ""}`}>
                <Sun className="w-5 h-5 text-yellow-400" />
              </span>
            ) : (
              <span className={`theme-icon ${animate ? "animate" : ""}`}>
                <Moon className="w-5 h-5 text-gray-700" />
              </span>
            )}
          </button>



          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium nav-link transition-colors"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
              >
                <UserPlus className="w-4 h-4" />
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
