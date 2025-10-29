import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FooterSection } from "@/components/landing/footer-section";

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
      </main>
      <FooterSection />
    </div>
  );
}