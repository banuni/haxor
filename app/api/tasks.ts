import { useMutation, useQuery } from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/start";
import { differenceInSeconds } from "date-fns";
import { and, eq, ne } from "drizzle-orm";
import { useEffect } from "react";

import { getAlgorithmResult } from "./content/algorithm";
import { getDb } from "../db/core";
import { tasks, type Task, type NewTask } from "../db/schema";

export const getTask = async (taskId: string) => {
  const [task] = await getDb().select().from(tasks).where(eq(tasks.id, taskId));
  return task;
};

export const getTaskByTargetAndAlgorithm = async (
  targetName: string,
  algorithmName: string,
) => {
  const [task] = await getDb()
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.targetName, targetName),
        eq(tasks.algorithmName, algorithmName),
      ),
    );
  return task;
};

export const createTaskInDb = async (newTask: NewTask) => {
  const [task] = await getDb()
    .insert(tasks)
    .values({ ...newTask, id: crypto.randomUUID(), createdAt: new Date() })
    .returning();
  return task;
};

export const updateTaskInDb = async (
  taskId: string,
  newTask: Partial<Task>,
) => {
  await getDb().update(tasks).set(newTask).where(eq(tasks.id, taskId));
};

const getTasksEp = createServerFn({
  method: "GET",
}).handler(async () => {
  const retTasks = await getDb()
    .select()
    .from(tasks)
    .where(ne(tasks.status, "aborted"));
  return retTasks;
});

async function abortTask(taskId: string) {
  await getDb()
    .update(tasks)
    .set({ status: "aborted" })
    .where(eq(tasks.id, taskId));
}

async function resolveAnalysis(taskId: string) {
  const task = await getTask(taskId);
  if (!task) {
    return;
  }
  const { secondsToComplete, probability } = getAlgorithmResult(
    task.algorithmName,
    task.targetName,
  );

  await updateTaskInDb(taskId, {
    status: "pending",
    startedAt: new Date(),
    probability,
    estimatedSecondsToComplete: secondsToComplete,
  });
}

const resolveAnalysisEp = createServerFn({
  method: "POST",
})
  .validator((data: { taskId: string }) => data)
  .handler(async (ctx) => {
    await resolveAnalysis(ctx.data.taskId);
  });

const startTaskEp = createServerFn({
  method: "POST",
})
  .validator((taskId: string) => {
    if (typeof taskId !== "string") {
      throw new Error("Task ID is required");
    }
    return taskId;
  })
  .handler(async (ctx) => {
    await getDb()
      .update(tasks)
      .set({
        status: "in-progress",
        startedAt: new Date(),
      })
      .where(eq(tasks.id, ctx.data));
  });

const checkAllTasks = createServerFn({
  method: "POST",
}).handler(async () => {
  let taskResolved = false;
  const inProgressTasks = await getDb()
    .select()
    .from(tasks)
    .where(eq(tasks.status, "in-progress"));

  for (const task of inProgressTasks) {
    if (task.startedAt && task.estimatedSecondsToComplete && task.probability) {
      if (
        differenceInSeconds(new Date(), task.startedAt) >
        task.estimatedSecondsToComplete
      ) {
        const newStatus = Math.random() < task.probability ? "success" : "fail";
        await getDb()
          .update(tasks)
          .set({ status: newStatus })
          .where(eq(tasks.id, task.id));
        taskResolved = true;
      }
    }
  }
  return { taskResolved };
});

export const abortTaskEp = createServerFn({
  method: "POST",
})
  .validator((taskId: string) => {
    return taskId;
  })
  .handler(async (ctx) => {
    await abortTask(ctx.data);
  });

// client side
export const useTasks = () => {
  const tasks = useServerFn(getTasksEp);
  const checkAllTasksFn = useServerFn(checkAllTasks);
  const resolveAnalysisFn = useServerFn(resolveAnalysisEp);
  const abortTaskFn = useServerFn(abortTaskEp);
  const startTaskFn = useServerFn(startTaskEp);
  const getTasksQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasks(),
    refetchInterval: 3000,
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

  const abortTaskMutation = useMutation({
    mutationFn: abortTaskFn,
  });

  const startTaskMutation = useMutation({
    mutationFn: startTaskFn,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      checkAllTasksMutation.mutate({});
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    tasks: getTasksQuery.data,
    resolveAnalysis: ({ taskId }: { taskId: string }) =>
      resolveAnalysisMutation.mutate({ data: { taskId } }),
    checkAllTasks: checkAllTasksMutation,
    startTask: (taskId: string) => startTaskMutation.mutate({ data: taskId }),
    abortTask: (taskId: string) => abortTaskMutation.mutate({ data: taskId }),
  };
};
