import { Ticket, User, Heart, Settings, LogOut, Download, MapPin, Calendar, Clock, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QRCode from 'react-qr-code';
import Swal from 'sweetalert2';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [activeTab, setActiveTab] = useState('My Tickets');

  const [profile, setProfile] = useState({ name: '', phone: '' });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchBookingsAndProfile = async () => {
      try {
        // Fetch Bookings
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*, events(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (bookingsError) throw bookingsError;
        setBookings(bookingsData || []);

        // Fetch Profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          setProfile({
            name: profileData.name || '',
            phone: profileData.phone || ''
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingsAndProfile();

    const dashboardSubscription = supabase.channel(`public:dashboard-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchBookingsAndProfile();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(dashboardSubscription);
    };
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        name: profile.name,
        phone: profile.phone,
      });
      if (error) throw error;
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to update profile.', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleDownloadTicket = async (bookingId, bookingRef) => {
    setDownloading(bookingId);
    const element = document.getElementById(`ticket-${bookingId}`);
    if (!element) {
      setDownloading(null);
      return;
    }

    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      const link = document.createElement('a');
      link.download = `Ticket-${bookingRef}.jpg`;
      link.href = imgData;
      link.click();
    } catch (error) {
      console.error("Error generating PDF:", error);
      Swal.fire({
        icon: 'error',
        title: 'Download Failed',
        text: `Failed to download ticket: ${error.message || 'Unknown error'}`,
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setDownloading(null);
    }
  };

  const initial = user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'U';
  // Use profile data if available, fallback to metadata
  const name = profile.name ? profile.name : (user.user_metadata?.full_name || 'User');
  const email = user.email;
  const tabs = [
    { name: 'My Tickets', icon: <Ticket size={20} /> },
    { name: 'Profile', icon: <User size={20} /> },
    { name: 'Wishlist', icon: <Heart size={20} /> },
    { name: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="pt-24 pb-24 min-h-screen bg-gray-50 container mx-auto px-6 flex flex-col md:flex-row gap-8 lg:gap-12 font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-72 shrink-0">
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
          <div className="flex flex-col items-center space-y-4 mb-8 pb-8 border-b border-gray-100 text-center">
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Profile" className="w-20 h-20 rounded-full object-cover shadow-sm" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center text-3xl font-black text-white shadow-sm">
                {initial}
              </div>
            )}
            <div className="w-full overflow-hidden">
              <h3 className="font-black text-xl text-black truncate" title={name}>{name}</h3>
              <p className="text-sm font-bold text-gray-500 truncate" title={email}>{email}</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            {tabs.map((tab, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveTab(tab.name)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === tab.name ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-black border border-transparent'}`}>
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
            <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-bold text-sm transition-colors mt-8 border border-transparent">
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow">
        {activeTab === 'My Tickets' && (
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl md:text-3xl font-black text-black">My Tickets</h1>
              <span className="bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">{bookings.length} Bookings</span>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <Loader2 size={40} className="text-primary animate-spin mb-4" />
                <p className="font-bold text-gray-500">Loading your tickets...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Ticket size={40} className="text-gray-400" />
                </div>
                <h2 className="text-xl font-black text-black mb-2">No tickets yet</h2>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">You haven't booked any events yet. Discover amazing live experiences happening near you.</p>
                <Link to="/events" className="inline-flex items-center justify-center px-8 py-3 bg-primary hover:bg-primary-dark text-white font-black rounded-xl transition-all shadow-lg shadow-primary/30 transform hover:scale-[1.02]">
                  Explore Events
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 pb-12">
                {bookings.map((booking) => {
                  const event = booking.events || {};
                  const eventDate = new Date(event.event_date || booking.created_at).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' });
                  const eventTime = event.event_time ? event.event_time.substring(0, 5) : 'TBA';
                  const isDownloading = downloading === booking.id;
                  const cleanRef = booking.booking_ref.replace('#', '');
                  const qrValue = `${window.location.origin}/ticket/${cleanRef}`;
                  
                  return (
                    <div className="flex justify-center" key={booking.id}>
                      <div id={`ticket-${booking.id}`} className="bg-white rounded-[2rem] w-full max-w-[400px] shadow-xl border border-gray-100 overflow-hidden flex flex-col relative">
                        
                        {/* Header */}
                        <div className="p-6 flex gap-5 relative bg-white">
                          {/* Vertical Text */}
                          <div className="absolute right-0 top-1/2 origin-center translate-x-3 -translate-y-1/2 -rotate-90 whitespace-nowrap">
                            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em]">E-Ticket</span>
                          </div>
                          
                          {/* Image */}
                          <div className="w-[110px] h-[150px] shrink-0 rounded-2xl overflow-hidden relative shadow-sm border border-gray-100">
                            <img 
                              src={event.img_url || event.hero_image || "https://images.unsplash.com/photo-1540039155732-61ee14b12756?auto=format&fit=crop&q=80&w=800"} 
                              alt={event.title || "Event"} 
                              className="w-full h-full object-cover" 
                              crossOrigin="anonymous"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-primary py-1.5 text-center">
                              <span className="text-[10px] font-black text-white uppercase tracking-wider">{event.status || 'Confirmed'}</span>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex flex-col justify-center pr-8 py-2">
                            <h3 className="text-[17px] font-black text-black leading-snug mb-2 pr-2">{event.title || 'Untitled Event'}</h3>
                            <p className="text-[13px] text-gray-500 mb-3">{event.category || 'Live Event'}</p>
                            <p className="text-[13px] font-bold text-gray-700 mb-1.5">{eventDate} | {eventTime}</p>
                            <p className="text-[13px] text-gray-600 leading-tight pr-2">{event.venue || 'TBA'}, {event.city || ''}</p>
                          </div>
                        </div>

                        {/* Middle separator with cutouts */}
                        <div className="relative bg-white py-5">
                          {/* Left Cutout */}
                          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full border border-gray-100 shadow-inner z-10"></div>
                          {/* Right Cutout */}
                          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full border border-gray-100 shadow-inner z-10"></div>
                          
                          {/* Dashed line */}
                          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-gray-200"></div>
                          
                          {/* Action Buttons */}
                          <div className="relative flex justify-center gap-3 z-10 px-4" data-html2canvas-ignore="true">
                            <button 
                              onClick={() => handleDownloadTicket(booking.id, booking.booking_ref)} 
                              disabled={isDownloading} 
                              className="flex-1 bg-primary hover:bg-primary-dark transition-colors py-2.5 rounded-full text-[11px] font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-primary/20"
                            >
                              {isDownloading ? <Loader2 size={12} className="animate-spin text-white" /> : <Download size={12} className="text-white" />}
                              {isDownloading ? 'Saving...' : 'Save JPG'}
                            </button>
                            <button 
                              onClick={() => setSelectedBooking(booking)} 
                              className="flex-1 bg-white hover:bg-gray-50 transition-colors py-2.5 rounded-full text-[11px] font-bold text-gray-700 flex items-center justify-center border border-gray-200 cursor-pointer shadow-sm"
                            >
                              View Details
                            </button>
                          </div>
                        </div>

                        {/* Bottom Section */}
                        <div className="px-8 py-6 bg-white flex justify-between items-center gap-4">
                          {/* QR Code */}
                          <div className="bg-white p-2 rounded-xl border border-gray-200 shrink-0">
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(qrValue)}`} 
                              alt="QR Code" 
                              width="110" 
                              height="110" 
                              crossOrigin="anonymous" 
                            />
                          </div>

                          {/* Ticket Details */}
                          <div className="text-center flex flex-col justify-center w-full">
                            <p className="text-gray-500 text-[13px] font-medium mb-3">{booking.qty} Ticket(s)</p>
                            <h4 className="text-xl font-black text-black mb-1 uppercase tracking-wider">GENERAL</h4>
                            <p className="text-[13px] text-gray-500 mb-3 uppercase tracking-widest">Entry</p>
                            <p className="text-[11px] font-bold text-black uppercase tracking-widest bg-gray-50 py-1.5 px-2 rounded-lg inline-block mx-auto">ID: {booking.booking_ref}</p>
                          </div>
                        </div>

                        {/* Cancellation policy & Total */}
                        <div className="bg-gray-50 pt-5 pb-6 text-center border-t border-gray-100 flex flex-col justify-between h-full">
                          <p className="text-[11px] text-gray-500 mb-5 px-8 leading-relaxed">Cancellation available: cut-off time of 24 hours before showtime</p>
                          <div className="flex justify-between items-center pt-4 border-t border-gray-200 px-8">
                            <span className="font-bold text-[14px] text-black">Total Amount</span>
                            <span className="font-black text-lg text-black">₹{booking.total_amount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'Profile' && (
          <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black text-black mb-6">Profile Settings</h2>
            <form onSubmit={handleProfileUpdate} className="max-w-xl space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  placeholder="E.g. John Doe"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-gray-50 text-black placeholder-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none transition-colors bg-gray-100 text-gray-500 cursor-not-allowed"
                  readOnly
                  title="Email cannot be changed"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  placeholder="E.g. +91 9876543210"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-gray-50 text-black placeholder-gray-400"
                />
              </div>
              
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={updatingProfile}
                  className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-black rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {updatingProfile ? (
                    <><Loader2 size={18} className="mr-2 animate-spin" /> Saving...</>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'Wishlist' && (
          <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-black text-black mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Save your favorite events here so you don't miss out on tickets.</p>
            <Link to="/events" className="inline-flex items-center justify-center px-8 py-3 bg-gray-100 hover:bg-gray-200 text-black font-bold rounded-xl transition-all">
              Browse Events
            </Link>
          </div>
        )}

        {activeTab === 'Settings' && (
          <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black text-black mb-6">Account Settings</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                <div>
                  <h4 className="font-bold text-black">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive booking confirmations and event updates.</p>
                </div>
                <div className="relative inline-block w-12 h-6 rounded-full bg-primary transition-colors cursor-pointer">
                  <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform translate-x-6"></span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                <div>
                  <h4 className="font-bold text-black">Marketing Emails</h4>
                  <p className="text-sm text-gray-500">Receive exclusive offers and personalized recommendations.</p>
                </div>
                <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200 transition-colors cursor-pointer">
                  <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform"></span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h4 className="font-bold text-red-500 mb-2">Danger Zone</h4>
                <p className="text-sm text-gray-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <button className="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 font-bold text-sm rounded-lg transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-8 right-8 md:bottom-12 md:right-12 z-50 flex items-center px-6 py-4 rounded-xl shadow-xl border transform transition-all animate-in slide-in-from-bottom-5 ${
          toast.type === 'success' 
            ? 'bg-white border-green-100 text-green-700' 
            : 'bg-white border-red-100 text-red-700'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="mr-3 text-green-500" size={24} />
          ) : (
            <XCircle className="mr-3 text-red-500" size={24} />
          )}
          <span className="font-bold text-sm text-black">{toast.message}</span>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="font-black text-xl text-black">Booking Details</h3>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Event Info</h4>
                <p className="font-black text-lg text-black mb-1">{selectedBooking.events?.title || 'Unknown Event'}</p>
                <div className="space-y-1 mt-3">
                  <p className="text-sm text-gray-600 flex items-center"><Calendar size={14} className="mr-2 text-primary"/> {new Date(selectedBooking.events?.event_date || selectedBooking.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="text-sm text-gray-600 flex items-center"><Clock size={14} className="mr-2 text-primary"/> {selectedBooking.events?.event_time?.substring(0, 5) || 'TBA'}</p>
                  <p className="text-sm text-gray-600 flex items-center"><MapPin size={14} className="mr-2 text-primary"/> {selectedBooking.events?.venue || 'TBA'}, {selectedBooking.events?.city || ''}</p>
                </div>
              </div>

              <div className="mb-6 pb-6 border-b border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Attendee Details</h4>
                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 font-medium">Name</span>
                    <span className="text-sm font-bold text-black">{name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 font-medium">Email</span>
                    <span className="text-sm font-bold text-black">{email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 font-medium">Phone</span>
                    <span className="text-sm font-bold text-black">{profile.phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Order Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Booking ID</span>
                    <span className="font-mono text-sm font-bold text-black">{selectedBooking.booking_ref}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tickets</span>
                    <span className="text-sm font-bold text-black">{selectedBooking.qty} Ticket(s)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className="text-xs font-black text-green-600 bg-green-100 px-2 py-1 rounded-md uppercase tracking-wider">{selectedBooking.status}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-1">
                    <span className="font-bold text-black">Total Paid</span>
                    <span className="font-black text-lg text-primary">₹{selectedBooking.total_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
