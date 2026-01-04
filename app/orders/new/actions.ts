"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function searchCustomerByAddress(address: string) {
  const supabase = await createClient();

  if (!address || address.trim() === "") {
    return { data: null, error: null };
  }

  // Search by address (case-insensitive partial match)
  const { data, error } = await supabase
    .from("customers")
    .select("id, name, phone, address")
    .ilike("address", `%${address.trim()}%`)
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "not found" which is fine
    return { data: null, error: error.message };
  }

  return { data: data || null, error: null };
}

type OrderItemInput = {
  menu_item_id: string | null;
  item_name: string;
  unit_price: number;
  quantity: number;
};

export async function createOrder(
  orderType: "asap" | "scheduled" | "prebook",
  dueAt: string,
  customerPhone: string,
  customerName: string,
  customerAddress: string,
  notes: string,
  items: OrderItemInput[],
  deliveryFee: number,
  discount: number,
) {
  const supabase = await createClient();

  // Validation
  if (!customerAddress || customerAddress.trim() === "") {
    return { error: "Customer address is required" };
  }

  if (!customerName || customerName.trim() === "") {
    return { error: "Customer name is required" };
  }

  if (items.length === 0) {
    return { error: "At least one item is required" };
  }

  if (deliveryFee < 0 || isNaN(deliveryFee)) {
    return { error: "Delivery fee must be a number >= 0" };
  }

  if (discount < 0 || isNaN(discount)) {
    return { error: "Discount must be a number >= 0" };
  }

  // Validate items
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

  // Find or create customer by address (primary) or phone (fallback)
  let customerId: string | null = null;
  
  // First, try to find by address
  const { data: existingByAddress } = await supabase
    .from("customers")
    .select("id, phone, name")
    .ilike("address", customerAddress.trim())
    .limit(1)
    .single();

  if (existingByAddress) {
    customerId = existingByAddress.id;
    // Update phone if provided and different, and name
    const updates: { name?: string; phone?: string; updated_at: string } = {
      name: customerName.trim(),
      updated_at: new Date().toISOString(),
    };
    
    if (customerPhone.trim() && existingByAddress.phone !== customerPhone.trim()) {
      // Check if phone already exists for another customer
      const { data: phoneConflict } = await supabase
        .from("customers")
        .select("id")
        .eq("phone", customerPhone.trim())
        .neq("id", customerId)
        .single();
      
      if (!phoneConflict) {
        updates.phone = customerPhone.trim();
      }
    }
    
    await supabase
      .from("customers")
      .update(updates)
      .eq("id", customerId);
  } else if (customerPhone.trim()) {
    // If not found by address, try to find by phone
    const { data: existingByPhone } = await supabase
      .from("customers")
      .select("id, address")
      .eq("phone", customerPhone.trim())
      .single();

    if (existingByPhone) {
      customerId = existingByPhone.id;
      // Update address and name
      await supabase
        .from("customers")
        .update({
          address: customerAddress.trim(),
          name: customerName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", customerId);
    } else {
      // Create new customer
      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert([
          {
            name: customerName.trim(),
            phone: customerPhone.trim(),
            address: customerAddress.trim(),
          },
        ])
        .select("id")
        .single();

      if (customerError) {
        // If phone conflict, try without phone
        if (customerError.code === "23505" && customerError.message.includes("phone")) {
          const { data: newCustomerWithoutPhone, error: retryError } = await supabase
            .from("customers")
            .insert([
              {
                name: customerName.trim(),
                phone: null,
                address: customerAddress.trim(),
              },
            ])
            .select("id")
            .single();
          
          if (retryError) {
            return { error: `Failed to create customer: ${retryError.message}` };
          }
          customerId = newCustomerWithoutPhone.id;
        } else {
          return { error: `Failed to create customer: ${customerError.message}` };
        }
      } else {
        customerId = newCustomer.id;
      }
    }
  } else {
    // No phone provided, create new customer with address only
    const { data: newCustomer, error: customerError } = await supabase
      .from("customers")
      .insert([
        {
          name: customerName.trim(),
          phone: null,
          address: customerAddress.trim(),
        },
      ])
      .select("id")
      .single();

    if (customerError) {
      return { error: `Failed to create customer: ${customerError.message}` };
    }
    customerId = newCustomer.id;
  }

  // Calculate totals
  const subtotal = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );
  const total = subtotal + deliveryFee - discount;

  // Get next order number for today (resets daily)
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  // Find the last order created today
  const { data: lastOrderToday } = await supabase
    .from("orders")
    .select("order_number")
    .gte("created_at", todayStart.toISOString())
    .lte("created_at", todayEnd.toISOString())
    .order("order_number", { ascending: false })
    .limit(1)
    .single();

  const orderNumber = lastOrderToday?.order_number
    ? lastOrderToday.order_number + 1
    : 1;

  // Create order - payment method defaults to COD (can be changed later)
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert([
      {
        order_number: orderNumber,
        order_type: orderType,
        due_at: dueAt,
        status: "new",
        customer_id: customerId,
        customer_name_snapshot: customerName.trim(),
        customer_phone_snapshot: customerPhone.trim(),
        customer_address_snapshot: customerAddress.trim() || null,
        notes: notes.trim() || null,
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        discount: discount,
        total: total,
        payment_method: "cod", // Default to COD, can be changed later
        payment_status: "unpaid",
      },
    ])
    .select("id")
    .single();

  if (orderError) {
    return { error: `Failed to create order: ${orderError.message}` };
  }

  // Create order items with snapshots
  const orderItems = items.map((item) => ({
    order_id: order.id,
    menu_item_id: item.menu_item_id,
    item_name_snapshot: item.item_name.trim(),
    unit_price_snapshot: item.unit_price,
    quantity: item.quantity,
    line_total: item.unit_price * item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    return { error: `Failed to create order items: ${itemsError.message}` };
  }

  revalidatePath("/orders");
  revalidatePath("/today");
  redirect(`/orders/${order.id}`);
}

