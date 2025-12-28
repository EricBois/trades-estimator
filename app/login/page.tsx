"use client";

import { useState } from "react";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calculator } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Form,
  FormInput,
  FormError,
  FormSubmit,
} from "@/components/ui/Form";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);

    const { error } = await signIn(data.email, data.password);

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

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Professional estimates
            <br />
            in minutes, not hours.
          </h1>
          <p className="text-blue-100 text-lg max-w-md">
            Create accurate job estimates on-site, even offline. Send to
            homeowners instantly and win more jobs.
          </p>
        </div>

        <p className="text-blue-200 text-sm">
          Trusted by contractors across the country
        </p>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              QuickEstimate
            </span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          <Form schema={loginSchema} onSubmit={onSubmit} className="space-y-5">
            <FormError message={authError} />

            <div className="space-y-4">
              <FormInput
                name="email"
                label="Email address"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
              />

              <FormInput
                name="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <FormSubmit loadingText="Signing in...">Sign in</FormSubmit>
          </Form>

          <p className="text-center text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
