// src/components/AddToCartModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { X, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";

const API_BASE = "http://localhost:8080/api";

export interface MenuItem {
  itemId: number;
  shopId: number;
  shopName: string;
  itemName: string;
  itemDescr?: string | null;
  itemImageURL?: string | null;
  price: number;
  isAvailable: boolean;
}

interface VariantDTO {
  id: number;
  name: string;
  additionalPrice: number;
}

interface AddonDTO {
  id: number;
  name: string;
  price: number;
}

interface FlavorDTO {
  id: number;
  name: string;
}

interface MenuItemOptionsDTO {
  variants: VariantDTO[];
  addons: AddonDTO[];
  flavors: FlavorDTO[];
}

interface AddToCartModalProps {
  open: boolean;
  onClose: () => void;
  item: MenuItem | null;
}

const AddToCartModal: React.FC<AddToCartModalProps> = ({
  open,
  onClose,
  item,
}) => {
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [options, setOptions] = useState<MenuItemOptionsDTO | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedFlavorId, setSelectedFlavorId] = useState<number | null>(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState<number[]>([]);
  const [notes, setNotes] = useState("");

  // Reset whenever modal opens or item changes
  useEffect(() => {
    if (!open) return;
    setQuantity(1);
    setSelectedVariantId(null);
    setSelectedFlavorId(null);
    setSelectedAddonIds([]);
    setNotes("");
    setOptions(null);
    setOptionsError(null);
  }, [open, item?.itemId]);

  // Fetch options for this menu item
  useEffect(() => {
    if (!open || !item) return;

    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        setOptionsError(null);
        const res = await axios.get<MenuItemOptionsDTO>(
          `${API_BASE}/menu-items/${item.itemId}/options`
        );
        setOptions(res.data);
      } catch (err: any) {
        console.error(err);
        setOptionsError(
          err?.response?.data?.message ||
            "Failed to load item options. You can still order the base item."
        );
        setOptions({
          variants: [],
          addons: [],
          flavors: [],
        });
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [open, item]);

  const selectedVariant = useMemo(
    () =>
      options?.variants.find((v) => v.id === selectedVariantId) || undefined,
    [options, selectedVariantId]
  );

  const selectedFlavor = useMemo(
    () =>
      options?.flavors.find((f) => f.id === selectedFlavorId) || undefined,
    [options, selectedFlavorId]
  );

  const selectedAddons = useMemo(
    () =>
      options?.addons.filter((a) => selectedAddonIds.includes(a.id)) || [],
    [options, selectedAddonIds]
  );

  const basePrice = item?.price || 0;
  const variantExtra = selectedVariant?.additionalPrice || 0;
  const addonsTotal =
    selectedAddons.reduce((sum, a) => sum + a.price, 0) || 0;

  const lineTotal = (basePrice + variantExtra + addonsTotal) * quantity;

  const toggleAddon = (id: number) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleAddToCart = () => {
    if (!item) return;

    addItem({
      itemId: item.itemId,
      shopId: item.shopId,
      shopName: item.shopName,
      name: item.itemName,
      basePrice: basePrice,
      variant: selectedVariant
        ? {
            id: selectedVariant.id,
            name: selectedVariant.name,
            additionalPrice: selectedVariant.additionalPrice,
          }
        : undefined,
      flavor: selectedFlavor
        ? { id: selectedFlavor.id, name: selectedFlavor.name }
        : undefined,
      addons: selectedAddons.map((a) => ({
        id: a.id,
        name: a.name,
        price: a.price,
      })),
      quantity,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-150">
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h2 className="text-base font-semibold">{item.itemName}</h2>
            <p className="text-xs text-gray-500 line-clamp-1">
              Customize your order
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="max-h-[70vh] overflow-y-auto px-4 py-3 space-y-4 text-sm">
          {/* Image + base price */}
          <div className="flex gap-3">
            {item.itemImageURL && (
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={item.itemImageURL}
                  alt={item.itemName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 flex flex-col justify-between gap-1">
              <p className="text-xs text-gray-600 line-clamp-2">
                {item.itemDescr || "No description provided."}
              </p>
              <p className="text-base font-semibold">
                ₱{basePrice.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Options loading / error */}
          {loadingOptions && (
            <p className="text-xs text-gray-500">Loading options…</p>
          )}
          {optionsError && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
              {optionsError}
            </p>
          )}

          {/* Variant */}
          {options && options.variants.length > 0 && (
            <div>
              <p className="font-semibold text-xs mb-2">Choose a size / variant</p>
              <div className="flex flex-wrap gap-2">
                {options.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() =>
                      setSelectedVariantId(
                        selectedVariantId === v.id ? null : v.id
                      )
                    }
                    className={`px-3 py-1.5 rounded-full border text-xs ${
                      selectedVariantId === v.id
                        ? "border-fp-pink bg-fp-pink/10 text-fp-pink"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {v.name}{" "}
                    {v.additionalPrice > 0 &&
                      `(+₱${v.additionalPrice.toFixed(2)})`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Flavor */}
          {options && options.flavors.length > 0 && (
            <div>
              <p className="font-semibold text-xs mb-2">Flavor</p>
              <div className="flex flex-wrap gap-2">
                {options.flavors.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() =>
                      setSelectedFlavorId(
                        selectedFlavorId === f.id ? null : f.id
                      )
                    }
                    className={`px-3 py-1.5 rounded-full border text-xs ${
                      selectedFlavorId === f.id
                        ? "border-fp-pink bg-fp-pink/10 text-fp-pink"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Addons */}
          {options && options.addons.length > 0 && (
            <div>
              <p className="font-semibold text-xs mb-2">Extras</p>
              <div className="flex flex-wrap gap-2">
                {options.addons.map((a) => {
                  const active = selectedAddonIds.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleAddon(a.id)}
                      className={`px-3 py-1.5 rounded-full border text-xs ${
                        active
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {a.name} (+₱{a.price.toFixed(2)})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <p className="font-semibold text-xs mb-1">
              Notes (optional)
            </p>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-fp-pink"
              rows={2}
              placeholder="No onions, less sugar, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Quantity + total */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setQuantity((q) => (q > 1 ? q - 1 : q))
                }
                className="w-8 h-8 border rounded-full flex items-center justify-center hover:bg-gray-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center text-sm font-medium">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 border rounded-full flex items-center justify-center hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="text-right">
              <p className="text-[11px] text-gray-500">Total</p>
              <p className="text-lg font-semibold">
                ₱{lineTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="border-t px-4 py-3 flex gap-2">
          <button
            onClick={handleAddToCart}
            className="flex-1 py-2 rounded-full border border-fp-pink text-fp-pink text-sm font-semibold hover:bg-fp-pink/5"
          >
            Add to cart
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 py-2 rounded-full bg-fp-pink text-white text-sm font-semibold hover:bg-fp-pink/90"
          >
            Buy now
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;
