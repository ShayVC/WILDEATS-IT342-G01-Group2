import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

/**
 * OAuth Callback Handler
 * 
 * This component handles the redirect from the backend after successful
 * Google OAuth authentication. It extracts the JWT token and user data
 * from URL parameters and updates the auth context.
 */
const OAuthCallback: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { toast } = useToast();
    const { login } = useAuth();

    useEffect(() => {
        const handleOAuthCallback = () => {
            // Extract parameters from URL
            const token = searchParams.get("token");
            const userId = searchParams.get("userId");
            const email = searchParams.get("email");
            const firstName = searchParams.get("firstName");
            const lastName = searchParams.get("lastName");
            const role = searchParams.get("role");
            const rolesParam = searchParams.get("roles");

            console.log("OAuth callback received:", {
                token: token ? "✅" : "❌",
                userId,
                email,
                firstName,
                lastName,
                role,
                rolesParam
            });

            // Validate required parameters
            if (!token || !userId || !email) {
                console.error("Missing required OAuth parameters");
                toast({
                    title: "Authentication failed",
                    description: "Missing required information from Google sign-in.",
                    variant: "destructive",
                });
                navigate("/");
                return;
            }

            // Parse roles array
            const roles = rolesParam ? rolesParam.split(",") : [role || "CUSTOMER"];

            // Create user object
            const user = {
                id: parseInt(userId),
                firstName: firstName || "User",
                lastName: lastName || "",
                email,
                roles,
            };

            console.log("Logging in user:", user);

            // Update auth context
            login(token, user);

            // Show success message
            const roleDisplay = role?.toUpperCase() || "USER";
            toast({
                title: "Login successful",
                description: `Welcome ${firstName}! Logged in via Google as ${roleDisplay}.`,
            });

            // Redirect based on role
            if (roles.includes("SELLER")) {
                console.log("Redirecting to seller dashboard");
                navigate("/seller_dashboard");
            } else if (roles.includes("ADMIN")) {
                console.log("Redirecting to admin panel");
                navigate("/admin");
            } else {
                console.log("Redirecting to home");
                navigate("/");
            }
        };

        handleOAuthCallback();
    }, [searchParams, navigate, login, toast]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-4">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-fp-pink"></div>
                <p className="text-gray-600 font-medium">Completing sign in with Google...</p>
                <p className="text-sm text-gray-500">
                    Please wait while we set up your account...
                </p>
            </div>
        </div>
    );
};

export default OAuthCallback;