import React, { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@/icons';
import { toast } from 'sonner';
import { type InventoryItem } from '@/types';
import { InputField, SelectField } from '@/components/ui/Form';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

interface ChapterInventoryProps {
  chapterName: string;
  inventory: InventoryItem[];
  onUpdateInventory: (items: InventoryItem[]) => void;
}

interface ItemFormProps {
  item?: InventoryItem;
  onSave: (item: Omit<InventoryItem, 'id' | 'chapterName'>) => void;
  onCancel: () => void;
}

const ItemForm: React.FC<ItemFormProps> = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    category: item?.category || ('Masks' as InventoryItem['category']),
    quantity: item?.quantity || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="border-2 border-black bg-white p-4">
      <h3 className="h-subsection">{item ? 'Edit Item' : 'Add New Item'}</h3>
      <form onSubmit={handleSubmit} className="form-spacing">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
            <option value="TVs">TVs</option>
            <option value="Signs">Signs</option>
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
        </div>

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
  return (
    <div className="border-2 border-black bg-white p-4">
      <div className="flex justify-between">
        <div className="flex-1">
          <div className="mb-3">
            <h3 className="h-card">{item.category}</h3>
          </div>
          <div className="mb-3 flex items-center gap-4 text-sm">
            <span className="font-bold text-black">QTY: {item.quantity}</span>
          </div>
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

  const categories = ['All', 'Masks', 'TVs', 'Signs'];

  const filteredInventory =
    filter === 'All'
      ? inventory
      : inventory.filter((item) => item.category === filter);

  const handleSaveItem = (
    itemData: Omit<InventoryItem, 'id' | 'chapterName'>
  ) => {
    if (editingItem) {
      // Update existing item
      const updatedInventory = inventory.map((item) =>
        item.id === editingItem.id ? { ...item, ...itemData } : item
      );
      onUpdateInventory(updatedInventory);
      toast.success('Item updated successfully');
    } else {
      // Add new item
      const newItem: InventoryItem = {
        ...itemData,
        id: `item_${Date.now()}`,
        chapterName,
      };
      onUpdateInventory([...inventory, newItem]);
      toast.success('Item added successfully');
    }
    setShowForm(false);
    setEditingItem(null);
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleDeleteItem = (itemId: string) => {
    const updatedInventory = inventory.filter((item) => item.id !== itemId);
    onUpdateInventory(updatedInventory);
    toast.success('Item deleted successfully');
  };

  const openDeleteModal = (itemId: string) => {
    setItemToDelete(itemId);
    setDeleteModalOpen(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="section-spacing">
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          if (itemToDelete) {
            handleDeleteItem(itemToDelete);
          }
        }}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="h-section">{chapterName} Inventory</h2>
          <p className="font-mono text-sm uppercase tracking-wider text-neutral-600">
            {inventory.length} item types • {totalItems} total items
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
              onDelete={() => openDeleteModal(item.id)}
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
