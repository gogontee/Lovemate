import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Helper function to fix corrupted gallery data
const fixGalleryData = (images) => {
  if (!Array.isArray(images)) return [];
  
  return images.map(item => {
    try {
      if (typeof item === 'object' && item !== null && item.url) {
        return {
          url: item.url,
          caption: item.caption || ''
        };
      }
      
      if (typeof item === 'string') {
        try {
          const parsed = JSON.parse(item);
          if (parsed.url) {
            return {
              url: parsed.url,
              caption: parsed.caption || ''
            };
          }
        } catch {
          return {
            url: item,
            caption: ''
          };
        }
      }
      
      return null;
    } catch (e) {
      console.error('Error fixing gallery item:', e, item);
      return null;
    }
  }).filter(item => item !== null && item.url);
}

// Gallery Modal Component
function GalleryModal({ image, index, total, onClose, onNext, onPrev, onDelete, isOwner, onAddCaption }) {
  const [caption, setCaption] = useState(image.caption || '');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this photo',
          text: caption || 'Beautiful moment',
          url: image.url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(image.url);
      alert('Image link copied to clipboard!');
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-${index + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading:', error);
      alert('Failed to download image');
    }
  };

  const handleSaveCaption = async () => {
    setSaving(true);
    await onAddCaption(index, caption);
    setSaving(false);
    setIsEditing(false);
  };

  const handleDeleteClick = async () => {
    if (confirm('Are you sure you want to delete this image?')) {
      await onDelete(index);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-6xl w-full h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center text-white mb-4">
          <div className="text-lg">
            {index + 1} / {total}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image Container */}
        <div className="flex-1 relative flex items-center justify-center">
          {/* Navigation Arrows */}
          {index > 0 && (
            <button
              onClick={onPrev}
              className="absolute left-4 z-10 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          {index < total - 1 && (
            <button
              onClick={onNext}
              className="absolute right-4 z-10 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Image */}
          <div className="relative w-full h-full max-h-[70vh]">
            <Image
              src={image.url}
              alt={caption || `Gallery image ${index + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              unoptimized={true}
            />
          </div>
        </div>

        {/* Footer with Caption and Actions */}
        <div className="mt-4 text-white">
          {/* Caption - FIXED: Black text for input */}
          <div className="mb-4">
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption..."
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  autoFocus
                />
                <button
                  onClick={handleSaveCaption}
                  disabled={saving}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setCaption(image.caption || '');
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-lg">{caption || 'No caption'}</p>
                {isOwner && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-white/10 rounded-full transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
            
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>

            {isOwner && (
              <button
                onClick={handleDeleteClick}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-700 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Upload Modal Component
function UploadModal({ isOpen, onClose, onUpload, remainingSlots }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [captions, setCaptions] = useState({});
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more image(s).`);
      return;
    }
    
    setSelectedFiles(files);
    
    const initialCaptions = {};
    files.forEach((file, index) => {
      initialCaptions[index] = '';
    });
    setCaptions(initialCaptions);
  };

  const handleCaptionChange = (index, value) => {
    setCaptions(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setCaptions(prev => {
      const newCaptions = { ...prev };
      delete newCaptions[index];
      const reindexed = {};
      Object.values(newCaptions).forEach((caption, i) => {
        reindexed[i] = caption;
      });
      return reindexed;
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    
    const uploadData = selectedFiles.map((file, index) => ({
      file,
      caption: captions[index] || ''
    }));
    
    await onUpload(uploadData);
    setUploading(false);
    setSelectedFiles([]);
    setCaptions({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Upload Images</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 mt-1">
            You can upload up to {remainingSlots} more image(s). Add a caption for each image.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {selectedFiles.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="cursor-pointer inline-flex flex-col items-center"
              >
                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-rose-600 font-semibold">Click to select images</span>
                <span className="text-gray-500 text-sm mt-1">or drag and drop</span>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <input
                        type="text"
                        value={captions[index] || ''}
                        onChange={(e) => handleCaptionChange(index, e.target.value)}
                        placeholder="Add a caption for this image..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-rose-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">{file.name}</p>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="p-1 hover:bg-gray-100 rounded-full transition"
                    >
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              
              {selectedFiles.length < remainingSlots && (
                <div className="mt-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="add-more-input"
                  />
                  <label
                    htmlFor="add-more-input"
                    className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add more images
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image(s)`}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Main Gallery Component
export default function Gallery({ images, isOwner, onUpload, onDelete, onAddCaption }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [fixedImages, setFixedImages] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const MAX_IMAGES = 6;

  // Fix images whenever the prop changes - this handles real-time updates
  useEffect(() => {
    const fixed = fixGalleryData(images);
    setFixedImages(fixed);
    
    // Log for debugging
    console.log('Gallery images updated:', fixed.length);
  }, [images]);

  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const handleUploadModalClose = () => {
    setShowUploadModal(false);
  };

  const handleUploadWithCaptions = async (uploadData) => {
    await onUpload(uploadData);
    // No need to manually update - the parent's real-time subscription will update the images prop
  };

  const handleDelete = async (index) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    // Close modal if open
    setSelectedImageIndex(null);
    
    await onDelete(index);
    // No need to manually update - the parent's real-time subscription will update the images prop
  };

  const remainingSlots = MAX_IMAGES - fixedImages.length;

  return (
    <>
      <section className="py-6 md:py-8 px-4 max-w-6xl mx-auto">
        {/* Header with Image Count */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-600">
            <span className="font-semibold">{fixedImages.length}</span> / {MAX_IMAGES} images
          </div>
          
          {/* Upload Button for Owner */}
          {isOwner && fixedImages.length < MAX_IMAGES && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {remainingSlots} slot{remainingSlots !== 1 ? 's' : ''} left
              </span>
              <button
                onClick={handleUploadClick}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                title="Add Images"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          )}

          {/* Show disabled button when at max */}
          {isOwner && fixedImages.length >= MAX_IMAGES && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Max reached</span>
              <div className="bg-gray-300 text-gray-500 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center cursor-not-allowed">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {fixedImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
            {fixedImages.map((img, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => setSelectedImageIndex(i)}
              >
                <Image
                  src={img.url}
                  alt={img.caption || `Gallery image ${i + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  unoptimized={true}
                />
                
                {/* Caption Overlay */}
                {img.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-white text-xs truncate">{img.caption}</p>
                  </div>
                )}

                {/* Image Number Badge */}
                <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  {i + 1}
                </div>

                {/* Delete Button for Owner (on hover) */}
                {isOwner && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(i);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-600/80 hover:bg-red-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-12 shadow-xl text-center">
            <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 text-lg mb-2">No gallery images available</p>
            {isOwner && (
              <p className="text-gray-400 text-sm">
                Click the camera icon to upload up to {MAX_IMAGES} photos
              </p>
            )}
          </div>
        )}
      </section>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <UploadModal
            isOpen={showUploadModal}
            onClose={handleUploadModalClose}
            onUpload={handleUploadWithCaptions}
            remainingSlots={remainingSlots}
          />
        )}
      </AnimatePresence>

      {/* Gallery Modal */}
      <AnimatePresence>
        {selectedImageIndex !== null && fixedImages[selectedImageIndex] && (
          <GalleryModal
            image={fixedImages[selectedImageIndex]}
            index={selectedImageIndex}
            total={fixedImages.length}
            onClose={() => setSelectedImageIndex(null)}
            onNext={() => setSelectedImageIndex((selectedImageIndex + 1) % fixedImages.length)}
            onPrev={() => setSelectedImageIndex((selectedImageIndex - 1 + fixedImages.length) % fixedImages.length)}
            onDelete={handleDelete}
            onAddCaption={onAddCaption}
            isOwner={isOwner}
          />
        )}
      </AnimatePresence>
    </>
  );
}