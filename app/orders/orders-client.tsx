"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

type Order = {
  id: string;
  order_number: number;
  due_at: string;
  status: string;
  total: number;
  payment_method: string;
  payment_status: string;
};

type OrdersData = {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
};

export function OrdersClient({
  initialData,
  initialSearch,
  initialStartDate,
  initialEndDate,
  initialStatus,
  initialPaymentMethod,
  initialPaymentStatus,
}: {
  initialData: OrdersData;
  initialSearch: string;
  initialStartDate: string;
  initialEndDate: string;
  initialStatus: string;
  initialPaymentMethod: string;
  initialPaymentStatus: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [status, setStatus] = useState(initialStatus);
  const [paymentMethod, setPaymentMethod] = useState(initialPaymentMethod);
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);

  const totalPages = Math.ceil(initialData.total / initialData.limit);

  const buildUrl = (page: number = 1) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (startDate) params.set("start", startDate);
    if (endDate) params.set("end", endDate);
    if (status) params.set("status", status);
    if (paymentMethod) params.set("payment_method", paymentMethod);
    if (paymentStatus) params.set("payment_status", paymentStatus);
    if (page > 1) params.set("page", page.toString());
    return `/orders?${params.toString()}`;
  };

  const handleSearch = () => {
    router.push(buildUrl(1));
  };

  const handleFilter = () => {
    router.push(buildUrl(1));
  };

  const handleClear = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setStatus("");
    setPaymentMethod("");
    setPaymentStatus("");
    router.push("/orders");
  };

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

  const hasFilters =
    search || startDate || endDate || status || paymentMethod || paymentStatus;

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Order number or customer phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                <option value="">All statuses</option>
                <option value="new">New</option>
                <option value="preparing">Preparing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <select
                id="payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                <option value="">All methods</option>
                <option value="cod">COD</option>
                <option value="upi">UPI</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-status">Payment Status</Label>
              <select
                id="payment-status"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                <option value="">All statuses</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleFilter}>Apply Filters</Button>
            {hasFilters && (
              <Button variant="outline" onClick={handleClear}>
                Clear All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Orders ({initialData.total})
            </CardTitle>
            {totalPages > 1 && (
              <div className="text-sm text-muted-foreground">
                Page {initialData.page} of {totalPages}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {initialData.orders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No orders found
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {initialData.orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => router.push(`/orders/${order.id}`)}
                    className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg">
                          #{order.order_number}
                        </span>
                        <Badge
                          className={`${getStatusColor(order.status)} text-white`}
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDateTime(order.due_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
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
                        <span className="font-bold text-lg">
                          ₹{order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(buildUrl(initialData.page - 1))}
                    disabled={initialData.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Showing {((initialData.page - 1) * initialData.limit) + 1} -{" "}
                    {Math.min(initialData.page * initialData.limit, initialData.total)} of{" "}
                    {initialData.total}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(buildUrl(initialData.page + 1))}
                    disabled={initialData.page >= totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

