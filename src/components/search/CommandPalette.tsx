import React, { useState, useEffect } from 'react';
import { useSearchStore } from '@/store/search.store';
import useSearch from '@/hooks/useSearch';
import SearchResults from '@/components/header/SearchResults';
import { SearchIcon } from '@/icons';

const CommandPalette: React.FC = () => {
  const { isOpen, close } = useSearchStore();
  const [query, setQuery] = useState('');
  const { users, chapters, events, loading } = useSearch(query);

  useEffect(() => {
    // Clear query when modal is closed
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [close]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 pt-20"
      onClick={close}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-xl animate-scale-in"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <SearchIcon className="h-5 w-5 text-neutral-500" />
          </div>
          <input
            type="text"
            placeholder="Search for activists, chapters, events..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-none border-2 border-black bg-white py-3 pl-12 pr-4 text-base font-bold text-black placeholder-neutral-500 focus:border-primary focus:outline-none"
            autoFocus
          />
        </div>
        {query && (
          <SearchResults
            users={users}
            chapters={chapters}
            events={events}
            loading={loading}
            onClose={close}
          />
        )}
      </div>
    </div>
  );
};

export default CommandPalette;
