/**
 * Task Slice
 *
 * Redux slice managing task state and async operations.
 * Handles task fetching, creation, updates, and deletion.
 *
 * @module features/tasks/taskSlice
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ApiError } from "@/services/authService";
import { TaskResponse, TaskStatus } from "@/types/dahboard";
import {
  getTasks,
  updateTaskStatus,
  deleteTask,
  createTask,
  updateTask,
  getTaskDetail,
} from "@/services/taskService";
import { TaskDetailResponse } from "@/types/task";

// ============================================================================
// Async Thunks
// ============================================================================

// Task async thunks will be implemented here

// ============================================================================
// State Interface
// ============================================================================

/**
 * Task state structure
 */
interface TaskState {
  tasks: TaskResponse[];
  task: TaskDetailResponse | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: TaskState = {
  tasks: [],
  task: null,
  isLoading: false,
  error: null,
};

// ============================================================================
// Slice Definition
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
 * const task = await updateTaskStatusAsync("123", "done");
 * ```
 */
export const updateTaskStatusAsync = createAsyncThunk<
  TaskResponse,
  { taskId: string; status: TaskStatus },
  { rejectValue: ApiError }
>("tasks/updateTaskStatus", async ({ taskId, status }, { rejectWithValue }) => {
  try {
    const response = await updateTaskStatus(taskId, status);
    return response.data;
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

/**
 * Create a task (personal by default, supports project via projectId)
 *
 * Note: For personal tasks, do not pass projectId. For project tasks, pass projectId.
 */
export const createTaskAsync = createAsyncThunk<
  TaskResponse,
  {
    title: string;
    description?: string;
    priority: string;
    status: TaskStatus | string;
    due_date?: string | null;
    projectId?: string;
  },
  { rejectValue: ApiError }
>(
  "tasks/createTask",
  async (
    { title, description, priority, status, due_date, projectId },
    { rejectWithValue }
  ) => {
    try {
      const response = await createTask({
        title,
        description,
        priority,
        status,
        due_date,
        project_id: projectId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error as ApiError);
    }
  }
);

export const getTasksAsync = createAsyncThunk<
  TaskResponse[],
  void,
  { rejectValue: ApiError }
>("tasks/getTasks", async (_, { rejectWithValue }) => {
  try {
    const response = await getTasks();
    return response.data;
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

/**
 * Update a task
 *
 * @param payload - Task update payload with taskId
 * @returns The updated task
 *
 * @example
 * ```typescript
 * const task = await updateTaskAsync({
 *   taskId: "123",
 *   title: "Updated title",
 *   description: "Updated description",
 *   priority: "high",
 *   status: "in_progress",
 *   due_date: "2025-12-01",
 * });
 * ```
 */
export const updateTaskAsync = createAsyncThunk<
  TaskResponse,
  {
    taskId: string;
    title: string;
    description?: string;
    priority: string;
    status: TaskStatus | string;
    due_date?: string | null;
  },
  { rejectValue: ApiError }
>(
  "tasks/updateTask",
  async (
    { taskId, title, description, priority, status, due_date },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateTask(taskId, {
        id: taskId,
        title,
        description,
        priority,
        status,
        due_date,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error as ApiError);
    }
  }
);

/**
 * Delete a task
 *
 * @param taskId - The ID of the task to delete
 * @returns The deleted task ID
 *
 * @example
 * ```typescript
 * const result = await deleteTaskAsync("123");
 * ```
 */
export const deleteTaskAsync = createAsyncThunk<
  string,
  string,
  { rejectValue: ApiError }
>("tasks/deleteTask", async (taskId, { rejectWithValue }) => {
  try {
    await deleteTask(taskId);
    return taskId;
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

/**
 * Get the detail of a task
 *
 * @param taskId - The ID of the task to get the detail of
 * @returns The detail of the task
 *
 * @example
 * ```typescript
 * const taskDetail = await getTaskDetailAsync("123");
 * ```
 */
export const getTaskDetailAsync = createAsyncThunk<
  TaskDetailResponse,
  string,
  { rejectValue: ApiError }
>("tasks/getTaskDetail", async (taskId, { rejectWithValue }) => {
  try {
    const response = await getTaskDetail(taskId);
    return response.data;
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    /**
     * Clear task error
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // create task
    builder.addCase(createTaskAsync.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createTaskAsync.fulfilled, (state, action) => {
      state.isLoading = false;
      state.error = null;
      // Add the created task to the local list without refetching
      state.tasks.push(action.payload);
    });
    builder.addCase(createTaskAsync.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload?.message || "Failed to create task";
    });

    // get tasks
    builder.addCase(getTasksAsync.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getTasksAsync.fulfilled, (state, action) => {
      state.isLoading = false;
      state.tasks = action.payload;
    });
    builder.addCase(getTasksAsync.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload?.message || "Failed to get tasks";
    });

    // get task by id
    builder.addCase(getTaskDetailAsync.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getTaskDetailAsync.fulfilled, (state, action) => {
      state.isLoading = false;
      state.error = null;
      state.task = action.payload;
    });
    builder.addCase(getTaskDetailAsync.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload?.message || "Failed to get task detail";
    });

    // update task status
    builder.addCase(updateTaskStatusAsync.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateTaskStatusAsync.fulfilled, (state, action) => {
      state.isLoading = false;
      state.error = null;
      // Update the task in the local state with the new status
      // This ensures the task moves to the correct container immediately
      const updatedTask = action.payload;
      const taskIndex = state.tasks.findIndex(
        (task) => task.id === updatedTask.id
      );
      if (taskIndex !== -1) {
        // Replace the task with the updated version from the server
        state.tasks[taskIndex] = updatedTask;
      }
    });
    builder.addCase(updateTaskStatusAsync.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload?.message || "Failed to update task status";
    });

    // update task
    builder.addCase(updateTaskAsync.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateTaskAsync.fulfilled, (state, action) => {
      state.isLoading = false;
      state.error = null;
      // Replace the task in the local state with the updated version from the server
      const updatedTask = action.payload;
      const taskIndex = state.tasks.findIndex(
        (task) => task.id === updatedTask.id
      );
      if (taskIndex !== -1) {
        state.tasks[taskIndex] = updatedTask;
      }
    });
    builder.addCase(updateTaskAsync.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload?.message || "Failed to update task";
    });

    // delete task
    builder.addCase(deleteTaskAsync.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteTaskAsync.fulfilled, (state, action) => {
      state.isLoading = false;
      state.error = null;
      // Remove the task from the local state
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);
    });
    builder.addCase(deleteTaskAsync.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload?.message || "Failed to delete task";
    });
  },
});

export const { clearError } = taskSlice.actions;
export default taskSlice.reducer;
