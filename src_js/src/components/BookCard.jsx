import React from 'react';
import { motion } from 'framer-motion';
import { BookCheck, Tag, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
export default function BookCard({ book, onBorrow, onReserve, onView, isLoading, isReserved }) {
    const isAvailable = book.availableCount > 0;
    return (<motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-[#2563EB]/5 transition-all duration-300">
      <div className="aspect-[3/4] bg-slate-50 relative overflow-hidden">
        {book.coverUrl ? (<img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer"/>) : (<div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <Tag className="w-8 h-8 text-slate-200 mb-4"/>
            <span className="text-slate-400 text-xs font-serif italic">{book.category || 'Untagged'}</span>
          </div>)}
        
        <div className={cn("absolute top-4 left-4 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border", isAvailable ? "bg-white/90 text-[#2563EB] border-[#2563EB]/20" : "bg-amber-50/90 text-amber-600 border-amber-200")}>
          {isAvailable ? `${book.availableCount} Copies` : 'Reserved'}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6 min-h-[4.5rem]">
          <h3 className="text-xl font-bold text-[#1E293B] leading-tight line-clamp-2 mb-2 group-hover:text-[#2563EB] transition-colors">
            {book.title}
          </h3>
          <p className="text-slate-500 text-sm font-serif italic">{book.author}</p>
        </div>

        <div className="flex flex-col gap-2 pt-4 border-t border-slate-50">
          <div className="flex gap-2">
            <button onClick={() => onBorrow?.(book)} disabled={isLoading || (!isAvailable && !book.isDigital)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0F172A] text-white rounded-lg text-sm font-bold hover:bg-[#1E293B] shadow-sm transition-all disabled:opacity-50">
              {isLoading ? (<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>) : (<>
                  <BookCheck className="w-4 h-4"/>
                  {book.isDigital ? 'Open Volume' : isAvailable ? 'Borrow Now' : 'Out of Stock'}
                </>)}
            </button>

            <button onClick={() => onReserve?.(book)} disabled={isLoading || isReserved} className={cn("flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all disabled:opacity-50 border", isReserved
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : isAvailable
                ? "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 shadow-sm")}>
              {isLoading && !isAvailable ? (<div className="w-4 h-4 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin"/>) : (<>
                  <Clock className="w-4 h-4"/>
                  {isReserved ? 'Already Reserved' : isAvailable ? 'Reserve' : 'Reserve Hold'}
                </>)}
            </button>
          </div>
        </div>
      </div>
    </motion.div>);
}
