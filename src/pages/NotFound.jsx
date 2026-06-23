import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <h1 className="text-9xl font-black text-black opacity-5">404</h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tight">Oops!</h2>
        </div>
      </div>
      
      <p className="text-lg text-gray-600 font-medium mb-8 max-w-md mx-auto">
        We searched everywhere, but we couldn't find the page you're looking for. It might have been moved or deleted.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link to="/" className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-black py-4 px-8 rounded-xl shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center">
          <Home size={18} className="mr-2" /> Back to Home
        </Link>
        <Link to="/events" className="w-full sm:w-auto bg-white border border-gray-200 hover:border-gray-300 text-black font-black py-4 px-8 rounded-xl shadow-sm transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center">
          <Search size={18} className="mr-2" /> Browse Events
        </Link>
      </div>
    </div>
  );
}
