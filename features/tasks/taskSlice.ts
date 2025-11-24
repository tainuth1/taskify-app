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
import { updateTaskStatus } from "@/services/taskService";

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
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: TaskState = {
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
    // update task status
    builder.addCase(updateTaskStatusAsync.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateTaskStatusAsync.fulfilled, (state, action) => {
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(updateTaskStatusAsync.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload?.message || "Failed to update task status";
    });
  },
});

export const { clearError } = taskSlice.actions;
export default taskSlice.reducer;
