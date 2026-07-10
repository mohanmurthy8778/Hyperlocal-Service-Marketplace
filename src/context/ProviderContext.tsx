import React, { createContext, useContext, useState } from 'react';
import { providerApi } from '../api/providerApi';
import { Service, Booking } from '../types';

interface ProviderContextType {
  profile: any;
  providerServices: Service[];
  providerBookings: Booking[];
  earnings: any;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: any) => Promise<any>;
  fetchServices: () => Promise<void>;
  addService: (service: any, image?: File | null) => Promise<any>;
  updateService: (id: number | string, service: any, image?: File | null) => Promise<any>;
  deleteService: (id: number | string) => Promise<void>;
  fetchBookings: () => Promise<void>;
  acceptBooking: (id: number | string) => Promise<void>;
  rejectBooking: (id: number | string) => Promise<void>;
  startService: (id: number | string) => Promise<void>;
  completeService: (id: number | string) => Promise<void>;
  fetchEarnings: () => Promise<void>;
}

const ProviderContext = createContext<ProviderContextType | undefined>(undefined);

export const ProviderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<any>(null);
  const [providerServices, setProviderServices] = useState<Service[]>([]);
  const [providerBookings, setProviderBookings] = useState<Booking[]>([]);
  const [earnings, setEarnings] = useState<any>(null);

  const fetchProfile = async () => {
    try {
      const res = await providerApi.getProfile();
      setProfile(res.data || res);
    } catch (e) {
      console.error("Failed to fetch provider profile:", e);
    }
  };

  const updateProfile = async (data: any) => {
    const res = await providerApi.updateProfile(data);
    await fetchProfile();
    return res.data || res;
  };

  const fetchServices = async () => {
    try {
      const res = await providerApi.getServices();
      const list = res.data || res || [];
      const mapped: Service[] = list.map((s: any) => ({
        id: String(s.id || ''),
        title: s.title || s.name || '',
        categoryId: String(s.categoryId || ''),
        categoryName: s.categoryName || '',
        providerId: String(s.providerId || ''),
        providerName: s.providerName || '',
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
      setProviderServices(mapped);
    } catch (e) {
      console.error("Failed to fetch provider services:", e);
    }
  };

  const addService = async (service: any, image?: File | null) => {
    const res = await providerApi.addService(service, image);
    await fetchServices();
    return res.data || res;
  };

  const updateService = async (id: number | string, service: any, image?: File | null) => {
    const res = await providerApi.updateService(id, service, image);
    await fetchServices();
    return res.data || res;
  };

  const deleteService = async (id: number | string) => {
    await providerApi.deleteService(id);
    await fetchServices();
  };

  const fetchBookings = async () => {
    try {
      const res = await providerApi.getBookings();
      const list = res.data || res || [];
      const mapped: Booking[] = list.map((b: any) => ({
        id: String(b.id || ''),
        serviceId: String(b.serviceId || ''),
        serviceTitle: b.serviceTitle || '',
        categoryName: b.categoryName || '',
        providerId: String(b.providerId || ''),
        providerName: b.providerName || '',
        providerAvatar: b.providerAvatar || '',
        customerId: String(b.customerId || ''),
        customerName: b.customerName || '',
        customerAvatar: b.customerAvatar || '',
        date: b.bookingDate || b.date || '',
        time: b.bookingTime || b.time || '',
        status: (b.status || 'pending').toLowerCase() as any,
        totalPrice: b.totalPrice || b.amount || 0,
        address: b.address || '',
        paymentStatus: (b.paymentStatus || 'pending').toLowerCase() as any,
        notes: b.notes || '',
        rating: b.rating,
        review: b.reviewComment || b.review,
      }));
      setProviderBookings(mapped);
    } catch (e) {
      console.error("Failed to fetch provider bookings:", e);
    }
  };

  const acceptBooking = async (id: number | string) => {
    await providerApi.acceptBooking(id);
    await fetchBookings();
  };

  const rejectBooking = async (id: number | string) => {
    await providerApi.rejectBooking(id);
    await fetchBookings();
  };

  const startService = async (id: number | string) => {
    await providerApi.startService(id);
    await fetchBookings();
  };

  const completeService = async (id: number | string) => {
    await providerApi.completeService(id);
    await fetchBookings();
  };

  const fetchEarnings = async () => {
    try {
      const res = await providerApi.getEarnings();
      setEarnings(res.data || res);
    } catch (e) {
      console.error("Failed to fetch provider earnings:", e);
    }
  };

  return (
    <ProviderContext.Provider value={{
      profile,
      providerServices,
      providerBookings,
      earnings,
      fetchProfile,
      updateProfile,
      fetchServices,
      addService,
      updateService,
      deleteService,
      fetchBookings,
      acceptBooking,
      rejectBooking,
      startService,
      completeService,
      fetchEarnings,
    }}>
      {children}
    </ProviderContext.Provider>
  );
};

export const useProvider = () => {
  const context = useContext(ProviderContext);
  if (context === undefined) {
    throw new Error('useProvider must be used within a ProviderProvider');
  }
  return context;
};
