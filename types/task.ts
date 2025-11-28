import { User } from "@/services/apiClient";
import { TaskResponse, TaskStatus } from "./dahboard";

export interface SubTaskResponse {
  id: string;
  tasks_id: string;
  title: string;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface CommentResponse {
  id: string;
  user_id: string;
  tasks_id: string;
  content: string;
  created_at: string;
  user: User;
}

export interface TaskDetailResponse extends TaskResponse {
  subtasks: SubTaskResponse[];
  comments: CommentResponse[];
}
