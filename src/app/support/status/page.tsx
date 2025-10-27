import { Navbar } from "@/components/landing/navbar";
import { FooterSection } from "@/components/landing/footer-section";
import { Activity, CheckCircle, AlertTriangle, XCircle, Clock, Mail } from "lucide-react";
import Link from "next/link";

const services = [
  {
    name: "API Gateway",
    status: "operational",
    uptime: "99.9%",
    responseTime: "120ms"
  },
  {
    name: "AI Avatar Engine",
    status: "operational",
    uptime: "99.8%",
    responseTime: "200ms"
  },
  {
    name: "Video Streaming",
    status: "operational",
    uptime: "99.9%",
    responseTime: "80ms"
  },
  {
    name: "Transcription Service",
    status: "operational",
    uptime: "99.7%",
    responseTime: "350ms"
  },
  {
    name: "Authentication",
    status: "operational",
    uptime: "99.9%",
    responseTime: "45ms"
  },
  {
    name: "File Storage",
    status: "operational",
    uptime: "99.9%",
    responseTime: "90ms"
  }
];

const incidents = [
  {
    date: "2025-01-10",
    title: "Scheduled Maintenance",
    description: "Routine maintenance completed successfully. All systems are now fully operational.",
    status: "resolved",
    impact: "None"
  },
  {
    date: "2025-01-05",
    title: "API Performance",
    description: "Brief performance degradation in EU region, resolved in 15 minutes. Issue was related to increased load.",
    status: "resolved",
    impact: "Minor"
  }
];

const maintenance = [
  {
    date: "2025-01-25",
    time: "02:00 - 04:00 UTC",
    title: "Database Optimization",
    description: "Scheduled maintenance to optimize database performance."
  }
];

function getStatusIcon(status: string) {
  switch (status) {
    case "operational":
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    case "degraded":
      return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    case "outage":
      return <XCircle className="w-5 h-5 text-red-400" />;
    default:
      return <Activity className="w-5 h-5 text-gray-400" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "operational":
      return "text-green-400";
    case "degraded":
      return "text-yellow-400";
    case "outage":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
}

function getImpactColor(impact: string) {
  switch (impact) {
    case "None":
      return "bg-green-500/20 text-green-300";
    case "Minor":
      return "bg-yellow-500/20 text-yellow-300";
    case "Major":
      return "bg-red-500/20 text-red-300";
    default:
      return "bg-gray-500/20 text-gray-300";
  }
}

export default function StatusPage() {
  const overallStatus = "operational";
  const lastUpdated = new Date().toLocaleString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar />
      <main className="pt-16">
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                System{" "}
                <span className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
                  Status
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Real-time status of Shadow AI services and infrastructure.
                We're committed to transparency and reliability.
              </p>
            </div>

            {/* Overall Status */}
            <div className="mb-12 p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                  {getStatusIcon(overallStatus)}
                  <div>
                    <h2 className="text-2xl font-bold text-white">All Systems Operational</h2>
                    <p className="text-gray-400">Last updated: {lastUpdated}</p>
                  </div>
                </div>
                <div className="text-center lg:text-right">
                  <div className={`text-3xl font-bold ${getStatusColor(overallStatus)}`}>
                    {overallStatus === "operational" ? "✓" : "!"}
                  </div>
                  <p className="text-gray-400 text-sm capitalize">{overallStatus}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">99.9%</div>
                  <p className="text-gray-400 text-sm">Uptime (30d)</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">150ms</div>
                  <p className="text-gray-400 text-sm">Avg Response</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">24/7</div>
                  <p className="text-gray-400 text-sm">Monitoring</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">SOC 2</div>
                  <p className="text-gray-400 text-sm">Compliant</p>
                </div>
              </div>
            </div>

            {/* Service Status */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-8">Service Status</h2>
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(service.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                        <p className="text-gray-400 text-sm">
                          {service.uptime} uptime • {service.responseTime} response time
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium capitalize ${getStatusColor(service.status)}`}>
                        {service.status}
                      </div>
                      <p className="text-gray-500 text-sm">Last checked: now</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Incidents */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              <div>
                <h2 className="text-2xl font-bold text-white mb-8">Recent Incidents</h2>
                <div className="space-y-4">
                  {incidents.map((incident, index) => (
                    <div key={index} className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <div>
                            <h3 className="text-lg font-semibold text-white">{incident.title}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs ${getImpactColor(incident.impact)}`}>
                                {incident.impact} Impact
                              </span>
                              <span className="text-gray-500 text-sm">
                                {new Date(incident.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                          {incident.status}
                        </span>
                      </div>
                      <p className="text-gray-400">{incident.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-8">Scheduled Maintenance</h2>
                <div className="space-y-4">
                  {maintenance.map((item, index) => (
                    <div key={index} className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                      <div className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                          <div className="flex items-center space-x-4 text-gray-400 text-sm mb-2">
                            <span>{item.date}</span>
                            <span>{item.time}</span>
                          </div>
                          <p className="text-gray-400">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Subscribe to Updates */}
            <div className="text-center p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-4">Stay Informed</h3>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                Subscribe to status updates and get notified when incidents occur or maintenance is scheduled.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                />
                <button className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  );
}