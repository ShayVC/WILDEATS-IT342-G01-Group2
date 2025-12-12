import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
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

            // Validate required parameters
            if (!token || !userId || !email) {
                toast({
                    title: "Authentication failed",
                    description: "Missing required information.",
                    variant: "destructive",
                });
                navigate("/");
                return;
            }

            // Parse roles array
            const roles = rolesParam ? rolesParam.split(",") : [role];

            // Create user object
            const user = {
                id: parseInt(userId),
                firstName: firstName || "User",
                lastName: lastName || "",
                email,
                roles,
            };

            // Update auth context
            login(token, user);

            // Show success message
            const roleDisplay = role?.toUpperCase() || "USER";
            toast({
                title: "Login successful",
                description: `Welcome! Logged in as ${roleDisplay} via Google.`,
            });

            // Redirect based on role
            if (roles.includes("SELLER")) {
                navigate("/seller_dashboard");
            } else if (roles.includes("ADMIN")) {
                navigate("/admin");
            } else {
                navigate("/");
            }
        };

        handleOAuthCallback();
    }, [searchParams, navigate, login, toast]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-4">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-fp-pink"></div>
                <p className="text-gray-600">Completing sign in with Google...</p>
                <p className="text-sm text-gray-500">
                    Please wait while we set up your account...
                </p>
            </div>
        </div>
    );
};

export default OAuthCallback;