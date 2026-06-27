import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, 
  Users, 
  Music, 
  Ticket, 
  ShoppingBag, 
  Image as ImageIcon, 
  Home, 
  Settings, 
  LogOut, 
  Menu, 
  Bell,
  Search,
  X,
  Tag,
  Store
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
  { name: 'Box Office', path: '/admin/box-office', icon: <Store size={20} /> },
  { name: 'Home Page CMS', path: '/admin/home-cms', icon: <Home size={20} /> },
  { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
  { name: 'Events', path: '/admin/events', icon: <Music size={20} /> },
  { name: 'Tickets', path: '/admin/tickets', icon: <Ticket size={20} /> },
  { name: 'Bookings', path: '/admin/bookings', icon: <ShoppingBag size={20} /> },
  { name: 'Scanner', path: '/admin/scanner', icon: <Search size={20} /> },
  { name: 'Gallery', path: '/admin/gallery', icon: <ImageIcon size={20} /> },
  { name: 'Promo Codes', path: '/admin/promocodes', icon: <Tag size={20} /> },
  { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
];

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);

  const isDummyAuth = localStorage.getItem('admin_auth_dummy') === 'true';

  useEffect(() => {
    if (isDummyAuth) {
      setIsAdmin(true);
      setRoleLoading(false);
      return;
    }

    const checkRole = async () => {
      if (authLoading) return;
      
      if (!user) {
        setRoleLoading(false);
        return;
      }

      // Hardcoded Admin Emails Check
      const ADMIN_EMAILS = [
        'sirisairavitejateeda@gmail.com',
        'jnaneshwarmoturi123@gmail.com',
        'iamdesign81@gmail.com',
        'balajirockzz9030@gmail.com', // For testing
        'balajiprojects049@gmail.com' // For testing
      ];
      if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        setIsAdmin(true);
        setRoleLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setIsAdmin(data?.role === 'admin');
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setRoleLoading(false);
      }
    };

    if (!isDummyAuth) {
      checkRole();
    }
  }, [user, authLoading, isDummyAuth]);

  const handleLogout = async () => {
    localStorage.removeItem('admin_auth_dummy');
    await signOut();
    navigate('/admin/login');
  };

  if (!isDummyAuth && (authLoading || roleLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isDummyAuth && (!user || !isAdmin)) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-20">
        <div className="p-6 border-b border-gray-200 flex items-center justify-center">
          <img src="/images/LOGO __ Option 02.png" alt="PaadukundamDhaa Admin" className="h-16 object-contain" />
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 hide-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-semibold text-gray-600 hover:bg-red-50 hover:text-primary transition-all duration-200"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="w-64 bg-white h-full shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src="/images/LOGO __ Option 02.png" alt="PaadukundamDhaa Admin" className="h-12 object-contain" />
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-primary">
                <X size={24} />
              </button>
            </div>
            
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary text-white shadow-md' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-gray-600 hover:text-primary"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            
            {/* Search Bar */}
            <div className="hidden lg:flex items-center bg-gray-100 rounded-full px-4 py-2 w-64 focus-within:ring-2 ring-primary/20 transition-all">
              <Search size={18} className="text-gray-400 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none w-full text-sm text-black placeholder-gray-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-black transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 cursor-pointer group">
              <img 
                src={`/images/${user?.email?.split('@')[0]}.jpg`}
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = "https://ui-avatars.com/api/?name=" + (user?.email?.split('@')[0] || 'Admin') + "&background=8c1c24&color=fff";
                }}
                alt="Admin" 
                className="w-8 h-8 rounded-full object-cover border-2 border-transparent group-hover:border-[#8c1c24] transition-all bg-gray-200"
              />
              <div className="hidden sm:block text-sm">
                <p className="font-bold text-black leading-tight">
                  {user?.email?.split('@')[0] || 'Admin User'}
                </p>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Superadmin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
