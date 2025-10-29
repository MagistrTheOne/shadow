"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, Mail, Twitter, Github, Linkedin } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export const FooterSection = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="relative py-14 mt-20 bg-gradient-to-t from-black via-gray-900/80 to-transparent border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-9 h-9 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.5)] border border-cyan-400/30">
                <Zap className="w-5 h-5 text-cyan-300" />
              </div>
              <span className="text-xl font-bold text-white">{t('landing.footer.brand')}</span>
            </Link>

            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              {t('landing.footer.description')}
            </p>

            <div className="flex space-x-3">
              {[ 
                { icon: Twitter, href: "https://twitter.com/MagistrTheOne" },
                { icon: Github, href: "https://github.com/MagistrTheOne" },
                { icon: Linkedin, href: "https://linkedin.com/in/MagistrTheOne" }
              ].map(({ icon: Icon, href }, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="icon"
                  asChild
                  className="text-gray-400 hover:text-cyan-300 hover:bg-cyan-400/10 transition"
                >
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    <Icon className="w-4 h-4" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('landing.footer.product')}</h3>
            <ul className="space-y-2 text-sm">
              {[t('nav.product'), t('nav.features'), t('nav.demo'), t('nav.pricing'), t('nav.getStarted')].map(
                (item, i) => (
                  <li key={i}>
                    <Link
                      href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-gray-400 hover:text-cyan-300 transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('landing.footer.company')}</h3>
            <ul className="space-y-2 text-sm">
              {["About", "Blog", "Careers", "Contact"].map((item, i) => (
                <li key={i}>
                  <Link
                    href={`/company/${item.toLowerCase()}`}
                    className="text-gray-400 hover:text-cyan-300 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('landing.footer.support')}</h3>
            <ul className="space-y-2 text-sm">
              {[
                "Help Center",
                "Documentation",
                "API Reference",
                "Status",
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    href={`/support/${item.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-gray-400 hover:text-cyan-300 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <div className="mb-4 md:mb-0">
            © {currentYear} {t('landing.footer.brand')}. {t('landing.footer.copyright')} 
            <span className="text-white font-semibold">@MagistrTheOne</span>
          </div>
          <div className="flex space-x-6">
            {["Privacy", "Terms", "Cookies"].map((link, i) => (
              <Link
                key={i}
                href={`/${link.toLowerCase()}`}
                className="hover:text-cyan-300 transition-colors"
              >
                {link}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="mt-10 p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-3 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <a
              href="mailto:magistrtheone@gmail.com"
              className="hover:text-cyan-300 transition-colors"
            >
              magistrtheone@gmail.com
            </a>
          </div>
          <div className="text-center sm:text-right">
            {t('landing.footer.createdBy')}{" "}
            <a
              href="https://github.com/MagistrTheOne"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-semibold hover:text-cyan-300 transition-colors"
            >
              @MagistrTheOne
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
