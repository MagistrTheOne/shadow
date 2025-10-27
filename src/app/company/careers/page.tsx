import { Navbar } from "@/components/landing/navbar";
import { FooterSection } from "@/components/landing/footer-section";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Zap } from "lucide-react";
import Link from "next/link";

const positions = [
  {
    title: "Senior AI Engineer",
    location: "Remote",
    type: "Full-time",
    description: "Build the next generation of AI avatars and meeting intelligence systems."
  },
  {
    title: "Frontend Developer",
    location: "Remote",
    type: "Full-time",
    description: "Create beautiful, responsive interfaces for our enterprise platform."
  },
  {
    title: "Product Designer",
    location: "Remote",
    type: "Full-time",
    description: "Design intuitive user experiences that make AI technology accessible."
  }
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar />
      <main className="pt-16">
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Join Our{" "}
                <span className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
                  Team
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Help us build the future of AI-powered meetings. We're looking for passionate
                individuals who want to make a difference in how teams collaborate.
              </p>
            </div>

            {/* Open Positions */}
            <div className="grid gap-6 mb-16">
              <h2 className="text-2xl font-bold text-white mb-8">Open Positions</h2>
              {positions.map((position, index) => (
                <div key={index} className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-xl font-semibold text-white mb-2">{position.title}</h3>
                      <p className="text-gray-400 mb-3">{position.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {position.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {position.type}
                        </div>
                      </div>
                    </div>
                    <Button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20">
                      Apply Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Why Join Us */}
            <div className="text-center mb-16">
              <h2 className="text-2xl font-bold text-white mb-8">Why Join Shadow AI?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Cutting-Edge Technology</h3>
                  <p className="text-gray-400">Work with the latest AI and machine learning technologies.</p>
                </div>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Collaborative Culture</h3>
                  <p className="text-gray-400">Join a team of passionate professionals who support each other.</p>
                </div>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Remote-First</h3>
                  <p className="text-gray-400">Work from anywhere with flexible hours and great benefits.</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <p className="text-gray-400 mb-6">Don't see a position that fits? We'd love to hear from you anyway.</p>
              <Link href="/contact">
                <Button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20">
                  Get in Touch
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
