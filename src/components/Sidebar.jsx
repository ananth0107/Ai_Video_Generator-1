import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Icons } from './Icons';
import ThamiliBrandLogo from './ThamiliBrandLogo';
import { useLanguage } from '../context/LanguageContext';
import { getHistory, isImageVideo, updateHistoryItem, deleteHistoryItem } from '../utils/historyStorage';
import HistoryMenu from './History/HistoryMenu';
import EditVideoNameModal from './History/EditVideoNameModal';
import DeleteVideoModal from './History/DeleteVideoModal';
import { useToast } from '../context/ToastContext';
import UserProfileMenu from './UserProfileMenu';

export default function Sidebar({ isMobileOpen = false, onCloseMobile = () => {} }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [isVideoOpen, setIsVideoOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [showProCard, setShowProCard] = useState(true);
  const [historyItems, setHistoryItems] = useState(() => getHistory());

  // Modals state for renaming & deleting from sidebar
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowProCard(false);
    }, 15000); // Disappears after 15 seconds

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      setHistoryItems(getHistory());
    };
    window.addEventListener('history-updated', handleUpdate);
    return () => window.removeEventListener('history-updated', handleUpdate);
  }, []);

  const path = location.pathname.toLowerCase();
  const isHistory = path.includes('history');
  const isCharacters = path.includes('characters');
  const isImageToVideo = path.includes('image-to-video');
  const isPromptToVideo =
    (path.includes('prompt-to-video') || path.includes('prompt') || path === '/' || path === '/video') &&
    !isImageToVideo &&
    !isCharacters &&
    !isHistory;

  const isAiVideoActive = (isPromptToVideo || isImageToVideo) && !isHistory;

  // Auto-expand history in sidebar when user visits history page
  useEffect(() => {
    if (isHistory) {
      setIsHistoryOpen(true);
    }
  }, [isHistory]);

  const totalHistoryCount = historyItems.length;

  const handleNav = (targetPath) => {
    navigate(targetPath);
    onCloseMobile();
  };

  // Open saved history item directly in its studio to edit
  const handleOpenItemInStudio = (item) => {
    const isImage = isImageVideo(item);
    if (isImage) {
      navigate('/image-to-video', {
        state: {
          presetImage: item.uploadedImage || item.thumbnail,
          presetPrompt: item.prompt,
          presetAspect: item.aspectRatio,
          presetMotion: item.motion || item.style,
          cameraDirection: item.cameraDirection || item.cameraMotion,
          lightingAtmosphere: item.lightingAtmosphere || item.lightingMood,
          sceneryId: item.sceneryId,
          selectedCharacters: item.characters,
          videoItem: item
        }
      });
    } else {
      navigate('/prompt-to-video', {
        state: {
          presetPrompt: item.prompt,
          presetAspect: item.aspectRatio,
          presetStyle: item.style,
          cameraMotion: item.cameraMotion,
          lightingMood: item.lightingMood,
          sceneryId: item.sceneryId,
          selectedCharacters: item.characters,
          videoItem: item
        }
      });
    }
    onCloseMobile();
  };

  // Handler: Edit Name Save
  const handleSaveEditedName = (newName) => {
    if (!editingItem) return;
    const updated = updateHistoryItem(editingItem.id, { name: newName });
    if (updated) {
      setHistoryItems(getHistory());
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
    showToast(
      language === 'ta' ? 'வீடியோ வரலாற்றிலிருந்து நீக்கப்பட்டது' : 'Video deleted from History',
      'Trash2'
    );
    setDeletingItem(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          aria-label="Close navigation"
        />
      )}

      <aside className={`thamili-sidebar-nav ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand-top">
          <Link to="/prompt-to-video" onClick={onCloseMobile} className="sidebar-brand-link" title="THAMILI AI">
            <ThamiliBrandLogo height={42} />
          </Link>

          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
          >
            <Icons.X />
          </button>
        </div>

        {/* Navigation List - Clean Tree with AI Video, Characters & History */}
        <div className="sidebar-scrollable-menu">
          <div className="nav-items-group">
            {/* AI Video Parent Group */}
            <div className="nav-group-block">
              <button
                type="button"
                className={`nav-item-btn video-parent-btn ${isAiVideoActive ? 'active-parent' : ''}`}
                onClick={() => setIsVideoOpen(!isVideoOpen)}
              >
                <div className="nav-btn-left">
                  <span className="sidebar-item-icon"><Icons.Video /></span>
                  <span className="sidebar-item-text">{t('aiVideo')}</span>
                </div>
                <span className={`nav-arrow ${isVideoOpen ? 'expanded' : ''}`}>
                  <Icons.ChevronDown />
                </span>
              </button>

              {isVideoOpen && (
                <div className="nav-sub-items">
                  <button
                    type="button"
                    className={`sub-nav-item ${isPromptToVideo ? 'active-sub' : ''}`}
                    onClick={() => handleNav('/prompt-to-video')}
                  >
                    <span className="sidebar-item-icon"><Icons.Sparkles /></span>
                    <span className="sidebar-item-text">{t('promptToVideo')}</span>
                  </button>

                  <button
                    type="button"
                    className={`sub-nav-item ${isImageToVideo ? 'active-sub' : ''}`}
                    onClick={() => handleNav('/image-to-video')}
                  >
                    <span className="sidebar-item-icon"><Icons.Image /></span>
                    <span className="sidebar-item-text">{t('imageToVideo')}</span>
                  </button>

                  <button
                    type="button"
                    className={`sub-nav-item ${isCharacters ? 'active-sub' : ''}`}
                    onClick={() => handleNav('/characters')}
                  >
                    <span className="sidebar-item-icon"><Icons.Users /></span>
                    <span className="sidebar-item-text">{t('characters')}</span>
                    <span className="nav-pill-tag">10</span>
                  </button>
                </div>
              )}
            </div>

            {/* History Parent Dropdown Group */}
            <div className="nav-group-block">
              <button
                type="button"
                className="nav-item-btn history-parent-btn"
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              >
                <div className="nav-btn-left">
                  <span className="sidebar-item-icon"><Icons.History /></span>
                  <span className="sidebar-item-text">{t('history')}</span>
                </div>
                {totalHistoryCount > 0 && (
                  <span className="nav-pill-tag" style={{ marginRight: '6px' }}>{totalHistoryCount}</span>
                )}
                <span
                  className={`nav-arrow ${isHistoryOpen ? 'expanded' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsHistoryOpen(!isHistoryOpen);
                  }}
                  title="Toggle history submenu"
                >
                  <Icons.ChevronDown />
                </span>
              </button>

              {isHistoryOpen && (
                <div className="nav-sub-items">
                  {/* List of saved history items with three dots (Rename & Delete) */}
                  {historyItems.length > 0 ? (
                    <div className="sidebar-saved-history-list">
                      {historyItems.map((item) => (
                        <div
                          key={item.id}
                          className="sidebar-history-item-row"
                          title={`Click to edit "${item.name}" in Studio`}
                        >
                          <button
                            type="button"
                            className="sidebar-history-item-btn"
                            onClick={() => handleOpenItemInStudio(item)}
                          >
                            <span className="sidebar-item-icon">
                              {isImageVideo(item) ? <Icons.Image /> : <Icons.Sparkles />}
                            </span>
                            <span className="sidebar-history-item-title">{item.name}</span>
                          </button>

                          <HistoryMenu
                            onEditName={() => setEditingItem(item)}
                            onDelete={() => setDeletingItem(item)}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="sidebar-history-empty-text">
                      {language === 'ta' ? 'வரலாறு எதுவும் இல்லை' : 'No saved videos'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upgrade to Pro Card at Bottom (disappears after 15 seconds) */}
        {showProCard && (
          <div className="sidebar-bottom-card-wrap">
            <div className="upgrade-pro-box">
              <div className="pro-box-header">
                <span className="pro-title">{t('upgradeToPro')}</span>
                <span className="pro-sparkle">✨</span>
              </div>
              <p className="pro-sub">{t('proPerkDesc')}</p>
            </div>
          </div>
        )}

        {/* User Profile Bar with Token Usage & Settings (Under menu bar) */}
        <div className="sidebar-bottom-profile-wrap" style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <UserProfileMenu onCloseSidebar={onCloseMobile} />
        </div>

        {/* Edit Video Name Modal */}
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
      </aside>
    </>
  );
}
