import React from 'react';
import { libraryService } from '../services/libraryService';
import { BookOpen, Clock, AlertCircle, TrendingUp, ArrowUpRight } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
import { isBefore } from 'date-fns';
import { Link } from 'react-router-dom';
const chartData = [
    { name: 'Mon', count: 4 },
    { name: 'Tue', count: 3 },
    { name: 'Wed', count: 6 },
    { name: 'Thu', count: 8 },
    { name: 'Fri', count: 5 },
    { name: 'Sat', count: 2 },
    { name: 'Sun', count: 3 },
];
export default function DashboardView({ userProfile }) {
    const [stats, setStats] = React.useState({
        totalBooks: 0,
        activeLoans: 0,
        overdueItems: 0,
        reservations: 0
    });
    const [recentBooks, setRecentBooks] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    React.useEffect(() => {
        loadDashboardData();
    }, [userProfile]);
    const loadDashboardData = async () => {
        if (!userProfile)
            return;
        setLoading(true);
        try {
            const [allBooks, userLoans, userReservations] = await Promise.all([
                libraryService.getBooks(),
                libraryService.getUserLoans(userProfile.uid),
                libraryService.getUserReservations(userProfile.uid)
            ]);
            const active = userLoans.filter(l => l.status === 'active');
            const overdue = active.filter(l => isBefore(l.dueDate.toDate(), new Date()));
            setStats({
                totalBooks: allBooks.length,
                activeLoans: active.length,
                overdueItems: overdue.length,
                reservations: userReservations.filter(r => r.status === 'pending').length
            });
            setRecentBooks(allBooks.sort((a, b) => {
                const dateA = a.createdAt?.toMillis?.() || 0;
                const dateB = b.createdAt?.toMillis?.() || 0;
                return dateB - dateA;
            }).slice(0, 4));
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setLoading(false);
        }
    };
    if (loading) {
        return <div className="flex justify-center items-center h-[60vh] animate-pulse">
      <div className="text-slate-400 font-serif italic text-lg whitespace-nowrap">Gathering your literary insights...</div>
    </div>;
    }
    return (<div className="max-w-[1400px] mx-auto space-y-10 pb-12">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
            { label: 'Books Available', value: stats.totalBooks, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active Loans', value: stats.activeLoans, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Overdue items', value: stats.overdueItems, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Waitlist', value: stats.reservations, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (<motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                <stat.icon className="w-6 h-6"/>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status: OK</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">{stat.label}</h3>
              <p className="text-4xl font-bold text-[#1E293B]">{stat.value}</p>
            </div>
          </motion.div>))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Activity Chart */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-3xl p-10 space-y-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-[#1E293B]">Reading Activity</h3>
              <p className="text-slate-500 font-serif italic">Your engagement levels over the past week</p>
            </div>
            <select className="bg-slate-50 border border-slate-100 text-sm font-bold px-4 py-2 rounded-lg outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9"/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }} dy={10}/>
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}/>
                <Tooltip contentStyle={{
            backgroundColor: '#1E293B',
            border: 'none',
            borderRadius: '12px',
            color: '#fff'
        }} itemStyle={{ color: '#fff' }}/>
                <Area type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Additions */}
        <div className="bg-[#0F172A] rounded-3xl p-10 text-white space-y-10 shadow-xl shadow-slate-200">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">New Arrivals</h3>
            <p className="text-slate-400 font-serif italic text-sm">Freshly curated for the archives</p>
          </div>

          <div className="space-y-6">
            {recentBooks.map((book) => (<Link key={book.id} to="/catalog" className="flex items-center gap-4 group hover:bg-white/5 p-2 rounded-2xl transition-all">
                <div className="w-14 h-20 bg-white/10 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform"/>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate group-hover:text-blue-400 transition-colors">{book.title}</h4>
                  <p className="text-slate-500 text-xs font-serif italic truncate">{book.author}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-white"/>
              </Link>))}
          </div>

          <Link to="/catalog" className="block w-full text-center py-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-xl font-bold transition-all mt-auto">
            View All Collection
          </Link>
        </div>
      </div>
    </div>);
}
