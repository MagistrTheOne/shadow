import { Navbar } from "@/components/landing/navbar";
import { FooterSection } from "@/components/landing/footer-section";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";
import Link from "next/link";

const blogPosts = [
  {
    title: "The Future of AI-Powered Meetings",
    excerpt: "How intelligent avatars are transforming the way teams collaborate and communicate in professional settings.",
    date: "2025-01-15",
    readTime: "5 min read",
    author: "Shadow AI Team"
  },
  {
    title: "Enterprise Security in AI Applications",
    excerpt: "Best practices for implementing secure AI solutions in enterprise environments with SOC 2 compliance.",
    date: "2025-01-10",
    readTime: "8 min read",
    author: "Security Team"
  },
  {
    title: "Building Natural AI Conversations",
    excerpt: "The technology behind creating AI avatars that understand context and respond naturally in meetings.",
    date: "2025-01-05",
    readTime: "6 min read",
    author: "AI Research Team"
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar />
      <main className="pt-16">
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Shadow AI{" "}
                <span className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
                  Blog
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Insights, updates, and thoughts on the future of AI-powered collaboration
                from the team building the next generation of meeting technology.
              </p>
            </div>

            {/* Featured Post */}
            <div className="mb-16 p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              <div className="flex items-center space-x-4 mb-4">
                <div className="px-3 py-1 bg-gray-500/20 rounded-full">
                  <span className="text-gray-300 text-sm">Featured</span>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  January 15, 2025
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  5 min read
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                The Future of AI-Powered Meetings: A New Era of Collaboration
              </h2>
              <p className="text-gray-400 text-lg mb-6">
                Discover how intelligent AI avatars are revolutionizing professional communication,
                making meetings more productive, inclusive, and engaging than ever before.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-400">Shadow AI Team</span>
                </div>
                <Button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20">
                  Read More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Blog Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <article key={index} className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-200">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      {post.readTime}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-3 hover:text-gray-300 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-gray-400 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-500 text-sm">{post.author}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
                      Read More
                    </Button>
                  </div>
                </article>
              ))}
            </div>

            {/* Newsletter Signup */}
            <div className="mt-16 text-center p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              <h3 className="text-xl font-semibold text-white mb-4">Stay Updated</h3>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                Get the latest insights on AI technology, product updates, and industry trends
                delivered directly to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                />
                <Button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  );
}
