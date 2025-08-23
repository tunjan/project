import React, { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@/icons';
import { toast } from 'sonner';
import { type InventoryItem } from '@/types';
import { InputField, SelectField, TextAreaField } from '@/components/ui/Form';

interface ChapterInventoryProps {
  chapterName: string;
  inventory: InventoryItem[];
  onUpdateInventory: (items: InventoryItem[]) => void;
}

interface ItemFormProps {
  item?: InventoryItem;
  onSave: (
    item: Omit<InventoryItem, 'id' | 'chapterName' | 'lastUpdated'>
  ) => void;
  onCancel: () => void;
}

const ItemForm: React.FC<ItemFormProps> = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    category: item?.category || ('Miscellaneous' as InventoryItem['category']),
    quantity: item?.quantity || 1,
    condition: item?.condition || ('Good' as InventoryItem['condition']),
    location: item?.location || '',
    notes: item?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Item name is required');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="card-brutal card-padding">
      <h3 className="h-subsection">{item ? 'Edit Item' : 'Add New Item'}</h3>
      <form onSubmit={handleSubmit} className="form-spacing">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <InputField
            label="Item Name"
            id="item-name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Anonymous Masks"
            required
          />

          <SelectField
            label="Category"
            id="category"
            value={formData.category}
            onChange={(e) =>
              setFormData({
                ...formData,
                category: e.target.value as InventoryItem['category'],
              })
            }
          >
            <option value="Masks">Masks</option>
            <option value="Laptops">Laptops</option>
            <option value="Signs">Signs</option>
            <option value="Cameras">Cameras</option>
            <option value="Miscellaneous">Miscellaneous</option>
          </SelectField>

          <InputField
            label="Quantity"
            id="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({
                ...formData,
                quantity: parseInt(e.target.value) || 0,
              })
            }
          />

          <SelectField
            label="Condition"
            id="condition"
            value={formData.condition}
            onChange={(e) =>
              setFormData({
                ...formData,
                condition: e.target.value as InventoryItem['condition'],
              })
            }
          >
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Needs Repair">Needs Repair</option>
          </SelectField>
        </div>

        <InputField
          label="Location/Storage"
          id="location"
          type="text"
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          placeholder="e.g., Storage closet, John's apartment"
        />

        <TextAreaField
          label="Notes"
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          placeholder="Additional details about the item..."
        />

        <div className="flex gap-3 pt-4">
          <button type="submit" className="btn-primary">
            {item ? 'Update Item' : 'Add Item'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const InventoryItemCard: React.FC<{
  item: InventoryItem;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ item, onEdit, onDelete }) => {
  const conditionColors = {
    Excellent: 'text-green-600 bg-green-100 border-green-600',
    Good: 'text-blue-600 bg-blue-100 border-blue-600',
    Fair: 'text-yellow-600 bg-yellow-100 border-yellow-600',
    'Needs Repair': 'text-red-600 bg-red-100 border-red-600',
  };

  return (
    <div className="card-brutal card-padding">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-3 flex items-center gap-3">
            <h3 className="h-card">{item.name}</h3>
            <span className="tag-brutal">{item.category}</span>
          </div>
          <div className="mb-3 flex items-center gap-4 text-sm">
            <span className="font-bold text-black">QTY: {item.quantity}</span>
            <span className={`tag-status ${conditionColors[item.condition]}`}>
              {item.condition}
            </span>
          </div>
          {item.location && (
            <p className="mb-2 text-sm text-neutral-700">
              <span className="font-bold text-black">LOCATION:</span>{' '}
              {item.location}
            </p>
          )}
          {item.notes && (
            <p className="mb-2 text-sm text-neutral-700">{item.notes}</p>
          )}
          <p className="font-mono text-xs text-neutral-500">
            Last updated: {new Date(item.lastUpdated).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-neutral-600 transition-colors duration-300 hover:bg-black hover:text-white"
            title="Edit item"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-neutral-600 transition-colors duration-300 hover:bg-primary hover:text-white"
            title="Delete item"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ChapterInventory: React.FC<ChapterInventoryProps> = ({
  chapterName,
  inventory,
  onUpdateInventory,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [filter, setFilter] = useState<string>('All');

  const categories = [
    'All',
    'Masks',
    'Laptops',
    'Signs',
    'Cameras',
    'Miscellaneous',
  ];

  const filteredInventory =
    filter === 'All'
      ? inventory
      : inventory.filter((item) => item.category === filter);

  const handleSaveItem = (
    itemData: Omit<InventoryItem, 'id' | 'chapterName' | 'lastUpdated'>
  ) => {
    if (editingItem) {
      // Update existing item
      const updatedInventory = inventory.map((item) =>
        item.id === editingItem.id
          ? { ...item, ...itemData, lastUpdated: new Date() }
          : item
      );
      onUpdateInventory(updatedInventory);
      toast.success('Item updated successfully');
    } else {
      // Add new item
      const newItem: InventoryItem = {
        ...itemData,
        id: `item_${Date.now()}`,
        chapterName,
        lastUpdated: new Date(),
      };
      onUpdateInventory([...inventory, newItem]);
      toast.success('Item added successfully');
    }
    setShowForm(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const updatedInventory = inventory.filter((item) => item.id !== itemId);
      onUpdateInventory(updatedInventory);
      toast.success('Item deleted successfully');
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const needsRepair = inventory.filter(
    (item) => item.condition === 'Needs Repair'
  ).length;

  return (
    <div className="section-spacing">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="h-section">{chapterName} Inventory</h2>
          <p className="font-mono text-sm uppercase tracking-wider text-neutral-600">
            {inventory.length} item types • {totalItems} total items
            {needsRepair > 0 && (
              <span className="ml-2 font-bold text-primary">
                • {needsRepair} need repair
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Add Item
        </button>
      </div>

      {showForm && (
        <ItemForm
          item={editingItem || undefined}
          onSave={handleSaveItem}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
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
        <div className="grid-spacing grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredInventory.map((item) => (
            <InventoryItemCard
              key={item.id}
              item={item}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDeleteItem(item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="card-brutal card-padding text-center">
          <h3 className="text-xl font-bold uppercase tracking-wider text-black">
            {filter === 'All'
              ? 'No inventory items yet'
              : `No ${filter.toLowerCase()} found`}
          </h3>
          <p className="mt-3 font-mono text-sm text-neutral-600">
            {filter === 'All'
              ? 'Start building your chapter inventory by adding equipment.'
              : 'Try a different category or add new items.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ChapterInventory;
