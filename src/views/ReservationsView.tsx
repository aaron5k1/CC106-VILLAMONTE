import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Reservation, UserProfile } from '../types';
import { libraryService } from '../services/libraryService';
import { formatDate, cn } from '../lib/utils';
import { 
  Calendar, 
  Clock, 
  Trash2, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Search,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReservationsViewProps {
  userProfile: UserProfile | null;
}

export default function ReservationsView({ userProfile }: ReservationsViewProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile) {
      loadReservations();
    }
  }, [userProfile]);

  const loadReservations = async () => {
    if (!userProfile) return;
    setLoading(true);
    const data = await libraryService.getUserReservations(userProfile.uid);
    setReservations(data);
    setLoading(false);
  };

  const handleCancel = async (id: string) => {
    if (window.confirm('Verify: Do you wish to withdraw your claim to this volume?')) {
      try {
        await libraryService.cancelReservation(id);
        await loadReservations();
      } catch (e: any) {
        console.error('Cancel failed:', e);
        alert('Archival Error: ' + (e.message || 'The request could not be processed.'));
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Archive Maintenance: Purge this record from your history?')) {
      try {
        console.log('Attempting to delete reservation:', id);
        await libraryService.deleteReservation(id);
        await loadReservations();
      } catch (e: any) {
        console.error('Delete failed:', e);
        const errorMsg = typeof e === 'string' ? e : (e.message || 'Permission denied. This record may be protected.');
        alert('Archive Error: ' + errorMsg);
      }
    }
  };

  const getStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'fulfilled': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'cancelled': return 'bg-slate-50 text-slate-400 border-slate-100';
      case 'expired': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusIcon = (status: Reservation['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-3.5 h-3.5" />;
      case 'fulfilled': return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'cancelled': return <Trash2 className="w-3.5 h-3.5" />;
      case 'expired': return <AlertCircle className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-[#2563EB] rounded-full animate-spin"></div>
      </div>
    );
  }

  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const pastReservations = reservations.filter(r => r.status !== 'pending');

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 pb-24">
      {/* Header Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-100 pb-8">
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-[0.2em]">Queue Management</span>
            <h1 className="text-4xl sm:text-5xl font-bold text-[#1E293B] tracking-tight">Reservations</h1>
            <p className="text-slate-500 font-serif italic text-lg max-w-2xl">
              Securing your place in the lineage of knowledge. Track holds for restricted volumes and high-demand first editions.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-w-[200px]">
            <p className="text-2xl font-bold text-[#1E293B] mb-1">{pendingReservations.length}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Requests</p>
          </div>
        </div>
      </section>

      {/* Active Reservations */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#1E293B]">Pending Holds</h2>
          <div className="h-px flex-1 bg-slate-100 mx-8 hidden sm:block"></div>
        </div>

        {pendingReservations.length === 0 ? (
          <div className="bg-[#F8FAFC] border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
              <Calendar className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-[#1E293B] mb-2">No active reservations</h3>
            <p className="text-slate-500 font-serif italic max-w-sm mx-auto">
              Your waitlist is empty. Explore the catalog to reserve upcoming available records.
            </p>
            <Link 
              to="/catalog" 
              className="mt-8 bg-[#0F172A] text-white px-8 py-4 rounded-md font-bold text-sm hover:bg-[#1E293B] transition-all shadow-xl shadow-slate-200 inline-flex items-center gap-2"
            >
              Explore Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <AnimatePresence mode="popLayout">
              {pendingReservations.map((res) => (
                <motion.div
                  key={res.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl border border-slate-200 p-6 flex gap-6 shadow-sm group hover:shadow-md transition-all relative overflow-hidden"
                >
                  <div className="w-32 h-44 bg-slate-100 rounded-lg overflow-hidden shadow-lg shrink-0">
                    <img 
                      src={res.bookCoverUrl || `https://picsum.photos/seed/${res.bookId}/400/600`} 
                      alt={res.bookTitle} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5",
                          getStatusColor(res.status)
                        )}>
                          {getStatusIcon(res.status)}
                          {res.status}
                        </span>
                        <button 
                          onClick={() => handleDelete(res.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Purge Reservation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="text-xl font-bold text-[#1E293B] leading-tight group-hover:text-[#2563EB] transition-colors">{res.bookTitle}</h3>
                      <p className="text-slate-500 font-serif italic text-sm">{res.bookAuthor}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        Requested {formatDate(res.requestDate)}
                      </div>
                      <div className="bg-slate-50 px-3 py-1 rounded-lg">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority #{Math.floor(Math.random() * 5) + 1}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* History Section */}
      {pastReservations.length > 0 && (
        <section className="space-y-8 pt-12 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#1E293B]">Request History</h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest w-1/2">Collection Item</th>
                    <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Requested</th>
                    <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Outcome</th>
                    <th className="px-8 py-5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pastReservations.map((res) => (
                    <tr key={res.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-14 bg-slate-100 rounded overflow-hidden shrink-0 shadow-sm">
                            <img 
                              src={res.bookCoverUrl || `https://picsum.photos/seed/${res.bookId}/400/600`} 
                              alt={res.bookTitle} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-[#1E293B] text-sm group-hover:text-[#2563EB] transition-colors">{res.bookTitle}</p>
                            <p className="text-slate-400 text-xs font-serif italic truncate max-w-xs">{res.bookAuthor}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-medium text-slate-500">
                        {formatDate(res.requestDate)}
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1.5",
                          getStatusColor(res.status)
                        )}>
                          {getStatusIcon(res.status)}
                          {res.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => handleDelete(res.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Purge Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Aesthetic Footer Widget */}
      <section className="bg-[#0F172A] rounded-[3rem] p-12 sm:p-20 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <BookOpen className="w-12 h-12 text-[#2563EB] mb-8" />
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 italic font-serif leading-tight">
            "The hold is not just a wait, but an anticipation of arrival."
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-8 font-serif italic opacity-80">
            Our reservation system prioritizes long-standing scholars and members of the Lumina Society. Every hold is verified by our archival staff to ensure the integrity of our most sensitive collections.
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white/40" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-widest uppercase mb-1">Guaranteed Priority</p>
              <p className="text-xs text-slate-500">Archival verification in progress</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/3 opacity-10 pointer-events-none hidden lg:block">
          <Calendar className="w-full h-full text-white rotate-12 transform translate-x-1/4" />
        </div>
      </section>
    </div>
  );
}
