"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  createCategory,
  createMenuItem,
  updateMenuItem,
  toggleMenuItemActive,
} from "./actions";
import { Plus, Search, Edit } from "lucide-react";

type Category = {
  id: string;
  name: string;
  sort_order: number | null;
};

type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  price: number;
  is_active: boolean;
};

export function MenuClient({
  categories: initialCategories,
  items: initialItems,
}: {
  categories: Category[];
  items: MenuItem[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState(initialCategories);
  const [items, setItems] = useState(initialItems);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Add category dialog state
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");

  // Add item dialog state
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [newItemCategoryId, setNewItemCategoryId] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [itemError, setItemError] = useState("");

  // Edit item dialog state
  const [editItemOpen, setEditItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editItemCategoryId, setEditItemCategoryId] = useState("");
  const [editItemName, setEditItemName] = useState("");
  const [editItemPrice, setEditItemPrice] = useState("");
  const [editItemError, setEditItemError] = useState("");

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter((item) =>
      item.name.toLowerCase().includes(query),
    );
  }, [items, searchQuery]);

  // Group items by category
  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, MenuItem[]> = {};
    filteredItems.forEach((item) => {
      if (!grouped[item.category_id]) {
        grouped[item.category_id] = [];
      }
      grouped[item.category_id].push(item);
    });
    return grouped;
  }, [filteredItems]);

  const handleCreateCategory = async () => {
    setCategoryError("");
    if (!newCategoryName.trim()) {
      setCategoryError("Category name is required");
      return;
    }

    const result = await createCategory(newCategoryName);
    if (result.error) {
      setCategoryError(result.error);
    } else {
      setNewCategoryName("");
      setAddCategoryOpen(false);
      // Refresh the page to get updated data
      window.location.reload();
    }
  };

  const handleCreateItem = async () => {
    setItemError("");
    if (!newItemName.trim()) {
      setItemError("Item name is required");
      return;
    }
    if (!newItemCategoryId) {
      setItemError("Please select a category");
      return;
    }
    const price = parseFloat(newItemPrice);
    if (isNaN(price) || price < 0) {
      setItemError("Price must be a number greater than or equal to 0");
      return;
    }

    const result = await createMenuItem(
      newItemCategoryId,
      newItemName,
      price,
    );
    if (result.error) {
      setItemError(result.error);
    } else {
      setNewItemName("");
      setNewItemPrice("");
      setNewItemCategoryId("");
      setAddItemOpen(false);
      window.location.reload();
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setEditItemCategoryId(item.category_id);
    setEditItemName(item.name);
    setEditItemPrice(item.price.toString());
    setEditItemError("");
    setEditItemOpen(true);
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    setEditItemError("");
    if (!editItemName.trim()) {
      setEditItemError("Item name is required");
      return;
    }
    const price = parseFloat(editItemPrice);
    if (isNaN(price) || price < 0) {
      setEditItemError("Price must be a number greater than or equal to 0");
      return;
    }

    const result = await updateMenuItem(
      editingItem.id,
      editItemCategoryId,
      editItemName,
      price,
    );
    if (result.error) {
      setEditItemError(result.error);
    } else {
      setEditItemOpen(false);
      setEditingItem(null);
      window.location.reload();
    }
  };

  const handleToggleActive = async (item: MenuItem) => {
    await toggleMenuItemActive(item.id, item.is_active);
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Categories Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Categories</CardTitle>
            <Dialog open={addCategoryOpen} onOpenChange={setAddCategoryOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Category</DialogTitle>
                  <DialogDescription>
                    Create a new menu category
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="category-name">Category Name</Label>
                    <Input
                      id="category-name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g., Main Course"
                      autoFocus
                    />
                  </div>
                  {categoryError && (
                    <p className="text-sm text-red-500">{categoryError}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setAddCategoryOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCategory}>Add Category</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No categories yet. Add one to get started.
              </p>
            ) : (
              <>
                <Button
                  type="button"
                  variant={selectedCategoryId === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategoryId(null)}
                >
                  All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    type="button"
                    variant={selectedCategoryId === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategoryId(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search and Add Item */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Menu Item</DialogTitle>
              <DialogDescription>
                Add a new item to the menu
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="item-category">Category</Label>
                <select
                  id="item-category"
                  value={newItemCategoryId}
                  onChange={(e) => setNewItemCategoryId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-name">Item Name</Label>
                <Input
                  id="item-name"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g., Chicken Biryani"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-price">Price (₹)</Label>
                <Input
                  id="item-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              {itemError && (
                <p className="text-sm text-red-500">{itemError}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAddItemOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateItem}>Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Menu Items by Category */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>No categories yet. Add a category to start adding menu items.</p>
          </CardContent>
        </Card>
      ) : !searchQuery && selectedCategoryId === null ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-sm">Select a category to view items</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {(() => {
            // If searching, show all matching items
            if (searchQuery) {
              return filteredItems.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Search Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredItems.map((item) => {
                        const category = categories.find((c) => c.id === item.category_id);
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 border rounded-lg gap-4"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3
                                  className={`font-medium ${
                                    !item.is_active
                                      ? "text-muted-foreground line-through"
                                      : ""
                                  }`}
                                >
                                  {item.name}
                                </h3>
                                {!item.is_active && (
                                  <Badge variant="outline" className="text-xs">
                                    Inactive
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-xs">
                                  {category?.name}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                ₹{item.price.toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={item.is_active}
                                onCheckedChange={() => handleToggleActive(item)}
                                className="h-5 w-5"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditItem(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <p>No items found matching &quot;{searchQuery}&quot;</p>
                  </CardContent>
                </Card>
              );
            }

            // If category selected, show items in that category
            if (selectedCategoryId) {
              const category = categories.find((c) => c.id === selectedCategoryId);
              const categoryItems = itemsByCategory[selectedCategoryId] || [];
              
              return (
                <Card key={selectedCategoryId}>
                  <CardHeader>
                    <CardTitle className="text-xl">{category?.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {categoryItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No items in this category yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {categoryItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 border rounded-lg gap-4"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3
                                className={`font-medium ${
                                  !item.is_active
                                    ? "text-muted-foreground line-through"
                                    : ""
                                }`}
                              >
                                {item.name}
                              </h3>
                              {!item.is_active && (
                                <Badge variant="outline" className="text-xs">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              ₹{item.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={item.is_active}
                              onCheckedChange={() => handleToggleActive(item)}
                              className="h-5 w-5"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditItem(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          }

          // Show all categories if "All" is selected
          return categories.map((category) => {
            const categoryItems = itemsByCategory[category.id] || [];
            if (categoryItems.length === 0) return null;

            return (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="text-xl">{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border rounded-lg gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`font-medium ${
                                !item.is_active
                                  ? "text-muted-foreground line-through"
                                  : ""
                              }`}
                            >
                              {item.name}
                            </h3>
                            {!item.is_active && (
                              <Badge variant="outline" className="text-xs">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ₹{item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={item.is_active}
                            onCheckedChange={() => handleToggleActive(item)}
                            className="h-5 w-5"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditItem(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          });
          })()}
        </div>
      )}

      {/* Edit Item Dialog */}
      <Dialog open={editItemOpen} onOpenChange={setEditItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>Update item details</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-item-category">Category</Label>
                <select
                  id="edit-item-category"
                  value={editItemCategoryId}
                  onChange={(e) => setEditItemCategoryId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-item-name">Item Name</Label>
                <Input
                  id="edit-item-name"
                  value={editItemName}
                  onChange={(e) => setEditItemName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-item-price">Price (₹)</Label>
                <Input
                  id="edit-item-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editItemPrice}
                  onChange={(e) => setEditItemPrice(e.target.value)}
                />
              </div>
              {editItemError && (
                <p className="text-sm text-red-500">{editItemError}</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditItemOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateItem}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

