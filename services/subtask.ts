import { apiClient, ApiResponse } from "./apiClient";
import { SubTaskResponse } from "@/types/task";

export interface CreateSubTaskRequest {
  tasks_id: string;
  title: string;
  status: string; // "pending"
}

export interface UpdateSubTaskRequest {
  id: string;
  title?: string;
  status?: string;
}

export interface UpdateSubTaskStatusRequest {
  subtask_id: string;
  status: string;
}

/**
 * Create a new subtask for a task
 * POST /api/tasks/subtasks
 */
export const createSubTask = async (
  data: CreateSubTaskRequest
): Promise<ApiResponse<SubTaskResponse>> => {
  return apiClient<ApiResponse<SubTaskResponse>>(`/api/tasks/subtasks`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * Update a subtask (General)
 * PATCH /api/tasks/subtasks/:id
 */
export const updateSubTask = async (
  subTaskId: string,
  data: UpdateSubTaskRequest
): Promise<ApiResponse<SubTaskResponse>> => {
  return apiClient<ApiResponse<SubTaskResponse>>(
    `/api/tasks/subtasks/${subTaskId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
};

/**
 * Update a subtask status
 * PATCH /api/tasks/subtasks/:id/status
 */
export const updateSubTaskStatus = async (
  subTaskId: string,
  data: UpdateSubTaskStatusRequest
): Promise<ApiResponse<SubTaskResponse>> => {
  return apiClient<ApiResponse<SubTaskResponse>>(
    `/api/tasks/subtasks/${subTaskId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
};

/**
 * Delete a subtask
 * DELETE /api/tasks/subtasks/:id
 */
export const deleteSubTask = async (
  subTaskId: string
): Promise<ApiResponse<SubTaskResponse>> => {
  return apiClient<ApiResponse<SubTaskResponse>>(
    `/api/tasks/subtasks/${subTaskId}`,
    {
      method: "DELETE",
    }
  );
};
