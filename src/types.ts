export type UserRole = 'customer' | 'provider' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone: string;
  address: string;
  joinedDate: string;
  bio?: string;
  // For provider roles
  rating?: number;
  completedJobs?: number;
  experience?: string;
  category?: string;
  hourlyRate?: number;
  isVerified?: boolean;
  isOnline?: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string; // name of Lucide icon
  description: string;
  serviceCount: number;
  bgGradient: string;
}

export interface Service {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  providerRating: number;
  description: string;
  price: number;
  duration: string;
  rating: number;
  reviewCount: number;
  location: string;
  images: string[];
  features: string[];
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceTitle: string;
  categoryName: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  date: string;
  time: string;
  status: 'pending' | 'searching' | 'accepted' | 'on_the_way' | 'arrived' | 'started' | 'completed' | 'cancelled' | 'no_provider_found' | 'rejected';
  totalPrice: number;
  address: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  notes?: string;
  rating?: number;
  review?: string;
  rejectionReason?: string;
  acceptedAt?: string;
  providerCurrentLocation?: { latitude: number; longitude: number };
  estimatedArrivalTime?: string;
}

export interface Review {
  id: string;
  serviceId: string;
  serviceTitle: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  comment: string;
  date: string;
  providerId: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'booking' | 'payment' | 'system' | 'review';
}

export interface Complaint {
  id: string;
  bookingId: string;
  customerName: string;
  providerName: string;
  issue: string;
  description: string;
  status: 'pending' | 'resolved';
  date: string;
}
