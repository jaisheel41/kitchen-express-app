"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Search } from "lucide-react";
import { findBestMatch, findTopMatches } from "@/lib/fuzzy-match";

type MenuItem = {
  id: string;
  name: string;
  price: number;
};

type ParsedItem = {
  name: string;
  quantity: number;
  matched: MenuItem | null;
  suggestions?: MenuItem[];
};

type VoiceItemsConfirmProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parsedItems: ParsedItem[];
  menuItems: MenuItem[];
  onConfirm: (items: Array<{ menu_item_id: string | null; item_name: string; unit_price: number; quantity: number }>) => void;
  onEditItem?: (itemName: string, suggestions: MenuItem[]) => void;
};

export function VoiceItemsConfirm({
  open,
  onOpenChange,
  parsedItems,
  menuItems,
  onConfirm,
  onEditItem,
}: VoiceItemsConfirmProps) {
  const [selectedItems, setSelectedItems] = useState<Map<number, MenuItem | null>>(new Map());

  // Initialize selected items with matched items when dialog opens or items change
  useEffect(() => {
    if (open && parsedItems.length > 0) {
      const initial = new Map<number, MenuItem | null>();
      parsedItems.forEach((item, index) => {
        if (item.matched) {
          initial.set(index, item.matched);
        }
      });
      setSelectedItems(initial);
    }
  }, [open, parsedItems]);

  const handleSelectSuggestion = (itemIndex: number, menuItem: MenuItem) => {
    setSelectedItems((prev) => {
      const next = new Map(prev);
      next.set(itemIndex, menuItem);
      return next;
    });
  };

  const handleConfirm = () => {
    const itemsToAdd = parsedItems
      .map((parsedItem, index) => {
        const selected = selectedItems.get(index);
        const menuItem = selected || parsedItem.matched;

        if (!menuItem) {
          return null; // Skip unmatched items without selection
        }

        return {
          menu_item_id: menuItem.id,
          item_name: menuItem.name,
          unit_price: menuItem.price,
          quantity: parsedItem.quantity,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (itemsToAdd.length > 0) {
      onConfirm(itemsToAdd);
      onOpenChange(false);
      // Reset selections
      setSelectedItems(new Map());
    }
  };

  const matchedCount = Array.from(selectedItems.values()).filter(Boolean).length;
  const unmatchedItems = parsedItems.filter((item, index) => !selectedItems.get(index));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirm Items</DialogTitle>
          <DialogDescription>
            Review the items parsed from your voice input. Select matches for unmatched items.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {parsedItems.map((parsedItem, index) => {
            const selected = selectedItems.get(index);
            const menuItem = selected || parsedItem.matched;
            const isMatched = !!menuItem;
            const suggestions = parsedItem.suggestions || [];

            return (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  isMatched
                    ? "bg-green-50 border-green-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isMatched ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                      )}
                      <span className="font-medium">{parsedItem.name}</span>
                      <Badge variant="secondary" className="ml-auto">
                        Qty: {parsedItem.quantity}
                      </Badge>
                    </div>

                    {isMatched ? (
                      <div className="text-sm text-muted-foreground ml-6">
                        Matched: {menuItem.name} - ₹{menuItem.price.toFixed(2)}
                      </div>
                    ) : (
                      <div className="text-sm text-yellow-700 ml-6 mb-2">
                        No match found
                      </div>
                    )}

                    {!isMatched && suggestions.length > 0 && (
                      <div className="mt-2 ml-6 space-y-1">
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Did you mean?
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {suggestions.map((suggestion) => (
                            <Button
                              key={suggestion.id}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleSelectSuggestion(index, suggestion)}
                              className="text-xs min-h-[36px] min-w-[80px]"
                            >
                              {suggestion.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {!isMatched && suggestions.length === 0 && onEditItem && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const topMatches = findTopMatches(parsedItem.name, menuItems, 5);
                          onEditItem(parsedItem.name, topMatches.map((m) => m.item));
                        }}
                        className="mt-2 ml-6 text-xs"
                      >
                        <Search className="h-3 w-3 mr-1" />
                        Search menu
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto min-h-[44px]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={matchedCount === 0}
            className="w-full sm:w-auto min-h-[44px]"
          >
            Add {matchedCount} {matchedCount === 1 ? "Item" : "Items"} to Cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

