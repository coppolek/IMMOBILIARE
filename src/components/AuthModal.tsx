import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  GraduationCap, 
  Building, 
  Briefcase, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  loginWithGoogle, 
  loginWithEmail, 
  registerWithEmail, 
  resetUserPassword, 
  getAuthErrorMessage 
} from '../services/authService';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'it' | 'en';
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialMode = 'login',
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isIt = lang === 'it';

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Google login error:', err);
      const msg = getAuthErrorMessage(err?.code || '', isIt);
      setError(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email.trim(), password);
        if (onSuccess) onSuccess();
        onClose();
      } else if (mode === 'register') {
        if (!displayName.trim()) {
          setError(isIt ? 'Inserisci il tuo nome completo.' : 'Please enter your name.');
          setLoading(false);
          return;
        }
        await registerWithEmail(email.trim(), password, displayName.trim(), role);
        if (onSuccess) onSuccess();
        onClose();
      } else if (mode === 'forgot') {
        await resetUserPassword(email.trim());
        setSuccessMessage(
          isIt 
            ? 'Email di recupero inviata! Controlla la tua casella di posta.' 
            : 'Password reset link sent! Please check your inbox.'
        );
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const msg = getAuthErrorMessage(err?.code || '', isIt);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="auth-modal-container"
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8"
      >
        {/* Top Header with Gradient */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 p-6 text-white relative">
          <button
            id="btn-close-auth-modal"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-400/30 text-[10px] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Affitti Milano Hub
            </span>
          </div>

          <h2 className="text-xl font-bold font-serif">
            {mode === 'login' && (isIt ? 'Accedi al tuo account' : 'Log in to your account')}
            {mode === 'register' && (isIt ? 'Crea il tuo account' : 'Create your account')}
            {mode === 'forgot' && (isIt ? 'Recupera la tua password' : 'Reset your password')}
          </h2>

          <p className="text-xs text-stone-300 mt-1">
            {mode === 'login' && (isIt ? 'Trova stanze verificate o gestisci le tue inserzioni a Milano' : 'Find verified rooms or manage your listings in Milan')}
            {mode === 'register' && (isIt ? 'Unisciti alla community di studenti e proprietari a Milano' : 'Join the Milan student & housing community')}
            {mode === 'forgot' && (isIt ? 'Inserisci la tua email per ricevere le istruzioni' : 'Enter your email to receive recovery instructions')}
          </p>
        </div>

        {/* Tab Switcher */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1.5 bg-stone-100 border-b border-stone-200 text-xs font-semibold">
            <button
              id="tab-login-btn"
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`py-2 rounded-xl transition-all ${
                mode === 'login' 
                  ? 'bg-white text-stone-900 shadow-xs font-bold' 
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {isIt ? 'Accedi' : 'Log In'}
            </button>
            <button
              id="tab-register-btn"
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`py-2 rounded-xl transition-all ${
                mode === 'register' 
                  ? 'bg-white text-stone-900 shadow-xs font-bold' 
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {isIt ? 'Registrati' : 'Sign Up'}
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Google 1-Click Button */}
          {mode !== 'forgot' && (
            <div>
              <button
                id="btn-google-auth"
                type="button"
                disabled={googleLoading || loading}
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-sm shadow-xs transition-colors disabled:opacity-60"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>
                  {googleLoading 
                    ? (isIt ? 'Connessione a Google...' : 'Connecting to Google...') 
                    : mode === 'register' 
                      ? (isIt ? 'Registrati con Google' : 'Sign up with Google') 
                      : (isIt ? 'Accedi con Google' : 'Sign in with Google')}
                </span>
              </button>

              <div className="relative my-4 flex items-center justify-center">
                <div className="border-t border-stone-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-medium text-stone-400 uppercase tracking-wider absolute">
                  {isIt ? 'oppure con email' : 'or with email'}
                </span>
              </div>
            </div>
          )}

          {/* Feedback messages */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Name field (for register) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isIt ? 'Nome e Cognome' : 'Full Name'}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    id="input-auth-name"
                    type="text"
                    required
                    placeholder={isIt ? 'es. Marco Rossi' : 'e.g. Marco Rossi'}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs font-medium focus:outline-hidden focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>
            )}

            {/* Role selector (for register) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {isIt ? 'Chi sei?' : 'Who are you?'}
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
                    <span className="text-[10px] leading-tight">{isIt ? 'Studente' : 'Student'}</span>
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
                    <span className="text-[10px] leading-tight">{isIt ? 'Lavoratore' : 'Worker'}</span>
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
                    <span className="text-[10px] leading-tight">{isIt ? 'Proprietario' : 'Landlord'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  id="input-auth-email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs font-medium focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Password field */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(null); }}
                      className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 transition-colors"
                    >
                      {isIt ? 'Password dimenticata?' : 'Forgot password?'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    id="input-auth-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs font-medium focus:outline-hidden focus:border-amber-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Action Submit button */}
            <button
              id="btn-submit-auth"
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>
                {loading ? (
                  isIt ? 'Elaborazione in corso...' : 'Processing...'
                ) : mode === 'login' ? (
                  isIt ? 'Accedi' : 'Sign In'
                ) : mode === 'register' ? (
                  isIt ? 'Completa Registrazione' : 'Complete Registration'
                ) : (
                  isIt ? 'Invia link di recupero' : 'Send Reset Link'
                )}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Back/Switch */}
          {mode === 'forgot' ? (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); }}
                className="text-xs font-semibold text-stone-600 hover:text-stone-900"
              >
                {isIt ? '← Torna al login' : '← Back to login'}
              </button>
            </div>
          ) : (
            <div className="text-center pt-2 text-xs text-stone-500">
              {mode === 'login' ? (
                <span>
                  {isIt ? 'Non hai ancora un account? ' : "Don't have an account? "}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(null); }}
                    className="font-bold text-amber-700 hover:underline"
                  >
                    {isIt ? 'Registrati subito' : 'Register now'}
                  </button>
                </span>
              ) : (
                <span>
                  {isIt ? 'Hai già un account? ' : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(null); }}
                    className="font-bold text-amber-700 hover:underline"
                  >
                    {isIt ? 'Accedi qui' : 'Log in here'}
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
