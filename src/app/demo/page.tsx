"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Bot, 
  Video, 
  Users, 
  Calendar,
  MessageSquare,
  Mic,
  ScreenShare,
  Settings,
  Zap,
  Star,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const DEMO_FEATURES = [
  {
    icon: Bot,
    title: "AI-Powered Agents",
    description: "Meet Sarah, our intelligent meeting assistant who can take notes, schedule follow-ups, and provide real-time insights.",
    demo: "Watch Sarah join a meeting and automatically transcribe conversations while identifying action items."
  },
  {
    icon: Video,
    title: "HD Video Conferencing",
    description: "Crystal clear video quality with advanced noise cancellation and background blur options.",
    demo: "Experience seamless video calls with professional-grade audio and video quality."
  },
  {
    icon: MessageSquare,
    title: "Smart Transcription",
    description: "Real-time transcription with speaker identification and automatic summarization.",
    demo: "See how our AI converts speech to text with 99% accuracy and identifies different speakers."
  },
  {
    icon: Calendar,
    title: "Intelligent Scheduling",
    description: "AI-powered scheduling that finds optimal meeting times for all participants.",
    demo: "Watch our AI analyze calendars and suggest the best meeting times automatically."
  },
  {
    icon: Mic,
    title: "Voice Commands",
    description: "Control your meetings with natural voice commands and AI-powered automation.",
    demo: "Experience hands-free meeting control with voice commands like 'Start recording' or 'Schedule follow-up'."
  },
  {
    icon: ScreenShare,
    title: "Advanced Screen Sharing",
    description: "Share your screen with annotation tools and collaborative whiteboarding.",
    demo: "See how participants can annotate shared screens and collaborate in real-time."
  }
];

const TESTIMONIALS = [
  {
    name: "Sarah Johnson",
    role: "CEO, TechCorp",
    content: "Shadow.AI has revolutionized our team meetings. The AI agent saves us hours of follow-up work.",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Product Manager, StartupXYZ",
    content: "The transcription accuracy is incredible. We never miss important details anymore.",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    role: "Marketing Director, GrowthCo",
    content: "The scheduling AI is a game-changer. It finds meeting times that work for everyone.",
    rating: 5
  }
];

export default function DemoPage() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  const handlePlayDemo = (featureTitle: string) => {
    setActiveDemo(featureTitle);
    setIsPlayingDemo(true);
    toast.success(`Starting demo: ${featureTitle}`);
    
    // Simulate demo playback
    setTimeout(() => {
      setIsPlayingDemo(false);
      setActiveDemo(null);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black"></div>
        <div className="relative py-20 px-4 md:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30 mb-6">
              <Star className="w-3 h-3 mr-1" />
              Enterprise Demo
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Experience the Future of
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> AI Meetings</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              See how Shadow.AI transforms your meetings with intelligent agents, real-time transcription, 
              and advanced collaboration tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                onClick={() => handlePlayDemo("Full Platform Demo")}
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Full Demo
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg"
                asChild
              >
                <Link href="/dashboard/meetings/new">
                  Try It Yourself
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Features */}
      <div className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              See Shadow.AI in Action
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Explore our powerful features through interactive demonstrations
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {DEMO_FEATURES.map((feature, index) => (
              <Card 
                key={index}
                className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-200"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                  </div>
                  <p className="text-gray-400">{feature.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-gray-300 text-sm mb-3">{feature.demo}</p>
                      <Button 
                        size="sm" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handlePlayDemo(feature.title)}
                        disabled={isPlayingDemo && activeDemo === feature.title}
                      >
                        {isPlayingDemo && activeDemo === feature.title ? (
                          <>
                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Playing...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Watch Demo
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Live Demo Section */}
      <div className="py-20 px-4 md:px-8 bg-gradient-to-r from-blue-900/10 to-purple-900/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Join a Live Demo Session
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience Shadow.AI with our team in real-time
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-400" />
                  Schedule a Demo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-400">
                  Book a personalized demo with our team to see how Shadow.AI can transform your organization's meetings.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>30-minute personalized session</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Q&A with our experts</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Custom use case discussion</span>
                  </div>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Demo
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Group Demo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-400">
                  Join our weekly group demo sessions to see Shadow.AI in action with other potential customers.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <span>Every Tuesday at 2 PM EST</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <span>45-minute interactive session</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <span>Network with other users</span>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Users className="w-4 h-4 mr-2" />
                  Join Next Session
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              See how Shadow.AI is transforming meetings across industries
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial, index) => (
              <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 md:px-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Meetings?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Start your free trial today and experience the power of AI-driven meetings
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
              asChild
            >
              <Link href="/dashboard/meetings/new">
                <Zap className="w-5 h-5 mr-2" />
                Start Free Trial
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg"
              asChild
            >
              <Link href="/dashboard/upgrade">
                <Settings className="w-5 h-5 mr-2" />
                View Pricing
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}