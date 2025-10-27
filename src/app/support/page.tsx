import { Navbar } from "@/components/landing/navbar";
import { FooterSection } from "@/components/landing/footer-section";
import { Button } from "@/components/ui/button";
import { HelpCircle, Book, Code, Activity } from "lucide-react";
import Link from "next/link";

const supportOptions = [
  {
    icon: HelpCircle,
    title: "Help Center",
    description: "Find answers to common questions and get started guides.",
    href: "/support/help-center",
    color: "text-gray-400"
  },
  {
    icon: Book,
    title: "Documentation",
    description: "Comprehensive guides and API documentation for developers.",
    href: "/support/documentation",
    color: "text-gray-400"
  },
  {
    icon: Code,
    title: "API Reference",
    description: "Complete API reference with examples and code samples.",
    href: "/support/api-reference",
    color: "text-gray-400"
  },
  {
    icon: Activity,
    title: "System Status",
    description: "Check the current status of our services and uptime.",
    href: "/support/status",
    color: "text-gray-400"
  }
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar />
      <main className="pt-16">
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Support{" "}
                <span className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
                  Center
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Get the help you need with our comprehensive support resources,
                documentation, and dedicated customer success team.
              </p>
            </div>

            {/* Support Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {supportOptions.map((option, index) => (
                <Link key={index} href={option.href}>
                  <div className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer group">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors duration-200">
                        <option.icon className={`w-8 h-8 ${option.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-gray-300 transition-colors duration-200">
                          {option.title}
                        </h3>
                        <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Contact Support */}
            <div className="text-center p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              <h3 className="text-xl font-semibold text-white mb-4">Still need help?</h3>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                Can't find what you're looking for? Our customer success team is here to help
                with any questions or issues you might have.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/company/contact">
                  <Button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20">
                    Contact Support
                  </Button>
                </Link>
                <Link href="/company/contact">
                  <Button variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
                    Schedule a Call
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  );
}
