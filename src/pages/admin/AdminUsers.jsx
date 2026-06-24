import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Edit, Trash2, UserPlus, Mail, Eye, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, bookings(qty)')
        .order('joined_date', { ascending: false });
        
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user profile?')) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      setUsers(users.filter(u => u.id !== id));
    } catch (error) {
      alert('Error deleting user: ' + error.message);
    }
  };

  const toggleUserStatus = async (user) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', user.id);
      if (error) throw error;
      setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    } catch (error) {
      alert('Error updating status: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-black">User Management</h2>
          <p className="text-sm text-gray-500">Manage your platform's registered users and their status.</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20 shrink-0">
          <UserPlus size={16} /> Add New User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {/* Table Header / Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={16} /> Filter
          </button>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-semibold w-12">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                </th>
                <th className="p-4 font-semibold">User Info</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold">Joined Date</th>
                <th className="p-4 font-semibold">Tickets Bought</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">Loading users from database...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">No users found. New signups will appear here automatically once the trigger is set up.</td>
                </tr>
              ) : (
                users.filter(u => 
                  (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                  (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
                ).map((user) => {
                  const totalTickets = user.bookings?.reduce((sum, booking) => sum + (booking.qty || 0), 0) || 0;
                  return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-black">{user.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono tracking-wider">#{user.id.substring(0, 6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-800 font-medium flex items-center gap-1"><Mail size={12} className="text-gray-400"/> {user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">{user.phone || 'No phone'}</p>
                    </td>
                    <td className="p-4 text-gray-600">{new Date(user.joined_date).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-black">{totalTickets}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.status === 'Active' ? 'bg-green-100 text-green-700' : 
                        user.status === 'Inactive' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setSelectedUser(user)}
                          className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors" 
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => toggleUserStatus(user)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" 
                          title={user.status === 'Active' ? "Deactivate User" : "Activate User"}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => deleteUser(user.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" 
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50 text-sm">
          <p className="text-gray-500">
            Showing <span className="font-bold text-black">1</span> to <span className="font-bold text-black">{users.length}</span> of <span className="font-bold text-black">{users.length}</span> users
          </p>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 bg-primary text-white rounded font-bold">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">User Details</h3>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-black transition-colors">
                <X size={20}/>
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl shrink-0">
                  {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h4 className="font-bold text-xl text-black">{selectedUser.name}</h4>
                  <p className="text-sm text-gray-500 font-mono">ID: {selectedUser.id}</p>
                </div>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Email Address</span>
                  <span className="font-semibold text-black">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone Number</span>
                  <span className="font-semibold text-black">{selectedUser.phone || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Account Role</span>
                  <span className="font-semibold text-black">{selectedUser.role || 'User'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Joined Date</span>
                  <span className="font-semibold text-black">{new Date(selectedUser.joined_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Account Status</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    selectedUser.status === 'Active' ? 'bg-green-100 text-green-700' : 
                    selectedUser.status === 'Inactive' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedUser.status || 'Active'}
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
                <button 
                  onClick={() => { toggleUserStatus(selectedUser); setSelectedUser({...selectedUser, status: selectedUser.status === 'Active' ? 'Inactive' : 'Active'}) }}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold transition-colors"
                >
                  {selectedUser.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
                <button 
                  onClick={() => { deleteUser(selectedUser.id); setSelectedUser(null); }}
                  className="flex-1 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-semibold transition-colors"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
