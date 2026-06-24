import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Html5Qrcode } from 'html5-qrcode';
import { CheckCircle, XCircle, AlertTriangle, User, Ticket, Calendar, ShieldCheck, Camera, X } from 'lucide-react';

export default function AdminScanner() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scannerInstance, setScannerInstance] = useState(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    fetchEvents();
    // Cleanup scanner on unmount
    return () => {
      if (scannerInstance) {
        scannerInstance.stop().catch(console.error);
      }
    };
  }, [scannerInstance]);

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('id, title, event_date').order('event_date', { ascending: false });
    if (data) setEvents(data);
  };

  const startScanner = () => {
    if (!selectedEventId) {
      alert("Please select an event first!");
      return;
    }
    setScanning(true);
    setScanResult(null);
    isProcessingRef.current = false; // Reset processing lock

    // Small delay to ensure the div is rendered
    setTimeout(() => {
      const html5QrCode = new Html5Qrcode("reader");
      setScannerInstance(html5QrCode);

      html5QrCode.start(
        { facingMode: "environment" }, // Prefer back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        onScanSuccess,
        onScanFailure
      ).catch((err) => {
        console.error("Camera start failed", err);
        alert("Could not start camera. Please ensure you have granted camera permissions.");
        setScanning(false);
      });
    }, 200);
  };

  const stopScanner = () => {
    if (scannerInstance) {
      scannerInstance.stop().then(() => {
        scannerInstance.clear();
        setScannerInstance(null);
      }).catch(err => console.error("Failed to stop scanner", err));
    }
    setScanning(false);
  };

  const onScanFailure = (error) => {
    // Just ignore scan failures until a QR is found
  };

  const onScanSuccess = async (decodedText) => {
    // Prevent multiple API calls from rapid successive frames
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    // Stop scanning once we get a result
    stopScanner();
    setScanning(false);
    setScanResult({ status: 'loading', bookingRef: decodedText });

    try {
      // 1. Extract the booking ID from the URL
      let bookingRef = decodedText;
      if (decodedText.includes('/ticket/')) {
        bookingRef = decodedText.split('/ticket/')[1].split('/')[0].split('?')[0].split('#')[0];
      }
      
      const searchRef = bookingRef.startsWith('#') ? bookingRef : `#${bookingRef}`;

      // 2. Query Supabase
      const { data: booking, error } = await supabase
        .from('bookings')
        .select('*, events(*), profiles(*)')
        .eq('booking_ref', searchRef)
        .single();

      // CHECK 1: FAKE TICKET (Not found)
      if (error || !booking) {
        setScanResult({ 
          status: 'error', 
          type: 'fake', 
          message: 'FAKE TICKET! Not found in database.',
          bookingRef: searchRef
        });
        return;
      }

      // CHECK 2: WRONG EVENT
      if (booking.event_id !== selectedEventId) {
        setScanResult({ 
          status: 'error', 
          type: 'wrong_event', 
          message: `INVALID EVENT! This ticket is for ${booking.events?.title}.`,
          booking: booking
        });
        return;
      }

      // CHECK 3: ALREADY USED
      if (booking.check_in_status === 'checked_in') {
        setScanResult({ 
          status: 'error', 
          type: 'used', 
          message: `ALREADY USED! Scanned at ${new Date(booking.checked_in_at).toLocaleTimeString()}`,
          booking: booking
        });
        return;
      }

      // CHECK 4: VALID!
      setScanResult({ 
        status: 'success', 
        booking: booking 
      });

    } catch (err) {
      console.error(err);
      setScanResult({ status: 'error', type: 'error', message: 'Error verifying ticket.' });
    }
  };

  const handleAllow = async (bookingId) => {
    const { error } = await supabase
      .from('bookings')
      .update({ 
        check_in_status: 'checked_in', 
        checked_in_at: new Date().toISOString() 
      })
      .eq('id', bookingId);

    if (error) {
      alert("Error saving check-in status: " + error.message);
    } else {
      setScanResult(prev => ({
        ...prev,
        status: 'checked_in_success'
      }));
    }
  };

  const handleDeny = async (bookingId) => {
    const { error } = await supabase
      .from('bookings')
      .update({ check_in_status: 'denied' })
      .eq('id', bookingId);
      
    if (error) {
      alert("Error updating status: " + error.message);
    } else {
      setScanResult(null); // Clear screen
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
              <ShieldCheck className="text-[#8c1c24]" /> 
              Secure Scanner
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">Scan and verify event tickets.</p>
          </div>
          <Link to="/admin" className="text-sm font-bold text-gray-500 hover:text-black">
            Done
          </Link>
        </div>

        {/* Event Selection */}
        {!scanning && !scanResult && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-2">Select Active Event</label>
            <select 
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full border-gray-200 rounded-xl focus:ring-[#8c1c24] focus:border-[#8c1c24] p-3 text-sm font-medium bg-gray-50 text-gray-900 mb-6"
            >
              <option value="" className="text-gray-900">-- Choose an Event --</option>
              {events.map(e => (
                <option key={e.id} value={e.id} className="text-gray-900">{e.title} ({new Date(e.event_date).toLocaleDateString()})</option>
              ))}
            </select>

            <button 
              onClick={startScanner}
              disabled={!selectedEventId}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                selectedEventId 
                  ? 'bg-black text-white hover:bg-gray-900 shadow-md' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Camera size={20} />
              Start Camera Scanner
            </button>
          </div>
        )}

        {/* Scanner Container */}
        {scanning && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Scan QR Code</h3>
              <button onClick={stopScanner} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <div id="reader" className="w-full rounded-xl overflow-hidden border-2 border-[#8c1c24]"></div>
            
            <div className="mt-4 text-center text-sm text-gray-500">
              Point camera at the attendee's ticket QR code.
            </div>
          </div>
        )}

        {/* Scan Results */}
        {scanResult && (
          <div className="space-y-4">
            
            {scanResult.status === 'loading' && (
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8c1c24] mx-auto mb-4"></div>
                <h3 className="text-lg font-bold">Verifying Ticket...</h3>
              </div>
            )}

            {/* ERROR STATES (Red/Orange Flashes) */}
            {scanResult.status === 'error' && (
              <div className={`rounded-2xl p-8 border shadow-lg text-center animate-in zoom-in-95 duration-300 ${
                scanResult.type === 'wrong_event' 
                  ? 'bg-orange-50 border-orange-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                {scanResult.type === 'wrong_event' ? (
                  <AlertTriangle className="w-20 h-20 text-orange-500 mx-auto mb-4" />
                ) : (
                  <XCircle className="w-20 h-20 text-red-600 mx-auto mb-4" />
                )}
                
                <h2 className={`text-3xl font-black mb-2 ${
                  scanResult.type === 'wrong_event' ? 'text-orange-700' : 'text-red-700'
                }`}>
                  {scanResult.type === 'fake' ? 'FAKE TICKET!' : 
                   scanResult.type === 'used' ? 'ALREADY USED!' : 'INVALID EVENT!'}
                </h2>
                
                <p className={`text-lg font-medium ${
                  scanResult.type === 'wrong_event' ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {scanResult.message}
                </p>

                {scanResult.booking && (
                  <div className="mt-6 bg-white/60 p-4 rounded-xl text-left inline-block w-full max-w-sm">
                    <p className="text-sm"><strong>Name:</strong> {scanResult.booking.profiles?.name}</p>
                    <p className="text-sm"><strong>Ref:</strong> {scanResult.booking.booking_ref}</p>
                    {scanResult.type === 'wrong_event' && (
                      <p className="text-sm text-orange-700 font-bold mt-2">
                        They brought a ticket for: {scanResult.booking.events?.title}
                      </p>
                    )}
                  </div>
                )}

                <button 
                  onClick={() => setScanResult(null)}
                  className="mt-8 w-full bg-white text-gray-900 border border-gray-200 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Scan Next Ticket
                </button>
              </div>
            )}

            {/* SUCCESS STATE */}
            {scanResult.status === 'success' && (
              <div className="bg-white rounded-2xl p-6 border-2 border-green-500 shadow-xl animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-3 mb-6 bg-green-50 p-4 rounded-xl text-green-700">
                  <CheckCircle className="w-8 h-8" />
                  <div>
                    <h2 className="text-xl font-black">VALID TICKET</h2>
                    <p className="text-sm font-medium">Ready for check-in</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <User className="text-gray-400" size={20} />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Attendee</p>
                      <p className="font-bold text-gray-900 text-lg">{scanResult.booking.profiles?.name}</p>
                      <p className="text-sm text-gray-600">{scanResult.booking.profiles?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Ticket className="text-gray-400" size={20} />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Ticket Details</p>
                      <p className="font-bold text-gray-900 text-lg">{scanResult.booking.qty}x Tickets</p>
                      <p className="text-sm text-gray-600">{scanResult.booking.booking_ref}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleDeny(scanResult.booking.id)}
                    className="py-4 rounded-xl font-bold border-2 border-red-100 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    DENY
                  </button>
                  <button 
                    onClick={() => handleAllow(scanResult.booking.id)}
                    className="py-4 rounded-xl font-black bg-green-500 text-white hover:bg-green-600 transition-colors shadow-md shadow-green-500/20"
                  >
                    ALLOW ENTRY
                  </button>
                </div>
              </div>
            )}

            {/* CHECKED IN SUCCESS */}
            {scanResult.status === 'checked_in_success' && (
              <div className="bg-green-50 rounded-2xl p-8 border border-green-200 text-center animate-in zoom-in-95 duration-300">
                <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-black text-green-700 mb-2">ENTRY ALLOWED</h2>
                <p className="text-green-600 font-medium mb-8">Ticket has been marked as checked-in.</p>
                <button 
                  onClick={() => setScanResult(null)}
                  className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-md shadow-green-600/20"
                >
                  Scan Next Ticket
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
