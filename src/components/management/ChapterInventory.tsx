import { Pencil, Plus, Trash } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type InventoryItem } from '@/types';

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
    <Card>
      <CardHeader>
        <CardTitle>{item ? 'Edit Item' : 'Add New Item'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    category: value as InventoryItem['category'],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masks">Masks</SelectItem>
                  <SelectItem value="TVs">TVs</SelectItem>
                  <SelectItem value="Signs">Signs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
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
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit">{item ? 'Update Item' : 'Add Item'}</Button>
            <Button type="button" onClick={onCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const InventoryItemCard: React.FC<{
  item: InventoryItem;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ item, onEdit, onDelete }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between">
          <div className="flex-1">
            <div className="mb-3">
              <h3 className="text-lg font-bold text-foreground">
                {item.category}
              </h3>
            </div>
            <div className="mb-3 flex items-center gap-4 text-sm">
              <span className="font-bold text-foreground">
                QTY: {item.quantity}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onEdit}
              variant="ghost"
              size="icon"
              title="Edit item"
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              onClick={onDelete}
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              title="Delete item"
            >
              <Trash className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
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
      const updatedInventory = inventory.map((item) =>
        item.id === editingItem.id ? { ...item, ...itemData } : item
      );
      onUpdateInventory(updatedInventory);
      toast.success('Item updated successfully');
    } else {
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
    <div className="space-y-6">
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (itemToDelete) {
                  handleDeleteItem(itemToDelete);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {chapterName} Inventory
          </h2>
          <p className="text-sm tracking-wide text-muted-foreground">
            {inventory.length} item types • {totalItems} total items
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="size-4" />
          Add Item
        </Button>
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold text-foreground">
              {filter === 'All'
                ? 'No inventory items yet'
                : `No ${filter.toLowerCase()} found`}
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              {filter === 'All'
                ? 'Start building your chapter inventory by adding equipment.'
                : 'Try a different category or add new items.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChapterInventory;
