import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Library, BookOpen, CalendarCheck, Settings, Search, HelpCircle, LogOut, Menu, X, Bell, User, ShieldCheck } from 'lucide-react';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { libraryService } from '../services/libraryService';
export default function Layout({ children, userProfile }) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(window.innerWidth > 768);
    const location = useLocation();
    const [notificationsOpen, setNotificationsOpen] = React.useState(false);
    const [notifications, setNotifications] = React.useState([]);

    React.useEffect(() => {
        if (!userProfile?.uid) return;
        
        async function fetchNotifications() {
            try {
                // 1. Fetch completed volumes
                const loans = await libraryService.getUserLoans(userProfile.uid);
                const completedLoans = loans.filter(l => l.readingProgress >= 100);
                
                // 2. Fetch new arrivals (books added in the last 7 days)
                const books = await libraryService.getBooks();
                const now = new Date().getTime();
                const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
                
                const newArrivals = books.filter(b => {
                    const createdTime = b.createdAt?.toMillis?.() || (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0) || 0;
                    if (!createdTime) return false;
                    return (now - createdTime) < SEVEN_DAYS;
                });
                
                // Build notification array
                let dynamicNotifications = [];
                
                completedLoans.forEach(loan => {
                    const ts = loan.lastReadAt?.toMillis?.() || (loan.lastReadAt?.seconds ? loan.lastReadAt.seconds * 1000 : 0) || 0;
                    dynamicNotifications.push({
                        id: `completed-${loan.id}`,
                        title: 'Volume Completed',
                        message: `You have finished reading "${loan.bookTitle}".`,
                        time: 'Recently completed',
                        timestamp: ts
                    });
                });
                
                newArrivals.forEach(book => {
                    const ts = book.createdAt?.toMillis?.() || (book.createdAt?.seconds ? book.createdAt.seconds * 1000 : 0) || 0;
                    dynamicNotifications.push({
                        id: `new-${book.id}`,
                        title: 'New Arrival',
                        message: `A new volume "${book.title}" has been cataloged.`,
                        time: 'Recently added',
                        timestamp: ts
                    });
                });
                
                dynamicNotifications.sort((a, b) => b.timestamp - a.timestamp);
                
                // Merge with localStorage read state
                const readSet = new Set(JSON.parse(localStorage.getItem(`readNotifications_${userProfile.uid}`) || '[]'));
                const merged = dynamicNotifications.map(n => ({
                    ...n,
                    read: readSet.has(n.id)
                }));
                
                setNotifications(merged);
            } catch (e) {
                console.error('Failed to fetch notifications:', e);
            }
        }
        
        // Initial fetch and polling
        fetchNotifications();
        const intv = setInterval(fetchNotifications, 30000);
        return () => clearInterval(intv);
    }, [userProfile?.uid]);

    const unreadCount = notifications.filter(n => !n.read).length;
    const markAllRead = () => {
        setNotifications(prev => {
            const up = prev.map(n => ({ ...n, read: true }));
            localStorage.setItem(`readNotifications_${userProfile?.uid}`, JSON.stringify(up.map(n => n.id)));
            return up;
        });
    };
    const markRead = (id) => {
        setNotifications(prev => {
            const up = prev.map(n => n.id === id ? { ...n, read: true } : n);
            const readIds = up.filter(n => n.read).map(n => n.id);
            localStorage.setItem(`readNotifications_${userProfile?.uid}`, JSON.stringify(readIds));
            return up;
        });
    };
    // Close notifications on route change
    React.useEffect(() => {
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
        setNotificationsOpen(false);
    }, [location.pathname]);
    const mainNavItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Catalog', path: '/catalog', icon: Library },
        { name: 'My Loans', path: '/my-books', icon: BookOpen },
        { name: 'Reservations', path: '/reservations', icon: CalendarCheck },
        { name: 'Profile', path: '/profile', icon: User },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];
    if (userProfile?.role === 'admin') {
        mainNavItems.splice(1, 0, { name: 'Admin', path: '/admin', icon: ShieldCheck });
    }
    const bottomNavItems = [
        { name: 'Help Center', path: '/help', icon: HelpCircle },
    ];
    const handleLogout = () => auth.signOut();
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const isActive = (path) => location.pathname === path;
    return (<div className="min-h-screen bg-[#F8FAFC] flex font-sans text-[#1E293B]">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"/>)}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn("bg-white border-r border-[#E2E8F0] transition-all duration-300 flex flex-col fixed inset-y-0 left-0 z-50 md:sticky h-screen", isSidebarOpen ? "w-64 translate-x-0" : "w-16 -translate-x-full md:translate-x-0")}>
        <div className={cn("p-6 mb-8 mt-2 flex items-center justify-between", !isSidebarOpen && "md:justify-center px-0 flex-col gap-2")}>
          <Link to="/" className={cn("flex flex-col", !isSidebarOpen && "md:items-center")}>
            <span className={cn("text-xl font-bold text-[#1E3A8A] leading-tight transition-all", !isSidebarOpen && "md:text-sm text-center")}>
              {isSidebarOpen ? 'Lumina' : 'L'}
            </span>
            {isSidebarOpen && <span className="text-xs text-[#64748B] font-medium">Digital Curator</span>}
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-[#64748B] hover:bg-slate-50 rounded-lg md:hidden">
            <X className="w-5 h-5"/>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {mainNavItems.map((item) => (<Link key={item.path} to={item.path} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group relative", isActive(item.path)
                ? "bg-[#EFF6FF] text-[#2563EB]"
                : "text-[#64748B] hover:bg-slate-50 hover:text-[#1E293B]", !isSidebarOpen && "md:justify-center md:px-0")} title={!isSidebarOpen ? item.name : ''}>
              <item.icon className={cn("w-5 h-5 shrink-0", isActive(item.path) ? "text-[#2563EB]" : "text-[#94A3B8] group-hover:text-[#1E293B]")}/>
              {isSidebarOpen && <span>{item.name}</span>}
              {isActive(item.path) && (<div className="absolute left-0 w-1 h-6 bg-[#2563EB] rounded-r-full"/>)}
            </Link>))}
        </nav>

        <div className="px-4 pb-8 space-y-4">
          <Link to="/catalog" className={cn("w-full bg-[#0F172A] text-white flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold shadow-md hover:bg-[#1E293B] transition-colors", !isSidebarOpen && "md:px-0")}>
            <Search className="w-4 h-4"/>
            {isSidebarOpen && <span>Search Catalog</span>}
          </Link>

          <div className="space-y-1">
            {bottomNavItems.map((item) => (<Link key={item.path} to={item.path} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-[#64748B] hover:bg-slate-50 hover:text-[#1E293B] transition-all group", !isSidebarOpen && "md:justify-center md:px-0")} title={!isSidebarOpen ? item.name : ''}>
                <item.icon className="w-5 h-5 text-[#94A3B8] group-hover:text-[#1E293B] shrink-0"/>
                {isSidebarOpen && <span>{item.name}</span>}
              </Link>))}
            <button onClick={handleLogout} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-[#64748B] hover:bg-red-50 hover:text-red-600 transition-all group", !isSidebarOpen && "md:justify-center md:px-0")}>
              <LogOut className="w-5 h-5 text-[#94A3B8] group-hover:text-red-600 shrink-0"/>
              {isSidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-[#F8FAFC]/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 sm:px-8 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
            <button onClick={toggleSidebar} className="p-2 text-[#64748B] hover:bg-slate-100 rounded-lg transition-colors shrink-0" aria-label="Toggle Sidebar">
              <Menu className="w-6 h-6"/>
            </button>
            <h1 className="text-lg md:text-2xl font-bold text-[#1E293B] truncate">
              {isActive('/my-books') ? 'My Loans' :
            isActive('/profile') ? 'Scholar Profile' :
                isActive('/catalog') ? 'Library Catalog' :
                    location.pathname.substring(1).charAt(0).toUpperCase() + location.pathname.substring(1).split('/')[0].slice(1) || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button onClick={() => setNotificationsOpen(!notificationsOpen)} className={cn("p-2 text-[#64748B] hover:bg-slate-100 rounded-full transition-colors group relative", notificationsOpen && "bg-slate-100 text-[#1E293B]")}>
                <Bell className="w-6 h-6 group-hover:text-[#1E293B]"/>
                {unreadCount > 0 && (<span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-white"/>)}
              </button>

              <AnimatePresence>
                {notificationsOpen && (<>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setNotificationsOpen(false)} className="fixed inset-0 z-40"/>
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute -right-28 sm:right-0 mt-4 w-[calc(100vw-2rem)] sm:w-96 max-w-[380px] bg-white border border-slate-200 rounded-3xl shadow-2xl shadow-slate-200/50 z-50 overflow-hidden">
                      <div className="p-4 sm:p-6 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm sm:text-base text-[#1E293B]">Notifications</h3>
                          {unreadCount > 0 && (<span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {unreadCount} New
                            </span>)}
                        </div>
                        <button onClick={markAllRead} className="text-xs font-bold text-[#2563EB] hover:underline">
                          Mark all as read
                        </button>
                      </div>

                      <div className="max-h-[70vh] overflow-y-auto">
                        {notifications.length === 0 ? (<div className="p-10 sm:p-12 text-center">
                            <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-slate-200 mx-auto mb-4"/>
                            <p className="text-slate-400 text-sm font-serif italic">Your collection is silent.</p>
                          </div>) : (<div className="divide-y divide-slate-50">
                            {notifications.map((n) => (<button key={n.id} onClick={() => markRead(n.id)} className={cn("w-full text-left p-4 sm:p-6 hover:bg-slate-50 transition-colors flex gap-3 sm:gap-4", !n.read && "bg-blue-50/30")}>
                                <div className={cn("w-2 h-2 mt-2 rounded-full flex-shrink-0", n.read ? "bg-slate-200" : "bg-[#2563EB]")}/>
                                <div className="space-y-1">
                                  <p className="font-bold text-sm text-[#1E293B]">{n.title}</p>
                                  <p className="text-xs text-slate-500 leading-relaxed">{n.message}</p>
                                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest pt-1">{n.time}</p>
                                </div>
                              </button>))}
                          </div>)}
                      </div>
                      
                      <div className="p-3 sm:p-4 bg-slate-50 text-center border-t border-slate-100">
                        <button className="text-xs font-bold text-slate-500 hover:text-[#1E293B] transition-colors">
                          View Activity Log
                        </button>
                      </div>
                    </motion.div>
                  </>)}
              </AnimatePresence>
            </div>
            
            <Link to="/profile" className="flex items-center gap-3 pl-4 border-l border-[#E2E8F0] hover:opacity-80 transition-opacity">
              <div className="flex flex-col items-end mr-1">
                <span className="text-sm font-bold text-[#1E293B]">{userProfile?.displayName}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">View Profile</span>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-200">
                {userProfile?.photoURL ? (<img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer"/>) : (<div className="w-full h-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] font-bold">
                    {userProfile?.displayName?.charAt(0)}
                  </div>)}
              </div>
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>);
}
