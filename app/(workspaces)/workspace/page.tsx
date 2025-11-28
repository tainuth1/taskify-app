"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import DueTaskCard from "@/components/ui/due-task-card";
import { StatCard } from "@/components/ui/state-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskCard from "@/components/ui/task-card";
import { TaskPerformanceChart } from "@/components/ui/task-performance-chart";
import { WorkspaceSkeleton } from "@/components/ui/workspace-skeleton";
import { apiClient } from "@/services/apiClient";
import { RootState, useAppSelector } from "@/store";
import { DashboardApiResponse, DashboardResponse } from "@/types/dahboard";
import {
  CalendarClock,
  FilePlusCorner,
  FileSearchCorner,
  FolderPlus,
  FolderSearch,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Workspace() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<Boolean>(false);

  useEffect(() => {
    const getDashboardData = async () => {
      setIsLoading(true);
      try {
        const response: DashboardApiResponse = await apiClient(
          "/api/dashboard",
          { method: "GET" }
        );
        setDashboardData(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    getDashboardData();
  }, [user]);

  if (isLoading) {
    return <WorkspaceSkeleton />;
  }

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome {user?.full_name || user?.username}
          </h1>
          <p className="text-sm text-gray-500">
            This is your workspace. Here you can manage your projects and tasks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant={"default"} className="cursor-pointer">
            <FilePlusCorner className="w-4 h-4" />
            New Task
          </Button>
          <Button variant={"default"} className="cursor-pointer">
            <FolderPlus className="w-4 h-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Main dashboard */}
      <div className="grid grid-cols-4 gap-5 mt-5">
        {/* left section */}
        <div className="col-span-3 space-y-5">
          {/* Overview */}
          <div className="">
            <h2 className="text-lg">Overviews</h2>
            <div className="grid grid-cols-3 gap-5 mt-1">
              {dashboardData?.stats.map((stat, index) => (
                <StatCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  bgColor={
                    index === 0
                      ? "purple"
                      : index === 1
                      ? "pink"
                      : index === 2
                      ? "green"
                      : "yellow"
                  }
                  href={
                    stat.title.toLowerCase().includes("project")
                      ? "/projects"
                      : "/tasks"
                  }
                />
              ))}
            </div>
          </div>

          {/* High priority tasks */}
          <div className="">
            <Tabs defaultValue="personal" className="w-full">
              <div className="flex justify-between items-center">
                <h2 className="text-lg">High Priority Tasks</h2>
                <TabsList className="rounded-md">
                  <TabsTrigger
                    value="personal"
                    className="rounded-sm cursor-pointer"
                  >
                    Personal
                  </TabsTrigger>
                  <TabsTrigger
                    value="project"
                    className="rounded-sm cursor-pointer"
                  >
                    Project
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="personal">
                <div className="grid grid-cols-3 gap-5 mt-1">
                  {dashboardData?.highPriorityTasks.personal.length &&
                  dashboardData?.highPriorityTasks.personal.length > 0 ? (
                    dashboardData?.highPriorityTasks.personal.map(
                      (task, index) => <TaskCard key={index} task={task} />
                    )
                  ) : (
                    <div className="col-span-3 flex flex-col items-center justify-center h-[262.5px]">
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <FileSearchCorner className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            No high priority tasks yet
                          </h3>
                          <p className="text-sm text-gray-500 max-w-md">
                            Get started by creating your first high priority
                            task.
                          </p>
                        </div>
                        <Link href={"/tasks"}>
                          <Button
                            variant="default"
                            className="mt-2 cursor-pointer"
                          >
                            <FilePlusCorner className="w-4 h-4" />
                            Create Task
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="project">
                <div className="grid grid-cols-3 gap-5 mt-1">
                  {dashboardData?.highPriorityTasks.project.length &&
                  dashboardData?.highPriorityTasks.project.length > 0 ? (
                    dashboardData?.highPriorityTasks.project.map(
                      (task, index) => <TaskCard key={index} task={task} />
                    )
                  ) : (
                    <div className="col-span-3 flex flex-col items-center justify-center h-[262.5px]">
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <FolderSearch className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            No high priority tasks in projects yet
                          </h3>
                          <p className="text-sm text-gray-500 max-w-md">
                            Get started by creating your first high priority
                            task in your projects.
                          </p>
                        </div>
                        <Link href={"/projects"}>
                          <Button
                            variant="default"
                            className="mt-2 cursor-pointer"
                          >
                            <FilePlusCorner className="w-4 h-4" />
                            Create Task for a project
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Due soon tasks */}
          <div className="">
            <h1 className="text-lg">Due Soon</h1>
            <div className="mt-1 flex flex-col gap-3">
              {dashboardData?.dueSoon.length &&
              dashboardData?.dueSoon.length > 0 ? (
                dashboardData?.dueSoon.map((task, index) => (
                  <DueTaskCard key={index} task={task} />
                ))
              ) : (
                <div className="w-full flex flex-col items-center justify-center h-[262.5px]">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                      <CalendarClock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        No due soon tasks found
                      </h3>
                      <p className="text-sm text-gray-500 max-w-md">
                        You are all caught up! There are no tasks due soon.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* right section */}
        <div className="col-span-1 space-y-5">
          <div className="">
            <h2 className="text-lg">Calendar</h2>
            <div className="mt-1">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-full rounded-md border border-slate-200 bg-white"
                captionLayout="dropdown"
              />
            </div>
          </div>

          <div className="">
            <TaskPerformanceChart
              taskPerformance={dashboardData?.taskPerformance}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
