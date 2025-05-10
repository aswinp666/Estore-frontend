"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

const Signup = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("https://estore-backend-dyl3.onrender.com/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setSuccess("Account created successfully!");
      setError(null);

      // Redirect after short delay
      setTimeout(() => {
        router.push("/signin");
      }, 1000);
    } catch (err) {
      setError(err.message);
      setSuccess(null);
    }
  };

  const handleGoogleLogin = async (response) => {
    try {
      const { credential } = response;
      // Send the token to the backend to verify and authenticate
      const res = await fetch("https://estore-backend-dyl3.onrender.com/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Google sign-in failed");
      }

      setSuccess("Account created successfully with Google!");
      setError(null);

      // Redirect after short delay
      setTimeout(() => {
        router.push("/signin");
      }, 1000);
    } catch (err) {
      setError(err.message);
      setSuccess(null);
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <Breadcrumb title={"Signup"} pages={["Signup"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] mx-auto bg-white shadow-1 p-4 sm:p-7.5 xl:p-11 rounded-xl">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Create an Account
              </h2>
              <p>Enter your detail below</p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
              {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

              <div className="mb-5">
                <label htmlFor="name" className="block mb-2.5">
                  Full Name <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="email" className="block mb-2.5">
                  Email Address <span className="text-red">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="password" className="block mb-2.5">
                  Password <span className="text-red">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  autoComplete="on"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5"
                />
              </div>

              <div className="mb-5.5">
                <label htmlFor="confirmPassword" className="block mb-2.5">
                  Re-type Password <span className="text-red">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  autoComplete="on"
                  placeholder="Re-type your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5"
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg hover:bg-blue mt-7.5"
              >
                Create Account
              </button>
            </form>

            <div className="mt-6">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => {
                  console.error("Google login error");
                  setError("Google login failed");
                }}
              />
            </div>

            <p className="text-center mt-6">
              Already have an account?
              <Link href="/signin" className="text-dark hover:text-blue pl-2">
                Sign in Now
              </Link>
            </p>
          </div>
        </div>
      </section>
    </GoogleOAuthProvider>
  );
};

export default Signup;