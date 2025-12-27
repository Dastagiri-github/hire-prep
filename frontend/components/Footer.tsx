"use client";
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 dark:border-white/5 bright:border-gray-200 bg-transparent py-8 mt-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-500/20 dark:to-purple-500/20 bright:from-blue-100 bright:to-purple-100 flex items-center justify-center glass hover-scale interactive">
            <span className="text-sm font-bold text-blue-400 dark:text-blue-400 bright:text-[#2563eb]">HP</span>
          <div>
            <div className="text-sm font-bold text-gray-200">HirePrep</div>
            <div className="text-xs bg-gradient-to-r from-purple-500 via-pink-500 to-pink-400 bg-clip-text text-transparent">Learning focused — built for interview success</div>
          </div>
          </div>
        </div>

        <nav className="flex gap-4 items-center">
          <Link href="/about" className="text-sm text-gray-300 dark:text-gray-300 bright:text-gray-600 hover:text-blue-400 dark:hover:text-blue-400 bright:hover:text-[#2563eb] transition-colors interactive cursor-hand">About</Link>
          <Link href="/privacy" className="text-sm text-gray-300 dark:text-gray-300 bright:text-gray-600 hover:text-blue-400 dark:hover:text-blue-400 bright:hover:text-[#2563eb] transition-colors interactive cursor-hand">Privacy</Link>
          <Link href="/terms" className="text-sm text-gray-300 dark:text-gray-300 bright:text-gray-600 hover:text-blue-400 dark:hover:text-blue-400 bright:hover:text-[#2563eb] transition-colors interactive cursor-hand">Terms</Link>
        </nav>

        <div className="text-sm text-gray-400 dark:text-gray-400 bright:text-gray-500">© {new Date().getFullYear()} HirePrep — All rights reserved</div>
      </div>
    </footer>
  );
}
