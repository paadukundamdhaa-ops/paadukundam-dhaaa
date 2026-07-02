import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Palette, ChevronRight, Calendar, MapPin } from 'lucide-react';

export default function AdminDesignerList() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });
      
      if (error) {
        console.error("Error fetching events for designer list:", error);
      }
      
      if (data) setEvents(data);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-black flex items-center gap-2">
          <Palette className="text-purple-600" /> Ticket Designer Module
        </h2>
        <p className="text-sm text-gray-500 mt-1">Select an event below to customize its ticket layout and design.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">No events found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(event => (
            <div 
              key={event.id} 
              onClick={() => navigate(`/admin/events/design/${event.id}`)}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group flex flex-col"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                  <img src={event.image_url || event.img_url || '/images/arijit.png'} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate group-hover:text-purple-700 transition-colors">{event.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <Calendar size={12} /> {new Date(event.event_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5 truncate">
                    <MapPin size={12} shrink-0 /> {event.venue}
                  </div>
                </div>
                <div className="shrink-0 text-gray-300 group-hover:text-purple-500 self-center">
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
