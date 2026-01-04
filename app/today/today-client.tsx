"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronRight, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { updateOrderStatus, togglePaymentStatus, setPaymentMethod } from "./actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type OrderItem = {
  item_name_snapshot: string;
  quantity: number;
};

type Order = {
  id: string;
  order_number: number;
  order_type: string;
  due_at: string;
  status: string;
  customer_name_snapshot: string;
  customer_phone_snapshot: string;
  total: number;
  payment_method: string;
  payment_status: string;
  items: OrderItem[];
};

type OrderGroup = {
  title: string;
  icon: React.ReactNode;
  orders: Order[];
};

export function TodayClient({ orders: initialOrders }: { orders: Order[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState(initialOrders);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Filter orders by search
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const query = searchQuery.toLowerCase();
    return orders.filter(
      (order) =>
        order.order_number.toString().includes(query) ||
        order.customer_phone_snapshot.includes(query),
    );
  }, [orders, searchQuery]);

  // Group orders into 2 sections: Active and Completed
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [showCompleted, setShowCompleted] = useState(false);

  const groups: OrderGroup[] = useMemo(() => {
    const active: Order[] = [];
    const completed: Order[] = [];

    filteredOrders.forEach((order) => {
      const dueAt = new Date(order.due_at);
      const isToday =
        dueAt >= todayStart && dueAt <= todayEnd;
      const isCompleted = order.status === "completed";
      const isCancelled = order.status === "cancelled";

      // Active orders: not completed, not cancelled, OR completed but unpaid
      if (!isCompleted && !isCancelled) {
        active.push(order);
      } else if (isCompleted && order.payment_status !== "paid") {
        // Completed but unpaid - keep in active
        active.push(order);
      }
      // Completed orders: status is completed AND payment is paid
      else if (isCompleted && isToday && order.payment_status === "paid") {
        completed.push(order);
      }
    });

    return [
      {
        title: "Active Orders",
        icon: <Clock className="h-5 w-5 text-primary" />,
        orders: active.sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime()),
      },
      {
        title: "Completed Today",
        icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
        orders: completed.sort((a, b) => new Date(b.due_at).getTime() - new Date(a.due_at).getTime()),
      },
    ];
  }, [filteredOrders, todayStart, todayEnd]);

  const handleStatusUpdate = async (orderId: string, currentStatus: string) => {
    const statusFlow = ["new", "preparing", "completed"];
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex < statusFlow.length - 1) {
      const newStatus = statusFlow[currentIndex + 1];
      const result = await updateOrderStatus(orderId, newStatus);
      if (!result.error) {
        setOrders(
          orders.map((o) =>
            o.id === orderId ? { ...o, status: newStatus } : o,
          ),
        );
      }
    }
  };

  const handleStatusBack = async (orderId: string, currentStatus: string) => {
    const statusFlow = ["new", "preparing", "completed"];
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex > 0) {
      const newStatus = statusFlow[currentIndex - 1];
      const result = await updateOrderStatus(orderId, newStatus);
      if (!result.error) {
        setOrders(
          orders.map((o) =>
            o.id === orderId ? { ...o, status: newStatus } : o,
          ),
        );
      }
    }
  };

  const handlePaymentDone = async (orderId: string, currentPaymentMethod: string | null) => {
    // If payment method is already set, just toggle payment status
    if (currentPaymentMethod) {
      const result = await togglePaymentStatus(orderId);
      if (!result.error) {
        setOrders(
          orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  payment_status: o.payment_status === "paid" ? "unpaid" : "paid",
                }
              : o,
          ),
        );
      }
    } else {
      // If no payment method set, open dialog to select one
      setSelectedOrderId(orderId);
      setPaymentDialogOpen(true);
    }
  };

  const handleSetPaymentMethod = async (paymentMethod: "cod" | "upi") => {
    if (!selectedOrderId) return;
    
    const result = await setPaymentMethod(selectedOrderId, paymentMethod);
    if (!result.error) {
      setOrders(
        orders.map((o) =>
          o.id === selectedOrderId
            ? {
                ...o,
                payment_method: paymentMethod,
                payment_status: paymentMethod === "upi" ? "paid" : "unpaid",
              }
            : o,
        ),
      );
      setPaymentDialogOpen(false);
      setSelectedOrderId(null);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
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

  return (
    <div className="space-y-6 relative z-10">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          placeholder="Search by order number or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 shadow-md border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Active Orders */}
      {groups[0] && groups[0].orders.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {groups[0].icon}
            <h2 className="text-xl font-semibold">{groups[0].title}</h2>
            <Badge variant="secondary">{groups[0].orders.length}</Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {groups[0].orders.map((order) => {
                const itemsPreview = order.items
                  .slice(0, 2)
                  .map((item) => `${item.quantity}x ${item.item_name_snapshot}`)
                  .join(", ");
                const moreItems = order.items.length > 2
                  ? ` +${order.items.length - 2} more`
                  : "";

                return (
                  <Card
                    key={order.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/orders/${order.id}`)}
                  >
                    <CardContent className="p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">
                              #{order.order_number}
                            </span>
                            <Badge
                              className={`${getStatusColor(order.status)} text-white`}
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {formatTime(order.due_at)} • {formatDate(order.due_at)}
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>

                      {/* Customer */}
                      <div>
                        <div className="font-medium">
                          {order.customer_name_snapshot}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.customer_phone_snapshot}
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="text-sm text-muted-foreground">
                        {itemsPreview}
                        {moreItems && (
                          <span className="text-xs">{moreItems}</span>
                        )}
                      </div>

                      {/* Payment Badges */}
                      {order.payment_method && (
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant={
                              order.payment_method === "cod"
                                ? "outline"
                                : "default"
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
                        </div>
                      )}

                      {/* Total */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="font-bold text-lg">
                          ₹{order.total.toFixed(2)}
                        </span>
                      </div>

                      {/* Quick Actions */}
                      <div
                        className="flex gap-2 pt-2 border-t"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {order.status !== "completed" &&
                          order.status !== "cancelled" && (
                            <>
                              {order.status !== "new" && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleStatusBack(order.id, order.status)
                                  }
                                  className="flex-1"
                                >
                                  ← Back
                                </Button>
                              )}
                              <Button
                                type="button"
                                size="sm"
                                onClick={() =>
                                  handleStatusUpdate(order.id, order.status)
                                }
                                className="flex-1"
                              >
                                {order.status === "new" && "Start Preparing"}
                                {order.status === "preparing" && "Complete"}
                              </Button>
                            </>
                          )}
                        {/* Payment button - only show if not paid */}
                        {order.payment_status !== "paid" && order.status !== "cancelled" && (
                          <Button
                            type="button"
                            variant={order.payment_method ? "outline" : "default"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePaymentDone(order.id, order.payment_method);
                            }}
                            className={order.payment_method ? "flex-1" : "flex-1 bg-green-600 hover:bg-green-700"}
                          >
                            {order.payment_method ? "Mark Paid" : "Payment Done"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
            })}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-lg">No current orders</p>
            <p className="text-sm mt-2">All orders are completed or cancelled</p>
          </CardContent>
        </Card>
      )}

      {/* Completed Orders - Collapsible */}
      {groups[1] && groups[1].orders.length > 0 && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full flex items-center justify-between gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {groups[1].icon}
              <h2 className="text-xl font-semibold">{groups[1].title}</h2>
              <Badge variant="secondary">{groups[1].orders.length}</Badge>
            </div>
            {showCompleted ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {showCompleted && (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {groups[1].orders.map((order) => {
                const itemsPreview = order.items
                  .slice(0, 2)
                  .map((item) => `${item.quantity}x ${item.item_name_snapshot}`)
                  .join(", ");
                const moreItems = order.items.length > 2
                  ? ` +${order.items.length - 2} more`
                  : "";

                return (
                  <Card
                    key={order.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/orders/${order.id}`)}
                  >
                    <CardContent className="p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">
                              #{order.order_number}
                            </span>
                            <Badge
                              className={`${getStatusColor(order.status)} text-white`}
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {formatTime(order.due_at)} • {formatDate(order.due_at)}
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>

                      {/* Customer */}
                      <div>
                        <div className="font-medium">
                          {order.customer_name_snapshot}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.customer_phone_snapshot}
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="text-sm text-muted-foreground">
                        {itemsPreview}
                        {moreItems && (
                          <span className="text-xs">{moreItems}</span>
                        )}
                      </div>

                      {/* Payment Badges */}
                      {order.payment_method && (
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant={
                              order.payment_method === "cod"
                                ? "outline"
                                : "default"
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
                        </div>
                      )}

                      {/* Total */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="font-bold text-lg">
                          ₹{order.total.toFixed(2)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>
              {searchQuery
                ? "No orders found matching your search"
                : "No orders for today"}
            </p>
          </CardContent>
        </Card>
      )}

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

