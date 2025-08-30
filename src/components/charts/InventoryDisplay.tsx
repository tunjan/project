import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { type InventoryItem } from '@/types';
import { useChapterInventory } from '@/store/inventory.store';
import { useCurrentUser } from '@/store/auth.store';
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
      <div className="card-brutal card-padding text-center">
        <h3 className="text-lg font-bold uppercase tracking-wider text-black">
          No inventory items
        </h3>
        <p className="text-grey-600 mt-2 font-mono text-sm">
          This chapter hasn't added any inventory items yet.
        </p>
        {canManageInventory && (
          <div className="mt-4">
            <Link
              to="/manage"
              className="btn-primary inline-flex items-center gap-2"
            >
              Manage Inventory
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="section-spacing">
      {showTitle && (
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="h-section">{chapterName} Inventory</h2>
            <p className="text-grey-600 font-mono text-sm uppercase tracking-wider">
              {inventory.length} item types • {totalItems} total items
            </p>
          </div>
          {canManageInventory && (
            <Link to="/manage" className="btn-outline text-sm">
              Manage Inventory
            </Link>
          )}
        </div>
      )}

      {/* Filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
              filter === category
                ? 'border-2 border-primary bg-primary text-white'
                : 'btn-outline'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Inventory List */}
      {filteredInventory.length > 0 ? (
        <div
          className={`grid-spacing grid ${
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
        <div className="card-brutal card-padding text-center">
          <h3 className="text-lg font-bold uppercase tracking-wider text-black">
            No {filter.toLowerCase()} found
          </h3>
          <p className="text-grey-600 mt-2 font-mono text-sm">
            Try a different category.
          </p>
        </div>
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
      <div className="card-brutal card-padding">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="tag-brutal text-xs">{item.category}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-bold text-black">QTY: {item.quantity}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-brutal card-padding">
      <div className="flex justify-between">
        <div className="flex-1">
          <div className="mb-3">
            <h3 className="h-card">{item.category}</h3>
          </div>
          <div className="mb-3 flex items-center gap-4 text-sm">
            <span className="font-bold text-black">QTY: {item.quantity}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDisplay;
