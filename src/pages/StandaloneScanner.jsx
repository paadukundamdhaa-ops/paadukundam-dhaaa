import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Html5Qrcode } from 'html5-qrcode';
import { CheckCircle, XCircle, AlertTriangle, User, Ticket, Calendar, LogOut, ShieldCheck, QrCode } from 'lucide-react';

export default function StandaloneScanner() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [stats, setStats] = useState({ total: 0, checkedIn: 0 });
  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    if (localStorage.getItem('scanner_auth') !== 'true') {
      navigate('/scanner');
      return;
    }

    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });
      if (!error && data) {
        setEvents(data);
        if (data.length > 0) setSelectedEventId(data[0].id);
      }
    };
    fetchEvents();
  }, [navigate]);

  useEffect(() => {
    if (!selectedEventId) return;

    const fetchStats = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('qty, check_in_status')
        .eq('event_id', selectedEventId);
      
      if (!error && data) {
        let total = 0;
        let checkedIn = 0;
        data.forEach(b => {
          total += b.qty;
          if (b.check_in_status === 'allowed') checkedIn += b.qty;
        });
        setStats({ total, checkedIn });
      }
    };
    
    fetchStats();
  }, [selectedEventId, scanResult]);

  const handleLogout = () => {
    localStorage.removeItem('scanner_auth');
    navigate('/scanner');
  };

  const startScanner = () => {
    if (!selectedEventId) {
      alert("Please select an event first!");
      return;
    }
    setScanning(true);
    setScanResult(null);
    isProcessingRef.current = false;

    setTimeout(() => {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (isProcessingRef.current) return;
          isProcessingRef.current = true;
          
          if (scannerRef.current) {
            scannerRef.current.stop().then(() => {
              setScanning(false);
              verifyTicket(decodedText);
            }).catch(err => {
              console.error("Failed to stop scanner", err);
              setScanning(false);
              verifyTicket(decodedText);
            });
          }
        },
        (errorMessage) => {
          // parse errors are normal (no qr code found in frame)
        }
      ).catch(err => {
        console.error("Error starting scanner", err);
        alert("Failed to start camera. Please check permissions.");
        setScanning(false);
      });
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        setScanning(false);
      }).catch(err => console.error("Error stopping", err));
    } else {
      setScanning(false);
    }
  };

  const verifyTicket = async (ticketUrl) => {
    try {
      const match = ticketUrl.match(/#?BK-\d+/);
      const bookingRef = match ? match[0] : ticketUrl;
      const searchRef = bookingRef.startsWith('#') ? bookingRef : `#${bookingRef}`;

      const { data, error } = await supabase
        .from('bookings')
        .select('*, events(*), profiles(*)')
        .eq('booking_ref', searchRef)
        .eq('event_id', selectedEventId)
        .single();

      if (error || !data) {
        setScanResult({
          status: 'invalid',
          message: 'Ticket not found for this event.',
          ref: searchRef
        });
        return;
      }

      setScanResult({
        status: data.check_in_status === 'allowed' ? 'already_scanned' : 'valid',
        data
      });

    } catch (err) {
      setScanResult({ status: 'invalid', message: 'Error verifying ticket.' });
    }
  };

  const updateCheckInStatus = async (status) => {
    if (!scanResult || !scanResult.data) return;
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          check_in_status: status,
          checked_in_at: new Date().toISOString()
        })
        .eq('id', scanResult.data.id);

      if (error) throw error;

      // Add to recent scans
      setRecentScans(prev => [
        { ...scanResult.data, scan_status: status, scan_time: new Date() },
        ...prev
      ].slice(0, 10)); // Keep only last 10

      // Clear result to scan next
      setScanResult(null);
      startScanner(); // auto restart scanner

    } catch (err) {
      alert("Failed to update status.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      {/* Top Bar */}
      <div className="bg-zinc-900 p-4 border-b border-zinc-800 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <QrCode className="text-primary w-6 h-6" />
          <h1 className="font-black text-lg tracking-tight">Scanner</h1>
        </div>
        <button onClick={handleLogout} className="text-zinc-400 hover:text-white flex items-center gap-1 text-sm font-bold bg-zinc-800 px-3 py-1.5 rounded-lg transition-colors">
          <LogOut size={16} /> Exit
        </button>
      </div>

      <div className="flex-1 p-4 flex flex-col max-w-lg w-full mx-auto">
        
        {/* Event Selector */}
        <div className="bg-zinc-900 p-4 rounded-2xl mb-6 border border-zinc-800 shadow-xl">
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Active Event</label>
          <select 
            className="w-full bg-black border border-zinc-700 text-white rounded-xl p-3 outline-none focus:border-primary font-bold transition-colors"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            disabled={scanning || scanResult}
          >
            <option value="">Select Event to Scan</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>{e.title} ({e.city})</option>
            ))}
          </select>
          
          {selectedEventId && (
            <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4">
              <div className="text-center w-1/2 border-r border-zinc-800">
                <p className="text-xs text-zinc-500 font-bold uppercase">Total Tickets</p>
                <p className="text-xl font-black">{stats.total}</p>
              </div>
              <div className="text-center w-1/2">
                <p className="text-xs text-zinc-500 font-bold uppercase">Checked In</p>
                <p className="text-xl font-black text-green-500">{stats.checkedIn}</p>
              </div>
            </div>
          )}
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col items-center justify-center">
          
          {!scanning && !scanResult && (
            <div className="text-center w-full">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <QrCode className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-black mb-2">Ready to Scan</h2>
              <p className="text-zinc-400 mb-8 max-w-xs mx-auto">Point your camera at a ticket's QR code to verify entry.</p>
              <button 
                onClick={startScanner}
                className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-primary/20 text-lg"
              >
                Start Camera
              </button>
            </div>
          )}

          {/* Scanner View */}
          <div className={`w-full bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border-2 ${scanning ? 'border-primary' : 'hidden'}`}>
            <div id="qr-reader" className="w-full"></div>
            <div className="p-4 bg-zinc-900 text-center">
              <button 
                onClick={stopScanner}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-full font-bold text-sm transition-colors"
              >
                Cancel Scanning
              </button>
            </div>
          </div>

          {/* Result View */}
          {scanResult && (
            <div className="w-full bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              {scanResult.status === 'valid' && (
                <div className="p-6 text-center bg-green-500/10 border-b border-green-500/20">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
                  <h3 className="text-2xl font-black text-green-500">VALID TICKET</h3>
                  <p className="text-green-400 font-bold text-sm">{scanResult.data.booking_ref}</p>
                </div>
              )}

              {scanResult.status === 'already_scanned' && (
                <div className="p-6 text-center bg-yellow-500/10 border-b border-yellow-500/20">
                  <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-2" />
                  <h3 className="text-2xl font-black text-yellow-500">ALREADY SCANNED</h3>
                  <p className="text-yellow-400 font-bold text-sm">Checked in at: {new Date(scanResult.data.checked_in_at).toLocaleTimeString()}</p>
                </div>
              )}

              {scanResult.status === 'invalid' && (
                <div className="p-6 text-center bg-red-500/10 border-b border-red-500/20">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-2" />
                  <h3 className="text-2xl font-black text-red-500">INVALID TICKET</h3>
                  <p className="text-red-400 font-bold text-sm">{scanResult.message || 'Ticket not found'}</p>
                </div>
              )}

              {/* Data Section */}
              {scanResult.data && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-zinc-500" />
                    <div>
                      <p className="text-sm text-zinc-400 font-bold uppercase text-[10px]">Attendee Name</p>
                      <p className="font-bold text-white">{scanResult.data.profiles?.name || scanResult.data.profiles?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Ticket className="w-5 h-5 text-zinc-500" />
                    <div>
                      <p className="text-sm text-zinc-400 font-bold uppercase text-[10px]">Ticket Quantity</p>
                      <p className="font-black text-xl text-white">{scanResult.data.qty} <span className="text-sm font-medium text-zinc-500">Admissions</span></p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions Section */}
              <div className="p-4 bg-black grid grid-cols-2 gap-3">
                {scanResult.status === 'valid' ? (
                  <>
                    <button 
                      onClick={() => updateCheckInStatus('denied')}
                      className="py-4 rounded-xl font-black text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                    >
                      DENY
                    </button>
                    <button 
                      onClick={() => updateCheckInStatus('allowed')}
                      className="py-4 rounded-xl font-black text-white bg-green-500 hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                    >
                      ALLOW ENTRY
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={startScanner}
                    className="col-span-2 py-4 rounded-xl font-black text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    SCAN ANOTHER
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
