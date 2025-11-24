"use client";

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TaskPerformance } from "@/types/dahboard";

const chartData = [
  {
    completed: 80,
    stuck: 10,
    pending: 40,
    inProgress: 50,
  },
];

const chartConfig = {
  completed: {
    label: "Completed",
    color: "#94a3b8",
  },
  stuck: {
    label: "Stuck",
    color: "#ea580c",
  },
  pending: {
    label: "Pending",
    color: "#2563eb",
  },
  inProgress: {
    label: "In Progress",
    color: "#10b981",
  },
} satisfies ChartConfig;

export function TaskPerformanceChart({
  taskPerformance = {
    totalTasks: 0,
    done: 0,
    stuck: 0,
    pending: 0,
    inProgress: 0,
  },
}: {
  taskPerformance: TaskPerformance | undefined;
}) {
  const totalTasks =
    chartData[0].completed +
    chartData[0].stuck +
    chartData[0].pending +
    chartData[0].inProgress;

  return (
    <Card className="flex flex-col border border-slate-200 shadow-none rounded-md bg-white">
      <CardHeader className="items-center pb-0">
        <CardTitle>Task Performance</CardTitle>
        <CardDescription>Current Sprint</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0 justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto w-full max-w-[350px] h-[140px]"
        >
          <RadialBarChart
            data={[taskPerformance]}
            endAngle={180}
            innerRadius={110}
            outerRadius={180}
            cy="95%"
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {taskPerformance?.totalTasks.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground text-base"
                        >
                          Tasks
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="done"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-completed)"
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="inProgress"
              fill="var(--color-inProgress)"
              stackId="a"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="pending"
              fill="var(--color-pending)"
              stackId="a"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="stuck"
              fill="var(--color-stuck)"
              stackId="a"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-md border border-slate-100">
            <span className="text-lg font-bold text-slate-600">
              {taskPerformance.done}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Completed
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-emerald-50 rounded-md border border-emerald-100">
            <span className="text-lg font-bold text-emerald-700">
              {taskPerformance.inProgress}
            </span>
            <span className="text-xs text-emerald-600 font-medium">
              In Progress
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-md border border-blue-100">
            <span className="text-lg font-bold text-blue-700">
              {taskPerformance.pending}
            </span>
            <span className="text-xs text-blue-600 font-medium">Pending</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-orange-50 rounded-md border border-orange-100">
            <span className="text-lg font-bold text-orange-700">
              {taskPerformance.stuck}
            </span>
            <span className="text-xs text-orange-600 font-medium">Stuck</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
