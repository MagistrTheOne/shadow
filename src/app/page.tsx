import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FooterSection } from "@/components/landing/footer-section";
import { Navbar } from "@/components/landing/navbar";

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Защита лендинга от авторизованных пользователей
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar session={session} />
      <main>
        <HeroSection session={session} />
        <FeaturesSection />
        <PricingSection />
        <FooterSection />
      </main>
    </div>
  );
}
