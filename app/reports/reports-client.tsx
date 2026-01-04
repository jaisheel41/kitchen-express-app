"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

type SalesByDay = {
  date: string;
  total: number;
  count: number;
};

type ExpensesByCategory = {
  category: string;
  total: number;
};

type ReportData = {
  salesTotal: number;
  ordersCount: number;
  avgOrderValue: number;
  codTotal: number;
  upiTotal: number;
  expensesTotal: number;
  profitEstimate: number;
  salesByDay: SalesByDay[];
  expensesByCategory: ExpensesByCategory[];
};

export function ReportsClient({
  initialData,
  startDate: initialStartDate,
  endDate: initialEndDate,
}: {
  initialData: ReportData;
  startDate: string;
  endDate: string;
}) {
  // Detect current date range
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthStartStr = monthStart.toISOString().split("T")[0];

  let detectedRange: "today" | "7days" | "month" | "custom" = "custom";
  if (initialStartDate === todayStr && initialEndDate === todayStr) {
    detectedRange = "today";
  } else if (initialStartDate === sevenDaysAgoStr && initialEndDate === todayStr) {
    detectedRange = "7days";
  } else if (initialStartDate === monthStartStr && initialEndDate === todayStr) {
    detectedRange = "month";
  }

  const [dateRange, setDateRange] = useState<"today" | "7days" | "month" | "custom">(
    detectedRange,
  );
  const [customStartDate, setCustomStartDate] = useState(initialStartDate);
  const [customEndDate, setCustomEndDate] = useState(initialEndDate);

  const handleDateRangeChange = (range: "today" | "7days" | "month" | "custom") => {
    setDateRange(range);
    if (range !== "custom") {
      // Reload page with new date range
      const now = new Date();
      let start: Date;
      let end: Date = new Date(now);

      if (range === "today") {
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
      } else if (range === "7days") {
        start = new Date(now);
        start.setDate(start.getDate() - 6);
        start.setHours(0, 0, 0, 0);
      } else if (range === "month") {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      } else {
        return;
      }

      end.setHours(23, 59, 59, 999);
      window.location.href = `/reports?start=${start.toISOString().split("T")[0]}&end=${end.toISOString().split("T")[0]}`;
    }
  };

  const handleCustomDateSubmit = () => {
    if (customStartDate && customEndDate) {
      window.location.href = `/reports?start=${customStartDate}&end=${customEndDate}`;
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={dateRange === "today" ? "default" : "outline"}
              size="sm"
              onClick={() => handleDateRangeChange("today")}
            >
              Today
            </Button>
            <Button
              variant={dateRange === "7days" ? "default" : "outline"}
              size="sm"
              onClick={() => handleDateRangeChange("7days")}
            >
              Last 7 Days
            </Button>
            <Button
              variant={dateRange === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => handleDateRangeChange("month")}
            >
              This Month
            </Button>
            <Button
              variant={dateRange === "custom" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange("custom")}
            >
              Custom
            </Button>
          </div>
          {dateRange === "custom" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
              <Button onClick={handleCustomDateSubmit}>Apply</Button>
            </div>
          )}
          <div className="mt-4 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 inline mr-1" />
            {formatDate(initialStartDate)} - {formatDate(initialEndDate)}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sales Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(initialData.salesTotal)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {initialData.ordersCount} completed orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(initialData.avgOrderValue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expenses Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(initialData.expensesTotal)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Profit Estimate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                initialData.profitEstimate >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(initialData.profitEstimate)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">COD</Badge>
                <span className="text-sm text-muted-foreground">Cash on Delivery</span>
              </div>
              <span className="font-bold">{formatCurrency(initialData.codTotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge>UPI</Badge>
                <span className="text-sm text-muted-foreground">UPI Payment</span>
              </div>
              <span className="font-bold">{formatCurrency(initialData.upiTotal)}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total</span>
                <span className="font-bold text-lg">
                  {formatCurrency(initialData.codTotal + initialData.upiTotal)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Orders Completed:</span>
              <span className="font-medium">{initialData.ordersCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sales:</span>
              <span className="font-medium">{formatCurrency(initialData.salesTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expenses:</span>
              <span className="font-medium">{formatCurrency(initialData.expensesTotal)}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between">
                <span className="font-medium">Profit:</span>
                <span
                  className={`font-bold ${
                    initialData.profitEstimate >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(initialData.profitEstimate)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales by Day */}
      <Card>
        <CardHeader>
          <CardTitle>Sales by Day</CardTitle>
        </CardHeader>
        <CardContent>
          {initialData.salesByDay.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No sales data for this period
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Date</th>
                    <th className="text-right p-2 font-medium">Orders</th>
                    <th className="text-right p-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {initialData.salesByDay.map((day) => (
                    <tr key={day.date} className="border-b">
                      <td className="p-2">{formatDate(day.date)}</td>
                      <td className="p-2 text-right">{day.count}</td>
                      <td className="p-2 text-right font-medium">
                        {formatCurrency(day.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t font-bold">
                    <td className="p-2">Total</td>
                    <td className="p-2 text-right">{initialData.ordersCount}</td>
                    <td className="p-2 text-right">{formatCurrency(initialData.salesTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expenses by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {initialData.expensesByCategory.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No expenses for this period
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Category</th>
                    <th className="text-right p-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {initialData.expensesByCategory.map((cat) => (
                    <tr key={cat.category} className="border-b">
                      <td className="p-2">{cat.category}</td>
                      <td className="p-2 text-right font-medium">
                        {formatCurrency(cat.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t font-bold">
                    <td className="p-2">Total</td>
                    <td className="p-2 text-right">
                      {formatCurrency(initialData.expensesTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

