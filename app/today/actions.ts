"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient();

  const validStatuses = ["new", "preparing", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return { error: "Invalid status" };
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    return { error: error.message || "Failed to update order status" };
  }

  revalidatePath("/today");
  revalidatePath("/orders");
  return { data, error: null };
}

export async function togglePaymentStatus(orderId: string) {
  const supabase = await createClient();

  // Get current payment status
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("payment_status")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    return { error: "Order not found" };
  }

  const newStatus = order.payment_status === "paid" ? "unpaid" : "paid";

  const { data, error } = await supabase
    .from("orders")
    .update({
      payment_status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    return { error: error.message || "Failed to update payment status" };
  }

  revalidatePath("/today");
  revalidatePath("/orders");
  return { data, error: null };
}

export async function setPaymentMethod(
  orderId: string,
  paymentMethod: "cod" | "upi",
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .update({
      payment_method: paymentMethod,
      payment_status: paymentMethod === "upi" ? "paid" : "unpaid",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    return { error: error.message || "Failed to update payment method" };
  }

  revalidatePath("/today");
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  return { data, error: null };
}
