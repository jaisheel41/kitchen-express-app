"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createExpense(
  expenseDate: string,
  category: string,
  amount: number,
  paymentMethod: "cash" | "upi",
  notes: string,
) {
  const supabase = await createClient();

  // Validation
  if (!category || category.trim() === "") {
    return { error: "Category is required" };
  }

  if (amount <= 0 || isNaN(amount)) {
    return { error: "Amount must be greater than 0" };
  }

  const date = new Date(expenseDate);
  if (isNaN(date.getTime())) {
    return { error: "Invalid date" };
  }

  const { data, error } = await supabase
    .from("expenses")
    .insert([
      {
        expense_date: expenseDate,
        category: category.trim(),
        amount: amount,
        payment_method: paymentMethod,
        notes: notes.trim() || null,
      },
    ])
    .select()
    .single();

  if (error) {
    return { error: error.message || "Failed to create expense" };
  }

  revalidatePath("/expenses");
  return { data, error: null };
}

export async function updateExpense(
  id: string,
  expenseDate: string,
  category: string,
  amount: number,
  paymentMethod: "cash" | "upi",
  notes: string,
) {
  const supabase = await createClient();

  // Validation
  if (!category || category.trim() === "") {
    return { error: "Category is required" };
  }

  if (amount <= 0 || isNaN(amount)) {
    return { error: "Amount must be greater than 0" };
  }

  const date = new Date(expenseDate);
  if (isNaN(date.getTime())) {
    return { error: "Invalid date" };
  }

  const { data, error } = await supabase
    .from("expenses")
    .update({
      expense_date: expenseDate,
      category: category.trim(),
      amount: amount,
      payment_method: paymentMethod,
      notes: notes.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message || "Failed to update expense" };
  }

  revalidatePath("/expenses");
  return { data, error: null };
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("expenses").delete().eq("id", id);

  if (error) {
    return { error: error.message || "Failed to delete expense" };
  }

  revalidatePath("/expenses");
  return { error: null };
}

