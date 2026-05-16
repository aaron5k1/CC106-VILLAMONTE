import React from 'react';
import { Book, UserProfile } from '../types';
import { libraryService } from '../services/libraryService';
import BookCard from '../components/BookCard';
import { Search, SlidersHorizontal, BookOpen, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { geminiService } from '../services/geminiService';
import { cn } from '../lib/utils';

interface CatalogViewProps {
  userProfile: UserProfile | null;
}

export default function CatalogView({ userProfile }: CatalogViewProps) {
  const [books, setBooks] = React.useState<Book[]>([]);
  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [borrowingId, setBorrowingId] = React.useState<string | null>(null);
  const [reservingId, setReservingId] = React.useState<string | null>(null);
  const [userReservations, setUserReservations] = React.useState<string[]>([]);
  const [recommendations, setRecommendations] = React.useState<string[]>([]);
  const [isRecommending, setIsRecommending] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<'title' | 'author' | 'newest'>('title');

  // Derive unique categories
  const categories = React.useMemo(() => {
    const cats = new Set(books.map(b => b.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [books]);

  React.useEffect(() => {
    loadBooks();
    if (userProfile) {
      loadUserReservations();
    }
  }, [userProfile]);

  const loadUserReservations = async () => {
    if (!userProfile) return;
    const res = await libraryService.getUserReservations(userProfile.uid);
    setUserReservations(res.filter(r => r.status === 'pending').map(r => r.bookId));
  };

  const loadBooks = async () => {
    setLoading(true);
    try {
      let data = await libraryService.getBooks();
      
      // Auto-seed if empty and user is admin
      if (data.length === 0 && (userProfile?.role === 'admin' || userProfile?.email === 'aaronjamesvillamonte@gmail.com')) {
        await libraryService.seedBooks();
        data = await libraryService.getBooks();
      }
      
      setBooks(data);
    } catch (error) {
      console.error("Failed to load books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    await libraryService.seedBooks();
    await loadBooks();
  };

  const handleGetRecommendations = async () => {
    if (!userProfile) return;
    setIsRecommending(true);
    try {
      const userLoans = await libraryService.getUserLoans(userProfile.uid);
      const history = userLoans.map(l => l.bookTitle || '');
      const recs = await geminiService.getRecommendations(books, history);
      setRecommendations(recs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRecommending(false);
    }
  };

  const handleBorrow = async (book: Book) => {
    if (!userProfile) return;
    setBorrowingId(book.id);
    try {
      await libraryService.borrowBook(userProfile.uid, book);
      await loadBooks(); // Refresh
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBorrowingId(null);
    }
  };

  const handleReserve = async (book: Book) => {
    if (!userProfile) return;
    setReservingId(book.id);
    try {
      await libraryService.reserveBook(userProfile.uid, book);
      alert('Hold request secured. You will be notified when this volume returns to the archive.');
      await Promise.all([
        loadBooks(),
        loadUserReservations()
      ]);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setReservingId(null);
    }
  };

  const filteredBooks = books
    .filter(b => {
      const searchLower = search.toLowerCase().trim();
      const matchesSearch = !searchLower || 
        b.title.toLowerCase().includes(searchLower) ||
        b.author.toLowerCase().includes(searchLower) ||
        (b.category || '').toLowerCase().includes(searchLower);
      
      const matchesCategory = !selectedCategory || b.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'author') return a.author.localeCompare(b.author);
      if (sortBy === 'newest') {
        const dateA = a.createdAt?.toMillis?.() || 0;
        const dateB = b.createdAt?.toMillis?.() || 0;
        return dateB - dateA;
      }
      return 0;
    });

  const isAdmin = userProfile?.role === 'admin' || userProfile?.email === 'aaronjamesvillamonte@gmail.com';

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 pb-12">
      {/* Search & AI Section */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 flex flex-col lg:flex-row gap-10 items-center justify-between shadow-sm">
        <div className="flex-1 space-y-4 w-full">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1E293B] tracking-tight">Explore the Collection</h1>
          <p className="text-slate-500 font-serif italic text-base sm:text-lg">
            Curated wisdom from across centuries. Find your next scholarly pursuit.
          </p>
          
          {isAdmin && books.length === 0 && (
            <div className="p-5 bg-[#2563EB]/5 border border-[#2563EB]/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="text-center sm:text-left">
                <p className="text-sm font-bold text-[#1E293B]">Collector's Privilege Enabled</p>
                <p className="text-xs text-slate-500 font-serif italic">Archive appears empty. Populate it with curated volumes (Dune, Gatsby, etc.)?</p>
              </div>
              <button 
                onClick={handleSeed}
                className="px-6 py-2 bg-[#0F172A] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#1E293B] transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                Initialize archive
              </button>
            </div>
          )}

          <div className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#2563EB] transition-colors" />
                 <input
                   type="text"
                   placeholder="Search titles, authors, categories..."
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   className="w-full h-14 pl-12 pr-12 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:bg-white transition-all font-medium text-[#1E293B]"
                 />
                 {search && (
                   <button 
                     onClick={() => setSearch('')}
                     className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition-colors"
                   >
                     <X className="w-4 h-4 text-slate-400" />
                   </button>
                 )}
              </div>
              <button 
                onClick={handleGetRecommendations}
                disabled={isRecommending || books.length === 0}
                className="px-8 h-14 bg-[#0F172A] text-white rounded-xl font-bold hover:bg-[#1E293B] transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 disabled:opacity-50"
              >
                <Sparkles className={cn("w-5 h-5 text-yellow-400", isRecommending && "animate-spin")} />
                {isRecommending ? 'Analyzing...' : 'AI Recommendations'}
              </button>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border",
                  !selectedCategory 
                    ? "bg-[#2563EB] text-white border-[#2563EB] shadow-md shadow-blue-100" 
                    : "bg-white text-slate-500 border-slate-200 hover:border-[#2563EB] hover:text-[#2563EB]"
                )}
              >
                All Volumes
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border",
                    selectedCategory === cat
                      ? "bg-[#2563EB] text-white border-[#2563EB] shadow-md shadow-blue-100"
                      : "bg-white text-slate-500 border-slate-200 hover:border-[#2563EB] hover:text-[#2563EB]"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <AnimatePresence>
          {recommendations.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:w-96 p-8 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden"
            >
               <div className="flex justify-between items-center mb-6">
                 <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-widest">Recommended for you</span>
                 <button onClick={() => setRecommendations([])} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                   <X className="w-3 h-3 text-slate-400" />
                 </button>
               </div>
               <div className="space-y-3">
                 {recommendations.map((rec, i) => (
                   <div key={i} className="flex items-center gap-3 group cursor-default">
                      <div className="w-1.5 h-1.5 bg-[#2563EB] rounded-full opacity-40 group-hover:opacity-100 transition-opacity" />
                      <span className="text-sm font-bold text-[#1E293B]">{rec}</span>
                   </div>
                 ))}
               </div>
               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <Sparkles className="w-16 h-16 text-slate-900" />
               </div>
            </motion.div>
          ) : (
            <div className="hidden lg:flex w-96 h-48 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-2xl items-center justify-center text-center p-8">
              <p className="text-slate-300 font-serif italic text-sm">
                Connect your reading history for personalized recommendations.
              </p>
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* Catalog Grid */}
      <section className="space-y-8">
         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-6 border-b border-slate-100">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-[#1E293B]">Available Volumes</h2>
              <p className="text-slate-500 font-serif italic text-sm">Browsing through {filteredBooks.length} items</p>
            </div>
            <div className="flex-1 hidden sm:block" />
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative group w-full sm:w-48">
                <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full h-11 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#2563EB]/10 transition-all appearance-none cursor-pointer"
                >
                  <option value="title">Sort by Title</option>
                  <option value="author">Sort by Author</option>
                  <option value="newest">Sort by Newest</option>
                </select>
              </div>
            </div>
         </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="aspect-[3/4] bg-slate-100 rounded-2xl" />
                <div className="h-6 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-center space-y-6">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                <Search className="w-10 h-10" />
             </div>
             <div>
               <h3 className="text-2xl font-bold text-[#1E293B]">No volumes found</h3>
               <p className="text-slate-400 font-serif italic max-w-md mx-auto">
                 We couldn't find any books matching your search. Try different keywords or browse our categories.
               </p>
             </div>
             <button onClick={() => setSearch('')} className="text-[#2563EB] font-bold hover:underline">
               Clear search filters
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredBooks.map((b: Book) => (
                <BookCard
                  key={b.id}
                  book={b}
                  onBorrow={handleBorrow}
                  onReserve={handleReserve}
                  isLoading={borrowingId === b.id || reservingId === b.id}
                  isReserved={userReservations.includes(b.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}
