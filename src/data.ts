import { ServiceCategory, Service, User, Booking, Review, Notification, Complaint } from './types';

export const MOCK_CATEGORIES: ServiceCategory[] = [
  {
    id: 'cleaning',
    name: 'Home Cleaning',
    icon: 'Sparkles',
    description: 'Deep cleaning, kitchen cleaning, sofa cleaning, and disinfection.',
    serviceCount: 24,
    bgGradient: 'from-primary/15 to-primary/5 text-primary'
  },
  {
    id: 'repairs',
    name: 'Home Repairs',
    icon: 'Wrench',
    description: 'Expert plumbers, electricians, carpenters, and appliance repair.',
    serviceCount: 42,
    bgGradient: 'from-orange-500/10 to-amber-500/10 text-orange-600 dark:text-orange-400'
  },
  {
    id: 'salon',
    name: 'Salon & Spa',
    icon: 'Smile',
    description: 'Haircuts, facials, massages, and grooming at home.',
    serviceCount: 18,
    bgGradient: 'from-pink-500/10 to-rose-500/10 text-pink-600 dark:text-pink-400'
  },
  {
    id: 'tutoring',
    name: 'Tutoring',
    icon: 'BookOpen',
    description: 'Math, Science, Languages, and Music tutoring at home.',
    serviceCount: 15,
    bgGradient: 'from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400'
  },
  {
    id: 'painting',
    name: 'Painting & Decor',
    icon: 'Paintbrush',
    description: 'Professional wall painters, consultants, and wallpaper experts.',
    serviceCount: 12,
    bgGradient: 'from-green-500/10 to-emerald-500/10 text-green-600 dark:text-green-400'
  },
  {
    id: 'gardening',
    name: 'Lawn & Garden',
    icon: 'Flower',
    description: 'Lawn mowing, landscaping, plant care, and pest control.',
    serviceCount: 15,
    bgGradient: 'from-teal-500/10 to-emerald-500/10 text-teal-600 dark:text-teal-400'
  }
];

