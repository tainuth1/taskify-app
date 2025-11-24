// Dashboard Types

// Enums
export enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  STUCK = "stuck",
  DONE = "done",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export interface CreatedByUser {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  profile: string | null;
}

export interface SubTaskCount {
  total: number;
  done: number;
}

export interface TaskResponse {
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  id: string;
  project_id: string | null;
  user_id: string;
  created_by: string;
  created_by_user: CreatedByUser;
  created_at: string;
  updated_at: string | null;
  subtask: SubTaskCount;
  assignees: CreatedByUser[];
}

export interface StatItem {
  title: string;
  value: number;
}

export interface HighPriorityTasks {
  personal: TaskResponse[];
  project: TaskResponse[];
}

export interface TaskPerformance {
  totalTasks: number;
  done: number;
  stuck: number;
  pending: number;
  inProgress: number;
}

export interface DashboardResponse {
  stats: StatItem[];
  highPriorityTasks: HighPriorityTasks;
  dueSoon: TaskResponse[];
  taskPerformance: TaskPerformance;
}

// API Response wrapper
export interface DashboardApiResponse {
  success: boolean;
  message: string;
  data: DashboardResponse;
}
