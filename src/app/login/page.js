"use client";
import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FormInput } from "@/components/ui/form-components";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { loginAction } from "@/app/actions/auth";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Flame, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Validation Schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      const destination = user?.role === "CHEF" ? "/chef/orders" : "/dashboard";
      router.replace(destination);
    }
  }, [isAuthenticated, loading, user, router]);

  if (loading || isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-950">
        <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
      </div>
    );
  }

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      // Create FormData to match your existing server action signature
      const formData = new FormData();
      formData.append("email", values.email);
      formData.append("password", values.password);

      const result = await loginAction(null, formData);

      if (result?.error) {
        toast.error(result.error);
        setStatus(result.error);
        setSubmitting(false);
      } else if (result?.success) {
        // Handle success and storage
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));

        toast.success("Login successful! Redirecting...");
        setIsRedirecting(true);

        // Hard redirect for context refresh
        setTimeout(() => {
          const destination = result.data.user.role === "CHEF" ? "/chef/orders" : "/dashboard";
          window.location.href = destination;
        }, 800);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-950 font-sans text-gray-100 selection:bg-orange-500/30">
      {/* LEFT SIDE - VIDEO BACKGROUND */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden lg:flex">
        {/* Overlay Gradient */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
        <div className="absolute inset-0 z-10 bg-orange-900/10 mix-blend-overlay" />

        {/* Video Element */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-60 transition-opacity duration-1000 ease-in-out"
          style={{ filter: "contrast(1.2) saturation(1.1)" }}
        >
           {/* Using a high-quality stock video for BBQ/Grill ambiance */}
           <source
            src="https://assets.mixkit.co/videos/preview/mixkit-grilling-meat-on-barbecue-4261-large.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        {/* Content over Video */}
        <div className="relative z-20 flex max-w-lg flex-col items-center text-center">
          <div className="mb-6 flex animate-fade-in-down items-center justify-center rounded-2xl bg-orange-600/20 p-4 backdrop-blur-md ring-1 ring-orange-500/30 transition-all duration-500 items-center justify-center">
             <Flame className="h-12 w-12 text-orange-500 animate-pulse" />
          </div>
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Master the <span className="text-orange-500">Grill</span>
          </h1>
          <p className="max-w-md text-lg text-gray-200/90 leading-relaxed">
            Experience the ultimate admin control panel for Grill-X. Manage inventory, orders, and more with spicy efficiency.
          </p>
          
           {/* Glass Card Stat Example */}
           <div className="mt-12 w-full animate-fade-in-up delay-150">
             <div className="mx-auto max-w-xs rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                   <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                      <CheckCircle2 size={20} />
                   </div>
                   <div className="text-left">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">System Status</p>
                      <p className="text-sm font-bold text-white">All Systems Operational</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="flex w-full flex-col items-center justify-center bg-gray-900/40 p-6 lg:w-1/2">
        <div className="w-full max-w-md animate-in slide-in-from-right-8 duration-700 fade-in">
          
          <div className="mb-6 flex items-center justify-center gap-2 lg:hidden">
              <Flame className="h-10 w-10 text-orange-500" />
              <span className="text-3xl font-bold text-white">Grill-X</span>
          </div>

          <Card className="border-gray-800 bg-gray-900/60 backdrop-blur-xl shadow-2xl">
             <CardHeader className="text-center space-y-2">
                <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                <CardDescription className="text-gray-400">
                   Enter your credentials to access the admin dashboard.
                </CardDescription>
             </CardHeader>
             <CardContent className="space-y-6">
                <Formik
                  initialValues={{ email: "", password: "" }}
                  validationSchema={LoginSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting }) => (
                    <Form className="space-y-4">
                      <FormInput
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="admin@grillx.com"
                        autoComplete="email"
                      />
                      
                      <div className="space-y-1">
                        <FormInput
                          label="Password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          autoComplete="current-password"
                        />
                         <div className="flex justify-end">
                          <a href="#" className="mt-1 text-xs font-medium text-orange-500 hover:text-orange-400 hover:underline">
                            Forgot password?
                          </a>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || isRedirecting}
                        className={cn(
                          "group mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition-all duration-300",
                          isSubmitting || isRedirecting
                            ? "bg-gray-800 cursor-not-allowed opacity-70"
                            : "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-lg shadow-orange-900/20 hover:shadow-orange-700/30 transform hover:-translate-y-0.5"
                        )}
                      >
                        {isSubmitting || isRedirecting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </button>
                    </Form>
                  )}
                </Formik>
                
                 {/* Demo Credentials Hint */}
                 <div className="mt-6 rounded-lg bg-gray-800/50 p-3 text-center border border-gray-700/50">
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold text-gray-400">Demo Account:</span> admin@grillx.com / admin123
                    </p>
                  </div>
             </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-600">
            <p>© 2024 Grill-X System. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
