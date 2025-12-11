import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import './SellerRegister.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const SHOP_LOCATIONS = [
    "JHS Canteen",
    "Main Canteen",
    "Preschool Canteen",
    "Frontgate",
    "Backgate"
];

const STEP_CONFIG = [
    {
        id: 1,
        title: "Before You Start",
        content: ({ understood, setUnderstood, navigate }) => (
            <>
                <p className="text-gray-600 mb-6 leading-relaxed">
                    We require a quick verification to ensure business authenticity.
                    Your details are secured and processed according to our policies.
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
                    <button onClick={() => navigate("/privacy-policy")} className="text-pink-600 underline">
                        Privacy Policy
                    </button>
                    ,{" "}
                    <button onClick={() => navigate("/merchant-agreement")} className="text-pink-600 underline">
                        Merchant Agreement
                    </button>{" "}
                    and{" "}
                    <button onClick={() => navigate("/data-consent")} className="text-pink-600 underline">
                        Data Consent Notice
                    </button>
                    .
                </div>

                <label className="flex items-center gap-2 mb-6">
                    <input type="checkbox" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} />
                    <span>I agree and understand the onboarding requirements.</span>
                </label>
            </>
        ),
        proceedEnabled: ({ understood }) => understood,
        proceedAction: ({ setStep }) => setStep(2),
    },
    {
        id: 2,
        title: "Business Requirements",
        content: ({ requirements, handleFile }) => (
            <>
                <p className="text-gray-600 mb-3">Upload all documents for verification.</p>
                <ul className="list-disc ml-6 text-gray-600 space-y-2 mb-6">
                    <li>DTI / Business Registration Permit</li>
                    <li>Owner's Government ID</li>
                    <li>Clear Photo of Storefront</li>
                    <li>Optional: Food Safety Certificate</li>
                </ul>

                <label className="block">
                    <span className="font-medium">Upload Files (Optional for now)</span>
                    <input
                        type="file"
                        onChange={handleFile}
                        className="mt-2 w-full border p-2 rounded"
                        accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {requirements && (
                        <p className="text-sm text-green-600 mt-1">✓ File selected: {requirements.name}</p>
                    )}
                </label>

                <p className="text-sm text-gray-500 mt-4">
                    Note: File upload functionality will be implemented in a future update.
                    You can proceed without uploading for now.
                </p>
            </>
        ),
        proceedEnabled: () => true,
        proceedAction: ({ setStep }) => setStep(3),
        backAction: ({ setStep }) => setStep(1),
    },
    {
        id: 3,
        title: "Shop Information",
    },
    {
        id: 4,
        title: "Confirmation",
    },
];

const FORM_FIELDS = [
    { key: "shopName", label: "Shop Name", type: "text", required: true, placeholder: "e.g., Mama's Kitchen" },
    { key: "shopDescr", label: "Shop Description", type: "textarea", required: true, placeholder: "Tell us about your shop..." },
    { key: "shopAddress", label: "Shop Address", type: "text", required: true, placeholder: "e.g., Building A, Ground Floor" },
    { key: "location", label: "Location", type: "select", required: true, options: SHOP_LOCATIONS },
    {
        key: "contactNumber",
        label: "Contact Number",
        type: "text",
        required: true,
        placeholder: "e.g., 09171234567 or +639171234567",
        maxLength: 13
    },
];

