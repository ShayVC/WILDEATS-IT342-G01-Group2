import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

// ============================
// BACKEND-ALIGNED TYPES
// ============================

interface ShopDTO {
  shopId: number;
  shopName: string;
  shopDescr: string;
  location: string;
  shopImageURL?: string;
  status: string;
  isOpen: boolean;
  ownerId: number;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateShopSuccess {
  shop: ShopDTO;
  message: string;
}

type CreateShopValidationError = Record<string, string>;

interface CreateShopServerError {
  message: string;
}

// ====================================
// AXIOS INSTANCE
// ====================================

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

// ====================================
// MAIN COMPONENT
// ====================================

const SellerRegisterFlow: React.FC = () => {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [understood, setUnderstood] = useState(false);

  const [form, setForm] = useState({
    shopName: "",
    shopDescr: "",
    location: "",
  });

  const [errors, setErrors] = useState<{
    shopName: string;
    location: string;
    shopDescr: string;
  }>({
    shopName: "",
    location: "",
    shopDescr: "",
  });

  const [requirements, setRequirements] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setRequirements(e.target.files[0]);
  };

  // ==========================
  // FRONTEND VALIDATION
  // ==========================

  const validateStep3 = () => {
    const newErrors = {
      shopName: form.shopName.trim() ? "" : "Shop name is required.",
      location: form.location ? "" : "Please select a location.",
      shopDescr: form.shopDescr.trim()
        ? ""
        : "Shop description is required.",
    };

    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === "");
  };

  // ==========================
  // SUBMIT FORM
  // ==========================

  const handleSubmit = async () => {
    if (!validateStep3()) {
      toast({
        title: "Missing or invalid fields",
        variant: "destructive",
        description: "Please review the highlighted fields before submitting.",
      });
      return;
    }

    if (!user || !token) {
      toast({
        title: "Not logged in",
        variant: "destructive",
        description: "Please log in to continue.",
      });
      navigate("/login");
      return;
    }

    const payload = {
      shopName: form.shopName.trim(),
      shopDescr: form.shopDescr.trim(),
      location: form.location,
    };

    setSubmitting(true);

    try {
      const response = await API.post<CreateShopSuccess>("/shops", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = response.data;
      const shopId = data.shop.shopId;

      // Upload documents (optional)
      if (requirements) {
        try {
          const formData = new FormData();
          formData.append("files", requirements);

          await API.post(`/shops/${shopId}/documents`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          });
        } catch (uploadErr) {
          const ue = uploadErr as any;
          toast({
            title: "Partial success",
            variant: "destructive",
            description:
              ue?.response?.data?.message ||
              ue?.message ||
              "Shop created, but document upload failed.",
          });

          setStep(4);
          setSubmitting(false);
          return;
        }
      }

      toast({
        title: "Application submitted",
        description: data.message,
      });

      setStep(4);
    } catch (err) {
      const error = err as any;
      const data = error?.response?.data;
      const status = error?.response?.status;

      if (status === 400 && typeof data === "object") {
        const fieldErrors: Partial<typeof errors> = {};

        (["shopName", "shopDescr", "location"] as const).forEach((field) => {
          if (data[field]) fieldErrors[field] = String(data[field]);
        });

        if (Object.keys(fieldErrors).length > 0) {
          setErrors((prev) => ({ ...prev, ...fieldErrors }));
          toast({
            title: "Please fix the highlighted fields",
            variant: "destructive",
            description: "Some fields still have issues based on server validation.",
          });

          setSubmitting(false);
          return;
        }
      }

      toast({
        title: "Submission failed",
        variant: "destructive",
        description:
          data?.message || error?.message || "Submission failed. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2 guard
  const handleRequirementsStep = () => {
    if (!requirements) {
      toast({
        title: "Missing document",
        variant: "destructive",
        description: "Please upload your ID + business proof before continuing.",
      });
      return;
    }
    setStep(3);
  };

  const progress = { 1: "25%", 2: "50%", 3: "75%", 4: "100%" }[step];

  // ====================================
  // UI
  // ====================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ... UI unchanged ... */}

      {/* STEP 3 (UPDATED) */}
      {step === 3 && (
        <>
          <h2 className="text-2xl font-bold mb-6">Shop Information</h2>

          <div className="space-y-4">
            {/* SHOP NAME */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Shop Name
              </label>
              <input
                type="text"
                placeholder="e.g., Tiger Milk Tea"
                className={`w-full border p-3 rounded mt-1 ${
                  errors.shopName ? "border-red-500 bg-red-50" : ""
                }`}
                value={form.shopName}
                onChange={(e) => {
                  setForm({ ...form, shopName: e.target.value });
                  setErrors({ ...errors, shopName: "" });
                }}
              />
              {errors.shopName && (
                <p className="text-red-500 text-xs mt-1">{errors.shopName}</p>
              )}
            </div>

            {/* LOCATION */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Canteen Location
              </label>
              <select
                className={`w-full border p-3 rounded mt-1 ${
                  errors.location ? "border-red-500 bg-red-50" : ""
                }`}
                value={form.location}
                onChange={(e) => {
                  setForm({ ...form, location: e.target.value });
                  setErrors({ ...errors, location: "" });
                }}
              >
                <option value="">Select Location</option>
                <option value="JHS Canteen">JHS Canteen</option>
                <option value="Main Canteen">Main Canteen</option>
                <option value="Preschool Canteen">Preschool Canteen</option>
                <option value="Frontgate">Frontgate</option>
                <option value="Backgate">Backgate</option>
              </select>
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">{errors.location}</p>
              )}
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Shop Description
              </label>
              <textarea
                placeholder="Describe what you serve."
                className={`w-full border p-3 rounded h-28 mt-1 ${
                  errors.shopDescr ? "border-red-500 bg-red-50" : ""
                }`}
                value={form.shopDescr}
                onChange={(e) => {
                  setForm({ ...form, shopDescr: e.target.value });
                  setErrors({ ...errors, shopDescr: "" });
                }}
              />
              {errors.shopDescr && (
                <p className="text-red-500 text-xs mt-1">{errors.shopDescr}</p>
              )}
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 border rounded-lg"
              disabled={submitting}
            >
              Back
            </button>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-6 py-3 rounded-lg text-white ${
                submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-fp-pink hover:bg-fp-pink/90"
              }`}
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SellerRegisterFlow;
