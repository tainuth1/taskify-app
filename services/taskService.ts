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
