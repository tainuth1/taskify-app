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
import {
  TaskDetailResponse,
  CommentResponse,
  SubTaskResponse,
} from "@/types/task";
import {
  createComment,
  CreateCommentRequest,
  deleteComment,
  updateComment,
  UpdateCommentRequest,
} from "@/services/comment";
import {
  createSubTask,
  CreateSubTaskRequest,
  deleteSubTask,
  updateSubTask,
  UpdateSubTaskRequest,
  updateSubTaskStatus,
  UpdateSubTaskStatusRequest,
} from "@/services/subtask";

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

/**
 * Create a comment for a task
 *
 * @param taskId - The ID of the task
 * @param data - The comment data
 * @returns The created comment
 */
export const createCommentAsync = createAsyncThunk<
  CommentResponse,
  { taskId: string; data: CreateCommentRequest },
  { rejectValue: ApiError }
>("tasks/createComment", async ({ taskId, data }, { rejectWithValue }) => {
  try {
    const response = await createComment(taskId, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

/**
 * Delete a comment from a task
 *
 * @param commentId - The ID of the comment to delete
 * @returns The deleted comment
 */
export const deleteCommentAsync = createAsyncThunk<
  string,
  string,
  { rejectValue: ApiError }
>("tasks/deleteComment", async (commentId, { rejectWithValue }) => {
  try {
    await deleteComment(commentId);
    return commentId;
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

/**
 * Update a comment
 *
 * @param commentId - The ID of the comment to update
 * @param data - The update data
 * @returns The updated comment
 */
export const updateCommentAsync = createAsyncThunk<
  CommentResponse,
  { commentId: string; data: UpdateCommentRequest },
  { rejectValue: ApiError }
>("tasks/updateComment", async ({ commentId, data }, { rejectWithValue }) => {
  try {
    const response = await updateComment(commentId, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

/**
 * Create a subtask for a task
 */
export const createSubTaskAsync = createAsyncThunk<
  SubTaskResponse,
  { data: CreateSubTaskRequest },
  { rejectValue: ApiError }
>("tasks/createSubTask", async ({ data }, { rejectWithValue }) => {
  try {
    const response = await createSubTask(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

/**
 * Update a subtask
 */
export const updateSubTaskAsync = createAsyncThunk<
  SubTaskResponse,
  { subTaskId: string; data: UpdateSubTaskRequest },
  { rejectValue: ApiError }
>("tasks/updateSubTask", async ({ subTaskId, data }, { rejectWithValue }) => {
  try {
    const response = await updateSubTask(subTaskId, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

/**
 * Update a subtask status
 */
export const updateSubTaskStatusAsync = createAsyncThunk<
  SubTaskResponse,
  { subTaskId: string; data: UpdateSubTaskStatusRequest },
  { rejectValue: ApiError }
>(
  "tasks/updateSubTaskStatus",
  async ({ subTaskId, data }, { rejectWithValue }) => {
    try {
      const response = await updateSubTaskStatus(subTaskId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error as ApiError);
    }
  }
);

/**
 * Delete a subtask
 */
export const deleteSubTaskAsync = createAsyncThunk<
  SubTaskResponse,
  string,
  { rejectValue: ApiError }
>("tasks/deleteSubTask", async (subTaskId, { rejectWithValue }) => {
  try {
    const response = await deleteSubTask(subTaskId);
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

      // Update the task detail in the local state if it matches
      if (state.task && state.task.id === updatedTask.id) {
        state.task = {
          ...state.task,
          ...updatedTask,
        };
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

    // create comment
    builder.addCase(createCommentAsync.pending, (state) => {
      state.error = null;
    });
    builder.addCase(createCommentAsync.fulfilled, (state, action) => {
      state.error = null;
      // Add the created comment to the local task detail without refetching
      if (state.task) {
        // Ensure comments array exists
        if (!state.task.comments) {
          state.task.comments = [];
        }
        state.task.comments.push(action.payload);
      }
    });
    builder.addCase(createCommentAsync.rejected, (state, action) => {
      state.error = action.payload?.message || "Failed to create comment";
    });

    // delete comment
    builder.addCase(deleteCommentAsync.pending, (state) => {
      state.error = null;
    });
    builder.addCase(deleteCommentAsync.fulfilled, (state, action) => {
      state.error = null;
      // Remove the deleted comment from the local task detail without refetching
      if (state.task && state.task.comments) {
        state.task.comments = state.task.comments.filter(
          (comment) => comment.id !== action.payload
        );
      }
    });
    builder.addCase(deleteCommentAsync.rejected, (state, action) => {
      state.error = action.payload?.message || "Failed to delete comment";
    });

    // update comment
    builder.addCase(updateCommentAsync.pending, (state) => {
      state.error = null;
    });
    builder.addCase(updateCommentAsync.fulfilled, (state, action) => {
      state.error = null;
      // Update the comment in the local task detail without refetching
      if (state.task && state.task.comments) {
        const updatedComment = action.payload;
        const index = state.task.comments.findIndex(
          (c) => c.id === updatedComment.id
        );
        if (index !== -1) {
          state.task.comments[index] = updatedComment;
        }
      }
    });
    builder.addCase(updateCommentAsync.rejected, (state, action) => {
      state.error = action.payload?.message || "Failed to update comment";
    });

    // subtask reducers
    builder.addCase(createSubTaskAsync.fulfilled, (state, action) => {
      if (state.task) {
        if (!state.task.subtasks) {
          state.task.subtasks = [];
        }
        state.task.subtasks.push(action.payload);
        // update subtask count
        if (state.task.subtask) {
          state.task.subtask.total += 1;
        }
      }
    });

    builder.addCase(updateSubTaskAsync.fulfilled, (state, action) => {
      if (state.task && state.task.subtasks) {
        const index = state.task.subtasks.findIndex(
          (st) => st.id === action.payload.id
        );
        if (index !== -1) {
          state.task.subtasks[index] = {
            ...state.task.subtasks[index],
            ...action.payload,
          };
        }
      }
    });

    builder.addCase(updateSubTaskStatusAsync.fulfilled, (state, action) => {
      if (state.task && state.task.subtasks) {
        const index = state.task.subtasks.findIndex(
          (st) => st.id === action.payload.id
        );
        if (index !== -1) {
          const oldStatus = state.task.subtasks[index].status;
          const newStatus = action.payload.status;
          state.task.subtasks[index] = action.payload;

          // update counts if status changed
          if (oldStatus !== newStatus && state.task.subtask) {
            if (newStatus === TaskStatus.DONE) {
              state.task.subtask.done += 1;
            } else if (oldStatus === TaskStatus.DONE) {
              state.task.subtask.done -= 1;
            }
          }
        }
      }
    });

    builder.addCase(deleteSubTaskAsync.fulfilled, (state, action) => {
      if (state.task && state.task.subtasks) {
        const deletedSubtask = action.payload;
        state.task.subtasks = state.task.subtasks.filter(
          (st) => st.id !== deletedSubtask.id
        );

        // update counts
        if (state.task.subtask) {
          state.task.subtask.total -= 1;
          if (deletedSubtask.status === TaskStatus.DONE) {
            state.task.subtask.done -= 1;
          }
        }
      }
    });
  },
});

export const { clearError } = taskSlice.actions;
export default taskSlice.reducer;
