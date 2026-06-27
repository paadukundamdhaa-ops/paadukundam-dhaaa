import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { SecurityProvider } from './components/SecurityProvider';
import SplashScreen from './components/SplashScreen';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Checkout from './pages/Checkout';
import BookingSuccess from './pages/BookingSuccess';
import PaymentStatus from './pages/PaymentStatus';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import About from './pages/About';
import TermsConditions from './pages/TermsConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import NotFound from './pages/NotFound';
import TicketVerify from './pages/TicketVerify';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminUsers from './pages/admin/AdminUsers';
import AdminEvents from './pages/admin/AdminEvents';
import AdminTickets from './pages/admin/AdminTickets';
import AdminBookings from './pages/admin/AdminBookings';
import AdminGallery from './pages/admin/AdminGallery';
import AdminHomeCMS from './pages/admin/AdminHomeCMS';
import AdminSettings from './pages/admin/AdminSettings';
import CreateEvent from './pages/admin/CreateEvent';
import EditEvent from './pages/admin/EditEvent';
import AdminScanner from './pages/admin/AdminScanner';
import AdminPromoCodes from './pages/admin/AdminPromoCodes';
import BoxOffice from './pages/admin/BoxOffice';
import ScannerLogin from './pages/ScannerLogin';
import StandaloneScanner from './pages/StandaloneScanner';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Session storage check temporarily disabled so the animation plays on every refresh!
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <HelmetProvider>
      <SecurityProvider>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="events" element={<Events />} />
                <Route path="events/:id" element={<EventDetails />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="payment-status" element={<PaymentStatus />} />
                <Route path="success" element={<BookingSuccess />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="gallery" element={<Gallery />} />
                <Route path="contact" element={<Contact />} />
                <Route path="about" element={<About />} />
                <Route path="terms-conditions" element={<TermsConditions />} />
                <Route path="privacy-policy" element={<PrivacyPolicy />} />
                <Route path="refund-policy" element={<RefundPolicy />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Standalone Ticket View Route (No Navbar/Footer) */}
              <Route path="/ticket/:bookingRef" element={<TicketVerify />} />
              {/* Admin Login Route */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Admin Dashboard Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="events/create" element={<CreateEvent />} />
                <Route path="events/edit/:id" element={<EditEvent />} />
                <Route path="tickets" element={<AdminTickets />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="gallery" element={<AdminGallery />} />
                <Route path="home-cms" element={<AdminHomeCMS />} />
                <Route path="promocodes" element={<AdminPromoCodes />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="box-office" element={<BoxOffice />} />
              </Route>
              
              {/* Standalone Admin Scanner (Full Screen for Mobile) */}
              <Route path="/admin/scanner" element={<AdminScanner />} />

              {/* Dedicated Scanner App Routes */}
              <Route path="/scanner" element={<ScannerLogin />} />
              <Route path="/scanner/app" element={<StandaloneScanner />} />

              {/* Auth routes without Navbar/Footer */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </AuthProvider>
        </Router>
      </SecurityProvider>
    </HelmetProvider>
  );
}

export default App;
