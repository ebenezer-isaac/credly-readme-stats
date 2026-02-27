import { THEMES, type ThemePreview } from "../../constants/themes";

function ThemeCard({ theme }: { readonly theme: ThemePreview }) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-gray-200 transition-all hover:shadow-md dark:border-gray-700"
      style={{ backgroundColor: theme.bg }}
    >
      <div className="px-4 py-3">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.icon }} />
          <span className="text-xs font-semibold" style={{ color: theme.title }}>
            {theme.label}
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: theme.text }}>Total Badges</span>
            <span className="text-[10px] font-semibold" style={{ color: theme.text }}>24</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: theme.text }}>Unique Issuers</span>
            <span className="text-[10px] font-semibold" style={{ color: theme.text }}>5</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: theme.text }}>Skills</span>
            <span className="text-[10px] font-semibold" style={{ color: theme.text }}>47</span>
          </div>
        </div>
      </div>
      <div className="border-t px-4 py-2" style={{ borderColor: theme.border }}>
        <code className="text-[9px] text-gray-500 dark:text-gray-400">theme={theme.name}</code>
      </div>
    </div>
  );
}

export function ThemeGallerySection() {
  return (
    <section id="themes" className="scroll-mt-16 py-20">
      <div className="section-container">
        <h2 className="mb-4 text-center text-3xl font-bold text-gray-900 dark:text-white">
          Themes
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-center text-gray-600 dark:text-gray-400">
          {THEMES.length} built-in themes to match your README style. Add{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">
            &theme=name
          </code>{" "}
          to your URL.
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {THEMES.map((theme) => (
            <ThemeCard key={theme.name} theme={theme} />
          ))}
        </div>
      </div>
    </section>
  );
}
