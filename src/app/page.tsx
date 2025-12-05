// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-400 mb-3">
          AI Job Search Assistant
        </p>

        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
          Land your next job with{" "}
          <span className="text-blue-400">Vibe Jobpin</span>
        </h1>

        <p className="text-lg text-gray-300 mb-8">
          Upload your resume, let AI structure your experience, and get clear,
          personalized insights for your job search.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/sign-in"
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Get started for free
          </Link>

          <Link
            href="/sign-up"
            className="px-6 py-3 rounded-lg border border-gray-600 text-gray-200 hover:bg-gray-900 transition"
          >
            Create an account
          </Link>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          No credit card needed · Free to start
        </p>
      </section>

      {/* How it works */}
      <section className="border-t border-gray-800 bg-[#050505]">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            How Vibe Jobpin works in 2 simple steps
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Step 1 */}
            <div className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-900/60 to-black p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-400 mb-2">
                Step 1
              </p>
              <h3 className="text-xl font-semibold mb-2">
                Complete your profile & upload your resume
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                Tell us who you are: name, role, experience level, target
                position and city. Then upload your latest resume in PDF.
              </p>
              <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
                <li>Basic profile info in one place</li>
                <li>Upload resume once, reuse across applications</li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-900/60 to-black p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-400 mb-2">
                Step 2
              </p>
              <h3 className="text-xl font-semibold mb-2">
                Let AI analyse & see your structured dashboard
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                Our AI parses your resume into clean sections and surfaces skills,
                experience and suggestions so you know exactly what to improve.
              </p>
              <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
                <li>Structured profile & work history</li>
                <li>Actionable tips for your next application</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}