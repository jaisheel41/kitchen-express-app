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

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/today");
  revalidatePath("/orders");
  return { data, error: null };
}

export async function toggleOrderPayment(orderId: string) {
  const supabase = await createClient();

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

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/today");
  revalidatePath("/orders");
  return { data, error: null };
}

export async function setOrderPaymentMethod(
  orderId: string,
  paymentMethod: "cod" | "upi",
) {
  const supabase = await createClient();

  // Only update payment_method, NOT payment_status
  // Payment status should be changed separately via toggleOrderPayment
  const { data, error } = await supabase
    .from("orders")
    .update({
      payment_method: paymentMethod,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    return { error: error.message || "Failed to update payment method" };
  }

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/today");
  revalidatePath("/orders");
  return { data, error: null };
}

export async function updateOrderDueAt(orderId: string, dueAt: string) {
  const supabase = await createClient();

  const dueDate = new Date(dueAt);
  if (isNaN(dueDate.getTime())) {
    return { error: "Invalid date" };
  }

  const { data, error } = await supabase
    .from("orders")
    .update({
      due_at: dueDate.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    return { error: error.message || "Failed to update due date" };
  }

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/today");
  revalidatePath("/orders");
  return { data, error: null };
}

export async function updateOrderNotes(orderId: string, notes: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .update({
      notes: notes.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    return { error: error.message || "Failed to update notes" };
  }

  revalidatePath(`/orders/${orderId}`);
  return { data, error: null };
}

type OrderItemInput = {
  menu_item_id: string | null;
  item_name: string;
  unit_price: number;
  quantity: number;
};

export async function updateOrderItems(
  orderId: string,
  items: OrderItemInput[],
) {
  const supabase = await createClient();

  // Validation
  if (items.length === 0) {
    return { error: "Order must have at least one item" };
  }

  for (const item of items) {
    if (!item.item_name || item.item_name.trim() === "") {
      return { error: "All items must have a name" };
    }
    if (item.quantity <= 0 || !Number.isInteger(item.quantity)) {
      return { error: "All items must have a valid quantity > 0" };
    }
    if (item.unit_price < 0 || isNaN(item.unit_price)) {
      return { error: "All items must have a valid price >= 0" };
    }
  }

  // Delete existing items
  const { error: deleteError } = await supabase
    .from("order_items")
    .delete()
    .eq("order_id", orderId);

  if (deleteError) {
    return { error: `Failed to delete existing items: ${deleteError.message}` };
  }

  // Insert new items with snapshots
  const orderItems = items.map((item) => ({
    order_id: orderId,
    menu_item_id: item.menu_item_id,
    item_name_snapshot: item.item_name.trim(),
    unit_price_snapshot: item.unit_price,
    quantity: item.quantity,
    line_total: item.unit_price * item.quantity,
  }));

  const { error: insertError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (insertError) {
    return { error: `Failed to create order items: ${insertError.message}` };
  }

  // Recalculate totals
  const subtotal = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );

  // Get current delivery_fee and discount
  const { data: order } = await supabase
    .from("orders")
    .select("delivery_fee, discount")
    .eq("id", orderId)
    .single();

  if (!order) {
    return { error: "Order not found" };
  }

  const total = subtotal + (order.delivery_fee || 0) - (order.discount || 0);

  // Update order totals
  const { data, error: updateError } = await supabase
    .from("orders")
    .update({
      subtotal: subtotal,
      total: total,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (updateError) {
    return { error: `Failed to update order totals: ${updateError.message}` };
  }

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/today");
  revalidatePath("/orders");
  return { data, error: null };
}

export async function updateOrderDeliveryAndDiscount(
  orderId: string,
  deliveryFee: number,
  discount: number,
) {
  const supabase = await createClient();

  if (deliveryFee < 0 || isNaN(deliveryFee)) {
    return { error: "Delivery fee must be >= 0" };
  }

  if (discount < 0 || isNaN(discount)) {
    return { error: "Discount must be >= 0" };
  }

  // Get current subtotal
  const { data: order } = await supabase
    .from("orders")
    .select("subtotal")
    .eq("id", orderId)
    .single();

  if (!order) {
    return { error: "Order not found" };
  }

  const total = (order.subtotal || 0) + deliveryFee - discount;

  const { data, error } = await supabase
    .from("orders")
    .update({
      delivery_fee: deliveryFee,
      discount: discount,
      total: total,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    return { error: error.message || "Failed to update order" };
  }

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/today");
  revalidatePath("/orders");
  return { data, error: null };
}

