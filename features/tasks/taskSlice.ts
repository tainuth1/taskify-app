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
import { getTasks, updateTaskStatus, deleteTask } from "@/services/taskService";

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
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: TaskState = {
  tasks: [],
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
