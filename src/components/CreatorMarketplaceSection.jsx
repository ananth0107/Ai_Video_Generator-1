import React, { useState } from 'react';
import { marketplaceItems, categoriesList } from '../data/marketplaceData';
import { Icons } from './Icons';
import { useToast } from '../context/ToastContext';

export default function CreatorMarketplaceSection({ onSelectPrompt, onOpenSellModal }) {
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Filter items based on Category & Search
  const filteredItems = marketplaceItems.filter((item) => {
    const matchesCat =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCat && matchesSearch;
  });

  const handleUsePrompt = (item) => {
    if (onSelectPrompt) {
      onSelectPrompt(item.prompt);
    }
    showToast(`Loaded template: "${item.title}"`, 'Sparkles');
    // Smooth scroll back up to prompt box
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLicenseItem = (item) => {
    showToast(`Licensed "${item.title}" for ${item.credits} AI Credits!`, 'Sparkles');
  };

  return (
    <section className="thamili-marketplace-section" id="marketplace-section">
      {/* Hero Banner Card (Image 2) */}
      <div className="marketplace-hero-card">
        <div className="marketplace-hero-content">
          <div className="marketplace-badge-pill">
            <span className="badge-icon">🛍️</span>
            <span>Thamili Creator Ecosystem</span>
          </div>

          <h2 className="marketplace-hero-title">Thamili Creator Marketplace</h2>

          <p className="marketplace-hero-desc">
            Discover, license, and monetize authentic Tamil culture, futuristic art, architecture & visual assets. Creators earn 80% on every license.
          </p>

          <button
            type="button"
            className="marketplace-sell-btn"
            onClick={onOpenSellModal}
          >
            <span className="btn-plus-icon">+</span>
            <span>Sell Your Artwork</span>
          </button>
        </div>
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="marketplace-controls-bar">
        {/* Search Input */}
        <div className="marketplace-search-wrapper">
          <span className="search-icon-inside">
            <Icons.Search />
          </span>
          <input
            type="text"
            className="marketplace-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Tamil weddings, Tanjore temples, Nilgiris tea, cyberpunk, portraits..."
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
            >
              <Icons.X />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="marketplace-sort-wrapper">
          <button
            type="button"
            className="marketplace-sort-btn"
            onClick={() => setIsSortOpen(!isSortOpen)}
          >
            <Icons.Filter />
            <span>
              {sortBy === 'popular'
                ? 'Most Popular'
                : sortBy === 'newest'
                ? 'Newest First'
                : sortBy === 'credits-low'
                ? 'Lowest Credits'
                : 'Highest Rated'}
            </span>
            <Icons.ChevronDown />
          </button>

          {isSortOpen && (
            <div className="marketplace-sort-dropdown">
              <button
                type="button"
                className={`sort-option ${sortBy === 'popular' ? 'active' : ''}`}
                onClick={() => {
                  setSortBy('popular');
                  setIsSortOpen(false);
                }}
              >
                Most Popular
              </button>
              <button
                type="button"
                className={`sort-option ${sortBy === 'newest' ? 'active' : ''}`}
                onClick={() => {
                  setSortBy('newest');
                  setIsSortOpen(false);
                }}
              >
                Newest First
              </button>
              <button
                type="button"
                className={`sort-option ${sortBy === 'credits-low' ? 'active' : ''}`}
                onClick={() => {
                  setSortBy('credits-low');
                  setIsSortOpen(false);
                }}
              >
                Lowest Credits
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="marketplace-category-pills">
        {categoriesList.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              className={`category-pill ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span>{cat.label}</span>
              <span className="pill-count">({cat.count})</span>
            </button>
          );
        })}
      </div>

      {/* Marketplace Artwork Grid */}
      <div className="marketplace-grid">
        {filteredItems.map((item) => (
          <div key={item.id} className="marketplace-card">
            {/* Top Media & Badges */}
            <div className="card-media-wrapper">
              <img
                src={item.image}
                alt={item.title}
                className="card-image"
                loading="lazy"
              />

              {/* Category Tag Pill */}
              <div className="card-category-badge">
                <span>{item.category}</span>
              </div>

              {/* Price / Credits Badge */}
              <div className="card-credits-badge">
                <span className="coin-dot">🪙</span>
                <span>{item.credits} Credits</span>
              </div>

              {/* Hover Overlay Action */}
              <div className="card-hover-overlay">
                <button
                  type="button"
                  className="card-use-btn"
                  onClick={() => handleUsePrompt(item)}
                >
                  <Icons.Sparkles />
                  <span>Use Template</span>
                </button>
                <button
                  type="button"
                  className="card-license-btn"
                  onClick={() => handleLicenseItem(item)}
                >
                  <span>License Artwork</span>
                </button>
              </div>
            </div>

            {/* Card Info Footer */}
            <div className="card-footer-info">
              <h3 className="card-title" title={item.title}>
                {item.title}
              </h3>

              <div className="card-meta-row">
                <div className="card-author">
                  <span className="author-avatar">{item.authorAvatar}</span>
                  <span className="author-name">{item.author}</span>
                </div>
                <div className="card-stats">
                  <span className="stat-item" title={`${item.likes} likes`}>
                    ❤️ {item.likes}
                  </span>
                  <span className="stat-item" title={`${item.downloads} downloads`}>
                    📥 {item.downloads}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
