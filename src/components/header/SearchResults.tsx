import React from 'react';
import { Link } from 'react-router-dom';
import { type User, type Chapter, type CubeEvent } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';

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
    <div className="absolute left-0 top-full mt-2 w-full rounded-none border-2 border-black bg-white shadow-brutal">
      <div className="max-h-96 overflow-y-auto p-4">
        {loading && <LoadingSpinner />}
        {!loading && !hasResults && (
          <p className="text-center text-sm text-neutral-500">
            No results found.
          </p>
        )}
        {!loading && hasResults && (
          <div className="space-y-4">
            {users.length > 0 && (
              <div>
                <h3 className="text-red text-xs font-bold uppercase">Users</h3>
                <ul className="mt-2 space-y-1">
                  {users.map((user) => (
                    <li key={user.id}>
                      <Link
                        to={`/members/${user.id}`}
                        onClick={onClose}
                        className="block rounded-none p-2 font-bold hover:bg-white"
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
                <h3 className="text-red text-xs font-bold uppercase">
                  Chapters
                </h3>
                <ul className="mt-2 space-y-1">
                  {chapters.map((chapter) => (
                    <li key={chapter.name}>
                      <Link
                        to={`/chapters/${chapter.name}`}
                        onClick={onClose}
                        className="block rounded-none p-2 font-bold hover:bg-white"
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
                <h3 className="text-red text-xs font-bold uppercase">Events</h3>
                <ul className="mt-2 space-y-1">
                  {events.map((event) => (
                    <li key={event.id}>
                      <Link
                        to={`/cubes/${event.id}`}
                        onClick={onClose}
                        className="block rounded-none p-2 font-bold hover:bg-white"
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
      </div>
    </div>
  );
};

export default SearchResults;
