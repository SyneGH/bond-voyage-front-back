"use client";

import { Mail } from "lucide-react";
import bondVoyageLogo from "../assets/21212dac6efafd12a8aea1483228a3725c3d0aa9.png";

export function Footer() {
  const aboutLinks = ["About", "Team"];
  const featureLinks = ["User Features", "Admin Features"];

  return (
    <footer className="py-16" style={{ backgroundColor: 'var(--deep-navy)' }}>
      <div className="container mx-auto px-8 md:px-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img 
                src={bondVoyageLogo} 
                alt="BondVoyage" 
                className="h-8"
                style={{ objectFit: 'contain' }}
              />
            </div>
            <p className="text-sm text-white opacity-80">
              Plan smarter. Travel better. With BondVoyage.
            </p>
          </div>

          {/* About Column */}
          <div>
            <h4 className="text-white mb-4" style={{ fontWeight: 600 }}>
              BondVoyage
            </h4>
            <ul className="space-y-2">
              {aboutLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-sm text-white transition-colors hover:opacity-100"
                    style={{ opacity: 0.8 }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Features Column */}
          <div>
            <h4 className="text-white mb-4" style={{ fontWeight: 600 }}>
              Features
            </h4>
            <ul className="space-y-2">
              {featureLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-sm text-white transition-colors hover:opacity-100"
                    style={{ opacity: 0.8 }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Column */}
          <div>
            <h4 className="text-white mb-4" style={{ fontWeight: 600 }}>
              Connect
            </h4>
            <div className="flex items-center gap-2 text-sm text-white" style={{ opacity: 0.8 }}>
              <Mail className="h-4 w-4" />
              <span>bondvoyage.system@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white opacity-60">
            <p>© 2025 BondVoyage. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:opacity-100 transition-opacity">
                Privacy Policy
              </a>
              <a href="#" className="hover:opacity-100 transition-opacity">
                Terms of Service
              </a>
              <a href="#" className="hover:opacity-100 transition-opacity">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
