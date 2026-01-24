"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { searchCustomerByAddress, createOrder } from "./actions";
import { Search, Plus, Minus, X, Mic } from "lucide-react";
import { VoiceInput } from "@/components/voice-input";
import { VoiceItemsConfirm } from "@/components/voice-items-confirm";
import { parseItemList } from "@/lib/item-parser";
import { findBestMatch, findTopMatches } from "@/lib/fuzzy-match";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  category_id: string;
};

type Category = {
  id: string;
  name: string;
  sort_order: number | null;
};

type CartItem = {
  menu_item_id: string | null;
  item_name: string;
  unit_price: number;
  quantity: number;
  isCustom?: boolean;
};

export function OrderForm({
  menuItems,
  categories,
}: {
  menuItems: MenuItem[];
  categories: Category[];
}) {
  const router = useRouter();
  
  // Customer state
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);

  // Order timing state
  const [orderType, setOrderType] = useState<"asap" | "scheduled" | "prebook">(
    "asap",
  );
  const [asapMinutes, setAsapMinutes] = useState(30);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  // Cart state
  const [itemSearch, setItemSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCustomItem, setShowCustomItem] = useState(false);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");
  const [customItemQty, setCustomItemQty] = useState(1);

  // Payment state
  const [deliveryFee, setDeliveryFee] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [notes, setNotes] = useState("");

  // Error state
  const [error, setError] = useState("");

  // Voice input state
  const [voiceItemText, setVoiceItemText] = useState("");
  const [showVoiceConfirm, setShowVoiceConfirm] = useState(false);
  const [parsedVoiceItems, setParsedVoiceItems] = useState<
    Array<{
      name: string;
      quantity: number;
      matched: MenuItem | null;
      suggestions?: MenuItem[];
    }>
  >([]);

  // Group menu items by category
  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, MenuItem[]> = {};
    menuItems.forEach((item) => {
      if (!grouped[item.category_id]) {
        grouped[item.category_id] = [];
      }
      grouped[item.category_id].push(item);
    });
    return grouped;
  }, [menuItems]);

  // Filter menu items by search and category
  const filteredItems = useMemo(() => {
    let items = menuItems;
    
    if (selectedCategory) {
      items = items.filter((item) => item.category_id === selectedCategory);
    }
    
    if (itemSearch.trim()) {
      const query = itemSearch.toLowerCase();
      items = items.filter((item) =>
        item.name.toLowerCase().includes(query),
      );
    }
    
    return items;
  }, [menuItems, itemSearch, selectedCategory]);

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0,
    );
    const delivery = parseFloat(deliveryFee) || 0;
    const disc = parseFloat(discount) || 0;
    const total = subtotal + delivery - disc;
    return { subtotal, delivery, disc, total };
  }, [cart, deliveryFee, discount]);

  // Search customer by address
  useEffect(() => {
    const searchCustomer = async () => {
      if (customerAddress.trim().length >= 5) {
        setIsSearchingCustomer(true);
        const result = await searchCustomerByAddress(customerAddress);
        if (result.data) {
          setCustomerName(result.data.name || "");
          setCustomerPhone(result.data.phone || "");
        } else if (result.error) {
          setError(result.error);
        }
        setIsSearchingCustomer(false);
      } else {
        // Clear if address is too short
        if (customerAddress.trim().length === 0) {
          setCustomerName("");
          setCustomerPhone("");
        }
      }
    };

    const timeoutId = setTimeout(searchCustomer, 500);
    return () => clearTimeout(timeoutId);
  }, [customerAddress]);

  // Calculate due_at based on order type
  const getDueAt = (): string => {
    const now = new Date();
    if (orderType === "asap") {
      const due = new Date(now.getTime() + asapMinutes * 60000);
      return due.toISOString();
    } else if (orderType === "scheduled" || orderType === "prebook") {
      if (scheduledDate && scheduledTime) {
        const dateTime = new Date(`${scheduledDate}T${scheduledTime}`);
        return dateTime.toISOString();
      }
    }
    return now.toISOString();
  };

  const addMenuItemToCart = (item: MenuItem) => {
    const existing = cart.find(
      (cartItem) => cartItem.menu_item_id === item.id,
    );
    if (existing) {
      setCart(
        cart.map((cartItem) =>
          cartItem.menu_item_id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          menu_item_id: item.id,
          item_name: item.name,
          unit_price: item.price,
          quantity: 1,
          isCustom: false,
        },
      ]);
    }
    setItemSearch("");
  };

  const updateCartQuantity = (index: number, delta: number) => {
    setCart(
      cart.map((item, i) =>
        i === index
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  // Handle voice input for items
  const handleVoiceItems = (text: string) => {
    setVoiceItemText(text);
    const parsed = parseItemList(text);

    // Match items to menu
    const matchedItems = parsed.map((item) => {
      const matched = findBestMatch(item.name, menuItems, 0.7);
      const suggestions = matched
        ? []
        : findTopMatches(item.name, menuItems, 3).map((m) => m.item);

      return {
        name: item.name,
        quantity: item.quantity,
        matched,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
      };
    });

    setParsedVoiceItems(matchedItems);
    setShowVoiceConfirm(true);
  };

  // Handle confirmation of voice items
  const handleConfirmVoiceItems = (
    items: Array<{
      menu_item_id: string | null;
      item_name: string;
      unit_price: number;
      quantity: number;
    }>
  ) => {
    // Add items to cart
    items.forEach((item) => {
      const existing = cart.find(
        (cartItem) => cartItem.menu_item_id === item.menu_item_id,
      );
      if (existing) {
        setCart(
          cart.map((cartItem) =>
            cartItem.menu_item_id === item.menu_item_id
              ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
              : cartItem,
          ),
        );
      } else {
        setCart([
          ...cart,
          {
            menu_item_id: item.menu_item_id,
            item_name: item.item_name,
            unit_price: item.unit_price,
            quantity: item.quantity,
            isCustom: !item.menu_item_id,
          },
        ]);
      }
    });

    // Reset voice input
    setVoiceItemText("");
    setParsedVoiceItems([]);
  };

  const addCustomItem = () => {
    if (!customItemName.trim()) {
      setError("Custom item name is required");
      return;
    }
    const price = parseFloat(customItemPrice);
    if (isNaN(price) || price < 0) {
      setError("Custom item price must be >= 0");
      return;
    }
    if (customItemQty < 1) {
      setError("Quantity must be >= 1");
      return;
    }

    setCart([
      ...cart,
      {
        menu_item_id: null,
        item_name: customItemName.trim(),
        unit_price: price,
        quantity: customItemQty,
        isCustom: true,
      },
    ]);
    setCustomItemName("");
    setCustomItemPrice("");
    setCustomItemQty(1);
    setShowCustomItem(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!customerName.trim()) {
      setError("Customer name is required");
      return;
    }
    if (cart.length === 0) {
      setError("Please add at least one item");
      return;
    }
    if (orderType !== "asap" && (!scheduledDate || !scheduledTime)) {
      setError("Please select date and time for scheduled/prebook orders");
      return;
    }

    const dueAt = getDueAt();
    const items = cart.map((item) => ({
      menu_item_id: item.menu_item_id,
      item_name: item.item_name,
      unit_price: item.unit_price,
      quantity: item.quantity,
    }));

    const result = await createOrder(
      orderType,
      dueAt,
      customerPhone,
      customerName,
      customerAddress,
      notes,
      items,
      totals.delivery,
      totals.disc,
    );

    if (result.error) {
      setError(result.error);
    } else if (result.data?.id) {
      // Redirect to print page with autoprint
      router.push(`/print/order/${result.data.id}?autoprint=1&return=/today`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Section */}
      <Card>
        <CardHeader>
          <CardTitle>Customer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter delivery address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="pl-10"
                  required
                />
                {isSearchingCustomer && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                    Searching...
                  </span>
                )}
              </div>
              <VoiceInput
                onTranscript={(text) => setCustomerAddress(text)}
                onError={(err) => setError(err)}
                size="icon"
                variant="outline"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <div className="flex gap-2">
              <Input
                id="name"
                type="text"
                placeholder="Customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="flex-1"
                required
              />
              <VoiceInput
                onTranscript={(text) => setCustomerName(text)}
                onError={(err) => setError(err)}
                size="icon"
                variant="outline"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Customer phone (optional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Timing */}
      <Card>
        <CardHeader>
          <CardTitle>Order Timing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="orderType"
                value="asap"
                checked={orderType === "asap"}
                onChange={(e) => setOrderType(e.target.value as "asap")}
                className="h-5 w-5"
              />
              <span className="font-medium">ASAP</span>
            </label>
            {orderType === "asap" && (
              <div className="ml-7 flex items-center gap-2">
                <Label>In</Label>
                <Input
                  type="number"
                  min="1"
                  value={asapMinutes}
                  onChange={(e) =>
                    setAsapMinutes(parseInt(e.target.value) || 30)
                  }
                  className="w-20"
                />
                <Label>minutes</Label>
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="orderType"
                value="scheduled"
                checked={orderType === "scheduled"}
                onChange={(e) => setOrderType(e.target.value as "scheduled")}
                className="h-5 w-5"
              />
              <span className="font-medium">Scheduled</span>
            </label>
            {orderType === "scheduled" && (
              <div className="ml-7 grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="orderType"
                value="prebook"
                checked={orderType === "prebook"}
                onChange={(e) => setOrderType(e.target.value as "prebook")}
                className="h-5 w-5"
              />
              <span className="font-medium">Prebook (Bulk)</span>
            </label>
            {orderType === "prebook" && (
              <div className="ml-7 grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Items Cart */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Voice Item Entry */}
          <div className="space-y-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Quick Voice Entry
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Speak items like: "idli two, masala idli four, vada one"
            </p>
            <VoiceInput
              onTranscript={handleVoiceItems}
              onError={(err) => setError(err)}
              size="lg"
              variant="default"
              className="w-full"
            />
            {voiceItemText && (
              <div className="mt-2 p-2 bg-background rounded border text-sm text-muted-foreground">
                <span className="font-medium">Heard: </span>
                {voiceItemText}
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                type="button"
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Search Items */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Menu Items by Category */}
          {!itemSearch && selectedCategory === null ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">Select a category to view items</p>
            </div>
          ) : !itemSearch && selectedCategory !== null ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {(() => {
                const categoryItems = itemsByCategory[selectedCategory] || [];
                const category = categories.find((c) => c.id === selectedCategory);
                
                if (categoryItems.length === 0) {
                  return (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No items in this category</p>
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground">
                      {category?.name}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {categoryItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => addMenuItemToCart(item)}
                          className="w-full text-left p-3 border rounded-lg hover:bg-accent hover:border-primary transition-all flex items-center justify-between"
                        >
                          <span className="font-medium">{item.name}</span>
                          <Badge variant="secondary" className="ml-2">
                            ₹{item.price.toFixed(2)}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="border rounded-lg p-2 max-h-96 overflow-y-auto space-y-1">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addMenuItemToCart(item)}
                  className="w-full text-left p-3 hover:bg-accent rounded-lg flex items-center justify-between transition-all"
                >
                  <span className="font-medium">{item.name}</span>
                  <Badge variant="secondary">₹{item.price.toFixed(2)}</Badge>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">
              No items found
            </p>
          )}

          {/* Custom Item */}
          {showCustomItem && (
            <Card className="bg-muted">
              <CardContent className="pt-4 space-y-3">
                <div className="space-y-2">
                  <Label>Item Name</Label>
                  <Input
                    value={customItemName}
                    onChange={(e) => setCustomItemName(e.target.value)}
                    placeholder="Custom item name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={customItemPrice}
                      onChange={(e) => setCustomItemPrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={customItemQty}
                      onChange={(e) =>
                        setCustomItemQty(parseInt(e.target.value) || 1)
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={addCustomItem}
                    size="sm"
                    className="flex-1"
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCustomItem(false);
                      setCustomItemName("");
                      setCustomItemPrice("");
                      setCustomItemQty(1);
                    }}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!showCustomItem && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCustomItem(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Item
            </Button>
          )}

          {/* Cart Items */}
          {cart.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              {cart.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.item_name}</span>
                      {item.isCustom && (
                        <Badge variant="outline" className="text-xs">
                          Custom
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ₹{item.unit_price.toFixed(2)} × {item.quantity} = ₹
                      {(item.unit_price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => updateCartQuantity(index, -1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => updateCartQuantity(index, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          {cart.length > 0 && (
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <Label htmlFor="delivery-fee">Delivery Fee:</Label>
                <Input
                  id="delivery-fee"
                  type="number"
                  step="0.01"
                  min="0"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className="w-24"
                />
              </div>
              <div className="flex justify-between">
                <Label htmlFor="discount">Discount:</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-24"
                />
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>₹{totals.total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Special instructions or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex-1"
            />
            <VoiceInput
              onTranscript={(text) => setNotes(text)}
              onError={(err) => setError(err)}
              size="icon"
              variant="outline"
            />
          </div>
        </CardContent>
      </Card>

      {/* Voice Items Confirmation Dialog */}
      <VoiceItemsConfirm
        open={showVoiceConfirm}
        onOpenChange={setShowVoiceConfirm}
        parsedItems={parsedVoiceItems}
        menuItems={menuItems}
        onConfirm={handleConfirmVoiceItems}
      />

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" size="lg" className="w-full" disabled={cart.length === 0}>
        Create Order
      </Button>
    </form>
  );
}

