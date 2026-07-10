import React from 'react';
import { ShieldCheck, Heart, Sparkles, Award } from 'lucide-react';
import { motion } from 'motion/react';

export const About: React.FC = () => {
  const stats = [
    { value: '50,000+', label: 'Delighted Clients' },
    { value: '4.8 ★', label: 'Average Job Rating' },
    { value: '250+', label: 'Verified Partners' },
    { value: '15+', label: 'Neighborhood Categories' }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16 transition-colors duration-200" id="about-us-page">
      {/* Title Header */}
      <section className="text-center space-y-4">
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Our Mission</span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary-text leading-tight">
          Convenient, Premium Services <br />
          <span className="text-primary">At Your Fingersteps</span>
        </h1>
        <p className="text-sm text-secondary-text max-w-xl mx-auto leading-relaxed">
          ServiceHub was founded in 2024 to simplify household upkeep and professional wellness. We bridge the gap between busy homeowners and skilled neighborhood technicians with absolute safety and convenience.
        </p>
      </section>

      {/* Visual Stats Banner */}
      <section className="bg-gradient-to-r from-bg-card dark:from-bg-secondary to-bg-secondary dark:to-bg-card border border-primary/15 rounded-3xl p-8 md:p-12 text-primary-text text-center shadow-xl shadow-primary/5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="space-y-1">
              <span className="text-3xl md:text-4xl font-extrabold tracking-tight">{stat.value}</span>
              <p className="text-xs text-secondary-text font-semibold">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Corporate Values */}
      <section className="space-y-8">
        <div className="text-center">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">Corporate DNA</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-primary-text">Our Core Core Pillars</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="bg-bg-card p-6 rounded-2xl border border-border-primary shadow-sm space-y-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-extrabold text-primary-text">Absolute Verification</h3>
            <p className="text-xs text-secondary-text leading-relaxed">
              Every provider undergoes background checks, credentials vetting, and regular quality reviews before visiting your home.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-bg-card p-6 rounded-2xl border border-border-primary shadow-sm space-y-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Heart className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-extrabold text-primary-text">Client Safety First</h3>
            <p className="text-xs text-secondary-text leading-relaxed">
              We cover all scheduled jobs with standard service liability insurance. Your safety and absolute peace of mind are guaranteed.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-bg-card p-6 rounded-2xl border border-border-primary shadow-sm space-y-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-extrabold text-primary-text">Premium Quality</h3>
            <p className="text-xs text-secondary-text leading-relaxed">
              We stand behind our work. If you are not completely satisfied with the cleaning or repair, we will re-do the service at zero extra charge.
            </p>
          </div>
        </div>
      </section>

      {/* Leadership Team block */}
      <section className="space-y-8">
        <div className="text-center">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">Founders</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-primary-text">Who is behind ServiceHub</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Sarah Vance', role: 'CEO & Co-founder', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
            { name: 'Arjun Mehta', role: 'CTO & Co-founder', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
            { name: 'Chloe Dubois', role: 'Chloe Vance', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
            { name: 'Michael Cole', role: 'Director of Security', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' }
          ].map((member, i) => (
            <div key={i} className="text-center space-y-2 border border-border-primary p-4 rounded-2xl bg-bg-card shadow-sm">
              <img
                src={member.avatar}
                alt={member.name}
                className="h-20 w-20 rounded-full object-cover mx-auto border-2 border-primary/30"
              />
              <h3 className="text-xs font-extrabold text-primary-text">{member.name}</h3>
              <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{member.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
