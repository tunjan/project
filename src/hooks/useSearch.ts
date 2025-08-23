import { useState, useEffect } from 'react';
import { useUsers, useChapters, useEvents } from '@/store';
import { type User, type Chapter, type CubeEvent } from '@/types';

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

  useEffect(() => {
    if (!query) {
      setResults({ users: [], chapters: [], events: [] });
      return;
    }

    setLoading(true);
    const lowerCaseQuery = query.toLowerCase();

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

    setTimeout(() => {
      setResults({
        users: filteredUsers,
        chapters: filteredChapters,
        events: filteredEvents,
      });
      setLoading(false);
    }, 300); // Simulate network delay
  }, [query, users, chapters, events]);

  return { ...results, loading };
};

export default useSearch;
