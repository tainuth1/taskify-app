"use client";

import * as React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatDueDate } from "@/lib/utils";
import { ChevronUp, Loader2 } from "lucide-react";
import { TaskResponse, TaskStatus } from "@/types/dahboard";
import { useAppDispatch } from "@/store";
import { updateTaskStatusAsync } from "@/features/tasks/taskSlice";

const typeColors = {
  Personal: "bg-blue-50 text-blue-600",
  Project: "bg-green-50 text-green-600",
};

type Status = {
  value: string;
  label: string;
  className: string;
};

const statuses: Status[] = [
  {
    value: "pending",
    label: "Pending",
    className: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    value: "in_progress",
    label: "In Progress",
    className: "bg-amber-50 text-amber-600 border-amber-100",
  },
  {
    value: "done",
    label: "Done",
    className: "bg-slate-50 text-slate-600 border-slate-100",
  },
  {
    value: "stuck",
    label: "Stuck",
    className: "bg-red-50 text-red-600 border-red-100",
  },
];

const TaskCard = ({ task }: { task: TaskResponse }) => {
  const progressPercentage =
    task.subtask.total > 0 ? (task.subtask.done / task.subtask.total) * 100 : 0;
  const isCompleted =
    task.subtask.done === task.subtask.total && task.subtask.total > 0;

  const [open, setOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<Status | null>(
    statuses.find((s) => s.value === task.status) || null
  );

  const [isChangingStatus, setIsChangingStatus] =
    React.useState<Boolean>(false);
  const dispatch = useAppDispatch();

  // Update internal state if prop changes
  React.useEffect(() => {
    setSelectedStatus(statuses.find((s) => s.value === task.status) || null);
  }, [task.status]);

  const handleUpdateStatus = async (status: TaskStatus) => {
    try {
      setIsChangingStatus(true);
      const result = await dispatch(
        updateTaskStatusAsync({ taskId: task.id, status })
      );

      if (updateTaskStatusAsync.fulfilled.match(result)) {
        setSelectedStatus(statuses.find((s) => s.value === status) || null);
      } else if (updateTaskStatusAsync.rejected.match(result)) {
        setSelectedStatus(
          statuses.find((s) => s.value === task.status) || null
        );
      }
    } catch (error) {
      setSelectedStatus(statuses.find((s) => s.value === task.status) || null);
    } finally {
      setIsChangingStatus(false);
    }
  };

  return (
    <div className="w-full relative p-4 rounded-md border border-slate-200 bg-white hover:border-slate-200 transition-all">
      <div className="flex justify-between items-center mb-3">
        <span
          className={`px-3 py-1 text-xs font-medium ${
            typeColors[task.project_id ? "Project" : "Personal"] ||
            "bg-gray-100 text-gray-700"
          } rounded-full`}
        >
          {task.project_id ? "Project" : "Personal"}
        </span>
        <Avatar className="size-6 rounded-full">
          <AvatarImage
            className="size-6 rounded-full"
            src={task.created_by_user.profile || ""}
            alt={
              task.created_by_user.full_name || task.created_by_user.username
            }
          />
          <AvatarFallback className="size-6 rounded-full">
            {task.created_by_user.full_name?.charAt(0) ||
              task.created_by_user.username.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
      <Link
        href={`/tasks/${task.id}`}
        className="text-slate-800 font-semibold hover:text-slate-600 transition-colors line-clamp-1"
      >
        {task.title}
      </Link>
      <p className="text-slate-500 text-[13px] mt-2 line-clamp-1">
        {task.description}
      </p>
      {/* progress */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-600 text-[13px] font-medium flex gap-2 items-center">
            <span>Progress</span>
            {isCompleted && (
              <svg
                className="w-4 h-4 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            )}
          </span>
          <span className="text-slate-500 text-[12px]">
            {task.subtask.done}/{task.subtask.total}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-green-600 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      <div className="w-full mt-4 pt-4 border-t border-slate-50">
        <div className="flex justify-between items-center">
          {/* priority */}
          <span className="capitalize px-2.5 py-0.5 text-[11px] font-medium bg-orange-50 text-orange-600 rounded-full border border-orange-100">
            {task.priority}
          </span>
          <p className="text-[12px] font-medium text-slate-400">
            Due:{" "}
            <span className="text-slate-600">
              {task.due_date ? formatDueDate(task.due_date) : "N/A"}
            </span>
          </p>
        </div>
        {/* status combobox */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {task.project_id && (
              <>
                <p className="text-[12px] font-medium text-slate-500">
                  Assigned to:
                </p>
                <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2">
                  {task.assignees.map((assignee) => (
                    <Avatar key={assignee.id} className="size-6 rounded-full">
                      <AvatarImage
                        className="size-6 rounded-full"
                        src={assignee.profile || ""}
                        alt={assignee.full_name || assignee.username}
                      />
                      <AvatarFallback className="size-6 rounded-full uppercase text-xs">
                        {assignee.full_name?.charAt(0) ||
                          assignee.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    "h-6 justify-between px-3 py-0.5 text-[11px] font-medium border rounded-sm hover:bg-opacity-80 transition-colors",
                    selectedStatus
                      ? selectedStatus.className
                      : "bg-gray-50 text-gray-500 border-gray-200"
                  )}
                >
                  {selectedStatus ? selectedStatus.label : "Set status"}{" "}
                  {!isChangingStatus ? (
                    <ChevronUp />
                  ) : (
                    <Loader2 className="animate-spin" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[150px]" side="top" align="end">
                <Command>
                  <CommandInput
                    placeholder="Change status..."
                    className="h-8 text-xs"
                  />
                  <CommandList>
                    <CommandEmpty>No status found.</CommandEmpty>
                    <CommandGroup>
                      {statuses.map((statusItem) => (
                        <CommandItem
                          key={statusItem.value}
                          value={statusItem.value}
                          onSelect={(value) => {
                            const selectedStatusValue = value as TaskStatus;
                            handleUpdateStatus(selectedStatusValue);
                            setOpen(false);
                          }}
                          className="text-xs"
                        >
                          {statusItem.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
