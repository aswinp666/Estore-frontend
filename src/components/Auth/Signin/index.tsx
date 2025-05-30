// index.tsx
"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { setUser } from "../../../redux/features/auth-slice"; // adjust path as needed
import { AppDispatch } from "@/redux/store";
import { toast, ToastContainer } from 'react-toastify'; // Import toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS

const Signin = () => {
  const router = useRouter();
  const [step, setStep] = useState<"signin" | "forgot" | "verify" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleGoogleSignIn = async (response: any) => {
    setIsLoading(true);
    try {
      const { credential } = response;
      const res = await fetch("https://estore-backend-dyl3.onrender.com/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credential }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      dispatch(setUser(data.user));
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("yourAuthTokenKey", data.token);

      // Show success toast BEFORE redirection
      toast.success("Successfully signed in with Google!");

      // Use router.push for client-side navigation if possible,
      // or window.location.href if a full hard reload is strictly needed
      // but router.push is generally preferred in Next.js for better UX.
      router.push("/"); // Redirect to home page
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
      toast.error(err.message || "Failed to sign in with Google."); // Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("https://estore-backend-dyl3.onrender.com/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      dispatch(setUser(data.user));
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("yourAuthTokenKey", data.token);

      // Show success toast BEFORE redirection
      toast.success("Successfully signed in!");

      // Use router.push for client-side navigation
      router.push("/"); // Redirect to home page
    } catch (err: any) {
      setError("Invalid credentials");
      toast.error("Invalid credentials"); // Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);
    try {
      const res = await fetch("https://estore-backend-dyl3.onrender.com/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }
      
      setStep("verify");
      setSuccessMsg(data.message || "OTP sent to your email.");
      toast.info(data.message || "OTP sent to your email."); // Toast for OTP sent
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
      toast.error(err.message || "Failed to send OTP. Please try again."); // Toast for OTP error
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);
    try {
      const res = await fetch("https://estore-backend-dyl3.onrender.com/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid OTP");
      }

      setStep("reset");
      setSuccessMsg(data.message || "OTP verified successfully");
      toast.success(data.message || "OTP verified successfully"); // Toast for OTP verified
    } catch (err: any) {
      setError(err.message || "Failed to verify OTP");
      toast.error(err.message || "Failed to verify OTP"); // Toast for OTP verification error
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);
    try {
      const res = await fetch("https://estore-backend-dyl3.onrender.com/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setSuccessMsg(data.message || "Password reset successfully");
      setStep("signin");
      setOtp("");
      setNewPassword("");
      toast.success(data.message || "Password reset successfully! Please sign in with your new password."); // Toast for password reset success
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
      toast.error(err.message || "Failed to reset password."); // Toast for password reset error
    } finally {
      setIsLoading(false);
    }
  };

  
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      {/* ToastContainer added here as well, with a high z-index */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 99999 }} // Ensure it's on top of other elements
      />
      <Breadcrumb title="Signin" pages={["Signin"]} />
      <section className="py-12 md:py-20 bg-gray-50 min-h-screen flex items-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full">
          {/* Sign In Step */}
          {step === "signin" && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
                <p className="text-gray-500">Sign in to your account</p>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {/* No successMsg display here, as toast handles it */}
              
              <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep("forgot")}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
               <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid gray',
                    backgroundColor: 'white',
                    color: 'black',
                    fontWeight: '500',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1,
                    transition: 'opacity 0.3s ease',
                    outline: 'none',
                  }}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
              
              <div className="my-6 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
              
              <div className="flex justify-center">
                <GoogleLogin 
                  onSuccess={handleGoogleSignIn} 
                  onError={() => setError("Google login failed")} 
                  useOneTap 
                  theme="filled_blue"
                  size="medium"
                  shape="rectangular"
                />
              </div>
              
              <div className="mt-6 text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                  Sign up
                </Link>
              </div>
            </>
          )}

          {/* Forgot Password Step */}
          {step === "forgot" && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset your password</h2>
                <p className="text-gray-500">We'll send you an OTP to reset your password</p>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              {successMsg && ( // Keep successMsg for non-toast messages if desired, but toast duplicates
                <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">
                  {successMsg}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>
                
                <button
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  className={`w-full py-2 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setStep("signin");
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="w-full py-2 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                >
                  Back to sign in
                </button>
              </div>
            </>
          )}

          {/* Verify OTP Step */}
          {step === "verify" && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify your email</h2>
                <p className="text-gray-500">We've sent a verification code to {email}</p>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              {successMsg && ( // Keep successMsg for non-toast messages if desired
                <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">
                  {successMsg}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                    Verification code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>
                
                <button
                  onClick={handleVerifyOtp}
                  disabled={isLoading}
                  className={`w-full py-2 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Verifying...' : 'Verify code'}
                </button>
                
                <div className="text-center text-sm text-gray-500">
                  Didn't receive a code?{' '}
                  <button 
                    onClick={handleSendOtp}
                    className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                  >
                    Resend OTP
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setStep("forgot");
                    setError(null);
                    setSuccessMsg(null);
                    setOtp("");
                  }}
                  className="w-full py-2 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                >
                  Back
                </button>
              </div>
            </>
          )}

          {/* Reset Password Step */}
          {step === "reset" && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Create new password</h2>
                <p className="text-gray-500">Your new password must be different from previous used passwords</p>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              {successMsg && ( // Keep successMsg for non-toast messages if desired
                <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">
                  {successMsg}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                    New password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
                </div>
                
                <button
                  onClick={handleResetPassword}
                  disabled={isLoading}
                  className={`w-full py-2 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Resetting...' : 'Reset password'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setStep("verify");
                    setError(null);
                    setSuccessMsg(null);
                    setNewPassword("");
                  }}
                  className="w-full py-2 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                >
                  Back
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </GoogleOAuthProvider>
  );
};

export default Signin;