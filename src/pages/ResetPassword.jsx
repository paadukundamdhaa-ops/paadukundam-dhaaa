import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Swal from 'sweetalert2';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    // Check if we actually have a session from the reset link
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error || !session) {
        setSessionError(true);
      }
    });

    // Also listen for auth state changes (in case hash is processed after mount)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionError(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Passwords do not match',
        text: 'Please make sure both passwords match.',
        confirmButtonColor: '#e11d48'
      });
      return;
    }

    if (password.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Password too short',
        text: 'Password must be at least 6 characters long.',
        confirmButtonColor: '#e11d48'
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      await Swal.fire({
        icon: 'success',
        title: 'Password Updated!',
        text: 'Your password has been successfully reset. You can now log in.',
        confirmButtonColor: '#22c55e'
      });
      
      // Sign out to force them to log in with new credentials
      await supabase.auth.signOut();
      navigate('/login');

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.message || 'Could not update password. The link may have expired.',
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setLoading(false);
    }
  };

  if (sessionError) {
    return (
      <div className="min-h-screen bg-black w-full flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 xl:p-10 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound size={28} className="text-primary" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Link Expired or Invalid</h2>
          <p className="text-gray-500 text-sm mb-8">
            This password reset link is invalid, expired, or has already been used. Please request a new link.
          </p>
          <Link 
            to="/forgot-password"
            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
          >
            Request New Link <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black w-full flex relative overflow-hidden font-sans selection:bg-primary/30 selection:text-white">
      
      {/* BACKGROUND LAYERS */}
      <div className="absolute inset-0 w-full z-0 opacity-40">
        <img src="/images/sunburn.png" alt="Concert" className="w-full h-full object-cover blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-black"></div>
      </div>

      <div className="relative z-10 w-full flex items-center justify-center p-4">
        
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 xl:p-10 transform transition-all">
          
          <Link to="/" className="flex justify-center mb-8">
            <img src="/images/LOGO __ Option 02.png" alt="Logo" className="h-10" />
          </Link>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Create New Password</h2>
            <p className="text-gray-500 text-sm">
              Please enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group mt-4"
            >
              {loading ? (
                <><Loader2 size={20} className="animate-spin" /> Updating...</>
              ) : (
                <>Update Password <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
