import { useState, useEffect } from "react";

interface PreviewPaneProps {
  readonly url: string;
}

export function PreviewPane({ url }: PreviewPaneProps) {
  const [debouncedUrl, setDebouncedUrl] = useState(url);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setDebouncedUrl(url);
    }, 400);
    return () => clearTimeout(timer);
  }, [url]);

  return (
    <div className="glass-card p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        Preview
      </h3>
      <div className="relative min-h-[120px] overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
        {debouncedUrl ? (
          <>
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50/60 dark:bg-gray-800/60">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
              </div>
            )}
            <img
              src={debouncedUrl}
              alt="Card preview"
              className="mx-auto block max-w-full"
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
          </>
        ) : (
          <div className="flex h-24 items-center justify-center text-sm text-gray-400 dark:text-gray-500">
            Enter a username to see the preview
          </div>
        )}
      </div>
    </div>
  );
}
