import React from 'react';
import { Save, Globe, Lock, Bell, CreditCard } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-black">Platform Settings</h2>
          <p className="text-sm text-gray-500">Manage global site configurations and admin preferences.</p>
        </div>
        <button className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20 shrink-0">
          <Save size={16} /> Save Changes
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
                <input type="email" defaultValue="support@paadukundamdhaa.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-black" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Contact Phone</label>
                <input type="text" defaultValue="+91 12345 67890" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-black" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Office Address</label>
                <textarea rows="3" defaultValue="123 Music Lane, Jubilee Hills, Hyderabad, Telangana 500033" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-black resize-none"></textarea>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
            <h3 className="font-bold text-lg text-black border-b border-gray-200 pb-4">Social Media Links</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Instagram URL</label>
                <input type="url" defaultValue="https://instagram.com/paadukundamdhaa" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-black" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Twitter URL</label>
                <input type="url" defaultValue="https://twitter.com/paadukundamdhaa" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-black" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Facebook URL</label>
                <input type="url" defaultValue="https://facebook.com/paadukundamdhaa" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-black" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
