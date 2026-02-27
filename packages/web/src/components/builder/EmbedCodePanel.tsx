import { useState } from "react";
import { CopyButton } from "../shared/CopyButton";

interface EmbedCodePanelProps {
  readonly markdown: string;
  readonly html: string;
}

type EmbedFormat = "markdown" | "html";

export function EmbedCodePanel({ markdown, html }: EmbedCodePanelProps) {
  const [format, setFormat] = useState<EmbedFormat>("markdown");
  const code = format === "markdown" ? markdown : html;

  if (!markdown) return null;

  return (
    <div className="glass-card p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        Embed Code
      </h3>
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => setFormat("markdown")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            format === "markdown"
              ? "bg-brand-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          Markdown
        </button>
        <button
          onClick={() => setFormat("html")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            format === "html"
              ? "bg-brand-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          HTML
        </button>
      </div>
      <div className="relative">
        <pre className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300">
          <code>{code}</code>
        </pre>
        <div className="absolute right-2 top-2">
          <CopyButton text={code} label="Copy" className="!px-2.5 !py-1" />
        </div>
      </div>
    </div>
  );
}
