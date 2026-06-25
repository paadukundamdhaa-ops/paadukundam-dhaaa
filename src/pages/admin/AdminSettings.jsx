import React, { useState, useEffect } from 'react';
import { Save, Globe, Lock, Bell, CreditCard, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';
export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('global');
  const [settings, setSettings] = useState({
    support_email: '',
    contact_phone: '',
    office_address: '',
    instagram_url: '',
    twitter_url: '',
    facebook_url: '',
    stripe_public_key: '',
    stripe_secret_key: '',
    enable_email_notifications: true,
    enable_sms_notifications: false,
    enforce_2fa: false,
    session_timeout: '30'
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
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
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
          <button 
            onClick={() => setActiveTab('global')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-bold text-sm rounded-lg transition-colors ${activeTab === 'global' ? 'bg-white text-primary border-l-4 border-l-primary shadow-sm rounded-l-none' : 'text-gray-600 hover:bg-white hover:shadow-sm border-l-4 border-l-transparent'}`}>
            <Globe size={18} /> Global Details
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-bold text-sm rounded-lg transition-colors ${activeTab === 'payments' ? 'bg-white text-primary border-l-4 border-l-primary shadow-sm rounded-l-none' : 'text-gray-600 hover:bg-white hover:shadow-sm border-l-4 border-l-transparent'}`}>
            <CreditCard size={18} /> Payment Gateways
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-bold text-sm rounded-lg transition-colors ${activeTab === 'notifications' ? 'bg-white text-primary border-l-4 border-l-primary shadow-sm rounded-l-none' : 'text-gray-600 hover:bg-white hover:shadow-sm border-l-4 border-l-transparent'}`}>
            <Bell size={18} /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-bold text-sm rounded-lg transition-colors ${activeTab === 'security' ? 'bg-white text-primary border-l-4 border-l-primary shadow-sm rounded-l-none' : 'text-gray-600 hover:bg-white hover:shadow-sm border-l-4 border-l-transparent'}`}>
            <Lock size={18} /> Security & Passwords
          </button>
        </div>

        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === 'global' && (
            <>
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
            </>
          )}

          {activeTab === 'payments' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                <CreditCard className="text-primary" size={24} />
                <h3 className="font-bold text-lg text-black">Payment Gateways</h3>
              </div>
              <p className="text-sm text-gray-500">Configure your Stripe integration to accept ticket payments.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Stripe Publishable Key</label>
                  <input type="text" name="stripe_public_key" value={settings.stripe_public_key || ''} onChange={handleChange} placeholder="pk_live_..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-black font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Stripe Secret Key</label>
                  <input type="password" name="stripe_secret_key" value={settings.stripe_secret_key || ''} onChange={handleChange} placeholder="sk_live_..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-black font-mono text-sm" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                <Bell className="text-primary" size={24} />
                <h3 className="font-bold text-lg text-black">Notification Preferences</h3>
              </div>
              
              <div className="space-y-6">
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div>
                    <span className="block font-bold text-black text-sm">Email Notifications</span>
                    <span className="block text-xs text-gray-500 mt-1">Send automatic ticket confirmations to customers via email.</span>
                  </div>
                  <div className="relative">
                    <input type="checkbox" name="enable_email_notifications" checked={settings.enable_email_notifications} onChange={handleChange} className="sr-only" />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${settings.enable_email_notifications ? 'bg-primary' : 'bg-gray-300'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.enable_email_notifications ? 'transform translate-x-6' : ''}`}></div>
                  </div>
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div>
                    <span className="block font-bold text-black text-sm">SMS Notifications</span>
                    <span className="block text-xs text-gray-500 mt-1">Send ticket QR codes to customers via WhatsApp/SMS.</span>
                  </div>
                  <div className="relative">
                    <input type="checkbox" name="enable_sms_notifications" checked={settings.enable_sms_notifications} onChange={handleChange} className="sr-only" />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${settings.enable_sms_notifications ? 'bg-primary' : 'bg-gray-300'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.enable_sms_notifications ? 'transform translate-x-6' : ''}`}></div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                <Lock className="text-primary" size={24} />
                <h3 className="font-bold text-lg text-black">Security & Passwords</h3>
              </div>
              
              <div className="space-y-6">
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div>
                    <span className="block font-bold text-black text-sm">Enforce Two-Factor Authentication (2FA)</span>
                    <span className="block text-xs text-gray-500 mt-1">Require all admin users to setup 2FA to access the dashboard.</span>
                  </div>
                  <div className="relative">
                    <input type="checkbox" name="enforce_2fa" checked={settings.enforce_2fa} onChange={handleChange} className="sr-only" />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${settings.enforce_2fa ? 'bg-primary' : 'bg-gray-300'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.enforce_2fa ? 'transform translate-x-6' : ''}`}></div>
                  </div>
                </label>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Admin Session Timeout (Minutes)</label>
                  <select name="session_timeout" value={settings.session_timeout || '30'} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-black">
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">1 Hour</option>
                    <option value="120">2 Hours</option>
                    <option value="1440">24 Hours</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
