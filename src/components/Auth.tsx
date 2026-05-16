import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { Library, Chrome, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

type AuthMode = 'login' | 'register';

export default function AuthScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialMode = (queryParams.get('mode') as AuthMode) || 'login';

  const [mode, setMode] = React.useState<AuthMode>(initialMode);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Synchronize mode if query param changes
  React.useEffect(() => {
    const m = queryParams.get('mode') as AuthMode;
    if (m && (m === 'login' || m === 'register')) {
      setMode(m);
    }
  }, [location.search]);

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    navigate(`/auth?mode=${newMode}`, { replace: true });
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'register') {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white border border-[#E5E1DA] rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-[#F27D26]/5 overflow-hidden"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-[#F27D26] rounded-[1.5rem] mb-6">
            <Library className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#141414] uppercase">Lumina</h1>
          <p className="text-[#7B746B] italic font-serif text-sm">Access the collective wisdom of the ages.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#F8F7F4] p-1 rounded-2xl border border-[#E5E1DA] mb-8">
          {(['login', 'register'] as AuthMode[]).map((tab) => (
            <button
              key={tab}
              onClick={() => switchMode(tab)}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                mode === tab ? "bg-white text-[#F27D26] shadow-sm" : "text-[#A39E93] hover:text-[#7B746B]"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-8">
          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A39E93]" />
                <input
                  required
                  type="text"
                  placeholder="Full Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#F8F7F4] border-none rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#F27D26]/30 transition-all"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A39E93]" />
            <input
              required
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F8F7F4] border-none rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#F27D26]/30 transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A39E93]" />
            <input
              required
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F8F7F4] border-none rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#F27D26]/30 transition-all"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 font-medium px-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#141414] hover:bg-[#F27D26] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 group"
          >
            {loading ? 'Authenticating...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E5E1DA]"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold"><span className="bg-white px-4 text-[#A39E93]">Or continue with</span></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-[#E5E1DA] hover:bg-[#F8F7F4] text-[#141414] py-4 rounded-2xl font-bold transition-all disabled:opacity-50"
        >
          <Chrome className="w-5 h-5" />
          Google Account
        </button>
      </motion.div>
    </div>
  );
}
