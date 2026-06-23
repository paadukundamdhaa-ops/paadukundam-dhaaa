import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, EyeOff, Ticket, ShieldCheck, QrCode, Shield, Zap, Headphones, ArrowRight, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      setIsLoading(false);
      // Hardcoded Admin Credentials
      if (email === 'admin@paadukundamdhaa.com' && password === 'admin123') {
        navigate('/admin');
      } else {
        setError('Invalid admin credentials. Please try again.');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row font-sans relative bg-black">
      
      {/* Back to Website Button */}
      <Link 
        to="/" 
        className="absolute top-6 right-6 lg:top-10 lg:right-12 z-50 flex items-center gap-2 text-white/90 hover:text-white lg:text-gray-500 lg:hover:text-gray-900 transition-colors font-semibold text-sm bg-black/40 lg:bg-transparent px-4 py-2 lg:px-0 lg:py-0 rounded-full backdrop-blur-md lg:backdrop-blur-none border border-white/10 lg:border-none hover:scale-105 lg:hover:scale-100"
      >
        <ArrowLeft size={16} />
        <span className="hidden sm:inline">Back to Website</span>
        <span className="sm:hidden">Back</span>
      </Link>

      {/* --- DESKTOP BACKGROUND LAYERS --- */}
      <div className="hidden lg:block absolute inset-0 w-[55%] z-0">
        <img src="/images/sunburn.png" alt="Concert" className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
      </div>
      <div className="hidden lg:block absolute -top-[10%] -bottom-[10%] left-[45%] right-[-10%] bg-[#f8f9fa] border-l-[32px] border-[#8c1c24] transform -skew-x-[8deg] z-0 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"></div>

      {/* --- MOBILE BACKGROUND LAYER --- */}
      <div className="lg:hidden absolute inset-0 z-0 h-[55vh]">
        <img src="/images/sunburn.png" alt="Concert" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black"></div>
      </div>

      {/* --- CONTENT LAYERS --- */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full h-full">
        
        {/* --- DESKTOP LEFT PANEL --- */}
        <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 xl:p-16">
          <div>
            <Link to="/" className="flex items-center gap-3 mb-12">
              <div className="flex items-end space-x-[3px] h-8">
                <div className="w-2 bg-[#8c1c24] h-4 rounded-sm"></div>
                <div className="w-2 bg-[#8c1c24] h-7 rounded-sm"></div>
                <div className="w-2 bg-[#8c1c24] h-8 rounded-sm"></div>
                <div className="w-2 bg-[#8c1c24] h-5 rounded-sm"></div>
              </div>
              <span className="text-white font-black text-2xl tracking-tight leading-none uppercase">Paadukundam<br/>Dhaa</span>
            </Link>

            <h1 className="text-5xl xl:text-6xl font-black text-white mb-4 leading-tight tracking-tight">
              Admin <br/>
              <span className="text-[#facc15]">Portal</span>
            </h1>
            <div className="w-16 h-1 bg-[#facc15] mb-6"></div>
            
            <p className="text-gray-300 text-lg mb-10 max-w-sm font-medium leading-relaxed">
              Log in to access the dashboard, manage events, users, and ticket sales for the platform.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-full border border-[#facc15]/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="text-[#facc15]" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1 text-lg">Secure Access</h3>
                  <p className="text-gray-400 text-sm">Encrypted and secure admin environment.</p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-full border border-[#facc15]/30 flex items-center justify-center shrink-0">
                  <Zap className="text-[#facc15]" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1 text-lg">Live Analytics</h3>
                  <p className="text-gray-400 text-sm">Real-time stats and event monitoring.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-400 text-sm mt-12">
            <Shield size={18} />
            <span>Internal access only. Unauthorized entry is prohibited.</span>
          </div>
        </div>

        {/* --- MOBILE HEADER (Logo & Welcome Text) --- */}
        <div className="lg:hidden px-6 pt-10 pb-4 relative z-10">
          <div className="flex justify-between items-start mb-10">
             <Link to="/" className="flex items-center gap-2">
                <div className="flex items-end space-x-[2px] h-6">
                  <div className="w-1.5 bg-[#8c1c24] h-3 rounded-sm"></div>
                  <div className="w-1.5 bg-[#8c1c24] h-5 rounded-sm"></div>
                  <div className="w-1.5 bg-[#8c1c24] h-6 rounded-sm"></div>
                  <div className="w-1.5 bg-[#8c1c24] h-4 rounded-sm"></div>
                </div>
                <span className="text-white font-black text-sm tracking-tight leading-none uppercase">Paadukundam<br/>Dhaa</span>
             </Link>
             <div className="flex items-center gap-1 text-gray-300 text-xs border border-white/20 rounded-full px-3 py-1 bg-black/40 backdrop-blur-sm cursor-pointer">
                <span>🛡️</span> Admin <span className="ml-1 text-[10px]">▼</span>
             </div>
          </div>

          <div className="flex justify-between items-start relative mt-4">
             <div className="w-[65%]">
               <h1 className="text-4xl font-black text-white leading-tight">Admin <span className="text-[#facc15]">Portal</span></h1>
               <p className="text-gray-300 text-[13px] mt-3 font-medium leading-relaxed">Secure access to <br/>manage platform</p>
             </div>
             
             {/* Mobile Graphic */}
             <div className="absolute right-[-10px] top-[-20px] transform -rotate-[12deg] z-20">
                 <div className="px-5 py-4 bg-[#6b151b] rounded-xl shadow-2xl flex flex-col items-center justify-center border-dashed border border-white/20 relative">
                    <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-black rounded-full"></div>
                    <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-black rounded-full"></div>
                    <ShieldCheck size={24} className="text-[#facc15] mb-2 opacity-80" />
                    <span className="text-white font-black text-[10px] tracking-widest uppercase mt-1">SECURE</span>
                 </div>
             </div>
          </div>
        </div>

        {/* --- RIGHT PANEL (Form Container) --- */}
        <div className="w-full lg:w-[55%] flex flex-col px-5 pb-8 lg:pt-6 lg:pb-6 lg:px-6 sm:px-12 items-center justify-center flex-1 z-10">
          
          {/* Main Card */}
          <div className="w-full max-w-[420px] bg-[#120a0b] lg:bg-white rounded-[24px] lg:rounded-[30px] p-6 sm:p-8 border border-[#2a1618] lg:border-gray-50 shadow-2xl lg:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] mb-4 lg:mb-8 relative z-10 mt-6 lg:mt-auto">
            
            {/* Desktop Header (Hidden on Mobile) */}
            <div className="hidden lg:block text-center mb-6">
              <div className="inline-flex justify-center mb-4">
                 <div className="px-6 h-10 bg-[#8c1c24] rounded-lg shadow-lg transform -rotate-[8deg] flex items-center justify-center border-dashed border-2 border-white/30 relative">
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full"></div>
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full"></div>
                    <span className="text-white font-black text-[10px] tracking-widest uppercase">ADMIN ACCESS</span>
                 </div>
              </div>

              <h2 className="text-2xl font-black text-gray-900 mb-1">
                Admin <span className="text-[#8c1c24]">Login</span>
              </h2>
              <p className="text-gray-500 text-xs font-medium">Please verify your identity to access the dashboard.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 lg:space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 lg:pl-3.5 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-500 lg:text-gray-400" />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent lg:bg-white border border-[#2a1618] lg:border-gray-200 rounded-xl py-3 lg:py-2.5 pl-11 pr-4 text-white lg:text-gray-900 font-medium text-[14px] lg:text-sm focus:border-[#8c1c24] focus:ring-1 focus:ring-[#8c1c24] outline-none transition-all placeholder:text-gray-600 lg:placeholder:text-gray-400 placeholder:font-normal" 
                  placeholder="admin@paadukundamdhaa.com" 
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 lg:pl-3.5 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-500 lg:text-gray-400" />
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent lg:bg-white border border-[#2a1618] lg:border-gray-200 rounded-xl py-3 lg:py-2.5 pl-11 pr-10 text-white lg:text-gray-900 font-medium text-[14px] lg:text-sm focus:border-[#8c1c24] focus:ring-1 focus:ring-[#8c1c24] outline-none transition-all placeholder:text-gray-600 lg:placeholder:text-gray-400 placeholder:font-normal" 
                  placeholder="Password" 
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-4 lg:pr-3.5 flex items-center text-gray-500 lg:text-gray-400 hover:text-gray-300 lg:hover:text-gray-600">
                  <EyeOff size={18} />
                </button>
              </div>

              {error && (
                <div className="text-red-500 text-sm font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between pt-1 lg:pt-1.5 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 lg:w-3.5 lg:h-3.5 rounded border-[#2a1618] lg:border-gray-300 bg-transparent lg:bg-white text-[#8c1c24] focus:ring-[#8c1c24] accent-[#8c1c24]" />
                  <span className="text-[13px] lg:text-[13px] font-medium text-gray-400 lg:text-gray-700">Remember me</span>
                </label>
                <a href="#" className="text-[13px] lg:text-[13px] font-bold text-[#facc15] lg:text-[#8c1c24] hover:text-[#eab308] lg:hover:text-[#6b151b] transition-colors">Forgot Password?</a>
              </div>

              <div className="pt-3 lg:pt-2">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-[#8c1c24] hover:bg-[#6b151b] text-white font-bold py-3.5 lg:py-3 text-[15px] lg:text-sm rounded-xl transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Authenticating...' : (
                    <>Log In to Dashboard <ArrowRight size={18} /></>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 lg:mt-6 text-center text-[12px] font-medium text-gray-500 lg:text-gray-400">
              <Shield size={14} className="inline-block mr-1 -mt-0.5" />
              Secure Admin Access Only
            </div>

            {/* --- MOBILE BOTTOM BADGES (Inside Card) --- */}
            <div className="lg:hidden mt-8 pt-6 border-t border-[#2a1618] grid grid-cols-2 gap-4">
               <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-8 h-8 rounded-full border border-[#facc15]/20 flex items-center justify-center bg-[#facc15]/5">
                     <ShieldCheck size={14} className="text-[#facc15]" />
                  </div>
                  <div className="leading-none">
                     <div className="text-[9px] text-white font-bold tracking-wide mb-0.5">Secure</div>
                     <div className="text-[8px] text-gray-500">Access</div>
                  </div>
               </div>
               <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-8 h-8 rounded-full border border-[#facc15]/20 flex items-center justify-center bg-[#facc15]/5">
                     <Zap size={14} className="text-[#facc15]" />
                  </div>
                  <div className="leading-none">
                     <div className="text-[9px] text-white font-bold tracking-wide mb-0.5">Live</div>
                     <div className="text-[8px] text-gray-500">Monitoring</div>
                  </div>
               </div>
            </div>
          </div>

          {/* --- DESKTOP BOTTOM BADGES (Outside Card) --- */}
          <div className="hidden lg:grid w-full max-w-[420px] grid-cols-2 gap-4 mt-auto opacity-80">
            <div className="flex items-center gap-3 justify-start">
              <div className="w-10 h-10 rounded-full border border-[#8c1c24]/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="text-[#8c1c24]" size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Secure</span>
                <span className="text-[10px] text-gray-500">Access</span>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-start">
              <div className="w-10 h-10 rounded-full border border-[#8c1c24]/20 flex items-center justify-center shrink-0">
                <Zap className="text-[#8c1c24]" size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Live</span>
                <span className="text-[10px] text-gray-500">Monitoring</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
