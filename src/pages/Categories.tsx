import React from 'react';
import { Link } from 'react-router-dom';
import { MOCK_CATEGORIES } from '../data';
import { ArrowRight, Sparkles, Wrench, Smile, BookOpen, Paintbrush, Leaf } from 'lucide-react';
import { motion } from 'motion/react';

const ICON_MAP: Record<string, React.FC<any>> = {
  Sparkles, Wrench, Smile, BookOpen, Paintbrush, Leaf
};

export const Categories: React.FC = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12 transition-colors duration-200" id="categories-page">
      <div className="text-center space-y-3">
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Classified Listings</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-text">Explore Categories</h1>
        <p className="text-sm text-secondary-text max-w-md mx-auto leading-relaxed">
          Browse through our curated list of professional services, custom-designed to match your specific home and personal care needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Sparkles;
          return (
            <motion.div
              whileHover={{ y: -4 }}
              key={cat.id}
              className="rounded-2xl border border-border-primary bg-bg-card p-6 shadow-sm hover:shadow-md transition-all dark:border-border-primary dark:bg-bg-card flex flex-col justify-between"
              id={`category-item-${cat.id}`}
            >
              <div className="space-y-4">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${cat.bgGradient} flex items-center justify-center text-current`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-primary-text">{cat.name}</h3>
                  <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{cat.serviceCount} Live services</span>
                </div>
                <p className="text-xs text-secondary-text leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <Link
                to={`/services?category=${cat.id}`}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark"
              >
                <span>Browse {cat.name}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
