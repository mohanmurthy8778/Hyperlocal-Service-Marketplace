import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, Globe, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { InternationalPhoneInput } from '../components/InternationalPhoneInput';
import { isValidPhoneNumber } from 'react-phone-number-input';

export const Contact: React.FC = () => {
  const { toast } = useApp();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone && !isValidPhoneNumber(formData.phone)) {
      toast('Please enter a valid phone number', 'error');
      return;
    }
    toast('Your message has been dispatched successfully! Our premium concierges will respond shortly.', 'success');
    setIsSent(true);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-bg-secondary/50 dark:bg-bg-card/40 transition-colors duration-200" id="contact-page">
      {/* Premium Centered Hero Section */}
      <section className="relative overflow-hidden py-10 sm:py-14 border-b border-border-primary dark:border-border-primary bg-bg-card dark:bg-charcoal/40">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        
        {/* Glow decoration */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-4xl px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary tracking-wide mb-4"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
            24/7 Global VIP Support
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-primary-text"
          >
            Connect With Our <span className="text-primary">Support Desks</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-3 text-base text-secondary-text max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Need assistance with booking, corporate services, dispute resolution, or provider registrations? Reach out to our specialist concierges anytime.
          </motion.p>

          {/* Luxury Gold Accent Line */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="h-1 w-24 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-6 rounded-full"
          />
        </div>
      </section>

      {/* Modern Two-Column Layout */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact info + Interactive Map */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Contact details Card */}
            <div className="bg-bg-card dark:bg-charcoal rounded-[16px] border border-border-primary p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <h2 className="text-lg font-bold text-primary-text mb-5 flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-primary/10 text-primary"><Globe className="h-5 w-5" /></span>
                Corporate Headquarters
              </h2>

              <div className="space-y-5">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-bg-secondary/50 text-primary border border-border-primary">
                    <MapPin className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-secondary-text block">Office Address</span>
                    <strong className="text-xs font-bold text-primary-text mt-0.5 block">Seattle Tech Plaza</strong>
                    <span className="text-xs text-secondary-text">1000 Plaza Ave, Suite 400, Seattle, WA 98101</span>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-bg-secondary/50 text-primary border border-border-primary">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-secondary-text block">Direct Line</span>
                    <strong className="text-xs font-bold text-primary-text mt-0.5 block">+1 (555) 999-0000</strong>
                    <span className="text-xs text-secondary-text">Toll-free 24/7 client concierge support</span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-bg-secondary/50 text-primary border border-border-primary">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-secondary-text block">Digital Inbox</span>
                    <strong className="text-xs font-bold text-primary-text mt-0.5 block">support@hyperlocal.com</strong>
                    <span className="text-xs text-secondary-text">Response guaranteed in under 2 hours</span>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-bg-secondary/50 text-primary border border-border-primary">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-secondary-text block">Working Hours</span>
                    <div className="text-xs text-secondary-text mt-1 space-y-1">
                      <div className="flex justify-between gap-4">
                        <span>Monday – Friday</span>
                        <span className="font-semibold">8:00 AM – 8:00 PM PST</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Saturday – Sunday</span>
                        <span className="font-semibold">9:00 AM – 6:00 PM PST</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Map Mockup */}
            <div className="bg-bg-card dark:bg-charcoal rounded-[16px] border border-border-primary p-4 shadow-sm overflow-hidden group">
              <div className="relative h-44 rounded-xl overflow-hidden bg-bg-secondary border border-border-primary dark:border-border-primary flex items-center justify-center">
                
                {/* SVG Blueprint grid map to simulate a highly stylized, clean commercial tech map */}
                <svg className="absolute inset-0 w-full h-full opacity-30 dark:opacity-25" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="1" className="text-secondary-text dark:text-secondary-text" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  <path d="M 0 60 Q 150 90 300 40 T 600 120" fill="none" stroke="#D4AF37" strokeWidth="1.5" className="opacity-40" />
                  <path d="M 50 150 C 150 50, 300 180, 500 20" fill="none" stroke="#D4AF37" strokeWidth="2" className="opacity-35" />
                </svg>

                {/* Center marker glowing */}
                <div className="relative z-10 flex flex-col items-center">
                  <span className="absolute -top-1 w-8 h-8 bg-primary/30 rounded-full animate-ping" />
                  <div className="bg-bg-secondary dark:bg-bg-card text-primary-text p-2 rounded-full shadow-lg border border-primary">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <span className="mt-2 text-[10px] font-extrabold bg-bg-secondary dark:bg-bg-card text-primary-text dark:bg-bg-card dark:text-charcoal px-2.5 py-1 rounded-md shadow-md border border-border-primary dark:border-border-primary tracking-wider">
                    SEATTLE HQ
                  </span>
                </div>

                <div className="absolute bottom-2 right-2 text-[9px] font-bold text-secondary-text bg-bg-card/85 dark:bg-charcoal/85 px-2 py-0.5 rounded-md border border-border-primary">
                  Google Maps API Layer
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] font-bold text-secondary-text">Coordinates: 47.6062° N, 122.3321° W</span>
                <a 
                  href="https://maps.google.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs font-extrabold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
                >
                  Open Live Map
                  <span className="text-[10px]">&rarr;</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-7"
          >
            <div className="bg-bg-card dark:bg-charcoal rounded-[16px] border border-border-primary p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300">
              {isSent ? (
                <div className="text-center py-16 space-y-5">
                  <div className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-100 dark:border-emerald-900">
                    <CheckCircle className="h-9 w-9" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-primary-text">Message Dispatched!</h3>
                    <p className="text-sm text-secondary-text max-w-md mx-auto leading-relaxed">
                      Thank you for contacting ServiceHub support. Your priority ticket has been assigned to our concierge service bureau. We will follow up via email within the next 2 hours.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSent(false)}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover shadow-md transition-all"
                  >
                    Submit Another Query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="border-b border-border-primary pb-4">
                    <h2 className="text-lg font-bold text-primary-text flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-primary/10 text-primary"><MessageSquare className="h-5 w-5" /></span>
                      Priority Transmission Desk
                    </h2>
                    <p className="text-xs text-secondary-text mt-1">Submit your specific concerns below, and a certified dispatcher will claim your ticket immediately.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold text-secondary-text uppercase tracking-wider">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full text-xs py-2.5 px-3.5 rounded-xl border border-border-primary bg-bg-secondary/50 dark:bg-bg-card dark:text-white outline-none focus:border-primary focus:bg-bg-card dark:focus:bg-charcoal transition-all duration-200"
                        placeholder="Sarah Jenkins"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold text-secondary-text uppercase tracking-wider">Your Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full text-xs py-2.5 px-3.5 rounded-xl border border-border-primary bg-bg-secondary/50 dark:bg-bg-card dark:text-white outline-none focus:border-primary focus:bg-bg-card dark:focus:bg-charcoal transition-all duration-200"
                        placeholder="sarah@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold text-secondary-text uppercase tracking-wider">Phone Number</label>
                      <InternationalPhoneInput
                        value={formData.phone}
                        onChange={(val) => setFormData({ ...formData, phone: val || '' })}
                        required
                        className="w-full text-xs"
                      />
                    </div>

                    {/* Subject */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold text-secondary-text uppercase tracking-wider">Topic / Subject</label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full text-xs py-2.5 px-3.5 rounded-xl border border-border-primary bg-bg-secondary/50 dark:bg-bg-card dark:text-white outline-none focus:border-primary focus:bg-bg-card dark:focus:bg-charcoal transition-all duration-200"
                        placeholder="e.g. Booking dispute or Partnership"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-secondary-text uppercase tracking-wider">Detailed Message</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full text-xs p-3.5 rounded-xl border border-border-primary bg-bg-secondary/50 dark:bg-bg-card dark:text-white outline-none focus:border-primary focus:bg-bg-card dark:focus:bg-charcoal transition-all duration-200 resize-none"
                      placeholder="Describe your request, issue, or feedback in full detail..."
                    />
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-sm font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-primary/10 hover:shadow-primary/20"
                  >
                    <Send className="h-4 w-4" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};
