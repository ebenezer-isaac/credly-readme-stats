import { useState } from "react";
import { COMMON_PARAMS, STATS_PARAMS, GRID_PARAMS, TIMELINE_PARAMS, CAROUSEL_PARAMS, OVERVIEW_PARAMS, type ParamDef } from "../../constants/params";

type DocTab = "common" | "stats" | "grid" | "timeline" | "carousel" | "overview";

const TABS: readonly { readonly id: DocTab; readonly label: string }[] = [
  { id: "common", label: "Common" },
  { id: "stats", label: "Stats" },
  { id: "grid", label: "Grid" },
  { id: "timeline", label: "Timeline" },
  { id: "carousel", label: "Carousel" },
  { id: "overview", label: "Overview" },
];

const TAB_PARAMS: Record<DocTab, readonly ParamDef[]> = {
  common: COMMON_PARAMS,
  stats: STATS_PARAMS,
  grid: GRID_PARAMS,
  timeline: TIMELINE_PARAMS,
  carousel: CAROUSEL_PARAMS,
  overview: OVERVIEW_PARAMS,
};

function ParamsTable({ params }: { readonly params: readonly ParamDef[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="pb-3 pr-4 font-semibold text-gray-900 dark:text-white">Parameter</th>
            <th className="pb-3 pr-4 font-semibold text-gray-900 dark:text-white">Type</th>
            <th className="pb-3 pr-4 font-semibold text-gray-900 dark:text-white">Default</th>
            <th className="pb-3 font-semibold text-gray-900 dark:text-white">Description</th>
          </tr>
        </thead>
        <tbody>
          {params.map((param) => (
            <tr key={param.name} className="border-b border-gray-100 dark:border-gray-800">
              <td className="py-2.5 pr-4">
                <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-brand-600 dark:bg-gray-800 dark:text-brand-400">
                  {param.name}
                </code>
              </td>
              <td className="py-2.5 pr-4 text-xs text-gray-500 dark:text-gray-400">{param.type}</td>
              <td className="py-2.5 pr-4">
                <code className="text-xs text-gray-600 dark:text-gray-400">{param.default}</code>
              </td>
              <td className="py-2.5 text-xs text-gray-600 dark:text-gray-400">{param.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DocsSection() {
  const [activeTab, setActiveTab] = useState<DocTab>("common");

  return (
    <section id="docs" className="scroll-mt-16 py-20">
      <div className="section-container">
        <h2 className="mb-4 text-center text-3xl font-bold text-gray-900 dark:text-white">
          API Reference
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-center text-gray-600 dark:text-gray-400">
          All available query parameters for customizing your cards
        </p>

        <div className="glass-card p-6">
          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <ParamsTable params={TAB_PARAMS[activeTab]} />

          {/* Usage examples */}
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Example</h4>
            <code className="block break-all text-xs text-gray-600 dark:text-gray-400">
              {activeTab === "common" && "![Stats](https://credly-readme-stats.onrender.com/api/stats?username=YOUR_USERNAME&theme=dracula)"}
              {activeTab === "stats" && "![Stats](https://credly-readme-stats.onrender.com/api/stats?username=YOUR_USERNAME&show_icons=true&hide=expiring,top_skills)"}
              {activeTab === "grid" && "![Grid](https://credly-readme-stats.onrender.com/api/grid?username=YOUR_USERNAME&columns=4&rows=3&badge_size=80)"}
              {activeTab === "timeline" && "![Timeline](https://credly-readme-stats.onrender.com/api/timeline?username=YOUR_USERNAME&max_items=5&show_description=true)"}
              {activeTab === "carousel" && "![Carousel](https://credly-readme-stats.onrender.com/api/carousel?username=YOUR_USERNAME&visible_count=3&badge_size=80&interval=4)"}
              {activeTab === "overview" && "![Overview](https://credly-readme-stats.onrender.com/api/overview?username=YOUR_USERNAME&visible_count=3&hide=expiring)"}
            </code>
          </div>
        </div>
      </div>
    </section>
  );
}
