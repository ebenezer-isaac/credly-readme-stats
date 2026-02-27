import { CREDLY_LOGO_URL, GITHUB_REPO_URL } from "../../constants/config";

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 py-10 dark:border-gray-800">
      <div className="section-container">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2 text-center sm:text-left">
            <img src={CREDLY_LOGO_URL} alt="Credly" className="h-5" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                readme-stats
              </p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Dynamic SVG cards for your Credly badges
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              GitHub
            </a>
            <a
              href="#docs"
              className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Docs
            </a>
            <a
              href="#builder"
              className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Builder
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 border-t border-gray-200 pt-6 text-center dark:border-gray-800">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Not affiliated with Credly or Pearson. Credly is a trademark of Pearson Education, Inc.
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            MIT License
          </p>
        </div>
      </div>
    </footer>
  );
}
