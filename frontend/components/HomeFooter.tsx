"use client";
import Link from 'next/link';
import { Code2, Mail, Heart } from 'lucide-react';

export default function HomeFooter() {
  return (
    <footer className="w-full mt-20 border-t border-white/10 dark:border-white/10 bright:border-gray-200 bg-gradient-to-b from-transparent via-white/5 dark:via-white/5 bright:via-gray-50/30 to-transparent py-12 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-8 sm:px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Section */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="group flex items-center gap-3 w-fit">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-500/20 dark:to-purple-500/20 bright:from-blue-100 bright:to-purple-100 border border-blue-500/20 dark:border-blue-500/20 bright:border-blue-200 group-hover:border-blue-500/50 dark:group-hover:border-blue-500/50 bright:group-hover:border-blue-400 group-hover:scale-105 transition-all duration-300 shadow-sm">
                <Code2 className="w-5 h-5 text-blue-400 dark:text-blue-400 bright:text-[#2563eb] group-hover:text-blue-300 dark:group-hover:text-blue-300 bright:group-hover:text-[#1d4ed8] transition-colors" />
              </div>
              <div>
                <div className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  HirePrep
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-400 bright:text-gray-500 mt-1">
                  Master your technical interviews
                </div>
              </div>
            </Link>
            <p className="text-sm text-gray-400 dark:text-gray-400 bright:text-gray-600 leading-relaxed max-w-md">
              The ultimate platform for coding interview preparation. Practice problems, track your progress, and land your dream job.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 dark:text-gray-300 bright:text-[#1e293b] mb-4 uppercase tracking-wider">
              Resources
            </h3>
            <nav className="flex flex-col gap-3">
              <Link 
                href="/about" 
                className="text-sm text-gray-400 dark:text-gray-400 bright:text-gray-600 hover:text-blue-400 dark:hover:text-blue-400 bright:hover:text-[#2563eb] transition-all duration-300 hover:translate-x-1 w-fit group"
              >
                <span className="flex items-center gap-2">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  About
                </span>
              </Link>
              <Link 
                href="/privacy" 
                className="text-sm text-gray-400 dark:text-gray-400 bright:text-gray-600 hover:text-blue-400 dark:hover:text-blue-400 bright:hover:text-[#2563eb] transition-all duration-300 hover:translate-x-1 w-fit group"
              >
                <span className="flex items-center gap-2">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  Privacy Policy
                </span>
              </Link>
              <Link 
                href="/terms" 
                className="text-sm text-gray-400 dark:text-gray-400 bright:text-gray-600 hover:text-blue-400 dark:hover:text-blue-400 bright:hover:text-[#2563eb] transition-all duration-300 hover:translate-x-1 w-fit group"
              >
                <span className="flex items-center gap-2">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  Terms of Service
                </span>
              </Link>
            </nav>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 dark:text-gray-300 bright:text-[#1e293b] mb-4 uppercase tracking-wider">
              Connect
            </h3>
            <div className="flex flex-col gap-3">
              <a 
                href="mailto:support@hireprep.com" 
                className="text-sm text-gray-400 dark:text-gray-400 bright:text-gray-600 hover:text-blue-400 dark:hover:text-blue-400 bright:hover:text-[#2563eb] transition-all duration-300 hover:translate-x-1 w-fit group flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Support</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/5 dark:border-white/5 bright:border-gray-200/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-400 dark:text-gray-400 bright:text-gray-500 flex items-center gap-2">
            <span>© {new Date().getFullYear()} HirePrep. Made with</span>
            <Heart className="w-4 h-4 text-red-400 dark:text-red-400 bright:text-red-500 animate-pulse" />
            <span>for students</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs text-gray-500 dark:text-gray-500 bright:text-gray-400">
              All rights reserved
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
