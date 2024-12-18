import { useMutation, useQuery } from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/start";
import { differenceInSeconds } from "date-fns";
import { useEffect } from "react";
import { getAlgorithmResult } from "./content/algorithm";

export type Task = {
  id: string;
  description?: string;
  status: "analyzing" | "pending" | "in-progress" | "success" | "fail";
  startedAt: Date | null;
  probability?: number;
  estimatedSecondsToComplete?: number;
  targetName: string;
  algorithmName: string;
};

let tasks: Task[] = [];

export const getTask = (taskId: string) => {
  return tasks.find((task) => task.id === taskId);
};

export const getTaskByTargetAndAlgorithm = (
  targetName: string,
  algorithmName: string
) => {
  return tasks.find(
    (task) =>
      task.targetName === targetName && task.algorithmName === algorithmName
  );
};

export const getTasks = createServerFn({
  method: "GET",
}).handler(async () => {
  return tasks;
});

export const createTask = createServerFn({
  method: "POST",
})
  .validator((data: Task) => data)
  .handler(async (ctx) => {
    tasks.push(ctx.data);
  });

function resolveAnalysis(taskId: string) {
  const task = getTask(taskId);
  if (!task) {
    return;
  }
  const { secondsToComplete, probability } = getAlgorithmResult(
    task.algorithmName,
    task.targetName
  );
  task.status = "pending";
  task.startedAt = new Date();
  task.probability = probability;
  task.estimatedSecondsToComplete = secondsToComplete;
}

const resolveAnalysisEp = createServerFn({
  method: "POST",
})
  .validator((data: { taskId: string }) => data) // zodify
  .handler(async (ctx) => {
    resolveAnalysis(ctx.data.taskId);
  });

export const startTask = createServerFn({
  method: "POST",
})
  .validator((taskId: string) => {
    if (typeof taskId !== "string") {
      throw new Error("Task ID is required");
    }
    return taskId;
  })
  .handler(async (ctx) => {
    const task = tasks.find((task) => task.id === ctx.data);
    if (task) {
      task.status = "in-progress";
      task.startedAt = new Date();
    }
  });

const checkAllTasks = createServerFn({
  method: "POST",
}).handler(async () => {
  let taskResolved = false;
  tasks.forEach((task) => {
    if (
      task.status === "in-progress" &&
      task.startedAt &&
      task.estimatedSecondsToComplete &&
      task.probability
    ) {
      if (
        differenceInSeconds(new Date(), task.startedAt) >
        task.estimatedSecondsToComplete
      ) {
        Math.random() < task.probability
          ? (task.status = "success")
          : (task.status = "fail");
        taskResolved = true;
      }
    }
  });
  return { taskResolved };
});

// client side
export const useTasks = () => {
  const tasks = useServerFn(getTasks);
  const checkAllTasksFn = useServerFn(checkAllTasks);
  const resolveAnalysisFn = useServerFn(resolveAnalysisEp);

  const getTasksQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasks(),
    refetchInterval: 500,
  });
  const resolveAnalysisMutation = useMutation({
    mutationFn: resolveAnalysisFn,
  });
  const checkAllTasksMutation = useMutation({
    mutationFn: checkAllTasksFn,
    onSuccess: (data) => {
      if (data.taskResolved) {
        getTasksQuery.refetch();
      }
    },
  });
  useEffect(() => {
    const interval = setInterval(() => {
      checkAllTasksMutation.mutate({});
    }, 500);
    return () => clearInterval(interval);
  }, []);
  return {
    tasks: getTasksQuery.data,
    resolveAnalysis: ({ taskId }: { taskId: string }) =>
      resolveAnalysisMutation.mutate({ data: { taskId } }),
    checkAllTasks: checkAllTasksMutation,
  };
};
