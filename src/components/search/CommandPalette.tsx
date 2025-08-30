import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useSearch from '@/hooks/useSearch';
import { SearchIcon } from '@/icons';
import { useSearchStore } from '@/store/search.store';

const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
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
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      {/* Backdrop for closing */}
      <button
        className="absolute inset-0 bg-transparent"
        onClick={close}
        aria-label="Close search"
      />
      <div className="w-full max-w-xl" role="document">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <SearchIcon className="size-5 text-neutral-500" />
          </div>
          <input
            type="text"
            placeholder="Search for activists, chapters, events..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-nonenone w-full border-2 border-black bg-white py-3 pl-12 pr-4 text-base font-bold text-black placeholder:text-neutral-500 focus:border-black focus:outline-none"
          />
        </div>

        {/* Search Results */}
        {query && (
          <div className="mt-2 max-h-96 overflow-y-auto border-2 border-black bg-white">
            {loading && (
              <div className="p-4 text-center">
                <div className="rounded-nonefull inline-block size-6 border-2 border-black border-t-transparent"></div>
                <p className="mt-2 text-sm text-neutral-500">Searching...</p>
              </div>
            )}

            {!loading &&
              users.length === 0 &&
              chapters.length === 0 &&
              events.length === 0 && (
                <div className="p-4 text-center text-sm text-neutral-500">
                  No results found.
                </div>
              )}

            {!loading &&
              (users.length > 0 ||
                chapters.length > 0 ||
                events.length > 0) && (
                <div className="space-y-4 p-4">
                  {/* Users Results */}
                  {users.length > 0 && (
                    <div>
                      <h3 className="text-red mb-2 text-xs font-bold uppercase">
                        Users
                      </h3>
                      <ul className="space-y-1">
                        {users.map((user) => (
                          <li key={user.id}>
                            <button
                              onClick={() => {
                                navigate(`/members/${user.id}`);
                                close();
                              }}
                              className="block w-full p-2 text-left font-bold transition-colors hover:bg-neutral-100"
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
                      <h3 className="text-red mb-2 text-xs font-bold uppercase">
                        Chapters
                      </h3>
                      <ul className="space-y-1">
                        {chapters.map((chapter) => (
                          <li key={chapter.name}>
                            <button
                              onClick={() => {
                                navigate(`/chapters/${chapter.name}`);
                                close();
                              }}
                              className="block w-full p-2 text-left font-bold transition-colors hover:bg-neutral-100"
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
                      <h3 className="text-red mb-2 text-xs font-bold uppercase">
                        Events
                      </h3>
                      <ul className="space-y-1">
                        {events.map((event) => (
                          <li key={event.id}>
                            <button
                              onClick={() => {
                                navigate(`/cubes/${event.id}`);
                                close();
                              }}
                              className="block w-full p-2 text-left font-bold transition-colors hover:bg-neutral-100"
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
