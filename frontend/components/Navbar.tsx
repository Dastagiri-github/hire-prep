"use client";
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Code2, LayoutDashboard, UserPlus, Trophy, LogOut, Database, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import api from '@/lib/api';

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHomePage = pathname === '/';

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsLoggedIn(false);
      return;
    }
    try {
      await api.get('/auth/me');
      setIsLoggedIn(true);
    } catch {
      // Token invalid or expired and refresh also failed → log out
      localStorage.removeItem('access_token');
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    if (isHomePage) {
      const handleScroll = () => setScrolled(window.scrollY > 20);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setScrolled(true);
    }
  }, [pathname, isHomePage, checkAuth]);

  // Hide navbar on focused practice/editor pages to reduce distractions
  // Hide on /problem pages and /sql/[id] editor pages, but show on /sql dashboard
  if (pathname) {
    if (pathname.startsWith('/problem')) return null;
    if (pathname.startsWith('/sql/') && pathname !== '/sql') return null; // Hide on /sql/[id] but show on /sql
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Even if the server call fails, clear local state
    }
    localStorage.removeItem('access_token');
    setIsLoggedIn(false);
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path
    ? "text-blue-400 dark:text-blue-400 bright:text-[#2563eb] bg-blue-500/10 dark:bg-blue-500/10 bright:bg-blue-50 shadow-[0_0_15px_rgba(59,130,246,0.3)] dark:shadow-[0_0_15px_rgba(59,130,246,0.3)] bright:shadow-none border border-blue-500/20 dark:border-blue-500/20 bright:border-blue-200"
    : "text-gray-400 dark:text-gray-400 bright:text-gray-600 hover:text-white dark:hover:text-white bright:hover:text-[#2563eb] hover:bg-white/5 dark:hover:bg-white/5 bright:hover:bg-gray-50 hover:border-white/10 dark:hover:border-white/10 bright:hover:border-gray-200 border border-transparent";

  // Use static position on all pages except home page
  const positionClass = isHomePage ? 'fixed' : 'static';
  // Always show glass effect on static navbar pages, conditionally on fixed navbar
  const glassClass = (isHomePage && scrolled) || !isHomePage ? 'glass' : 'bg-transparent';

  return (
    <nav
      className={`${positionClass} top-0 left-0 right-0 z-50 transition-all duration-300 ${glassClass} `}
      style={{ height: 'var(--navbar-height)', marginTop: '1px' }}
    >
      <div className="max-w-7xl mx-auto px-8 sm:px-6 lg:px-8 flex justify-between items-center h-full gap-4">
        <Link href="/" className="group flex items-center gap-3 cursor-pointer">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-500/20 dark:to-purple-500/20 bright:from-blue-100 bright:to-purple-100 border border-blue-500/20 dark:border-blue-500/20 bright:border-blue-200 group-hover:border-blue-500/50 dark:group-hover:border-blue-500/50 bright:group-hover:border-blue-300 group-hover:scale-105 transition-all duration-300 shadow-sm">
            <Code2 className="w-6 h-6 text-blue-400 dark:text-blue-400 bright:text-[#2563eb] group-hover:text-blue-300 dark:group-hover:text-blue-300 bright:group-hover:text-[#1d4ed8] transition-colors" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            HirePrep
          </span>
        </Link>

        {/* Navigation box - centered in navbar */}
        <div className="hidden md:flex items-center gap-2 p-1 rounded-xl glass border border-white/5 dark:border-white/5 bright:border-gray-200 absolute left-1/2 transform -translate-x-1/2">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isActive('/dashboard')}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/companies"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isActive('/companies')}`}
          >
            <Trophy className="w-4 h-4" />
            Battleground
          </Link>
          <Link
            href="/sql"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isActive('/sql')}`}
          >
            <Database className="w-4 h-4" />
            SQL
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileOpen(open => !open)}
              aria-label="Open menu"
              className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="px-5 py-2 text-sm font-medium text-gray-300 dark:text-gray-300 bright:text-gray-600 hover:text-white dark:hover:text-white bright:hover:text-[#2563eb] hover:bg-white/5 dark:hover:bg-white/5 bright:hover:bg-gray-50 rounded-lg transition-all duration-300 cursor-pointer"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 dark:bg-blue-600 bright:bg-[#2563eb] hover:bg-blue-500 dark:hover:bg-blue-500 bright:hover:bg-[#1d4ed8] !text-white text-sm font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/25 dark:shadow-blue-500/25 bright:shadow-blue-500/20 hover:shadow-blue-500/40 dark:hover:shadow-blue-500/40 bright:hover:shadow-blue-500/30 hover:-translate-y-0.5 hover:scale-105 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 dark:text-red-400 bright:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/10 bright:hover:bg-red-50 hover:text-red-300 dark:hover:text-red-300 bright:hover:text-red-600 rounded-lg transition-all duration-300 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}
          <div className="ml-1">
            <ThemeToggle />
          </div>
        </div>
        {/* Mobile dropdown/menu */}
        {mobileOpen && (
          <div className="md:hidden absolute top-full right-4 mt-2 w-64 bg-white/5 bright:bg-white rounded-xl border border-white/5 dark:border-white/5 bright:border-bright-border p-3 shadow-lg z-50">
            <div className="flex flex-col gap-2">
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isActive('/dashboard')}`}>
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link href="/companies" onClick={() => setMobileOpen(false)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isActive('/companies')}`}>
                <Trophy className="w-4 h-4" /> Battleground
              </Link>
              <Link href="/sql" onClick={() => setMobileOpen(false)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isActive('/sql')}`}>
                <Database className="w-4 h-4" /> SQL
              </Link>
              <div className="border-t border-white/5 mt-2 pt-2" />
              {!isLoggedIn ? (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white">Login</Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-sm bg-blue-600 text-white font-semibold">Register</Link>
                </>
              ) : (
                <button onClick={() => { setMobileOpen(false); handleLogout(); }} className="px-3 py-2 rounded-lg text-sm text-red-400">Logout</button>
              )}
              <div className="pt-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
