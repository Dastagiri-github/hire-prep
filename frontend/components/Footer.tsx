import Link from "next/link";
import { GraduationCap, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="flex items-center gap-2 font-semibold footer-logo">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <span className="text-base">HirePrep</span>
            </Link>
            <p className="text-xs text-gray-400 text-center md:text-left max-w-xs">
              Adaptive placement preparation for your dream career.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>

          {/* Social */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              aria-label="GitHub"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-4 border-t border-white/10 text-center">
          <p className="text-xs text-gray-500">
            © {currentYear} HirePrep. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
