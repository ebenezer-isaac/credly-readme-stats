import { useBuilderState } from "../../hooks/useBuilderState";
import { useCardUrl, useEmbedCode } from "../../hooks/useCardUrl";
import { CardTypeTabs } from "./CardTypeTabs";
import { CustomizationPanel } from "./CustomizationPanel";
import { PreviewPane } from "./PreviewPane";
import { EmbedCodePanel } from "./EmbedCodePanel";

export function BuilderSection() {
  const { state, setUsername, setCardType, setTheme, setField } = useBuilderState();
  const cardUrl = useCardUrl(state);
  const embedCode = useEmbedCode(cardUrl, state);

  return (
    <section id="builder" className="scroll-mt-16 py-20">
      <div className="section-container">
        <h2 className="mb-4 text-center text-3xl font-bold text-gray-900 dark:text-white">
          Interactive Builder
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-center text-gray-600 dark:text-gray-400">
          Customize your card and copy the embed code
        </p>

        {/* Username input */}
        <div className="mx-auto mb-6 max-w-md">
          <label htmlFor="builder-username" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Credly Username
          </label>
          <input
            id="builder-username"
            type="text"
            className="input-field"
            placeholder="e.g. ebenezer-isaac.05496d7f"
            value={state.username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* Card type tabs */}
        <CardTypeTabs cardType={state.cardType} onChange={setCardType} />

        {/* Two-column: customization + preview */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <CustomizationPanel
            state={state}
            onThemeChange={setTheme}
            onFieldChange={setField}
          />
          <div className="space-y-4">
            <PreviewPane url={cardUrl} />
            <EmbedCodePanel markdown={embedCode.markdown} html={embedCode.html} />
          </div>
        </div>
      </div>
    </section>
  );
}
