import Link from "next/link";
import { ArrowRight, Code, Target, Zap } from "lucide-react";
import HomeFooter from "@/components/HomeFooter";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen pt-[var(--navbar-height)]">
      {/* ================= HERO SECTION ================= */}
      <section className="flex flex-col items-center justify-center text-center px-4 pt-6 pb-10 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-blue-500/20 rounded-full blur-[100px] -z-10" />

        {/* Announcement Badge */}
        <div className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 mt-6 mb-8 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          New: Company Battlegrounds Live!
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-5 tracking-tight">
          <span className="text-white">Master Your</span> <br />
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Dream Placement
          </span>
        </h1>


        {/* Description */}
        <p className="text-lg md:text-xl text-gray-500 mb-8 max-w-2xl leading-relaxed">
          The ultimate adaptive platform for coding interviews. Practice
          company-specific problems, track your progress with AI analytics,
          and get personalized recommendations.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="group flex items-center justify-center gap-2 
            bg-blue-600 !text-white hover:!text-white 
            px-8 py-4 rounded-xl 
            hover:bg-blue-700 transition-all duration-300 
            shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 
            font-semibold text-lg"
          >
            Start Practicing
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/companies"
            className="flex items-center justify-center gap-2 
            bg-white border border-gray-200 text-gray-900 
            px-8 py-4 rounded-xl hover:bg-gray-50 
            transition-all duration-300 font-semibold text-lg"
          >
            Explore Companies
          </Link>
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Target className="w-8 h-8 text-purple-500" />}
            title="Company Tracks"
            description="Curated roadmaps for Amazon, Google, TCS, and more. Don't just practice randomly."
          />

          <FeatureCard
            icon={<Zap className="w-8 h-8 text-yellow-500" />}
            title="Adaptive Engine"
            description="Our AI recommends problems based on your weak areas and adjusts difficulty automatically."
          />

          <FeatureCard
            icon={<Code className="w-8 h-8 text-green-500" />}
            title="Multi-Language"
            description="Run code in Python, C++, Java, and JavaScript with a high-performance execution engine."
          />
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <HomeFooter />
    </div>
  );
}

 /* ================= FEATURE CARD ================= */
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
    <div className="p-8 rounded-2xl glass-panel border border-gray-200 dark:border-white/10 hover:border-blue-500/40 dark:hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 shadow-sm">
      <div className="mb-4 p-3 bg-gray-100 dark:bg-white/5 rounded-lg w-fit">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
