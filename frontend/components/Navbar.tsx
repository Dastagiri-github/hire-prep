"use client";
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Code2, LayoutDashboard, UserPlus, Trophy, LogOut, Database, Menu, X, Brain, Medal, LogIn } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import api from '@/lib/api';

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
      localStorage.removeItem('access_token');
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [pathname, checkAuth]);

  if (pathname) {
    if (pathname.startsWith('/problem')) return null;
    if (pathname.startsWith('/sql/') && pathname !== '/sql') return null;
    if (pathname.startsWith('/employee')) return null;
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch { }
    localStorage.removeItem('access_token');
    setIsLoggedIn(false);
    router.push('/login');
  };

  const desktopActive = (path: string) => pathname === path
    ? "bg-blue-500/10 dark:bg-blue-500/10 bright:bg-blue-50 text-blue-400 dark:text-blue-400 bright:text-[#2563eb] border-l-4 border-blue-500 dark:border-blue-500 bright:border-[#2563eb] shadow-[inset_0_0_20px_rgba(59,130,246,0.15)] dark:shadow-[inset_0_0_20px_rgba(59,130,246,0.15)] bright:shadow-none"
    : "text-gray-400 dark:text-gray-400 bright:text-gray-600 border-l-4 border-transparent hover:bg-white/5 dark:hover:bg-white/5 bright:hover:bg-gray-50 hover:text-white dark:hover:text-white bright:hover:text-[#2563eb]";

  const mobileActive = (path: string) => pathname === path
    ? "text-blue-400 dark:text-blue-400 bright:text-[#2563eb] bg-blue-500/10 dark:bg-blue-500/10 bright:bg-blue-50"
    : "text-gray-400 dark:text-gray-400 bright:text-gray-600 hover:text-white dark:hover:text-white bright:hover:text-[#2563eb] hover:bg-white/5 dark:hover:bg-white/5 bright:hover:bg-gray-50";

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <nav className="group hidden md:flex flex-col fixed left-0 top-0 h-screen w-20 hover:w-64 bg-[#0a0f1c]/95 dark:bg-[#0a0f1c]/95 bright:bg-white backdrop-blur-xl border-r border-white/5 dark:border-white/5 bright:border-gray-200 z-50 transition-all duration-300 overflow-hidden shadow-2xl dark:shadow-2xl bright:shadow-lg">

        {/* Top Logo */}
        <div className="h-20 flex items-center px-6 whitespace-nowrap border-b border-white/5 dark:border-white/5 bright:border-gray-100 flex-shrink-0">
          <Link href="/" className="flex items-center gap-4 outline-none">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-500/20 dark:to-purple-500/20 bright:from-blue-100 bright:to-purple-100 border border-blue-500/20 dark:border-blue-500/20 bright:border-blue-200">
              <Code2 className="w-6 h-6 text-blue-500 dark:text-blue-500 bright:text-[#2563eb] flex-shrink-0" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 dark:from-blue-400 dark:to-purple-500 bright:from-[#2563eb] bright:to-[#9333ea] bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">HirePrep</span>
          </Link>
        </div>

        {/* Links */}
        <div className="flex-1 flex flex-col py-6 gap-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <Link href="/dsa" className={`flex items-center px-6 py-3 transition-colors ${desktopActive('/dsa')}`}>
            <Code2 className="w-6 h-6 flex-shrink-0" />
            <span className="ml-5 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">DSA</span>
          </Link>
          <Link href="/dashboard" className={`flex items-center px-6 py-3 transition-colors ${desktopActive('/dashboard')}`}>
            <LayoutDashboard className="w-6 h-6 flex-shrink-0" />
            <span className="ml-5 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">Dashboard</span>
          </Link>
          <Link href="/companies" className={`flex items-center px-6 py-3 transition-colors ${desktopActive('/companies')}`}>
            <Trophy className="w-6 h-6 flex-shrink-0" />
            <span className="ml-5 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">Battleground</span>
          </Link>
          <Link href="/leaderboard" className={`flex items-center px-6 py-3 transition-colors ${desktopActive('/leaderboard')}`}>
            <Medal className="w-6 h-6 flex-shrink-0" />
            <span className="ml-5 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">Leaderboard</span>
          </Link>
          <Link href="/sql" className={`flex items-center px-6 py-3 transition-colors ${desktopActive('/sql')}`}>
            <Database className="w-6 h-6 flex-shrink-0" />
            <span className="ml-5 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">SQL</span>
          </Link>
          <Link href="/aptitude" className={`flex items-center px-6 py-3 transition-colors ${desktopActive('/aptitude')}`}>
            <Brain className="w-6 h-6 flex-shrink-0" />
            <span className="ml-5 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">Aptitude</span>
          </Link>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-white/5 dark:border-white/5 bright:border-gray-100 flex flex-col gap-4 whitespace-nowrap">
          <div className="flex items-center px-3">
            <div className="flex-shrink-0">
              <ThemeToggle />
            </div>
            <span className="ml-4 text-sm font-medium text-gray-400 dark:text-gray-400 bright:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">Theme</span>
          </div>

          {!isLoggedIn ? (
            <div className="flex flex-col gap-2">
              <Link href="/login" className="flex items-center px-3 py-2 text-gray-400 dark:text-gray-400 bright:text-gray-600 hover:text-white dark:hover:text-white bright:hover:text-[#2563eb] transition-colors rounded-lg hover:bg-white/5 dark:hover:bg-white/5 bright:hover:bg-gray-50">
                <LogIn className="w-5 h-5 flex-shrink-0" />
                <span className="ml-4 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">Login</span>
              </Link>
              <Link href="/register" className="flex items-center px-3 py-2 text-blue-400 dark:text-blue-400 bright:text-[#2563eb] hover:bg-blue-500/10 dark:hover:bg-blue-500/10 bright:hover:bg-blue-50 rounded-lg transition-colors">
                <UserPlus className="w-5 h-5 flex-shrink-0" />
                <span className="ml-4 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">Register</span>
              </Link>
            </div>
          ) : (
            <button onClick={handleLogout} className="flex items-center px-3 py-2 text-red-400 dark:text-red-400 bright:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/10 bright:hover:bg-red-50 rounded-lg transition-colors">
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="ml-4 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">Logout</span>
            </button>
          )}
        </div>
      </nav>

      {/* DESKTOP SPACER */}
      <div className="hidden md:block w-20 flex-shrink-0" />

      {/* MOBILE TOPBAR */}
      <nav className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a0f1c]/95 dark:bg-[#0a0f1c]/95 bright:bg-white/95 backdrop-blur-md border-b border-white/5 dark:border-white/5 bright:border-gray-200 z-50 flex items-center justify-between px-4 shadow-lg">
        <Link href="/" className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-500/20 dark:to-purple-500/20 bright:from-blue-100 bright:to-purple-100 border border-blue-500/20 dark:border-blue-500/20 bright:border-blue-200">
            <Code2 className="w-5 h-5 text-blue-500 dark:text-blue-500 bright:text-[#2563eb]" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 dark:from-blue-400 dark:to-purple-500 bright:from-[#2563eb] bright:to-[#9333ea] bg-clip-text text-transparent">HirePrep</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gray-400 dark:text-gray-400 bright:text-gray-600">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div className="absolute top-16 left-0 right-0 bg-[#111827] dark:bg-[#111827] bright:bg-white border-b border-white/5 dark:border-white/5 bright:border-gray-200 shadow-2xl p-4 flex flex-col gap-2">
            <Link href="/dsa" onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${mobileActive('/dsa')}`}>
              <Code2 className="w-5 h-5" /> DSA
            </Link>
            <Link href="/dashboard" onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${mobileActive('/dashboard')}`}>
              <LayoutDashboard className="w-5 h-5" /> Dashboard
            </Link>
            <Link href="/companies" onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${mobileActive('/companies')}`}>
              <Trophy className="w-5 h-5" /> Battleground
            </Link>
            <Link href="/leaderboard" onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${mobileActive('/leaderboard')}`}>
              <Medal className="w-5 h-5" /> Leaderboard
            </Link>
            <Link href="/sql" onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${mobileActive('/sql')}`}>
              <Database className="w-5 h-5" /> SQL
            </Link>
            <Link href="/aptitude" onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${mobileActive('/aptitude')}`}>
              <Brain className="w-5 h-5" /> Aptitude
            </Link>

            <div className="h-px bg-white/5 dark:bg-white/5 bright:bg-gray-100 my-2" />

            {!isLoggedIn ? (
              <div className="grid grid-cols-2 gap-3">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex justify-center items-center gap-2 py-2.5 rounded-xl text-sm font-medium text-gray-300 dark:text-gray-300 bright:text-gray-600 bg-white/5 dark:bg-white/5 bright:bg-gray-50 border border-white/5 dark:border-white/5 bright:border-gray-200">
                  Login
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="flex justify-center items-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 dark:bg-blue-600 bright:bg-[#2563eb]">
                  Register
                </Link>
              </div>
            ) : (
              <button onClick={() => { setMobileOpen(false); handleLogout(); }} className="flex justify-center items-center gap-2 py-2.5 rounded-xl text-sm font-medium text-red-400 dark:text-red-400 bright:text-red-500 bg-red-500/10 dark:bg-red-500/10 bright:bg-red-50 border border-red-500/20">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            )}

            <div className="mt-2 flex justify-center">
              <ThemeToggle />
            </div>
          </div>
        )}
      </nav>

      {/* MOBILE SPACER */}
      <div className="md:hidden h-16 w-full flex-shrink-0" />
    </>
  );
};

export default Navbar;
