import React, { useState } from 'react';
import { Upload, Trash2, Image as ImageIcon, CheckCircle, ExternalLink } from 'lucide-react';

export default function AdminGallery() {
  const [images] = useState([
    { id: 1, url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=600', selected: true },
    { id: 2, url: 'https://images.unsplash.com/photo-1540039155732-68ee23e15b51?auto=format&fit=crop&q=80&w=600', selected: false },
    { id: 3, url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600', selected: false },
    { id: 4, url: 'https://images.unsplash.com/photo-1533174000243-ea84bb301e74?auto=format&fit=crop&q=80&w=600', selected: true },
    { id: 5, url: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&q=80&w=600', selected: false },
    { id: 6, url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=600', selected: false },
    { id: 7, url: 'https://images.unsplash.com/photo-1464375117522-1314d6c469e1?auto=format&fit=crop&q=80&w=600', selected: false },
    { id: 8, url: 'https://images.unsplash.com/photo-1470229722913-7c090bf356c6?auto=format&fit=crop&q=80&w=600', selected: false }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-black">Gallery Management</h2>
          <p className="text-sm text-gray-500">Upload new concert photos and choose which ones to feature.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-50 transition-colors flex items-center gap-2 shadow-sm">
            <Trash2 size={16} /> Delete Selected
          </button>
          <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20">
            <Upload size={16} /> Upload Photos
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="border-2 border-dashed border-primary/30 rounded-xl bg-primary/5 p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/10 transition-colors">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm text-primary">
          <ImageIcon size={32} />
        </div>
        <h3 className="font-bold text-black text-lg mb-1">Click to upload or drag & drop</h3>
        <p className="text-gray-500 text-sm">SVG, PNG, JPG or GIF (max. 5MB)</p>
      </div>

      {/* Gallery Grid */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-black">All Uploaded Photos</h3>
          <p className="text-sm text-gray-500">Showing {images.length} photos</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img) => (
            <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square border border-gray-200 cursor-pointer">
              <img src={img.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Gallery item" />
              
              {/* Overlay */}
              <div className={`absolute inset-0 transition-colors ${img.selected ? 'bg-primary/20' : 'bg-black/0 group-hover:bg-black/40'}`}>
                {/* Checkbox for selection */}
                <div className="absolute top-2 left-2">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${img.selected ? 'bg-primary border-primary text-white' : 'border-white/70 text-transparent opacity-0 group-hover:opacity-100'}`}>
                    <CheckCircle size={14} fill="currentColor" />
                  </div>
                </div>

                {/* Actions */}
                <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-8 h-8 rounded-lg bg-white/90 text-gray-700 hover:text-black hover:bg-white flex items-center justify-center shadow-sm">
                    <ExternalLink size={14} />
                  </button>
                  <button className="w-8 h-8 rounded-lg bg-white/90 text-red-600 hover:text-white hover:bg-red-600 flex items-center justify-center shadow-sm transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
