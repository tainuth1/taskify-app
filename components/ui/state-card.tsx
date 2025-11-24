"use client";

import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface StatCardProps {
  title: string;
  value: string | number;
  bgColor?: "yellow" | "blue" | "pink" | "green" | "purple";
  href?: string;
  actionIcon?: ReactNode;
}

export function StatCard({
  title,
  value,
  bgColor = "blue",
  href = "/workspace",
  actionIcon = <ArrowUpRight className="h-5 w-5 cursor-pointer" />,
}: StatCardProps) {
  const colorStyles = {
    yellow: "bg-yellow-100",
    blue: "bg-slate-100",
    pink: "bg-pink-100",
    green: "bg-emerald-100",
    purple: "bg-purple-100",
  };

  const textColorStyles = {
    yellow: "text-yellow-900",
    blue: "text-slate-900",
    pink: "text-pink-900",
    green: "text-emerald-900",
    purple: "text-purple-900",
  };

  return (
    <div
      className={`${colorStyles[bgColor]} rounded-lg p-6 transition-all duration-200 hover:shadow-md`}
    >
      <div className="flex flex-col justify-between gap-5">
        <div className="flex justify-between items-center">
          <p className={`text-sm font-medium ${textColorStyles[bgColor]}`}>
            {title}
          </p>
          <Link
            href={href}
            className={`rounded-md transition-colors ${textColorStyles[bgColor]} hover:opacity-60`}
            aria-label="Card actions"
          >
            {actionIcon}
          </Link>
        </div>
        <div className="">
          <h3
            className={`text-4xl font-bold ${textColorStyles[bgColor]} tracking-tight`}
          >
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}
