import { apiClient, ApiResponse } from "./apiClient";
import { CommentResponse } from "@/types/task";

export interface CreateCommentRequest {
  tasks_id: string;
  content: string;
}

/**
 * Create a new comment for a task
 *
 * @param taskId - The ID of the task to create comment for
 * @param data - The comment data (task_id and content)
 * @returns The created comment response
 */
export const createComment = async (
  taskId: string,
  data: CreateCommentRequest
): Promise<ApiResponse<CommentResponse>> => {
  return apiClient<ApiResponse<CommentResponse>>(
    `/api/tasks/${taskId}/comments`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
};

export const deleteComment = async (
  taskId: string
): Promise<ApiResponse<CommentResponse>> => {
  return apiClient<ApiResponse<CommentResponse>>(`/api/comments/${taskId}`, {
    method: "DELETE",
  });
};

export interface UpdateCommentRequest {
  content: string;
}

export const updateComment = async (
  commentId: string,
  data: UpdateCommentRequest
): Promise<ApiResponse<CommentResponse>> => {
  return apiClient<ApiResponse<CommentResponse>>(`/api/comments/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};
