import { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Calendar, SlidersHorizontal, Grid, List, ChevronLeft, ChevronRight, Heart, ChevronDown, Share2, Check } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';

export default function Events() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State Management
  const [view, setView] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortOption, setSortOption] = useState('Sort By: Latest First');
  const [selectedDate, setSelectedDate] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(20000);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 8;
  const [allEvents, setAllEvents] = useState([]);
  
  // Extract unique categories from events
  const uniqueCategories = useMemo(() => {
    const cats = new Set(allEvents.map(e => e.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [allEvents]);
  
  // Scroll to top on mount and route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Fetch from Supabase
  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*, ticket_tiers(price)')
          .order('event_date', { ascending: true });

        if (error) throw error;
        
        if (data) {
          const formatted = data.map(event => {
            const d = new Date(event.event_date || Date.now());
            
            // Try to extract a city name from the venue (e.g. "Stadium, Mumbai" -> "Mumbai")
            const venueString = event.venue || 'TBA';
            const venueParts = venueString.split(',');
            const city = venueParts.length > 1 ? venueParts[venueParts.length - 1].trim() : venueString;

            const isFree = (event.title || '').toLowerCase().includes('free') || (event.title || '').toLowerCase().includes('meetup');
            const lowestPrice = event.ticket_tiers && event.ticket_tiers.length > 0 
              ? Math.min(...event.ticket_tiers.map(t => t.price || 0)) 
              : 0;

            return {
              id: event.id,
              title: event.title || 'Untitled Event',
              date: isNaN(d.getTime()) ? 'TBA' : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
              dateBadge: {
                day: isNaN(d.getTime()) ? '--' : d.getDate().toString().padStart(2, '0'),
                month: isNaN(d.getTime()) ? 'TBA' : d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
              },
              time: event.event_time || 'TBA',
              venue: venueString,
              city: city,
              category: event.category || 'Uncategorized',
              price: isFree ? 0 : lowestPrice,
              img: event.img_url || '/images/arijit.png',
              tag: event.status || 'Draft',
              slug: event.slug || event.id
            };
          });
          setAllEvents(formatted);
        }
      } catch (err) {
        console.error('Error fetching all events:', err);
      }
    };
    fetchAllEvents();

    const eventsSubscription = supabase.channel('public:events-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, payload => {
        fetchAllEvents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(eventsSubscription);
    };
  }, []);

  // Logic: Filter & Sort Events
  const filteredEvents = useMemo(() => {
    let result = [...allEvents];
    
    // Search
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q));
    }
    
    // City
    if (selectedCity !== 'All Cities') {
      result = result.filter(e => e.city === selectedCity);
    }
    
    // Category
    if (selectedCategories.length > 0) {
      result = result.filter(e => selectedCategories.includes(e.category));
    }
    
    // Date
    if (selectedDate !== '') {
      const filterDate = new Date(selectedDate).toDateString();
      result = result.filter(e => new Date(e.date).toDateString() === filterDate);
    }
    
    // Price
    result = result.filter(e => e.price >= minPrice && e.price <= maxPrice);
    
    // Sort
    if (sortOption === 'Price: Low to High') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'Price: High to Low') {
      result.sort((a, b) => b.price - a.price);
    }
    // "Latest First" keeps the original array order based on ID (dummy assumption)
    
    return result;
  }, [allEvents, searchQuery, selectedCity, selectedCategories, sortOption, selectedDate, minPrice, maxPrice]);

  // Logic: Pagination
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / itemsPerPage));
  const currentEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setCurrentPage(1); // reset to page 1 on filter
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setSelectedCity('All Cities');
    setSelectedCategories([]);
    setSelectedDate('');
    setMinPrice(0);
    setMaxPrice(20000);
    setSortOption('Sort By: Latest First');
    setCurrentPage(1);
  };

  const [copiedId, setCopiedId] = useState(null);
  const handleShare = (e, event) => {
    e.stopPropagation();
    const url = `${window.location.origin}/events/${event.id}`;
    if (navigator.share) {
      navigator.share({ title: event.title, text: `Check out ${event.title}!`, url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(event.id);
        setTimeout(() => setCopiedId(null), 2000);
      });
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans pb-20 text-black">
      <Helmet>
        <title>Explore All Events | PaadukundamDhaa</title>
        <meta name="description" content="Browse and book tickets for the upcoming live music concerts, comedy shows, and premium events in your city." />
      </Helmet>
      {/* HERO BANNER */}
      <section className="relative pt-32 pb-24 border-b border-black/10 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/images/sunburn.png" alt="Concerts" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-transparent"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row md:items-end justify-between">
          <div className="mb-6 md:mb-0">
            <span className="font-serif italic text-secondary text-2xl md:text-3xl ml-1">Explore</span>
            <h1 className="text-white text-5xl md:text-6xl font-black uppercase tracking-tight mt-0 mb-3">ALL EVENTS</h1>
            <p className="text-gray-300 max-w-lg text-lg">
              Discover the hottest live events and book your tickets to unforgettable experiences.
            </p>
          </div>
          <div className="text-xs font-bold tracking-widest flex items-center uppercase">
            <Link to="/" className="text-white hover:text-gray-300 transition-colors">Home</Link>
            <span className="text-gray-500 mx-2">&gt;</span>
            <span className="text-secondary">Events</span>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="container mx-auto px-6 mt-10 grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* LEFT SIDEBAR (FILTERS) */}
        <aside className="xl:col-span-3">
          {/* Mobile Filter Toggle */}
          <button 
            className="xl:hidden w-full bg-white text-black font-bold py-3 px-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between mb-4"
            onClick={() => setShowFilters(!showFilters)}
          >
            <div className="flex items-center"><SlidersHorizontal size={18} className="mr-2 text-primary"/> Filters</div>
            <ChevronDown size={18} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 xl:sticky xl:top-24 ${showFilters ? 'block mb-8' : 'hidden xl:block'}`}>
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-[15px] font-black uppercase flex items-center tracking-wider text-black">
                <SlidersHorizontal size={18} className="mr-2 text-primary" /> FILTERS
              </h2>
              <button onClick={handleClearAll} className="text-primary text-[13px] font-bold hover:underline">Clear All</button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <label className="block text-[13px] font-bold text-gray-800 mb-2">Search Events</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Search by event, artist, venue..." 
                  className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
                />
                <Search size={16} className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* City */}
            <div className="mb-6">
              <label className="block text-[13px] font-bold text-gray-800 mb-2">Select City</label>
              <div className="relative">
                <select 
                  value={selectedCity}
                  onChange={(e) => { setSelectedCity(e.target.value); setCurrentPage(1); }}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-gray-600 cursor-pointer"
                >
                  <option value="All Cities">All Cities</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Kolkata">Kolkata</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <label className="block text-[13px] font-bold text-gray-800 mb-3">Event Categories</label>
              <div className="space-y-2.5">
                {uniqueCategories.map((cat, idx) => (
                  <label key={idx} className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="peer appearance-none w-4 h-4 border border-gray-300 rounded-sm checked:bg-primary checked:border-primary transition-colors cursor-pointer" 
                      />
                      <svg className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-gray-600 font-medium group-hover:text-black transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date */}
            <div className="mb-6">
              <label className="block text-[13px] font-bold text-gray-800 mb-2">Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => { setSelectedDate(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-4 pr-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer text-gray-600" 
                />
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-8">
              <label className="block text-[13px] font-bold text-gray-800 mb-5">Price Range</label>
              <div className="px-2">
                <div className="relative h-1.5 bg-gray-200 rounded-full mb-3">
                  <div 
                    className="absolute h-full bg-primary rounded-full"
                    style={{ left: `${(minPrice / 20000) * 100}%`, right: `${100 - (maxPrice / 20000) * 100}%` }}
                  ></div>
                  <input 
                    type="range" 
                    min="0" max="20000" step="100"
                    value={minPrice} 
                    onChange={e => { setMinPrice(Math.min(Number(e.target.value), maxPrice - 100)); setCurrentPage(1); }}
                    className="absolute w-full -top-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-secondary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
                  />
                  <input 
                    type="range" 
                    min="0" max="20000" step="100"
                    value={maxPrice} 
                    onChange={e => { setMaxPrice(Math.max(Number(e.target.value), minPrice + 100)); setCurrentPage(1); }}
                    className="absolute w-full -top-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-secondary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
                  />
                </div>
                <div className="flex justify-between text-[11px] font-bold text-black">
                  <span>₹{minPrice.toLocaleString('en-IN')}</span>
                  <span>₹{maxPrice.toLocaleString('en-IN')}{maxPrice === 20000 ? '+' : ''}</span>
                </div>
              </div>
            </div>

            <button onClick={() => { setShowFilters(false); }} className="w-full bg-primary hover:bg-red-800 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-colors text-sm shadow-md">
              Apply Filters <SlidersHorizontal size={14} className="ml-2" />
            </button>
          </div>
        </aside>

        {/* RIGHT CONTENT (EVENTS GRID) */}
        <main className="xl:col-span-9">
          
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="flex space-x-1 mb-4 md:mb-0">
              <button 
                onClick={() => setView('grid')}
                className={`flex items-center px-4 py-2 rounded-md font-bold text-[13px] transition-colors ${view === 'grid' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Grid size={16} className="mr-2" /> Grid View
              </button>
              <button 
                onClick={() => setView('list')}
                className={`flex items-center px-4 py-2 rounded-md font-bold text-[13px] transition-colors ${view === 'list' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 border border-transparent hover:border-gray-200 hover:bg-gray-50'}`}
              >
                <List size={16} className="mr-2" /> List View
              </button>
            </div>
            
            <div className="text-[13px] font-medium text-gray-500">
              Showing {filteredEvents.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredEvents.length)} of {filteredEvents.length} Events
            </div>

            <div className="relative mt-4 md:mt-0">
              <select 
                value={sortOption}
                onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
                className="pl-4 pr-10 py-2 border border-gray-200 rounded-md text-[13px] font-medium focus:outline-none appearance-none bg-white text-gray-700 hover:border-gray-300 transition-colors cursor-pointer"
              >
                <option value="Sort By: Latest First">Sort By: Latest First</option>
                <option value="Price: Low to High">Price: Low to High</option>
                <option value="Price: High to Low">Price: High to Low</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Empty State */}
          {filteredEvents.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-16 text-center shadow-sm">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-black text-black mb-2">No Events Found</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">We couldn't find any events matching your current filters. Try adjusting your search criteria or clear all filters.</p>
              <button onClick={handleClearAll} className="bg-primary hover:bg-red-800 text-white font-bold px-6 py-2.5 rounded-lg transition-colors text-sm shadow-md">
                Clear All Filters
              </button>
            </div>
          )}

          {/* Grid/List Layout */}
          {filteredEvents.length > 0 && (
            <div className={view === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" 
              : "flex flex-col space-y-3 md:space-y-4"}>
              
              {currentEvents.map((event) => (
                <div key={event.id} className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100 group flex cursor-pointer ${view === 'grid' ? 'flex-col' : 'flex-row min-h-[144px] md:h-48'}`}>
                  
                  {/* Image Section */}
                  <div className={`relative overflow-hidden shrink-0 flex ${view === 'grid' ? 'h-40 w-full' : 'w-28 sm:w-36 md:w-48'}`}>
                    <img src={event.img} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    
                    {/* Date Badge */}
                    <div className={`absolute top-0 left-0 bg-[#8b0000] text-white text-center flex flex-col justify-center rounded-br-lg shadow-md z-10 ${view === 'grid' ? 'w-11 py-1.5' : 'w-8 md:w-11 py-1 md:py-1.5'}`}>
                      <span className={`font-black leading-none ${view === 'grid' ? 'text-lg' : 'text-sm md:text-lg'}`}>{event.dateBadge.day}</span>
                      <span className={`uppercase font-bold tracking-widest mt-0.5 ${view === 'grid' ? 'text-[9px]' : 'text-[7px] md:text-[9px]'}`}>{event.dateBadge.month}</span>
                    </div>

                    {/* Heart (Hidden on tiny mobile list to save space) */}
                    <button className={`absolute right-2 text-white/80 hover:text-primary transition-colors drop-shadow-md z-10 ${view === 'grid' ? 'top-2.5' : 'hidden sm:block top-2 md:top-2.5'}`}>
                      <Heart size={view === 'grid' ? 18 : 16} className="stroke-[2.5]" />
                    </button>

                    {/* Status Badge */}
                    <div className={`absolute left-1.5 bg-secondary text-black font-black rounded uppercase shadow-sm z-10 ${view === 'grid' ? 'bottom-2.5 px-2 py-0.5 text-[9px]' : 'bottom-1.5 md:bottom-2.5 px-1.5 md:px-2 py-0.5 text-[7px] md:text-[9px]'}`}>
                      {event.tag}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className={`p-3 md:p-4 flex-1 flex flex-col min-w-0 ${view === 'list' ? 'justify-between' : ''}`}>
                    <div>
                      <h3 className={`font-black text-black tracking-tight truncate ${view === 'grid' ? 'text-[15px] mb-3' : 'text-[13px] md:text-[15px] mb-1.5 md:mb-3'}`}>{event.title}</h3>
                      
                      <div className={`space-y-1 md:space-y-2 mb-2 md:mb-4 text-gray-500 font-medium ${view === 'grid' ? 'text-[11px]' : 'text-[9px] md:text-[11px]'}`}>
                        <div className="flex items-center">
                          <MapPin size={view === 'grid' ? 12 : 10} className="mr-1.5 text-gray-400 shrink-0" />
                          <span className="truncate">{event.venue}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar size={view === 'grid' ? 12 : 10} className="mr-1.5 text-gray-400 shrink-0" />
                          <span className="truncate">{event.date} {view === 'grid' ? `• ${event.time}` : ''}</span>
                        </div>
                      </div>
                    </div>

                    {view === 'grid' ? (
                      /* GRID: stacked buttons */
                      <div className="mt-auto">
                        <div className="mb-3">
                          <span className="font-bold text-primary text-[11px]">
                            From <span className="text-black text-[15px] ml-0.5 tracking-tight">
                              {event.price === 0 ? 'Free' : `₹${event.price.toLocaleString('en-IN')}`}
                            </span>
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <button onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}`); }} className="bg-[#1a1a1a] hover:bg-black text-white font-bold rounded py-2 text-[11px] transition-colors">View</button>
                            <button onClick={(e) => handleShare(e, event)} className="border border-gray-300 hover:border-primary hover:text-primary text-gray-600 font-bold rounded py-2 text-[11px] transition-colors flex items-center justify-center gap-1">
                              {copiedId === event.id ? <Check size={13} className="text-green-500" /> : <Share2 size={13} />}
                              <span>{copiedId === event.id ? 'Copied!' : 'Share'}</span>
                            </button>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}`); }} className="w-full bg-secondary hover:bg-[#e0b51f] text-black font-black rounded py-2.5 text-[12px] transition-colors tracking-wide">Book Now</button>
                        </div>
                      </div>
                    ) : (
                      /* LIST: responsive - stacked on mobile, inline on desktop */
                      <div className="mt-auto pt-3 border-t border-gray-100">
                        {/* Mobile: price + share row, then book now */}
                        <div className="flex sm:hidden flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-black font-black text-[15px] tracking-tight">
                              <span className="font-bold text-primary text-[10px] block leading-tight">From</span>
                              {event.price === 0 ? 'Free' : `₹${event.price.toLocaleString('en-IN')}`}
                            </span>
                            <div className="flex gap-1.5">
                              <button onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}`); }} className="bg-[#1a1a1a] hover:bg-black text-white font-bold rounded px-3 py-2 text-[11px] transition-colors">View</button>
                              <button onClick={(e) => handleShare(e, event)} className="border border-gray-300 hover:border-primary hover:text-primary text-gray-600 font-bold rounded px-3 py-2 text-[11px] transition-colors flex items-center gap-1">
                                {copiedId === event.id ? <Check size={13} className="text-green-500" /> : <Share2 size={13} />}
                              </button>
                            </div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}`); }} className="w-full bg-secondary hover:bg-[#e0b51f] text-black font-black rounded py-2 text-[12px] transition-colors">Book Now</button>
                        </div>
                        {/* Desktop: all inline */}
                        <div className="hidden sm:flex items-center justify-between gap-3">
                          <div className="shrink-0">
                            <span className="font-bold text-primary text-[11px] block leading-tight">From</span>
                            <span className="text-black font-black text-[15px] tracking-tight">
                              {event.price === 0 ? 'Free' : `₹${event.price.toLocaleString('en-IN')}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}`); }} className="bg-[#1a1a1a] hover:bg-black text-white font-bold rounded px-4 py-2 text-[11px] transition-colors whitespace-nowrap">View</button>
                            <button onClick={(e) => handleShare(e, event)} className="border border-gray-300 hover:border-primary hover:text-primary text-gray-600 font-bold rounded px-3 py-2 text-[11px] transition-colors flex items-center gap-1 whitespace-nowrap">
                              {copiedId === event.id ? <Check size={13} className="text-green-500" /> : <Share2 size={13} />}
                              <span>{copiedId === event.id ? 'Copied!' : 'Share'}</span>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}`); }} className="bg-secondary hover:bg-[#e0b51f] text-black font-black rounded px-5 py-2 text-[11px] transition-colors whitespace-nowrap">Book Now</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-10">
              <div className="flex items-center space-x-1.5 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-100">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded font-bold text-[13px] transition-colors ${currentPage === i + 1 ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary disabled:opacity-50 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
