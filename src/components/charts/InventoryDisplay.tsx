import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrentUser } from '@/store/auth.store';
import { useChapterInventory } from '@/store/inventory.store';
import { type InventoryItem } from '@/types';
import { Role } from '@/types';

interface InventoryDisplayProps {
  chapterName: string;
  showTitle?: boolean;
  compact?: boolean;
}

const InventoryDisplay: React.FC<InventoryDisplayProps> = ({
  chapterName,
  showTitle = true,
  compact = false,
}) => {
  const inventory = useChapterInventory(chapterName);
  const [filter, setFilter] = useState<string>('All');
  const currentUser = useCurrentUser();

  const categories = ['All', 'Masks', 'TVs', 'Signs'];

  const filteredInventory =
    filter === 'All'
      ? inventory
      : inventory.filter((item) => item.category === filter);

  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);

  // Check if user can manage this chapter's inventory
  const canManageInventory =
    currentUser &&
    (currentUser.role === Role.GODMODE ||
      currentUser.role === Role.GLOBAL_ADMIN ||
      currentUser.role === Role.REGIONAL_ORGANISER ||
      (currentUser.role === Role.CHAPTER_ORGANISER &&
        currentUser.organiserOf?.includes(chapterName)));

  if (inventory.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-bold uppercase tracking-wider text-foreground">
            No inventory items
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            This chapter hasn't added any inventory items yet.
          </p>
          {canManageInventory && (
            <div className="mt-4">
              <Button asChild>
                <Link to="/manage">Manage Inventory</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {chapterName} Inventory
            </h2>
            <p className="text-sm uppercase tracking-wider text-muted-foreground">
              {inventory.length} item types • {totalItems} total items
            </p>
          </div>
          {canManageInventory && (
            <Button asChild variant="outline" size="sm">
              <Link to="/manage">Manage Inventory</Link>
            </Button>
          )}
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            onClick={() => setFilter(category)}
            variant={filter === category ? 'default' : 'outline'}
            size="sm"
            className="text-xs font-bold uppercase tracking-wider"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Inventory List */}
      {filteredInventory.length > 0 ? (
        <div
          className={`grid gap-4 ${
            compact
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {filteredInventory.map((item) => (
            <InventoryItemCard key={item.id} item={item} compact={compact} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-bold uppercase tracking-wider text-foreground">
              No {filter.toLowerCase()} found
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different category.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const InventoryItemCard: React.FC<{
  item: InventoryItem;
  compact?: boolean;
}> = ({ item, compact = false }) => {
  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {item.category}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-bold text-foreground">
                  QTY: {item.quantity}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between">
          <div className="flex-1">
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-foreground">
                {item.category}
              </h3>
            </div>
            <div className="mb-3 flex items-center gap-4 text-sm">
              <span className="font-bold text-foreground">
                QTY: {item.quantity}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryDisplay;
