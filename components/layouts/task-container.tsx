import { ReactNode } from "react";
import { TaskResponse } from "@/types/dahboard";
import TaskCard from "../ui/task-card";

type TasksContainerProps = {
  title: string;
  lineColor: string;
  tasks: TaskResponse[];
  children?: ReactNode;
};

const TasksContainer = ({
  title,
  lineColor,
  tasks,
  children,
}: TasksContainerProps) => {
  return (
    <div className="w-full active:cursor-grab cursor-pointer">
      <div className="w-full">
        <div className="">
          <h2 className="text-regular font-semibold flex items-center gap-3">
            {title.toUpperCase()}
            <span className="text-sm font-normal text-second px-3 border-2 border-gray-300 rounded-full">
              {tasks.length}
            </span>
          </h2>
        </div>
        <div className={`w-full h-1 ${lineColor} rounded-full mt-3`}></div>
      </div>
      {/* Tasks Container */}
      <div className="w-full flex flex-col gap-3 max-h-[82.2vh] sub-task-list overflow-y-auto mt-3 hide-scroolbar">
        {tasks.length > 0 &&
          tasks.map((task) => <TaskCard key={task.id} task={task} />)}
        {children}
      </div>
    </div>
  );
};

export default TasksContainer;
