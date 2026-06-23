import React, { useState } from 'react';
import { Save, Image as ImageIcon, Type, LayoutTemplate, Star } from 'lucide-react';

export default function AdminHomeCMS() {
  const [activeTab, setActiveTab] = useState('hero');

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
        <button className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20 shrink-0">
          <Save size={16} /> Save All Changes
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
                  <input type="text" defaultValue="FEEL THE RHYTHM LIVE THE MUSIC" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-black font-semibold" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Subheading</label>
                  <textarea rows="3" defaultValue="Book your tickets for the most happening concerts, live shows, and musical events in town." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-600 resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Background Media</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <ImageIcon size={32} className="text-gray-400 mb-2" />
                    <p className="font-semibold text-sm">Upload new Background Image or Video</p>
                    <p className="text-xs text-gray-500 mt-1">Currently using: hero_bg.mp4</p>
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
                {[
                  { label: 'Stat 1', val: '500+', desc: 'Concerts Hosted' },
                  { label: 'Stat 2', val: '2M+', desc: 'Tickets Sold' },
                  { label: 'Stat 3', val: '1M+', desc: 'Happy Customers' },
                  { label: 'Stat 4', val: '25+', desc: 'Cities Covered' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h4 className="font-bold text-sm text-gray-600 mb-3">{stat.label}</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Large Number</label>
                        <input type="text" defaultValue={stat.val} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary font-bold text-black" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                        <input type="text" defaultValue={stat.desc} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-600" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'artists' || activeTab === 'testimonials') && (
            <div className="p-6 flex flex-col items-center justify-center text-center h-64 text-gray-500">
              <Settings size={48} className="mb-4 text-gray-300" />
              <p className="font-bold text-lg text-black mb-1">Feature currently in development.</p>
              <p className="text-sm">You'll soon be able to directly link Database entries here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
