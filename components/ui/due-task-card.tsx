"use client";

import * as React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { cn, formatDueDate } from "@/lib/utils";
import { TaskResponse } from "@/types/dahboard";

const typeColors = {
  Personal: "bg-blue-50 text-blue-600",
  Project: "bg-green-50 text-green-600",
};

const statusStyles: Record<string, string> = {
  pending: "bg-blue-50 text-blue-600 border-blue-100",
  "in-progress": "bg-amber-50 text-amber-600 border-amber-100",
  done: "bg-slate-50 text-slate-600 border-slate-100",
  stuck: "bg-red-50 text-red-600 border-red-100",
};

const DueTaskCard = ({ task }: { task: TaskResponse }) => {
  const progressPercentage =
    task.subtask.total > 0 ? (task.subtask.done / task.subtask.total) * 100 : 0;
  const isCompleted =
    task.subtask.done === task.subtask.total && task.subtask.total > 0;

  return (
    <div className="w-full relative p-5 rounded-md border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-center gap-4">
      {/* Left Section: Type & Title */}
      <div className="flex items-center gap-3 min-w-[30%]">
        <span
          className={`px-2.5 py-0.5 text-[10px] font-medium ${
            typeColors[task.project_id ? "Project" : "Personal"] ||
            "bg-gray-100 text-gray-700"
          } rounded-full shrink-0`}
        >
          {task.project_id ? "Project" : "Personal"}
        </span>
        <Link
          href="#"
          className="text-slate-800 text-sm font-semibold hover:text-slate-600 transition-colors truncate"
        >
          {task.title}
        </Link>
      </div>

      {/* Middle Section: Progress & Assignees */}
      <div className="flex items-center gap-6 flex-1 justify-center">
        <div className="flex items-center gap-2 w-24">
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-green-600 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
            {task.subtask.done}/{task.subtask.total}
          </span>
        </div>

        <div className="flex -space-x-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:ring-2">
          {task.assignees.map((assignee) => (
            <Avatar key={assignee.id} className="size-6 rounded-full">
              <AvatarImage
                className="size-6 rounded-full"
                src={assignee.profile || ""}
                alt={assignee.full_name || assignee.username}
              />
              <AvatarFallback className="size-6 rounded-full uppercase text-xs">
                {assignee.full_name?.charAt(0) || assignee.username.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>

      {/* Right Section: Status, Priority & Date */}
      <div className="flex items-center gap-3 justify-end min-w-[30%]">
        <span className="capitalize px-2 py-0.5 text-[10px] font-medium bg-orange-50 text-orange-600 rounded-full border border-orange-100 shrink-0">
          {task.priority}
        </span>
        <span
          className={cn(
            "px-2.5 py-0.5 text-[10px] font-medium border rounded-md capitalize shrink-0",
            statusStyles[task.status]
          )}
        >
          {task.status.split("_").join(" ")}
        </span>
        <p className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
          <span className="text-slate-600">
            {task.due_date ? formatDueDate(task.due_date) : "N/A"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default DueTaskCard;
