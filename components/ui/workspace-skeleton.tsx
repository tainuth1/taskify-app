"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function WorkspaceSkeleton() {
  return (
    <div className="p-5">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <Skeleton className="h-8 w-64" /> {/* Welcome title */}
          <Skeleton className="h-4 w-96" /> {/* Description */}
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-28" /> {/* New Task button */}
          <Skeleton className="h-10 w-32" /> {/* New Project button */}
        </div>
      </div>

      {/* Main dashboard */}
      <div className="grid grid-cols-4 gap-5 mt-5">
        {/* left section */}
        <div className="col-span-3 space-y-5">
          {/* Overview Skeleton */}
          <div className="">
            <Skeleton className="h-7 w-24 mb-1" /> {/* "Overviews" title */}
            <div className="grid grid-cols-3 gap-5 mt-1">
              {/* 3 Stat Cards */}
              {[1, 2, 3].map((index) => (
                <div key={index} className="rounded-lg p-6 bg-white">
                  <div className="flex flex-col justify-between gap-5">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-24" /> {/* Title */}
                      <Skeleton className="h-5 w-5 rounded-md" /> {/* Icon */}
                    </div>
                    <Skeleton className="h-10 w-16" /> {/* Value */}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High Priority Tasks Skeleton */}
          <div className="">
            <div className="flex justify-between items-center">
              <Skeleton className="h-7 w-40" />{" "}
              {/* "High Priority Tasks" title */}
              <div className="inline-flex items-center justify-center rounded-md bg-white p-1">
                <Skeleton className="h-8 w-20 rounded-sm" />{" "}
                {/* Personal tab */}
                <Skeleton className="h-8 w-20 rounded-sm" /> {/* Project tab */}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-5 mt-1">
              {/* 3 Task Cards */}
              {[1, 2, 3].map((index) => (
                <div key={index} className="w-full p-4 rounded-md bg-white">
                  <div className="flex justify-between items-center mb-3">
                    <Skeleton className="h-5 w-20 rounded-full" />{" "}
                    {/* Type badge */}
                    <Skeleton className="h-6 w-6 rounded-full" /> {/* Avatar */}
                  </div>
                  <Skeleton className="h-5 w-full mb-2" /> {/* Title */}
                  <Skeleton className="h-4 w-full mb-1" />{" "}
                  {/* Description line 1 */}
                  <Skeleton className="h-4 w-3/4 mb-4" />{" "}
                  {/* Description line 2 */}
                  {/* Progress */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <Skeleton className="h-3 w-16" /> {/* Progress label */}
                      <Skeleton className="h-3 w-12" />{" "}
                      {/* Progress fraction */}
                    </div>
                    <Skeleton className="h-1.5 w-full rounded-full" />{" "}
                    {/* Progress bar */}
                  </div>
                  <div className="w-full mt-4 pt-4 border-t border-slate-50">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-16 rounded-full" />{" "}
                      {/* Priority */}
                      <Skeleton className="h-3 w-20" /> {/* Due date */}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <Skeleton className="h-6 w-24" /> {/* Assigned to */}
                      <Skeleton className="h-6 w-20 rounded-md" />{" "}
                      {/* Status */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Due Soon Skeleton */}
          <div className="">
            <Skeleton className="h-7 w-24 mb-1" /> {/* "Due Soon" title */}
            <div className="mt-1 flex flex-col gap-3">
              {/* 3 Due Task Cards */}
              {[1, 2, 3, 4, 5].map((index) => (
                <div
                  key={index}
                  className="w-full p-5 rounded-md bg-white flex items-center gap-4"
                >
                  {/* Left Section */}
                  <div className="flex items-center gap-3 min-w-[30%]">
                    <Skeleton className="h-5 w-16 rounded-full" />{" "}
                    {/* Type badge */}
                    <Skeleton className="h-4 w-32" /> {/* Title */}
                  </div>
                  {/* Middle Section */}
                  <div className="flex items-center gap-6 flex-1 justify-center">
                    <div className="flex items-center gap-2 w-24">
                      <Skeleton className="h-1.5 w-full rounded-full" />{" "}
                      {/* Progress bar */}
                      <Skeleton className="h-3 w-12" />{" "}
                      {/* Progress fraction */}
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-6 rounded-full" />{" "}
                      {/* Avatar 1 */}
                      <Skeleton className="h-6 w-6 rounded-full" />{" "}
                      {/* Avatar 2 */}
                    </div>
                  </div>
                  {/* Right Section */}
                  <div className="flex items-center gap-3 justify-end min-w-[30%]">
                    <Skeleton className="h-5 w-16 rounded-full" />{" "}
                    {/* Priority */}
                    <Skeleton className="h-5 w-20 rounded-md" /> {/* Status */}
                    <Skeleton className="h-3 w-24" /> {/* Date */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* right section */}
        <div className="col-span-1 space-y-5">
          {/* Calendar Skeleton */}
          <div className="">
            <Skeleton className="h-7 w-20 mb-1" /> {/* "Calendar" title */}
            <div className="mt-1 rounded-md bg-white p-3">
              {/* Calendar header */}
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-8 w-8 rounded-md" />{" "}
                {/* Previous button */}
                <Skeleton className="h-6 w-32" /> {/* Month/Year */}
                <Skeleton className="h-8 w-8 rounded-md" /> {/* Next button */}
              </div>
              {/* Weekday headers */}
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <Skeleton key={day} className="h-4 w-full" />
                ))}
              </div>
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="aspect-square w-full rounded-md"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Task Performance Chart Skeleton */}
          <div className="">
            <div className="flex flex-col shadow-none rounded-md bg-white">
              {/* Card Header */}
              <div className="items-center pb-0 p-6">
                <Skeleton className="h-6 w-32 mx-auto mb-1" /> {/* Title */}
                <Skeleton className="h-4 w-24 mx-auto" /> {/* Description */}
              </div>
              {/* Chart Content */}
              <div className="flex flex-1 items-center pb-0 justify-center px-6">
                <Skeleton className="w-full max-w-[350px] h-[140px] rounded-md" />{" "}
                {/* Chart */}
              </div>
              {/* Card Footer */}
              <div className="flex-col gap-4 p-6">
                <div className="grid grid-cols-2 gap-4 w-full">
                  {[1, 2, 3, 4].map((index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-md"
                    >
                      <Skeleton className="h-6 w-8 mb-1" /> {/* Number */}
                      <Skeleton className="h-3 w-16" /> {/* Label */}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
