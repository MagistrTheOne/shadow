import { Navbar } from "@/components/landing/navbar";
import { PricingSection } from "@/components/landing/pricing-section";
import { DemoSection } from "@/components/landing/demo-section";
import { FooterSection } from "@/components/landing/footer-section";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar />
      <main className="pt-16">
        <PricingSection />
        <DemoSection />
      </main>
      <FooterSection />
    </div>
  );
}