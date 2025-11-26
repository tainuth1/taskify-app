/**
 * Task Service
 *
 * Handles all task-related API calls.
 *
 * Uses apiClient for all requests.
 *
 * @module services/taskService
 */

import { TaskResponse, TaskStatus } from "@/types/dahboard";
import { apiClient } from "./apiClient";
import { ApiError } from "./authService";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Standard API response structure for tasks
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Create Task request payload
 * Note: Exclude project_id for personal tasks. Include for project tasks.
 */
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: string;
  status: TaskStatus | string;
  due_date?: string | null;
  project_id?: string | null;
}

export interface UpdateTaskRequest extends CreateTaskRequest {
  id: string;
}

// ============================================================================
// Task Endpoints
// ============================================================================

/**
 * Update the status of a task
 *
 * @param taskId - The ID of the task to update
 * @param status - The new status of the task
 * @returns The updated task
 *
 * @example
 * ```typescript
 * const task = await updateTaskStatus("123", "done");
 * ```
 */
export const updateTaskStatus = async (
  taskId: string,
  status: TaskStatus
): Promise<ApiResponse<TaskResponse>> => {
  return await apiClient<ApiResponse<TaskResponse>>(
    `/api/tasks/${taskId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ task_id: taskId, status: status }),
    }
  );
};

/**
 * Create a new task
 *
 * For personal tasks (no project), DO NOT include project_id in the body.
 * For project tasks, include project_id in the body.
 *
 * @param payload - Task creation payload (optionally includes project_id)
 * @returns The created task
 *
 * @example
 * ```typescript
 * const task = await createTask({
 *   title: "Write docs",
 *   description: "Add API docs",
 *   priority: "high",
 *   status: "pending",
 *   due_date: "2025-12-01",
 * });
 * ```
 */
export const createTask = async (
  payload: CreateTaskRequest
): Promise<ApiResponse<TaskResponse>> => {
  // Build body and exclude undefined/null project_id for personal tasks
  const { project_id, ...rest } = payload;
  const body =
    project_id !== undefined && project_id !== null
      ? { ...rest, project_id }
      : { ...rest };

  return await apiClient<ApiResponse<TaskResponse>>("/api/tasks", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

/**
 * Get all your personal tasks
 *
 * @returns All your personal tasks (task with project_id is null)
 *
 * @example
 * ```typescript
 * const tasks = await getTasks();
 * ```
 */
export const getTasks = async (): Promise<ApiResponse<TaskResponse[]>> => {
  return await apiClient<ApiResponse<TaskResponse[]>>("/api/tasks", {
    method: "GET",
  });
};

/**
 * Update a task
 *
 * @param taskId - The ID of the task to update
 * @param payload - Task update payload
 * @returns The updated task
 *
 * @example
 * ```typescript
 * const task = await updateTask("123", {
 *   title: "Updated title",
 *   description: "Updated description",
 *   priority: "high",
 *   status: "in_progress",
 *   due_date: "2025-12-01",
 * });
 * ```
 */
export const updateTask = async (
  taskId: string,
  payload: UpdateTaskRequest
): Promise<ApiResponse<TaskResponse>> => {
  return await apiClient<ApiResponse<TaskResponse>>(`/api/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

/**
 * Delete a task
 *
 * @param taskId - The ID of the task to delete
 * @returns Success response
 *
 * @example
 * ```typescript
 * const result = await deleteTask("123");
 * ```
 */
export const deleteTask = async (
  taskId: string
): Promise<ApiResponse<{ message: string }>> => {
  return await apiClient<ApiResponse<{ message: string }>>(
    `/api/tasks/${taskId}`,
    {
      method: "DELETE",
    }
  );
};
