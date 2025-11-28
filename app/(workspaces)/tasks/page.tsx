"use client";

import TasksContainer from "@/components/layouts/task-container";
import { Button } from "@/components/ui/button";
import {
  getTasksAsync,
  createTaskAsync,
  updateTaskAsync,
} from "@/features/tasks/taskSlice";
import { useAppDispatch, useAppSelector } from "@/store";
import React, { useEffect, useMemo, useCallback, useState } from "react";
import { TaskResponse, TaskStatus } from "@/types/dahboard";
import { ChartLine, FilePlusCorner, PlusCircle } from "lucide-react";
import { TaskForm } from "@/components/forms/task-form";
import { toast } from "@/lib/toast";

const Tasks = () => {
  const dispatch = useAppDispatch();
  const { tasks, isLoading, error } = useAppSelector((state) => state.task);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskResponse | null>(null);
  const [initialStatus, setInitialStatus] = useState<TaskStatus | undefined>();

  useEffect(() => {
    const fetchTasks = async () => {
      await dispatch(getTasksAsync());
    };
    fetchTasks();
  }, [dispatch]);

  const openAdd = (status?: TaskStatus) => {
    setEditingTask(null);
    setInitialStatus(status);
    setIsFormOpen(true);
  };

  const openEdit = (task: TaskResponse) => {
    setEditingTask(task);
    setInitialStatus(undefined);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: {
    title: string;
    description?: string;
    priority: string;
    status: TaskStatus | string;
    due_date?: string | null;
  }) => {
    if (editingTask) {
      // Update existing task
      await dispatch(
        updateTaskAsync({
          taskId: editingTask.id,
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
          due_date: data.due_date,
        })
      ).unwrap();
      toast.success("Task updated successfully");
    } else {
      // Create new task
      await dispatch(
        createTaskAsync({
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
          due_date: data.due_date,
        })
      ).unwrap();
      toast.success("Create task successfully");
    }
  };

  const handleFormClose = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingTask(null);
      setInitialStatus(undefined);
    }
  };

  /**
   * Filter tasks by status
   * This function filters the tasks array to only include tasks with the specified status
   * and sorts them by creation date (newest tasks appear at the bottom - last in, last order)
   *
   * @param status - The task status to filter by (pending, in_progress, stuck, done)
   * @returns Array of tasks matching the specified status, sorted by creation date (ascending)
   */
  const filterTasksByStatus = useCallback(
    (status: TaskStatus): TaskResponse[] => {
      return tasks
        .filter((task) => task.status === status)
        .sort((a, b) => {
          // Sort by created_at timestamp (ascending order)
          // This ensures newest tasks appear at the bottom (last in, last order)
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateA - dateB;
        });
    },
    [tasks]
  );

  const pendingTasks = useMemo(
    () => filterTasksByStatus(TaskStatus.PENDING),
    [filterTasksByStatus]
  );
  const inProgressTasks = useMemo(
    () => filterTasksByStatus(TaskStatus.IN_PROGRESS),
    [filterTasksByStatus]
  );
  const stuckTasks = useMemo(
    () => filterTasksByStatus(TaskStatus.STUCK),
    [filterTasksByStatus]
  );
  const doneTasks = useMemo(
    () => filterTasksByStatus(TaskStatus.DONE),
    [filterTasksByStatus]
  );

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Manage all your tasks here
          </h1>
          <p className="text-sm text-gray-500">
            This is your tasks page. Here you can manage all your tasks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={"default"}
            className="cursor-pointer"
            onClick={() => openAdd()}
          >
            <FilePlusCorner className="w-4 h-4" />
            New Task
          </Button>
          <Button
            variant={"outline"}
            className="cursor-pointer text-gray-600 hover:bg-slate-100 active:bg-slate-200"
          >
            <ChartLine className="w-4 h-4" />
            Insights
          </Button>
        </div>
      </div>

      {/* Main content - Task containers organized by status */}
      <div className="grid grid-cols-12 gap-5 mt-7">
        {/* PENDING Tasks Container */}
        <div className="lg:col-span-3 md:col-span-4 sm:col-span-6 col-span-12 ">
          <TasksContainer
            title={"PENDING"}
            lineColor="bg-blue-600"
            tasks={pendingTasks}
            onEditTask={openEdit}
          >
            <Button
              variant={"outline"}
              className="w-full border-dashed font-light cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100"
              onClick={() => openAdd(TaskStatus.PENDING)}
            >
              <PlusCircle className="w-4 h-4" />
              Add Task
            </Button>
          </TasksContainer>
        </div>

        {/* IN PROGRESS Tasks Container */}
        <div className="lg:col-span-3 md:col-span-4 sm:col-span-6 col-span-12 ">
          <TasksContainer
            title={"IN PROGRESS"}
            lineColor="bg-amber-500"
            tasks={inProgressTasks}
            onEditTask={openEdit}
          >
            <Button
              variant={"outline"}
              className="w-full border-dashed font-light cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100"
              onClick={() => openAdd(TaskStatus.IN_PROGRESS)}
            >
              <PlusCircle className="w-4 h-4" />
              Add Task
            </Button>
          </TasksContainer>
        </div>

        {/* STUCK Tasks Container */}
        <div className="lg:col-span-3 md:col-span-4 sm:col-span-6 col-span-12 ">
          <TasksContainer
            title={"STUCK"}
            lineColor="bg-red-500"
            tasks={stuckTasks}
            onEditTask={openEdit}
          >
            <Button
              variant={"outline"}
              className="w-full border-dashed font-light cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100"
              onClick={() => openAdd(TaskStatus.STUCK)}
            >
              <PlusCircle className="w-4 h-4" />
              Add Task
            </Button>
          </TasksContainer>
        </div>

        {/* DONE Tasks Container */}
        <div className="lg:col-span-3 md:col-span-4 sm:col-span-6 col-span-12 ">
          <TasksContainer
            title={"DONE"}
            lineColor="bg-green-500"
            tasks={doneTasks}
            onEditTask={openEdit}
          >
            <Button
              variant={"outline"}
              className="w-full border-dashed font-light cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100"
              onClick={() => openAdd(TaskStatus.DONE)}
            >
              <PlusCircle className="w-4 h-4" />
              Add Task
            </Button>
          </TasksContainer>
        </div>
      </div>

      {/* Task Form Modal */}
      <TaskForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        task={editingTask}
        initialStatus={initialStatus}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default Tasks;
