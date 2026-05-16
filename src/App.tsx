import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './lib/firebase';
import { libraryService } from './services/libraryService';
import { UserProfile } from './types';
import AuthScreen from './components/Auth';
import Layout from './components/Layout';

// View placeholders (will create in next steps)
import CatalogView from './views/CatalogView';
import MyBooksView from './views/MyBooksView';
import AdminView from './views/AdminView';
import DashboardView from './views/DashboardView';
import ReservationsView from './views/ReservationsView';
import SettingsView from './views/SettingsView';
import ProfileView from './views/ProfileView';
import ReaderView from './views/ReaderView';
import LandingView from './views/LandingView';

export default function App() {
  const [user, loading, error] = useAuthState(auth);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setProfileLoading(true);
      libraryService.ensureUserProfile(user)
        .then(setUserProfile)
        .finally(() => setProfileLoading(false));
    } else {
      setUserProfile(null);
    }
  }, [user]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#2563EB] rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium tracking-widest uppercase">Opening Library...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingView />} />
          <Route path="/auth" element={<AuthScreen />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page accessible even when logged in */}
        <Route path="/" element={<LandingView />} />
        
        {/* Protected App Routes */}
        <Route 
          path="/*" 
          element={
            <Layout userProfile={userProfile}>
              <Routes>
                <Route path="dashboard" element={<DashboardView userProfile={userProfile} />} />
                <Route path="catalog" element={<CatalogView userProfile={userProfile} />} />
                <Route path="my-books" element={<MyBooksView userProfile={userProfile} />} />
                <Route path="reservations" element={<ReservationsView userProfile={userProfile} />} />
                <Route path="read/:loanId" element={<ReaderView userProfile={userProfile} />} />
                <Route path="settings" element={<SettingsView userProfile={userProfile} />} />
                <Route path="profile" element={<ProfileView userProfile={userProfile} />} />
                <Route 
                  path="admin" 
                  element={
                    userProfile?.role === 'admin' ? <AdminView userProfile={userProfile} /> : <Navigate to="/dashboard" />
                  } 
                />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Layout>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
