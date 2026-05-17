import React from 'react';
import { libraryService } from '../services/libraryService';
import { formatDate, cn } from '../lib/utils';
import { Plus, Edit2, Trash2, ShieldCheck, Book as BookIcon, History, PieChart, Save, Sparkles, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const compressImage = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_WIDTH = 400;
                const MAX_HEIGHT = 600;
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
};

export default function AdminView({ userProfile }) {
    const [activeTab, setActiveTab] = React.useState('books');
    const [books, setBooks] = React.useState([]);
    const [loans, setLoans] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [editingBook, setEditingBook] = React.useState(null);
    React.useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        setLoading(true);
        const [b, l] = await Promise.all([
            libraryService.getBooks(),
            libraryService.getAllLoans()
        ]);
        setBooks(b);
        setLoans(l);
        setLoading(false);
    };
    const handleSaveBook = async (e) => {
        e.preventDefault();
        if (!editingBook)
            return;
        try {
            await libraryService.upsertBook(editingBook);
            setEditingBook(null);
            await loadData();
        }
        catch (e) {
            console.error(e.message);
        }
    };
    const handleDeleteBook = async (id) => {
        await libraryService.deleteBook(id);
        await loadData();
    };
    if (loading)
        return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-[#E5E1DA] border-t-[#F27D26] rounded-full animate-spin"/></div>;
    return (<div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F172A] text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            <ShieldCheck className="w-3 h-3 text-[#2563EB]"/> Archive Curator
          </div>
          <h1 className="text-4xl font-bold text-[#1E293B] tracking-tight">Curator Dashboard</h1>
        </div>

        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button onClick={() => setActiveTab('books')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'books' ? 'bg-[#0F172A] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
            <BookIcon className="w-4 h-4"/> Inventory
          </button>
          <button onClick={() => setActiveTab('loans')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'loans' ? 'bg-[#0F172A] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
            <History className="w-4 h-4"/> Activity
          </button>
          <button onClick={() => setActiveTab('stats')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'stats' ? 'bg-[#0F172A] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
            <PieChart className="w-4 h-4"/> Insights
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'books' && (<motion.div key="books" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-[#1E293B]">Catalog Management</h2>
                <p className="text-slate-400 font-serif italic text-sm">Managing {books.length} volumes in the archive</p>
              </div>
              <div className="flex gap-4">
                <button onClick={async () => {
                await libraryService.seedBooks();
                await loadData();
            }} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm">
                  <Sparkles className="w-4 h-4 text-yellow-500"/> Seed Volumes
                </button>
                <button onClick={() => setEditingBook({ title: '', author: '', quantity: 5, availableCount: 5, category: '' })} className="flex items-center gap-2 bg-[#2563EB] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#1E40AF] transition-all shadow-lg shadow-blue-100">
                  <Plus className="w-4 h-4"/> Add Volume
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Title & Author</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Stock Availability</th>
                    <th className="px-8 py-5 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {books.map((book) => (<tr key={book.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-14 bg-slate-100 rounded overflow-hidden flex-shrink-0 shadow-sm border border-slate-200/50">
                             <img src={book.coverUrl} alt="" className="w-full h-full object-cover"/>
                          </div>
                          <div>
                            <div className="font-bold text-[#1E293B] text-sm group-hover:text-[#2563EB] transition-colors">{book.title}</div>
                            <div className="text-xs text-slate-400 italic font-serif">{book.author}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{book.category}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 max-w-[100px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                             <div className={cn("h-full rounded-full transition-all duration-1000", (book.availableCount / book.quantity) < 0.2 ? 'bg-red-500' : 'bg-[#2563EB]')} style={{ width: `${(book.availableCount / book.quantity) * 100}%` }}/>
                          </div>
                          <span className="text-xs font-bold text-[#1E293B]">
                            {book.availableCount} / {book.quantity}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingBook(book)} className="p-2 text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-all">
                            <Edit2 className="w-4 h-4"/>
                          </button>
                          <button onClick={() => handleDeleteBook(book.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </div>
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          </motion.div>)}

        {activeTab === 'loans' && (<motion.div key="loans" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1E293B]">Active Circulation</h2>
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Volume</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Borrower Identity</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Status</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Archival Dates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loans.map((loan) => (<tr key={loan.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="font-bold text-[#1E293B] text-sm">{loan.bookTitle}</div>
                        <div className="text-xs text-slate-400 font-serif italic">{loan.bookAuthor}</div>
                      </td>
                      <td className="px-8 py-6 font-mono text-[10px] text-slate-500 tracking-wider">
                         {loan.userId}
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border", loan.status === 'active'
                    ? 'bg-blue-50 text-[#2563EB] border-blue-100'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-100 outline-dashed outline-1 outline-emerald-200')}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-xs text-slate-500 font-medium space-y-1">
                        <div className="flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-blue-400"/>
                           Borrowed: {formatDate(loan.borrowDate)}
                        </div>
                        <div className="flex items-center gap-2 font-bold text-[#1E293B]">
                           <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"/>
                           Due Date: {formatDate(loan.dueDate)}
                        </div>
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          </motion.div>)}

        {activeTab === 'stats' && (<motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#0F172A] text-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 relative overflow-hidden group">
               <div className="relative z-10">
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Cumulative Volumes</p>
                 <h3 className="text-6xl font-bold tabular-nums mb-2">{books.reduce((acc, b) => acc + b.quantity, 0)}</h3>
                 <p className="text-slate-500 text-xs font-serif italic">Total assets in collection</p>
               </div>
               <BookIcon className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform"/>
            </div>
            <div className="bg-[#2563EB] text-white p-10 rounded-[2.5rem] shadow-xl shadow-blue-100 relative overflow-hidden group">
               <div className="relative z-10">
                 <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] mb-4">Current Circulation</p>
                 <h3 className="text-6xl font-bold tabular-nums mb-2">{loans.filter(l => l.status === 'active').length}</h3>
                 <p className="text-blue-100/60 text-xs font-serif italic">Volumes currently held by scholars</p>
               </div>
               <History className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform"/>
            </div>
            <div className="bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
               <div className="relative z-10">
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Stock Vitality</p>
                 <h3 className="text-6xl font-bold tabular-nums text-[#1E293B] mb-2">{Math.round((books.reduce((acc, b) => acc + b.availableCount, 0) / books.reduce((acc, b) => acc + b.quantity, 0)) * 100)}%</h3>
                 <p className="text-slate-500 text-xs font-serif italic">Average volume availability</p>
               </div>
               <PieChart className="absolute -bottom-6 -right-6 w-32 h-32 opacity-5 text-slate-900 group-hover:scale-110 transition-transform"/>
            </div>
          </motion.div>)}
      </AnimatePresence>

      {/* Edit Book Modal */}
      <AnimatePresence>
        {editingBook && (<div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingBook(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"/>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-10 overflow-hidden">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#2563EB]">
                  <BookIcon className="w-6 h-6"/>
                </div>
                <h2 className="text-2xl font-bold text-[#1E293B] tracking-tight">
                  {editingBook.id ? 'Refine Volume' : 'Curate New Volume'}
                </h2>
              </div>
              
              <form onSubmit={handleSaveBook} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Volume Title</label>
                  <input required value={editingBook.title} onChange={e => setEditingBook({ ...editingBook, title: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#2563EB]/10 focus:bg-white transition-all font-medium text-[#1E293B]" placeholder="e.g. The Architecture of Silence"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Author</label>
                    <input required value={editingBook.author} onChange={e => setEditingBook({ ...editingBook, author: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-[#2563EB]/10 focus:bg-white transition-all font-medium"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Category</label>
                    <input value={editingBook.category} onChange={e => setEditingBook({ ...editingBook, category: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-[#2563EB]/10 focus:bg-white transition-all font-medium"/>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Total Stock</label>
                    <input type="number" required min="0" value={editingBook.quantity} onChange={e => {
                const q = Math.max(0, parseInt(e.target.value) || 0);
                if (!editingBook.id) {
                    setEditingBook({ ...editingBook, quantity: q, availableCount: q });
                    return;
                }
                const origBook = books.find(b => b.id === editingBook.id) || editingBook;
                const delta = q - origBook.quantity;
                setEditingBook({
                    ...editingBook,
                    quantity: q,
                    availableCount: Math.max(0, Math.min(q, origBook.availableCount + delta))
                });
            }} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-[#2563EB]/10 focus:bg-white transition-all font-medium"/>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Available</label>
                    <input type="number" required min="0" max={editingBook.quantity} value={editingBook.availableCount !== undefined ? editingBook.availableCount : editingBook.quantity} onChange={e => {
                let q = Math.max(0, parseInt(e.target.value) || 0);
                q = Math.min(q, editingBook.quantity);
                setEditingBook({
                    ...editingBook,
                    availableCount: q
                });
            }} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-[#2563EB]/10 focus:bg-white transition-all font-medium"/>
                  </div>

                  <div className="flex items-center gap-3 md:pt-6">
                    <button type="button" onClick={() => setEditingBook({ ...editingBook, isDigital: !editingBook.isDigital })} className={cn("flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold uppercase transition-all border", editingBook.isDigital
                ? "bg-[#2563EB] text-white border-[#2563EB] shadow-md shadow-blue-100"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300")}>
                      {editingBook.isDigital ? 'Digital' : 'Physical'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Cover Image</label>
                  <div className="flex flex-col gap-3">
                    {editingBook.coverUrl && (
                      <div className="w-16 h-24 bg-slate-100 rounded overflow-hidden shadow-sm border border-slate-200">
                        <img src={editingBook.coverUrl} alt="Cover preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <label className="flex items-center justify-center gap-2 cursor-pointer w-full bg-slate-50 border border-slate-200 border-dashed rounded-2xl px-5 py-4 hover:bg-slate-100 transition-colors">
                      <Upload className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-600">Upload Image from Local Storage</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            try {
                              const base64Str = await compressImage(file);
                              setEditingBook({ ...editingBook, coverUrl: base64Str });
                            } catch (err) {
                              console.error("Image compression failed", err);
                            }
                          }
                        }} 
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-[#0F172A] text-white py-4 rounded-2xl font-bold hover:bg-[#1E293B] transition-all shadow-xl shadow-slate-200">
                    <Save className="w-5 h-5"/> Archive Changes
                  </button>
                  <button type="button" onClick={() => setEditingBook(null)} className="px-6 py-4 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all font-serif italic">
                    Close
                  </button>
                </div>
              </form>
            </motion.div>
          </div>)}
      </AnimatePresence>
    </div>);
}
