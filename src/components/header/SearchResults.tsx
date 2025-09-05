import { Loader2 } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';
import { type Chapter, type CubeEvent, type User } from '@/types';

interface SearchResultsProps {
  users: User[];
  chapters: Chapter[];
  events: CubeEvent[];
  loading: boolean;
  onClose: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  users,
  chapters,
  events,
  loading,
  onClose,
}) => {
  const hasResults =
    users.length > 0 || chapters.length > 0 || events.length > 0;

  return (
    <Card className="absolute left-0 top-full mt-2 w-full">
      <CardContent className="max-h-96 overflow-y-auto p-4">
        {loading && (
          <Loader2 className="mx-auto size-6 animate-spin text-primary" />
        )}
        {!loading && !hasResults && (
          <p className="text-center text-sm text-muted-foreground">
            No results found.
          </p>
        )}
        {!loading && hasResults && (
          <div className="space-y-4">
            {users.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase text-primary">
                  Users
                </h3>
                <ul className="mt-2 space-y-1">
                  {users.map((user) => (
                    <li key={user.id}>
                      <Link
                        to={`/members/${user.id}`}
                        onClick={onClose}
                        className="block rounded-md p-2 font-bold hover:bg-accent"
                      >
                        {user.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {chapters.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase text-primary">
                  Chapters
                </h3>
                <ul className="mt-2 space-y-1">
                  {chapters.map((chapter) => (
                    <li key={chapter.name}>
                      <Link
                        to={`/chapters/${chapter.name}`}
                        onClick={onClose}
                        className="block rounded-md p-2 font-bold hover:bg-accent"
                      >
                        {chapter.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {events.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase text-primary">
                  Events
                </h3>
                <ul className="mt-2 space-y-1">
                  {events.map((event) => (
                    <li key={event.id}>
                      <Link
                        to={`/cubes/${event.id}`}
                        onClick={onClose}
                        className="block rounded-md p-2 font-bold hover:bg-accent"
                      >
                        {event.location}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchResults;
