"use client";

import TasksContainer from "@/components/layouts/task-container";
import { Button } from "@/components/ui/button";
import { getTasksAsync } from "@/features/tasks/taskSlice";
import { useAppDispatch, useAppSelector } from "@/store";
import React, { useEffect, useMemo, useCallback } from "react";
import { TaskResponse, TaskStatus } from "@/types/dahboard";
import { ChartLine, FilePlusCorner, PlusCircle } from "lucide-react";

const Tasks = () => {
  const dispatch = useAppDispatch();
  const { tasks, isLoading, error } = useAppSelector((state) => state.task);

  useEffect(() => {
    const fetchTasks = async () => {
      await dispatch(getTasksAsync());
    };
    fetchTasks();
  }, [dispatch]);

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
          <Button variant={"default"} className="cursor-pointer">
            <FilePlusCorner className="w-4 h-4" />
            New Task
          </Button>
          <Button variant={"outline"} className="cursor-pointer text-gray-600 hover:bg-slate-100 active:bg-slate-200">
            <ChartLine className="w-4 h-4" />
            Insights
          </Button>
        </div>
      </div>

      {/* Main content - Task containers organized by status */}
      <div className="grid grid-cols-12 gap-5 mt-5">
        {/* PENDING Tasks Container */}
        <div className="lg:col-span-3 md:col-span-4 sm:col-span-6 col-span-12 ">
          <TasksContainer
            title={"PENDING"}
            lineColor="bg-blue-600"
            tasks={pendingTasks}
          >
            <Button
              variant={"outline"}
              className="w-full border-dashed font-light cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100"
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
          >
            <Button
              variant={"outline"}
              className="w-full border-dashed font-light cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100"
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
          >
            <Button
              variant={"outline"}
              className="w-full border-dashed font-light cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100"
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
          >
            <Button
              variant={"outline"}
              className="w-full border-dashed font-light cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100"
            >
              <PlusCircle className="w-4 h-4" />
              Add Task
            </Button>
          </TasksContainer>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
