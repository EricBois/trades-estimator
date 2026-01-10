import { useState, useCallback } from "react";
import { useForm, UseFormReturn, FieldValues, DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface UseZodFormOptions<T extends FieldValues> {
  schema: z.ZodType<T>;
  defaultValues?: DefaultValues<T>;
  mode?: "onSubmit" | "onBlur" | "onChange" | "onTouched" | "all";
}

interface UseZodFormReturn<T extends FieldValues> extends UseFormReturn<T> {
  submitError: string | null;
  setSubmitError: (error: string | null) => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  handleFormSubmit: (
    onSubmit: (data: T) => Promise<void>
  ) => () => Promise<void>;
}

/**
 * Custom hook that wraps react-hook-form with zod validation
 * and provides common state management for form submission.
 *
 * @example
 * const {
 *   register,
 *   errors,
 *   isSubmitting,
 *   submitError,
 *   handleFormSubmit,
 * } = useZodForm({
 *   schema: mySchema,
 *   defaultValues: { name: "", email: "" },
 * });
 *
 * const onSubmit = handleFormSubmit(async (data) => {
 *   await saveData(data);
 * });
 */
export function useZodForm<T extends FieldValues>({
  schema,
  defaultValues,
  mode = "onBlur",
}: UseZodFormOptions<T>): UseZodFormReturn<T> {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as any,
    mode,
    defaultValues,
  });

  const handleFormSubmit = useCallback(
    (onSubmit: (data: T) => Promise<void>) => {
      return async () => {
        const isValid = await form.trigger();
        if (!isValid) return;

        const data = form.getValues();
        setIsSubmitting(true);
        setSubmitError(null);

        try {
          await onSubmit(data);
        } catch (error) {
          setSubmitError(
            error instanceof Error ? error.message : "An error occurred"
          );
        } finally {
          setIsSubmitting(false);
        }
      };
    },
    [form]
  );

  return {
    ...form,
    submitError,
    setSubmitError,
    isSubmitting,
    setIsSubmitting,
    handleFormSubmit,
  };
}
