import { Navbar } from "@/components/landing/navbar";
import { FooterSection } from "@/components/landing/footer-section";
import { Button } from "@/components/ui/button";
import { Users, Target, Award, Mail, Linkedin, Github, Twitter, Building2, Globe, Shield } from "lucide-react";
import Link from "next/link";

export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                About{" "}
                <span className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
                  Shadow AI
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                We're building the future of professional meetings with sophisticated AI technology
                that enhances collaboration and productivity.
              </p>
            </div>

            {/* Company Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-200">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">10,000+</div>
                <p className="text-gray-400">Enterprise Teams</p>
              </div>
              <div className="text-center p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-200">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">99.9%</div>
                <p className="text-gray-400">Uptime SLA</p>
              </div>
              <div className="text-center p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-200">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">SOC 2</div>
                <p className="text-gray-400">Compliant</p>
              </div>
            </div>

            {/* Mission & Vision */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              <div className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
                <p className="text-gray-400 leading-relaxed">
                  To revolutionize professional communication by making AI avatars that are so natural
                  and intelligent that they become indispensable team members, enhancing every meeting
                  with context-aware insights and seamless collaboration.
                </p>
              </div>

              <div className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <Globe className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
                <p className="text-gray-400 leading-relaxed">
                  A world where AI enhances human connection rather than replacing it. Where every
                  professional meeting is more productive, inclusive, and insightful through the power
                  of intelligent AI assistance.
                </p>
              </div>
            </div>

            {/* Values */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-white text-center mb-12">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Security First</h3>
                  <p className="text-gray-400">Enterprise-grade security and privacy protection for all our users.</p>
                </div>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Human-Centered</h3>
                  <p className="text-gray-400">AI that enhances human capabilities, not replaces them.</p>
                </div>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Enterprise Ready</h3>
                  <p className="text-gray-400">Built for scale, reliability, and enterprise requirements.</p>
                </div>
              </div>
            </div>

            {/* Team CTA */}
            <div className="text-center mb-16">
              <h2 className="text-2xl font-bold text-white mb-6">Join Our Team</h2>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                We're always looking for talented individuals who share our passion for AI
                and want to help shape the future of professional collaboration.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/company/careers">
                  <Button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20">
                    View Open Positions
                  </Button>
                </Link>
                <Link href="/company/contact">
                  <Button variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                <Mail className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
                <p className="text-gray-400">magistrtheone@gmail.com</p>
              </div>
              <div className="text-center p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Location</h3>
                <p className="text-gray-400">Remote-First Company</p>
              </div>
              <div className="text-center p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                <Globe className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Global</h3>
                <p className="text-gray-400">Serving teams worldwide</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  );
}