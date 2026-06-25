import React, { useState } from 'react';
import { Search, Plus, MapPin, Calendar, Clock, Edit, Trash2, Eye, X, Filter, MoreVertical, Tag, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';

export default function AdminEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false); // Old state kept just in case
  const [viewEventModal, setViewEventModal] = useState(false);
  const [selectedViewEvent, setSelectedViewEvent] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    category: 'Concert',
    event_date: '',
    event_time: '',
    venue: '',
    status: 'Upcoming',
    total_tickets: '',
    img_url: ''
  });

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      if (data) setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load events. Check console.',
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEvents();

    const eventsSubscription = supabase.channel('public:events-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, payload => {
        fetchEvents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(eventsSubscription);
    };
  }, []);

  const handleOpenModal = (event = null) => {
    if (event) {
      setIsEditing(true);
      setCurrentEventId(event.id);
      setFormData({
        title: event.title,
        artist: event.artist,
        category: event.category,
        event_date: event.event_date,
        event_time: event.event_time,
        venue: event.venue,
        status: event.status,
        total_tickets: event.total_tickets,
        img_url: event.img_url || ''
      });
    } else {
      setIsEditing(false);
      setCurrentEventId(null);
      setFormData({
        title: '',
        artist: '',
        category: 'Concert',
        event_date: '',
        event_time: '',
        venue: '',
        status: 'Upcoming',
        total_tickets: '',
        img_url: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      const eventPayload = {
        title: formData.title,
        artist: formData.artist,
        category: formData.category,
        event_date: formData.event_date,
        event_time: formData.event_time,
        venue: formData.venue,
        status: formData.status,
        total_tickets: parseInt(formData.total_tickets) || 0,
        img_url: formData.img_url
      };

      if (isEditing) {
        const { error } = await supabase.from('events').update(eventPayload).eq('id', currentEventId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('events').insert([eventPayload]);
        if (error) throw error;
      }
      
      handleCloseModal();
      fetchEvents(); // Reload the list
    } catch (error) {
      console.error('Error saving event:', error);
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: 'Failed to save event. Check console.',
        confirmButtonColor: '#e11d48'
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      // First delete associated ticket_tiers to avoid foreign key violations
      const { error: tierError } = await supabase.from('ticket_tiers').delete().eq('event_id', id);
      if (tierError) throw tierError;

      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      setEvents(events.filter(e => e.id !== id));
      Swal.fire({
        title: 'Deleted!',
        text: 'Event has been deleted.',
        icon: 'success',
        confirmButtonColor: '#22c55e'
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: 'Failed to delete event. Check console.',
        confirmButtonColor: '#e11d48'
      });
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-black">Events Management</h2>
          <p className="text-sm text-gray-500">Create, update, and manage all your platform's concerts.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/events/create')} 
          className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20 shrink-0"
        >
          <Plus size={16} /> Create New Event
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-grow">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by event title, artist, or venue..." 
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-black"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-600 bg-white min-w-[150px]"
        >
          <option value="All Status">All Status</option>
          <option value="Live">Live</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Completed">Completed</option>
          <option value="Draft">Draft</option>
        </select>
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-600 bg-white min-w-[150px]"
        >
          <option value="All Categories">All Categories</option>
          {Array.from(new Set(events.map(e => e.category))).filter(Boolean).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-1 lg:col-span-2 p-12 text-center text-gray-500 font-medium">Loading live events from database...</div>
        ) : events.length === 0 ? (
          <div className="col-span-1 lg:col-span-2 p-12 text-center text-gray-500 font-medium">No events found in the database.</div>
        ) : (
          events
            .filter(event => 
              (statusFilter === 'All Status' || event.status === statusFilter) &&
              (categoryFilter === 'All Categories' || event.category === categoryFilter) &&
              (
                (event.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (event.artist || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (event.venue || '').toLowerCase().includes(searchTerm.toLowerCase())
              )
            )
            .map((event) => {
            const percentageSold = Math.round((event.tickets_sold / event.total_tickets) * 100) || 0;
            return (
              <div key={event.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col sm:flex-row hover:border-primary/50 transition-colors group">
                {/* Event Image */}
                <div className="sm:w-48 h-48 sm:h-auto relative shrink-0">
                  <img src={event.img_url || '/images/arijit.png'} alt={event.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider text-white shadow-md ${
                      event.status === 'Live' ? 'bg-secondary text-black' :
                      event.status === 'Upcoming' ? 'bg-blue-500' :
                      event.status === 'Completed' ? 'bg-gray-600' : 'bg-gray-400'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                </div>
                
                {/* Event Details */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-black leading-tight mb-1">{event.title}</h3>
                      <p className="text-xs text-primary font-bold uppercase">{event.category}</p>
                    </div>
                    <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => navigate('/admin/events/edit/' + event.id)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-red-50 rounded" title="Edit"><Edit size={16}/></button>
                      <button onClick={() => handleDelete(event.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 size={16}/></button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4 mt-2">
                    <div className="flex items-center text-xs text-gray-600">
                      <Calendar size={14} className="mr-2 text-gray-400" />
                      <span className="font-semibold">{new Date(event.event_date).toLocaleDateString()}</span>
                      <Clock size={14} className="ml-4 mr-2 text-gray-400" />
                      <span>{event.event_time}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <MapPin size={14} className="mr-2 text-gray-400" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="w-full max-w-[200px]">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500 font-semibold">Tickets Sold</span>
                        <span className="text-black font-bold">{event.tickets_sold} / {event.total_tickets}</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${percentageSold > 80 ? 'bg-green-500' : 'bg-primary'}`} 
                          style={{ width: `${percentageSold}%` }}
                        ></div>
                      </div>
                    </div>
                    <button onClick={() => { setSelectedViewEvent(event); setViewEventModal(true); }} className="text-primary text-sm font-bold flex items-center hover:underline">
                      <Eye size={14} className="mr-1" /> View
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* EVENT DETAILS VIEW MODAL */}
      {viewEventModal && selectedViewEvent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xl font-black text-black uppercase tracking-wide flex items-center gap-2">
                <Eye size={20} className="text-primary" /> Event Details View
              </h3>
              <button onClick={() => setViewEventModal(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-grow bg-white">
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                  <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200 aspect-square">
                    <img src={selectedViewEvent.img_url || '/images/arijit.png'} alt={selectedViewEvent.title} className="w-full h-full object-cover" />
                  </div>
                </div>
                
                <div className="w-full md:w-2/3 space-y-4">
                  <div>
                    <h2 className="text-2xl font-black text-black leading-tight mb-1">{selectedViewEvent.title}</h2>
                    <p className="text-sm text-primary font-bold uppercase tracking-wider">{selectedViewEvent.category}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">Artist</p>
                      <p className="font-semibold text-black">{selectedViewEvent.artist || 'Not specified'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">Status</p>
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider text-white shadow-sm inline-block mt-1 ${
                        selectedViewEvent.status === 'Live' ? 'bg-secondary text-black' :
                        selectedViewEvent.status === 'Upcoming' ? 'bg-blue-500' :
                        selectedViewEvent.status === 'Completed' ? 'bg-gray-600' : 'bg-gray-400'
                      }`}>
                        {selectedViewEvent.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3">
                      <Calendar size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-black">{new Date(selectedViewEvent.event_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <p className="text-xs text-gray-500">Event Date</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-black">{selectedViewEvent.event_time}</p>
                        <p className="text-xs text-gray-500">Event Time</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-black">{selectedViewEvent.venue}</p>
                        <p className="text-xs text-gray-500">Venue Location</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div>
                <h4 className="text-sm font-bold text-black uppercase mb-3">Ticket Statistics</h4>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-700">Tickets Sold</span>
                    <span className="text-sm font-black text-black">{selectedViewEvent.tickets_sold} / {selectedViewEvent.total_tickets}</span>
                  </div>
                  <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${Math.round((selectedViewEvent.tickets_sold / selectedViewEvent.total_tickets) * 100) || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button type="button" onClick={() => setViewEventModal(false)} className="px-6 py-2 rounded-lg font-bold text-white bg-black hover:bg-gray-800 transition-colors">
                Close Preview
              </button>
            </div>
            
          </div>
        </div>
      )}
      
      {/* Pagination Placeholder */}
      <div className="flex justify-center mt-8">
         <div className="flex space-x-1">
            <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-50" disabled>&lt;</button>
            <button className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-100">2</button>
            <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-500 hover:bg-gray-100">&gt;</button>
          </div>
      </div>
    </div>
  );
}
