import type { BuilderState } from "../../constants/defaults";
import { THEMES } from "../../constants/themes";

interface CustomizationPanelProps {
  readonly state: BuilderState;
  readonly onThemeChange: (value: string) => void;
  readonly onFieldChange: (field: keyof BuilderState, value: string | number | boolean) => void;
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-brand-600" : "bg-gray-300 dark:bg-gray-600"}`}
      >
        <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`} />
      </button>
    </label>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
        {label}
        <span className="font-mono text-xs text-gray-500">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand-600"
      />
    </label>
  );
}

export function CustomizationPanel({ state, onThemeChange, onFieldChange }: CustomizationPanelProps) {
  return (
    <div className="glass-card space-y-5 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        Customization
      </h3>

      {/* Theme select */}
      <label className="block">
        <span className="mb-1 block text-sm text-gray-700 dark:text-gray-300">Theme</span>
        <select
          className="input-field"
          value={state.theme}
          onChange={(e) => onThemeChange(e.target.value)}
        >
          {THEMES.map((t) => (
            <option key={t.name} value={t.name}>{t.label}</option>
          ))}
        </select>
      </label>

      {/* Custom title */}
      <label className="block">
        <span className="mb-1 block text-sm text-gray-700 dark:text-gray-300">Custom Title</span>
        <input
          type="text"
          className="input-field"
          placeholder="Leave blank for auto"
          value={state.custom_title}
          onChange={(e) => onFieldChange("custom_title", e.target.value)}
        />
      </label>

      {/* Common toggles */}
      <div className="space-y-3">
        <ToggleRow label="Hide border" checked={state.hide_border} onChange={(v) => onFieldChange("hide_border", v)} />
        <ToggleRow label="Hide title" checked={state.hide_title} onChange={(v) => onFieldChange("hide_title", v)} />
        <ToggleRow label="Disable animations" checked={state.disable_animations} onChange={(v) => onFieldChange("disable_animations", v)} />
      </div>

      {/* Color inputs */}
      <div className="grid grid-cols-2 gap-3">
        {(["title_color", "text_color", "icon_color", "bg_color", "border_color"] as const).map((field) => (
          <label key={field} className="block">
            <span className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
              {field.replace(/_/g, " ")}
            </span>
            <input
              type="text"
              className="input-field font-mono text-xs"
              placeholder="hex"
              value={state[field]}
              onChange={(e) => onFieldChange(field, e.target.value)}
            />
          </label>
        ))}
      </div>

      {/* Card-type-specific options */}
      {state.cardType === "stats" && (
        <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Stats Options</h4>
          <ToggleRow label="Show icons" checked={state.show_icons} onChange={(v) => onFieldChange("show_icons", v)} />
          <SliderRow label="Card width" value={state.card_width} min={300} max={800} step={5} onChange={(v) => onFieldChange("card_width", v)} />
          <label className="block">
            <span className="mb-1 block text-xs text-gray-600 dark:text-gray-400">Hide sections</span>
            <input
              type="text"
              className="input-field font-mono text-xs"
              placeholder="e.g. expiring,top_skills"
              value={state.hide}
              onChange={(e) => onFieldChange("hide", e.target.value)}
            />
          </label>
        </div>
      )}

      {state.cardType === "grid" && (
        <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Grid Options</h4>
          <SliderRow label="Columns" value={state.columns} min={1} max={6} onChange={(v) => onFieldChange("columns", v)} />
          <SliderRow label="Rows" value={state.rows} min={1} max={10} onChange={(v) => onFieldChange("rows", v)} />
          <SliderRow label="Badge size" value={state.badge_size} min={32} max={128} step={8} onChange={(v) => onFieldChange("badge_size", v)} />
          <ToggleRow label="Show name" checked={state.show_name} onChange={(v) => onFieldChange("show_name", v)} />
          <ToggleRow label="Show issuer" checked={state.show_issuer} onChange={(v) => onFieldChange("show_issuer", v)} />
          <label className="block">
            <span className="mb-1 block text-xs text-gray-600 dark:text-gray-400">Sort</span>
            <select className="input-field text-sm" value={state.sort} onChange={(e) => onFieldChange("sort", e.target.value)}>
              <option value="recent">Recent</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name</option>
              <option value="issuer">Issuer</option>
            </select>
          </label>
        </div>
      )}

      {state.cardType === "timeline" && (
        <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Timeline Options</h4>
          <SliderRow label="Max items" value={state.max_items} min={1} max={20} onChange={(v) => onFieldChange("max_items", v)} />
          <ToggleRow label="Show description" checked={state.show_description} onChange={(v) => onFieldChange("show_description", v)} />
          <ToggleRow label="Show skills" checked={state.show_skills} onChange={(v) => onFieldChange("show_skills", v)} />
          <label className="block">
            <span className="mb-1 block text-xs text-gray-600 dark:text-gray-400">Sort</span>
            <select className="input-field text-sm" value={state.sort} onChange={(e) => onFieldChange("sort", e.target.value)}>
              <option value="recent">Recent</option>
              <option value="oldest">Oldest</option>
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
