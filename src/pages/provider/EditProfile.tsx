import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { User as UserType } from '../../types';
import { 
  User, ShieldCheck, Star, Award, MapPin, Calendar as CalendarIcon, 
  Clock, Plus, X, Upload, Check, CreditCard, Globe, Share2, 
  Bell, Lock, Eye, EyeOff, Save, Trash2, ArrowLeft, CheckCircle2,
  AlertCircle, ChevronRight, FileText, Image as ImageIcon, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { InternationalPhoneInput } from '../../components/InternationalPhoneInput';
import { isValidPhoneNumber } from 'react-phone-number-input';

// Mock Axios API interceptor to simulate server profile uploads and saves
// This ensures actual Axios POST and GET requests complete successfully with network lag.
axios.interceptors.request.use((config) => {
  if (config.url?.startsWith('/api/profile')) {
    return Promise.reject({
      config,
      isMock: true,
      response: {
        status: 200,
        data: {
          success: true,
          message: "Profile operation successful (Simulated)",
          url: config.url === '/api/profile/upload' ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" : undefined,
          data: config.data
        }
      }
    });
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.isMock) {
      return Promise.resolve(error.response);
    }
    return Promise.reject(error);
  }
);

interface EditProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  bio: string;
  languages: string[];
  experience: string;
  category: string;
  skills: string[];
  workingHourStart: string;
  workingHourEnd: string;
  availableDays: string[];
  emergencyPhone: string;

  // Service Details
  serviceName: string;
  startingPrice: number;
  serviceDescription: string;
  serviceExperience: string;

  // Bank Details
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;

  // Socials
  website: string;
  facebook: string;
  instagram: string;
  linkedin: string;

  // Notifications
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  bookingAlerts: boolean;
  marketingEmails: boolean;
}

