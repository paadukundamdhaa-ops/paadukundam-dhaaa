import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, Save, UploadCloud, Eye, Rocket, MapPin, Calendar, Clock,
  Users, Ticket, Settings, Shield, Link as LinkIcon, AlertCircle, Plus,
  Trash2, Copy, PlayCircle, Info, Image as ImageIcon, Music, Star, Search
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('basic-info');
  const [ticketTypes, setTicketTypes] = useState([
    { id: 1, name: 'General Admission', price: '999', qty: '1000', refundable: false }
  ]);
  const [highlights, setHighlights] = useState(['Live Performance']);
  const [amenities, setAmenities] = useState({ parking: true, food: true });
  const [heroImage, setHeroImage] = useState(null);
  const [squareImage, setSquareImage] = useState(null);
  const [artistImage, setArtistImage] = useState(null);
  const [mapUrlInput, setMapUrlInput] = useState("https://maps.google.com/?q=Eden+Gardens");
  const [isPublishing, setIsPublishing] = useState(false);

  // Form States
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Concert');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [venueName, setVenueName] = useState('');
  const [city, setCity] = useState('');
  const [artistName, setArtistName] = useState('');

  const getMapEmbedUrl = (url) => {
    if (!url) return null;
    try {
      // If user pasted an iframe
      if (url.includes('<iframe')) {
        const match = url.match(/src="([^"]+)"/);
        return match ? match[1] : null;
      }
      // If it's a normal URL with a q= parameter
      const parsed = new URL(url);
      const q = parsed.searchParams.get('q') || parsed.searchParams.get('query');
      if (q) return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
      
      // Fallback for google.com/maps/place/...
      if (url.includes('/place/')) {
        const parts = url.split('/place/')[1].split('/');
        return `https://maps.google.com/maps?q=${encodeURIComponent(parts[0])}&output=embed`;
      }
      return null;
    } catch (e) {
      // If not a valid URL, treat the text itself as a search query
      if (url.length > 3) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(url)}&output=embed`;
      }
      return null;
    }
  };

  const mapEmbedUrl = getMapEmbedUrl(mapUrlInput);

  const handleHeroUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setHeroImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSquareUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSquareImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleArtistUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setArtistImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleAddTicket = () => {
    const newId = ticketTypes.length > 0 ? Math.max(...ticketTypes.map(t => t.id)) + 1 : 1;
    setTicketTypes([...ticketTypes, { id: newId, name: '', price: '', qty: '', refundable: false }]);
  };

  const handleRemoveTicket = (id) => {
    if (ticketTypes.length === 1) return; // Prevent deleting the last ticket
    setTicketTypes(ticketTypes.filter(t => t.id !== id));
  };

  const sections = [
    { id: 'basic-info', label: '1. Basic Information' },
    { id: 'media-uploads', label: '2. Media Uploads' },
    { id: 'event-schedule', label: '3. Event Schedule' },
    { id: 'venue-info', label: '4. Venue Information' },
    { id: 'artist-details', label: '5. Artist Details' },
    { id: 'ticket-config', label: '6. Ticket Configuration' },
    { id: 'booking-settings', label: '7. Booking Settings' },
    { id: 'pricing-taxes', label: '8. Pricing & Taxes' },
    { id: 'qr-config', label: '9. QR Ticket Configuration' },
    { id: 'event-highlights', label: '10. Event Highlights' },
    { id: 'amenities', label: '11. Amenities' },
    { id: 'policies', label: '12. Policies' },
    { id: 'seo-settings', label: '13. SEO Settings' },
    { id: 'notifications', label: '14. Notifications' },
    { id: 'organizer-info', label: '15. Organizer Info' },
    { id: 'analytics', label: '16. Analytics & Tracking' },
    { id: 'preview', label: '17. Preview & Publish' },
  ];

  const handleScroll = () => {
    const sectionElements = sections.map(s => document.getElementById(s.id));
    for (let i = sectionElements.length - 1; i >= 0; i--) {
      const el = sectionElements[i];
      if (el && el.getBoundingClientRect().top <= 150) {
        setActiveSection(sections[i].id);
        break;
      }
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
    }
  };

  const handlePublish = async () => {
    if (!title || !artistName || !category || !eventDate || !eventTime || !venueName || !city) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill in all required fields (Title, Artist, Category, Date, Time, Venue, City).',
        confirmButtonColor: '#e11d48'
      });
      return;
    }

    if (ticketTypes.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Tickets',
        text: 'Please add at least one ticket type.',
        confirmButtonColor: '#e11d48'
      });
      return;
    }

    setIsPublishing(true);
    try {
      // Calculate total tickets
      const totalTickets = ticketTypes.reduce((acc, t) => acc + (Number(t.qty) || 0), 0);

      // Format Venue
      const fullVenue = `${venueName}, ${city}`;

      // Insert Event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert({
          title,
          artist: artistName,
          category,
          event_date: eventDate,
          event_time: eventTime,
          venue: fullVenue,
          status: 'Upcoming',
          total_tickets: totalTickets,
          tickets_sold: 0,
          img_url: heroImage || '/images/sunburn.png' // Fallback image if no upload
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Insert Ticket Tiers
      const tiersToInsert = ticketTypes.map(t => ({
        event_id: eventData.id,
        tier_name: t.name || 'General Admission',
        price: Number(t.price) || 0,
        total_capacity: Number(t.qty) || 0,
        tickets_sold: 0,
        status: 'Active'
      }));

      const { error: tierError } = await supabase
        .from('ticket_tiers')
        .insert(tiersToInsert);

      if (tierError) throw tierError;

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Event published successfully!',
        confirmButtonColor: '#22c55e'
      });
      navigate('/admin/events');
    } catch (error) {
      console.error("Error publishing event:", error);
      Swal.fire({
        icon: 'error',
        title: 'Publishing Failed',
        text: 'Failed to publish event. See console for details.',
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-32 text-black">

      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/events')} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500">
              <ChevronLeft size={20} />
            </button>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link to="/admin/events" className="hover:text-black">Events</Link>
              <span>/</span>
              <span className="font-bold text-black">Create New</span>
            </div>
            <span className="ml-4 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-800 border border-yellow-200">Draft</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500 flex items-center gap-1.5 mr-4">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Auto-saving
            </div>
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">A</div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 pt-8 flex gap-8 relative items-start">

        {/* Left Sidebar (Sticky Navigation) */}
        <div className="w-64 shrink-0 hidden lg:block sticky top-28 max-h-[calc(100vh-140px)] overflow-y-auto hide-scrollbar">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 px-2">Setup Progress</h3>
          <div className="space-y-1 relative">
            <div className="absolute left-2.5 top-2 bottom-2 w-px bg-gray-200 -z-10"></div>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full text-left px-3 py-2 text-[13px] font-semibold rounded-lg flex items-center transition-all ${activeSection === section.id
                    ? 'text-primary bg-primary/5'
                    : 'text-gray-500 hover:text-black hover:bg-white'
                  }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full mr-3 ${activeSection === section.id ? 'bg-primary scale-150' : 'bg-gray-300'} transition-all`}></div>
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Areas */}
        <div className="flex-1 max-w-4xl space-y-10">

          {/* Header Title */}
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight mb-2">Create New Event</h1>
            <p className="text-gray-500 text-sm">Configure all settings, tickets, and media for your upcoming concert.</p>
          </div>

          {/* Step 1: Basic Information */}
          <section id="basic-info" className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Info size={18} /></div>
              <h2 className="text-lg font-bold">1. Basic Information</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Event Title *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="e.g. Arijit Singh Live in Concert" />
              </div>
              <div className="flex gap-6">
                <div className="flex-1">
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Event Slug</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">paadukundamdhaa.com/</span>
                    <input type="text" className="flex-1 border border-gray-300 rounded-r-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="arijit-singh-live" />
                  </div>
                </div>
                <div className="w-1/3">
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Category *</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                    <option>Concert</option><option>EDM</option><option>Comedy</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Short Description</label>
                <textarea rows="2" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" placeholder="A brief 1-2 sentence summary for event cards..."></textarea>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Full Rich Description</label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 p-2 flex gap-2">
                    <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600 font-bold">B</button>
                    <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600 italic">I</button>
                    <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600 underline">U</button>
                    <div className="w-px bg-gray-300 mx-1"></div>
                    <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><LinkIcon size={16} /></button>
                  </div>
                  <textarea rows="6" className="w-full px-4 py-3 text-sm outline-none resize-none" placeholder="Write the full event details here..."></textarea>
                </div>
              </div>
            </div>
          </section>

          {/* Step 2: Media Uploads */}
          <section id="media-uploads" className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><ImageIcon size={18} /></div>
              <h2 className="text-lg font-bold">2. Media Uploads</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">Hero Banner (1920x900) *</label>
                <label className="h-48 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/10 transition-colors relative overflow-hidden block w-full">
                  <input type="file" className="hidden" accept="image/*" onChange={handleHeroUpload} />
                  {heroImage ? (
                    <img src={heroImage} alt="Hero Banner Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3">
                        <UploadCloud size={24} />
                      </div>
                      <p className="font-bold text-sm text-gray-800">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 10MB)</p>
                    </>
                  )}
                </label>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">Event Square Thumbnail (500x500) *</label>
                  <label className="h-48 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition-colors relative overflow-hidden block w-full">
                    <input type="file" className="hidden" accept="image/*" onChange={handleSquareUpload} />
                    {squareImage ? (
                      <img src={squareImage} alt="Square Thumbnail Preview" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <>
                        <UploadCloud size={24} className="text-gray-400 mb-2" />
                        <p className="font-bold text-sm text-gray-600">Upload Square Image</p>
                      </>
                    )}
                  </label>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">Promo Video URL</label>
                  <div className="relative">
                    <PlayCircle size={18} className="absolute left-3 top-2.5 text-gray-400" />
                    <input type="text" className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="YouTube or Vimeo link" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Step 3: Event Schedule */}
          <section id="event-schedule" className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center"><Calendar size={18} /></div>
              <h2 className="text-lg font-bold">3. Event Schedule</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Event Date *</label>
                  <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Time Zone</label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                    <option>IST (Asia/Kolkata)</option><option>UTC</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Gates Open</label>
                  <input type="time" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Show Starts *</label>
                  <input type="time" value={eventTime} onChange={e => setEventTime(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Show Ends</label>
                  <input type="time" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none" />
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-black">Enable Countdown Timer</h4>
                  <p className="text-xs text-gray-500">Show a live countdown on the event page</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Step 4: Venue */}
          <section id="venue-info" className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center"><MapPin size={18} /></div>
              <h2 className="text-lg font-bold">4. Venue Information</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="col-span-2">
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Venue Name *</label>
                  <input type="text" value={venueName} onChange={e => setVenueName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none" placeholder="e.g. NSCI Dome" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Full Address *</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none" placeholder="Street address..." />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">City *</label>
                  <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">State</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Google Maps URL</label>
                  <input 
                    type="text" 
                    value={mapUrlInput}
                    onChange={(e) => setMapUrlInput(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none text-blue-600 focus:ring-2 focus:ring-primary/20" 
                    placeholder="Paste Google Maps link or enter a location name..." 
                  />
                </div>
              </div>
              
              {mapEmbedUrl ? (
                <div className="h-64 rounded-xl overflow-hidden border border-gray-200">
                  <iframe 
                    src={mapEmbedUrl} 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              ) : (
                <div className="h-48 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <MapPin size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">Map preview will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Step 5: Artist Details */}
          <section id="artist-details" className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center"><Music size={18} /></div>
              <h2 className="text-lg font-bold">5. Artist Details</h2>
            </div>
            <div className="p-6">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Headline Artist *</label>
                <div className="flex gap-4">
                  <label className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer shrink-0 overflow-hidden relative">
                    <input type="file" className="hidden" accept="image/*" onChange={handleArtistUpload} />
                    {artistImage ? (
                      <img src={artistImage} className="w-full h-full object-cover" alt="Artist Preview"/>
                    ) : (
                      <ImageIcon size={20} />
                    )}
                  </label>
                  <div className="flex-1 space-y-3">
                    <input type="text" value={artistName} onChange={e => setArtistName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none" placeholder="Artist Name" />
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none" placeholder="Short Biography (optional)" />
                  </div>
                </div>
              </div>
              <button className="mt-4 text-sm font-bold text-primary hover:underline flex items-center gap-1"><Plus size={16} /> Add Supporting Artist</button>
            </div>
          </section>

          {/* Step 6: Tickets */}
          <section id="ticket-config" className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center"><Ticket size={18} /></div>
                <h2 className="text-lg font-bold">6. Ticket Configuration</h2>
              </div>
              <button onClick={handleAddTicket} className="bg-black text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-gray-800 transition-colors">
                <Plus size={16} /> Add Ticket Type
              </button>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-bold">Ticket Name</th>
                    <th className="px-6 py-4 font-bold">Price (₹)</th>
                    <th className="px-6 py-4 font-bold">Total Qty</th>
                    <th className="px-6 py-4 font-bold">Refundable</th>
                    <th className="px-6 py-4 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ticketTypes.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4"><input type="text" value={t.name} onChange={e => setTicketTypes(ticketTypes.map(tick => tick.id === t.id ? { ...tick, name: e.target.value } : tick))} className="border border-gray-200 rounded px-2 py-1 w-full text-sm font-bold" /></td>
                      <td className="px-6 py-4"><input type="number" value={t.price} onChange={e => setTicketTypes(ticketTypes.map(tick => tick.id === t.id ? { ...tick, price: e.target.value } : tick))} className="border border-gray-200 rounded px-2 py-1 w-24 text-sm font-bold text-green-600" /></td>
                      <td className="px-6 py-4"><input type="number" value={t.qty} onChange={e => setTicketTypes(ticketTypes.map(tick => tick.id === t.id ? { ...tick, qty: e.target.value } : tick))} className="border border-gray-200 rounded px-2 py-1 w-24 text-sm" /></td>
                      <td className="px-6 py-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked={t.refundable} className="sr-only peer" />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleRemoveTicket(t.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Remove Ticket"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Step 7: Booking Settings */}
          <section id="booking-settings" className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center"><Settings size={18} /></div>
              <h2 className="text-lg font-bold">7. Booking Settings</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Min Tickets Per Order</label>
                <input type="number" defaultValue="1" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Max Tickets Per Order</label>
                <input type="number" defaultValue="10" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div className="col-span-2 flex items-center justify-between border-t border-gray-100 pt-4">
                <div>
                  <h4 className="text-sm font-bold text-black">Enable Promo Codes</h4>
                  <p className="text-xs text-gray-500">Allow users to apply discount codes at checkout.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Step 8: Pricing & Taxes */}
          <section id="pricing-taxes" className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center"><Shield size={18} /></div>
              <h2 className="text-lg font-bold">8. Pricing & Taxes</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Platform Booking Fee (₹)</label>
                <input type="number" defaultValue="50" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">GST / Tax Percentage (%)</label>
                <input type="number" defaultValue="18" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none" />
              </div>
            </div>
          </section>

          {/* Step 9: QR Ticket Configuration */}
          <section id="qr-config" className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center"><LinkIcon size={18} /></div>
              <h2 className="text-lg font-bold">9. QR Ticket Configuration</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Booking ID Prefix</label>
                <input type="text" defaultValue="PDK" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none" />
                <p className="text-xs text-gray-500 mt-1">E.g., PDK-123456</p>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div>
                  <h4 className="text-sm font-bold text-black">Auto-Generate Unique QR Code</h4>
                  <p className="text-xs text-gray-500">Every ticket gets a unique scannable QR.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Step 10: Event Highlights */}
          <section id="event-highlights" className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center"><Star size={18} /></div>
              <h2 className="text-lg font-bold">10. Event Highlights</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-3">
                {['Live Performance', 'VIP Lounge', 'Meet & Greet', 'Merchandise', 'Food Court', 'Free Parking'].map(h => (
                  <span key={h} className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium hover:border-primary hover:text-primary cursor-pointer transition-colors bg-gray-50">{h}</span>
                ))}
              </div>
            </div>
          </section>

          {/* Step 11: Amenities */}
          <section id="amenities" className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center"><Shield size={18} /></div>
              <h2 className="text-lg font-bold">11. Amenities</h2>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
              {['Food & Beverages', 'Parking', 'Restrooms', 'Air Conditioning', 'Medical Support', 'Wheelchair Access'].map(amenity => (
                <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4" defaultChecked />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Step 12: Policies */}
          <section id="policies" className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center"><AlertCircle size={18} /></div>
              <h2 className="text-lg font-bold">12. Policies</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Age Restriction</label>
                <input type="text" defaultValue="18+ Only" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Refund Policy</label>
                <textarea rows="3" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none" placeholder="No refunds..."></textarea>
              </div>
            </div>
          </section>

          {/* Step 13: SEO Settings */}
          <section id="seo-settings" className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center"><Search size={18} /></div>
              <h2 className="text-lg font-bold">13. SEO Settings</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">SEO Title <span className="text-gray-400 font-normal">(Optional)</span></label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Meta Description <span className="text-gray-400 font-normal">(Optional)</span></label>
                <textarea rows="2" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none"></textarea>
              </div>
            </div>
          </section>

          {/* Step 14: Notifications */}
          <section id="notifications" className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center"><AlertCircle size={18} /></div>
              <h2 className="text-lg font-bold">14. Notifications</h2>
            </div>
            <div className="p-6 space-y-4">
              {['Notify Subscribers via Email', 'Send Push Notifications', 'Enable SMS Alerts'].map(notif => (
                <div key={notif} className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-700">{notif}</h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </section>

          {/* Step 15: Organizer Info */}
          <section id="organizer-info" className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center"><Users size={18} /></div>
              <h2 className="text-lg font-bold">15. Organizer Information</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Organizer Name</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Contact Email</label>
                <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none" />
              </div>
            </div>
          </section>

          {/* Step 16: Analytics & Tracking */}
          <section id="analytics" className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center"><Shield size={18} /></div>
              <h2 className="text-lg font-bold">16. Analytics & Tracking</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Google Analytics ID</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none" placeholder="G-XXXXXXXXXX" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Meta Pixel ID</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none" />
              </div>
            </div>
          </section>

          {/* Step 17: Preview */}
          <section id="preview" className="bg-[#0a0a0a] rounded-2xl shadow-xl overflow-hidden relative border border-gray-800">
            <div className="absolute inset-0 bg-[url('/images/sunburn.png')] bg-cover bg-center opacity-20 blur-md"></div>
            <div className="p-6 relative z-10">
              <h2 className="text-white text-xl font-black mb-6 flex items-center gap-2"><Eye size={20} className="text-primary" /> 17. Live Card Preview</h2>
              <div className="max-w-sm mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
                <div className="h-48 relative">
                  <img src="/images/arijit.png" className="w-full h-full object-cover" alt="Preview" />
                  <div className="absolute top-3 left-3 bg-secondary text-black text-[10px] font-black px-2 py-1 rounded uppercase shadow">Live</div>
                </div>
                <div className="p-5 text-white text-left">
                  <h3 className="text-xl font-black mb-2">Arijit Singh Live</h3>
                  <p className="text-xs text-gray-300 mb-4"><MapPin size={12} className="inline mr-1" /> NSCI Dome, Mumbai</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase">Starting from</p>
                      <p className="text-lg font-bold text-white">₹999</p>
                    </div>
                    <button className="bg-primary px-4 py-2 rounded font-bold text-xs shadow-lg shadow-primary/30">Book Now</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 z-50 py-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="max-w-[1600px] mx-auto px-6 flex justify-between items-center">
          <div>
            <button className="text-red-500 font-bold text-sm hover:underline flex items-center gap-1"><Trash2 size={16} /> Discard Event</button>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-6 py-2.5 rounded-lg font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm border border-transparent">
              <Save size={18} /> Save Draft
            </button>
            <button className="px-6 py-2.5 rounded-lg font-bold text-white bg-black hover:bg-gray-900 transition-colors flex items-center gap-2 text-sm shadow-md">
              <Eye size={18} /> Preview Page
            </button>
            <button onClick={handlePublish} disabled={isPublishing} className="px-8 py-2.5 rounded-lg font-black text-white bg-gradient-to-r from-primary to-red-800 hover:from-red-700 hover:to-red-900 transition-all flex items-center gap-2 text-sm shadow-lg shadow-primary/30 transform hover:-translate-y-0.5 disabled:opacity-50">
              <Rocket size={18} /> {isPublishing ? 'Publishing...' : 'Publish Event'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
