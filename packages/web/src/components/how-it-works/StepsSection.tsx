const STEPS = [
  {
    number: "1",
    title: "Find your username",
    description: "Go to your Credly profile. Your username is in the URL: credly.com/users/your-username",
  },
  {
    number: "2",
    title: "Pick a card type",
    description: "Choose from Stats, Grid, or Timeline cards. Customize theme, colors, and layout.",
  },
  {
    number: "3",
    title: "Copy & paste",
    description: "Grab the Markdown or HTML embed code and drop it into your README. That's it!",
  },
] as const;

export function StepsSection() {
  return (
    <section className="py-20">
      <div className="section-container">
        <h2 className="mb-4 text-center text-3xl font-bold text-gray-900 dark:text-white">
          How it works
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-gray-600 dark:text-gray-400">
          Three steps to showcase your certifications
        </p>

        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.number} className="relative text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-600 dark:bg-brand-900/50 dark:text-brand-400">
                {step.number}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {step.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
