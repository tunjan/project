import React, { useState, useEffect } from 'react';
import { useSearchStore } from '@/store/search.store';
import useSearch from '@/hooks/useSearch';
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
        
        {/* Search Results */}
        {query && (
          <div className="mt-2 max-h-96 overflow-y-auto border-2 border-black bg-white">
            {loading && (
              <div className="p-4 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
                <p className="mt-2 text-sm text-neutral-500">Searching...</p>
              </div>
            )}
            
            {!loading && users.length === 0 && chapters.length === 0 && events.length === 0 && (
              <div className="p-4 text-center text-sm text-neutral-500">
                No results found.
              </div>
            )}
            
            {!loading && (users.length > 0 || chapters.length > 0 || events.length > 0) && (
              <div className="p-4 space-y-4">
                {/* Users Results */}
                {users.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase text-red mb-2">Users</h3>
                    <ul className="space-y-1">
                      {users.map((user) => (
                        <li key={user.id}>
                          <button
                            onClick={() => {
                              window.location.href = `/members/${user.id}`;
                              close();
                            }}
                            className="block w-full text-left p-2 font-bold hover:bg-neutral-100 transition-colors"
                          >
                            {user.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Chapters Results */}
                {chapters.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase text-red mb-2">Chapters</h3>
                    <ul className="space-y-1">
                      {chapters.map((chapter) => (
                        <li key={chapter.name}>
                          <button
                            onClick={() => {
                              window.location.href = `/chapters/${chapter.name}`;
                              close();
                            }}
                            className="block w-full text-left p-2 font-bold hover:bg-neutral-100 transition-colors"
                          >
                            {chapter.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Events Results */}
                {events.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase text-red mb-2">Events</h3>
                    <ul className="space-y-1">
                      {events.map((event) => (
                        <li key={event.id}>
                          <button
                            onClick={() => {
                              window.location.href = `/cubes/${event.id}`;
                              close();
                            }}
                            className="block w-full text-left p-2 font-bold hover:bg-neutral-100 transition-colors"
                          >
                            {event.location}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandPalette;
