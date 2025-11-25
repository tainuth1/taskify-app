"use client";

import TasksContainer from "@/components/layouts/task-container";
import { Button } from "@/components/ui/button";
import { getTasksAsync } from "@/features/tasks/taskSlice";
import { useAppDispatch, useAppSelector } from "@/store";
import React, { useEffect, useMemo, useCallback } from "react";
import { TaskResponse, TaskStatus } from "@/types/dahboard";

const Tasks = () => {
  const dispatch = useAppDispatch();
  const { tasks, isLoading, error } = useAppSelector((state) => state.task);

  // Fetch tasks on component mount
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

  // Memoize filtered tasks to avoid recalculating on every render
  // This improves performance when tasks array is large
  // Each container will only show tasks with the matching status
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
          {/* some stuff will put in this section later */}
        </div>
      </div>

      {/* Main content - Task containers organized by status */}
      <div className="grid grid-cols-12 gap-5 mt-5">
        {/* PENDING Tasks Container */}
        <div className="lg:col-span-3 md:col-span-4 sm:col-span-6 col-span-12 ">
          <TasksContainer
            title={"PENDING"}
            lineColor="bg-[#212D36]"
            tasks={pendingTasks}
          >
            <Button variant={"default"}>Add Task</Button>
          </TasksContainer>
        </div>

        {/* IN PROGRESS Tasks Container */}
        <div className="lg:col-span-3 md:col-span-4 sm:col-span-6 col-span-12 ">
          <TasksContainer
            title={"IN PROGRESS"}
            lineColor="bg-[#4A6BBB]"
            tasks={inProgressTasks}
          />
        </div>

        {/* STUCK Tasks Container */}
        <div className="lg:col-span-3 md:col-span-4 sm:col-span-6 col-span-12 ">
          <TasksContainer
            title={"STUCK"}
            lineColor="bg-[#E5BF9E]"
            tasks={stuckTasks}
          />
        </div>

        {/* DONE Tasks Container */}
        <div className="lg:col-span-3 md:col-span-4 sm:col-span-6 col-span-12 ">
          <TasksContainer
            title={"DONE"}
            lineColor="bg-[#8AB476]"
            tasks={doneTasks}
          />
        </div>
      </div>
    </div>
  );
};

export default Tasks;
