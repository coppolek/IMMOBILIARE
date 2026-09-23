import React, { useState } from 'react';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  GraduationCap, 
  Briefcase, 
  Building, 
  LogOut, 
  Check, 
  Phone,
  ShieldCheck,
  Settings,
  UploadCloud,
  Sparkles
} from 'lucide-react';
import { UserProfile, UserRole, MILAN_UNIVERSITIES } from '../types';
import { updateUserRole, logoutUser, isUserAdmin } from '../services/authService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  lang: 'it' | 'en';
  onProfileUpdated?: (updated: UserProfile) => void;
  onOpenAdSenseAdmin?: () => void;
  onOpenImport?: () => void;
  onOpenGenerator?: () => void;
  onOpenAdminPanel?: () => void;
  onOpenSubscribers?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  lang,
  onProfileUpdated,
  onOpenAdSenseAdmin,
  onOpenImport,
  onOpenGenerator,
  onOpenAdminPanel,
  onOpenSubscribers,
}) => {
  const isIt = lang === 'it';
  const [role, setRole] = useState<UserRole>(user.role || 'student');
  const [university, setUniversity] = useState(user.university || MILAN_UNIVERSITIES[0]);
  const [phone, setPhone] = useState(user.phone || '');
  const [bio, setBio] = useState(user.bio || '');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserRole(user.uid, role, { university, phone, bio });
      setSaved(true);
      if (onProfileUpdated) {
        onProfileUpdated({
          ...user,
          role,
          university,
          phone,
          bio
        });
      }
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      onClose();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div 
        id="profile-modal-container"
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-0 sm:my-8 max-h-[92dvh] sm:max-h-[90vh] flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
      >
        {/* Mobile drag handle */}
        <div className="pt-2 sm:hidden bg-stone-900 flex justify-center">
          <div className="w-10 h-1 bg-stone-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="bg-stone-900 p-6 text-white relative">
          <button
            id="btn-close-profile-modal"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <img 
              src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
              alt={user.displayName || 'User'} 
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400/50 shadow-md bg-stone-800"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-bold font-serif">{user.displayName || 'Utente'}</h2>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3" />
                <span>{user.email || 'Account collegato'}</span>
              </p>
              <div className="mt-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-400/30">
                  {role === 'student' ? (isIt ? 'Studente' : 'Student') : role === 'worker' ? (isIt ? 'Lavoratore' : 'Worker') : (isIt ? 'Proprietario' : 'Landlord')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="p-6 space-y-4 text-stone-800">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              {isIt ? 'Il tuo ruolo nella community' : 'Your community role'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  role === 'student'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-amber-600" />
                <span className="text-[10px]">{isIt ? 'Studente' : 'Student'}</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('worker')}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  role === 'worker'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Briefcase className="w-4 h-4 text-amber-600" />
                <span className="text-[10px]">{isIt ? 'Lavoratore' : 'Worker'}</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('landlord')}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  role === 'landlord'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Building className="w-4 h-4 text-amber-600" />
                <span className="text-[10px]">{isIt ? 'Proprietario' : 'Landlord'}</span>
              </button>
            </div>
          </div>

          {role === 'student' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {isIt ? 'Università / Polo accademico' : 'University campus'}
              </label>
              <select
                id="select-user-university"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium text-stone-800 focus:outline-hidden focus:border-amber-500"
              >
                {MILAN_UNIVERSITIES.map((uni) => (
                  <option key={uni} value={uni}>{uni}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {isIt ? 'Numero WhatsApp / Telefono (Opzionale)' : 'Phone / WhatsApp (Optional)'}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                id="input-user-phone"
                type="tel"
                placeholder="+39 340 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-800 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {isIt ? 'Breve presentazione personale' : 'Brief personal bio'}
            </label>
            <textarea
              id="input-user-bio"
              rows={2}
              placeholder={isIt ? 'es. Studente di Ingegneria al PoliMi, ordinato e tranquillo...' : 'e.g. Engineering student at PoliMi, quiet and tidy...'}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-800 focus:outline-hidden focus:border-amber-500 resize-none"
            />
          </div>

          {/* Admin Tools Section */}
          {isUserAdmin(user) && (
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isIt ? 'Strumenti Amministratore' : 'Administrator Tools'}</span>
                </div>
                <span className="text-[10px] bg-amber-200/80 text-amber-950 font-bold px-1.5 py-0.5 rounded">
                  Admin
                </span>
              </div>

              {onOpenAdminPanel && (
                <button
                  id="btn-profile-open-admin-panel"
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAdminPanel();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold transition-all shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-stone-950" />
                    <span>{isIt ? 'Pannello di Amministrazione' : 'Full Administration Panel'}</span>
                  </div>
                  <span className="text-[10px] bg-stone-950 text-amber-300 font-bold px-2 py-0.5 rounded-md">
                    {isIt ? 'Apri Tutto' : 'Open All'}
                  </span>
                </button>
              )}

              {onOpenGenerator && (
                <button
                  id="btn-profile-open-generator"
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenGenerator();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white border border-amber-200 hover:border-amber-400 text-stone-800 text-xs font-bold transition-all shadow-xs group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span>{isIt ? 'Formatta Post FB' : 'FB Post Formatter'}</span>
                  </div>
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-100 group-hover:bg-amber-200 px-2 py-0.5 rounded-md transition-colors">
                    {isIt ? 'Apri' : 'Open'}
                  </span>
                </button>
              )}
              
              {onOpenImport && (
                <button
                  id="btn-profile-open-import"
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenImport();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white border border-amber-200 hover:border-amber-400 text-stone-800 text-xs font-bold transition-all shadow-xs group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                      <UploadCloud className="w-3.5 h-3.5" />
                    </div>
                    <span>{isIt ? 'Importazione Annunci (CSV / RSS)' : 'Import Listings (CSV / RSS)'}</span>
                  </div>
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-100 group-hover:bg-amber-200 px-2 py-0.5 rounded-md transition-colors">
                    {isIt ? 'Apri' : 'Open'}
                  </span>
                </button>
              )}

              {onOpenSubscribers && (
                <button
                  id="btn-profile-open-subscribers"
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSubscribers();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white border border-emerald-200 hover:border-emerald-400 text-stone-800 text-xs font-bold transition-all shadow-xs group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <span>{isIt ? 'Gestione Iscritti & Newsletter' : 'Subscribers & Newsletter'}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 group-hover:bg-emerald-200 px-2 py-0.5 rounded-md transition-colors">
                    {isIt ? 'Apri' : 'Open'}
                  </span>
                </button>
              )}

              <button
                id="btn-profile-open-adsense-admin"
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenAdSenseAdmin) onOpenAdSenseAdmin();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white border border-amber-200 hover:border-amber-400 text-stone-800 text-xs font-bold transition-all shadow-xs group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Settings className="w-3.5 h-3.5" />
                  </div>
                  <span>{isIt ? 'Banner Google AdSense' : 'Google AdSense Banners'}</span>
                </div>
                <span className="text-[10px] text-amber-700 font-semibold bg-amber-100 group-hover:bg-amber-200 px-2 py-0.5 rounded-md transition-colors">
                  {isIt ? 'Gestisci' : 'Manage'}
                </span>
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-stone-100">
            <button
              id="btn-profile-logout"
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{isIt ? 'Esci' : 'Sign Out'}</span>
            </button>

            <button
              id="btn-profile-save"
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-xs disabled:opacity-60"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isIt ? 'Salvato!' : 'Saved!'}</span>
                </>
              ) : (
                <span>{saving ? (isIt ? 'Salvataggio...' : 'Saving...') : (isIt ? 'Salva Modifiche' : 'Save Changes')}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
