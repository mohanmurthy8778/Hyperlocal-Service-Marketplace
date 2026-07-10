import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Phone, MapPin, Mail, Sparkles, ShieldCheck } from 'lucide-react';
import { InternationalPhoneInput } from '../../components/InternationalPhoneInput';
import { isValidPhoneNumber } from 'react-phone-number-input';

export const CustomerSettings: React.FC = () => {
  const { currentUser, setCurrentUser, users, setUsers, toast } = useApp() as any; // Allow state setters since we declared them

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [bio, setBio] = useState(currentUser?.bio || '');

  // Safety trigger
  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setPhone(currentUser.phone);
      setAddress(currentUser.address);
      setBio(currentUser.bio || '');
    }
  }, [currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (phone && !isValidPhoneNumber(phone)) {
      toast('Please enter a valid phone number', 'error');
      return;
    }

    const updatedUser = {
      ...currentUser,
      name,
      email,
      phone,
      address,
      bio
    };

    // Update masters
    setCurrentUser(updatedUser);
    toast('Profile credentials updated successfully!', 'success');
  };

  if (!currentUser) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 transition-colors duration-200 animate-fade-in" id="customer-settings-page">
      <div>
        <h1 className="text-2xl font-extrabold text-primary-text">Profile Settings</h1>
        <p className="text-xs text-secondary-text mt-1">Manage personal contact channels, biographies, and delivery coordinates.</p>
      </div>

      <div className="bg-bg-card rounded-2xl border border-border-primary p-6 dark:border-border-primary shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center gap-4 pb-6 border-b border-border-primary dark:border-border-primary">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-16 w-16 rounded-full object-cover border-2 border-primary/20"
            />
            <div>
              <h3 className="text-sm font-extrabold text-primary-text">{currentUser.name}</h3>
              <p className="text-[10px] text-secondary-text block">Workspace Role: <strong className="text-primary uppercase">{currentUser.role}</strong></p>
              <span className="text-[9px] text-secondary-text block mt-0.5">Joined ServiceHub on {currentUser.joinedDate}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-secondary-text">Your Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs py-2.5 pl-10 pr-3 rounded-xl border border-border-primary bg-bg-secondary/50 dark:border-border-primary dark:bg-bg-card dark:text-white outline-none focus:border-primary"
                />
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-secondary-text" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-secondary-text">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs py-2.5 pl-10 pr-3 rounded-xl border border-border-primary bg-bg-secondary/50 dark:border-border-primary dark:bg-bg-card dark:text-white outline-none focus:border-primary"
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-secondary-text" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-secondary-text">Helpline Phone Number</label>
              <div className="relative">
                <InternationalPhoneInput
                  value={phone}
                  onChange={(val) => setPhone(val || '')}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-secondary-text">Default Service Address</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs py-2.5 pl-10 pr-3 rounded-xl border border-border-primary bg-bg-secondary/50 dark:border-border-primary dark:bg-bg-card dark:text-white outline-none focus:border-primary"
                />
                <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-secondary-text" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-secondary-text">Biography / About Me</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-border-primary bg-bg-secondary/50 dark:border-border-primary dark:bg-bg-card dark:text-white outline-none focus:border-primary resize-none"
              placeholder="A brief bio about your household needs..."
            />
          </div>

          <div className="flex justify-end gap-2.5">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-xs font-bold text-charcoal shadow-md shadow-primary/10 flex items-center gap-1.5 transition-all"
            >
              <ShieldCheck className="h-4.5 w-4.5" />
              <span>Save Preferences</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
