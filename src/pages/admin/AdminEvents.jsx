import React, { useState } from 'react';
import { Search, Plus, MapPin, Calendar, Clock, Edit, Trash2, Eye, X, Filter, MoreVertical, Tag, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';

export default function AdminEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  
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
            placeholder="Search by event title, artist, or venue..." 
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-black"
          />
        </div>
        <select className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-600 bg-white min-w-[150px]">
          <option>All Status</option>
          <option>Live</option>
          <option>Upcoming</option>
          <option>Completed</option>
          <option>Draft</option>
        </select>
        <select className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-600 bg-white min-w-[150px]">
          <option>All Categories</option>
          <option>Concert</option>
          <option>EDM</option>
          <option>Indie Rock</option>
        </select>
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-1 lg:col-span-2 p-12 text-center text-gray-500 font-medium">Loading live events from database...</div>
        ) : events.length === 0 ? (
          <div className="col-span-1 lg:col-span-2 p-12 text-center text-gray-500 font-medium">No events found in the database.</div>
        ) : (
          events.map((event) => {
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
                      <button onClick={() => handleOpenModal(event)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-red-50 rounded" title="Edit"><Edit size={16}/></button>
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
                    <button className="text-primary text-sm font-bold flex items-center hover:underline">
                      <Eye size={14} className="mr-1" /> View
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xl font-black text-black uppercase tracking-wide">
                {isEditing ? 'Edit Event' : 'Create New Event'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="event-form" onSubmit={handleSaveEvent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Event Title *</label>
                    <input required name="title" value={formData.title} onChange={handleInputChange} type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-black focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. Arijit Singh Live" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Artist Name *</label>
                    <input required name="artist" value={formData.artist} onChange={handleInputChange} type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-black focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. Arijit Singh" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Date *</label>
                    <input required name="event_date" value={formData.event_date} onChange={handleInputChange} type="date" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-black focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Time *</label>
                    <input required name="event_time" value={formData.event_time} onChange={handleInputChange} type="time" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-black focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-black focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                      <option>Concert</option>
                      <option>EDM</option>
                      <option>Indie Rock</option>
                      <option>Sufi</option>
                      <option>Comedy</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Venue Location *</label>
                  <input required name="venue" value={formData.venue} onChange={handleInputChange} type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-black focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. Gachibowli Stadium, Hyderabad" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-black focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                      <option>Upcoming</option>
                      <option>Live</option>
                      <option>Completed</option>
                      <option>Draft</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Total Tickets *</label>
                    <input required name="total_tickets" value={formData.total_tickets} onChange={handleInputChange} type="number" min="1" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-black focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. 5000" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Image URL</label>
                    <input name="img_url" value={formData.img_url} onChange={handleInputChange} type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-black focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. /images/sunburn.png" />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button type="button" onClick={handleCloseModal} className="px-6 py-2 rounded-lg font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button type="submit" form="event-form" className="px-6 py-2 rounded-lg font-bold text-white bg-primary hover:bg-red-700 shadow-md shadow-primary/20 transition-colors">
                {isEditing ? 'Save Changes' : 'Create Event'}
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
