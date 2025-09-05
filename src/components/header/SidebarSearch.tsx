import { Search } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui';
import { useSearchActions } from '@/store/search.store';

const SidebarSearch: React.FC = () => {
  const { open } = useSearchActions();

  return (
    <Button
      variant="outline"
      onClick={open}
      className="flex w-full items-center justify-start gap-3 text-muted-foreground"
    >
      <Search className="size-4" />
      <span className="text-sm font-semibold">Search...</span>
      <span className="ml-auto text-xs font-semibold">⌘K</span>
    </Button>
  );
};

export default SidebarSearch;
