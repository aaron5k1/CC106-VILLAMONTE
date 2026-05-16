import { Link, useLocation } from 'react-router-dom';
import { 
  AlertTriangle, 
  Clock, 
  History, 
  BookOpen, 
  ArrowRight, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isBefore, differenceInDays } from 'date-fns';
import React from 'react';
import { Loan, UserProfile } from '../types';
import { libraryService } from '../services/libraryService';
import { formatDate } from '../lib/utils';

interface MyBooksViewProps {
  userProfile: UserProfile | null;
}

export default function MyBooksView({ userProfile }: MyBooksViewProps) {
  const [loans, setLoans] = React.useState<Loan[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [returningId, setReturningId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (userProfile) {
      loadLoans();
    }
  }, [userProfile]);

  const loadLoans = async () => {
    if (!userProfile) return;
    setLoading(true);
    const data = await libraryService.getUserLoans(userProfile.uid);
    setLoans(data);
    setLoading(false);
  };

  const handleReturn = async (loan: Loan) => {
    setReturningId(loan.id);
    try {
      await libraryService.returnBook(loan);
      await loadLoans();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setReturningId(null);
    }
  };

  const historyRef = React.useRef<HTMLDivElement>(null);

  const activeLoans = loans.filter(l => l.status === 'active');
  const pastLoans = loans.filter(l => l.status === 'returned');

  const scrollToHistory = () => {
    historyRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const overdueLoans = activeLoans.filter(l => isBefore(l.dueDate.toDate(), new Date()));
  const currentLoans = activeLoans.filter(l => !isBefore(l.dueDate.toDate(), new Date()));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#2563EB] rounded-full animate-spin" />
          <p className="text-slate-500 font-medium font-serif italic">Accessing Lumina...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 pb-12">
      {/* Overdue Items Section */}
      {overdueLoans.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="bg-[#FEF2F2] text-[#EF4444] text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm">
                Urgent Attention
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1E293B]">Overdue Items</h2>
            </div>
            <div className="flex items-center gap-2 text-[#EF4444] font-bold text-xs sm:text-sm bg-red-50 px-4 py-2 rounded-lg border border-red-100 w-fit">
              <AlertTriangle className="w-4 h-4" />
              <span>{overdueLoans.length} items require return</span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {overdueLoans.map((loan) => (
              <motion.div
                key={loan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-full sm:w-48 h-64 sm:h-64 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden shadow-lg group-hover:scale-[1.02] transition-transform">
                  <img 
                    src={loan.bookCoverUrl || `https://picsum.photos/seed/${loan.bookId}/400/600`} 
                    alt={loan.bookTitle} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl sm:text-3xl font-bold text-[#1E293B] leading-tight line-clamp-2">{loan.bookTitle}</h3>
                    <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ml-2">LATE</span>
                  </div>
                  <p className="text-slate-500 font-medium mb-6 font-serif italic">{loan.bookAuthor || 'Unknown Author'}</p>
                  
                  <div className="mt-auto space-y-4">
                    <div className="flex items-center gap-2 text-[#EF4444] font-bold border-t border-slate-100 pt-4">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Due: {formatDate(loan.dueDate)}</span>
                    </div>
                    <button
                      onClick={() => handleReturn(loan)}
                      disabled={returningId === loan.id}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-bold transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {returningId === loan.id ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <RotateCcw className="w-4 h-4" />
                          Return Immediately
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Current Collection Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1E293B]">Current Collection</h2>
            <p className="text-slate-500 font-serif italic">Books in your care</p>
          </div>
          <div className="bg-slate-100 px-4 py-1.5 rounded-md w-fit">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{activeLoans.length} Items Active</span>
          </div>
        </div>

        {currentLoans.length === 0 ? (
          <div className="py-20 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center bg-white text-center px-6">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-serif italic text-lg mb-6">No active books in your collection.</p>
            <Link to="/" className="bg-[#0F172A] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#1E293B] transition-all shadow-lg shadow-slate-200">
              Browse the Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentLoans.map((loan) => {
              const daysLeft = differenceInDays(loan.dueDate.toDate(), new Date());
              return (
                <motion.div
                  key={loan.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group relative"
                >
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <img 
                      src={loan.bookCoverUrl || `https://picsum.photos/seed/${loan.bookId}/400/600`} 
                      alt={loan.bookTitle} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/90 backdrop-blur-md text-[#1E293B] text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm border border-slate-200/50">
                        {daysLeft} Days Left
                      </span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="min-h-[4rem]">
                      <h3 className="text-lg font-bold text-[#1E293B] leading-tight line-clamp-2">{loan.bookTitle}</h3>
                      <p className="text-slate-500 text-sm font-serif italic mt-1">{loan.bookAuthor}</p>
                    </div>
                    
                    <div className="flex flex-col gap-2 pt-4 border-t border-slate-50">
                      <Link 
                        to={`/read/${loan.id}`}
                        className="w-full bg-[#0F172A] text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#1E293B] transition-all flex items-center justify-center gap-2"
                      >
                        <BookOpen className="w-4 h-4" />
                        Read Volume
                      </Link>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Return By</span>
                          <p className="text-sm font-bold text-[#1E293B]">{formatDate(loan.dueDate)}</p>
                        </div>
                        <button 
                          onClick={() => handleReturn(loan)}
                          disabled={returningId === loan.id}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          title="Return Book"
                        >
                           <RotateCcw className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Reading History Section */}
      <section ref={historyRef} className="space-y-8 pt-12 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1E293B]">Reading History</h2>
            <p className="text-slate-500 font-serif italic text-base">Your completed scholarly pursuits</p>
          </div>
          <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-md w-fit border border-emerald-100">
            <span className="text-[10px] font-bold uppercase tracking-widest">{pastLoans.length} Volumes Completed</span>
          </div>
        </div>

        {pastLoans.length === 0 ? (
          <div className="py-20 bg-slate-50 rounded-3xl flex flex-col items-center justify-center text-center px-6">
            <History className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 font-serif italic text-lg">No history recorded in the archives yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-[#A39E93]">Volume</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-[#A39E93]">Borrowed</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-[#A39E93]">Returned</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-[#A39E93]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pastLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img src={loan.bookCoverUrl} alt="" className="w-10 h-14 object-cover rounded shadow-sm" />
                          <div>
                            <div className="font-bold text-[#1E293B] text-sm">{loan.bookTitle}</div>
                            <div className="text-xs text-slate-400 font-serif italic">{loan.bookAuthor}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-500">{formatDate(loan.borrowDate)}</td>
                      <td className="px-8 py-6 text-sm text-slate-500">{formatDate(loan.returnDate)}</td>
                      <td className="px-8 py-6">
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                           <CheckCircle2 className="w-3 h-3" />
                           Returned
                         </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Footer Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
        {/* Reading Progress Widget */}
        <div className="lg:col-span-2 bg-[#F8FAFC] border border-slate-200 rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row items-start gap-8 sm:gap-12 relative overflow-hidden group">
          <div className="flex-1 space-y-6 relative z-10 w-full">
            <h3 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">Reading Progress</h3>
            <p className="text-slate-500 font-serif italic text-base sm:text-lg leading-relaxed max-w-md">
              You've completed {pastLoans.length} books this year. You are currently in the top 5% of our active researchers.
            </p>
            <div className="pt-4 sm:pt-8 w-full">
              <div className="flex items-end justify-between mb-4">
                <span className="text-5xl sm:text-7xl font-bold text-[#1E293B]">84%</span>
                <span className="text-[10px] sm:text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 sm:mb-4">Yearly Goal</span>
              </div>
              <div className="h-2.5 sm:h-3 bg-slate-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '84%' }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-[#1E293B]" 
                />
              </div>
            </div>
          </div>
          <div className="hidden lg:block opacity-10 group-hover:opacity-20 transition-opacity">
            <BookOpen className="w-48 h-48 sm:w-64 sm:h-64 text-slate-900" />
          </div>
        </div>

        {/* Loan History Widget */}
        <div className="bg-[#0F172A] rounded-3xl p-8 sm:p-10 flex flex-col justify-between text-white relative overflow-hidden group min-h-[250px]">
           <div className="space-y-4 relative z-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <History className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold">Loan History</h3>
              <p className="text-slate-400 font-serif italic text-base sm:text-lg opacity-80">
                Review your past explorations and scholarly references.
              </p>
           </div>
           
           <div className="relative z-10">
             <button 
               onClick={scrollToHistory}
               className="flex items-center gap-2 font-bold hover:gap-4 transition-all"
             >
               <span>View History</span>
               <ArrowRight className="w-5 h-5" />
             </button>
           </div>

           {/* Decorative circles */}
           <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all" />
           <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        </div>
      </div>
    </div>
  );
}
