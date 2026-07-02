import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Swal from 'sweetalert2';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);

    try {
      // Send reset password email via Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSubmitted(true);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Reset Failed',
        text: error.message || 'Could not send reset link. Please check the email address.',
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setLoading(false);
    }
  };

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

          {!submitted ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound size={28} className="text-primary" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Forgot Password?</h2>
                <p className="text-gray-500 text-sm">
                  Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group mt-2"
                >
                  {loading ? (
                    <><Loader2 size={20} className="animate-spin" /> Sending Link...</>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-500 text-sm mb-8">
                We sent a password reset link to <span className="font-bold text-gray-800">{email}</span>. Click the link in the email to set a new password.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-sm font-bold text-primary hover:text-red-700 transition-colors"
              >
                Try a different email address
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-primary transition-colors">
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
