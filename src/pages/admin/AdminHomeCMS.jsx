import React, { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, Type, LayoutTemplate, Star, CheckCircle, Settings, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';

export default function AdminHomeCMS() {
  const [activeTab, setActiveTab] = useState('hero');
  const [toast, setToast] = useState({ show: false, message: '' });

  const [heroSettings, setHeroSettings] = useState({
    heading: 'FEEL THE RHYTHM LIVE THE MUSIC',
    subheading: 'Book your tickets for the most happening concerts, live shows, and musical events in town.',
    bgImages: ['/images/sunburn.png', '', '', '']
  });

  const [stats, setStats] = useState([
    { label: 'Stat 1', val: '500+', desc: 'Concerts Hosted' },
    { label: 'Stat 2', val: '2M+', desc: 'Tickets Sold' },
    { label: 'Stat 3', val: '1M+', desc: 'Happy Customers' },
    { label: 'Stat 4', val: '25+', desc: 'Cities Covered' },
  ]);

  const [testimonials, setTestimonials] = useState([
    { name: 'Riya Sharma', text: 'Amazing experience! The booking process was smooth and the concert was beyond expectations.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
    { name: 'Aman Verma', text: 'Best platform for concert tickets. Quick confirmation and easy entry with QR!', img: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150' },
    { name: 'Neha Kapoor', text: 'Loved the UI and how easy it is to find events. Highly recommended!', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150' },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCMSData();
  }, []);

  const fetchCMSData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('cms_content').select('*');
      if (error) throw error;
      
      if (data && data.length > 0) {
        const hero = data.find(d => d.section_name === 'hero');
        const statsData = data.find(d => d.section_name === 'stats');
        const testData = data.find(d => d.section_name === 'testimonials');
        
        if (hero) setHeroSettings(hero.content_data);
        if (statsData) setStats(statsData.content_data);
        if (testData) setTestimonials(testData.content_data);
      }
    } catch (error) {
      console.error('Error fetching CMS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const updates = [
        { section_name: 'hero', content_data: heroSettings },
        { section_name: 'stats', content_data: stats },
        { section_name: 'testimonials', content_data: testimonials }
      ];
      
      const { error } = await supabase.from('cms_content').upsert(updates, { onConflict: 'section_name' });
      if (error) throw error;
      
      Swal.fire({
        icon: 'success',
        title: 'CMS Saved',
        text: 'CMS settings saved to database successfully!',
        confirmButtonColor: '#e11d48'
      });
    } catch (error) {
      console.error('Error saving CMS:', error);
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: 'Failed to save CMS settings.',
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const tabs = [
    { id: 'hero', name: 'Hero Section', icon: <ImageIcon size={18} /> },
    { id: 'stats', name: 'Stats Banner', icon: <Type size={18} /> },
    { id: 'artists', name: 'Artist Spotlight', icon: <LayoutTemplate size={18} /> },
    { id: 'testimonials', name: 'Testimonials', icon: <Star size={18} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-black">Home Page CMS</h2>
          <p className="text-sm text-gray-500">Edit the content blocks specifically on the main landing page.</p>
        </div>
        <button onClick={handleSaveAll} disabled={saving} className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20 shrink-0 disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* CMS Tabs Sidebar */}
        <div className="w-full lg:w-64 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-fit">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500">Page Sections</h3>
          </div>
          <div className="flex flex-col">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 font-semibold text-sm border-b border-gray-100 transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-primary/5 text-primary border-l-4 border-l-primary' 
                    : 'text-gray-600 hover:bg-gray-50 border-l-4 border-l-transparent'
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* CMS Editor Content */}
        <div className="flex-grow bg-white rounded-xl border border-gray-200 shadow-sm">
          {activeTab === 'hero' && (
            <div className="p-6 space-y-6">
              <h3 className="font-bold text-xl text-black border-b border-gray-200 pb-4">Hero Section Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Main Heading</label>
                  <input type="text" value={heroSettings.heading} onChange={(e) => setHeroSettings({...heroSettings, heading: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-black font-semibold" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Subheading</label>
                  <textarea rows="3" value={heroSettings.subheading} onChange={(e) => setHeroSettings({...heroSettings, subheading: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-600 resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Background Images (Up to 4)</label>
                  <p className="text-xs text-gray-500 mb-3">Add image URLs. If more than 1 is added, the home page will automatically display a slideshow.</p>
                  <div className="space-y-3">
                    {[0, 1, 2, 3].map(idx => (
                      <input 
                        key={idx}
                        type="text" 
                        placeholder={`Image URL ${idx + 1}`}
                        value={heroSettings.bgImages && heroSettings.bgImages[idx] ? heroSettings.bgImages[idx] : ''} 
                        onChange={(e) => {
                          const newImages = [...(heroSettings.bgImages || ['/images/sunburn.png', '', '', ''])];
                          newImages[idx] = e.target.value;
                          setHeroSettings({...heroSettings, bgImages: newImages});
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-black font-semibold text-sm" 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="p-6 space-y-6">
              <h3 className="font-bold text-xl text-black border-b border-gray-200 pb-4">Stats Banner Settings</h3>
              <p className="text-sm text-gray-500">Update the 4 statistics shown in the red banner.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.map((stat, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h4 className="font-bold text-sm text-gray-600 mb-3">{stat.label}</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Large Number</label>
                        <input type="text" value={stat.val} onChange={(e) => {
                          const newStats = [...stats];
                          newStats[idx].val = e.target.value;
                          setStats(newStats);
                        }} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary font-bold text-black" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                        <input type="text" value={stat.desc} onChange={(e) => {
                          const newStats = [...stats];
                          newStats[idx].desc = e.target.value;
                          setStats(newStats);
                        }} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-600" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'artists' && (
            <div className="p-6 space-y-6">
              <h3 className="font-bold text-xl text-black border-b border-gray-200 pb-4">Artist Spotlight</h3>
              <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-xl text-center">
                <LayoutTemplate size={48} className="mx-auto mb-4 text-green-500" />
                <p className="font-bold text-lg mb-2">Automated Section</p>
                <p className="text-sm">
                  The Artist Spotlight and Featured Events sections are automatically populated based on the Live and Upcoming events in your Database. 
                  <br />No manual configuration is needed here!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'testimonials' && (
            <div className="p-6 space-y-6">
              <h3 className="font-bold text-xl text-black border-b border-gray-200 pb-4">Testimonials</h3>
              <p className="text-sm text-gray-500">Edit the reviews shown in the "What Our Fans Say" carousel.</p>
              
              <div className="space-y-6">
                {testimonials.map((test, idx) => (
                  <div key={idx} className="bg-gray-50 p-6 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="col-span-12 md:col-span-3 flex flex-col items-center justify-center">
                      <img src={test.img} alt={test.name} className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md mb-2" />
                      <input type="text" value={test.img} onChange={(e) => {
                        const newT = [...testimonials];
                        newT[idx].img = e.target.value;
                        setTestimonials(newT);
                      }} className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-primary text-center text-black" placeholder="Image URL" />
                    </div>
                    <div className="col-span-12 md:col-span-9 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Reviewer Name</label>
                        <input type="text" value={test.name} onChange={(e) => {
                          const newT = [...testimonials];
                          newT[idx].name = e.target.value;
                          setTestimonials(newT);
                        }} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary font-bold text-black" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Review Text</label>
                        <textarea rows="2" value={test.text} onChange={(e) => {
                          const newT = [...testimonials];
                          newT[idx].text = e.target.value;
                          setTestimonials(newT);
                        }} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-600 resize-none"></textarea>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
