import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import SplashScreen from './components/SplashScreen';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Checkout from './pages/Checkout';
import BookingSuccess from './pages/BookingSuccess';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import About from './pages/About';
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

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Session storage check temporarily disabled so the animation plays on every refresh!
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="events" element={<Events />} />
              <Route path="events/:id" element={<EventDetails />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="success" element={<BookingSuccess />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="contact" element={<Contact />} />
              <Route path="about" element={<About />} />
              <Route path="ticket/:bookingRef" element={<TicketVerify />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            {/* Admin Login Route */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Dashboard Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="events/create" element={<CreateEvent />} />
              <Route path="tickets" element={<AdminTickets />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="home-cms" element={<AdminHomeCMS />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            {/* Auth routes without Navbar/Footer */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
