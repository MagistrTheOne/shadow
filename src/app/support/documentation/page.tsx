import { Navbar } from "@/components/landing/navbar";
import { FooterSection } from "@/components/landing/footer-section";
import { Button } from "@/components/ui/button";
import { Book, Code, Zap, Users, Video } from "lucide-react";
import Link from "next/link";

const docSections = [
  {
    icon: Zap,
    title: "Quick Start",
    description: "Get up and running with Shadow AI in minutes",
    guides: ["Installation", "Authentication", "First Meeting", "API Overview"]
  },
  {
    icon: Users,
    title: "AI Avatars",
    description: "Learn how to customize and manage AI avatars",
    guides: ["Avatar Creation", "Voice Settings", "Meeting Integration", "Customization"]
  },
  {
    icon: Video,
    title: "API Reference",
    description: "Complete API documentation with examples",
    guides: ["REST API", "Webhooks", "Rate Limits", "Authentication"]
  },
  {
    icon: Code,
    title: "SDKs & Tools",
    description: "Developer tools and SDK documentation",
    guides: ["JavaScript SDK", "Python SDK", "React Components", "Best Practices"]
  }
];

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar />
      <main className="pt-16">
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Documentation{" "}
                <span className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
                  Center
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Comprehensive guides and documentation to help you integrate and use Shadow AI
                in your applications and workflows.
              </p>
            </div>

            {/* Documentation Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {docSections.map((section, index) => (
                <div key={index} className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-200">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center mb-6">
                    <section.icon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{section.title}</h3>
                  <p className="text-gray-400 mb-4">{section.description}</p>
                  <ul className="space-y-2">
                    {section.guides.map((guide, guideIndex) => (
                      <li key={guideIndex}>
                        <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center">
                          <Book className="w-4 h-4 mr-2" />
                          {guide}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Code Example */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-8 text-center">Quick Start Example</h2>
              <div className="p-6 bg-gray-900 rounded-2xl border border-white/10">
                <pre className="text-gray-300 text-sm overflow-x-auto">
                  <code>{`// Initialize Shadow AI
import { ShadowAI } from '@shadowai/sdk';

const client = new ShadowAI({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Create a meeting
const meeting = await client.meetings.create({
  title: 'Team Standup',
  participants: ['john@company.com', 'jane@company.com'],
  avatar: {
    voice: 'professional',
    personality: 'friendly'
  }
});

console.log('Meeting created:', meeting.id);`}</code>
                </pre>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              <h3 className="text-xl font-semibold text-white mb-4">Need More Help?</h3>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                Our documentation is continuously updated. If you can't find what you're looking for,
                our developer support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/support/api-reference">
                  <Button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20">
                    View API Reference
                  </Button>
                </Link>
                <Link href="/company/contact">
                  <Button variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
                    Contact Developers
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
