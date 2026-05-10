// components/admin/CandidateManagement.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Edit,
  Loader,
  Image as ImageIcon,
  Calendar,
  Eye,
  Upload,
  X,
  Check,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  User,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Briefcase,
  Heart,
  ToggleLeft,
  ToggleRight,
  RefreshCw
} from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/utils/supabaseClient';

export default function CandidateManagement() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    bio: '',
    full_name: '',
    email: '',
    phone: '',
    age: '',
    occupation: '',
    instagram_handle: '',
    gender: '',
  });
  const [formError, setFormError] = useState('');

  // Fetch candidates
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      alert('Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  // Upload image to Supabase storage
  const uploadImage = async (file) => {
    if (!file) return null;
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `candidates/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('asset')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('asset')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      setFormData({ ...formData, image_url: imageUrl });
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image_url: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Toggle role (status)
  const toggleRole = async (candidate, newRole) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ role: newRole })
        .eq('id', candidate.id);

      if (error) throw error;

      setCandidates(candidates.map(c =>
        c.id === candidate.id ? { ...c, role: newRole } : c
      ));
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  // Delete candidate
  const deleteCandidate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCandidates(candidates.filter(c => c.id !== id));
      if (editingCandidate?.id === id) setShowEditModal(false);
    } catch (error) {
      console.error('Error deleting candidate:', error);
      alert('Failed to delete candidate');
    } finally {
      setUpdating(false);
    }
  };

  // Open edit modal with candidate data
  const openEditModal = (candidate) => {
    setEditingCandidate(candidate);
    setFormData({
      name: candidate.name || '',
      image_url: candidate.image_url || '',
      bio: candidate.bio || '',
      full_name: candidate.full_name || '',
      email: candidate.email || '',
      phone: candidate.phone || '',
      age: candidate.age || '',
      occupation: candidate.occupation || '',
      instagram_handle: candidate.instagram_handle || '',
      gender: candidate.gender || '',
    });
    setShowEditModal(true);
  };

  // Update candidate
  const handleUpdateCandidate = async () => {
    if (!editingCandidate) return;
    setUpdating(true);
    try {
      const updates = {
        name: formData.name,
        image_url: formData.image_url,
        bio: formData.bio,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        age: formData.age ? parseInt(formData.age) : null,
        occupation: formData.occupation,
        instagram_handle: formData.instagram_handle,
        gender: formData.gender,
      };

      const { error } = await supabase
        .from('candidates')
        .update(updates)
        .eq('id', editingCandidate.id);

      if (error) throw error;

      setCandidates(candidates.map(c =>
        c.id === editingCandidate.id ? { ...c, ...updates } : c
      ));
      setShowEditModal(false);
      setEditingCandidate(null);
      alert('Candidate updated successfully');
    } catch (error) {
      console.error('Error updating candidate:', error);
      alert('Failed to update candidate');
    } finally {
      setUpdating(false);
    }
  };

  // Filter and paginate
  const filteredCandidates = candidates.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const paginatedCandidates = filteredCandidates.slice(
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
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
          Candidate Management
        </h2>
        <p className="text-[10px] sm:text-xs text-white/40 mt-1">
          Manage candidates, approve status, edit profiles
        </p>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by name, email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:border-orange-500 focus:outline-none transition"
          />
        </div>
        <button
          onClick={fetchCandidates}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedCandidates.map((candidate) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-orange-500/30 transition-all"
          >
            {/* Header with image & status */}
            <div className="relative">
              {candidate.image_url ? (
                <div className="relative h-40 w-full">
                  <Image
                    src={candidate.image_url}
                    alt={candidate.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-40 bg-white/5 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-white/20" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => toggleRole(candidate, candidate.role === 'Yes' ? 'No' : 'Yes')}
                  disabled={updating}
                  className={`p-1.5 rounded-lg transition-colors ${
                    candidate.role === 'Yes'
                      ? 'bg-green-500/80 text-white'
                      : 'bg-white/20 text-white/80'
                  }`}
                  title={candidate.role === 'Yes' ? 'Approved' : 'Pending'}
                >
                  {candidate.role === 'Yes' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => deleteCandidate(candidate.id)}
                  className="p-1.5 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-lg text-xs text-white/90">
                #{candidate.code || 'N/A'}
              </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white">{candidate.name || candidate.full_name}</h3>
                  <p className="text-xs text-white/40">{candidate.country || 'Country not set'}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${candidate.role === 'Yes' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {candidate.role === 'Yes' ? 'Approved' : 'Pending'}
                </span>
              </div>

              <div className="text-xs text-white/60 space-y-1">
                {candidate.full_name && <div className="flex items-center gap-1"><User className="w-3 h-3" /> {candidate.full_name}</div>}
                {candidate.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {candidate.email}</div>}
                {candidate.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {candidate.phone}</div>}
                {candidate.age && <div>Age: {candidate.age}</div>}
                {candidate.gender && <div>Gender: {candidate.gender}</div>}
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="w-3 h-3 text-white/40" />
                  <span className="text-white/40">
                    {new Date(candidate.created_at).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => openEditModal(candidate)}
                  className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 text-xs font-medium flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <p className="text-sm text-white/40">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCandidates.length)} of {filteredCandidates.length}
          </p>
          <div className="flex gap-2">
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

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && editingCandidate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-b from-gray-900 to-black rounded-xl border border-white/10 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Edit Candidate</h3>
                <button onClick={() => setShowEditModal(false)} className="text-white/60 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Code (read-only) */}
                <div className="bg-white/5 rounded-lg p-3">
                  <label className="block text-xs text-white/60 mb-1">Candidate Code</label>
                  <p className="text-sm text-orange-400 font-mono">{editingCandidate.code || 'N/A'}</p>
                </div>

                {/* Name (nickname) */}
                <div>
                  <label className="block text-xs text-white/60 mb-1">Name (Display name)</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                  />
                </div>

                {/* Full name */}
                <div>
                  <label className="block text-xs text-white/60 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                    />
                  </div>
                </div>

                {/* Age, Gender, Occupation */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Age</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Occupation</label>
                    <input
                      type="text"
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                    />
                  </div>
                </div>

                {/* Instagram Handle */}
                <div>
                  <label className="block text-xs text-white/60 mb-1">Instagram Handle</label>
                  <input
                    type="text"
                    value={formData.instagram_handle}
                    onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs text-white/60 mb-1">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white resize-none"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-xs text-white/60 mb-2">Profile Image</label>
                  {formData.image_url ? (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden border border-white/10 mb-3">
                      <Image src={formData.image_url} alt="Preview" fill className="object-cover" />
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1.5 bg-red-500/20 rounded-lg hover:bg-red-500/30"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-white/10 rounded-lg p-4 mb-3 text-center">
                      <ImageIcon className="w-8 h-8 text-white/20 mx-auto mb-2" />
                      <p className="text-xs text-white/40">No image</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                    >
                      {uploadingImage ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {uploadingImage ? 'Uploading...' : (formData.image_url ? 'Change Image' : 'Upload Image')}
                    </button>
                    {formData.image_url && (
                      <a href={formData.image_url} target="_blank" className="p-2 bg-white/5 rounded-lg">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUpdateCandidate}
                  disabled={updating || uploadingImage}
                  className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-medium"
                >
                  {updating ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : 'Save Changes'}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Updating indicator */}
      <AnimatePresence>
        {updating && (
          <motion.div className="fixed bottom-4 right-4 bg-green-500/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Processing...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}