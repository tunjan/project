import { useCallback, useEffect, useState } from 'react';

import { useChapters, useEvents, useUsers } from '@/store';
import { type Chapter, type CubeEvent, type User } from '@/types';

const useSearch = (query: string) => {
  const [results, setResults] = useState<{
    users: User[];
    chapters: Chapter[];
    events: CubeEvent[];
  }>({ users: [], chapters: [], events: [] });
  const [loading, setLoading] = useState(false);
  const users = useUsers();
  const chapters = useChapters();
  const events = useEvents();

  // Debounced search function
  const performSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery) {
        setResults({ users: [], chapters: [], events: [] });
        return;
      }

      setLoading(true);
      const lowerCaseQuery = searchQuery.toLowerCase();

      const filteredUsers = users.filter(
        (user) =>
          user.name.toLowerCase().includes(lowerCaseQuery) ||
          user.email.toLowerCase().includes(lowerCaseQuery)
      );

      const filteredChapters = chapters.filter((chapter) =>
        chapter.name.toLowerCase().includes(lowerCaseQuery)
      );

      const filteredEvents = events.filter((event) =>
        event.location.toLowerCase().includes(lowerCaseQuery)
      );

      setResults({
        users: filteredUsers,
        chapters: filteredChapters,
        events: filteredEvents,
      });
      setLoading(false);
    },
    [users, chapters, events]
  );

  useEffect(() => {
    // Debounce search with 300ms delay
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  return { ...results, loading };
};

export default useSearch;
