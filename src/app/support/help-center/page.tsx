import { Navbar } from "@/components/landing/navbar";
import { FooterSection } from "@/components/landing/footer-section";
import { Button } from "@/components/ui/button";
import { HelpCircle, Search, MessageCircle, Video, Settings } from "lucide-react";
import Link from "next/link";

const helpTopics = [
  {
    icon: Video,
    title: "Getting Started",
    description: "Learn how to set up your first meeting with AI avatars",
    articles: ["Setting up your account", "Creating your first meeting", "Inviting participants"]
  },
  {
    icon: MessageCircle,
    title: "AI Avatars",
    description: "Everything you need to know about using AI avatars",
    articles: ["Avatar customization", "Voice settings", "Meeting integration"]
  },
  {
    icon: Settings,
    title: "Account & Billing",
    description: "Manage your subscription and account settings",
    articles: ["Subscription plans", "Payment methods", "Account security"]
  }
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar />
      <main className="pt-16">
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Help{" "}
                <span className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
                  Center
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
                Find answers to common questions and get the help you need to make the most of Shadow AI.
              </p>

              {/* Search */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search for help..."
                    className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                  />
                </div>
              </div>
            </div>

            {/* Help Topics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {helpTopics.map((topic, index) => (
                <div key={index} className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-200">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center mb-6">
                    <topic.icon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{topic.title}</h3>
                  <p className="text-gray-400 mb-4">{topic.description}</p>
                  <ul className="space-y-2">
                    {topic.articles.map((article, articleIndex) => (
                      <li key={articleIndex}>
                        <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                          {article}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Contact Support */}
            <div className="text-center p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-4">Still need help?</h3>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                Can't find what you're looking for? Our customer success team is here to help
                with any questions or issues you might have.
              </p>
              <Link href="/company/contact">
                <Button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  );
}
