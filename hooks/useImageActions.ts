'use client';

import { useState, useCallback, useEffect } from 'react';
import { fetchImages as apiFetchImages, deleteImage as apiDeleteImage } from '@/lib/api/image-api';

interface UseImageActionsProps {
  searchQuery: string;
  addToast: (msg: string, type?: 'success' | 'error') => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info') => void;
  viewMode: 'containers' | 'stacks' | 'images';
}

export function useImageActions({ searchQuery, addToast, showConfirm, viewMode }: UseImageActionsProps) {
  const [images, setImages] = useState<any[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const fetchImages = useCallback(async () => {
    setIsLoadingImages(true);
    try {
      const data = await apiFetchImages();
      setImages(data);
    } catch (e) {
      addToast('Failed to fetch images', 'error');
    } finally {
      setIsLoadingImages(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (viewMode === 'images') {
      fetchImages();
    }
  }, [viewMode, fetchImages]);

  const deleteImage = useCallback(async (id: string, force: boolean = false) => {
    const title = force ? 'Force Delete Image' : 'Delete Image';
    const msg = force 
      ? 'This image is currently in use. Forcing deletion may affect existing containers. Continue?' 
      : 'Are you sure? This image will be permanently removed.';
    
    showConfirm(title, msg, async () => {
      try {
        await apiDeleteImage(id, force);
        addToast(force ? 'Image forcefully removed' : 'Image deleted successfully');
        fetchImages();
      } catch (err: any) {
        const errMsg = err.response?.data?.error || err.message || 'Failed to delete image';
        if (errMsg.includes('conflict') && !force) {
           // Offer force delete
           addToast('Image is in use. Use Force Delete to remove.', 'error');
           deleteImage(id, true);
        } else {
           addToast(errMsg, 'error');
        }
      }
    }, force ? 'danger' : 'warning');
  }, [addToast, showConfirm, fetchImages]);

  const toggleImageSelection = useCallback((id: string) => {
    setSelectedImages(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  const filteredImages = images.filter(img => 
    (img.repoTags?.[0] || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelectAll = useCallback(() => {
    if (selectedImages.length === filteredImages.length && filteredImages.length > 0) {
      setSelectedImages([]);
    } else {
      setSelectedImages(filteredImages.map(img => img.repoTags?.[0] || img.fullId));
    }
  }, [selectedImages.length, filteredImages]);

  const bulkDeleteImages = useCallback(() => {
    if (selectedImages.length === 0) return;
    showConfirm(
      'Delete Selected Images',
      `Are you sure you want to delete ${selectedImages.length} image(s)? This action cannot be undone.`,
      async () => {
        for (const id of selectedImages) {
          try {
            await fetch(`/api/images?id=${id}`, { method: 'DELETE' });
          } catch (e) { /* continue */ }
        }
        addToast(`${selectedImages.length} image(s) deleted`);
        setSelectedImages([]);
        fetchImages();
      },
      'danger'
    );
  }, [selectedImages, showConfirm, addToast, fetchImages]);

  return {
    images,
    isLoadingImages,
    selectedImages,
    setSelectedImages,
    fetchImages,
    deleteImage,
    toggleImageSelection,
    toggleSelectAll,
    bulkDeleteImages,
    filteredImages
  };
}
