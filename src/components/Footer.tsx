import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-bg-secondary text-secondary-text dark:bg-bg-card border-t border-border-primary transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          
          {/* Brand block */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <Logo className="w-10 h-10 transition-transform duration-300 group-hover:scale-105" />
              <span className="text-2xl font-black tracking-tight text-primary-text flex items-center">
                Service<span className="text-[#DCA543]">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-secondary-text max-w-sm">
              Your one-stop commercial-grade service hub. Get certified, reliable local experts for deep home cleaning, electrical, plumbing, massage wellness, and renovations, right at your doorstep.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-secondary-text hover:text-primary-text dark:hover:text-white transition-colors"><Facebook className="h-4.5 w-4.5" /></a>
              <a href="#" className="text-secondary-text hover:text-primary-text dark:hover:text-white transition-colors"><Twitter className="h-4.5 w-4.5" /></a>
              <a href="#" className="text-secondary-text hover:text-primary-text dark:hover:text-white transition-colors"><Instagram className="h-4.5 w-4.5" /></a>
              <a href="#" className="text-secondary-text hover:text-primary-text dark:hover:text-white transition-colors"><Linkedin className="h-4.5 w-4.5" /></a>
            </div>
          </div>

          {/* Quick links columns */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary-text mb-4">
              Our Services
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/services" className="hover:text-primary-text dark:hover:text-white transition-colors">Home Cleaning</Link></li>
              <li><Link to="/services" className="hover:text-primary-text dark:hover:text-white transition-colors">Electricians & Plumbers</Link></li>
              <li><Link to="/services" className="hover:text-primary-text dark:hover:text-white transition-colors">Salon & Massage</Link></li>
              <li><Link to="/services" className="hover:text-primary-text dark:hover:text-white transition-colors">Air Conditioners</Link></li>
              <li><Link to="/services" className="hover:text-primary-text dark:hover:text-white transition-colors">Wall Painters</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary-text mb-4">
              Support & Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/faq" className="hover:text-primary-text dark:hover:text-white transition-colors">Help & FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-primary-text dark:hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-text dark:hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary-text dark:hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/about" className="hover:text-primary-text dark:hover:text-white transition-colors">About Company</Link></li>
            </ul>
          </div>

          {/* Contact block */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary-text">
              Get in Touch
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-secondary-text">1000 Plaza Ave, Suite 400, Seattle, WA 98101</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4.5 w-4.5 text-primary shrink-0" />
                <span className="text-secondary-text">+1 (555) 999-0000</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4.5 w-4.5 text-primary shrink-0" />
                <span className="text-secondary-text">hello@nabr.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 border-t border-border-primary pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-secondary-text">
          <p>© 2026 ServiceHub Technologies Inc. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="hover:underline">Privacy</Link>
            <Link to="/terms" className="hover:underline">Terms</Link>
            <a href="#" className="hover:underline">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
