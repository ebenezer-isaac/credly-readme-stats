import { useState } from "react";
import { API_BASE, DEMO_USER } from "../../constants/config";

export function HeroSection() {
  const [username, setUsername] = useState(DEMO_USER);
  const previewUrl = username.trim()
    ? `${API_BASE}/api/stats?username=${encodeURIComponent(username.trim())}&theme=default`
    : "";

  return (
    <section className="relative overflow-hidden pb-20 pt-16 sm:pt-24">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/50 via-transparent to-transparent dark:from-brand-950/20" />
        <div className="absolute left-1/2 top-0 -z-10 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-brand-400/10 blur-3xl dark:bg-brand-600/5" />
      </div>

      <div className="section-container">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Open Source
          </div>

          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
            Dynamic SVG cards for your{" "}
            <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
              Credly badges
            </span>
          </h1>

          <p className="mb-10 text-lg text-gray-600 sm:text-xl dark:text-gray-400">
            Embed beautiful, auto-updating badge stats in your GitHub README.
            20 themes, real-time data, zero configuration.
          </p>

          {/* Live demo input */}
          <div className="mx-auto mb-10 max-w-md">
            <label htmlFor="hero-username" className="sr-only">Credly username</label>
            <div className="flex gap-2">
              <input
                id="hero-username"
                type="text"
                className="input-field flex-1"
                placeholder="Your Credly username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <a href="#builder" className="btn-primary whitespace-nowrap">
                Build Card
              </a>
            </div>
          </div>
        </div>

        {/* Live preview card */}
        {previewUrl && (
          <div className="mx-auto max-w-xl">
            <div className="glass-card overflow-hidden p-4">
              <img
                src={previewUrl}
                alt="Credly stats card preview"
                className="mx-auto block"
                loading="lazy"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
