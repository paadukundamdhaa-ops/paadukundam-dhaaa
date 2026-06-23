import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Events', path: '/events' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 border-b border-white/5 ${isScrolled ? 'bg-black/90 backdrop-blur-md py-3 shadow-lg' : 'bg-black/60 backdrop-blur-sm py-4'}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          {/* Mock Soundwave Icon */}
          <div className="flex items-end space-x-[2px] h-8">
            <div className="w-1 bg-primary h-3"></div>
            <div className="w-1 bg-primary h-6"></div>
            <div className="w-1 bg-primary h-8"></div>
            <div className="w-1 bg-primary h-5"></div>
            <div className="w-1 bg-primary h-4"></div>
          </div>
          <div className="flex flex-col uppercase tracking-wider leading-none font-black text-xl">
            <span className="text-white">Paadukundam</span>
            <span className="text-white">Dhaa</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-6 text-sm font-semibold">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`transition-colors relative ${isActive ? 'text-secondary' : 'text-white hover:text-secondary'}`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-secondary"></span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center space-x-5">
          <button className="text-white hover:text-secondary transition-colors">
            <Search size={20} />
          </button>
          <button className="text-white hover:text-secondary transition-colors relative">
            <ShoppingBag size={20} />
            <span className="absolute -top-2 -right-2 bg-secondary text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">2</span>
          </button>
          <Link to="/login" className="bg-primary/20 border border-primary text-white hover:bg-primary px-5 py-2 rounded-full text-sm font-semibold transition-colors">
            Login / Register
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-black border-t border-white/10 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-secondary text-lg"
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-white/10 my-2"></div>
              <div className="flex items-center justify-between">
                <button className="text-white flex items-center"><ShoppingBag className="mr-2" /> Cart (2)</button>
              </div>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="bg-primary text-center text-white px-6 py-3 rounded-full font-medium border border-primary">
                Login / Register
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
