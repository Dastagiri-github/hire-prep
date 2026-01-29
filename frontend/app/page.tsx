import Link from "next/link";
import Footer from "@/components/Footer";

import { ArrowRight, Code, Target, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-grow flex flex-col items-center justify-center text-center px-4 py-16 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-blue-500/20 rounded-full blur-[90px] -z-10"></div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 mt-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6 text-s animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          New: Company Battlegrounds Live!
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-5 tracking-tight">
          Master Your <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Dream Placement
          </span>
        </h1>

        <p className="text-lg text-gray-400 mb-8 max-w-2xl leading-relaxed">
          An adaptive platform for coding interviews. Practice company-specific
          problems, track your progress with analytics, and get personalized
          recommendations.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="group flex items-center justify-center gap-2 primary-cta px-6 py-3 rounded-xl hover:brightness-95 transition-all duration-300 shadow-lg shadow-blue-500/25 font-semibold text-base"
          >
            Start Practicing
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/companies"
            className="flex items-center justify-center gap-2 secondary-cta px-6 py-3 rounded-xl hover:bg-white/10 border border-white/10 transition-all duration-300 font-semibold text-base backdrop-blur-sm"
          >
            Explore Companies
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Target className="w-7 h-7 text-purple-400" />}
            title="Company Tracks"
            description="Curated roadmaps for top companies so you don’t practice randomly."
          />
          <FeatureCard
            icon={<Zap className="w-7 h-7 text-yellow-400" />}
            title="Adaptive Engine"
            description="Smart recommendations based on your weak areas and progress."
          />
          <FeatureCard
            icon={<Code className="w-7 h-7 text-green-400" />}
            title="Multi-Language"
            description="Practice in Python, C++, Java, and JavaScript seamlessly."
          />
        </div>
      </section>
      <Footer />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1">
      <div className="mb-3 p-2.5 bg-white/5 rounded-lg w-fit">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 feature-title">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
