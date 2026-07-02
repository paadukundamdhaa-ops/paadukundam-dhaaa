import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Swal from 'sweetalert2';
import { Html5Qrcode } from 'html5-qrcode';
import { CheckCircle, XCircle, AlertTriangle, User, Ticket, Calendar, LogOut, ShieldCheck, QrCode, Flashlight, Wifi, WifiOff, RefreshCw, Database } from 'lucide-react';

const playSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch(e) { console.error("Audio error", e) }
};

export default function StandaloneScanner() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [stats, setStats] = useState({ total: 0, checkedIn: 0 });
  const [partialQty, setPartialQty] = useState(1);
  const [offlineMode, setOfflineMode] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [queuedScansCount, setQueuedScansCount] = useState(0);
  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false);
  const navigate = useNavigate();

  // Load queued scans count on mount
  useEffect(() => {
    const queued = JSON.parse(localStorage.getItem('scanner_queued_scans') || '[]');
    setQueuedScansCount(queued.length);
  }, []);

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
      let data = [];
      if (offlineMode) {
        data = JSON.parse(localStorage.getItem(`scanner_offline_data_${selectedEventId}`) || '[]');
      } else {
        const { data: remoteData, error } = await supabase
          .from('bookings')
          .select('qty, checked_in_qty')
          .eq('event_id', selectedEventId);
        if (!error && remoteData) {
          data = remoteData;
        }
      }
      
      if (data) {
        let total = 0;
        let checkedIn = 0;
        data.forEach(b => {
          total += b.qty;
          checkedIn += (b.checked_in_qty || 0); // use checked_in_qty to be consistent
        });
        setStats({ total, checkedIn });
      }
    };
    
    fetchStats();
  }, [selectedEventId, scanResult, offlineMode]);

  const handleLogout = () => {
    localStorage.removeItem('scanner_auth');
    navigate('/scanner');
  };

  const handleSyncData = async () => {
    if (!selectedEventId) {
      Swal.fire('Error', 'Please select an event first to sync its data.', 'error');
      return;
    }
    setSyncing(true);
    try {
      // 1. Push any queued offline scans to server first
      const queued = JSON.parse(localStorage.getItem('scanner_queued_scans') || '[]');
      if (queued.length > 0) {
        for (const scan of queued) {
          // Push to server using RPC
          await supabase.rpc('scan_ticket', {
            p_booking_id: scan.booking_id,
            p_qty: scan.qty,
            p_status: scan.status
          });
        }
        localStorage.setItem('scanner_queued_scans', JSON.stringify([]));
        setQueuedScansCount(0);
      }

      // 2. Download all bookings for the selected event
      const { data, error } = await supabase
        .from('bookings')
        .select('*, events(*), profiles(*), ticket_tiers(*)')
        .eq('event_id', selectedEventId);

      if (error) throw error;

      // Cache locally
      localStorage.setItem(`scanner_offline_data_${selectedEventId}`, JSON.stringify(data || []));
      
      Swal.fire({
        icon: 'success',
        title: 'Sync Complete',
        text: `Successfully downloaded ${data.length} bookings for offline scanning. Queued scans pushed.`,
        timer: 3000,
        showConfirmButton: false
      });
      setOfflineMode(true); // Auto enable offline mode after sync
    } catch (error) {
      console.error(error);
      Swal.fire('Sync Failed', error.message || 'Could not sync data. Check internet connection.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const startScanner = () => {
    if (!selectedEventId) {
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: 'Please select an event first!',
        confirmButtonColor: '#e11d48'
      });
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
        Swal.fire({
          icon: 'error',
          title: 'Camera Error',
          text: 'Failed to start camera. Please check permissions.',
          confirmButtonColor: '#e11d48'
        });
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
      let cleanRef = ticketUrl;
      if (ticketUrl.includes('/ticket/')) {
        cleanRef = ticketUrl.split('/ticket/')[1].split('/')[0].split('?')[0].split('#')[0];
      }
      
      let searchTx = null;
      if (cleanRef.startsWith('tx_')) {
        searchTx = cleanRef.substring(3);
      } else {
        cleanRef = cleanRef.startsWith('#') ? cleanRef.substring(1) : cleanRef;
      }

      let bookings = [];
      
      if (offlineMode) {
        // --- OFFLINE MODE LOOKUP ---
        const localData = JSON.parse(localStorage.getItem(`scanner_offline_data_${selectedEventId}`) || '[]');
        if (searchTx) {
          bookings = localData.filter(b => b.payment_intent_id === searchTx);
        } else {
          const searchRefWithHash = `#${cleanRef}`;
          bookings = localData.filter(b => b.booking_ref === cleanRef || b.booking_ref === searchRefWithHash);
        }
      } else {
        // --- ONLINE MODE LOOKUP ---
        if (searchTx) {
          const { data } = await supabase
            .from('bookings')
            .select('*, events(*), profiles(*), ticket_tiers(*)')
            .eq('payment_intent_id', searchTx);
          bookings = data || [];
        } else {
          const searchRefWithHash = `#${cleanRef}`;
          const { data } = await supabase
            .from('bookings')
            .select('*, events(*), profiles(*), ticket_tiers(*)')
            .or(`booking_ref.eq.${cleanRef},booking_ref.eq.${searchRefWithHash}`);
          bookings = data || [];
        }
      }

      if (bookings.length === 0) {
        playSound('error');
        setScanResult({
          status: 'invalid',
          message: 'FAKE TICKET! Not found in our system.',
          ref: cleanRef
        });
        return;
      }

      const firstBooking = bookings[0];
      const data = {
        ids: searchTx ? bookings.map(b => b.id) : [firstBooking.id],
        event_id: firstBooking.event_id,
        events: firstBooking.events,
        profiles: firstBooking.profiles,
        booking_ref: searchTx ? `tx_${searchTx}` : firstBooking.booking_ref,
        qty: bookings.reduce((sum, b) => sum + (b.qty || 1), 0),
        checked_in_qty: bookings.reduce((sum, b) => sum + (b.checked_in_qty || 0), 0)
      };

      if (data.event_id !== selectedEventId) {
        playSound('error');
        setScanResult({
          status: 'wrong_event',
          message: `WRONG EVENT! This ticket is for "${data.events?.title || 'Another Event'}". It is not valid here.`,
          ref: cleanRef
        });
        return;
      }

      if (data.checked_in_qty >= data.qty) {
        playSound('error');
        setScanResult({
          status: 'already_scanned',
          data
        });
        return;
      }

      playSound('success');
      setPartialQty(1); // Reset partial qty to 1 when a valid ticket is scanned
      setScanResult({
        status: 'valid',
        data
      });

    } catch (err) {
      playSound('error');
      setScanResult({ status: 'invalid', message: 'Error verifying ticket.' });
    }
  };

  const updateCheckInStatus = async (status) => {
    if (!scanResult || !scanResult.data) return;
    
    try {
      // Loop through all bookings in the group and check them in
      let remainingQtyToScan = partialQty;
      
      for (const bId of scanResult.data.ids) {
        if (remainingQtyToScan <= 0) break;
        
        // Fetch the current booking to know its individual qty and checked_in_qty
        let bData;
        if (offlineMode) {
          const localData = JSON.parse(localStorage.getItem(`scanner_offline_data_${selectedEventId}`) || '[]');
          bData = localData.find(b => b.id === bId);
        } else {
          const { data } = await supabase.from('bookings').select('qty, checked_in_qty').eq('id', bId).single();
          bData = data;
        }
        if (!bData) continue;
        
        const availableInBooking = (bData.qty || 1) - (bData.checked_in_qty || 0);
        if (availableInBooking <= 0) continue;
        
        const qtyToApply = Math.min(availableInBooking, remainingQtyToScan);
        
        if (offlineMode) {
          // --- SAVE TO LOCAL QUEUE ---
          const queued = JSON.parse(localStorage.getItem('scanner_queued_scans') || '[]');
          queued.push({
            booking_id: bId,
            qty: qtyToApply,
            status: status,
            timestamp: new Date().toISOString()
          });
          localStorage.setItem('scanner_queued_scans', JSON.stringify(queued));
          setQueuedScansCount(queued.length);

          // Update local cache so next scan reflects check-in
          const localData = JSON.parse(localStorage.getItem(`scanner_offline_data_${selectedEventId}`) || '[]');
          const updatedLocalData = localData.map(b => {
            if (b.id === bId) {
              return { ...b, checked_in_qty: (b.checked_in_qty || 0) + qtyToApply };
            }
            return b;
          });
          localStorage.setItem(`scanner_offline_data_${selectedEventId}`, JSON.stringify(updatedLocalData));

          // Also update stats locally
          if (status === 'allowed') {
            setStats(prev => ({ ...prev, checkedIn: prev.checkedIn + qtyToApply }));
          }

        } else {
          // --- SAVE DIRECT TO SERVER ---
          const { error } = await supabase.rpc('scan_ticket', {
            p_booking_id: bId,
            p_qty: qtyToApply,
            p_status: status
          });
          
          if (error) throw error;
        }
        remainingQtyToScan -= qtyToApply;
      }

      // Add to recent scans
      setRecentScans(prev => [
        { ...scanResult.data, scan_status: status, scan_time: new Date() },
        ...prev
      ].slice(0, 10)); // Keep only last 10

      // Clear result to scan next
      setScanResult(null);
      startScanner(); // auto restart scanner

    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Check-in Failed',
        text: err.message || 'Failed to securely update status. (Has the RPC been deployed?)',
        confirmButtonColor: '#e11d48'
      });
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
              value={selectedEventId} 
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-zinc-800 text-white text-xs py-1.5 px-3 rounded-lg border border-zinc-700 outline-none w-32 truncate"
            >
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>

          {/* Sync Button */}
          <button 
            onClick={handleSyncData}
            disabled={syncing}
            className={`p-1.5 rounded-lg border transition-colors relative ${queuedScansCount > 0 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}
            title="Sync Data"
          >
            {syncing ? <RefreshCw className="animate-spin w-4 h-4" /> : <Database className="w-4 h-4" />}
            {queuedScansCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {queuedScansCount}
              </span>
            )}
          </button>

          {/* Offline Toggle */}
          <button 
            onClick={() => {
              if (!offlineMode && !localStorage.getItem(`scanner_offline_data_${selectedEventId}`)) {
                Swal.fire('No Data', 'Please click the Sync button first to download offline data for this event.', 'warning');
                return;
              }
              setOfflineMode(!offlineMode);
            }}
            className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 ${offlineMode ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-green-500/20 text-green-400 border-green-500/50'}`}
          >
            {offlineMode ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            <span className="text-[10px] font-bold hidden sm:block">{offlineMode ? 'Offline Mode' : 'Online Mode'}</span>
          </button>

          <button onClick={handleLogout} className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 border border-zinc-700">
            <LogOut className="w-4 h-4" />
          </button>

      {offlineMode && (
        <div className="bg-red-900/40 border-b border-red-900/50 text-red-200 text-xs py-2 text-center font-semibold">
          You are scanning in OFFLINE MODE. Remember to sync when online!
        </div>
      )}
          
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
                <div className="p-6 text-center bg-red-600 border-b border-red-700">
                  <XCircle className="w-20 h-20 text-white mx-auto mb-3" />
                  <h3 className="text-3xl font-black text-white leading-tight">INVALID<br/>ALL TICKETS USED</h3>
                  <p className="text-red-100 font-bold text-sm mt-3 bg-black/20 py-2 px-4 rounded-lg inline-block">
                    Total {scanResult.data.qty} of {scanResult.data.qty} people entered
                  </p>
                </div>
              )}

              {scanResult.status === 'invalid' && (
                <div className="p-6 text-center bg-red-500/10 border-b border-red-500/20">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-2" />
                  <h3 className="text-2xl font-black text-red-500">INVALID TICKET</h3>
                  <p className="text-red-400 font-bold text-sm">{scanResult.message || 'Ticket not found'}</p>
                </div>
              )}

              {scanResult.status === 'wrong_event' && (
                <div className="p-6 text-center bg-orange-500/10 border-b border-orange-500/20">
                  <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-2" />
                  <h3 className="text-2xl font-black text-orange-500">WRONG EVENT</h3>
                  <p className="text-orange-400 font-bold text-sm leading-relaxed max-w-xs mx-auto">
                    {scanResult.message}
                  </p>
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
                  <div className="flex items-center justify-between border-t border-zinc-800 pt-4 mt-4">
                    <div className="text-center w-1/3 border-r border-zinc-800">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase">Total</p>
                      <p className="text-lg font-black text-white">{scanResult.data.qty}</p>
                    </div>
                    <div className="text-center w-1/3 border-r border-zinc-800">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase">Entered</p>
                      <p className="text-lg font-black text-white">{scanResult.data.checked_in_qty || 0}</p>
                    </div>
                    <div className="text-center w-1/3">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase">Remaining</p>
                      <p className="text-lg font-black text-primary">{scanResult.data.qty - (scanResult.data.checked_in_qty || 0)}</p>
                    </div>
                  </div>

                  {scanResult.status === 'valid' && (
                    <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-col items-center">
                      <p className="text-sm font-bold text-zinc-400 mb-3">How many entering now?</p>
                      <div className="flex items-center gap-4 bg-zinc-950 p-2 rounded-2xl border border-zinc-800">
                        <button 
                          onClick={() => setPartialQty(Math.max(1, partialQty - 1))}
                          className="w-10 h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center font-bold text-xl text-white disabled:opacity-50"
                          disabled={partialQty <= 1}
                        >
                          -
                        </button>
                        <div className="w-12 text-center text-2xl font-black text-white">
                          {partialQty}
                        </div>
                        <button 
                          onClick={() => setPartialQty(Math.min(scanResult.data.qty - (scanResult.data.checked_in_qty || 0), partialQty + 1))}
                          className="w-10 h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center font-bold text-xl text-white disabled:opacity-50"
                          disabled={partialQty >= scanResult.data.qty - (scanResult.data.checked_in_qty || 0)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
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
