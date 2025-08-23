import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';
import { User, Chapter, Event } from '@/types';

const useSearch = (query: string) => {
    const [results, setResults] = useState<{
        users: User[];
        chapters: Chapter[];
        events: Event[];
    }>({ users: [], chapters: [], events: [] });
    const [loading, setLoading] = useState(false);
    const { users, chapters, events } = useAuthStore();

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
            event.name.toLowerCase().includes(lowerCaseQuery)
        );

        setTimeout(() => {
            setResults({
                users: filteredUsers,
                chapters: filteredChapters,
                events: filteredEvents,
            });
            setLoading(false);
        }, 500); // Simulate network delay
    }, [query, users, chapters, events]);

    return { ...results, loading };
};

export default useSearch;
