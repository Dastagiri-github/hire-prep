export default function TermsPage() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Terms of Service</h1>

      <p className="text-gray-400 mb-4">
        These Terms govern your use of HirePrep. By creating an account and using the platform,
        you agree to these terms. If you do not agree, please do not use the service.
      </p>

      <h2 className="text-lg font-semibold mt-4 mb-2">Acceptable Use</h2>
      <p className="text-gray-400 mb-4">
        You may use the platform for personal learning and educational purposes. Do not attempt
        to abuse the execution environment, reverse-engineer services, or overload systems with
        malicious traffic. Accounts used for fraud or abuse may be suspended.
      </p>

      <h2 className="text-lg font-semibold mt-4 mb-2">Intellectual Property</h2>
      <p className="text-gray-400 mb-4">
        All content provided by HirePrep (problems, editorial, UI) is protected by copyright.
        You may not republish large portions of content without permission. You retain ownership
        of code you write in your account, but by submitting code you grant HirePrep a license
        to store and process it for the purpose of providing the service.
      </p>

      <h2 className="text-lg font-semibold mt-4 mb-2">Limitation of Liability</h2>
      <p className="text-gray-400 mb-4">
        The platform is provided "as is". HirePrep is not responsible for placement outcomes or
        guarantees of employment. Use the platform at your own risk.
      </p>

      <p className="text-gray-400">These terms are a starting point; consult legal counsel for a complete policy.</p>
    </div>
  );
}
