"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCategory(name: string) {
  const supabase = await createClient();

  if (!name || name.trim() === "") {
    return { error: "Category name is required" };
  }

  const { data, error } = await supabase
    .from("menu_categories")
    .insert([{ name: name.trim() }])
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "A category with this name already exists" };
    }
    return { error: error.message || "Failed to create category" };
  }

  revalidatePath("/menu");
  return { data, error: null };
}

export async function createMenuItem(
  categoryId: string,
  name: string,
  price: number,
) {
  const supabase = await createClient();

  if (!name || name.trim() === "") {
    return { error: "Item name is required" };
  }

  if (price < 0 || isNaN(price)) {
    return { error: "Price must be a number greater than or equal to 0" };
  }

  const { data, error } = await supabase
    .from("menu_items")
    .insert([
      {
        category_id: categoryId,
        name: name.trim(),
        price: price,
        is_active: true,
      },
    ])
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        error: "An item with this name already exists in this category",
      };
    }
    return { error: error.message || "Failed to create menu item" };
  }

  revalidatePath("/menu");
  return { data, error: null };
}

export async function updateMenuItem(
  id: string,
  categoryId: string,
  name: string,
  price: number,
) {
  const supabase = await createClient();

  if (!name || name.trim() === "") {
    return { error: "Item name is required" };
  }

  if (price < 0 || isNaN(price)) {
    return { error: "Price must be a number greater than or equal to 0" };
  }

  const { data, error } = await supabase
    .from("menu_items")
    .update({
      category_id: categoryId,
      name: name.trim(),
      price: price,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        error: "An item with this name already exists in this category",
      };
    }
    return { error: error.message || "Failed to update menu item" };
  }

  revalidatePath("/menu");
  return { data, error: null };
}

export async function toggleMenuItemActive(id: string, isActive: boolean) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("menu_items")
    .update({ is_active: !isActive })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message || "Failed to update menu item" };
  }

  revalidatePath("/menu");
  return { data, error: null };
}

