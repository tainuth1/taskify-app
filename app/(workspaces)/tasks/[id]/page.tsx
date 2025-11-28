"use client";

import { Button } from "@/components/ui/button";
import {
  getTaskDetailAsync,
  createCommentAsync,
  deleteCommentAsync,
  updateCommentAsync,
  deleteTaskAsync,
  updateTaskAsync,
  createSubTaskAsync,
  updateSubTaskAsync,
  updateSubTaskStatusAsync,
  deleteSubTaskAsync,
} from "@/features/tasks/taskSlice";
import { RootState, useAppDispatch, useAppSelector } from "@/store";
import {
  ArrowLeftIcon,
  Share2,
  Trash2Icon,
  Paperclip,
  Plus,
  EditIcon,
  GripVertical,
  Check,
} from "lucide-react";
import { FileEdit } from "lucide-react";
import { useEffect, use, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { formatDueDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { TaskForm } from "@/components/forms/task-form";
import { toast } from "@/lib/toast";
import { TaskStatus } from "@/types/dahboard";

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { task, isLoading, error } = useAppSelector((state) => state.task);
  const { user: currentUser } = useAppSelector(
    (state: RootState) => state.auth
  );
  const [commentContent, setCommentContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState("");
  const addSubtaskInputRef = useRef<HTMLInputElement>(null);

  /**
   * Creates a new subtask for the current task.
   * Clears the input and closes the add form on success.
   */
  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !task?.id) return;
    try {
      const response = await dispatch(
        createSubTaskAsync({
          data: {
            tasks_id: task.id,
            title: newSubtaskTitle,
            status: TaskStatus.PENDING,
          },
        })
      );
      if (createSubTaskAsync.fulfilled.match(response)) {
        setNewSubtaskTitle("");
        setIsAddingSubtask(false);
      }
    } catch (error) {
      toast.error("Failed to create subtask");
    }
  };

  /**
   * Updates the status of a subtask.
   * @param subtaskId - The ID of the subtask to update
   * @param newStatus - The new status to set
   */
  const handleUpdateSubtaskStatus = async (
    subtaskId: string,
    newStatus: string
  ) => {
    try {
      await dispatch(
        updateSubTaskStatusAsync({
          subTaskId: subtaskId,
          data: { subtask_id: subtaskId, status: newStatus },
        })
      );
    } catch (error) {
      toast.error("Failed to update subtask status");
    }
  };

  /**
   * Gets the badge styling for a task status.
   * Matches the colors used in task-card.tsx
   * @param status - The task status
   * @returns Object with background and text color classes
   */
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case TaskStatus.PENDING:
        return "bg-blue-50 text-blue-600";
      case TaskStatus.IN_PROGRESS:
        return "bg-amber-50 text-amber-600";
      case TaskStatus.DONE:
        return "bg-slate-50 text-slate-600";
      case TaskStatus.STUCK:
        return "bg-red-50 text-red-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  /**
   * Formats status text for display.
   * @param status - The task status
   * @returns Formatted status string
   */
  const formatStatusText = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  /**
   * Deletes a subtask from the current task.
   * @param subtaskId - The ID of the subtask to delete
   */
  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      await dispatch(deleteSubTaskAsync(subtaskId));
    } catch (error) {
      toast.error("Failed to delete subtask");
    }
  };

  /**
   * Initiates editing mode for a subtask.
   * @param subtaskId - The ID of the subtask to edit
   * @param title - The current title of the subtask
   */
  const handleStartEditingSubtask = (subtaskId: string, title: string) => {
    setEditingSubtaskId(subtaskId);
    setEditingSubtaskTitle(title);
  };

  /**
   * Updates the title of a subtask.
   * Clears the editing state on success.
   */
  const handleUpdateSubtaskTitle = async () => {
    if (!editingSubtaskTitle.trim() || !editingSubtaskId) return;
    try {
      const response = await dispatch(
        updateSubTaskAsync({
          subTaskId: editingSubtaskId,
          data: { id: editingSubtaskId, title: editingSubtaskTitle },
        })
      );
      if (updateSubTaskAsync.fulfilled.match(response)) {
        setEditingSubtaskId(null);
        setEditingSubtaskTitle("");
      }
    } catch (error) {
      toast.error("Failed to update subtask");
    }
  };

  /**
   * Creates a new comment for the current task.
   * Clears the comment input on success.
   */
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !task?.id) return;
    // ... existing create logic
    try {
      const response = await dispatch(
        createCommentAsync({
          taskId: task.id,
          data: {
            tasks_id: task.id,
            content: commentContent,
          },
        })
      );
      if (response.meta.requestStatus === "fulfilled") {
        setCommentContent("");
      }
    } catch (error) {}
  };

  /**
   * Updates an existing comment.
   * Clears the editing state on success.
   * @param commentId - The ID of the comment to update
   */
  const handleUpdateComment = async (commentId: string) => {
    if (!editingContent.trim()) return;

    try {
      const response = await dispatch(
        updateCommentAsync({
          commentId,
          data: { content: editingContent },
        })
      );

      if (response.meta.requestStatus === "fulfilled") {
        setEditingCommentId(null);
        setEditingContent("");
      }
    } catch (error) {}
  };

  /**
   * Initiates editing mode for a comment.
   * @param commentId - The ID of the comment to edit
   * @param currentContent - The current content of the comment
   */
  const startEditing = (commentId: string, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditingContent(currentContent);
  };

  /**
   * Cancels editing mode for a comment.
   * Clears the editing state and content.
   */
  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  /**
   * Deletes a comment from the current task.
   * @param commentId - The ID of the comment to delete
   */
  const handleDeleteComment = async (commentId: string) => {
    try {
      await dispatch(deleteCommentAsync(commentId));
    } catch (error) {}
  };

  /**
   * Deletes the current task.
   * Closes the delete modal and navigates back on success.
   */
  const handleDeleteTask = async () => {
    if (!task) return;
    try {
      setIsDeleting(true);
      const result = await dispatch(deleteTaskAsync(task.id));

      if (deleteTaskAsync.fulfilled.match(result)) {
        setDeleteModalOpen(false);
        toast.success("Task deleted successfully");
        router.back();
      } else if (deleteTaskAsync.rejected.match(result)) {
        const errorMessage =
          result.error?.message || "Failed to delete task. Please try again.";
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error("An unexpected error occurred while deleting the task");
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Updates the current task with new data.
   * Closes the edit form and shows success message on success.
   * @param data - The task data to update (title, description, priority, status, due_date)
   */
  const handleUpdateTask = async (data: {
    title: string;
    description?: string;
    priority: string;
    status: TaskStatus | string;
    due_date?: string | null;
  }) => {
    if (!task) return;
    try {
      setIsUpdatingTask(true);
      const result = await dispatch(
        updateTaskAsync({
          taskId: task.id,
          ...data,
        })
      );

      if (updateTaskAsync.fulfilled.match(result)) {
        setIsEditingTask(false);
        toast.success("Task updated successfully");
      } else if (updateTaskAsync.rejected.match(result)) {
        const errorMessage =
          result.error?.message || "Failed to update task. Please try again.";
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error("An unexpected error occurred while updating the task");
    } finally {
      setIsUpdatingTask(false);
    }
  };

  useEffect(() => {
    dispatch(getTaskDetailAsync(id));
  }, [dispatch, id]);

  const progressPercentage =
    task?.subtask.total && task?.subtask.total > 0
      ? (task?.subtask.done / task?.subtask.total) * 100
      : 0;
  const isCompleted =
    task?.subtask.done === task?.subtask.total &&
    task?.subtask.total &&
    task?.subtask.total > 0;

  return (
    <div className="">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 p-6">
        <div className="flex items-center gap-10">
          <Button
            variant={"outline"}
            className="cursor-pointer shadow-none hover:bg-slate-100 active:bg-slate-200 text-gray-600"
            onClick={() => router.back()}
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={"default"}
            className="cursor-pointer"
            onClick={() => setIsEditingTask(true)}
          >
            <FileEdit className="w-4 h-4" />
            Edit
          </Button>
          <Button
            variant={"destructive"}
            className="cursor-pointer"
            onClick={() => setDeleteModalOpen(true)}
          >
            <Trash2Icon className="w-4 h-4" />
            Delete
          </Button>
          <Button
            variant={"outline"}
            className="cursor-pointer shadow-none hover:bg-slate-100 active:bg-slate-200"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-3">
        {/* Left section */}
        <div className="col-span-2">
          <div className="p-6 space-y-2">
            <h2 className="text-2xl font-bold">{task?.title}</h2>
            <p className="text-sm text-gray-500">{task?.description}</p>
          </div>
          <div className="p-6 space-y-7">
            <div className="flex items-center">
              <h3 className="w-48 text-sm font-medium text-gray-600">Status</h3>
              <span className="text-xs bg-blue-50 text-blue-600 px-4 py-1 rounded-full capitalize">
                {task?.status}
              </span>
            </div>
            <div className="flex items-center">
              <h3 className="w-48 text-sm font-medium text-gray-600">
                Created By
              </h3>
              <div className="flex items-center gap-2">
                <Avatar className="size-6">
                  <AvatarImage
                    src={task?.created_by_user?.profile || ""}
                    alt={
                      task?.created_by_user?.full_name ||
                      task?.created_by_user?.username ||
                      ""
                    }
                  />
                  <AvatarFallback>
                    {task?.created_by_user?.full_name?.charAt(0) ||
                      task?.created_by_user?.username?.charAt(0) ||
                      ""}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-700">
                  {task?.created_by_user?.full_name ||
                    task?.created_by_user?.username ||
                    ""}
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <h3 className="w-48 text-sm font-medium text-gray-600">
                Created At
              </h3>
              <span className="text-sm">
                {task?.created_at
                  ? formatDueDate(task?.created_at as string)
                  : "N/A"}
              </span>
            </div>
            <div className="flex items-center">
              <h3 className="w-48 text-sm font-medium text-gray-600">
                Due Date
              </h3>
              <span className="text-sm">
                {task?.due_date
                  ? formatDueDate(task?.due_date as string)
                  : "N/A"}
              </span>
            </div>
            <div className="flex items-center">
              <h3 className="w-48 text-sm font-medium text-gray-600">
                Priority
              </h3>
              <span className="text-xs bg-orange-50 text-orange-600 px-4 py-1 rounded-full capitalize">
                {task?.priority}
              </span>
            </div>
            <div className="flex items-center">
              <h3 className="w-48 text-sm font-medium text-gray-600">
                Progress
              </h3>
              <div className="w-40 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-600 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Subtasks */}
          <div className="mt-7">
            <Tabs defaultValue="subtasks" className="w-full gap-0">
              <TabsList className="w-full grid grid-cols-5 justify-start bg-transparent p-0 h-auto rounded-none border-b border-gray-200">
                <TabsTrigger
                  value="subtasks"
                  className="rounded-none cursor-pointer border-b-2 border-transparent data-[state=active]:border-b-black data-[state=active]:text-black data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-gray-500 font-medium"
                >
                  Subtasks
                </TabsTrigger>
                <TabsTrigger
                  value="attachments"
                  className="rounded-none cursor-pointer border-b-2 border-transparent data-[state=active]:border-b-black data-[state=active]:text-black data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-gray-500 font-medium"
                >
                  Attachments
                </TabsTrigger>
              </TabsList>
              <TabsContent value="subtasks" className="p-5">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                      <span>Subtask</span>
                      <span className="text-gray-500 font-normal">
                        {task?.subtask?.done || 0}/{task?.subtask?.total || 0}
                      </span>
                    </div>
                    {!isAddingSubtask && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer hover:bg-slate-100 text-gray-600"
                        onClick={() => {
                          setIsAddingSubtask(true);
                          setTimeout(
                            () => addSubtaskInputRef.current?.focus(),
                            0
                          );
                        }}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Add Subtask
                      </Button>
                    )}
                  </div>

                  {/* List */}
                  <div className="space-y-2">
                    {task?.subtasks?.map((subtask) => (
                      <div
                        key={subtask.id}
                        className={`group flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          subtask.status === TaskStatus.DONE
                            ? "bg-gray-50 border-gray-200 opacity-70"
                            : "bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm"
                        }`}
                      >
                        {/* Drag Handle */}
                        <div className="cursor-move text-gray-400">
                          <GripVertical className="w-4 h-4" />
                        </div>

                        {/* Status Select */}
                        <Select
                          value={subtask.status}
                          onValueChange={(value) =>
                            handleUpdateSubtaskStatus(subtask.id, value)
                          }
                        >
                          <SelectTrigger
                            size="sm"
                            className={`h-7 w-[145px] border-none shadow-none px-2.5 py-1 rounded-md transition-colors ${getStatusBadgeStyle(
                              subtask.status
                            )} font-medium text-xs hover:opacity-80`}
                          >
                            <SelectValue>
                              <div className="flex items-center gap-1.5">
                                <div
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    subtask.status === TaskStatus.PENDING
                                      ? "bg-blue-600"
                                      : subtask.status ===
                                        TaskStatus.IN_PROGRESS
                                      ? "bg-amber-600"
                                      : subtask.status === TaskStatus.DONE
                                      ? "bg-slate-600"
                                      : subtask.status === TaskStatus.STUCK
                                      ? "bg-red-600"
                                      : "bg-gray-600"
                                  }`}
                                ></div>
                                <span>{formatStatusText(subtask.status)}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="w-[170px]">
                            <SelectItem value={TaskStatus.PENDING}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span>Pending</span>
                              </div>
                            </SelectItem>
                            <SelectItem value={TaskStatus.IN_PROGRESS}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                <span>In Progress</span>
                              </div>
                            </SelectItem>
                            <SelectItem value={TaskStatus.STUCK}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span>Stuck</span>
                              </div>
                            </SelectItem>
                            <SelectItem value={TaskStatus.DONE}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                                <span>Done</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Content */}
                        <div className="flex-1">
                          {editingSubtaskId === subtask.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                autoFocus
                                type="text"
                                className="flex-1 bg-white border border-blue-500 rounded px-2 py-1 text-sm focus:outline-none ring-2 ring-blue-500/20"
                                value={editingSubtaskTitle}
                                onChange={(e) =>
                                  setEditingSubtaskTitle(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    handleUpdateSubtaskTitle();
                                  if (e.key === "Escape")
                                    setEditingSubtaskId(null);
                                }}
                                onBlur={handleUpdateSubtaskTitle}
                              />
                            </div>
                          ) : (
                            <span
                              className={`text-sm ${
                                subtask.status === TaskStatus.DONE
                                  ? "text-gray-500"
                                  : "text-gray-700 font-medium"
                              }`}
                            >
                              {subtask.title}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-7 w-7 text-gray-400 hover:text-gray-700 cursor-pointer"
                            onClick={() =>
                              handleStartEditingSubtask(
                                subtask.id,
                                subtask.title
                              )
                            }
                          >
                            <EditIcon className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-7 w-7 text-gray-400 hover:text-red-600 cursor-pointer"
                            onClick={() => handleDeleteSubtask(subtask.id)}
                          >
                            <Trash2Icon className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Subtask Input */}
                  {isAddingSubtask && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm animate-in fade-in slide-in-from-top-2">
                      <form onSubmit={handleAddSubtask} className="space-y-3">
                        <input
                          ref={addSubtaskInputRef}
                          type="text"
                          placeholder="What needs to be done?"
                          className="w-full text-sm border-none p-0 focus:outline-none focus:ring-0 placeholder:text-gray-400 font-medium"
                          value={newSubtaskTitle}
                          onChange={(e) => setNewSubtaskTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              setIsAddingSubtask(false);
                              setNewSubtaskTitle("");
                            }
                          }}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-gray-700 cursor-pointer"
                            onClick={() => {
                              setIsAddingSubtask(false);
                              setNewSubtaskTitle("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            size="sm"
                            disabled={!newSubtaskTitle.trim()}
                            className="cursor-pointer"
                          >
                            Add Subtask
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="attachments" className="">
                <div className="flex flex-col items-center justify-center py-9 text-center">
                  <div className="bg-slate-50 p-4 rounded-full mb-4">
                    <Paperclip className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-1">
                    No attachments yet
                  </h3>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6">
                    Upload files to share with your team. You can attach images,
                    documents, and more.
                  </p>
                  {/* <Button variant="outline" className="cursor-pointer">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Attachment
                  </Button> */}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        {/* Right section */}
        <div className="col-span-1">
          {/* comment */}
          <div className="p-6 border-l border-b border-gray-200">
            <h2 className="text-lg font-bold mb-4">Comments</h2>
            <div className="space-y-2 mb-6 min-h-[400px] max-h-[400px] overflow-y-auto pr-2">
              {task?.comments && task.comments.length > 0 ? (
                task.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`group flex gap-4 hover:bg-gray-100 pl-3 pr-2 py-2 rounded-md border-l-[6px] ${
                      comment.user_id === currentUser?.id
                        ? "border-blue-600"
                        : ""
                    }`}
                  >
                    <Avatar className="size-8">
                      <AvatarImage
                        src={comment.user.profile || ""}
                        alt={
                          comment.user.full_name || comment.user.username || ""
                        }
                      />
                      <AvatarFallback>
                        {comment.user.full_name?.charAt(0) ||
                          comment.user.username?.charAt(0) ||
                          ""}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {comment.user.full_name || comment.user.username}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDueDate(comment.created_at)}
                            </span>
                          </div>
                          {editingCommentId === comment.id ? (
                            <div className="mt-2">
                              <textarea
                                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                rows={2}
                                value={editingContent}
                                onChange={(e) =>
                                  setEditingContent(e.target.value)
                                }
                                autoFocus
                              ></textarea>
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  className="cursor-pointer"
                                  onClick={() =>
                                    handleUpdateComment(comment.id)
                                  }
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="cursor-pointer"
                                  onClick={cancelEditing}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-600">
                              {comment.content}
                            </p>
                          )}
                        </div>
                        {currentUser?.id === comment.user_id &&
                          editingCommentId !== comment.id && (
                            <div className="">
                              <Button
                                size={"icon-sm"}
                                variant={"ghost"}
                                className="bg-transparent opacity-0 group-hover:opacity-100 hover:bg-transparent text-gray-500 cursor-pointer"
                                onClick={() =>
                                  startEditing(comment.id, comment.content)
                                }
                              >
                                <EditIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                size={"icon-sm"}
                                variant={"ghost"}
                                className="bg-transparent opacity-0 group-hover:opacity-100 hover:bg-transparent text-gray-500 cursor-pointer"
                                onClick={() => handleDeleteComment(comment.id)}
                              >
                                <Trash2Icon className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No comments yet.</p>
              )}
            </div>

            {/* Add comment input */}
            <div className="flex gap-4 items-start">
              <Avatar className="size-8">
                <AvatarImage
                  src={currentUser?.profile || ""}
                  alt={currentUser?.full_name || currentUser?.username || ""}
                />
                <AvatarFallback>
                  {currentUser?.full_name?.charAt(0) ||
                    currentUser?.username?.charAt(0) ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <form onSubmit={handleSubmitComment}>
                  <textarea
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Add a comment..."
                    rows={3}
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                  ></textarea>
                  <div className="flex justify-end mt-2">
                    <Button
                      size="sm"
                      className="cursor-pointer"
                      type="submit"
                      disabled={!commentContent.trim()}
                    >
                      Comment
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          {/* subtasks */}
          <div className="p-6 border-l border-b border-gray-200">
            <h2 className="text-lg font-bold">Activity</h2>
          </div>
        </div>
      </div>
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteTask}
        taskTitle={task?.title}
        isLoading={isDeleting}
      />

      <TaskForm
        open={isEditingTask}
        onOpenChange={setIsEditingTask}
        task={task}
        onSubmit={handleUpdateTask}
        isSubmitting={isUpdatingTask}
      />
    </div>
  );
}
