import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { libraryService } from '../services/libraryService';
import { Book, Loan, UserProfile } from '../types';
import { 
  ChevronLeft, 
  Settings, 
  Bookmark, 
  Type, 
  Moon, 
  Sun, 
  Maximize2,
  ChevronRight,
  Clock,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ReaderViewProps {
  userProfile: UserProfile | null;
}

export default function ReaderView({ userProfile }: ReaderViewProps) {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    async function loadContent() {
      if (!loanId) return;
      setLoading(true);
      const loanData = await libraryService.getLoan(loanId);
      if (loanData && loanData.status === 'active') {
        setLoan(loanData);
        setProgress(loanData.readingProgress || 0);
        // In a real app, we'd fetch the book details too
        const books = await libraryService.getBooks();
        const bookData = books.find(b => b.id === loanData.bookId);
        if (bookData) setBook(bookData);
      } else {
        navigate('/my-books');
      }
      setLoading(false);
    }
    loadContent();
  }, [loanId, navigate]);

  const handleUpdateProgress = async (newProgress: number) => {
    if (!loanId) return;
    const clampedProgress = Math.min(100, Math.max(0, newProgress));
    setProgress(clampedProgress);
    await libraryService.updateReadingProgress(loanId, clampedProgress);
  };

  const handleNextChapter = () => {
    const nextProgress = Math.min(100, progress + Math.floor(Math.random() * 10) + 5);
    handleUpdateProgress(nextProgress);
    if (nextProgress >= 100) {
      alert('You have completed this volume. Knowledge verified.');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-[60] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#2563EB] rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 font-serif italic">Unrolling the manuscript...</p>
        </div>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className={`fixed inset-0 z-[60] flex flex-col transition-colors duration-500 ${isDarkMode ? 'bg-[#0F172A] text-slate-300' : 'bg-[#FDFCFB] text-[#1E293B]'}`}>
      {/* Reader Header */}
      <header className={`h-16 px-6 flex items-center justify-between border-b ${isDarkMode ? 'border-white/10 bg-slate-900/50' : 'border-slate-100 bg-white/80'} backdrop-blur-md`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/my-books')}
            className="p-2 hover:bg-black/5 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="hidden md:block">
            <h1 className="text-sm font-bold truncate max-w-[200px]">{book.title}</h1>
            <p className="text-[10px] font-medium opacity-60 uppercase tracking-widest">{book.author}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 hover:bg-black/5 rounded-lg transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <div className="h-4 w-px bg-slate-200 mx-2" />
          <button 
            onClick={() => setFontSize(f => Math.max(12, f - 2))}
            className="p-2 hover:bg-black/5 rounded-lg transition-colors text-xs font-bold"
          >
            A-
          </button>
          <button 
            onClick={() => setFontSize(f => Math.min(32, f + 2))}
            className="p-2 hover:bg-black/5 rounded-lg transition-colors text-lg font-bold"
          >
            A+
          </button>
          <div className="h-4 w-px bg-slate-200 mx-2" />
          <button className="p-2 hover:bg-black/5 rounded-lg transition-colors">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Reader Content */}
      <main className="flex-1 overflow-y-auto px-6 py-12">
        <article className="max-w-2xl mx-auto space-y-8">
          <header className="text-center space-y-4 mb-16">
            <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-[0.3em]">Archival Digital Volume</span>
            <h2 className="text-4xl md:text-5xl font-bold italic font-serif leading-tight">{book.title}</h2>
            <div className="flex items-center justify-center gap-3 text-slate-400 font-serif">
              <span>By {book.author}</span>
              <span className="w-1 h-1 bg-slate-200 rounded-full" />
              <span>Digital Edition v1.02</span>
            </div>
          </header>

          <div 
            className="font-serif leading-relaxed space-y-6"
            style={{ fontSize: `${fontSize}px` }}
          >
            <p className="first-letter:text-7xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:text-[#2563EB]">
              {book.description} This digital restoration of the original manuscript provides a unique insight into the scholarly traditions of its time. 
              As you delve into the following pages, consider the historical context in which these words were first penned. 
              The intersection of art and empirical observation has long been the cornerstone of our intellectual heritage.
            </p>
            
            <p>
              In the quiet corridors of the archive, one finds more than just records; one finds the heartbeat of civilizations past. 
              The meticulous care taken to preserve every stroke of the quill and every intention of the author is reflected in this digital exhibition. 
              We invite you to engage with this material not just as a reader, but as a temporary custodian of its meaning.
            </p>

            <div className={`p-8 rounded-2xl border-l-4 border-[#2563EB] ${isDarkMode ? 'bg-white/5' : 'bg-blue-50/50'} italic text-lg`}>
              "Knowledge is the only wealth that increases when shared, yet also the only treasure that requires a sanctuary for its preservation."
            </div>

            <p>
              Technological advancement has allowed us to move beyond physical constraints, yet we strive to maintain the atmosphere of the physical reading room. 
              The architectural breathing room afforded to these records is essential for their comprehension.
            </p>

            <img 
              src={book.coverUrl} 
              alt="Manuscript Detail" 
              className="w-full h-[400px] object-cover rounded-3xl my-12 shadow-2xl opacity-80"
            />

            <p>
              Continuing our exploration into the depths of the collection, we encounter several key sections that define the current scholarly landscape. 
              Each volume serves as a bridge, connecting disparate lines of thought into a cohesive narrative of human achievement. 
              The following chapters detail the specific methodologies employed in the restoration of these vital records.
            </p>
          </div>
        </article>
      </main>

      {/* Reader Footer / Controls */}
      <footer className={`h-20 px-6 flex items-center justify-between border-t ${isDarkMode ? 'border-white/10 bg-slate-900/50' : 'border-slate-100 bg-white/80'} backdrop-blur-md`}>
        <div className="flex flex-col gap-1 flex-1 max-w-[200px]">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-60">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-[#2563EB]" 
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleNextChapter}
            disabled={progress >= 100}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${isDarkMode ? 'bg-white text-slate-900 group' : 'bg-[#0F172A] text-white hover:bg-[#1E293B] group'} disabled:opacity-50`}
          >
            {progress >= 100 ? 'Volume Completed' : 'Next Chapter'} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-slate-400 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>12 mins remaining</span>
          </div>
        </div>
      </footer>

      {/* Floating Bookmark Tab */}
      <div className="fixed top-20 right-0 w-1 bg-[#2563EB] h-12 rounded-l-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
    </div>
  );
}
