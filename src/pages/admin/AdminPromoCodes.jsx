import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Tag, Edit, MoreVertical, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';

export default function AdminPromoCodes() {
  const [promoCodes, setPromoCodes] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPromoId, setCurrentPromoId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    code: '',
    discount_percentage: '',
    event_id: '',
    max_uses: '',
    status: 'Active'
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch promo codes
      const { data: promoData, error: promoError } = await supabase
        .from('promo_codes')
        .select('*, events(title)')
        .order('created_at', { ascending: false });

      if (promoError) throw promoError;
      setPromoCodes(promoData || []);

      // Fetch events for the dropdown
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('id, title');
      
      if (eventError) throw eventError;
      setEvents(eventData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load promo codes.',
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const promoSub = supabase.channel('public:promo_codes-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promo_codes' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(promoSub);
    };
  }, []);

  const handleOpenModal = (promo = null) => {
    if (promo) {
      setIsEditing(true);
      setCurrentPromoId(promo.id);
      setFormData({
        code: promo.code,
        discount_percentage: promo.discount_percentage,
        event_id: promo.event_id || '',
        max_uses: promo.max_uses,
        status: promo.status
      });
    } else {
      setIsEditing(false);
      setCurrentPromoId(null);
      setFormData({
        code: '',
        discount_percentage: '',
        event_id: '',
        max_uses: '',
        status: 'Active'
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

  const handleSavePromo = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        code: formData.code.toUpperCase().replace(/\s+/g, ''), // Format code properly
        discount_percentage: parseInt(formData.discount_percentage),
        event_id: formData.event_id === '' ? null : formData.event_id,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        status: formData.status
      };

      if (payload.discount_percentage <= 0 || payload.discount_percentage > 100) {
        Swal.fire({ icon: 'warning', title: 'Invalid Discount', text: 'Discount must be between 1 and 100' });
        return;
      }

      if (isEditing) {
        const { error } = await supabase.from('promo_codes').update(payload).eq('id', currentPromoId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('promo_codes').insert([payload]);
        if (error) throw error;
      }
      
      handleCloseModal();
      fetchData(); // Fallback immediate refresh
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Promo code saved successfully!',
        confirmButtonColor: '#22c55e'
      });
    } catch (error) {
      console.error('Error saving promo code:', error);
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: 'Failed to save promo code. It might already exist.',
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
      const { error } = await supabase.from('promo_codes').delete().eq('id', id);
      if (error) throw error;
      fetchData(); // Fallback immediate refresh
      Swal.fire({
        title: 'Deleted!',
        text: 'Promo code has been deleted.',
        icon: 'success',
        confirmButtonColor: '#22c55e'
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: 'Failed to delete promo code.',
        confirmButtonColor: '#e11d48'
      });
    }
  };

  const toggleStatus = async (promo) => {
    const newStatus = promo.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const { error } = await supabase.from('promo_codes').update({ status: newStatus }).eq('id', promo.id);
      if (error) throw error;
      fetchData(); // Fallback immediate refresh
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update status.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-black">Promo Codes</h2>
          <p className="text-sm text-gray-500">Manage discount codes and promotional offers.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-red-700"
        >
          <Plus size={16} /> Create Promo Code
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-semibold">Code</th>
                <th className="p-4 font-semibold">Discount</th>
                <th className="p-4 font-semibold">Event Target</th>
                <th className="p-4 font-semibold">Usage</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading promo codes...</td></tr>
              ) : promoCodes.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No promo codes found. Create one!</td></tr>
              ) : (
                promoCodes.map((promo) => {
                  const usagePercent = Math.round((promo.current_uses / promo.max_uses) * 100) || 0;
                  return (
                    <tr key={promo.id} className="hover:bg-gray-50 group transition-colors">
                      <td className="p-4 font-bold text-black tracking-wider flex items-center gap-2">
                        <Tag size={14} className="text-primary"/> {promo.code}
                      </td>
                      <td className="p-4 font-black text-lg text-primary">{promo.discount_percentage}%</td>
                      <td className="p-4 text-gray-600">
                        {promo.events?.title ? (
                          <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs">{promo.events.title}</span>
                        ) : (
                          <span className="font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md text-xs">All Events</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{promo.current_uses} / {promo.max_uses || '∞'}</span>
                        </div>
                        <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          {promo.max_uses ? (
                            <div className={`h-full rounded-full ${usagePercent >= 100 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(usagePercent, 100)}%` }}></div>
                          ) : (
                            <div className="h-full rounded-full bg-blue-400" style={{ width: '100%' }}></div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                          promo.status === 'Active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`} onClick={() => toggleStatus(promo)}>
                          {promo.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenModal(promo)} className="p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 rounded"><Edit size={16}/></button>
                          <button onClick={() => handleDelete(promo.id)} className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 rounded"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-lg">{isEditing ? 'Edit Promo Code' : 'Create Promo Code'}</h3>
            </div>
            <div className="p-5">
              <form id="promo-form" onSubmit={handleSavePromo} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">PROMO CODE *</label>
                  <input required name="code" value={formData.code} onChange={handleInputChange} type="text" className="w-full border rounded px-3 py-2 text-black uppercase font-mono tracking-widest outline-none focus:border-primary" placeholder="e.g. SUMMER20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">DISCOUNT % *</label>
                    <input required name="discount_percentage" value={formData.discount_percentage} onChange={handleInputChange} type="number" min="1" max="100" className="w-full border rounded px-3 py-2 text-black outline-none focus:border-primary" placeholder="10" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">MAX USES (Optional)</label>
                    <input name="max_uses" value={formData.max_uses} onChange={handleInputChange} type="number" min="1" className="w-full border rounded px-3 py-2 text-black outline-none focus:border-primary" placeholder="Unlimited" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">TARGET EVENT (Optional)</label>
                  <select name="event_id" value={formData.event_id} onChange={handleInputChange} className="w-full border rounded px-3 py-2 text-black outline-none focus:border-primary bg-white">
                    <option value="">-- Apply to All Events --</option>
                    {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">STATUS</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border rounded px-3 py-2 text-black outline-none focus:border-primary bg-white">
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
              <button onClick={handleCloseModal} className="px-4 py-2 border rounded font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
              <button type="submit" form="promo-form" className="px-4 py-2 bg-primary text-white rounded font-bold hover:bg-red-700">{isEditing ? 'Save' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
