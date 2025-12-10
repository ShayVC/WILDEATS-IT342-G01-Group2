import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const SellerRegisterFlow = () => {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [understood, setUnderstood] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        shopName: "",
        shopDescr: "",
        shopAddress: "",
        contactNumber: "",
    });

    // Note: File upload for requirements will be handled separately
    // For now, we'll just submit the shop information
    const [requirements, setRequirements] = useState(null);

    const handleFile = (e) => {
        if (e.target.files?.[0]) {
            setRequirements(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        // Validate that user is logged in
        if (!currentUser) {
            toast.error("You must be logged in to register as a seller");
            navigate('/login');
            return;
        }

        // Validate form fields
        if (!form.shopName.trim()) {
            toast.error("Shop name is required");
            return;
        }

        if (!form.shopAddress) {
            toast.error("Please select a canteen location");
            return;
        }

        if (!form.contactNumber.trim()) {
            toast.error("Contact number is required");
            return;
        }

        setLoading(true);

        try {
            // Create shop data object matching backend ShopEntity
            const shopData = {
                shopName: form.shopName.trim(),
                shopDescr: form.shopDescr.trim() || `${form.shopName} - Located at ${form.shopAddress}`,
                // Note: shopAddress is not in the backend entity, but we can include it in description
                // status and isOpen will be set by backend (PENDING and false)
            };

            console.log('Submitting shop application:', shopData);

            // Make API call to create shop
            const response = await axios.post(
                `${API_BASE_URL}/shops`,
                shopData,
                {
                    headers: {
                        'Authorization': `Bearer ${currentUser.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Shop application response:', response.data);

            // Show success message from backend or default
            toast.success(response.data.message || 'Shop application submitted successfully!');

            // Move to confirmation step
            setStep(4);

        } catch (err) {
            console.error('Error submitting shop application:', err);

            const errorMessage = err.response?.data?.message
                || err.message
                || "Unable to submit application. Please try again.";

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    /* ═══════════════════════════════
          Progress Bar
    ═══════════════════════════════ */
    const progressPercent = {
        1: "25%",
        2: "50%",
        3: "75%",
        4: "100%",
    }[step];

    return (
        <div className="min-h-screen bg-gray-50">

            {/* PROGRESS BAR WITH BACK BUTTON */}
            <div className="w-full bg-white shadow-sm py-4 px-6 relative">
                <div className="max-w-5xl mx-auto">

                    {/* BACK BUTTON */}
                    <button
                        onClick={() => navigate("/")}
                        className="text-sm text-pink-600 hover:text-pink-700 transition absolute left-8 top-1/2 -translate-y-1/2"
                    >
                        ← Back
                    </button>

                    {/* Progress text + bar */}
                    <div className="text-sm font-medium mb-2 text-gray-600">
                        Step {step} of 4
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-pink-600 transition-all duration-500"
                            style={{ width: progressPercent }}
                        ></div>
                    </div>

                </div>
            </div>

            {/* TWO-COLUMN LAYOUT */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 py-12 px-6">

                {/* LEFT SIDE – Marketing / Branding */}
                <div className="space-y-8 px-4">
                    <h1 className="text-4xl font-bold text-pink-600">
                        Join Our Wildcats Community, Be a WildEats Partner Today!
                    </h1>

                    <p className="text-gray-600 leading-relaxed">
                        Get access to thousands of hungry Wildcats and grow your business
                        with WildEats! We'll help you expand your reach and boost sales.
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
                        <span className="font-semibold text-gray-700">support@wildeats.com</span>
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
                                <button
                                    onClick={() => navigate("/privacy-policy")}
                                    className="text-pink-600 underline"
                                >
                                    Privacy Policy
                                </button>
                                ,{" "}
                                <button
                                    onClick={() => navigate("/merchant-agreement")}
                                    className="text-pink-600 underline"
                                >
                                    Merchant Agreement
                                </button>{" "}
                                and{" "}
                                <button
                                    onClick={() => navigate("/data-consent")}
                                    className="text-pink-600 underline"
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
                                className={`w-full py-3 rounded-lg text-white font-semibold transition ${understood ? "bg-pink-600 hover:bg-pink-700" : "bg-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                Proceed
                            </button>
                        </>
                    )}

                    {/* STEP 2 – REQUIREMENTS */}
                    {step === 2 && (
                        <>
                            <h2 className="text-2xl font-bold mb-4">Business Requirements</h2>

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
                                <span className="font-medium">Upload Files (Optional for now)</span>
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
                                Note: File upload functionality will be implemented in a future update.
                                You can proceed without uploading for now.
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
                                    className="px-6 py-3 rounded-lg bg-pink-600 text-white hover:bg-pink-700 transition"
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
                                        placeholder="e.g., Mama's Kitchen"
                                        className="w-full border p-3 rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        value={form.shopName}
                                        onChange={(e) =>
                                            setForm({ ...form, shopName: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Canteen Location (Dropdown) */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Canteen Location <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full border p-3 rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        value={form.shopAddress}
                                        onChange={(e) =>
                                            setForm({ ...form, shopAddress: e.target.value })
                                        }
                                    >
                                        <option value="">Select Canteen Location</option>
                                        <option value="JHS Canteen">JHS Canteen</option>
                                        <option value="Main Canteen">Main Canteen</option>
                                        <option value="Preschool Canteen">Preschool Canteen</option>
                                    </select>
                                </div>

                                {/* Contact Number */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Contact Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., 09171234567"
                                        className="w-full border p-3 rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        value={form.contactNumber}
                                        onChange={(e) =>
                                            setForm({ ...form, contactNumber: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Shop Description */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Shop Description (Optional)
                                    </label>
                                    <textarea
                                        placeholder="Tell us about your shop, specialties, and what makes you unique..."
                                        className="w-full border p-3 rounded h-28 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        value={form.shopDescr}
                                        onChange={(e) =>
                                            setForm({ ...form, shopDescr: e.target.value })
                                        }
                                    />
                                </div>
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
                                    disabled={loading || !form.shopName.trim() || !form.shopAddress || !form.contactNumber.trim()}
                                    className={`px-6 py-3 rounded-lg text-white transition ${loading || !form.shopName.trim() || !form.shopAddress || !form.contactNumber.trim()
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-pink-600 hover:bg-pink-700'
                                        }`}
                                >
                                    {loading ? 'Submitting...' : 'Submit Application'}
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

                            <h2 className="text-3xl font-bold mb-4">Application Submitted!</h2>

                            <p className="text-gray-600 mb-6">
                                Our team will review your application and notify you via email
                                within 3–5 business days. Once approved, you'll receive seller
                                privileges and can start managing your shop.
                            </p>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-blue-800">
                                    <strong>What's Next?</strong><br />
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

                </div>
            </div>
        </div>
    );
};

export default SellerRegisterFlow;