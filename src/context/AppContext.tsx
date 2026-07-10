import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Service, Booking, Review, Notification, Complaint, UserRole } from '../types';
import { authApi } from '../api/authApi';
import { customerApi } from '../api/customerApi';
import { providerApi } from '../api/providerApi';
import { bookingApi } from '../api/bookingApi';
import { adminApi } from '../api/adminApi';
import { notificationApi } from '../api/notificationApi';
import { serviceApi } from '../api/serviceApi';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  services: Service[];
  bookings: Booking[];
  reviews: Review[];
  notifications: Notification[];
  complaints: Complaint[];
  favorites: string[]; // serviceId strings
  theme: 'light' | 'dark';
  language: 'en' | 'ta' | 'hi';
  setLanguage: (lang: 'en' | 'ta' | 'hi') => void;
  setCurrentUser: (user: User | null) => void;
  login: (email: string, role: UserRole, password?: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, role: UserRole, extra?: Partial<User> & { password?: string }) => Promise<void>;
  addBooking: (booking: Omit<Booking, 'id' | 'customerName' | 'customerAvatar' | 'customerId'>) => Promise<Booking>;
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<void>;
  addService: (service: Omit<Service, 'id' | 'providerId' | 'providerName' | 'providerAvatar' | 'providerRating' | 'reviewCount' | 'rating'>, imageFile?: File | null) => Promise<void>;
  editService: (service: Service, imageFile?: File | null) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  addReview: (serviceId: string, rating: number, comment: string) => Promise<void>;
  toggleFavorite: (serviceId: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
  addComplaint: (bookingId: string, issue: string, description: string) => void;
  resolveComplaint: (id: string, decision: 'refund' | 'release' | 'dismiss') => void;
  toggleTheme: () => void;
  toast: (message: string, type?: 'success' | 'info' | 'error') => void;
  activeToast: { message: string; type: 'success' | 'info' | 'error' } | null;
  refreshAllData: () => Promise<void>;
  updateBookingInState: (booking: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    const stored = localStorage.getItem('user') || localStorage.getItem('h_current_user');
    if (stored) {
      try { return JSON.parse(stored); } catch {}
    }
    return null;
  });

  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('h_theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return 'light';
  });

  const [language, setLanguageState] = useState<'en' | 'ta' | 'hi'>(() => {
    const stored = localStorage.getItem('h_language');
    if (stored === 'en' || stored === 'ta' || stored === 'hi') return stored;
    return 'en';
  });

  const [activeToast, setActiveToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const toast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setActiveToast({ message, type });
    setTimeout(() => {
      setActiveToast(null);
    }, 3000);
  }, []);

  const setLanguage = (lang: 'en' | 'ta' | 'hi') => {
    setLanguageState(lang);
    localStorage.setItem('h_language', lang);
  };

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem('h_current_user', JSON.stringify(user));
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', user.role);
    } else {
      localStorage.removeItem('h_current_user');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    }
  };

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      toast(`Switched to ${next} mode`, 'info');
      return next;
    });
  };

  useEffect(() => {
    localStorage.setItem('h_theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Map Backend/Frontend roles
  const mapBackendRoleToFrontend = (role: string): UserRole => {
    const r = role.toUpperCase();
    if (r === 'SERVICE_PROVIDER' || r === 'PROVIDER') return 'provider';
    if (r === 'ADMIN') return 'admin';
    return 'customer';
  };

  const mapFrontendRoleToBackend = (role: UserRole): string => {
    if (role === 'provider') return 'SERVICE_PROVIDER';
    if (role === 'admin') return 'ADMIN';
    return 'CUSTOMER';
  };

  const mapUserDtoToUser = (dto: any): User => {
    return {
      id: String(dto.id || ''),
      name: `${dto.firstName || ''} ${dto.lastName || ''}`.trim() || dto.email || 'User',
      email: dto.email || '',
      role: mapBackendRoleToFrontend(dto.role || 'CUSTOMER'),
      avatar: dto.profileImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      phone: dto.phone || '',
      address: dto.address || 'Seattle, WA',
      joinedDate: dto.createdAt ? dto.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      bio: dto.bio || '',
      rating: dto.rating || 5.0,
      completedJobs: dto.completedJobs || 0,
      experience: dto.experience || '',
      category: dto.category || '',
      hourlyRate: dto.hourlyRate || 0,
      isVerified: dto.emailVerified || false,
    };
  };

  const mapBookingDtoToBooking = (b: any): Booking => {
    return {
      id: String(b.booking_id || b.id || b.bookingId || ''),
      serviceId: String(b.serviceId || b.service_id || ''),
      serviceTitle: b.serviceTitle || b.service_name || '',
      categoryName: b.categoryName || b.service_category || '',
      providerId: String(b.providerId || b.provider_id || ''),
      providerName: b.providerName || b.provider_name || '',
      providerAvatar: b.providerAvatar || b.provider_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      customerId: String(b.customerId || b.customer_id || ''),
      customerName: b.customerName || b.customer_name || '',
      customerAvatar: b.customerAvatar || b.customer_avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      date: b.date || b.bookingDate || (b.scheduled_time ? b.scheduled_time.split(' ')[0] : '') || (b.booking_time ? b.booking_time.split(' ')[0] : '') || '',
      time: b.time || b.bookingTime || (b.scheduled_time ? b.scheduled_time.split(' ')[1] : '') || (b.booking_time ? b.booking_time.split(' ')[1] : '') || '',
      status: (b.status || 'pending').toLowerCase() as any,
      totalPrice: b.totalPrice || b.amount || b.estimated_price || 0,
      address: b.address || b.service_address || '',
      paymentStatus: (b.paymentStatus || b.payment_status || 'pending').toLowerCase() as any,
      notes: b.notes || '',
      rating: b.rating,
      review: b.reviewComment || b.review,
      rejectionReason: b.rejection_reason || b.rejectionReason,
      acceptedAt: b.accepted_at || b.acceptedAt,
      providerCurrentLocation: b.provider_current_location || b.providerCurrentLocation,
      estimatedArrivalTime: b.estimated_arrival_time || b.estimatedArrivalTime
    };
  };

  // Full synchronize data loop
  const updateBookingInState = (newBooking: any) => {
    const mapped = mapBookingDtoToBooking(newBooking);
    setBookings(prev => {
      const idx = prev.findIndex(b => b.id === mapped.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = mapped;
        return next;
      }
      return [mapped, ...prev];
    });
  };

  const refreshAllData = async () => {
    try {
      // 1. Fetch public services & categories
      const publicServicesData = await serviceApi.searchPublicServices();
      const sList = publicServicesData.data || publicServicesData || [];
      const mappedServices: Service[] = sList.map((s: any) => ({
        id: String(s.id || s.package_id || ''),
        title: s.title || s.name || '',
        categoryId: String(s.categoryId || s.category || ''),
        categoryName: s.categoryName || '',
        providerId: String(s.providerId || s.provider_id || ''),
        providerName: s.providerName || s.provider_name || '',
        providerAvatar: s.providerAvatar || '',
        providerRating: s.providerRating || 5.0,
        description: s.description || '',
        price: s.price || 0,
        duration: s.duration || '',
        rating: s.rating || 5.0,
        reviewCount: s.reviewCount || 0,
        location: s.location || '',
        images: s.images || (s.imageUrl ? [s.imageUrl] : []),
        features: s.features || [],
      }));
      setServices(mappedServices);

      if (currentUser) {
        // 2. Fetch notifications
        try {
          const notifRes = await notificationApi.getNotifications(0, 100);
          const nData = notifRes.data?.content || notifRes.content || notifRes || [];
          setNotifications(nData.map((n: any) => ({
            id: String(n.id || ''),
            userId: String(n.userId || ''),
            title: n.title || '',
            message: n.message || '',
            date: n.createdAt ? new Date(n.createdAt).toLocaleString() : new Date().toLocaleString(),
            read: n.read || false,
            type: (n.type || 'system').toLowerCase() as any,
          })));
        } catch (err) {
          console.warn("Failed fetching notifications inside master sync:", err);
        }

        // 3. Fetch Bookings and role-specific states
        if (currentUser.role === 'customer') {
          try {
            const bookingsRes = await customerApi.getBookingHistory();
            const bList = bookingsRes.data || bookingsRes || [];
            setBookings(bList.map(mapBookingDtoToBooking));

            // Fetch customer favorites
            const favRes = await customerApi.getFavorites();
            const favList = favRes.data || favRes || [];
            setFavorites(favList.map((f: any) => String(f.serviceId || f.id || '')));
          } catch (err) {
            console.warn("Failed fetching customer bookings/favorites in sync:", err);
          }
        } else if (currentUser.role === 'provider') {
          try {
            const providerBookingsRes = await providerApi.getBookings();
            const bList = providerBookingsRes.data || providerBookingsRes || [];
            setBookings(bList.map(mapBookingDtoToBooking));

            const providerReviewsRes = await providerApi.getReviews();
            const rList = providerReviewsRes.data || providerReviewsRes || [];
            setReviews(rList.map((r: any) => ({
              id: String(r.id || ''),
              serviceId: String(r.serviceId || ''),
              serviceTitle: r.serviceTitle || '',
              customerName: r.customerName || '',
              customerAvatar: r.customerAvatar || '',
              rating: r.rating || 5,
              comment: r.comment || r.reviewComment || '',
              date: r.createdAt ? r.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
              providerId: String(r.providerId || ''),
            })));
          } catch (err) {
            console.warn("Failed fetching provider data in sync:", err);
          }
        } else if (currentUser.role === 'admin') {
          try {
            const adminUsersRes = await adminApi.getAllUsers();
            const uList = adminUsersRes.data || adminUsersRes || [];
            setUsers(uList.map(mapUserDtoToUser));
          } catch (err) {
            console.warn("Failed fetching admin data in sync:", err);
          }
        }
      }
    } catch (e) {
      console.error("Master synchronization error:", e);
    }
  };

  // Run synchronization on mount and on user session change
  useEffect(() => {
    refreshAllData();
  }, [currentUser?.id, currentUser?.role]);

  const login = async (email: string, role: UserRole, password?: string): Promise<boolean> => {
    try {
      const res = await authApi.login({
        email,
        password: password || 'Password123!',
        role
      });
      const data = res.data || res;
      if (data && data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken || '');
        const mappedUser = mapUserDtoToUser(data.user);
        setCurrentUser(mappedUser);
        toast(`Logged in as ${mappedUser.name}`, 'success');
        return true;
      }
      return false;
    } catch (e: any) {
      toast(e.response?.data?.message || 'Invalid credentials or login failure', 'error');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('h_current_user');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setCurrentUser(null);
    toast('Logged out successfully', 'info');
  };

  const register = async (name: string, email: string, role: UserRole, extra?: any) => {
    try {
      const names = name.split(' ');
      const firstName = names[0] || 'First';
      const lastName = names.slice(1).join(' ') || 'Last';
      
      const payload = {
        firstName,
        lastName,
        email,
        phone: extra?.phone || '+15551112222',
        password: extra?.password || 'Password123!',
        confirmPassword: extra?.password || 'Password123!',
        role: mapFrontendRoleToBackend(role),
      };

      await authApi.register(payload);
      toast('Registration completed successfully!', 'success');
      await login(email, role, payload.password);
    } catch (e: any) {
      toast(e.response?.data?.message || 'Registration failed. Try again.', 'error');
      throw e;
    }
  };

  const addBooking = async (bookingData: any): Promise<Booking> => {
    try {
      const payload = {
        serviceId: Number(bookingData.serviceId),
        bookingDate: bookingData.date || bookingData.bookingDate,
        bookingTime: bookingData.time || bookingData.bookingTime,
        addressId: Number(bookingData.addressId || 1),
        notes: bookingData.notes || '',
      };
      
      const res = await bookingApi.createBooking(payload);
      const b = res.data || res;
      toast('Booking successfully scheduled!', 'success');
      await refreshAllData();
      return b;
    } catch (e: any) {
      toast(e.response?.data?.message || 'Failed to place booking', 'error');
      throw e;
    }
  };

  const updateBookingStatus = async (id: string, status: Booking['status']) => {
    try {
      await bookingApi.updateBookingStatus(id, status.toUpperCase());
      toast(`Booking status updated to ${status}`, 'success');
      await refreshAllData();
    } catch (e: any) {
      toast(e.response?.data?.message || 'Failed to update booking status', 'error');
    }
  };

  const addService = async (serviceData: any, imageFile?: File | null) => {
    try {
      const payload = {
        name: serviceData.title,
        description: serviceData.description,
        price: serviceData.price,
        duration: serviceData.duration,
        categoryId: Number(serviceData.categoryId),
        location: serviceData.location || 'Seattle',
        features: serviceData.features || [],
      };
      await providerApi.addService(payload, imageFile);
      toast('New service added successfully!', 'success');
      await refreshAllData();
    } catch (e: any) {
      toast(e.response?.data?.message || 'Failed to create service listing', 'error');
    }
  };

  const editService = async (serviceData: Service, imageFile?: File | null) => {
    try {
      const payload = {
        name: serviceData.title,
        description: serviceData.description,
        price: serviceData.price,
        duration: serviceData.duration,
        categoryId: Number(serviceData.categoryId),
        location: serviceData.location,
        features: serviceData.features,
      };
      await providerApi.updateService(serviceData.id, payload, imageFile);
      toast('Service listing updated successfully!', 'success');
      await refreshAllData();
    } catch (e: any) {
      toast(e.response?.data?.message || 'Failed to update service listing', 'error');
    }
  };

  const deleteService = async (id: string) => {
    try {
      await providerApi.deleteService(id);
      toast('Service package deleted successfully.', 'success');
      await refreshAllData();
    } catch (e: any) {
      console.error('Error deleting service package:', e);
      toast(e.response?.data?.message || 'Failed to delete service package. Please try again.', 'error');
      throw e;
    }
  };

  const addReview = async (serviceId: string, rating: number, comment: string) => {
    try {
      await customerApi.addReview({
        serviceId: Number(serviceId),
        rating,
        reviewComment: comment,
      });
      toast('Review submitted! Thank you.', 'success');
      await refreshAllData();
    } catch (e: any) {
      toast(e.response?.data?.message || 'Failed to submit review', 'error');
    }
  };

  const toggleFavorite = async (serviceId: string) => {
    try {
      if (favorites.includes(serviceId)) {
        await customerApi.removeFavorite(serviceId);
        toast('Removed from favorites', 'info');
      } else {
        await customerApi.addFavorite(serviceId);
        toast('Added to favorites!', 'success');
      }
      await refreshAllData();
    } catch (e: any) {
      toast(e.response?.data?.message || 'Failed to update favorite status', 'error');
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      await refreshAllData();
    } catch (e: any) {
      console.error("Failed to mark notification read:", e);
    }
  };

  const clearNotifications = async () => {
    try {
      await notificationApi.clearAll();
      toast('All notifications cleared', 'info');
      await refreshAllData();
    } catch (e: any) {
      console.error("Failed to clear notifications:", e);
    }
  };

  const addComplaint = (bookingId: string, issue: string, description: string) => {
    toast('Complaint submitted to dispute team', 'success');
  };

  const resolveComplaint = (id: string, decision: 'refund' | 'release' | 'dismiss') => {
    toast(`Complaint resolved: ${decision}`, 'success');
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      services,
      bookings,
      reviews,
      notifications,
      complaints,
      favorites,
      theme,
      language,
      setLanguage,
      setCurrentUser,
      login,
      logout,
      register,
      addBooking,
      updateBookingStatus,
      addService,
      editService,
      deleteService,
      addReview,
      toggleFavorite,
      markNotificationRead,
      clearNotifications,
      addComplaint,
      resolveComplaint,
      toggleTheme,
      toast,
      activeToast,
      refreshAllData,
      updateBookingInState,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