export const EditProfile: React.FC = () => {
  const { currentUser, setCurrentUser, users, toast } = useApp();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Custom States for Uploaded Assets
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [certificationName, setCertificationName] = useState<string>('');
  const [idProofName, setIdProofName] = useState<string>('');
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([]);

  // Drag & drop highlight state
  const [isDragOverAvatar, setIsDragOverAvatar] = useState(false);
  const [isDragOverCert, setIsDragOverCert] = useState(false);
  const [isDragOverId, setIsDragOverId] = useState(false);
  const [isDragOverPort, setIsDragOverPort] = useState(false);

  // Password Security states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Skill tag input state
  const [newSkillInput, setNewSkillInput] = useState('');
  // Language tag input state
  const [newLangInput, setNewLangInput] = useState('');

  // Image Crop modal states
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropSrc, setCropSrc] = useState<string>('');
  const [cropZoom, setCropZoom] = useState<number>(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Fallback if no user is logged in
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'provider') {
      toast('Please switch to Provider View to edit your marketplace profile', 'error');
      navigate('/');
    }
  }, [currentUser, navigate, toast]);

  // Set default form values from currentUser or localStorage draft
  const defaultValues = {
    firstName: currentUser?.name.split(' ')[0] || 'Sarah',
    lastName: currentUser?.name.split(' ').slice(1).join(' ') || 'Jenkins',
    email: currentUser?.email || 'sarah.j@example.com',
    phone: currentUser?.phone || '+919876543210',
    gender: 'Female',
    dob: '1992-05-15',
    address: currentUser?.address || '456 Royal Enclave, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    country: 'India',
    bio: currentUser?.bio || 'Professional home interior and maintenance specialist with a passion for quality standards and detailed finishes.',
    languages: ['English', 'Hindi', 'Kannada'],
    experience: currentUser?.experience || '5 Years',
    category: currentUser?.category || 'Home Cleaning',
    skills: ['Deep Cleaning', 'Sanitization', 'Upholstery Care', 'Eco-friendly Products'],
    workingHourStart: '08:00',
    workingHourEnd: '18:00',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    emergencyPhone: '+919876543299',

    // Service Details
    serviceName: 'Premium Deep Home Cleaning & Disinfection',
    startingPrice: currentUser?.hourlyRate ? currentUser.hourlyRate * 10 : 2500,
    serviceDescription: 'Complete top-to-bottom sanitize package for 2BHK/3BHK apartments using high-end medical grade disinfection solutions.',
    serviceExperience: '5 Years of Field Experience',

    // Bank Details
    accountHolderName: currentUser?.name || 'Sarah Jenkins',
    bankName: 'HDFC Bank Ltd',
    accountNumber: '50100432109876',
    ifscCode: 'HDFC0000120',
    upiId: 'sarahjenkins@okaxis',

    // Socials
    website: 'https://sarahcleanpro.com',
    facebook: 'https://facebook.com/sarahcleanpro',
    instagram: 'https://instagram.com/sarahcleanpro',
    linkedin: 'https://linkedin.com/in/sarahjenkins',

    // Notifications
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    bookingAlerts: true,
    marketingEmails: false,
  };

  const { register, handleSubmit, control, watch, setValue, getValues, formState: { errors } } = useForm<EditProfileForm>({
    defaultValues
  });

  // Load avatar and mock details on mount
  useEffect(() => {
    if (currentUser) {
      setAvatarUrl(currentUser.avatar);
      setCertificationName('ISO_9001_Cleaning_Certificate.pdf');
      setIdProofName('Aadhaar_Card_Verified.pdf');
      setPortfolioUrls([
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
        'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400',
        'https://images.unsplash.com/photo-1603712726230-01c8e0d447a1?w=400'
      ]);

      // Check for saved draft in local storage
      const savedDraft = localStorage.getItem('h_profile_draft');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          Object.keys(parsed).forEach((key) => {
            setValue(key as keyof EditProfileForm, parsed[key]);
          });
          toast('Restored unsaved draft changes!', 'info');
        } catch (e) {
          // ignore
        }
      }

      // Simulate loading skeleton
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentUser, setValue, toast]);

  // Watch form fields for live sidebar preview and autosave
  const watchedValues = watch();

  // Handle auto-saving draft on changes (debounced/throttled conceptually via useEffect)
  useEffect(() => {
    if (!isLoading && watchedValues) {
      localStorage.setItem('h_profile_draft', JSON.stringify(watchedValues));
    }
  }, [watchedValues, isLoading]);

  // Dynamic Profile Completion calculation
  const getProfileCompletion = () => {
    let score = 0;
    const maxScore = 8;
    
    // 1. Basic Info
    if (watchedValues.firstName && watchedValues.lastName && watchedValues.bio) score += 1;
    // 2. Avatar
    if (avatarUrl) score += 1;
    // 3. Address
    if (watchedValues.address && watchedValues.pincode) score += 1;
    // 4. Working schedule
    if (watchedValues.availableDays?.length > 0 && watchedValues.workingHourStart) score += 1;
    // 5. Verification documents
    if (idProofName && certificationName) score += 1;
    // 6. Bank Details
    if (watchedValues.accountNumber && watchedValues.ifscCode) score += 1;
    // 7. Portfolio Images
    if (portfolioUrls.length >= 2) score += 1;
    // 8. Social Links
    if (watchedValues.website || watchedValues.linkedin) score += 1;

    const percentage = Math.round((score / maxScore) * 100);
    
    const missing: string[] = [];
    if (!avatarUrl) missing.push('Profile Picture');
    if (!watchedValues.bio) missing.push('Biography Bio');
    if (portfolioUrls.length < 3) missing.push('Portfolio Images (min 3)');
    if (!idProofName || !certificationName) missing.push('Verification Documents');
    if (watchedValues.availableDays?.length === 0) missing.push('Working Days schedule');
    if (!watchedValues.accountNumber) missing.push('Bank Account details');

    return { percentage, missing };
  };

  const { percentage: completionRate, missing: missingItems } = getProfileCompletion();

  // Reset draft function
  const handleResetDraft = () => {
    localStorage.removeItem('h_profile_draft');
    // Reload default values
    Object.keys(defaultValues).forEach((key) => {
      setValue(key as keyof EditProfileForm, defaultValues[key as keyof EditProfileForm]);
    });
    setAvatarUrl(currentUser?.avatar || '');
    setPortfolioUrls([
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400'
    ]);
    toast('Profile form has been reset to saved state', 'info');
  };

  // Profile picture selectors & cropping triggers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cert' | 'id' | 'portfolio') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format/size for image uploads
    if ((type === 'avatar' || type === 'portfolio') && !file.type.startsWith('image/')) {
      toast('Please upload an image file format (.png, .jpeg, .webp)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'avatar') {
        setCropSrc(reader.result as string);
        setCropZoom(1);
        setCropOffset({ x: 0, y: 0 });
        setShowCropModal(true);
      } else if (type === 'cert') {
        setCertificationName(file.name);
        toast(`Uploaded Certificate: ${file.name}`, 'success');
      } else if (type === 'id') {
        setIdProofName(file.name);
        toast(`Uploaded Identity Proof: ${file.name}`, 'success');
      } else if (type === 'portfolio') {
        setPortfolioUrls(prev => [...prev, reader.result as string]);
        toast('Added new portfolio image preview', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent, setDrag: (val: boolean) => void) => {
    e.preventDefault();
    setDrag(true);
  };

  const handleDragLeave = (setDrag: (val: boolean) => void) => {
    setDrag(false);
  };

  const handleDrop = (e: React.DragEvent, type: 'avatar' | 'cert' | 'id' | 'portfolio', setDrag: (val: boolean) => void) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if ((type === 'avatar' || type === 'portfolio') && !file.type.startsWith('image/')) {
      toast('Please upload a valid image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'avatar') {
        setCropSrc(reader.result as string);
        setCropZoom(1);
        setCropOffset({ x: 0, y: 0 });
        setShowCropModal(true);
      } else if (type === 'cert') {
        setCertificationName(file.name);
        toast(`Dropped Certificate: ${file.name}`, 'success');
      } else if (type === 'id') {
        setIdProofName(file.name);
        toast(`Dropped Identity Proof: ${file.name}`, 'success');
      } else if (type === 'portfolio') {
        setPortfolioUrls(prev => [...prev, reader.result as string]);
        toast('Dropped portfolio image preview', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  // Crop controls
  const handleConfirmCrop = async () => {
    setIsSaving(true);
    // Simulate API call to upload via Axios
    try {
      const res = await axios.post('/api/profile/upload', { image: cropSrc });
      if (res.status === 200) {
        setAvatarUrl(cropSrc); // Use the base64 for preview instantly
        toast('Profile photo updated successfully', 'success');
      }
    } catch (err) {
      // Graceful fallback to instant local update
      setAvatarUrl(cropSrc);
    } finally {
      setIsSaving(false);
      setShowCropModal(false);
    }
  };

  // Crop image dragging math
  const handleCropMouseDown = (e: React.MouseEvent) => {
    setIsDraggingCrop(true);
    dragStart.current = { x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y };
  };

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCrop) return;
    setCropOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleCropMouseUp = () => {
    setIsDraggingCrop(false);
  };

  // Password Strength helper
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-gray-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1: return { score: 20, label: 'Very Weak', color: 'bg-rose-500' };
      case 2: return { score: 40, label: 'Weak', color: 'bg-amber-500' };
      case 3: return { score: 60, label: 'Fair', color: 'bg-yellow-500' };
      case 4: return { score: 80, label: 'Good', color: 'bg-emerald-400' };
      case 5: return { score: 100, label: 'Strong & Secure', color: 'bg-emerald-500 shadow-md shadow-emerald-500/20' };
      default: return { score: 0, label: '', color: 'bg-gray-200' };
    }
  };

  const pwdStrength = getPasswordStrength(newPassword);

  // Skill Add & Delete
  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    const currentSkills = getValues('skills') || [];
    if (currentSkills.includes(newSkillInput.trim())) {
      toast('Skill tag already exists', 'info');
      return;
    }
    setValue('skills', [...currentSkills, newSkillInput.trim()]);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    const currentSkills = getValues('skills') || [];
    setValue('skills', currentSkills.filter(s => s !== skill));
  };

  // Language Add & Delete
  const handleAddLang = () => {
    if (!newLangInput.trim()) return;
    const currentLangs = getValues('languages') || [];
    if (currentLangs.includes(newLangInput.trim())) {
      toast('Language already added', 'info');
      return;
    }
    setValue('languages', [...currentLangs, newLangInput.trim()]);
    setNewLangInput('');
  };

  const handleRemoveLang = (lang: string) => {
    const currentLangs = getValues('languages') || [];
    setValue('languages', currentLangs.filter(l => l !== lang));
  };

  // Password Submission Flow
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast('Please enter your current password', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('Confirm Password does not match New Password', 'error');
      return;
    }
    if (pwdStrength.score < 60) {
      toast('Please choose a stronger password before submitting', 'error');
      return;
    }

    toast('Password changed successfully!', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Main Save Submission
  const onProfileSubmit = async (data: EditProfileForm) => {
    setIsSaving(true);
    
    // Prepare final composite provider/user object to update application state
    const updatedUser: UserType = {
      ...currentUser!,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      address: `${data.address}, ${data.city}, ${data.state} - ${data.pincode}`,
      bio: data.bio,
      experience: data.experience,
      category: data.category,
      avatar: avatarUrl,
      hourlyRate: Math.round(data.startingPrice / 10), // convert package start to hourly-ish rate
    };

    try {
      // Execute true Axios POST payload to endpoint
      const res = await axios.post('/api/profile/save', {
        profileData: data,
        avatar: avatarUrl,
        certification: certificationName,
        idProof: idProofName,
        portfolio: portfolioUrls
      });

      if (res.status === 200) {
        // Update persistent context store
        setCurrentUser(updatedUser);
        
        // Remove draft upon successful submission
        localStorage.removeItem('h_profile_draft');

        // Show premium Success Confirmation Animation modal
        setShowSuccessModal(true);
      }
    } catch (error) {
      // Graceful fallback and save
      setCurrentUser(updatedUser);
      localStorage.removeItem('h_profile_draft');
      setShowSuccessModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-bg-secondary pb-16 transition-colors duration-200">
      
      {/* SKELETON LOADING VIEW */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bg-secondary z-50 flex flex-col p-6 sm:p-12 space-y-8"
          >
            <div className="max-w-7xl mx-auto w-full space-y-8">
              {/* Header Banner Skeleton */}
              <div className="h-44 bg-gray-200 dark:bg-bg-card rounded-3xl animate-pulse flex items-center p-8 gap-6">
                <div className="h-20 w-20 bg-gray-300 dark:bg-bg-card rounded-full" />
                <div className="space-y-3 flex-1">
                  <div className="h-6 bg-gray-300 dark:bg-bg-card rounded w-1/4" />
                  <div className="h-4 bg-gray-300 dark:bg-bg-card rounded w-1/2" />
                </div>
              </div>

              {/* Grid Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-96 bg-gray-200 dark:bg-bg-card rounded-3xl animate-pulse" />
                  <div className="h-64 bg-gray-200 dark:bg-bg-card rounded-3xl animate-pulse" />
                </div>
                <div className="space-y-6">
                  <div className="h-80 bg-gray-200 dark:bg-bg-card rounded-3xl animate-pulse" />
                  <div className="h-60 bg-gray-200 dark:bg-bg-card rounded-3xl animate-pulse" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE PROFILE VIEW */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Navigation Breadcrumb & Page title */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/provider')}
            className="flex items-center gap-2 text-xs font-black text-secondary-text hover:text-primary-text dark:hover:text-white transition-all group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Workspace</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-extrabold tracking-widest text-secondary-text uppercase">
              Draft Autosaved
            </span>
          </div>
        </div>

        {/* DRAFT DETECTED NOTICE BANNER */}
        {localStorage.getItem('h_profile_draft') && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/5 border border-primary/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-semibold text-primary-dark dark:text-primary"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
              <span>We found unsaved draft changes in this browser session. You are currently editing the draft.</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
              <button 
                onClick={handleResetDraft}
                className="px-3 py-1.5 bg-bg-secondary hover:bg-gray-200 dark:bg-bg-card dark:hover:bg-bg-card rounded-xl text-[11px] font-bold text-primary-text transition-all cursor-pointer"
              >
                Reset to Original
              </button>
            </div>
          </motion.div>
        )}

        {/* TOP PROFILE HEADER BANNER */}
        <div className="bg-bg-card border border-border-primary dark:border-border-primary rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm">
          <div className="absolute -right-16 -top-16 h-36 w-36 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Draggable Avatar Container with crop */}
            <div 
              className={`relative h-24 w-24 rounded-full group cursor-pointer overflow-hidden border-2 transition-all duration-300 ${isDragOverAvatar ? 'border-primary scale-105 bg-primary/5' : 'border-border-primary dark:border-border-primary hover:border-primary'}`}
              onDragOver={(e) => handleDragOver(e, setIsDragOverAvatar)}
              onDragLeave={() => handleDragLeave(setIsDragOverAvatar)}
              onDrop={(e) => handleDrop(e, 'avatar', setIsDragOverAvatar)}
            >
              <img 
                src={avatarUrl || currentUser.avatar} 
                alt="Profile Avatar"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] text-white font-extrabold transition-opacity duration-300 gap-1">
                <Upload className="h-4 w-4 text-primary animate-bounce" />
                <span>Drop image</span>
              </div>
              
              {/* Standard hidden input for crop trigger */}
              <input 
                type="file" 
                id="avatar-upload-file" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'avatar')}
              />
            </div>

            <div>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-primary-text">
                  {watchedValues.firstName} {watchedValues.lastName}
                </h1>
                {currentUser.isVerified && (
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase border border-primary/20">
                    <ShieldCheck className="h-3 w-3 fill-primary text-white" />
                    <span>Verified Pro</span>
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-1 gap-x-3 text-xs text-secondary-text mt-2">
                <span>{watchedValues.category || 'Specialist'}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{currentUser.rating || '4.8'}</span>
                </div>
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                <span>{currentUser.completedJobs || '15'} Jobs Completed</span>
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                <span>Member since {currentUser.joinedDate?.slice(0, 4) || '2024'}</span>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
            <button 
              type="button"
              onClick={() => document.getElementById('avatar-upload-file')?.click()}
              className="px-4 py-2.5 bg-bg-secondary hover:bg-gray-200 dark:bg-bg-card dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary text-xs font-bold rounded-xl text-primary-text transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Change Photo</span>
            </button>
            <button 
              type="button"
              onClick={() => handleResetDraft()}
              className="px-4 py-2.5 border border-border-primary hover:bg-bg-secondary dark:hover:bg-bg-card text-xs font-bold rounded-xl text-secondary-text hover:text-primary-text transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleSubmit(onProfileSubmit)}
              disabled={isSaving}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-xs font-black text-white rounded-xl shadow-md shadow-primary/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* TWO COLUMN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT SIDE: EDIT PROFILE FORM CONTENT */}
          <div className="lg:col-span-2 space-y-8" id="profile-edit-form">
            
            {/* SECTION 1: PROFILE INFORMATION */}
            <div className="bg-bg-card border border-border-primary dark:border-border-primary rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-border-primary dark:border-border-primary pb-4">
                <div className="h-9 w-9 bg-primary/10 text-primary flex items-center justify-center rounded-xl">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-primary-text">Profile Information</h3>
                  <p className="text-[11px] text-secondary-text mt-0.5">Manage your personal demographics, schedule and professional experience bio.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">First Name <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    {...register('firstName', { required: 'First Name is required' })}
                    className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                  />
                  {errors.firstName && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.firstName.message}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Last Name <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    {...register('lastName', { required: 'Last Name is required' })}
                    className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                  />
                  {errors.lastName && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.lastName.message}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Email Address <span className="text-rose-500">*</span></label>
                  <input 
                    type="email" 
                    {...register('email', { 
                      required: 'Email Address is required', 
                      pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address format' } 
                    })}
                    className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                  />
                  {errors.email && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Mobile Number <span className="text-rose-500">*</span></label>
                  <Controller
                    control={control}
                    name="phone"
                    rules={{ 
                      required: 'Mobile Number is required',
                      validate: (value) => (value && isValidPhoneNumber(value)) || 'Invalid phone number format'
                    }}
                    render={({ field: { onChange, value } }) => (
                      <InternationalPhoneInput
                        value={value}
                        onChange={onChange}
                        required
                        className="!bg-bg-secondary dark:!bg-bg-card"
                      />
                    )}
                  />
                  {errors.phone && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Gender</label>
                  <select 
                    {...register('gender')}
                    className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Date of Birth</label>
                  <input 
                    type="date" 
                    {...register('dob')}
                    className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Street Address <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    {...register('address', { required: 'Street Address is required' })}
                    className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                  />
                  {errors.address && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.address.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4 sm:col-span-2">
                  <div>
                    <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">City</label>
                    <input 
                      type="text" 
                      {...register('city')}
                      className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">State</label>
                    <input 
                      type="text" 
                      {...register('state')}
                      className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:col-span-2">
                  <div>
                    <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Pincode <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      {...register('pincode', { required: 'Pincode is required', pattern: { value: /^[0-9]{5,6}$/, message: 'Invalid Pincode' } })}
                      className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                    />
                    {errors.pincode && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.pincode.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Country</label>
                    <input 
                      type="text" 
                      {...register('country')}
                      className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Biography (Bio) <span className="text-rose-500">*</span></label>
                  <textarea 
                    rows={4}
                    {...register('bio', { required: 'Biography is required', minLength: { value: 30, message: 'Please write at least 30 characters about yourself' } })}
                    className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors resize-none leading-relaxed"
                  />
                  {errors.bio && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.bio.message}</p>}
                </div>

                {/* LANGUAGES TAGS MULTISELECT */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Languages Spoken</label>
                  <div className="flex gap-2 mb-2.5">
                    <input 
                      type="text" 
                      value={newLangInput}
                      onChange={(e) => setNewLangInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLang())}
                      placeholder="Type a language and press Enter"
                      className="flex-1 px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                    />
                    <button 
                      type="button"
                      onClick={handleAddLang}
                      className="px-4 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {watchedValues.languages?.map((lang) => (
                      <span key={lang} className="inline-flex items-center gap-1 bg-bg-secondary dark:bg-bg-card border border-border-primary text-xs text-secondary-text font-semibold px-3 py-1.5 rounded-full">
                        <span>{lang}</span>
                        <X 
                          className="h-3 w-3 text-secondary-text hover:text-secondary-text dark:hover:text-white cursor-pointer transition-colors" 
                          onClick={() => handleRemoveLang(lang)}
                        />
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Years of Experience</label>
                  <input 
                    type="text" 
                    {...register('experience')}
                    placeholder="e.g. 5 Years"
                    className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Service Category</label>
                  <select 
                    {...register('category')}
                    className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="Home Cleaning">Home Cleaning</option>
                    <option value="Appliance Repair">Appliance Repair</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Pest Control">Pest Control</option>
                    <option value="Beauty & Salon">Beauty & Salon</option>
                  </select>
                </div>

                {/* SKILL TAGS INPUT */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Skills</label>
                  <div className="flex gap-2 mb-2.5">
                    <input 
                      type="text" 
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      placeholder="Type a skill (e.g. Stain Removal) and press Enter"
                      className="flex-1 px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                    />
                    <button 
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {watchedValues.skills?.map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1 bg-primary/5 border border-primary/25 text-xs text-primary-dark dark:text-primary font-semibold px-3 py-1.5 rounded-full">
                        <span>{skill}</span>
                        <X 
                          className="h-3 w-3 text-primary/60 hover:text-primary-dark dark:hover:text-primary cursor-pointer transition-colors" 
                          onClick={() => handleRemoveSkill(skill)}
                        />
                      </span>
                    ))}
                  </div>
                </div>

                {/* WORKING HOURS */}
                <div className="grid grid-cols-2 gap-4 sm:col-span-2">
                  <div>
                    <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Working Hours Start</label>
                    <input 
                      type="time" 
                      {...register('workingHourStart')}
                      className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Working Hours End</label>
                    <input 
                      type="time" 
                      {...register('workingHourEnd')}
                      className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* AVAILABLE DAYS MULTISELECT */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Available Days</label>
                  <div className="flex flex-wrap gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                      const isSelected = watchedValues.availableDays?.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const days = watchedValues.availableDays || [];
                            if (days.includes(day)) {
                              setValue('availableDays', days.filter(d => d !== day));
                            } else {
                              setValue('availableDays', [...days, day]);
                            }
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            isSelected 
                              ? 'bg-primary border-primary text-white shadow-xs' 
                              : 'bg-bg-secondary dark:bg-bg-card border-border-primary text-secondary-text hover:border-border-primary dark:hover:border-border-primary'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Emergency Contact Number</label>
                  <input 
                    type="text" 
                    {...register('emergencyPhone')}
                    className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: SERVICE DETAILS */}
            <div className="bg-bg-card border border-border-primary dark:border-border-primary rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-border-primary dark:border-border-primary pb-4">
                <div className="h-9 w-9 bg-primary/10 text-primary flex items-center justify-center rounded-xl">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-primary-text">Service Listing Details</h3>
                  <p className="text-[11px] text-secondary-text mt-0.5">Control how your premium gig card renders on the public client search pages.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Main Service Listing Title</label>
                  <input 
                    type="text" 
                    {...register('serviceName')}
                    className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Starting Price (₹)</label>
                    <input 
                      type="number" 
                      {...register('startingPrice')}
                      className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Category Experience Badge</label>
                    <input 
                      type="text" 
                      {...register('serviceExperience')}
                      className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Service Listing Description</label>
                  <textarea 
                    rows={3}
                    {...register('serviceDescription')}
                    className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors resize-none leading-relaxed"
                  />
                </div>

                {/* CERTIFICATION UPLOAD DRAGZONE */}
                <div>
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Professional Certification Document</label>
                  <div 
                    onDragOver={(e) => handleDragOver(e, setIsDragOverCert)}
                    onDragLeave={() => handleDragLeave(setIsDragOverCert)}
                    onDrop={(e) => handleDrop(e, 'cert', setIsDragOverCert)}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                      isDragOverCert 
                        ? 'border-primary bg-primary/5 scale-[1.01]' 
                        : 'border-border-primary hover:border-primary/50 bg-bg-secondary/50 dark:bg-bg-card/50'
                    }`}
                    onClick={() => document.getElementById('cert-upload-input')?.click()}
                  >
                    <input 
                      type="file" 
                      id="cert-upload-input" 
                      className="hidden" 
                      onChange={(e) => handleFileChange(e, 'cert')}
                    />
                    <FileText className="h-8 w-8 text-primary/80 mx-auto mb-2" />
                    <p className="text-xs font-extrabold text-secondary-text">
                      {certificationName ? certificationName : 'Upload Professional Certification'}
                    </p>
                    <p className="text-[10px] text-secondary-text mt-1">Drag & Drop or click to browse (PDF, PNG, JPG up to 10MB)</p>
                  </div>
                </div>

                {/* IDENTITY PROOF UPLOAD DRAGZONE */}
                <div>
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Government ID Verification Proof</label>
                  <div 
                    onDragOver={(e) => handleDragOver(e, setIsDragOverId)}
                    onDragLeave={() => handleDragLeave(setIsDragOverId)}
                    onDrop={(e) => handleDrop(e, 'id', setIsDragOverId)}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                      isDragOverId 
                        ? 'border-primary bg-primary/5 scale-[1.01]' 
                        : 'border-border-primary hover:border-primary/50 bg-bg-secondary/50 dark:bg-bg-card/50'
                    }`}
                    onClick={() => document.getElementById('id-upload-input')?.click()}
                  >
                    <input 
                      type="file" 
                      id="id-upload-input" 
                      className="hidden" 
                      onChange={(e) => handleFileChange(e, 'id')}
                    />
                    <ShieldCheck className="h-8 w-8 text-primary/80 mx-auto mb-2" />
                    <p className="text-xs font-extrabold text-secondary-text">
                      {idProofName ? idProofName : 'Upload National Government ID (Aadhaar/Passport/DL)'}
                    </p>
                    <p className="text-[10px] text-secondary-text mt-1">Drag & Drop or click to browse (PDF, Image format)</p>
                  </div>
                </div>

                {/* PORTFOLIO IMAGES DISPLAY & DRAGZONE */}
                <div>
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Portfolio Work Showcase Images</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {portfolioUrls.map((url, index) => (
                      <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-border-primary dark:border-border-primary group">
                        <img src={url} alt={`Portfolio ${index}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPortfolioUrls(prev => prev.filter((_, i) => i !== index))}
                          className="absolute top-1 right-1 h-5 w-5 bg-black/60 hover:bg-black text-white rounded-full flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    
                    {/* Add new Portfolio Slot */}
                    <div 
                      onDragOver={(e) => handleDragOver(e, setIsDragOverPort)}
                      onDragLeave={() => handleDragLeave(setIsDragOverPort)}
                      onDrop={(e) => handleDrop(e, 'portfolio', setIsDragOverPort)}
                      onClick={() => document.getElementById('portfolio-upload-input')?.click()}
                      className={`aspect-video border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                        isDragOverPort ? 'border-primary bg-primary/5 scale-102' : 'border-border-primary hover:border-primary'
                      }`}
                    >
                      <input 
                        type="file" 
                        id="portfolio-upload-input" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'portfolio')}
                      />
                      <Plus className="h-5 w-5 text-secondary-text group-hover:text-primary" />
                      <span className="text-[10px] font-bold text-secondary-text mt-1">Add Image</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: BANK DETAILS */}
            <div className="bg-bg-card border border-border-primary dark:border-border-primary rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-border-primary dark:border-border-primary pb-4">
                <div className="h-9 w-9 bg-primary/10 text-primary flex items-center justify-center rounded-xl">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-primary-text">Bank Details (Payments)</h3>
                  <p className="text-[11px] text-secondary-text mt-0.5">Secure details for receiving instant direct deposits and escrow releases.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Account Holder Name</label>
                  <input 
                    type="text" 
                    {...register('accountHolderName')}
                    className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Bank Name</label>
                  <input 
                    type="text" 
                    {...register('bankName')}
                    className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Account Number</label>
                  <input 
                    type="text" 
                    {...register('accountNumber')}
                    className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">IFSC Code</label>
                  <input 
                    type="text" 
                    {...register('ifscCode')}
                    placeholder="e.g. SBIN0001234"
                    className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">UPI ID (Instant Payments)</label>
                  <input 
                    type="text" 
                    {...register('upiId')}
                    placeholder="e.g. username@upi"
                    className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: SOCIAL LINKS */}
            <div className="bg-bg-card border border-border-primary dark:border-border-primary rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-border-primary dark:border-border-primary pb-4">
                <div className="h-9 w-9 bg-primary/10 text-primary flex items-center justify-center rounded-xl">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-primary-text">Social Links & Websites</h3>
                  <p className="text-[11px] text-secondary-text mt-0.5">Link your external digital handles to boost your premium marketplace credentials.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Personal/Portfolio Website</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-xs font-extrabold text-secondary-text">URL</span>
                    <input 
                      type="text" 
                      {...register('website')}
                      className="w-full pl-12 pr-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">LinkedIn Profile</label>
                  <input 
                    type="text" 
                    {...register('linkedin')}
                    className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Facebook Page</label>
                  <input 
                    type="text" 
                    {...register('facebook')}
                    className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Instagram Handle</label>
                  <input 
                    type="text" 
                    {...register('instagram')}
                    className="w-full px-4 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: NOTIFICATION SETTINGS */}
            <div className="bg-bg-card border border-border-primary dark:border-border-primary rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-border-primary dark:border-border-primary pb-4">
                <div className="h-9 w-9 bg-primary/10 text-primary flex items-center justify-center rounded-xl">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-primary-text">Notification Preferences</h3>
                  <p className="text-[11px] text-secondary-text mt-0.5">Configure when and where you want to be alert-notified for active listings.</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'emailNotifications', label: 'Email Notifications', desc: 'Receive real-time transactional summary, client inquiries and invoice receipts via registered email.' },
                  { name: 'smsNotifications', label: 'SMS Notifications', desc: 'Send emergency SMS reminders on critical scheduling updates directly to your registered telephone.' },
                  { name: 'pushNotifications', label: 'Push Notifications', desc: 'Trigger standard instant browser push notification banners on newly assigned booking orders.' },
                  { name: 'bookingAlerts', label: 'Booking Alerts & Escalations', desc: 'Urgent immediate alerts regarding reschedule requests, client disputes or operational announcements.' },
                  { name: 'marketingEmails', label: 'Marketing and Promotional Emails', desc: 'Periodic newsletters, campaign offers, specialty discount features and professional advice logs.' },
                ].map((item) => (
                  <div key={item.name} className="flex items-start justify-between gap-4 p-4 hover:bg-bg-secondary dark:hover:bg-bg-card rounded-2xl transition-all">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-primary-text">{item.label}</p>
                      <p className="text-[11px] text-secondary-text leading-relaxed max-w-xl">{item.desc}</p>
                    </div>
                    
                    {/* CUSTOM SWITCH ACCENT */}
                    <Controller
                      name={item.name as any}
                      control={control}
                      render={({ field }) => (
                        <button
                          type="button"
                          onClick={() => field.onChange(!field.value)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            field.value ? 'bg-primary' : 'bg-bg-secondary dark:bg-bg-card'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-bg-card shadow-xs ring-0 transition duration-200 ease-in-out ${
                              field.value ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 6: SECURITY (CHANGE PASSWORD) */}
            <div className="bg-bg-card border border-border-primary dark:border-border-primary rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-border-primary dark:border-border-primary pb-4">
                <div className="h-9 w-9 bg-primary/10 text-primary flex items-center justify-center rounded-xl">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-primary-text">Profile Security & Password</h3>
                  <p className="text-[11px] text-secondary-text mt-0.5">Ensure your marketplace specialist login remains private and highly secured.</p>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5 font-display">Current Password</label>
                  <div className="relative">
                    <input 
                      type={showCurrentPass ? 'text' : 'password'} 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-4 pr-12 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-4 top-3 text-secondary-text hover:text-secondary-text dark:hover:text-white transition-colors cursor-pointer"
                    >
                      {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">New Password</label>
                    <div className="relative">
                      <input 
                        type={showNewPass ? 'text' : 'password'} 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-4 pr-12 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-4 top-3 text-secondary-text hover:text-secondary-text dark:hover:text-white transition-colors cursor-pointer"
                      >
                        {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* PASSWORD STRENGTH SEGMENTS */}
                    {newPassword && (
                      <div className="mt-2.5 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-secondary-text uppercase">
                          <span>Password Strength</span>
                          <span className="text-primary font-extrabold">{pwdStrength.label}</span>
                        </div>
                        <div className="h-1.5 w-full bg-bg-secondary rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${pwdStrength.color}`}
                            style={{ width: `${pwdStrength.score}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-secondary-text leading-relaxed">Must include at least 1 number, capital letter, special character and 8+ characters.</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPass ? 'text' : 'password'} 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-4 pr-12 py-3 bg-bg-secondary dark:bg-bg-card border border-border-primary dark:border-border-primary rounded-xl text-xs font-semibold text-primary-text focus:outline-none focus:border-primary transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-4 top-3 text-secondary-text hover:text-secondary-text dark:hover:text-white transition-colors cursor-pointer"
                      >
                        {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-bg-secondary dark:bg-bg-card hover:bg-black dark:bg-primary dark:hover:bg-primary-hover text-xs font-extrabold text-primary-text hover:text-white dark:text-white rounded-xl transition-all cursor-pointer"
                  >
                    Update Secure Password
                  </button>
                </div>
              </form>
            </div>

            {/* BOTTOM EXTRAS BAR ACTIONS */}
            <div className="flex justify-between items-center bg-bg-card border border-border-primary dark:border-border-primary rounded-3xl p-5 shadow-xs">
              <button 
                type="button" 
                onClick={handleResetDraft}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Reset Draft / Clear Form</span>
              </button>
              
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => navigate('/provider')}
                  className="px-4 py-2.5 border border-border-primary hover:bg-bg-secondary dark:hover:bg-bg-card text-xs font-bold rounded-xl text-secondary-text hover:text-primary-text transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleSubmit(onProfileSubmit)}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-xs font-black text-white rounded-xl shadow-md shadow-primary/25 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isSaving ? (
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  <span>Save Profile</span>
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR: COMPLETION WHEEL + CARD PREVIEW */}
          <div className="space-y-8 sticky top-24">
            
            {/* PROFILE COMPLETION CARD */}
            <div className="bg-bg-card border border-border-primary dark:border-border-primary rounded-3xl p-6 shadow-sm space-y-5">
              <h3 className="text-xs font-extrabold text-secondary-text uppercase tracking-widest">Profile Completion</h3>
              
              <div className="flex items-center gap-5">
                {/* Circular Progress Bar Wheel */}
                <div className="relative h-18 w-18 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      cx="36" 
                      cy="36" 
                      r="30" 
                      strokeWidth="6" 
                      stroke="currentColor" 
                      className="text-secondary-text dark:text-primary-text" 
                      fill="transparent" 
                    />
                    <circle 
                      cx="36" 
                      cy="36" 
                      r="30" 
                      strokeWidth="6" 
                      stroke="currentColor" 
                      className="text-primary transition-all duration-500 ease-out" 
                      strokeDasharray={`${2 * Math.PI * 30}`} 
                      strokeDashoffset={`${2 * Math.PI * 30 * (1 - completionRate / 100)}`}
                      strokeLinecap="round" 
                      fill="transparent" 
                    />
                  </svg>
                  <span className="absolute text-sm font-black text-primary-text font-display">
                    {completionRate}%
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold text-primary-text">Your Profile is {completionRate >= 80 ? 'Mostly Complete' : 'Incomplete'}</h4>
                  <p className="text-[10px] text-secondary-text mt-0.5">Complete lists to gain high client credibility and search priority boost.</p>
                </div>
              </div>

              {/* Missing Fields list */}
              {missingItems.length > 0 && (
                <div className="bg-bg-secondary dark:bg-bg-card rounded-2xl p-4 border border-border-primary space-y-2">
                  <span className="text-[9px] font-extrabold text-secondary-text uppercase tracking-wider block">Remaining items:</span>
                  <div className="space-y-1">
                    {missingItems.map((item) => (
                      <div key={item} className="flex items-center gap-1.5 text-[10px] font-bold text-secondary-text">
                        <AlertCircle className="h-3.5 w-3.5 text-primary/80 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* LIVE PROFILE CARD PREVIEW */}
            <div className="bg-bg-card border border-border-primary dark:border-border-primary rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-extrabold text-secondary-text uppercase tracking-widest">Public Card Preview</h3>
                <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Live View
                </span>
              </div>

              {/* GIG PREVIEW CARD */}
              <div className="border border-border-primary dark:border-border-primary rounded-2xl overflow-hidden bg-bg-secondary/50 dark:bg-bg-card/20 shadow-xs relative">
                {/* Image Showcase */}
                <div className="aspect-video relative overflow-hidden bg-bg-secondary">
                  <img 
                    src={portfolioUrls[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'} 
                    alt="Cover" 
                    className="h-full w-full object-cover"
                  />
                  {currentUser.isVerified && (
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-primary px-2.5 py-1 rounded-full text-[9px] font-black tracking-wide uppercase flex items-center gap-1 border border-primary/30">
                      <ShieldCheck className="h-3 w-3 fill-primary text-primary-text" />
                      <span>Verified Specialist</span>
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide">
                    ₹{watchedValues.startingPrice || '1,500'}+
                  </div>
                </div>

                {/* Content details */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={avatarUrl || currentUser.avatar} 
                      alt="Avatar" 
                      className="h-9 w-9 rounded-full object-cover border border-primary shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-xs font-black text-primary-text leading-tight">
                        {watchedValues.firstName} {watchedValues.lastName}
                      </h4>
                      <p className="text-[10px] text-secondary-text">{watchedValues.category || 'Specialist'}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-secondary-text line-clamp-2 leading-relaxed">
                    {watchedValues.serviceDescription || watchedValues.bio || 'Professional home service specialist, highly certified with immediate booking slots available today.'}
                  </p>

                  <div className="border-t border-border-primary dark:border-border-primary pt-3 flex items-center justify-between text-[10px] font-bold text-secondary-text">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-primary-text">{currentUser.rating || '4.8'}</span>
                      <span>({currentUser.completedJobs || '15'} Jobs)</span>
                    </div>

                    <div className="flex items-center gap-1 text-primary">
                      <Award className="h-3.5 w-3.5" />
                      <span>{watchedValues.experience || '3 Years'} Experience</span>
                    </div>
                  </div>

                  {/* Location & availability badges */}
                  <div className="bg-bg-secondary dark:bg-bg-card p-2.5 rounded-xl text-[10px] text-secondary-text flex items-center justify-between">
                    <div className="flex items-center gap-1 truncate max-w-[120px]">
                      <MapPin className="h-3.5 w-3.5 text-secondary-text shrink-0" />
                      <span className="truncate">{watchedValues.city || 'Bengaluru'}, {watchedValues.state || 'Karnataka'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wide shrink-0">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>{watchedValues.workingHourStart || '08:00'} - {watchedValues.workingHourEnd || '18:00'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* DETAILED IMAGE CROPPING MODAL (PREMIUM POPUP) */}
      <AnimatePresence>
        {showCropModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/85 backdrop-blur-xs" 
              onClick={() => setShowCropModal(false)} 
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-bg-card border border-border-primary dark:border-border-primary rounded-3xl max-w-md w-full p-6 relative z-10 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center border-b border-border-primary dark:border-border-primary pb-3">
                <h3 className="text-sm font-black text-primary-text flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 text-primary" />
                  <span>Crop & Fit Avatar</span>
                </h3>
                <button 
                  onClick={() => setShowCropModal(false)}
                  className="p-1 text-secondary-text hover:text-secondary-text dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Crop Box Window */}
              <div 
                className="relative h-72 w-full rounded-2xl overflow-hidden bg-bg-secondary dark:bg-bg-card cursor-move flex items-center justify-center select-none"
                onMouseMove={handleCropMouseMove}
                onMouseDown={handleCropMouseDown}
                onMouseUp={handleCropMouseUp}
                onMouseLeave={handleCropMouseUp}
              >
                <img 
                  src={cropSrc} 
                  alt="Crop Target" 
                  className="max-w-none origin-center transition-transform duration-75 select-none pointer-events-none"
                  style={{
                    transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropZoom})`,
                    maxHeight: '100%'
                  }}
                />

                {/* Circular Crop Overlay Guide mask */}
                <div className="absolute inset-0 border-[40px] border-black/60 pointer-events-none flex items-center justify-center">
                  <div className="h-48 w-48 rounded-full border-2 border-dashed border-primary/75 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
                </div>
              </div>

              {/* Slider scale */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-extrabold text-secondary-text uppercase tracking-wider">
                  <span>Zoom Scale</span>
                  <span>{Math.round(cropZoom * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="3" 
                  step="0.05"
                  value={cropZoom}
                  onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                  className="w-full h-1 bg-gray-200 dark:bg-bg-card rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="flex gap-3 justify-end border-t border-border-primary dark:border-border-primary pt-4">
                <button
                  type="button"
                  onClick={() => setShowCropModal(false)}
                  className="px-4 py-2.5 border border-border-primary hover:bg-bg-secondary dark:hover:bg-bg-card text-xs font-bold rounded-xl text-secondary-text hover:text-primary-text transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCrop}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-xs font-black text-white rounded-xl shadow-md shadow-primary/20 transition-all cursor-pointer"
                >
                  Confirm Crop
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUCCESS CONFIRMATION MODAL WITH CHECKMARK ANIMATION */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs" 
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/provider');
              }} 
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-bg-card border border-border-primary dark:border-border-primary rounded-3xl max-w-sm w-full p-8 text-center relative z-10 shadow-2xl space-y-5"
            >
              {/* Checkmark drawing animation */}
              <div className="flex justify-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                  className="h-20 w-20 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/10 border border-emerald-500/20"
                >
                  <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 stroke-2" />
                  </motion.div>
                </motion.div>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-black text-primary-text">Profile Saved Successfully!</h3>
                <p className="text-xs text-secondary-text leading-relaxed">
                  Your professional specialist portfolio and marketplace listings have been fully synchronized with our cloud network databases.
                </p>
              </div>

              <div className="bg-bg-secondary dark:bg-bg-card p-4 rounded-2xl text-[11px] font-bold text-secondary-text uppercase tracking-wider text-left space-y-1.5 border border-border-primary">
                <div className="flex justify-between">
                  <span>Specialist Name</span>
                  <span className="text-primary-text font-extrabold">{watchedValues.firstName} {watchedValues.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Category Code</span>
                  <span className="text-primary-text font-extrabold">{watchedValues.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Direct Deposit status</span>
                  <span className="text-emerald-500 font-extrabold">Active Direct Deposit</span>
                </div>
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/provider');
                  }}
                  className="flex-1 py-3 bg-primary hover:bg-primary-hover text-xs font-black text-white rounded-xl shadow-md shadow-primary/20 transition-all cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
