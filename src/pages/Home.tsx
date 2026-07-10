import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MOCK_CATEGORIES } from '../data';
import { ServiceCard } from '../components/ServiceCard';
import { 
  Search, Sparkles, MapPin, Star, ShieldCheck, 
  Clock, ArrowRight, CheckCircle, Smartphone,
  Wrench, Smile, BookOpen, Paintbrush, Leaf
} from 'lucide-react';
import { motion } from 'motion/react';

const ICON_MAP: Record<string, React.FC<any>> = {
  Sparkles, Wrench, Smile, BookOpen, Paintbrush, Leaf
};

export const Home: React.FC = () => {
  const { services } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('Seattle, WA');
  const [placeholderText, setPlaceholderText] = useState("Try 'Deep Cleaning', 'Leak repair', 'Wall Painting'...");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setPlaceholderText("Try 'Deep Cleaning'...");
      } else if (window.innerWidth < 1024) {
        setPlaceholderText("Try 'Deep Cleaning', 'Leak repair'...");
      } else {
        setPlaceholderText("Try 'Deep Cleaning', 'Leak repair', 'Wall Painting'...");
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/services');
    }
  };

  const featuredServices = services.slice(0, 3);

  return (
    <div className="flex flex-col gap-16 pb-16 transition-colors duration-200" id="home-page">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-white to-white dark:from-bg-secondary dark:from-bg-card/35 dark:via-gray-950 dark:to-bg-secondary dark:to-bg-card py-16 md:py-24 border-b border-border-primary dark:border-border-primary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Col: Headings & Search */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3.5 py-1.5 text-xs font-bold text-primary-dark dark:bg-primary/10 dark:text-primary border border-primary/15">
                <Sparkles className="h-4 w-4" />
                <span>Skilled Help, Right Around the Corner</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary-text leading-none">
                Your Home, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark">
                  Perfected.
                </span>
              </h1>
              
              <p className="text-base text-secondary-text max-w-md leading-relaxed">
                Connect instantly with verified local service providers—plumbers, electricians, tutors, cleaners, and more—right in your neighborhood.
              </p>

              {/* Advanced Search Bar Card */}
              <form 
                onSubmit={handleSearchSubmit}
                className="bg-bg-card border border-border-primary p-2 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-2 max-w-xl"
              >
                {/* Location Selection */}
                <div className="flex items-center gap-2 px-3 py-2 sm:border-r border-border-primary shrink-0">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    className="bg-transparent text-xs font-bold text-primary-text outline-none w-28"
                    placeholder="Enter location"
                  />
                </div>
                {/* Search input */}
                <div className="flex-1 flex items-center gap-2 px-3 py-2">
                  <Search className="h-4 w-4 text-secondary-text shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-xs text-secondary-text outline-none w-full"
                    placeholder={placeholderText}
                  />
                </div>
                {/* Search Action */}
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-xs font-extrabold text-[#2A211C] transition-all shadow-lg shadow-primary/10 shrink-0 cursor-pointer"
                >
                  Find Services
                </button>
              </form>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-secondary-text">
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                  <span>100% Insured Jobs</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-secondary-text">
                  <Star className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />
                  <span>4.8/5 Customer Rating</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-secondary-text">
                  <Clock className="h-4.5 w-4.5 text-primary" />
                  <span>60-Min Doorstep Arrival</span>
                </div>
              </div>
            </div>

            {/* Right Col: Interactive Visual Frame */}
            <div className="relative justify-center hidden lg:flex">
              <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />
              <div className="absolute right-0 bottom-0 h-44 w-44 rounded-full bg-primary/5 blur-3xl" />
              <div className="relative rounded-3xl overflow-hidden border-8 border-white dark:border-border-primary shadow-2xl max-w-sm">
                <img
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600"
                  alt="Home Service Professional"
                  className="w-full object-cover aspect-[4/5]"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-bg-card/90 dark:bg-bg-card/95 backdrop-blur-md rounded-2xl p-4 border border-white/50 dark:border-border-primary shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-charcoal shadow-md">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-primary-text leading-none">Marcus Green</p>
                      <span className="text-[10px] text-secondary-text block mt-0.5">Top-Rated Cleaning Specialist</span>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-bold text-secondary-text">4.9 (512 jobs)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Categories Bento-Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">Categories</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-primary-text">What can we help you with?</h2>
          </div>
          <Link
            to="/categories"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mt-2 md:mt-0"
          >
            <span>View All Categories</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {MOCK_CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Sparkles;
            return (
              <Link
                key={cat.id}
                to={`/services?category=${cat.id}`}
                className="group p-5 rounded-2xl border border-border-primary bg-bg-card hover:border-primary/30 dark:border-border-primary dark:bg-bg-card hover:shadow-md transition-all text-center flex flex-col items-center"
              >
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${cat.bgGradient} flex items-center justify-center text-current mb-3 group-hover:scale-105 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xs font-bold text-primary-text group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-secondary-text mt-1 block">
                  {cat.serviceCount}+ Listings
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Featured Services Block */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">Trending</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-primary-text">Our Most Popular Services</h2>
          </div>
          <Link
            to="/services"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mt-2 md:mt-0"
          >
            <span>Explore All Services</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      {/* 4. "How It Works" Section */}
      <section className="bg-bg-secondary/40 py-16 border-y border-border-primary dark:border-border-primary transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">Workflow</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-primary-text mb-12">How ServiceHub Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-bg-card p-6 rounded-2xl border border-border-primary text-center relative shadow-sm hover:shadow-md transition-all duration-300">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-white shadow-md">1</span>
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 mt-2">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-extrabold text-primary-text">Discover & Select</h3>
              <p className="text-xs text-secondary-text mt-2 leading-relaxed">
                Browse on-demand local services. Filter by customer ratings, transparent rates, and custom details.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-bg-card p-6 rounded-2xl border border-border-primary text-center relative shadow-sm hover:shadow-md transition-all duration-300">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-white shadow-md">2</span>
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 mt-2">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-extrabold text-primary-text">Schedule Instantly</h3>
              <p className="text-xs text-secondary-text mt-2 leading-relaxed">
                Choose your convenient date and time window. Add specific instructions and secure booking.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-bg-card p-6 rounded-2xl border border-border-primary text-center relative shadow-sm hover:shadow-md transition-all duration-300">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-white shadow-md">3</span>
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 mt-2">
                <CheckCircle className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-extrabold text-primary-text">Doorstep Service</h3>
              <p className="text-xs text-secondary-text mt-2 leading-relaxed">
                Vetted specialist arrives right on schedule with all needed equipment. Pay safely once fully satisfied.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. App Download Promo Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-bg-card dark:from-bg-secondary to-bg-secondary dark:to-bg-card border border-primary/15 rounded-3xl p-8 md:p-12 text-primary-text relative overflow-hidden shadow-xl shadow-primary/5">
          <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">ServiceHub App</span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Services at your fingertips, anytime</h2>
              <p className="text-xs text-secondary-text max-w-md leading-relaxed">
                Download the official ServiceHub app for lightning-fast live booking updates, provider chat coordination, special promos, and digital receipt tracking.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 bg-black text-white hover:bg-black/80 px-4 py-2.5 rounded-xl text-left border border-white/10 transition-colors">
                  <Smartphone className="h-5 w-5 shrink-0" />
                  <div>
                    <span className="text-[8px] text-secondary-text block -mb-1">GET IT ON</span>
                    <span className="text-xs font-extrabold block">Google Play</span>
                  </div>
                </button>
                <button className="flex items-center gap-2 bg-black text-white hover:bg-black/80 px-4 py-2.5 rounded-xl text-left border border-white/10 transition-colors">
                  <Smartphone className="h-5 w-5 shrink-0" />
                  <div>
                    <span className="text-[8px] text-secondary-text block -mb-1">Download on the</span>
                    <span className="text-xs font-extrabold block">App Store</span>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="hidden md:flex justify-end relative">
              <div className="rounded-2xl border-4 border-white/15 overflow-hidden w-64 shadow-2xl relative rotate-3">
                <img
                  src="https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&q=80&w=400"
                  alt="App interface mockup"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
