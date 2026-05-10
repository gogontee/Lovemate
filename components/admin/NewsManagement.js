// components/admin/NewsManagement.js
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
  ExternalLink
} from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/utils/supabaseClient';

// Simple date formatter without external dependencies
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export default function NewsManagement() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const fileInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    summary: '',
    content: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [formError, setFormError] = useState('');

  // Generate unique ID for news
  const generateId = () => {
    return `news_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  };

  // Fetch news
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      alert('Failed to fetch news');
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
      const filePath = `news/${fileName}`;

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
      setFormData({ ...formData, image: imageUrl });
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setFormError('Title is required');
      return false;
    }
    if (!formData.summary.trim()) {
      setFormError('Summary is required');
      return false;
    }
    if (!formData.content.trim()) {
      setFormError('Content is required');
      return false;
    }
    if (!formData.date) {
      setFormError('Date is required');
      return false;
    }
    setFormError('');
    return true;
  };

  const handleAddNews = async () => {
    if (!validateForm()) return;

    setUpdating(true);
    try {
      const newId = generateId();
      const newNews = {
        id: newId,
        title: formData.title,
        image: formData.image || null,
        summary: formData.summary,
        content: formData.content,
        date: formData.date,
        views: 0
      };

      const { error } = await supabase
        .from('news')
        .insert([newNews]);

      if (error) throw error;

      setNews([newNews, ...news]);
      setShowAddModal(false);
      resetForm();
      alert('News added successfully!');
    } catch (error) {
      console.error('Error adding news:', error);
      alert('Failed to add news');
    } finally {
      setUpdating(false);
    }
  };

  const handleEditNews = async () => {
    if (!validateForm() || !editingNews) return;

    setUpdating(true);
    try {
      const updatedNews = {
        ...editingNews,
        title: formData.title,
        image: formData.image,
        summary: formData.summary,
        content: formData.content,
        date: formData.date
      };

      const { error } = await supabase
        .from('news')
        .update(updatedNews)
        .eq('id', editingNews.id);

      if (error) throw error;

      setNews(news.map(item => 
        item.id === editingNews.id ? updatedNews : item
      ));
      setShowEditModal(false);
      setEditingNews(null);
      resetForm();
      alert('News updated successfully!');
    } catch (error) {
      console.error('Error updating news:', error);
      alert('Failed to update news');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteNews = async (id) => {
    if (!window.confirm('Are you sure you want to delete this news article?')) return;

    setUpdating(true);
    try {
      const newsItem = news.find(item => item.id === id);
      
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (newsItem?.image) {
        const imagePath = newsItem.image.split('/').pop();
        await supabase.storage
          .from('asset')
          .remove([`news/${imagePath}`])
          .catch(console.error);
      }

      setNews(news.filter(item => item.id !== id));
      alert('News deleted successfully!');
    } catch (error) {
      console.error('Error deleting news:', error);
      alert('Failed to delete news');
    } finally {
      setUpdating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      image: '',
      summary: '',
      content: '',
      date: new Date().toISOString().split('T')[0]
    });
    setFormError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openEditModal = (item) => {
    setEditingNews(item);
    setFormData({
      title: item.title || '',
      image: item.image || '',
      summary: item.summary || '',
      content: item.content || '',
      date: item.date || new Date().toISOString().split('T')[0]
    });
    setShowEditModal(true);
  };

  const filteredNews = news.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const paginatedNews = filteredNews.slice(
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
          <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
          News Management
        </h2>
        <p className="text-[10px] sm:text-xs text-white/40 mt-1">
          Create, edit and manage news articles
        </p>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:border-orange-500 focus:outline-none transition"
          />
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add News
        </button>
      </div>

      {/* News Table */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-3 text-xs font-medium text-white/60">Image</th>
                <th className="text-left p-3 text-xs font-medium text-white/60">Title</th>
                <th className="text-left p-3 text-xs font-medium text-white/60">Views</th>
                <th className="text-left p-3 text-xs font-medium text-white/60">Date</th>
                <th className="text-left p-3 text-xs font-medium text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedNews.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-white/40">
                    No news articles found
                  </td>
                </tr>
              ) : (
                paginatedNews.map((item) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="p-3">
                      {item.image ? (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-white/20" />
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <p className="text-sm font-medium text-white line-clamp-1">{item.title}</p>
                      <p className="text-xs text-white/40 line-clamp-1">{item.summary}</p>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-xs text-white/60">
                        <Eye className="w-3 h-3" />
                        {item.views || 0}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-xs text-white/60">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.date)}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteNews(item.id)}
                          className="p-1.5 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                        <a
                          href={`/news/${item.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                          title="View"
                        >
                          <ExternalLink className="w-4 h-4 text-white/60" />
                        </a>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/10">
            <p className="text-sm text-white/40">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredNews.length)} of {filteredNews.length}
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
      </div>

      {/* Rest of modals remain exactly the same (unchanged for brevity) */}
      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
              setEditingNews(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-b from-gray-900 to-black rounded-xl border border-white/10 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-lg font-bold text-white mb-4">
                {showAddModal ? 'Add New News' : 'Edit News'}
              </h3>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs text-white/60 mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter news title"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-xs text-white/60 mb-2">Featured Image</label>
                  {formData.image ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-white/10 mb-3">
                      <Image
                        src={formData.image}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1.5 bg-red-500/20 rounded-lg hover:bg-red-500/30"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-white/10 rounded-lg p-6 mb-3 text-center">
                      <ImageIcon className="w-8 h-8 text-white/20 mx-auto mb-2" />
                      <p className="text-xs text-white/40">No image selected</p>
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
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          {formData.image ? 'Change Image' : 'Upload Image'}
                        </>
                      )}
                    </button>
                    {formData.image && (
                      <a
                        href={formData.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-white" />
                      </a>
                    )}
                  </div>
                  <p className="text-[10px] text-white/40 mt-1">
                    Supported: JPG, PNG, GIF. Max 5MB
                  </p>
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-xs text-white/60 mb-1">Summary *</label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="Short summary of the news (displayed in listings)"
                    rows="2"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white resize-none"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs text-white/60 mb-1">Content *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Full news article content (HTML supported)"
                    rows="6"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white resize-none font-mono"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs text-white/60 mb-1">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                  />
                </div>

                {formError && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={showAddModal ? handleAddNews : handleEditNews}
                    disabled={updating || uploadingImage}
                    className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {updating || uploadingImage ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        {uploadingImage ? 'Uploading...' : (showAddModal ? 'Adding...' : 'Updating...')}
                      </span>
                    ) : (
                      showAddModal ? 'Add News' : 'Update News'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setEditingNews(null);
                      resetForm();
                    }}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Updating Indicator */}
      <AnimatePresence>
        {updating && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-green-500/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50"
          >
            <Loader className="w-4 h-4 animate-spin" />
            <span className="text-sm">Processing...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}