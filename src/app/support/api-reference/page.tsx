import { Navbar } from "@/components/landing/navbar";
import { FooterSection } from "@/components/landing/footer-section";
import { Button } from "@/components/ui/button";
import { Code, Key, Webhook, Shield, Book, ExternalLink } from "lucide-react";
import Link from "next/link";

const apiSections = [
  {
    icon: Code,
    title: "REST API",
    description: "Complete REST API documentation with endpoints and examples",
    endpoints: [
      "Authentication",
      "Meetings",
      "AI Avatars",
      "Transcripts",
      "Webhooks"
    ]
  },
  {
    icon: Key,
    title: "Authentication",
    description: "API key management and authentication methods",
    endpoints: [
      "API Keys",
      "OAuth Flow",
      "JWT Tokens",
      "Rate Limiting"
    ]
  },
  {
    icon: Webhook,
    title: "Webhooks",
    description: "Real-time event notifications and webhook configuration",
    endpoints: [
      "Webhook Events",
      "Payloads",
      "Security",
      "Testing"
    ]
  },
  {
    icon: Shield,
    title: "Security",
    description: "Security best practices and compliance information",
    endpoints: [
      "Encryption",
      "Compliance",
      "Data Privacy",
      "Audit Logs"
    ]
  }
];

const codeExamples = [
  {
    language: "JavaScript",
    code: `// Initialize Shadow AI
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

console.log('Meeting created:', meeting.id);`
  },
  {
    language: "Python",
    code: `from shadowai import ShadowAI

client = ShadowAI(api_key='your-api-key')

meeting = client.meetings.create(
    title='Weekly Team Sync',
    participants=['user1@company.com'],
    avatar={
        'personality': 'professional',
        'voice': 'neutral'
    }
)

print(f'Meeting created: {meeting.id}')`
  },
  {
    language: "cURL",
    code: `curl -X POST https://api.shadowai.com/v1/meetings \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Team Standup",
    "participants": ["john@company.com"],
    "avatar": {
      "personality": "professional"
    }
  }'`
  }
];

export default function ApiReferencePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar />
      <main className="pt-16">
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                API{" "}
                <span className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
                  Reference
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Complete API documentation for integrating Shadow AI into your applications.
                Build powerful meeting experiences with our comprehensive API.
              </p>
            </div>

            {/* Quick Start */}
            <div className="mb-16 p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Quick Start</h2>
                <div className="flex gap-4">
                  <Link href="/support/documentation">
                    <Button variant="outline" size="sm" className="border-white/20 text-gray-300 hover:bg-white/10">
                      <Book className="w-4 h-4 mr-2" />
                      Documentation
                    </Button>
                  </Link>
                  <Link href="/company/contact">
                    <Button size="sm" className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20">
                      Get API Key
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-6 border border-white/10 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Base URL</h3>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    API Console
                  </Button>
                </div>
                <div className="bg-black/50 rounded-lg p-4 border border-white/10">
                  <code className="text-gray-300 font-mono">https://api.shadowai.com/v1</code>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Authentication</h3>
                <pre className="text-gray-300 text-sm overflow-x-auto">
                  <code>{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     https://api.shadowai.com/v1/meetings`}</code>
                </pre>
              </div>
            </div>

            {/* API Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {apiSections.map((section, index) => (
                <div key={index} className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-200">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center mb-6">
                    <section.icon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{section.title}</h3>
                  <p className="text-gray-400 mb-4">{section.description}</p>
                  <ul className="space-y-2">
                    {section.endpoints.map((endpoint, endpointIndex) => (
                      <li key={endpointIndex}>
                        <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center">
                          <Code className="w-4 h-4 mr-2" />
                          {endpoint}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Code Examples */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-8 text-center">Code Examples</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {codeExamples.map((example, index) => (
                  <div key={index} className="p-6 bg-gray-900 rounded-lg border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">{example.language}</h3>
                    <pre className="text-gray-300 text-sm overflow-x-auto">
                      <code>{example.code}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>

            {/* Response Example */}
            <div className="mb-16 p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Example Response</h2>
              <div className="bg-gray-900 rounded-lg p-6 border border-white/10">
                <pre className="text-gray-300 text-sm overflow-x-auto">
                  <code>{`{
  "id": "meeting_123",
  "title": "Team Standup",
  "status": "scheduled",
  "scheduledAt": "2025-01-20T10:00:00Z",
  "participants": [
    {
      "id": "user_456",
      "email": "john@company.com",
      "role": "participant"
    }
  ],
  "avatar": {
    "id": "avatar_789",
    "personality": "professional",
    "voice": "neutral",
    "status": "active"
  },
  "createdAt": "2025-01-15T09:00:00Z",
  "updatedAt": "2025-01-15T09:00:00Z"
}`}</code>
                </pre>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              <h3 className="text-xl font-semibold text-white mb-4">Ready to Build?</h3>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                Start integrating Shadow AI into your applications today. Our comprehensive API
                documentation and dedicated developer support team are here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/company/contact">
                  <Button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20">
                    Get API Access
                  </Button>
                </Link>
                <Link href="/support/documentation">
                  <Button variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
                    View Guides
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