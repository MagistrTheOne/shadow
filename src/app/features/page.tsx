import { Navbar } from "@/components/landing/navbar";
import { FeaturesSection } from "@/components/landing/features-section";
import { DemoSection } from "@/components/landing/demo-section";
import { FooterSection } from "@/components/landing/footer-section";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar />
      <main className="pt-16">
        <FeaturesSection />
        <DemoSection />
      </main>
      <FooterSection />
    </div>
  );
}