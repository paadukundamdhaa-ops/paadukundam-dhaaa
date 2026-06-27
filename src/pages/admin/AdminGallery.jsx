import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, CheckCircle, Upload, Link as LinkIcon, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';

export default function AdminGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');

  useEffect(() => {
    fetchGallery();
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase.from('events').select('id, title').order('created_at', { ascending: false });
      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setImages(data.map(img => ({ ...img, selected: false })));
    } catch (err) {
      console.error('Error fetching gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id) => {
    setImages(images.map(img => img.id === id ? { ...img, selected: !img.selected } : img));
  };

  const handleAddImage = async () => {
    if (!newImageUrl) return;
    if (!selectedEvent) {
      Swal.fire({ icon: 'warning', title: 'Select Event', text: 'Please select an event for this image.' });
      return;
    }
    setIsUploading(true);
    try {
      const eventObj = events.find(e => e.id === selectedEvent);
      const { error } = await supabase.from('gallery').insert([{ 
        image_url: newImageUrl, 
        is_featured: false,
        event_id: selectedEvent,
        event_title: eventObj?.title 
      }]);
      if (error) throw error;
      setNewImageUrl('');
      fetchGallery();
    } catch (err) {
      console.error('Error adding image:', err);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'Failed to add image',
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      if (!selectedEvent) {
        setIsUploading(false);
        Swal.fire({ icon: 'warning', title: 'Select Event', text: 'Please select an event before uploading.' });
        return;
      }
      try {
        const eventObj = events.find(e => e.id === selectedEvent);
        const { error } = await supabase.from('gallery').insert([{ 
          image_url: base64String, 
          is_featured: false,
          event_id: selectedEvent,
          event_title: eventObj?.title
        }]);
        if (error) throw error;
        fetchGallery();
      } catch (err) {
        console.error('Error adding local image:', err);
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: 'Failed to upload local image. Ensure it is not too large.',
          confirmButtonColor: '#e11d48'
        });
      } finally {
        setIsUploading(false);
        // Clear input so same file can be uploaded again if needed
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteSelected = () => {
    const selectedIds = images.filter(img => img.selected).map(img => img.id);
    if (selectedIds.length === 0) return;
    setImageToDelete(null);
    setShowDeleteModal(true);
  };

  const handleDeleteSingle = (e, id) => {
    e.stopPropagation();
    setImageToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    let idsToDelete = [];
    if (imageToDelete) {
      idsToDelete = [imageToDelete];
    } else {
      idsToDelete = images.filter(img => img.selected).map(img => img.id);
    }

    if (idsToDelete.length === 0) {
      setShowDeleteModal(false);
      return;
    }

    try {
      const { error } = await supabase.from('gallery').delete().in('id', idsToDelete);
      if (error) throw error;
      fetchGallery();
    } catch (err) {
      console.error('Error deleting images:', err);
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: 'Failed to delete images',
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setShowDeleteModal(false);
      setImageToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-black">Gallery Management</h2>
          <p className="text-sm text-gray-500">Upload new concert photos and choose which ones to feature.</p>
        </div>
        <div className="flex gap-2">
          {images.some(img => img.selected) && (
            <button onClick={handleDeleteSelected} className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-50 transition-colors flex items-center gap-2 shadow-sm">
              <Trash2 size={16} /> Delete Selected
            </button>
          )}
        </div>
      </div>

      {/* Upload Zone */}
      <div className="border-2 border-dashed border-primary/30 rounded-xl bg-primary/5 p-10 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm text-primary">
          <ImageIcon size={32} />
        </div>
        <h3 className="font-bold text-black text-lg mb-1">Add Image to Gallery</h3>
        <p className="text-gray-500 text-sm mb-6">Upload a local file or paste an image URL to a specific event folder.</p>
        
        <div className="flex flex-col w-full max-w-md gap-4">
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg outline-none focus:border-primary text-sm text-black"
          >
            <option value="">-- Select Event Folder --</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <label className={`flex-1 cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-semibold hover:bg-gray-50 text-gray-700 transition-colors shadow-sm text-center ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
              {isUploading ? 'Uploading...' : 'Select Local Image'}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
            </label>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-400 font-bold uppercase">
            <div className="h-px bg-gray-300 flex-1"></div>
            <span>OR</span>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>

          <div className="flex gap-2">
            <input 
              type="text" 
              value={newImageUrl} 
              onChange={(e) => setNewImageUrl(e.target.value)} 
              placeholder="https://example.com/image.jpg" 
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm text-black"
            />
            <button 
              onClick={handleAddImage}
              disabled={isUploading || !newImageUrl}
              className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Plus size={16} /> Add URL
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-black">All Uploaded Photos</h3>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-500">Showing {images.length} photos</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {loading ? (
            <div className="col-span-full py-12 text-center text-gray-500">Loading gallery...</div>
          ) : images.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500">No images in the gallery yet.</div>
          ) : images.map((img) => (
            <div key={img.id} onClick={() => toggleSelection(img.id)} className="relative group rounded-xl overflow-hidden aspect-square border border-gray-200 cursor-pointer">
              <img src={img.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Gallery item" />
              
              {img.event_title && (
                <div className="absolute top-0 right-0 bg-black/60 text-white text-[10px] px-2 py-1 m-2 rounded backdrop-blur-sm z-10">
                  {img.event_title}
                </div>
              )}

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
                  <a href={img.image_url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/90 text-gray-700 hover:text-black hover:bg-white flex items-center justify-center shadow-sm">
                    <ExternalLink size={14} />
                  </a>
                  <button onClick={(e) => handleDeleteSingle(e, img.id)} className="w-8 h-8 rounded-lg bg-white/90 text-red-600 hover:text-white hover:bg-red-600 flex items-center justify-center shadow-sm transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <Trash2 size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-black text-black mb-2">Delete Image{(!imageToDelete && images.filter(i => i.selected).length > 1) ? 's' : ''}?</h3>
              <p className="text-gray-500 text-sm mb-6">
                Are you sure you want to delete {imageToDelete ? 'this image' : 'the selected images'}? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-red-600/20"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
