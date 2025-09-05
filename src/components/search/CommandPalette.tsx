import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import useSearch from '@/hooks/useSearch';
import { useSearchStore } from '@/store/search.store';

const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const { isOpen, close } = useSearchStore();
  const [query, setQuery] = useState('');
  const { users, chapters, events, loading } = useSearch(query);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  return (
    <CommandDialog open={isOpen} onOpenChange={close}>
      <CommandInput
        placeholder="Search for activists, chapters, events..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && (
          <div className="p-4 text-center">
            <div className="inline-block size-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <p className="mt-2 text-sm text-neutral-500">Searching...</p>
          </div>
        )}

        {!loading && query && (
          <>
            <CommandEmpty>No results found.</CommandEmpty>

            {/* Users Results */}
            {users.length > 0 && (
              <CommandGroup heading="Users">
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => {
                      navigate(`/members/${user.id}`);
                      close();
                    }}
                  >
                    {user.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Chapters Results */}
            {chapters.length > 0 && (
              <CommandGroup heading="Chapters">
                {chapters.map((chapter) => (
                  <CommandItem
                    key={chapter.name}
                    onSelect={() => {
                      navigate(`/chapters/${chapter.name}`);
                      close();
                    }}
                  >
                    {chapter.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Events Results */}
            {events.length > 0 && (
              <CommandGroup heading="Events">
                {events.map((event) => (
                  <CommandItem
                    key={event.id}
                    onSelect={() => {
                      navigate(`/cubes/${event.id}`);
                      close();
                    }}
                  >
                    {event.location}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
