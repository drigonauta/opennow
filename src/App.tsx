import React, { useState } from 'react';
import { APILoader } from '@googlemaps/extended-component-library/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BusinessProvider } from './context/BusinessContext';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { LocationProvider } from './context/LocationContext';
import { EventProvider } from './context/EventContext';

import { Home } from './pages/Home';
import { MapPage } from './pages/MapPage';
import { BusinessDetails } from './pages/BusinessDetails';
import { Register } from './pages/Register';
import { RegisterLead } from './pages/RegisterLead';
import { Login } from './pages/Login';
import { RegisterBusiness } from './pages/RegisterBusiness';

import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardHome } from './pages/dashboard/DashboardHome';
import { StatusControl } from './pages/dashboard/StatusControl';
import { BusinessEditor } from './pages/dashboard/BusinessEditor';
import { PremiumPage } from './pages/dashboard/PremiumPage';
import { Analytics } from './pages/dashboard/Analytics';
import { FinancePage } from './pages/dashboard/FinancePage';
import { ReferralPage } from './pages/dashboard/ReferralPage';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { AdminImport } from './pages/AdminImport';
import { GoogleMapDemo } from './pages/GoogleMapDemo';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RequireLeadAuth } from './components/RequireLeadAuth';

import { ChatButton } from './components/Noni/ChatButton';
import { ChatWindow } from './components/Noni/ChatWindow';

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
      <APILoader apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} solutionChannel="GMP_GE_mapsandplacesautocomplete_v2" />
      <LocationProvider>
        <BusinessProvider>
          <FavoritesProvider>
            <Router>
              <ChatContext.Provider value={{ isChatOpen, setIsChatOpen }}>
                <EventProvider>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/register-lead" element={<RegisterLead />} />
                    <Route path="/register-business" element={<RegisterBusiness />} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/business/:id" element={<RequireLeadAuth><BusinessDetails /></RequireLeadAuth>} />

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
                      <Route path="referral" element={<ReferralPage />} />
                    </Route>

                    {/* Admin Route */}
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/import" element={<AdminImport />} />
                    <Route path="/google-map" element={<GoogleMapDemo />} />
                  </Routes>

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
