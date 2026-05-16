import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  Zap, 
  Shield, 
  Users, 
  BookOpen, 
  Globe, 
  Github, 
  Twitter, 
  Instagram,
  User,
  Home,
  LogIn,
  UserPlus,
  LayoutDashboard
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingView() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen text-[#1E293B]">
      {/* Top Navigation */}
      <nav className="h-20 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-6 lg:gap-12">
          <Link to="/" className="text-lg sm:text-xl font-bold text-[#1E3A8A] tracking-tight whitespace-nowrap">
            LUMINA
          </Link>
          <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-500">
            <Link to="/" className="text-[#1E293B] border-b-2 border-[#1E293B] pb-1">Home</Link>
            <Link to="/auth?mode=login" className="hover:text-[#1E293B] transition-colors">Login</Link>
            <Link to="/auth?mode=register" className="hover:text-[#1E293B] transition-colors">Register</Link>
            <Link to="/dashboard" className="hover:text-[#1E293B] transition-colors">Dashboard</Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative group hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search the collection..." 
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/10 w-64"
            />
          </div>
          <Link to="/profile" className="p-2 text-slate-400 hover:text-[#1E3A8A]">
            <User className="w-6 h-6" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 py-10 sm:py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6 sm:space-y-8"
        >
          <div className="space-y-3 sm:space-y-4">
            <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-[0.2em]">Establishing knowledge since 1894</span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-[#1E293B] leading-[1.1] tracking-tight">
              The Digital Curator of <span className="italic font-serif">Academic Prestige.</span>
            </h1>
          </div>
          <p className="text-slate-500 text-base sm:text-lg font-serif italic max-w-lg leading-relaxed">
            A sanctuary for scholars and bibliophiles alike. We treat every record as an exhibition, moving beyond traditional databases to provide an architectural breathing room for the world's most vital knowledge.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 sm:pt-4">
            <Link to="/catalog" className="flex-1 sm:flex-none text-center bg-[#0F172A] text-white px-6 sm:px-10 py-4 sm:py-5 rounded-md font-bold text-sm hover:bg-[#1E293B] transition-all shadow-xl shadow-slate-200">
              Explore Collections
            </Link>
            <button className="flex-1 sm:flex-none text-center bg-[#FFEDD5] text-[#9A3412] px-6 sm:px-10 py-4 sm:py-5 rounded-md font-bold text-sm hover:bg-[#FED7AA] transition-all">
              Member Services
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative pt-10 lg:pt-0"
        >
          <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-slate-300">
            <img 
              src="https://images.unsplash.com/photo-1549675584-91f19337af3d?auto=format&fit=crop&q=80&w=1200" 
              alt="Grand Library" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-4 sm:-bottom-10 sm:-left-10 bg-white p-6 sm:p-10 rounded-2xl shadow-2xl border border-slate-100 max-w-[220px] sm:max-w-[280px]">
            <p className="text-2xl sm:text-4xl font-bold text-[#1E293B] mb-2 leading-none">12M+</p>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
              Archived Scientific Manuscripts and First Editions
            </p>
          </div>
        </motion.div>
      </section>

      {/* Curated Exhibition Section */}
      <section className="bg-white py-16 sm:py-32">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-100 pb-8 gap-6">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1E293B]">Curated Exhibition</h2>
              <p className="text-slate-500 font-serif italic text-base sm:text-lg">Selected highlights from our rare manuscript and digital archives.</p>
            </div>
            <Link to="/catalog" className="text-sm font-bold text-[#1E3A8A] hover:underline uppercase tracking-wider">
              View All Collections
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Large Card */}
            <div className="lg:col-span-2 relative aspect-[16/10] sm:aspect-[16/10] rounded-3xl overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1400" 
                alt="Exhibition" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent p-6 sm:p-12 flex flex-col justify-end gap-4 sm:gap-6 text-white">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">Historical Collection</span>
                <div className="space-y-2 sm:space-y-4 max-w-xl">
                  <h3 className="text-3xl sm:text-5xl font-bold leading-tight">The Renaissance Cartography Series</h3>
                  <p className="text-slate-300 font-serif italic text-sm sm:text-lg leading-relaxed line-clamp-2 sm:line-clamp-none">
                    An unprecedented digital restoration of maritime maps from the 16th century, exploring the intersection of art and early geography.
                  </p>
                </div>
                <button className="w-fit border border-white/20 px-6 sm:px-8 py-2.5 sm:py-3 rounded-md font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all backdrop-blur-md">
                  Access Collection
                </button>
              </div>
            </div>

            {/* Small Cards Column */}
            <div className="flex flex-col gap-8">
              <div className="flex-1 bg-[#F8FAFC] border border-slate-200 rounded-3xl p-10 flex flex-col justify-between">
                <BookOpen className="w-8 h-8 text-[#1E3A8A]" />
                <div className="space-y-4">
                  <h4 className="text-2xl font-bold text-[#1E293B]">Rare Ephemera</h4>
                  <p className="text-slate-500 text-sm font-serif italic leading-relaxed">
                    Daily life recorded through letters, postcards, and journals from the industrial revolution era.
                  </p>
                  <button className="flex items-center gap-2 text-[10px] font-bold text-[#1E3A8A] uppercase tracking-widest hover:gap-4 transition-all pt-4">
                    Explore <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 relative rounded-3xl overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=800" 
                  alt="Microfilm" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/60 p-10 flex flex-col justify-end text-white backdrop-blur-[2px]">
                   <h4 className="text-2xl font-bold mb-2">The Microfilm Vault</h4>
                   <p className="text-slate-300 text-xs font-serif italic">Digital access to over 50,000 newspaper editions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-[1400px] mx-auto px-8 py-32 space-y-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-16">
            <h2 className="text-5xl font-bold text-[#1E293B] leading-tight">Academic Tools for the <span className="italic font-serif">Modern Scholar.</span></h2>
            
            <div className="space-y-12">
              {[
                { icon: Zap, title: 'Semantic Search', desc: 'Our AI-driven indexing understands context, allowing you to find concepts across disparate volumes and languages.' },
                { icon: Shield, title: 'Loan Stewardship', desc: 'Manage your physical and digital loans with a silk-ribbon progress interface that values your reading time.' },
                { icon: Users, title: 'Scholar Communities', desc: 'Connect with researchers focusing on similar niches. Private reading rooms for shared annotation and debate.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-8 group">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex-shrink-0 flex items-center justify-center text-[#2563EB] group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-3">
                    <h5 className="text-xl font-bold text-[#1E293B]">{item.title}</h5>
                    <p className="text-slate-500 font-serif italic leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
             <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl">
               <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" />
             </div>
             <div className="bg-[#1E293B] p-10 rounded-2xl flex flex-col justify-end text-white shadow-xl">
                <p className="text-xl font-serif italic leading-relaxed opacity-90 mb-6">
                  "Lumina isn't just a library; it's a structural masterpiece for the mind."
                </p>
                <div className="h-px bg-white/20 mb-6" />
                <p className="text-[10px] font-bold uppercase tracking-widest">— Dr. Alistair Thorne</p>
             </div>
             <div className="bg-[#78350F] p-10 rounded-2xl flex flex-col items-center justify-center text-white text-center shadow-xl">
                <p className="text-6xl font-bold mb-2">0%</p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Latency in Knowledge Access</p>
             </div>
             <div className="bg-[#FFE4E6] rounded-2xl overflow-hidden flex items-center justify-center p-8 shadow-xl">
                <img src="https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover rounded-xl" />
             </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 mb-32">
        <div className="bg-[#0F172A] rounded-[2rem] sm:rounded-[3rem] overflow-hidden grid grid-cols-1 lg:grid-cols-2 items-center">
          <div className="p-8 sm:p-16 lg:p-24 space-y-8 sm:space-y-10 text-white">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">Become a Steward of Knowledge.</h2>
            <p className="text-slate-400 text-lg sm:text-xl font-serif italic leading-relaxed max-w-lg">
              Join a global network of archivists, students, and lifelong learners. Start your curatorial journey today.
            </p>
            <div className="flex flex-wrap gap-4 pt-4 sm:pt-6">
              <Link to="/auth?mode=register" className="flex-1 sm:flex-none text-center bg-white text-[#0F172A] px-10 py-4 sm:py-5 rounded-md font-bold text-sm hover:bg-slate-100 transition-all">
                Create Account
              </Link>
              <button className="flex-1 sm:flex-none text-center border border-white/20 px-10 py-4 sm:py-5 rounded-md font-bold text-sm hover:bg-white/10 transition-all">
                Request Access
              </button>
            </div>
          </div>
          <div className="h-full min-h-[300px] sm:min-h-[400px]">
             <img 
               src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=1200" 
               alt="Antique Books" 
               className="w-full h-full object-cover"
             />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 pt-20 pb-10 bg-white">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="space-y-8">
              <p className="text-lg font-bold text-[#1E3A8A] tracking-tighter uppercase whitespace-nowrap">Lumina</p>
              <p className="text-slate-400 text-sm font-serif italic max-w-[200px]">
                Designed for the preservation of excellence and the advancement of human thought.
              </p>
              <div className="flex items-center gap-4 text-slate-400">
                <Globe className="w-5 h-5 hover:text-[#1E3A8A] cursor-pointer transition-colors" />
                <Twitter className="w-5 h-5 hover:text-[#1E3A8A] cursor-pointer transition-colors" />
                <Instagram className="w-5 h-5 hover:text-[#1E3A8A] cursor-pointer transition-colors" />
              </div>
            </div>

            {[
              { title: 'Collection', links: ['Rare Manuscripts', 'Digital Repositories', 'Open Access'] },
              { title: 'System', links: ['API Documentation', 'Institutional Login', 'Status'] },
              { title: 'Company', links: ['Mission', 'Ethics', 'Privacy'] }
            ].map((col) => (
              <div key={col.title} className="space-y-6">
                <h6 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E293B]">{col.title}</h6>
                <ul className="space-y-4 text-sm text-slate-500 font-medium">
                  {col.links.map(l => (
                    <li key={l}><a href="#" className="hover:text-[#2563EB] transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="pt-10 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              © 2026 Lumina. All Rights Reserved.
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
              Hand-curated digital experiences.
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navbar (Landing Page Only) */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 bg-slate-900 border border-white/10 px-6 py-4 z-50 rounded-2xl flex items-center justify-between shadow-2xl backdrop-blur-xl">
        <Link to="/" className="flex flex-col items-center gap-1 group">
          <Home className="w-5 h-5 text-white" />
          <span className="text-[9px] font-bold text-white uppercase tracking-widest">Home</span>
        </Link>
        <Link to="/auth?mode=login" className="flex flex-col items-center gap-1 group">
          <LogIn className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-white">Login</span>
        </Link>
        <Link to="/auth?mode=register" className="flex flex-col items-center gap-1 group">
          <UserPlus className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-white">Join</span>
        </Link>
        <Link to="/dashboard" className="flex flex-col items-center gap-1 group">
          <LayoutDashboard className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-white">Dash</span>
        </Link>
      </div>
    </div>
  );
}
