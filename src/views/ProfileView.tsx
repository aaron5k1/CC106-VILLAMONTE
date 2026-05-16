import React from 'react';
import { UserProfile } from '../types';
import { User, Mail, Shield, ShieldCheck, MapPin, Calendar, Camera, Edit3, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../lib/utils';
import { libraryService } from '../services/libraryService';

interface ProfileViewProps {
  userProfile: UserProfile | null;
}

export default function ProfileView({ userProfile }: ProfileViewProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [displayName, setDisplayName] = React.useState(userProfile?.displayName || '');
  const [isSaving, setIsSaving] = React.useState(false);

  if (!userProfile) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await libraryService.ensureUserProfile({ ...userProfile, displayName });
      setIsEditing(false);
      window.location.reload(); // Refresh to show new name in Layout
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Edit Overlay */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-10"
            >
              <h2 className="text-2xl font-bold text-[#1E293B] mb-6 font-serif italic">Refine Identity</h2>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Public Display Name</label>
                  <input 
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2563EB]/20 focus:bg-white transition-all font-medium"
                    placeholder="Enter your scholarly name"
                  />
                </div>
                <div className="flex gap-4">
                  <button 
                    disabled={isSaving}
                    type="submit" 
                    className="flex-1 bg-[#0F172A] text-white py-4 rounded-xl font-bold hover:bg-[#1E293B] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    Sync Archives
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Cover/Header Section */}
      <div className="relative h-48 bg-[#0F172A] rounded-3xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,rgba(37,99,235,0.4),transparent)]" />
        </div>
      </div>

      <div className="px-4 sm:px-8 -mt-16 sm:-mt-20 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8 text-center md:text-left">
          <div className="relative group">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl border-4 border-white bg-slate-100 overflow-hidden shadow-xl shadow-slate-200 ring-1 ring-slate-100">
              {userProfile.photoURL ? (
                <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#2563EB] text-4xl sm:text-5xl font-bold bg-[#EFF6FF]">
                  {userProfile.displayName?.charAt(0)}
                </div>
              )}
            </div>
            <button className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-2 sm:p-2.5 bg-white rounded-xl border border-slate-200 shadow-md text-slate-600 hover:text-[#2563EB] transition-all transform hover:scale-110">
              <Camera className="w-4 h-4 sm:w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 pb-0 sm:pb-4">
            <div className="flex flex-col md:flex-row items-center gap-3 mb-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">{userProfile.displayName}</h2>
              {userProfile.role === 'admin' && (
                <span className="bg-blue-100 text-[#2563EB] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                  <ShieldCheck className="w-3 h-3" /> Staff
                </span>
              )}
            </div>
            <p className="text-slate-500 font-serif italic text-base sm:text-lg">{userProfile.email}</p>
          </div>

          <div className="pb-0 sm:pb-4">
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-8">
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-[#1E293B] border-b border-slate-50 pb-4">Personal Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                  <div className="flex items-center gap-3 text-[#1E293B] font-medium">
                    <User className="w-4 h-4 text-slate-300" />
                    {userProfile.displayName}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                  <div className="flex items-center gap-3 text-[#1E293B] font-medium">
                    <Mail className="w-4 h-4 text-slate-300" />
                    {userProfile.email}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Library Location</label>
                  <div className="flex items-center gap-3 text-[#1E293B] font-medium">
                    <MapPin className="w-4 h-4 text-slate-300" />
                    Central Archive, Wing A
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Member Since</label>
                  <div className="flex items-center gap-3 text-[#1E293B] font-medium">
                    <Calendar className="w-4 h-4 text-slate-300" />
                    May 2026
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-[#1E293B] border-b border-slate-50 pb-4 mb-6">Security</h3>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 text-[#2563EB]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1E293B]">Multi-Factor Authentication</p>
                    <p className="text-xs text-slate-500">Add an extra layer of security to your account.</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-[#2563EB] hover:underline uppercase tracking-wider">Enable</button>
              </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <section className="bg-[#F8FAFC] border border-slate-200 rounded-3xl p-8 space-y-6">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-4">Scholarly Achievements</h3>
              
              <div className="space-y-4">
                {[
                  { label: 'Avid Reader', desc: 'Read 5 books in a month', icon: '📚', color: 'bg-amber-100' },
                  { label: 'Archivist', desc: 'Cataloged 10 references', icon: '📎', color: 'bg-emerald-100' },
                  { label: 'Early Bird', desc: 'Returned 10 books on time', icon: '☀️', color: 'bg-blue-100' },
                ].map((badge) => (
                  <div key={badge.label} className="flex items-center gap-4 group">
                    <div className={`w-12 h-12 ${badge.color} rounded-2xl flex items-center justify-center text-xl shadow-sm border border-white group-hover:scale-110 transition-transform`}>
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#1E293B]">{badge.label}</p>
                      <p className="text-[10px] text-slate-500 font-serif italic">{badge.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="bg-[#1E3A8A] rounded-3xl p-8 text-white relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold">Trusted Scholar</h3>
                <p className="text-sm text-blue-100 opacity-80 leading-relaxed font-serif italic">
                  Your current standing is excellent. You have priority access to rare manuscripts.
                </p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
