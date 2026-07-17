import React, { useState, useEffect } from 'react';
import { Loader2, Camera, Edit3 } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { authService } from '../../../services/authService';
import { userService } from '../../../services/userService';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../lib/translations';
import { toast } from 'react-hot-toast';

export function ProfileDetailsForm() {
  const { user, setUser } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language];

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setEditedName(user.name);
    }
  }, [user]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError(t.uploadImgError);
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const res = await authService.updateProfileImage(file);
      setUser(res.data);
    } catch (err: any) {
      console.error('Failed to upload profile image:', err);
      setUploadError(
        err.response?.data?.message || t.uploadImgErrorDefault
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;
    if (!editedName.trim()) {
      toast.error(t.nameEmptyError);
      return;
    }
    setIsSavingProfile(true);
    try {
      const res = await userService.updateUser(user._id, { name: editedName });
      setUser({ ...user, name: res.data.name });
      setIsEditingProfile(false);
      toast.success(t.profileUpdateSuccess);
    } catch (err: any) {
      console.error('Failed to update profile name:', err);
      toast.error(err.response?.data?.message || t.profileUpdateError);
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
      
      <div className="flex flex-col md:flex-row items-center gap-6 border-b border-neutral-50 pb-6">
        <div className="relative group/avatar w-20 h-20 bg-neutral-50 border border-neutral-100 rounded-full flex items-center justify-center overflow-hidden shadow-sm">
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
          ) : (user?.profileImage && !user.profileImage.includes('default-avatar')) ? (
            <img 
              src={user.profileImage} 
              alt={user.name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <span className="text-2xl font-black font-serif-en text-neutral-800 uppercase">
              {user?.name?.charAt(0)}
            </span>
          )}
          
          <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageChange}
              disabled={isUploading}
            />
            <Camera className="w-5 h-5 text-white/90 hover:scale-110 transition-transform" />
          </label>
        </div>
        
        <div className={`text-center md:text-right space-y-1 ${language === 'ar' ? 'md:text-right' : 'md:text-left'}`}>
          <h3 className="text-lg font-bold text-neutral-900">{user?.name}</h3>
          <span className="text-xs text-neutral-400 font-sans block">{user?.email}</span>
          <span className="inline-block bg-neutral-100 text-neutral-600 text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
            {user?.role === 'admin' ? t.roleAdmin : t.roleCustomer}
          </span>
          {uploadError && (
            <span className="text-[10px] text-red-500 font-bold block pt-1">{uploadError}</span>
          )}
        </div>
      </div>

      
      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <span className="text-neutral-400 block font-bold">{t.usernameLabel}</span>
            {isEditingProfile ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className={`w-full bg-white border border-neutral-250 text-neutral-850 px-4 py-3 rounded-xl font-bold focus:outline-none focus:border-black transition-all ${language === 'ar' ? 'text-right' : 'text-left'}`}
                disabled={isSavingProfile}
              />
            ) : (
              <p className="bg-neutral-50/50 border border-neutral-100 text-neutral-800 px-4 py-3 rounded-xl font-bold">
                {user?.name}
              </p>
            )}
          </div>
          
          <div className="space-y-1">
            <span className="text-neutral-400 block font-bold">{t.emailAddressLabel}</span>
            <p className="bg-neutral-50/50 border border-neutral-100 text-neutral-450 px-4 py-3 rounded-xl font-sans font-bold cursor-not-allowed text-left" dir="ltr">
              {user?.email}
            </p>
          </div>
        </div>

        <div className={`flex justify-end gap-3 pt-2 ${language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
          {isEditingProfile ? (
            <>
              <button
                type="submit"
                disabled={isSavingProfile}
                className="bg-black text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-neutral-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:bg-neutral-400"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {t.savingChanges}
                  </>
                ) : (
                  t.saveChangesBtn
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingProfile(false);
                  setEditedName(user?.name || '');
                }}
                disabled={isSavingProfile}
                className="bg-white border border-neutral-200 text-neutral-600 px-6 py-3 rounded-xl text-xs font-bold hover:bg-neutral-50 hover:text-black transition-all cursor-pointer"
              >
                {t.cancelBtn}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              className="bg-neutral-900 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {t.editProfileBtn}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
