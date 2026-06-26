import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Music2 } from 'lucide-react';

const FacebookIcon = ({size=18, className=""}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
const InstagramIcon = ({size=18, className=""}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const TwitterIcon = ({size=18, className=""}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>;
const YoutubeIcon = ({size=18, className=""}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>;

export default function Footer() {
  return (
    <footer className="bg-black pt-0 pb-6 border-t border-white/10 font-sans">
      
      {/* STAY IN THE LOOP BANNER */}
      <div className="bg-primary w-full py-8 mb-16">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="text-white mb-6 md:mb-0 md:w-1/2">
            <h3 className="text-2xl font-black mb-1 tracking-wide uppercase">Stay In The Loop</h3>
            <p className="text-white/80 text-sm">Subscribe to get updates on upcoming concerts, exclusive offers and more.</p>
          </div>
          <div className="flex w-full md:w-auto md:min-w-[400px]">
            <input type="email" placeholder="Enter your email address" className="bg-white text-black px-4 py-3 outline-none w-full text-sm" />
            <button className="bg-secondary text-black font-bold px-6 py-3 hover:bg-yellow-500 transition-colors whitespace-nowrap text-sm">
              Subscribe Now
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-10 mb-12 border-b border-white/10 pb-12">
        {/* Brand Column */}
        <div className="md:col-span-1">
          <Link to="/" className="flex items-center mb-6">
            <img src="/images/LOGO __ Option 01.png" alt="PaadukundamDhaa Logo" className="h-16 object-contain" />
          </Link>
          <p className="text-pale text-xs leading-relaxed mb-6 pr-4">
            Your gateway to the best live music experiences. Book, Enjoy, Repeat!
          </p>
          <div className="flex space-x-4">
            <FacebookIcon size={18} className="text-pale hover:text-white cursor-pointer" />
            <InstagramIcon size={18} className="text-pale hover:text-white cursor-pointer" />
            <TwitterIcon size={18} className="text-pale hover:text-white cursor-pointer" />
            <YoutubeIcon size={18} className="text-pale hover:text-white cursor-pointer" />
            <Music2 size={18} className="text-pale hover:text-white cursor-pointer" />
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-sm mb-4 text-white uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-3 text-pale text-xs">
            <li><Link to="/" className="hover:text-secondary transition-colors">Home</Link></li>
            <li><Link to="/events" className="hover:text-secondary transition-colors">Events</Link></li>
            <li><Link to="/events" className="hover:text-secondary transition-colors">Upcoming Concerts</Link></li>
            <li><Link to="/" className="hover:text-secondary transition-colors">Venues</Link></li>
            <li><Link to="/" className="hover:text-secondary transition-colors">Gallery</Link></li>
          </ul>
        </div>

        {/* Help Center */}
        <div>
          <h4 className="font-bold text-sm mb-4 text-white uppercase tracking-wider">Help Center</h4>
          <ul className="space-y-3 text-pale text-xs">
            <li><Link to="/" className="hover:text-secondary transition-colors">FAQs</Link></li>
            <li><Link to="/" className="hover:text-secondary transition-colors">How it Works</Link></li>
            <li><Link to="/terms-conditions" className="hover:text-secondary transition-colors">Terms & Conditions</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-secondary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/refund-policy" className="hover:text-secondary transition-colors">Refund Policy</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-bold text-sm mb-4 text-white uppercase tracking-wider">Company</h4>
          <ul className="space-y-3 text-pale text-xs">
            <li><Link to="/about" className="hover:text-secondary transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-secondary transition-colors">Contact Us</Link></li>
            <li><Link to="/" className="hover:text-secondary transition-colors">Careers</Link></li>
            <li><Link to="/" className="hover:text-secondary transition-colors">Blog</Link></li>
            <li><Link to="/" className="hover:text-secondary transition-colors">Press</Link></li>
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h4 className="font-bold text-sm mb-4 text-white uppercase tracking-wider">Contact Us</h4>
          <ul className="space-y-4 text-pale text-xs">
            <li className="flex items-start">
              <Phone size={14} className="mr-3 text-white shrink-0 mt-0.5" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-start">
              <Mail size={14} className="mr-3 text-white shrink-0 mt-0.5" />
              <span>support@paadukundamdhaa.com</span>
            </li>
            <li className="flex items-start">
              <MapPin size={14} className="mr-3 text-white shrink-0 mt-0.5" />
              <span className="leading-relaxed">PaadukundamDhaa Entertainment Pvt. Ltd.<br/>Mumbai, Maharashtra, India</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="text-center text-white/40 text-xs mt-6">
        &copy; {new Date().getFullYear()} PaadukundamDhaa. All Rights Reserved.
      </div>
    </footer>
  );
}
