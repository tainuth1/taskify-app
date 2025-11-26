/**
 * Task Form Component
 *
 * A reusable form component for creating and updating tasks.
 * Handles validation, submission, and error states.
 *
 * @module components/forms/task-form
 */

"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { TaskResponse, TaskStatus, TaskPriority } from "@/types/dahboard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/lib/toast";

// ============================================================================
// Validation Schema
// ============================================================================

const taskFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .or(z.literal("")),
  priority: z.nativeEnum(TaskPriority),
  status: z.nativeEnum(TaskStatus),
  due_date: z
    .string()
    .optional()
    .refine(
      (date) => {
        if (!date || date === "") return true;
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      },
      {
        message: "Due date must be today or in the future",
      }
    )
    .or(z.literal("")),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

// ============================================================================
// Form State Interface
// ============================================================================

interface TaskFormState {
  title: string;
  description: string;
  priority: string;
  status: string;
  due_date: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  due_date?: string;
  general?: string;
}

// ============================================================================
// Component Props
// ============================================================================

export interface TaskFormProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Task to edit (if provided, form is in edit mode) */
  task?: TaskResponse | null;
  /** Initial status (used when creating a task from a specific status column) */
  initialStatus?: TaskStatus;
  /** Callback when form is submitted successfully */
  onSubmit: (data: {
    title: string;
    description?: string;
    priority: string;
    status: TaskStatus | string;
    due_date?: string | null;
  }) => Promise<void>;
  /** Whether the form is currently submitting */
  isSubmitting?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const TaskForm: React.FC<TaskFormProps> = ({
  open,
  onOpenChange,
  task,
  initialStatus,
  onSubmit,
  isSubmitting: externalIsSubmitting,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<TaskFormState>({
    title: "",
    description: "",
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.PENDING,
    due_date: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const isEditMode = !!task;
  const submitting = externalIsSubmitting ?? isSubmitting;

  // Initialize form when task or initialStatus changes
  useEffect(() => {
    if (open) {
      if (task) {
        // Edit mode: populate with task data
        setForm({
          title: task.title,
          description: task.description || "",
          priority: task.priority,
          status: task.status,
          due_date: task.due_date || "",
        });
      } else {
        // Create mode: use defaults or initialStatus
        setForm({
          title: "",
          description: "",
          priority: TaskPriority.MEDIUM,
          status: initialStatus ?? TaskStatus.PENDING,
          due_date: "",
        });
      }
      setErrors({});
    }
  }, [open, task, initialStatus]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setForm({
        title: "",
        description: "",
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.PENDING,
        due_date: "",
      });
      setErrors({});
    }
  }, [open]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleInputChange = (
    field: keyof TaskFormState,
    value: string
  ): void => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof FormErrors];
        return newErrors;
      });
    }

    // Clear general error
    if (errors.general) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.general;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate form data with Zod
      const validatedData = taskFormSchema.parse({
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        status: form.status,
        due_date: form.due_date,
      });

      setIsSubmitting(true);
      try {
        await onSubmit({
          title: validatedData.title,
          description: validatedData.description || undefined,
          priority: validatedData.priority,
          status: validatedData.status,
          due_date: validatedData.due_date || undefined,
        });
        onOpenChange(false);
      } catch (err: any) {
        // Handle API errors
        const errorMessage =
          err?.message ||
          (isEditMode ? "Failed to update task" : "Failed to create task");
        const apiErrors = err?.errors;

        if (apiErrors) {
          // Map API field errors to form errors
          const fieldErrors: FormErrors = {};
          Object.entries(apiErrors).forEach(([field, messages]) => {
            if (messages && Array.isArray(messages) && messages.length > 0) {
              fieldErrors[field as keyof FormErrors] = messages[0] as string;
            }
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ general: errorMessage });
          toast.error(errorMessage);
        }
        throw err; // Re-throw to prevent dialog from closing
      } finally {
        setIsSubmitting(false);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const fieldErrors: FormErrors = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as keyof FormErrors] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else if (!(error as any)?.errors) {
        // Only log unexpected errors (not API errors we already handled)
        console.error("Unexpected error:", error);
        setErrors({ general: "An unexpected error occurred" });
      }
    }
  };

  const handleCancel = (): void => {
    onOpenChange(false);
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Update task" : "Create new task"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {isEditMode
              ? "Update the details for your task."
              : "Add details for your task. This will create a personal task."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6 mt-4" onSubmit={handleSubmit}>
          {/* General Error Message */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Title Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter task title"
              className={`w-full px-4 py-2.5 border text-sm rounded-md focus:outline-none transition ${
                errors.title
                  ? "border-red-500 focus:border-red-600"
                  : "border-gray-300 focus:border-blue-600"
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Optional description"
              className={`w-full px-4 py-2.5 border text-sm rounded-md focus:outline-none transition resize-none ${
                errors.description
                  ? "border-red-500 focus:border-red-600"
                  : "border-gray-300 focus:border-blue-600"
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Priority, Status, and Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Priority
              </label>
              <Select
                value={form.priority}
                onValueChange={(value) => handleInputChange("priority", value)}
              >
                <SelectTrigger
                  className={`w-full px-4 shadow-none rounded-md text-gray-700 ${
                    errors.priority
                      ? "border-red-500 focus:border-red-600"
                      : "border-gray-300 focus:border-blue-600"
                  }`}
                >
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                  <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-red-500 text-sm mt-1">{errors.priority}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Status
              </label>
              <Select
                value={form.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger
                  className={`w-full px-4 shadow-none rounded-md text-gray-700 ${
                    errors.status
                      ? "border-red-500 focus:border-red-600"
                      : "border-gray-300 focus:border-blue-600"
                  }`}
                >
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={TaskStatus.IN_PROGRESS}>
                    In Progress
                  </SelectItem>
                  <SelectItem value={TaskStatus.STUCK}>Stuck</SelectItem>
                  <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status}</p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Due date
              </label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => handleInputChange("due_date", e.target.value)}
                className={`w-full px-4 py-[5px] border rounded-md focus:outline-none transition text-gray-700 ${
                  errors.due_date
                    ? "border-red-500 focus:border-red-600"
                    : "border-gray-300 focus:border-blue-600"
                }`}
              />
              {errors.due_date && (
                <p className="text-red-500 text-sm mt-1">{errors.due_date}</p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={submitting}
              className="w-36 px-6 hover:bg-slate-100 active:bg-slate-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="w-36 px-6 cursor-pointer hover:bg-blue-600 active:bg-blue-700"
            >
              {submitting ? (
                <Loader2 className="animate-spin" />
              ) : isEditMode ? (
                "Update Task"
              ) : (
                "Create Task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
