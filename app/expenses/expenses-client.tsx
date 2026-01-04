"use client";

import { useState, useMemo } from "react";
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
import { createExpense, updateExpense, deleteExpense } from "./actions";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";

type Expense = {
  id: string;
  expense_date: string;
  category: string;
  amount: number;
  payment_method: string;
  notes: string | null;
};

const COMMON_CATEGORIES = [
  "Ingredients",
  "Packaging",
  "Delivery",
  "Utilities",
  "Rent",
  "Staff",
  "Marketing",
  "Other",
];

export function ExpensesClient({ expenses: initialExpenses }: { expenses: Expense[] }) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [error, setError] = useState("");

  // Quick add form state
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi">("cash");
  const [notes, setNotes] = useState("");

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editExpenseDate, setEditExpenseDate] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editCustomCategory, setEditCustomCategory] = useState("");
  const [editShowCustomCategory, setEditShowCustomCategory] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [editPaymentMethod, setEditPaymentMethod] = useState<"cash" | "upi">("cash");
  const [editNotes, setEditNotes] = useState("");

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  // Get unique categories from expenses
  const allCategories = useMemo(() => {
    const cats = new Set(COMMON_CATEGORIES);
    expenses.forEach((exp) => cats.add(exp.category));
    return Array.from(cats).sort();
  }, [expenses]);

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    let filtered = expenses;

    if (startDate) {
      filtered = filtered.filter(
        (exp) => exp.expense_date >= startDate,
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (exp) => exp.expense_date <= endDate,
      );
    }

    if (filterCategory) {
      filtered = filtered.filter((exp) => exp.category === filterCategory);
    }

    return filtered.sort(
      (a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime(),
    );
  }, [expenses, startDate, endDate, filterCategory]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const finalCategory = showCustomCategory
      ? customCategory.trim()
      : category;

    if (!finalCategory) {
      setError("Category is required");
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    const result = await createExpense(
      expenseDate,
      finalCategory,
      amountValue,
      paymentMethod,
      notes,
    );

    if (result.error) {
      setError(result.error);
    } else {
      // Reset form
      setExpenseDate(new Date().toISOString().split("T")[0]);
      setCategory("");
      setCustomCategory("");
      setShowCustomCategory(false);
      setAmount("");
      setPaymentMethod("cash");
      setNotes("");
      setError("");
      // Reload to get updated list
      window.location.reload();
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setEditExpenseDate(expense.expense_date);
    const isCommonCategory = COMMON_CATEGORIES.includes(expense.category);
    if (isCommonCategory) {
      setEditCategory(expense.category);
      setEditShowCustomCategory(false);
      setEditCustomCategory("");
    } else {
      setEditCategory("");
      setEditShowCustomCategory(true);
      setEditCustomCategory(expense.category);
    }
    setEditAmount(expense.amount.toString());
    setEditPaymentMethod(expense.payment_method as "cash" | "upi");
    setEditNotes(expense.notes || "");
    setEditDialogOpen(true);
    setError("");
  };

  const handleUpdateExpense = async () => {
    if (!editingExpense) return;
    setError("");

    const finalCategory = editShowCustomCategory
      ? editCustomCategory.trim()
      : editCategory;

    if (!finalCategory) {
      setError("Category is required");
      return;
    }

    const amountValue = parseFloat(editAmount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    const result = await updateExpense(
      editingExpense.id,
      editExpenseDate,
      finalCategory,
      amountValue,
      editPaymentMethod,
      editNotes,
    );

    if (result.error) {
      setError(result.error);
    } else {
      setEditDialogOpen(false);
      setEditingExpense(null);
      window.location.reload();
    }
  };

  const handleDeleteClick = (expenseId: string) => {
    setDeletingExpenseId(expenseId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingExpenseId) return;

    const result = await deleteExpense(deletingExpenseId);
    if (result.error) {
      setError(result.error);
    } else {
      setDeleteDialogOpen(false);
      setDeletingExpenseId(null);
      window.location.reload();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const totalAmount = filteredExpenses.reduce(
    (sum, exp) => sum + exp.amount,
    0,
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Quick Add Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expense-date">Date *</Label>
                <Input
                  id="expense-date"
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                {!showCustomCategory ? (
                  <div className="space-y-2">
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      required
                    >
                      <option value="">Select category</option>
                      {COMMON_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCustomCategory(true)}
                    >
                      + Custom category
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      id="custom-category"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter custom category"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowCustomCategory(false);
                        setCustomCategory("");
                      }}
                    >
                      Use common category
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method *</Label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="payment-method"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as "cash" | "upi")
                      }
                      className="h-4 w-4"
                    />
                    <span>Cash</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="payment-method"
                      value="upi"
                      checked={paymentMethod === "upi"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as "cash" | "upi")
                      }
                      className="h-4 w-4"
                    />
                    <span>UPI</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
              />
            </div>
            <Button type="submit" className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="filter-category">Category</Label>
              <select
                id="filter-category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                <option value="">All categories</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {(startDate || endDate || filterCategory) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setFilterCategory("");
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Expenses ({filteredExpenses.length})
            </CardTitle>
            {filteredExpenses.length > 0 && (
              <div className="text-lg font-bold">
                Total: ₹{totalAmount.toFixed(2)}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No expenses found
            </p>
          ) : (
            <div className="space-y-3">
              {filteredExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{expense.category}</span>
                      <Badge
                        variant={
                          expense.payment_method === "cash"
                            ? "outline"
                            : "default"
                        }
                      >
                        {expense.payment_method.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(expense.expense_date)}</span>
                      {expense.notes && (
                        <>
                          <span>•</span>
                          <span className="truncate">{expense.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">
                      ₹{expense.amount.toFixed(2)}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditExpense(expense)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(expense.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={editExpenseDate}
                  onChange={(e) => setEditExpenseDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                {!editShowCustomCategory ? (
                  <div className="space-y-2">
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      required
                    >
                      <option value="">Select category</option>
                      {COMMON_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditShowCustomCategory(true)}
                    >
                      + Custom category
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      value={editCustomCategory}
                      onChange={(e) => setEditCustomCategory(e.target.value)}
                      placeholder="Enter custom category"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditShowCustomCategory(false);
                        setEditCustomCategory("");
                      }}
                    >
                      Use common category
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Amount (₹) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Method *</Label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="edit-payment-method"
                      value="cash"
                      checked={editPaymentMethod === "cash"}
                      onChange={(e) =>
                        setEditPaymentMethod(e.target.value as "cash" | "upi")
                      }
                      className="h-4 w-4"
                    />
                    <span>Cash</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="edit-payment-method"
                      value="upi"
                      checked={editPaymentMethod === "upi"}
                      onChange={(e) =>
                        setEditPaymentMethod(e.target.value as "cash" | "upi")
                      }
                      className="h-4 w-4"
                    />
                    <span>UPI</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Optional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateExpense}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this expense? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingExpenseId(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

