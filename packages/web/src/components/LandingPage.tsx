import { SiteNav } from "./SiteNav";
import { HeroSection } from "./hero/HeroSection";
import { StepsSection } from "./how-it-works/StepsSection";
import { BuilderSection } from "./builder/BuilderSection";
import { ThemeGallerySection } from "./theme-gallery/ThemeGallerySection";
import { DocsSection } from "./docs/DocsSection";
import { SiteFooter } from "./footer/SiteFooter";

export function LandingPage() {
  return (
    <>
      <SiteNav />
      <main>
        <HeroSection />
        <StepsSection />
        <BuilderSection />
        <ThemeGallerySection />
        <DocsSection />
      </main>
      <SiteFooter />
    </>
  );
}
