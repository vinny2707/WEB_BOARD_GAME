import React, { useState, useEffect, useCallback } from "react";
import { Check, Loader2, ImageIcon } from "lucide-react";
import { getAllImages } from "@/api/imagesApi";

/**
 * AvatarPicker Component
 * Grid display for selecting avatar from available images
 */
const AvatarPicker = ({ selectedId, onSelect, currentAvatarUrl }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const fetchImages = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const result = await getAllImages(page, 12);

      if (append) {
        setImages((prev) => [...prev, ...result.images]);
      } else {
        setImages(result.images);
      }

      setPagination({
        page: result.pagination.page,
        totalPages: result.pagination.totalPages,
        total: result.pagination.total,
      });
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchImages(1);
  }, [fetchImages]);

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      fetchImages(pagination.page + 1, true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Avatar Preview */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 dark:from-emerald-500/20 dark:to-cyan-500/20 rounded-xl border border-emerald-500/30">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center shadow-lg">
          {currentAvatarUrl || images.find((img) => img.id === selectedId)?.url ? (
            <img
              src={images.find((img) => img.id === selectedId)?.url || currentAvatarUrl}
              alt="Current avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-slate-400" />
          )}
        </div>
        <div>
          <p className="font-medium dark:text-white">Current Avatar</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {selectedId ? "Avatar selected" : "No avatar selected"}
          </p>
        </div>
      </div>

      {/* Avatar Grid */}
      <div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">
          Choose an avatar ({pagination.total} available)
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {images.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => onSelect(image.id)}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
                selectedId === image.id
                  ? "border-emerald-500 ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/30"
                  : "border-slate-200 dark:border-slate-700 hover:border-emerald-400"
              }`}
            >
              <img
                src={image.url}
                alt={`Avatar ${image.id}`}
                className="w-full h-full object-cover"
              />
              {selectedId === image.id && (
                <div className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Load More Button */}
      {pagination.page < pagination.totalPages && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="w-full py-2 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loadingMore ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </>
          ) : (
            `Load more (${pagination.total - images.length} remaining)`
          )}
        </button>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No avatars available</p>
        </div>
      )}
    </div>
  );
};

export default AvatarPicker;
