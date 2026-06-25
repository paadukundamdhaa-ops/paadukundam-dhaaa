import React, { useState, useEffect } from 'react';
import { Save, Globe, Lock, Bell, CreditCard, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    support_email: '',
    contact_phone: '',
    office_address: '',
    instagram_url: '',
    twitter_url: '',
    facebook_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('platform_settings').select('*').limit(1).single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows
      
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (settings.id) {
        // Update existing
        const { error } = await supabase.from('platform_settings').update(settings).eq('id', settings.id);
        if (error) throw error;
      } else {
        // Insert new (just in case the seed failed)
        const { error } = await supabase.from('platform_settings').insert([settings]);
        if (error) throw error;
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Settings Saved',
        text: 'Platform settings updated successfully.',
        confirmButtonColor: '#e11d48'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: 'Could not save settings.',
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
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-black">Platform Settings</h2>
          <p className="text-sm text-gray-500">Manage global site configurations and admin preferences.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20 shrink-0 disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation / Categories */}
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white text-primary border-l-4 border-l-primary shadow-sm font-bold text-sm rounded-r-lg transition-colors">
            <Globe size={18} /> Global Details
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-white hover:shadow-sm font-semibold text-sm rounded-lg transition-colors border-l-4 border-l-transparent">
            <CreditCard size={18} /> Payment Gateways
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-white hover:shadow-sm font-semibold text-sm rounded-lg transition-colors border-l-4 border-l-transparent">
            <Bell size={18} /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-white hover:shadow-sm font-semibold text-sm rounded-lg transition-colors border-l-4 border-l-transparent">
            <Lock size={18} /> Security & Passwords
          </button>
        </div>

        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
            <h3 className="font-bold text-lg text-black border-b border-gray-200 pb-4">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Support Email</label>
                <input type="email" name="support_email" value={settings.support_email || ''} onChange={handleChange} placeholder="support@domain.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-black" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Contact Phone</label>
                <input type="text" name="contact_phone" value={settings.contact_phone || ''} onChange={handleChange} placeholder="+91 12345 67890" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-black" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Office Address</label>
                <textarea rows="3" name="office_address" value={settings.office_address || ''} onChange={handleChange} placeholder="Office address..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-black resize-none"></textarea>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
            <h3 className="font-bold text-lg text-black border-b border-gray-200 pb-4">Social Media Links</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Instagram URL</label>
                <input type="url" name="instagram_url" value={settings.instagram_url || ''} onChange={handleChange} placeholder="https://instagram.com/..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-black" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Twitter URL</label>
                <input type="url" name="twitter_url" value={settings.twitter_url || ''} onChange={handleChange} placeholder="https://twitter.com/..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-black" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Facebook URL</label>
                <input type="url" name="facebook_url" value={settings.facebook_url || ''} onChange={handleChange} placeholder="https://facebook.com/..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-black" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
