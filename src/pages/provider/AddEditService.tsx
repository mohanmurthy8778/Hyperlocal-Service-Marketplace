import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MOCK_CATEGORIES } from '../../data';
import { Sparkles, Save, Trash2, Edit, Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatINR } from '../../utils/format';

export const AddEditService: React.FC = () => {
  const { currentUser, services, addService, editService, deleteService, toast } = useApp();

  const providerServices = useMemo(() => {
    return services.filter(s => s.providerId === currentUser?.id);
  }, [services, currentUser]);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('cleaning');
  const [price, setPrice] = useState('100');
  const [duration, setDuration] = useState('2-3 hrs');
  const [description, setDescription] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleCreateNewClick = () => {
    setEditingId(null);
    setTitle('');
    setCategoryId('cleaning');
    setPrice('100');
    setDuration('2-3 hrs');
    setDescription('');
    setFeaturesInput('Eco-friendly products, Punctual arrival, Complete cleaning guarantee');
    setImageFile(null);
    setImagePreview(null);
  };

  const handleEditClick = (service: any) => {
    setEditingId(service.id);
    setTitle(service.title);
    setCategoryId(service.categoryId);
    setPrice(service.price.toString());
    setDuration(service.duration);
    setDescription(service.description);
    setFeaturesInput(service.features.join(', '));
    setImageFile(null);
    setImagePreview(service.serviceImage || service.image_url || service.image || null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast('Please populate package title and details', 'error');
      return;
    }

    const catObj = MOCK_CATEGORIES.find(c => c.id === categoryId);
    const categoryName = catObj ? catObj.name : 'Home Cleaning';
    const featuresList = featuresInput.split(',').map(f => f.trim()).filter(f => f.length > 0);

    if (editingId) {
      // Edit
      const orig = services.find(s => s.id === editingId);
      if (orig) {
        editService({
          ...orig,
          title,
          categoryId,
          categoryName,
          price: Number(price) || 100,
          duration,
          description,
          features: featuresList
        }, imageFile);
      }
    } else {
      // Add
      addService({
        title,
        categoryId,
        categoryName,
        description,
        price: Number(price) || 100,
        duration,
        images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'],
        features: featuresList
      }, imageFile);
    }

    // Reset Form
    handleCreateNewClick();
  };

  const handleDeleteClick = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const handleConfirmDelete = async () => {
    if (!showDeleteConfirm) return;
    setIsDeleting(true);
    try {
      await deleteService(showDeleteConfirm);
      setShowDeleteConfirm(null);
      handleCreateNewClick();
    } catch (err) {
      console.error('Failed to delete service package:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 transition-colors duration-200 animate-fade-in" id="add-edit-services">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary-text">Listing Packages Console</h1>
          <p className="text-xs text-secondary-text mt-1 font-semibold">Deploy custom hyperlocal packages, manage rates, and descriptions.</p>
        </div>

        <Link
          to="/provider"
          className="px-3.5 py-1.5 border border-border-primary hover:bg-bg-secondary text-xs font-bold text-secondary-text rounded-xl flex items-center gap-1.5 dark:border-border-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Lists of active services */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-secondary-text uppercase tracking-widest">Active Listings ({providerServices.length})</h3>
            <button
              onClick={handleCreateNewClick}
              className="px-2.5 py-1 rounded-lg bg-primary/15 hover:bg-primary/20 text-[10px] font-extrabold text-primary flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create New</span>
            </button>
          </div>

          <div className="space-y-3">
            {providerServices.length > 0 ? (
              providerServices.map((serv) => (
                <div
                  key={serv.id}
                  onClick={() => !isDeleting && handleEditClick(serv)}
                  className={`p-4 rounded-2xl border flex justify-between items-start gap-4 transition-all cursor-pointer ${
                    editingId === serv.id
                      ? 'bg-primary/5 border-primary/30 shadow-sm'
                      : 'bg-bg-card border-border-primary dark:bg-bg-card dark:border-border-primary hover:shadow-sm'
                  } ${isDeleting ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className="space-y-1 overflow-hidden">
                    <h4 className="text-xs font-extrabold text-primary-text truncate">{serv.title}</h4>
                    <span className="text-[10px] font-semibold text-primary block">{serv.categoryName}</span>
                    <span className="text-xs font-extrabold text-primary-text block pt-1">{formatINR(serv.price)}</span>
                  </div>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={(e) => { e.stopPropagation(); handleEditClick(serv); }}
                      className="p-1.5 text-secondary-text hover:text-primary disabled:opacity-50"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(serv.id); }}
                      className="p-1.5 text-secondary-text hover:text-red-600 disabled:opacity-50 flex items-center justify-center min-w-[28px] min-h-[28px]"
                    >
                      {isDeleting && showDeleteConfirm === serv.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border border-border-primary rounded-2xl bg-bg-card dark:border-border-primary text-xs text-secondary-text font-bold uppercase tracking-wider">
                No Active Listings
              </div>
            )}
          </div>
        </div>

        {/* Right Col (Col Span 2): Form container */}
        <div className="lg:col-span-2 bg-bg-card rounded-2xl border border-border-primary p-6 dark:border-border-primary shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-extrabold text-primary-text flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-primary" />
              <span>{editingId ? 'Modify Service Package Details' : 'Design New Service Package'}</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-secondary-text">Service Package Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs py-2.5 px-3 rounded-xl border border-border-primary bg-bg-secondary/50 dark:border-border-primary dark:bg-bg-card dark:text-white outline-none focus:border-primary"
                placeholder="e.g. Master Leak Inspection & Pipe Sealing"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-secondary-text">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-xl border border-border-primary bg-bg-secondary/50 outline-none dark:border-border-primary dark:bg-bg-card dark:text-white focus:border-primary"
                >
                  {MOCK_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-secondary-text">Package Rate (₹)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-xl border border-border-primary bg-bg-secondary/50 dark:border-border-primary dark:bg-bg-card dark:text-white outline-none focus:border-primary"
                  placeholder="e.g. 120"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-secondary-text">Service Duration</label>
                <input
                  type="text"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-xl border border-border-primary bg-bg-secondary/50 dark:border-border-primary dark:bg-bg-card dark:text-white outline-none focus:border-primary"
                  placeholder="e.g. 2-3 hrs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-secondary-text">Package Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-border-primary bg-bg-secondary/50 dark:border-border-primary dark:bg-bg-card dark:text-white outline-none focus:border-primary resize-none"
                placeholder="Give a deep explanation of what chores are executed under this budget package..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-secondary-text">Package Features Checklist (Comma Separated)</label>
              <textarea
                rows={2}
                value={featuresInput}
                onChange={(e) => setFeaturesInput(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-border-primary bg-bg-secondary/50 dark:border-border-primary dark:bg-bg-card dark:text-white outline-none focus:border-primary resize-none"
                placeholder="Feature 1, Feature 2, Feature 3"
              />
              <span className="text-[10px] text-secondary-text block leading-tight">These will be rendered as a bulleted list with checkboxes on the details view.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-secondary-text">Package Image (Optional)</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="block w-full text-xs text-secondary-text file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                {imagePreview && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border-primary bg-bg-secondary">
                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 border-t border-border-primary dark:border-border-primary pt-4">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCreateNewClick}
                  className="px-4 py-2.5 rounded-xl border border-border-primary hover:bg-bg-secondary text-xs font-bold text-secondary-text dark:border-border-primary dark:text-secondary-text"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-xs font-bold text-charcoal flex items-center gap-1.5 shadow-md shadow-primary/10"
              >
                <Save className="h-4.5 w-4.5" />
                <span>{editingId ? 'Save Package Updates' : 'Publish Package Listing'}</span>
              </button>
            </div>

          </form>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-bg-card border border-border-primary dark:bg-bg-card dark:border-border-primary rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-fade-in space-y-6">
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-primary-text">Confirm Deletion</h3>
              <p className="text-xs text-secondary-text leading-relaxed">
                Are you sure you want to delete this service package?
              </p>
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2.5 rounded-xl border border-border-primary text-xs font-bold text-secondary-text hover:bg-bg-secondary disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white flex items-center gap-2 shadow-md shadow-red-600/10 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
