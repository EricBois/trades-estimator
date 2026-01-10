"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Loader2,
  Save,
} from "lucide-react";
import { useCreateClient, useUpdateClient } from "@/hooks/useClients";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

// Validation schema
const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  notes: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  initialData?: Partial<ClientFormData>;
  clientId?: string;
  onSuccess?: (clientId: string) => void;
  onCancel?: () => void;
}

export function ClientForm({
  initialData,
  clientId,
  onSuccess,
  onCancel,
}: ClientFormProps) {
  const router = useRouter();
  const { profile } = useAuth();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    mode: "onBlur",
    defaultValues: {
      name: initialData?.name ?? "",
      email: initialData?.email ?? "",
      phone: initialData?.phone ?? "",
      street: initialData?.street ?? "",
      city: initialData?.city ?? "",
      state: initialData?.state ?? "",
      zip: initialData?.zip ?? "",
      notes: initialData?.notes ?? "",
    },
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEditing = !!clientId;
  const isSubmitting = createClient.isPending || updateClient.isPending;

  const onSubmit = async (formData: ClientFormData) => {
    if (!profile) return;
    setSubmitError(null);

    try {
      if (isEditing) {
        await updateClient.mutateAsync({
          id: clientId,
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          street: formData.street || null,
          city: formData.city || null,
          state: formData.state || null,
          zip: formData.zip || null,
          notes: formData.notes || null,
        });
        onSuccess?.(clientId);
        router.push(`/clients/${clientId}`);
      } else {
        const client = await createClient.mutateAsync({
          contractorId: profile.id,
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          street: formData.street || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zip: formData.zip || undefined,
          notes: formData.notes || undefined,
        });
        onSuccess?.(client.id);
        router.push(`/clients/${client.id}`);
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to save client"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <User className="w-4 h-4 inline mr-2" />
          Name <span className="text-red-500">*</span>
        </label>
        <input
          {...register("name")}
          type="text"
          placeholder="John Smith"
          className={cn(
            "w-full min-h-[48px] px-4 py-3 text-base",
            "border rounded-xl bg-white",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            errors.name ? "border-red-300" : "border-gray-300"
          )}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Mail className="w-4 h-4 inline mr-2" />
          Email
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="john@example.com"
          inputMode="email"
          className={cn(
            "w-full min-h-[48px] px-4 py-3 text-base",
            "border rounded-xl bg-white",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            errors.email ? "border-red-300" : "border-gray-300"
          )}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Phone className="w-4 h-4 inline mr-2" />
          Phone
        </label>
        <input
          {...register("phone")}
          type="tel"
          placeholder="(555) 555-5555"
          inputMode="tel"
          className={cn(
            "w-full min-h-[48px] px-4 py-3 text-base",
            "border border-gray-300 rounded-xl bg-white",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          )}
        />
      </div>

      {/* Address Section */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          <MapPin className="w-4 h-4 inline mr-2" />
          Address
        </label>

        {/* Street */}
        <input
          {...register("street")}
          type="text"
          placeholder="Street address"
          className={cn(
            "w-full min-h-[48px] px-4 py-3 text-base",
            "border border-gray-300 rounded-xl bg-white",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          )}
        />

        {/* City, State, Zip */}
        <div className="grid grid-cols-6 gap-3">
          <input
            {...register("city")}
            type="text"
            placeholder="City"
            className={cn(
              "col-span-3 min-h-[48px] px-4 py-3 text-base",
              "border border-gray-300 rounded-xl bg-white",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            )}
          />
          <input
            {...register("state")}
            type="text"
            placeholder="State"
            className={cn(
              "col-span-1 min-h-[48px] px-4 py-3 text-base",
              "border border-gray-300 rounded-xl bg-white",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            )}
          />
          <input
            {...register("zip")}
            type="text"
            placeholder="ZIP"
            inputMode="numeric"
            className={cn(
              "col-span-2 min-h-[48px] px-4 py-3 text-base",
              "border border-gray-300 rounded-xl bg-white",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            )}
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="w-4 h-4 inline mr-2" />
          Notes
        </label>
        <textarea
          {...register("notes")}
          placeholder="Any additional notes about this client..."
          rows={3}
          className={cn(
            "w-full px-4 py-3 text-base",
            "border border-gray-300 rounded-xl bg-white",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          )}
        />
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "flex-1 inline-flex items-center justify-center gap-2",
            "px-6 py-3 rounded-xl font-medium text-white",
            "bg-blue-600 hover:bg-blue-700",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {isEditing ? "Save Changes" : "Add Client"}
            </>
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              "px-6 py-3 rounded-xl font-medium",
              "text-gray-700 bg-gray-100 hover:bg-gray-200",
              "focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
              "transition-colors"
            )}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
