import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BusinessProvider } from './context/BusinessContext';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { LocationProvider } from './context/LocationContext';
import { EventProvider } from './context/EventContext';
import { AdsProvider } from './context/AdsContext';

import { DashboardLayout } from './layouts/DashboardLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RequireLeadAuth } from './components/RequireLeadAuth';
import RequireAdminAuth from './components/RequireAdminAuth';
import { ChatButton } from './components/Noni/ChatButton';
import { ChatWindow } from './components/Noni/ChatWindow';

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const MapPage = lazy(() => import('./pages/MapPage').then(module => ({ default: module.MapPage })));
const BusinessDetails = lazy(() => import('./pages/BusinessDetails').then(module => ({ default: module.BusinessDetails })));
const Register = lazy(() => import('./pages/Register').then(module => ({ default: module.Register })));
const RegisterLead = lazy(() => import('./pages/RegisterLead').then(module => ({ default: module.RegisterLead })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const RegisterBusiness = lazy(() => import('./pages/RegisterBusiness').then(module => ({ default: module.RegisterBusiness })));
const ClaimPage = lazy(() => import('./pages/ClaimPage').then(module => ({ default: module.ClaimPage })));

const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome').then(module => ({ default: module.DashboardHome })));
const StatusControl = lazy(() => import('./pages/dashboard/StatusControl').then(module => ({ default: module.StatusControl })));
const BusinessEditor = lazy(() => import('./pages/dashboard/BusinessEditor').then(module => ({ default: module.BusinessEditor })));
const PremiumPage = lazy(() => import('./pages/dashboard/PremiumPage').then(module => ({ default: module.PremiumPage })));
const Analytics = lazy(() => import('./pages/dashboard/Analytics').then(module => ({ default: module.Analytics })));
const FinancePage = lazy(() => import('./pages/dashboard/FinancePage').then(module => ({ default: module.FinancePage })));
const MarketingPanel = lazy(() => import('./pages/dashboard/MarketingPanel').then(module => ({ default: module.MarketingPanel })));
const ReferralPage = lazy(() => import('./pages/dashboard/ReferralPage').then(module => ({ default: module.ReferralPage })));

const AdminOverview = lazy(() => import('./pages/admin/AdminOverview').then(module => ({ default: module.AdminOverview })));
const AdminBusinesses = lazy(() => import('./pages/admin/AdminBusinesses').then(module => ({ default: module.AdminBusinesses })));
const AdminApprovals = lazy(() => import('./pages/admin/AdminApprovals').then(module => ({ default: module.AdminApprovals })));
const AdminLeads = lazy(() => import('./pages/admin/AdminLeads').then(module => ({ default: module.AdminLeads })));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories').then(module => ({ default: module.AdminCategories })));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminImport = lazy(() => import('./pages/AdminImport').then(module => ({ default: module.AdminImport })));
const AdminVotes = lazy(() => import('./pages/admin/AdminVotes').then(module => ({ default: module.AdminVotes })));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews').then(module => ({ default: module.AdminReviews })));

const GoogleMapDemo = lazy(() => import('./pages/GoogleMapDemo').then(module => ({ default: module.GoogleMapDemo })));
const Terms = lazy(() => import('./pages/Terms').then(module => ({ default: module.Terms })));
const About = lazy(() => import('./pages/About').then(module => ({ default: module.About })));

// Loading Component
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-screen bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ta-blue"></div>
  </div>
);

// Imports removed (duplicates)

interface ChatContextType {
  isChatOpen: boolean;
  setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ChatContext = React.createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = React.useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

const App: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <AuthProvider>
      <LocationProvider>
        <BusinessProvider>
          <FavoritesProvider>
            <Router>
              <ChatContext.Provider value={{ isChatOpen, setIsChatOpen }}>
                <EventProvider>
                  <AdsProvider>
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/register-lead" element={<RegisterLead />} />
                        <Route path="/register-business" element={<RegisterBusiness />} />
                        <Route path="/map" element={<MapPage />} />
                        <Route path="/business/:id" element={<RequireLeadAuth><BusinessDetails /></RequireLeadAuth>} />
                        <Route path="/reivindicar/:id" element={<ClaimPage />} />

                        {/* Legacy/Alias Routes */}
                        <Route path="/open-now" element={<Home />} />
                        <Route path="/stores" element={<Home />} />
                        <Route path="/status" element={<StatusControl />} />

                        {/* Dashboard Routes */}
                        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                          <Route index element={<DashboardHome />} />
                          <Route path="status" element={<StatusControl />} />
                          <Route path="edit" element={<BusinessEditor />} />
                          <Route path="premium" element={<PremiumPage />} />
                          <Route path="analytics" element={<Analytics />} />
                          <Route path="finance" element={<FinancePage />} />
                          <Route path="finance" element={<FinancePage />} />
                          <Route path="marketing" element={<MarketingPanel />} />
                          <Route path="referral" element={<ReferralPage />} />
                        </Route>

                        {/* Admin Routes */}
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin" element={
                          <RequireAdminAuth>
                            <AdminLayout />
                          </RequireAdminAuth>
                        }>
                          <Route index element={<AdminOverview />} />
                          <Route path="businesses" element={<AdminBusinesses />} />
                          <Route path="approvals" element={<AdminApprovals />} />
                          <Route path="reviews" element={<AdminReviews />} />
                          <Route path="votes" element={<AdminVotes />} />
                          <Route path="leads" element={<AdminLeads />} />
                          <Route path="categories" element={<AdminCategories />} />
                          <Route path="import" element={<AdminImport />} />
                        </Route>
                        <Route path="/google-map" element={<GoogleMapDemo />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/about" element={<About />} />
                      </Routes>
                    </Suspense>
                  </AdsProvider>

                  {/* Nôni AI Chat */}
                  <ChatButton />
                  {isChatOpen && <ChatWindow />}
                </EventProvider>
              </ChatContext.Provider>
            </Router>
          </FavoritesProvider>
        </BusinessProvider>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
