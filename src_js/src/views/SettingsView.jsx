import React from 'react';
import { motion } from 'framer-motion';
export default function SettingsView({ userProfile }) {
    const [emailAlerts, setEmailAlerts] = React.useState(true);
    const [privacyMode, setPrivacyMode] = React.useState(false);
    const [interfaceSize, setInterfaceSize] = React.useState('Standard');
    return (<div className="max-w-3xl mx-auto space-y-12 pb-24">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-[#1E293B]">Library Preferences</h1>
        <p className="text-slate-500 font-serif italic text-lg">Customize your scholarly environment and notification protocols.</p>
      </div>

      <div className="space-y-8">
        <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-50">
            <h3 className="text-lg font-bold text-[#1E293B]">Communication</h3>
          </div>
          <div className="divide-y divide-slate-50">
            <div className="p-8 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">
              <div className="space-y-1">
                <p className="font-bold text-[#1E293B]">Library Alerts</p>
                <p className="text-sm text-slate-500 max-w-sm">Receive immediate notifications when volumes in the collection are updated or added.</p>
              </div>
              <button onClick={() => setEmailAlerts(!emailAlerts)} className={`w-14 h-8 rounded-full relative transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100 ${emailAlerts ? 'bg-[#2563EB]' : 'bg-slate-200'}`}>
                <motion.div initial={false} animate={{ x: emailAlerts ? 24 : 4 }} className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"/>
              </button>
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
            <button onClick={() => setPrivacyMode(!privacyMode)} className={`w-14 h-8 rounded-full relative transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100 ${privacyMode ? 'bg-[#2563EB]' : 'bg-slate-200'}`}>
              <motion.div initial={false} animate={{ x: privacyMode ? 24 : 4 }} className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"/>
            </button>
          </div>
        </section>
      </div>
    </div>);
}
