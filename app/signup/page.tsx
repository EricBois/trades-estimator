"use client";

import { useState } from "react";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calculator, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Form,
  FormInput,
  FormSelect,
  FormError,
  FormSubmit,
} from "@/components/ui/Form";
import { TRADE_TYPES } from "@/lib/constants";

const signupSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    companyName: z.string().min(2, "Company name must be at least 2 characters"),
    tradeType: z.string().min(1, "Please select your trade"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  const onSubmit = async (data: SignupFormData) => {
    setAuthError(null);

    const { error } = await signUp(data.email, data.password, {
      companyName: data.companyName,
      tradeType: data.tradeType,
    });

    if (error) {
      setAuthError(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">QuickEstimate</span>
        </div>

        <div className="space-y-8">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Start winning more jobs today.
          </h1>
          <div className="space-y-4">
            {[
              "Create estimates in minutes",
              "Works offline on job sites",
              "Send to homeowners instantly",
              "Track all your estimates",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-200" />
                <span className="text-blue-100">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-200 text-sm">
          Join thousands of contractors using QuickEstimate
        </p>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">QuickEstimate</span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-gray-600">
              Get started with your free account
            </p>
          </div>

          <Form
            schema={signupSchema}
            onSubmit={onSubmit}
            className="space-y-4"
          >
            <FormError message={authError} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                name="email"
                label="Email address"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="sm:col-span-2"
              />

              <FormInput
                name="companyName"
                label="Company Name"
                placeholder="Your Company LLC"
                autoComplete="organization"
              />

              <FormSelect
                name="tradeType"
                label="Trade Type"
                placeholder="Select your trade..."
                options={TRADE_TYPES}
              />

              <FormInput
                name="password"
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                autoComplete="new-password"
              />

              <FormInput
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Confirm password"
                autoComplete="new-password"
              />
            </div>

            <FormSubmit loadingText="Creating account..." className="mt-6">
              Create account
            </FormSubmit>
          </Form>

          <p className="text-center text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
