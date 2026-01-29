export default function AboutPage() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">About HirePrep — Dream Placement for GVPCE Students</h1>
      <p className="text-gray-400 mb-4">
        HirePrep was born from a simple mission: to give students at GVPCE a focused,
        practical path to succeed in technical interviews and secure their dream placements.
        We combine curated company tracks, hands-on coding problems, and interactive SQL
        workspaces so learners build both knowledge and confidence.
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-3">What we provide</h2>
      <ul className="list-disc ml-6 text-gray-400 mb-4">
        <li>Company-specific problem tracks (Amazon, Google, TCS, and more) so practice is targeted.</li>
        <li>An adaptive recommendation engine that surfaces problems based on your weaknesses.</li>
        <li>In-browser execution for Python, Java, C++, and SQL with instant feedback.</li>
        <li>Progress tracking, leaderboards, and motivational battleground events to boost engagement.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-4 mb-3">Why it helps</h2>
      <p className="text-gray-400 mb-4">
        We focus on practice that mirrors real interviews: clear problem statements, curated
        datasets, timed challenges, and immediate result comparison. For SQL specifically we
        surface realistic schema, let you run queries against seeded data, and validate
        results automatically so you learn to reason about relational data — a skill many
        companies test directly.
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-3">Get started</h2>
      <p className="text-gray-400">
        Create an account, pick a company track, and join a battleground to compete with
        peers. If you're an instructor or organizer and want a custom track for your class,
        reach out — we can help you onboard students and tailor content to placement goals.
      </p>
    </div>
  );
}
