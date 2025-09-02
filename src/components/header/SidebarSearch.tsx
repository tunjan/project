import React from 'react';

import { SearchIcon } from '@/icons';
import { useSearchActions } from '@/store/search.store';

const SidebarSearch: React.FC = () => {
  const { open } = useSearchActions();

  return (
    <button
      onClick={open}
      className="rounded-nonenone flex w-full items-center gap-3 border-black bg-white p-2 text-left text-neutral-500 transition-colors hover:border-primary md:border-2"
    >
      <SearchIcon className="size-5" />
      <span className="text-sm font-bold">Search...</span>
      <span className="ml-auto text-xs font-semibold">⌘K</span>
    </button>
  );
};

export default SidebarSearch;
