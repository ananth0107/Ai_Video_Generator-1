import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icons } from '../components/Icons';
import HistoryCard from '../components/History/HistoryCard';
import EditVideoNameModal from '../components/History/EditVideoNameModal';
import DeleteVideoModal from '../components/History/DeleteVideoModal';
import HistoryPlayerModal from '../components/History/HistoryPlayerModal';
import { getHistory, updateHistoryItem, deleteHistoryItem, isImageVideo } from '../utils/historyStorage';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  // History items state loaded from localStorage
  const [historyItems, setHistoryItems] = useState(() => getHistory());
  const [searchQuery, setSearchQuery] = useState('');

  // Active filter tab: 'all' | 'prompt' | 'image'
  const currentFilter = searchParams.get('filter') || 'all';

  const handleFilterChange = (filterType) => {
    if (filterType === 'all') {
      searchParams.delete('filter');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ filter: filterType });
    }
  };

  // Modals state
  const [activePlayerVideo, setActivePlayerVideo] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  // Sync state with storage and listen for custom events
  useEffect(() => {
    const handleStorageUpdate = () => {
      setHistoryItems(getHistory());
    };

    window.addEventListener('history-updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('history-updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  // Category counts
  const totalCount = historyItems.length;
  const promptCount = useMemo(() => historyItems.filter((i) => !isImageVideo(i)).length, [historyItems]);
  const imageCount = useMemo(() => historyItems.filter((i) => isImageVideo(i)).length, [historyItems]);

  // Filter items by category tab and search query (name or prompt)
  const filteredItems = useMemo(() => {
    let list = historyItems;
    if (currentFilter === 'prompt') {
      list = list.filter((item) => !isImageVideo(item));
    } else if (currentFilter === 'image') {
      list = list.filter((item) => isImageVideo(item));
    }

    const query = searchQuery.trim().toLowerCase();
    if (!query) return list;
    return list.filter((item) => {
      const name = (item.name || '').toLowerCase();
      const prompt = (item.prompt || '').toLowerCase();
      const style = (item.style || '').toLowerCase();
      const charNames = (item.characters || []).map((c) => (c.name || '').toLowerCase()).join(' ');
      return name.includes(query) || prompt.includes(query) || style.includes(query) || charNames.includes(query);
    });
  }, [historyItems, currentFilter, searchQuery]);

  // Handler: Open saved video for playback
  const handleOpenVideo = (item) => {
    setActivePlayerVideo(item);
  };

  // Handler: Edit Name Save
  const handleSaveEditedName = (newName) => {
    if (!editingItem) return;
    const updated = updateHistoryItem(editingItem.id, { name: newName });
    if (updated) {
      setHistoryItems(getHistory());
      // If currently playing this video, update the player title too
      if (activePlayerVideo && activePlayerVideo.id === editingItem.id) {
        setActivePlayerVideo((prev) => ({ ...prev, name: newName }));
      }
      showToast(
        language === 'ta' ? 'வீடியோ பெயர் மாற்றப்பட்டது!' : 'Video name updated!',
        'Check'
      );
    }
    setEditingItem(null);
  };

  // Handler: Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    deleteHistoryItem(deletingItem.id);
    setHistoryItems(getHistory());
    if (activePlayerVideo && activePlayerVideo.id === deletingItem.id) {
      setActivePlayerVideo(null);
    }
    showToast(
      language === 'ta' ? 'வீடியோ வரலாற்றிலிருந்து நீக்கப்பட்டது' : 'Video deleted from History',
      'Trash2'
    );
    setDeletingItem(null);
  };

  return (
    <div className="view-container history-view-container">
      {/* Page Header Row */}
      <div className="page-heading">
        <div className="page-heading-inner">
          <div className="heading-row">
            <button
              type="button"
              onClick={() => navigate('/prompt-to-video')}
              className="icon-btn"
              title="Back to Studio"
            >
              <Icons.ArrowLeft />
            </button>

            <div className="heading-text-group">
              <div className="heading-title-row">
                <h1 className="main-title">{t('historyPageTitle', 'History')}</h1>
                <span className="studio-pill-badge">
                  <Icons.History />
                  <span>{historyItems.length} {historyItems.length === 1 ? 'Video' : 'Videos'}</span>
                </span>
              </div>
              <p className="main-subtitle">
                {t('historyPageSubtitle', 'View and manage your previously generated videos.')}
              </p>
            </div>
          </div>

          <div className="heading-actions-right">
            <button
              type="button"
              onClick={() => navigate('/prompt-to-video')}
              className="generate-btn"
              style={{ width: 'auto', padding: '9px 18px', fontSize: '13px' }}
            >
              <Icons.Sparkles />
              <span>{t('promptToVideo', 'Prompt to Video')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      {historyItems.length > 0 && (
        <div className="history-filters-container">
          {/* Category Tabs: All, Prompt to Video, Image to Video */}
          <div className="history-filter-tabs">
            <button
              type="button"
              className={`history-filter-tab ${currentFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              <Icons.Layers />
              <span>{t('allHistory', 'All History')}</span>
              <span className="history-filter-count-badge">{totalCount}</span>
            </button>

            <button
              type="button"
              className={`history-filter-tab ${currentFilter === 'prompt' ? 'active' : ''}`}
              onClick={() => handleFilterChange('prompt')}
            >
              <Icons.Sparkles />
              <span>{t('promptHistory', 'Prompt to Video')}</span>
              <span className="history-filter-count-badge">{promptCount}</span>
            </button>

            <button
              type="button"
              className={`history-filter-tab ${currentFilter === 'image' ? 'active' : ''}`}
              onClick={() => handleFilterChange('image')}
            >
              <Icons.Image />
              <span>{t('imageHistory', 'Image to Video')}</span>
              <span className="history-filter-count-badge">{imageCount}</span>
            </button>
          </div>

          <div className="history-toolbar-row">
            <div className="history-search-wrap">
              <span className="history-search-icon">
                <Icons.Search />
              </span>
              <input
                type="text"
                placeholder={
                  currentFilter === 'prompt'
                    ? (language === 'ta' ? 'பிராம்ட் அல்லது வீடியோ பெயர் மூலம் தேடுங்கள்...' : 'Search by typed prompt or video name...')
                    : currentFilter === 'image'
                    ? (language === 'ta' ? 'பட அனிமேஷன் அல்லது பெயர் மூலம் தேடுங்கள்...' : 'Search by image motion or video name...')
                    : t('searchHistoryPlaceholder', 'Search by video name or prompt...')
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="history-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="history-search-clear-btn"
                  title="Clear search"
                >
                  <Icons.X />
                </button>
              )}
            </div>

            {searchQuery && (
              <div className="history-search-results-badge">
                <span>{filteredItems.length} found</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area: Empty State OR Grid */}
      {historyItems.length === 0 ? (
        /* Empty State: No videos yet */
        <div className="history-empty-state-box">
          <div className="history-empty-icon-wrap">
            <div className="history-empty-icon-ring">
              <Icons.History />
            </div>
          </div>
          <h2 className="history-empty-title">
            {t('noVideosTitle', 'No videos yet')}
          </h2>
          <p className="history-empty-desc">
            {t('noVideosDesc', 'Your generated videos will appear here.')}
          </p>
          <button
            type="button"
            onClick={() => navigate('/prompt-to-video')}
            className="generate-btn"
            style={{ width: 'auto', padding: '12px 28px', fontSize: '14px', marginTop: '12px' }}
          >
            <Icons.Sparkles />
            <span>{t('createFirstVideo', 'Create Your First Video')}</span>
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        /* Empty Category / Search Results State */
        <div className="history-empty-state-box" style={{ padding: '40px 20px' }}>
          <div className="history-empty-icon-wrap">
            <div className="history-empty-icon-ring" style={{ background: '#f8fafc', color: '#94a3b8' }}>
              {searchQuery ? <Icons.Search /> : currentFilter === 'image' ? <Icons.Image /> : <Icons.Sparkles />}
            </div>
          </div>
          <h3 className="history-empty-title" style={{ fontSize: '18px' }}>
            {searchQuery
              ? 'No matching videos found'
              : currentFilter === 'image'
              ? (language === 'ta' ? 'படம் டூ வீடியோக்கள் எதுவும் இல்லை' : 'No Image to Video generations found')
              : (language === 'ta' ? 'பிராம்ட் டூ வீடியோக்கள் எதுவும் இல்லை' : 'No Prompt to Video generations found')}
          </h3>
          <p className="history-empty-desc">
            {searchQuery ? (
              <>No saved videos match your query "<strong>{searchQuery}</strong>". Try a different name or prompt keyword.</>
            ) : currentFilter === 'image' ? (
              language === 'ta'
                ? 'ஒரு படத்தைப் பதிவேற்றி அதை அற்புதமான 4K அனிமேஷன் வீடியோவாக மாற்றுங்கள்.'
                : 'Upload an image in the Image to Video studio and bring it to life with cinematic camera motion.'
            ) : (
              language === 'ta'
                ? 'பிராம்ட் டூ வீடியோ ஸ்டுடியோவில் ஒரு விளக்கத்தை தட்டச்சு செய்து வீடியோவை உருவாக்குங்கள்.'
                : 'Type a descriptive prompt in the Prompt to Video studio to generate your first AI video.'
            )}
          </p>
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="tool-btn"
              style={{ marginTop: '14px', padding: '8px 18px', fontSize: '13px' }}
            >
              Clear Search Filter
            </button>
          ) : currentFilter === 'image' ? (
            <button
              type="button"
              onClick={() => navigate('/image-to-video')}
              className="generate-btn"
              style={{ width: 'auto', padding: '10px 22px', fontSize: '13px', marginTop: '14px' }}
            >
              <Icons.Image />
              <span>{t('imageToVideo', 'Image to Video')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/prompt-to-video')}
              className="generate-btn"
              style={{ width: 'auto', padding: '10px 22px', fontSize: '13px', marginTop: '14px' }}
            >
              <Icons.Sparkles />
              <span>{t('promptToVideo', 'Prompt to Video')}</span>
            </button>
          )}
        </div>
      ) : (
        /* Video Cards Grid */
        <div className="history-cards-grid">
          {filteredItems.map((item) => (
            <HistoryCard
              key={item.id}
              item={item}
              onOpen={handleOpenVideo}
              onEditName={(targetItem) => setEditingItem(targetItem)}
              onDelete={(targetItem) => setDeletingItem(targetItem)}
            />
          ))}
        </div>
      )}

      {/* Edit Video Name Modal Dialog */}
      <EditVideoNameModal
        isOpen={Boolean(editingItem)}
        currentName={editingItem?.name || ''}
        onSave={handleSaveEditedName}
        onCancel={() => setEditingItem(null)}
      />

      {/* Delete Video Confirmation Dialog */}
      <DeleteVideoModal
        isOpen={Boolean(deletingItem)}
        videoName={deletingItem?.name || ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingItem(null)}
      />

      {/* Video Preview Player Modal */}
      <HistoryPlayerModal
        isOpen={Boolean(activePlayerVideo)}
        videoItem={activePlayerVideo}
        onClose={() => setActivePlayerVideo(null)}
      />
    </div>
  );
}
