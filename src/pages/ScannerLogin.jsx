import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Lock, ShieldCheck } from 'lucide-react';

export default function ScannerLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Dummy credentials as requested (you can change these later)
    setTimeout(() => {
      if (username === 'scanner' && password === '123456') {
        localStorage.setItem('scanner_auth', 'true');
        navigate('/scanner');
      } else {
        setError('Invalid username or password');
        setLoading(false);
      }
    }, 500); // Simulate brief network delay
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <QrCode className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-black tracking-tight">Scanner Portal</h1>
          <p className="text-gray-500 font-medium mt-2">Authorized event staff only</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
                <Lock size={16} /> {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-black focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Enter scanner username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-black focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Enter scanner password"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-primary/30 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : (
                <>
                  <ShieldCheck size={20} /> Login to Scanner
                </>
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center text-sm font-bold text-gray-400 mt-8">
          &copy; {new Date().getFullYear()} PaadukundamDhaa
        </p>
      </div>
    </div>
  );
}