const SellerRegister = () => {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [understood, setUnderstood] = useState(false);
    const [loading, setLoading] = useState(false);
    const [requirements, setRequirements] = useState(null);
    const [form, setForm] = useState({
        shopName: "",
        shopDescr: "",
        shopAddress: "",
        location: "",
        contactNumber: "",
    });
    const [errors, setErrors] = useState({});

    const handleFile = (e) => {
        if (e.target.files?.[0]) setRequirements(e.target.files[0]);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.shopName.trim()) {
            newErrors.shopName = "Shop name is required";
        } else if (form.shopName.trim().length > 100) {
            newErrors.shopName = "Shop name must not exceed 100 characters";
        }

        if (!form.shopDescr.trim()) {
            newErrors.shopDescr = "Shop description is required";
        } else if (form.shopDescr.trim().length > 500) {
            newErrors.shopDescr = "Shop description must not exceed 500 characters";
        }

        if (!form.shopAddress.trim()) {
            newErrors.shopAddress = "Shop address is required";
        } else if (form.shopAddress.trim().length > 200) {
            newErrors.shopAddress = "Shop address must not exceed 200 characters";
        }

        if (!form.location) {
            newErrors.location = "Location is required";
        }

        // Contact number validation
        if (!form.contactNumber.trim()) {
            newErrors.contactNumber = "Contact number is required";
        } else {
            // Philippine mobile number format: 09XXXXXXXXX or +639XXXXXXXXX
            const phoneRegex = /^(09|\+639)\d{9}$/;
            if (!phoneRegex.test(form.contactNumber.trim())) {
                newErrors.contactNumber = "Contact number must be a valid mobile number (e.g., 09171234567 or +639171234567)";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!currentUser) {
            toast.error("You must be logged in to register as a seller");
            navigate("/login");
            return;
        }

        if (!validateForm()) {
            toast.error("Please fix the errors in the form");
            return;
        }

        setLoading(true);
        try {
            const shopData = {
                shopName: form.shopName.trim(),
                shopDescr: form.shopDescr.trim(),
                shopAddress: form.shopAddress.trim(),
                location: form.location,
                contactNumber: form.contactNumber.trim(),
            };

            const response = await axios.post(`${API_BASE_URL}/shops`, shopData, {
                headers: {
                    Authorization: `Bearer ${currentUser.token}`,
                    "Content-Type": "application/json"
                },
            });

            toast.success(response.data.message || "Shop application submitted successfully!");
            setStep(4);
        } catch (err) {
            console.error("Shop creation error:", err);

            if (err.response?.data) {
                const errorData = err.response.data;

                // Handle validation errors
                if (typeof errorData === 'object' && !errorData.message) {
                    const validationErrors = {};
                    Object.entries(errorData).forEach(([field, message]) => {
                        validationErrors[field] = message;
                    });
                    setErrors(validationErrors);
                    toast.error("Please fix the validation errors");
                } else {
                    toast.error(errorData.message || "Unable to submit application.");
                }
            } else {
                toast.error(err.message || "Unable to submit application.");
            }
        } finally {
            setLoading(false);
        }
    };

    const progressPercent = { 1: "25%", 2: "50%", 3: "75%", 4: "100%" }[step];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* PROGRESS BAR */}
            <div className="w-full bg-white shadow-sm py-4 px-6 relative">
                <div className="max-w-5xl mx-auto">
                    <button
                        onClick={() => navigate("/")}
                        className="text-sm text-pink-600 hover:text-pink-700 transition absolute left-8 top-1/2 -translate-y-1/2"
                    >
                        ← Back
                    </button>
                    <div className="text-sm font-medium mb-2 text-gray-600">Step {step} of 4</div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-pink-600 transition-all duration-500" style={{ width: progressPercent }}></div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 py-12 px-6">
                {/* LEFT SIDE – Branding */}
                <div className="space-y-8 px-4">
                    <h1 className="text-4xl font-bold text-pink-600">
                        Join Our Wildcats Community, Be a WildEats Partner Today!
                    </h1>
                    <p className="text-gray-600 leading-relaxed">
                        Get access to thousands of hungry Wildcats and grow your business with WildEats!
                    </p>
                    <div>
                        <h2 className="text-xl font-semibold mb-3">Why Businesses Trust Us</h2>
                        <ul className="space-y-3 text-gray-700">
                            <li>✓ Fast merchant approval</li>
                            <li>✓ Easy-to-use Seller Dashboard</li>
                            <li>✓ Weekly payouts and transparent reporting</li>
                            <li>✓ Zero signup cost – start selling immediately</li>
                            <li>✓ Customer support for partners</li>
                        </ul>
                    </div>
                </div>

                {/* RIGHT SIDE – Form */}
                <div className="bg-white shadow-md p-8 rounded-xl">
                    {step < 3 && STEP_CONFIG.find((s) => s.id === step)?.content({
                        understood,
                        setUnderstood,
                        navigate,
                        requirements,
                        handleFile,
                    })}

                    {step === 3 && (
                        <>
                            <h2 className="text-2xl font-bold mb-6">Shop Information</h2>
                            <div className="space-y-4">
                                {FORM_FIELDS.map((field) => (
                                    <div key={field.key}>
                                        <label className="block text-sm font-medium mb-1">
                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        {field.type === "textarea" ? (
                                            <textarea
                                                placeholder={field.placeholder}
                                                className={`w-full border p-3 rounded h-28 focus:ring-2 focus:ring-pink-500 focus:border-transparent ${errors[field.key] ? 'border-red-500' : ''
                                                    }`}
                                                value={form[field.key]}
                                                onChange={(e) => {
                                                    setForm({ ...form, [field.key]: e.target.value });
                                                    setErrors({ ...errors, [field.key]: null });
                                                }}
                                            />
                                        ) : field.type === "select" ? (
                                            <select
                                                className={`w-full border p-3 rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent ${errors[field.key] ? 'border-red-500' : ''
                                                    }`}
                                                value={form[field.key]}
                                                onChange={(e) => {
                                                    setForm({ ...form, [field.key]: e.target.value });
                                                    setErrors({ ...errors, [field.key]: null });
                                                }}
                                            >
                                                <option value="">Select {field.label}</option>
                                                {field.options.map((opt) => (
                                                    <option key={opt} value={opt}>
                                                        {opt}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={field.type}
                                                placeholder={field.placeholder}
                                                className={`w-full border p-3 rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent ${errors[field.key] ? 'border-red-500' : ''
                                                    }`}
                                                value={form[field.key]}
                                                onChange={(e) => {
                                                    setForm({ ...form, [field.key]: e.target.value });
                                                    setErrors({ ...errors, [field.key]: null });
                                                }}
                                            />
                                        )}
                                        {errors[field.key] && (
                                            <p className="text-red-500 text-sm mt-1">{errors[field.key]}</p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between mt-8">
                                <button
                                    onClick={() => setStep(2)}
                                    className="px-6 py-3 rounded-lg border hover:bg-gray-50 transition"
                                    disabled={loading}
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className={`px-6 py-3 rounded-lg text-white transition ${loading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-pink-600 hover:bg-pink-700"
                                        }`}
                                >
                                    {loading ? "Submitting..." : "Submit Application"}
                                </button>
                            </div>
                        </>
                    )}

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
                            <h2 className="text-3xl font-bold mb-4">Application Submitted!</h2>
                            <p className="text-gray-600 mb-6">
                                Our team will review your application and notify you via email within 3–5 business days.
                            </p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-blue-800">
                                    <strong>What's Next?</strong>
                                    <br />
                                    Check your email ({currentUser?.email}) for updates.
                                    You can also check your shop status in your profile.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate("/")}
                                className="px-6 py-3 bg-pink-600 rounded-lg text-white hover:bg-pink-700 transition"
                            >
                                Return to Home
                            </button>
                        </div>
                    )}

                    {/* Step Navigation Buttons */}
                    {step < 3 && (
                        <div className="flex justify-between mt-8">
                            {STEP_CONFIG.find((s) => s.id === step)?.backAction && (
                                <button
                                    onClick={() => STEP_CONFIG.find((s) => s.id === step).backAction({ setStep })}
                                    className="px-6 py-3 rounded-lg border hover:bg-gray-50 transition"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                onClick={() => STEP_CONFIG.find((s) => s.id === step).proceedAction({ setStep })}
                                disabled={!STEP_CONFIG.find((s) => s.id === step).proceedEnabled({ understood })}
                                className={`px-6 py-3 rounded-lg text-white transition ${!STEP_CONFIG.find((s) => s.id === step).proceedEnabled({ understood })
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-pink-600 hover:bg-pink-700"
                                    }`}
                            >
                                Continue
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerRegister;