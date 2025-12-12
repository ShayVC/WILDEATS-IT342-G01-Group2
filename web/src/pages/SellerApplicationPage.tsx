import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

const SHOP_LOCATIONS = [
  "JHS Canteen",
  "Main Canteen",
  "Preschool Canteen",
  "Frontgate",
  "Backgate",
];

interface ShopDTO {
  shopId: number;
  shopName: string;
  shopDescr: string;
  shopAddress: string;
  location: string;
  contactNumber: string;
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

const SellerApplicationPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [understood, setUnderstood] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    shopName: "",
    shopAddress: "",
    location: "",
    contactNumber: "",
    shopDescr: "",
  });

  const [errors, setErrors] = useState<{
    shopName: string;
    shopAddress: string;
    location: string;
    contactNumber: string;
    shopDescr: string;
  }>({
    shopName: "",
    shopAddress: "",
    location: "",
    contactNumber: "",
    shopDescr: "",
  });

  const [requirements, setRequirements] = useState<File | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setRequirements(e.target.files[0]);
    }
  };

  const validateForm = () => {
    const newErrors = {
      shopName: "",
      shopAddress: "",
      location: "",
      contactNumber: "",
      shopDescr: "",
    };

    if (!form.shopName.trim()) {
      newErrors.shopName = "Shop name is required";
    } else if (form.shopName.trim().length > 100) {
      newErrors.shopName = "Shop name must not exceed 100 characters";
    }

    if (!form.shopAddress.trim()) {
      newErrors.shopAddress = "Shop address is required";
    } else if (form.shopAddress.trim().length > 200) {
      newErrors.shopAddress = "Shop address must not exceed 200 characters";
    }

    if (!form.location) {
      newErrors.location = "Location is required";
    }

    if (!form.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    } else {
      const phoneRegex = /^(09|\+639)\d{9}$/;
      if (!phoneRegex.test(form.contactNumber.trim())) {
        newErrors.contactNumber =
          "Contact number must be a valid mobile number (e.g., 09171234567 or +639171234567)";
      }
    }

    if (!form.shopDescr.trim()) {
      newErrors.shopDescr = "Shop description is required";
    } else if (form.shopDescr.trim().length > 500) {
      newErrors.shopDescr = "Shop description must not exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === "");
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
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
      shopAddress: form.shopAddress.trim(),
      location: form.location,
      contactNumber: form.contactNumber.trim(),
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

        (["shopName", "shopDescr", "shopAddress", "location", "contactNumber"] as const).forEach(
          (field) => {
            if (data[field]) fieldErrors[field] = String(data[field]);
          }
        );

        if (Object.keys(fieldErrors).length > 0) {
          setErrors((prev) => ({ ...prev, ...fieldErrors }));
          toast({
            title: "Please fix the highlighted fields",
            variant: "destructive",
            description:
              "Some fields still have issues based on server validation.",
          });

          setSubmitting(false);
          return;
        }
      }

      toast({
        title: "Submission failed",
        variant: "destructive",
        description:
          data?.message ||
          error?.message ||
          "Submission failed. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ──────────────────────
        Progress Bar
  ────────────────────── */
  const progressPercent = {
    1: "25%",
    2: "50%",
    3: "75%",
    4: "100%",
  }[step];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* PROGRESS BAR */}
      <div className="w-full bg-white shadow-sm py-4 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-fp-pink hover:text-pink-700 transition absolute left-8 top-1/2 -translate-y-1/2"
          >
            ← Back
          </button>
          <div className="text-sm font-medium mb-2 text-gray-600">
            Step {step} of 4
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-fp-pink transition-all duration-500"
              style={{ width: progressPercent }}
            ></div>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 py-12 px-6">
        {/* LEFT SIDE – Marketing / Branding */}
        <div className="space-y-8 px-4">
          <h1 className="text-4xl font-bold text-fp-pink">
            Join Our Partner Merchant Community
          </h1>

          <p className="text-gray-600 leading-relaxed">
            Get access to thousands of hungry customers and grow your business
            with our delivery platform. Whether you're a home-based seller or a
            full-scale restaurant, we'll help you expand your reach and boost
            sales.
          </p>

          <div>
            <h2 className="text-xl font-semibold mb-3">
              Why Businesses Trust Us
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li>✓ Fast merchant approval</li>
              <li>✓ Easy-to-use Seller Dashboard</li>
              <li>✓ Weekly payouts and transparent reporting</li>
              <li>✓ Zero signup cost – start selling immediately</li>
              <li>✓ Customer support for partners</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Platform Guidelines</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              To maintain quality standards, we verify all merchants. We require
              accurate business information, proper licenses, and adherence to
              food safety guidelines to protect customers and merchants alike.
            </p>
          </div>

          <div className="text-sm text-gray-500">
            Need help? Contact our Merchant Support:
            <br />
            <span className="font-semibold text-gray-700">
              support@example.com
            </span>
          </div>
        </div>

        {/* RIGHT SIDE – Actual Form Steps */}
        <div className="bg-white shadow-md p-8 rounded-xl">
          {/* STEP 1 – OVERVIEW */}
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold mb-3">Before You Start</h2>

              <p className="text-gray-600 mb-6 leading-relaxed">
                We require a quick verification to ensure business authenticity.
                Your details are secured and processed according to our
                policies.
              </p>

              <h3 className="text-lg font-semibold mb-2">What You Will Do</h3>
              <ul className="list-disc ml-6 text-gray-600 space-y-2 mb-4">
                <li>Prepare your documents</li>
                <li>Upload your business requirements</li>
                <li>Fill in your shop details</li>
                <li>Wait for approval within 3–5 business days</li>
              </ul>

              <div className="text-sm text-gray-500 mb-6">
                By continuing, you agree to our{" "}
                <button
                  onClick={() => navigate("/privacy-policy")}
                  className="text-fp-pink underline"
                >
                  Privacy Policy
                </button>
                ,{" "}
                <button
                  onClick={() => navigate("/merchant-agreement")}
                  className="text-fp-pink underline"
                >
                  Merchant Agreement
                </button>{" "}
                and{" "}
                <button
                  onClick={() => navigate("/data-consent")}
                  className="text-fp-pink underline"
                >
                  Data Consent Notice
                </button>
                .
              </div>

              <label className="flex items-center gap-2 mb-6">
                <input
                  type="checkbox"
                  checked={understood}
                  onChange={(e) => setUnderstood(e.target.checked)}
                />
                <span>I agree and understand the onboarding requirements.</span>
              </label>

              <button
                disabled={!understood}
                onClick={() => setStep(2)}
                className={`w-full py-3 rounded-lg text-white font-semibold ${understood ? "bg-fp-pink hover:bg-fp-pink/90" : "bg-gray-400"
                  }`}
              >
                Proceed
              </button>
            </>
          )}

          {/* STEP 2 – REQUIREMENTS */}
          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold mb-4">
                Business Requirements
              </h2>

              <p className="text-gray-600 mb-3">
                Upload all documents for verification.
              </p>

              <ul className="list-disc ml-6 text-gray-600 space-y-2 mb-6">
                <li>DTI / Business Registration Permit</li>
                <li>Owner's Government ID</li>
                <li>Clear Photo of Storefront</li>
                <li>Optional: Food Safety Certificate</li>
              </ul>

              <label className="block">
                <span className="font-medium">
                  Upload Files (Optional for now)
                </span>
                <input
                  type="file"
                  onChange={handleFile}
                  className="mt-2 w-full border p-2 rounded"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                {requirements && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ File selected: {requirements.name}
                  </p>
                )}
              </label>

              <p className="text-sm text-gray-500 mt-4">
                Note: You can proceed without uploading documents for now. They
                can be submitted later.
              </p>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-lg border hover:bg-gray-50 transition"
                >
                  Back
                </button>

                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-lg text-white bg-fp-pink hover:bg-fp-pink/90 transition"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {/* STEP 3 – FORM */}
          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold mb-6">Shop Information</h2>

              <div className="space-y-4">
                {/* Shop Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Shop Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Tiger Milk Tea"
                    className={`w-full border p-3 rounded focus:ring-2 focus:ring-fp-pink focus:border-transparent ${errors.shopName ? "border-red-500 bg-red-50" : ""
                      }`}
                    value={form.shopName}
                    onChange={(e) => {
                      setForm({ ...form, shopName: e.target.value });
                      setErrors({ ...errors, shopName: "" });
                    }}
                  />
                  {errors.shopName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.shopName}
                    </p>
                  )}
                </div>

                {/* Shop Address */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Shop Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Building A, Ground Floor"
                    className={`w-full border p-3 rounded focus:ring-2 focus:ring-fp-pink focus:border-transparent ${errors.shopAddress ? "border-red-500 bg-red-50" : ""
                      }`}
                    value={form.shopAddress}
                    onChange={(e) => {
                      setForm({ ...form, shopAddress: e.target.value });
                      setErrors({ ...errors, shopAddress: "" });
                    }}
                  />
                  {errors.shopAddress && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.shopAddress}
                    </p>
                  )}
                </div>

                {/* Canteen Location (Dropdown) */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Canteen Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full border p-3 rounded focus:ring-2 focus:ring-fp-pink focus:border-transparent ${errors.location ? "border-red-500 bg-red-50" : ""
                      }`}
                    value={form.location}
                    onChange={(e) => {
                      setForm({ ...form, location: e.target.value });
                      setErrors({ ...errors, location: "" });
                    }}
                  >
                    <option value="">Select Canteen Location</option>
                    {SHOP_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  {errors.location && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.location}
                    </p>
                  )}
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 09171234567 or +639171234567"
                    maxLength={13}
                    className={`w-full border p-3 rounded focus:ring-2 focus:ring-fp-pink focus:border-transparent ${errors.contactNumber ? "border-red-500 bg-red-50" : ""
                      }`}
                    value={form.contactNumber}
                    onChange={(e) => {
                      setForm({ ...form, contactNumber: e.target.value });
                      setErrors({ ...errors, contactNumber: "" });
                    }}
                  />
                  {errors.contactNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.contactNumber}
                    </p>
                  )}
                </div>

                {/* Shop Description */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Shop Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Tell us about your shop..."
                    className={`w-full border p-3 rounded h-28 focus:ring-2 focus:ring-fp-pink focus:border-transparent ${errors.shopDescr ? "border-red-500 bg-red-50" : ""
                      }`}
                    value={form.shopDescr}
                    onChange={(e) => {
                      setForm({ ...form, shopDescr: e.target.value });
                      setErrors({ ...errors, shopDescr: "" });
                    }}
                  />
                  {errors.shopDescr && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.shopDescr}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-lg border hover:bg-gray-50 transition"
                  disabled={submitting}
                >
                  Back
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`px-6 py-3 rounded-lg text-white ${submitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-fp-pink hover:bg-fp-pink/90"
                    }`}
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </>
          )}

          {/* STEP 4 – CONFIRMATION */}
          {step === 4 && (
            <div className="text-center py-16">
              <div className="mb-6">
                <svg
                  className="w-20 h-20 mx-auto text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Application Submitted!
              </h2>

              <p className="text-gray-600 mb-6">
                Our team will review your documents and notify you via email
                within 3–5 business days.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>What's Next?</strong>
                  <br />
                  Check your email ({user?.email}) for updates. You can also
                  check your shop status in your profile.
                </p>
              </div>

              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-fp-pink rounded-lg text-white hover:bg-fp-pink/90 transition"
              >
                Return to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerApplicationPage;