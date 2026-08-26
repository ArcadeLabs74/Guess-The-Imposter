import { useState, useRef, useEffect } from 'react';
import { X, Search, Check, Layers, Sparkles, RotateCcw } from 'lucide-react';
import { CATEGORY_OPTIONS, type CategoryOption } from '../data/presetWords';
import { animateScreenIn } from '../lib/animations';
import { soundManager } from '../services/soundService';

interface CategoryModalProps {
  selectedIds: string[];
  activeCategoryId: string;
  onSaveSelection: (newSelectedIds: string[], newActiveCategoryId: string) => void;
  onClose: () => void;
}

const DEFAULT_TOP_10_IDS = [
  'random',
  'food',
  'movies',
  'places',
  'animals',
  'gaming',
  'sports',
  'everyday',
  'professions',
  'superheroes',
];

export function CategoryModal({
  selectedIds,
  activeCategoryId,
  onSaveSelection,
  onClose,
}: CategoryModalProps) {
  const [tempSelected, setTempSelected] = useState<string[]>(
    selectedIds.length > 0 ? selectedIds : DEFAULT_TOP_10_IDS
  );
  const [tempActive, setTempActive] = useState<string>(activeCategoryId);
  const [search, setSearch] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    animateScreenIn(contentRef.current);
  }, []);

  const filteredCategories = CATEGORY_OPTIONS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  const toggleCategory = (cat: CategoryOption) => {
    soundManager.playClick();
    setTempSelected((prev) => {
      const exists = prev.includes(cat.id);
      if (exists) {
        if (prev.length <= 1) return prev;
        const next = prev.filter((id) => id !== cat.id);
        if (tempActive === cat.id) {
          setTempActive(next[0] || 'random');
        }
        return next;
      } else {
        return [...prev, cat.id];
      }
    });
  };

  const handleSelectAll = () => {
    soundManager.playClick();
    setTempSelected(CATEGORY_OPTIONS.map((c) => c.id));
  };

  const handleResetTop10 = () => {
    soundManager.playClick();
    setTempSelected(DEFAULT_TOP_10_IDS);
    if (!DEFAULT_TOP_10_IDS.includes(tempActive)) {
      setTempActive('random');
    }
  };

  const handleApply = () => {
    soundManager.playClick();
    const finalSelected = tempSelected.length > 0 ? tempSelected : DEFAULT_TOP_10_IDS;
    const finalActive = finalSelected.includes(tempActive) ? tempActive : finalSelected[0];
    onSaveSelection(finalSelected, finalActive);
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card panel-pad modal"
        ref={contentRef}
        style={{ maxWidth: 640, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ marginBottom: 14 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 2 }}>
              <Layers size={13} />
              CUSTOMIZE DECKS
            </div>
            <h3 className="modal-title" style={{ fontSize: 24 }}>
              WORD DECK SELECTION
            </h3>
          </div>
          <button
            className="device-icon-btn"
            style={{ color: 'var(--ink)', background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
          Filter and select the category decks available for your session. Up to 10 selected categories will be pinned to your home deck bar.
        </p>

        {/* Search Bar & Quick Filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              className="input"
              style={{ paddingLeft: 38, height: 42, fontSize: 13.5 }}
              placeholder="Search categories (e.g. food, sci-fi, movies, sports)…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ height: 30, padding: '0 10px', fontSize: 11 }}
                onClick={handleSelectAll}
              >
                <Sparkles size={12} /> Select All (16)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ height: 30, padding: '0 10px', fontSize: 11 }}
                onClick={handleResetTop10}
              >
                <RotateCcw size={12} /> Reset Top 10
              </button>
            </div>

            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              {tempSelected.length} of {CATEGORY_OPTIONS.length} Selected
            </span>
          </div>
        </div>

        {/* Scrollable Category Grid */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: 8,
            padding: '4px 2px 12px',
            maxHeight: '44vh',
          }}
        >
          {filteredCategories.map((cat) => {
            const isChecked = tempSelected.includes(cat.id);
            const isActiveMatch = tempActive === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => toggleCategory(cat)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: isChecked ? 'var(--surface)' : 'var(--bg-elevated)',
                  border: isActiveMatch
                    ? '1.5px solid var(--accent-strong)'
                    : isChecked
                    ? '1.5px solid var(--ink)'
                    : '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  opacity: isChecked ? 1 : 0.65,
                }}
              >
                {/* Checkbox Box */}
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    display: 'grid',
                    placeItems: 'center',
                    background: isChecked ? 'var(--ink)' : 'var(--bg)',
                    border: isChecked ? '1px solid var(--ink)' : '1.5px solid var(--border-strong)',
                    color: '#fff',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {isChecked && <Check size={13} strokeWidth={3} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: isChecked ? 'var(--ink)' : 'var(--text-secondary)',
                      }}
                    >
                      {cat.name}
                    </span>

                    {isActiveMatch && (
                      <span
                        style={{
                          fontSize: 9,
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 6px',
                          borderRadius: 999,
                          background: 'var(--accent-dim)',
                          color: 'var(--accent-strong)',
                          fontWeight: 700,
                        }}
                      >
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <p
                    style={{
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      marginTop: 2,
                      lineHeight: 1.35,
                    }}
                  >
                    {cat.description}
                  </p>
                </div>
              </div>
            );
          })}

          {filteredCategories.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              No categories matching "{search}"
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ minWidth: 160 }}
            onClick={handleApply}
          >
            <Check size={14} /> Apply {tempSelected.length} Categories ↗
          </button>
        </div>
      </div>
    </div>
  );
}
