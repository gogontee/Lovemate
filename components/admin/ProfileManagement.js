// components/admin/ProfileManagement.js
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit,
  Trash2,
  Loader,
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Save,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';

export default function ProfileManagement() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: ''
  });

  // Fetch profiles
  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      // Try table name "profile" first, fallback to "profiles"
      let tableName = 'profile';
      let { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
        tableName = 'profiles';
        const { data: data2, error: error2 } = await supabase
          .from(tableName)
          .select('*')
          .order('created_at', { ascending: false });
        if (error2) throw error2;
        data = data2;
      } else if (error) {
        throw error;
      }

      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      alert('Failed to fetch profiles');
    } finally {
      setLoading(false);
    }
  };

  // Delete profile
  const deleteProfile = async (id) => {
    if (!window.confirm('Are you sure you want to delete this profile? This action cannot be undone.')) return;
    setUpdating(true);
    try {
      // Determine table name again
      let tableName = 'profile';
      let { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
        tableName = 'profiles';
        error = (await supabase.from(tableName).delete().eq('id', id)).error;
      }
      if (error) throw error;

      setProfiles(profiles.filter(p => p.id !== id));
      if (editingId === id) setEditingId(null);
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Failed to delete profile');
    } finally {
      setUpdating(false);
    }
  };

  // Update profile
  const updateProfile = async (id) => {
    setUpdating(true);
    try {
      let tableName = 'profile';
      const updates = {
        full_name: editForm.full_name,
        email: editForm.email,
        phone: editForm.phone,
        role: editForm.role
      };

      let { error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id);

      if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
        tableName = 'profiles';
        error = (await supabase
          .from(tableName)
          .update(updates)
          .eq('id', id)).error;
      }
      if (error) throw error;

      setProfiles(profiles.map(p =>
        p.id === id ? { ...p, ...updates } : p
      ));
      setEditingId(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  // Start editing
  const startEdit = (profile) => {
    setEditingId(profile.id);
    setEditForm({
      full_name: profile.full_name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      role: profile.role || 'user'
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
  };

  // Filter and paginate
  const filteredProfiles = profiles.filter(p =>
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const paginatedProfiles = filteredProfiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-3 sm:p-4">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
          Profile Management
        </h2>
        <p className="text-[10px] sm:text-xs text-white/40 mt-1">
          Manage user profiles, edit roles, and delete accounts
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:border-orange-500 focus:outline-none transition"
        />
      </div>

      {/* Profiles Table - Responsive */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left p-3 text-xs font-medium text-white/60">ID</th>
                <th className="text-left p-3 text-xs font-medium text-white/60">Full Name</th>
                <th className="text-left p-3 text-xs font-medium text-white/60">Email</th>
                <th className="text-left p-3 text-xs font-medium text-white/60">Phone</th>
                <th className="text-left p-3 text-xs font-medium text-white/60">Role</th>
                <th className="text-left p-3 text-xs font-medium text-white/60">Created At</th>
                <th className="text-left p-3 text-xs font-medium text-white/60">Actions</th>
               </tr>
            </thead>
            <tbody>
              {paginatedProfiles.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-white/40">
                    No profiles found
                   </td>
                 </tr>
              ) : (
                paginatedProfiles.map((profile) => (
                  <motion.tr
                    key={profile.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-3 text-xs text-white/40 font-mono">
                      {profile.id.substring(0, 8)}...
                    </td>
                    <td className="p-3">
                      {editingId === profile.id ? (
                        <input
                          type="text"
                          value={editForm.full_name}
                          onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                          className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-sm text-white"
                        />
                      ) : (
                        <span className="text-sm text-white">{profile.full_name || '-'}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {editingId === profile.id ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-sm text-white"
                        />
                      ) : (
                        <span className="text-sm text-white/80">{profile.email}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {editingId === profile.id ? (
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-sm text-white"
                        />
                      ) : (
                        <span className="text-sm text-white/80">{profile.phone || '-'}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {editingId === profile.id ? (
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          className="px-2 py-1 bg-white/10 border border-white/20 rounded text-sm text-white"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="candidate">Candidate</option>
                        </select>
                      ) : (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          profile.role === 'admin' ? 'bg-orange-500/20 text-orange-400' :
                          profile.role === 'candidate' ? 'bg-green-500/20 text-green-400' :
                          'bg-white/20 text-white/60'
                        }`}>
                          {profile.role || 'user'}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-white/40">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      {editingId === profile.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => updateProfile(profile.id)}
                            className="p-1.5 bg-green-500/20 rounded-lg hover:bg-green-500/30"
                            title="Save"
                          >
                            <Save className="w-4 h-4 text-green-400" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 bg-red-500/20 rounded-lg hover:bg-red-500/30"
                            title="Cancel"
                          >
                            <X className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEdit(profile)}
                            className="p-1.5 bg-blue-500/20 rounded-lg hover:bg-blue-500/30"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => deleteProfile(profile.id)}
                            className="p-1.5 bg-red-500/20 rounded-lg hover:bg-red-500/30"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-white/10">
            <p className="text-sm text-white/40 order-2 sm:order-1">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProfiles.length)} of {filteredProfiles.length}
            </p>
            <div className="flex gap-2 order-1 sm:order-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <span className="text-sm text-white">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Global updating indicator */}
      <AnimatePresence>
        {updating && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-green-500/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50"
          >
            <Loader className="w-4 h-4 animate-spin" />
            <span className="text-sm">Saving...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}