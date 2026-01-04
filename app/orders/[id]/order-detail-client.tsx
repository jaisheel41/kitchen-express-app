"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  updateOrderStatus,
  toggleOrderPayment,
  setOrderPaymentMethod,
  updateOrderDueAt,
  updateOrderNotes,
  updateOrderItems,
  updateOrderDeliveryAndDiscount,
} from "./actions";
import { Edit, Plus, Minus, X } from "lucide-react";

type OrderItem = {
  id: string;
  menu_item_id: string | null;
  item_name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  line_total: number;
};

type Order = {
  id: string;
  order_number: number;
  order_type: string;
  due_at: string;
  status: string;
  customer_id: string | null;
  customer_name_snapshot: string;
  customer_phone_snapshot: string;
  customer_address_snapshot: string | null;
  notes: string | null;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: string | null;
  payment_status: string;
  items: OrderItem[];
};

type MenuItem = {
  id: string;
  name: string;
  price: number;
};

export function OrderDetailClient({
  order: initialOrder,
  menuItems,
}: {
  order: Order;
  menuItems: MenuItem[];
}) {
  const [order, setOrder] = useState(initialOrder);
  const [error, setError] = useState("");

  // Dialog states
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [dueAtDialogOpen, setDueAtDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false);
  const [deliveryDiscountDialogOpen, setDeliveryDiscountDialogOpen] =
    useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  // Edit states
  const [newStatus, setNewStatus] = useState(order.status);
  const [newDueAt, setNewDueAt] = useState(
    new Date(order.due_at).toISOString().slice(0, 16),
  );
  const [newNotes, setNewNotes] = useState(order.notes || "");
  const [editingItems, setEditingItems] = useState(order.items);
  const [newDeliveryFee, setNewDeliveryFee] = useState(
    order.delivery_fee.toString(),
  );
  const [newDiscount, setNewDiscount] = useState(order.discount.toString());

  // Items management
  const [itemSearch, setItemSearch] = useState("");
  const [showCustomItem, setShowCustomItem] = useState(false);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");
  const [customItemQty, setCustomItemQty] = useState(1);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500";
      case "preparing":
        return "bg-yellow-500";
      case "completed":
        return "bg-gray-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleStatusUpdate = async () => {
    setError("");
    const result = await updateOrderStatus(order.id, newStatus);
    if (result.error) {
      setError(result.error);
    } else {
      setOrder({ ...order, status: newStatus });
      setStatusDialogOpen(false);
      window.location.reload();
    }
  };

  const handlePaymentToggle = async () => {
    setError("");
    const result = await toggleOrderPayment(order.id);
    if (result.error) {
      setError(result.error);
    } else {
      setOrder({
        ...order,
        payment_status:
          order.payment_status === "paid" ? "unpaid" : "paid",
      });
      window.location.reload();
    }
  };

  const handlePaymentMethodToggle = async () => {
    setError("");
    // Only allow toggle if payment_method is set
    if (!order.payment_method) {
      setError("Please set payment method first");
      return;
    }
    // Toggle between COD and UPI - DO NOT change payment status
    const newMethod = order.payment_method === "cod" ? "upi" : "cod";
    const result = await setOrderPaymentMethod(order.id, newMethod);
    if (result.error) {
      setError(result.error);
    } else {
      setOrder({
        ...order,
        payment_method: newMethod,
        // Keep payment_status unchanged
      });
      window.location.reload();
    }
  };

  const handleSetPaymentMethod = async (paymentMethod: "cod" | "upi") => {
    setError("");
    const result = await setOrderPaymentMethod(order.id, paymentMethod);
    if (result.error) {
      setError(result.error);
    } else {
      setOrder({
        ...order,
        payment_method: paymentMethod,
        payment_status: paymentMethod === "upi" ? "paid" : "unpaid",
      });
      setPaymentDialogOpen(false);
      window.location.reload();
    }
  };

  const handleDueAtUpdate = async () => {
    setError("");
    const result = await updateOrderDueAt(order.id, newDueAt);
    if (result.error) {
      setError(result.error);
    } else {
      setOrder({ ...order, due_at: newDueAt });
      setDueAtDialogOpen(false);
      window.location.reload();
    }
  };

  const handleNotesUpdate = async () => {
    setError("");
    const result = await updateOrderNotes(order.id, newNotes);
    if (result.error) {
      setError(result.error);
    } else {
      setOrder({ ...order, notes: newNotes });
      setNotesDialogOpen(false);
    }
  };

  const handleItemsUpdate = async () => {
    setError("");
    if (editingItems.length === 0) {
      setError("Order must have at least one item");
      return;
    }

    const items = editingItems.map((item) => ({
      menu_item_id: item.menu_item_id,
      item_name: item.item_name_snapshot,
      unit_price: item.unit_price_snapshot,
      quantity: item.quantity,
    }));

    const result = await updateOrderItems(order.id, items);
    if (result.error) {
      setError(result.error);
    } else {
      window.location.reload();
    }
  };

  const handleDeliveryDiscountUpdate = async () => {
    setError("");
    const delivery = parseFloat(newDeliveryFee) || 0;
    const discount = parseFloat(newDiscount) || 0;

    if (delivery < 0) {
      setError("Delivery fee must be >= 0");
      return;
    }
    if (discount < 0) {
      setError("Discount must be >= 0");
      return;
    }

    const result = await updateOrderDeliveryAndDiscount(
      order.id,
      delivery,
      discount,
    );
    if (result.error) {
      setError(result.error);
    } else {
      window.location.reload();
    }
  };

  const addMenuItemToEdit = (item: MenuItem) => {
    const existing = editingItems.find(
      (editItem) => editItem.menu_item_id === item.id,
    );
    if (existing) {
      setEditingItems(
        editingItems.map((editItem) =>
          editItem.menu_item_id === item.id
            ? { ...editItem, quantity: editItem.quantity + 1 }
            : editItem,
        ),
      );
    } else {
      setEditingItems([
        ...editingItems,
        {
          id: `temp-${Date.now()}`,
          menu_item_id: item.id,
          item_name_snapshot: item.name,
          unit_price_snapshot: item.price,
          quantity: 1,
          line_total: item.price,
        },
      ]);
    }
    setItemSearch("");
  };

  const updateItemQuantity = (index: number, delta: number) => {
    setEditingItems(
      editingItems.map((item, i) =>
        i === index
          ? {
              ...item,
              quantity: Math.max(1, item.quantity + delta),
              line_total:
                item.unit_price_snapshot * Math.max(1, item.quantity + delta),
            }
          : item,
      ),
    );
  };

  const removeItem = (index: number) => {
    setEditingItems(editingItems.filter((_, i) => i !== index));
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

    setEditingItems([
      ...editingItems,
      {
        id: `temp-custom-${Date.now()}`,
        menu_item_id: null,
        item_name_snapshot: customItemName.trim(),
        unit_price_snapshot: price,
        quantity: customItemQty,
        line_total: price * customItemQty,
      },
    ]);
    setCustomItemName("");
    setCustomItemPrice("");
    setCustomItemQty(1);
    setShowCustomItem(false);
    setError("");
  };

  const filteredMenuItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(itemSearch.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Order #{order.order_number}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`${getStatusColor(order.status)} text-white`}>
                  {order.status}
                </Badge>
                <Badge variant="outline">{order.order_type}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Change Status
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Order Status</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      >
                        <option value="new">New</option>
                        <option value="preparing">Preparing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setStatusDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleStatusUpdate}>Update</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Due At</Label>
              <p className="font-medium">{formatDateTime(order.due_at)}</p>
              <Dialog open={dueAtDialogOpen} onOpenChange={setDueAtDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="mt-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Reschedule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reschedule Order</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={newDueAt}
                        onChange={(e) => setNewDueAt(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDueAtDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleDueAtUpdate}>Update</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div>
              <Label className="text-muted-foreground">Payment</Label>
              <div className="flex items-center gap-2 mt-1">
                {order.payment_method ? (
                  <>
                    <Badge
                      variant={
                        order.payment_method === "cod" ? "outline" : "default"
                      }
                    >
                      {order.payment_method.toUpperCase()}
                    </Badge>
                    <Badge
                      variant={
                        order.payment_status === "paid"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {order.payment_status === "paid" ? "Paid" : "Unpaid"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePaymentMethodToggle}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Change to {order.payment_method === "cod" ? "UPI" : "COD"}
                    </Button>
                    {order.payment_status === "unpaid" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePaymentToggle}
                      >
                        Mark Paid
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setPaymentDialogOpen(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Set Payment
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer */}
      <Card>
        <CardHeader>
          <CardTitle>Customer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <Label className="text-muted-foreground">Name</Label>
            <p className="font-medium">{order.customer_name_snapshot}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Phone</Label>
            <p className="font-medium">{order.customer_phone_snapshot}</p>
          </div>
          {order.customer_address_snapshot && (
            <div>
              <Label className="text-muted-foreground">Address</Label>
              <p className="font-medium">{order.customer_address_snapshot}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Notes</CardTitle>
            <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Notes</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Input
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      placeholder="Special instructions..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setNotesDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleNotesUpdate}>Update</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {order.notes || "No notes"}
          </p>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Items</CardTitle>
            <Dialog open={itemsDialogOpen} onOpenChange={setItemsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Items
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Order Items</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* Search and Add */}
                  <div className="space-y-2">
                    <Input
                      placeholder="Search menu items..."
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                    />
                    {itemSearch && filteredMenuItems.length > 0 && (
                      <div className="border rounded-lg p-2 max-h-32 overflow-y-auto space-y-1">
                        {filteredMenuItems.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => addMenuItemToEdit(item)}
                            className="w-full text-left p-2 hover:bg-accent rounded flex items-center justify-between"
                          >
                            <span>{item.name}</span>
                            <Badge variant="secondary">₹{item.price.toFixed(2)}</Badge>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {showCustomItem ? (
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
                  ) : (
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

                  {/* Editing Items List */}
                  <div className="space-y-2 border-t pt-4">
                    {editingItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {item.item_name_snapshot}
                            </span>
                            {!item.menu_item_id && (
                              <Badge variant="outline" className="text-xs">
                                Custom
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ₹{item.unit_price_snapshot.toFixed(2)} ×{" "}
                            {item.quantity} = ₹{item.line_total.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => updateItemQuantity(index, -1)}
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
                            onClick={() => updateItemQuantity(index, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setItemsDialogOpen(false);
                      setEditingItems(order.items);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleItemsUpdate}>Update Items</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {item.item_name_snapshot}
                    </span>
                    {!item.menu_item_id && (
                      <Badge variant="outline" className="text-xs">
                        Custom
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} × ₹{item.unit_price_snapshot.toFixed(2)}
                  </p>
                  <p className="font-medium">
                    ₹{item.line_total.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Totals</CardTitle>
            <Dialog
              open={deliveryDiscountDialogOpen}
              onOpenChange={setDeliveryDiscountDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Delivery & Discount</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Delivery Fee (₹)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newDeliveryFee}
                      onChange={(e) => setNewDeliveryFee(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount (₹)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newDiscount}
                      onChange={(e) => setNewDiscount(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDeliveryDiscountDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleDeliveryDiscountUpdate}>Update</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-medium">₹{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee:</span>
            <span className="font-medium">₹{order.delivery_fee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount:</span>
            <span className="font-medium">₹{order.discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span>₹{order.total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Payment Method</DialogTitle>
            <DialogDescription>
              Choose how the customer paid for this order.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button
              type="button"
              size="lg"
              onClick={() => handleSetPaymentMethod("cod")}
              className="w-full"
            >
              Cash on Delivery (COD)
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() => handleSetPaymentMethod("upi")}
              className="w-full"
            >
              UPI Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

