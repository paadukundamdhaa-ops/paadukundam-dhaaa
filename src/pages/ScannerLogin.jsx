import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Ticket, ShieldCheck, QrCode, Shield, Zap, Headphones, ArrowRight, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function ScannerLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Dummy credentials as requested
    setTimeout(() => {
      if (username === 'scanner' && password === '123456') {
        localStorage.setItem('scanner_auth', 'true');
        navigate('/scanner/app');
      } else {
        setError('Invalid username or password');
        setLoading(false);
      }
    }, 500);
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
              <img src="/images/LOGO __ Option 01.png" alt="Paadukundam Dhaa Logo" className="h-12" />
            </Link>

            <h1 className="text-5xl xl:text-6xl font-black text-white mb-4 leading-tight tracking-tight">
              Scanner <br/>
              <span className="text-[#facc15]">Portal</span>
            </h1>
            <div className="w-16 h-1 bg-[#facc15] mb-6"></div>
            
            <p className="text-gray-300 text-lg mb-10 max-w-sm font-medium leading-relaxed">
              Authorized personnel only. Log in to scan tickets and manage entry at the door.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-full border border-[#facc15]/30 flex items-center justify-center shrink-0">
                  <QrCode className="text-[#facc15]" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1 text-lg">Fast Scanning</h3>
                  <p className="text-gray-400 text-sm">Lightning-fast QR code verification.</p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-full border border-[#facc15]/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="text-[#facc15]" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1 text-lg">Secure Access</h3>
                  <p className="text-gray-400 text-sm">Prevent duplicate entries effortlessly.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-400 text-sm mt-12">
            <Shield size={18} />
            <span>Your data is safe with us. We never share your information.</span>
          </div>
        </div>

        {/* --- MOBILE HEADER (Logo & Welcome Text) --- */}
        <div className="lg:hidden px-6 pt-10 pb-4 relative z-10">
          <div className="flex justify-between items-start mb-10">
             <Link to="/" className="flex items-center gap-2">
                <img src="/images/LOGO __ Option 01.png" alt="Paadukundam Dhaa Logo" className="h-8" />
             </Link>
             <div className="flex items-center gap-1 text-gray-300 text-xs border border-white/20 rounded-full px-3 py-1 bg-black/40 backdrop-blur-sm cursor-pointer">
                <span>🌐</span> English <span className="ml-1 text-[10px]">▼</span>
             </div>
          </div>

          <div className="flex justify-between items-start relative mt-4">
             <div className="w-[65%]">
               <h1 className="text-4xl font-black text-white leading-tight">Scanner <span className="text-[#facc15]">Login</span></h1>
               <p className="text-gray-300 text-[13px] mt-3 font-medium leading-relaxed">Log in to verify<br/>event tickets</p>
             </div>
             
             {/* Mobile Ticket Graphic */}
             <div className="absolute right-[-10px] top-[-20px] transform -rotate-[12deg] z-20">
                 <div className="px-5 py-4 bg-[#6b151b] rounded-xl shadow-2xl flex flex-col items-center justify-center border-dashed border border-white/20 relative">
                    <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-black rounded-full"></div>
                    <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-black rounded-full"></div>
                    <div className="flex items-center gap-1.5 mb-2 opacity-80">
                       <span className="text-[#facc15] text-[10px]">★</span>
                       <span className="text-[#facc15] text-[8px]">★</span>
                       <span className="text-[#facc15] text-[10px]">★</span>
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      <div className="flex items-end space-x-[1px] h-4">
                        <div className="w-1.5 bg-[#8c1c24] h-2"></div>
                        <div className="w-1.5 bg-[#8c1c24] h-3.5"></div>
                        <div className="w-1.5 bg-[#8c1c24] h-4"></div>
                        <div className="w-1.5 bg-[#8c1c24] h-2.5"></div>
                      </div>
                    </div>
                    <span className="text-white font-black text-[10px] tracking-widest uppercase mt-1">SCANNER</span>
                 </div>
             </div>
          </div>
        </div>

        {/* --- RIGHT PANEL (Form Container) --- */}
        <div className="w-full lg:w-[55%] flex flex-col px-5 pb-8 lg:pt-6 lg:pb-6 lg:px-6 sm:px-12 items-center justify-center flex-1 z-10">
          
          {/* Main Card */}
          <div className="w-full max-w-[420px] bg-[#120a0b] lg:bg-white rounded-[24px] lg:rounded-[30px] p-6 sm:p-8 border border-[#2a1618] lg:border-gray-50 shadow-2xl lg:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] mb-4 lg:mb-8 relative z-10 mt-6 lg:mt-0">
            
            {/* Desktop Header (Hidden on Mobile) */}
            <div className="hidden lg:block text-center mb-5">
              <div className="inline-flex justify-center mb-4">
                 <img src="/images/LOGO __ Option 02.png" alt="Paadukundam Dhaa Logo" className="h-12" />
              </div>

              <h2 className="text-2xl font-black text-gray-900 mb-1">
                Scanner <span className="text-[#8c1c24]">Access</span>
              </h2>
              <p className="text-gray-500 text-xs font-medium">Log in with your assigned credentials to start scanning.</p>
            </div>

            {error && (
              <div className="bg-red-500/10 lg:bg-red-50 border border-red-500/20 lg:border-red-100 text-red-500 lg:text-red-600 p-3 rounded-xl text-sm font-bold flex items-center gap-2 mb-4">
                <Lock size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 lg:space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 lg:pl-3.5 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-500 lg:text-gray-400" />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent lg:bg-white border border-[#2a1618] lg:border-gray-200 rounded-xl py-3 lg:py-2.5 pl-11 pr-4 text-white lg:text-gray-900 font-medium text-[14px] lg:text-sm focus:border-[#8c1c24] focus:ring-1 focus:ring-[#8c1c24] outline-none transition-all placeholder:text-gray-600 lg:placeholder:text-gray-400 placeholder:font-normal" 
                  placeholder="Scanner ID" 
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 lg:pl-3.5 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-500 lg:text-gray-400" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent lg:bg-white border border-[#2a1618] lg:border-gray-200 rounded-xl py-3 lg:py-2.5 pl-11 pr-10 text-white lg:text-gray-900 font-medium text-[14px] lg:text-sm focus:border-[#8c1c24] focus:ring-1 focus:ring-[#8c1c24] outline-none transition-all placeholder:text-gray-600 lg:placeholder:text-gray-400 placeholder:font-normal" 
                  placeholder="Scanner Password" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 lg:pr-3.5 flex items-center text-gray-500 lg:text-gray-400 hover:text-gray-300 lg:hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              <div className="flex items-center justify-between pt-1 lg:pt-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 lg:w-3.5 lg:h-3.5 rounded border-[#2a1618] lg:border-gray-300 bg-transparent lg:bg-white text-[#8c1c24] focus:ring-[#8c1c24] accent-[#8c1c24]" />
                  <span className="text-[13px] lg:text-[13px] font-medium text-gray-400 lg:text-gray-700">Remember me</span>
                </label>
                <a href="#" className="text-[13px] lg:text-[13px] font-bold text-[#facc15] lg:text-[#8c1c24] hover:text-[#eab308] lg:hover:text-[#6b151b] transition-colors">Forgot Password?</a>
              </div>

              <div className="pt-3 lg:pt-2">
                <button disabled={loading} type="submit" className="w-full flex items-center justify-center gap-2 bg-[#8c1c24] hover:bg-[#6b151b] text-white font-bold py-3.5 lg:py-2.5 text-[15px] lg:text-sm rounded-xl transition-all shadow-md disabled:opacity-50">
                  {loading ? 'Authenticating...' : <><QrCode size={18} /> Start Scanning</>}
                </button>
              </div>
            </form>

            {/* --- MOBILE BOTTOM BADGES (Inside Card) --- */}
            <div className="lg:hidden mt-8 pt-6 border-t border-[#2a1618] grid grid-cols-4 gap-2">
               <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-8 h-8 rounded-full border border-[#facc15]/20 flex items-center justify-center bg-[#facc15]/5">
                     <ShieldCheck size={14} className="text-[#facc15]" />
                  </div>
                  <div className="leading-none">
                     <div className="text-[9px] text-white font-bold tracking-wide mb-0.5">Secure</div>
                     <div className="text-[8px] text-gray-500">Payments</div>
                  </div>
               </div>
               <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-8 h-8 rounded-full border border-[#facc15]/20 flex items-center justify-center bg-[#facc15]/5">
                     <Zap size={14} className="text-[#facc15]" />
                  </div>
                  <div className="leading-none">
                     <div className="text-[9px] text-white font-bold tracking-wide mb-0.5">Instant</div>
                     <div className="text-[8px] text-gray-500">Confirmation</div>
                  </div>
               </div>
               <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-8 h-8 rounded-full border border-[#facc15]/20 flex items-center justify-center bg-[#facc15]/5">
                     <Ticket size={14} className="text-[#facc15]" />
                  </div>
                  <div className="leading-none">
                     <div className="text-[9px] text-white font-bold tracking-wide mb-0.5">Easy</div>
                     <div className="text-[8px] text-gray-500">Booking</div>
                  </div>
               </div>
               <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-8 h-8 rounded-full border border-[#facc15]/20 flex items-center justify-center bg-[#facc15]/5">
                     <Headphones size={14} className="text-[#facc15]" />
                  </div>
                  <div className="leading-none">
                     <div className="text-[9px] text-white font-bold tracking-wide mb-0.5">24/7</div>
                     <div className="text-[8px] text-gray-500">Support</div>
                  </div>
               </div>
            </div>
          </div>

          {/* --- DESKTOP BOTTOM BADGES (Outside Card) --- */}
          <div className="hidden lg:grid w-full max-w-[600px] grid-cols-4 gap-4 mt-16 opacity-80">
            <div className="flex items-center gap-3 justify-start">
              <div className="w-10 h-10 rounded-full border border-[#8c1c24]/20 flex items-center justify-center shrink-0">
                <Lock className="text-[#8c1c24]" size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Secure</span>
                <span className="text-[10px] text-gray-500">Payments</span>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-start">
              <div className="w-10 h-10 rounded-full border border-[#8c1c24]/20 flex items-center justify-center shrink-0">
                <Zap className="text-[#8c1c24]" size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Instant</span>
                <span className="text-[10px] text-gray-500">Confirmation</span>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-start">
              <div className="w-10 h-10 rounded-full border border-[#8c1c24]/20 flex items-center justify-center shrink-0">
                <Ticket className="text-[#8c1c24]" size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Easy</span>
                <span className="text-[10px] text-gray-500">Booking</span>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-start">
              <div className="w-10 h-10 rounded-full border border-[#8c1c24]/20 flex items-center justify-center shrink-0">
                <Headphones className="text-[#8c1c24]" size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">24/7</span>
                <span className="text-[10px] text-gray-500">Support</span>
              </div>
            </div>
          </div>

          {/* --- MOBILE SAFE TEXT (Outside Card) --- */}
          <div className="lg:hidden flex items-center gap-2 text-gray-400 text-[11px] mt-4 mb-2 justify-center w-full font-medium">
             <ShieldCheck size={14} className="text-[#facc15]" />
             <span>Your data is safe with us. We never share your information.</span>
          </div>

        </div>
      </div>
    </div>
  );
}
