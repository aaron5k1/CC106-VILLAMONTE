import React from 'react';
import { UserProfile } from '../types';
import { motion } from 'framer-motion';

interface SettingsViewProps {
  userProfile: UserProfile | null;
}

export default function SettingsView({ userProfile }: SettingsViewProps) {
  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [privacyMode, setPrivacyMode] = React.useState(false);
  const [interfaceSize, setInterfaceSize] = React.useState('Standard');

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-24">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-[#1E293B]">Library Preferences</h1>
        <p className="text-slate-500 font-serif italic text-lg">Customize your scholarly environment and notification protocols.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-8">
          <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-50">
              <h3 className="text-lg font-bold text-[#1E293B]">Communication</h3>
            </div>
            <div className="divide-y divide-slate-50">
              <div className="p-8 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1">
                  <p className="font-bold text-[#1E293B]">Archival Alerts</p>
                  <p className="text-sm text-slate-500 max-w-sm">Receive immediate notifications when reserved volumes return to the collection.</p>
                </div>
                <button 
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={`w-14 h-8 rounded-full relative transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100 ${emailAlerts ? 'bg-[#2563EB]' : 'bg-slate-200'}`}
                >
                  <motion.div 
                    initial={false}
                    animate={{ x: emailAlerts ? 24 : 4 }}
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md" 
                  />
                </button>
              </div>
              <div className="p-8 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1">
                  <p className="font-bold text-[#1E293B]">Monthly Digest</p>
                  <p className="text-sm text-slate-500 max-w-sm">A curated summary of new additions to the Lumina archive.</p>
                </div>
                <div className="w-14 h-8 bg-slate-100 rounded-full cursor-not-allowed opacity-50 flex items-center px-1">
                   <div className="w-6 h-6 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-50">
              <h3 className="text-lg font-bold text-[#1E293B]">Privacy & Data</h3>
            </div>
            <div className="p-8 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">
              <div className="space-y-1">
                <p className="font-bold text-[#1E293B]">Scholarly Anonymity</p>
                <p className="text-sm text-slate-500 max-w-sm">Hide your current reading progress and loan history from the public member directory.</p>
              </div>
              <button 
                onClick={() => setPrivacyMode(!privacyMode)}
                className={`w-14 h-8 rounded-full relative transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100 ${privacyMode ? 'bg-[#2563EB]' : 'bg-slate-200'}`}
              >
                <motion.div 
                  initial={false}
                  animate={{ x: privacyMode ? 24 : 4 }}
                  className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md" 
                />
              </button>
            </div>
          </section>
        </div>

        <aside className="space-y-8">
           <div className="bg-[#0F172A] rounded-3xl p-8 text-white space-y-6 shadow-xl shadow-slate-200">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Archival Status</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Tier</span>
                    <span className="font-bold">Eldritch Scholar</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Quota</span>
                    <span className="font-bold">12 / ∞</span>
                 </div>
                 <div className="pt-4 border-t border-white/10">
                    <button className="w-full py-3 bg-white/10 hover:bg-white hover:text-[#0F172A] rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
                       Upgrade Membership
                    </button>
                 </div>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}
