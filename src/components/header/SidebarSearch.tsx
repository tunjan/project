import React, { useState, useRef, useEffect } from 'react';
import { SearchIcon } from '@/icons';
import useSearch from '@/hooks/useSearch';
import SearchResults from '@/components/header/SearchResults';

const SidebarSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const { users, chapters, events, loading } = useSearch(searchQuery);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchRef]);

  const closeSearchResults = () => {
    setSearchQuery('');
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <SearchIcon className="h-5 w-5 text-neutral-500" />
      </div>
      <input
        type="text"
        placeholder="Search anything..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full rounded-none border-2 border-black bg-white py-2 pl-10 pr-4 text-sm font-bold text-black placeholder-neutral-500 focus:border-primary focus:outline-none"
      />
      {searchQuery && (
        <SearchResults
          users={users}
          chapters={chapters}
          events={events}
          loading={loading}
          onClose={closeSearchResults}
        />
      )}
    </div>
  );
};

export default SidebarSearch;
