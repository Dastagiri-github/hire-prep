export default function PrivacyPage() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Privacy Policy</h1>

      <p className="text-gray-400 mb-4">
        At HirePrep we respect your privacy. This policy explains what data we collect,
        why we collect it, and how we use it to improve your learning experience.
      </p>

      <h2 className="text-lg font-semibold mt-4 mb-2">Information we collect</h2>
      <ul className="list-disc ml-6 text-gray-400 mb-4">
        <li>Account information (name, email) to authenticate and personalize your experience.</li>
        <li>Progress and activity data (completed problems, timestamps, scores) to power recommendations and leaderboards.</li>
        <li>Optional profile details you provide (school, graduation year) to enable cohort features.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-4 mb-2">How we use data</h2>
      <p className="text-gray-400 mb-4">
        We use data to personalize problem recommendations, measure learning outcomes, and
        provide analytics for students and instructors. We do not sell personal data. Aggregated
        or anonymized usage statistics may be used for research and product improvement.
      </p>

      <h2 className="text-lg font-semibold mt-4 mb-2">Security</h2>
      <p className="text-gray-400 mb-4">
        We follow industry best practices to secure your data, including encrypted storage for
        sensitive information and access controls for internal systems. If you believe your
        account is compromised, contact support immediately.
      </p>

      <p className="text-gray-400">This page is a starter policy — please review it with legal counsel before publishing.</p>
    </div>
  );
}
