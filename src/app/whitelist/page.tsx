import { Navbar } from "@/components/landing/navbar";
import { WhitelistSection } from "@/components/landing/whitelist-section";
import { FooterSection } from "@/components/landing/footer-section";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function WhitelistPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar session={session} />
      <main>
        <WhitelistSection />
      </main>
      <FooterSection />
    </div>
  );
}

