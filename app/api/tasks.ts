import { useMutation, useQuery } from '@tanstack/react-query';
import { createServerFn, useServerFn } from '@tanstack/react-start';
import { differenceInSeconds } from 'date-fns';
import { and, eq, isNull, ne } from 'drizzle-orm';
import { useEffect } from 'react';

import { getDb } from '../db/core';
import { tasks, type Task, type NewTask } from '../db/schema';
import { getAnalysisResultMessage, getHackResultMessage } from './content/messageTemplates';
import { createMessageInDb } from './messages';

export const getTask = async (taskId: string) => {
  const [task] = await getDb().select().from(tasks).where(eq(tasks.id, taskId));
  return task;
};

export const getTaskByTargetAndAlgorithm = async (targetName: string, algorithmName: string) => {
  const [task] = await getDb()
    .select()
    .from(tasks)
    .where(and(eq(tasks.targetName, targetName), eq(tasks.algorithmName, algorithmName)));
  return task;
};

export const createTaskInDb = async (newTask: NewTask) => {
  const [task] = await getDb()
    .insert(tasks)
    .values({ ...newTask, id: crypto.randomUUID(), createdAt: new Date() })
    .returning();
  return task;
};

export const updateTaskInDb = async (taskId: string, newTask: Partial<Task>) => {
  await getDb().update(tasks).set(newTask).where(eq(tasks.id, taskId));
};

const getTasksEp = createServerFn({
  method: 'GET',
})
  .validator((data: { showAborted?: boolean; showArchived?: boolean }) => data)
  .handler(async (ctx) => {
    const showAborted = ctx.data?.showAborted || false;
    const showArchived = ctx.data?.showArchived || false;
    const retTasks = await getDb()
      .select()
      .from(tasks)
      .where(and(...(!showAborted ? [ne(tasks.status, 'aborted')] : []), ...(!showArchived ? [isNull(tasks.archivedAt)] : [])));
    return retTasks;
  });

async function abortTask(taskId: string) {
  await getDb().update(tasks).set({ status: 'aborted' }).where(eq(tasks.id, taskId));
}

async function resolveAnalysis(taskId: string, probability: number, secondsToComplete: number) {
  const task = await getTask(taskId);
  if (!task) {
    return;
  }

  await updateTaskInDb(taskId, {
    status: 'pending',
    startedAt: new Date(),
    probability,
    estimatedSecondsToComplete: secondsToComplete,
  });
}

const resolveAnalysisEp = createServerFn({
  method: 'POST',
})
  .validator((data: { taskId: string; probability: number; secondsToComplete: number }) => data)
  .handler(async (ctx) => {
    await resolveAnalysis(ctx.data.taskId, ctx.data.probability, ctx.data.secondsToComplete);
    const task = await getTask(ctx.data.taskId);
    if (!task) {
      return;
    }
    await createMessageInDb({
      fromName: 'System',
      fromRole: 'master',
      content: getAnalysisResultMessage(task.targetName, task.algorithmName, ctx.data.secondsToComplete, ctx.data.probability),
    });
  });

const startTaskEp = createServerFn({
  method: 'POST',
})
  .validator((taskId: string) => {
    if (typeof taskId !== 'string') {
      throw new Error('Task ID is required');
    }
    return taskId;
  })
  .handler(async (ctx) => {
    await getDb()
      .update(tasks)
      .set({
        status: 'in-progress',
        startedAt: new Date(),
      })
      .where(eq(tasks.id, ctx.data));
  });

const checkAllTasks = createServerFn({
  method: 'POST',
}).handler(async () => {
  let taskResolved = false;
  const inProgressTasks = await getDb().select().from(tasks).where(eq(tasks.status, 'in-progress'));

  for (const task of inProgressTasks) {
    if (task.startedAt && task.estimatedSecondsToComplete && task.probability) {
      if (differenceInSeconds(new Date(), task.startedAt) > task.estimatedSecondsToComplete) {
        const newStatus = Math.random() < task.probability ? 'success' : 'fail';
        await getDb().update(tasks).set({ status: newStatus }).where(eq(tasks.id, task.id));
        await createMessageInDb({
          fromName: 'System',
          fromRole: 'master',
          content: getHackResultMessage(task.targetName, task.algorithmName, newStatus),
        });
        taskResolved = true;
      }
    }
  }
  return { taskResolved };
});

export const abortTaskEp = createServerFn({
  method: 'POST',
})
  .validator((taskId: string) => {
    return taskId;
  })
  .handler(async (ctx) => {
    await abortTask(ctx.data);
  });

export const createTaskEp = createServerFn({
  method: 'POST',
})
  .validator((newTask: NewTask) => {
    return newTask;
  })
  .handler(async (ctx) => {
    await createTaskInDb(ctx.data);
  });

const archiveTaskEp = createServerFn({
  method: 'POST',
})
  .validator((taskId: string) => {
    return taskId;
  })
  .handler(async (ctx) => {
    await getDb().update(tasks).set({ archivedAt: new Date() }).where(eq(tasks.id, ctx.data));
  });

// client side code
export const useTasks = ({ showAborted = false, showArchived = false }: { showAborted?: boolean; showArchived?: boolean } = {}) => {
  const tasks = useServerFn(getTasksEp);
  const checkAllTasksFn = useServerFn(checkAllTasks);
  const resolveAnalysisFn = useServerFn(resolveAnalysisEp);
  const abortTaskFn = useServerFn(abortTaskEp);
  const startTaskFn = useServerFn(startTaskEp);
  const archiveTaskFn = useServerFn(archiveTaskEp);
  const createTaskFn = useServerFn(createTaskEp);
  const getTasksQuery = useQuery({
    queryKey: ['tasks', showAborted, showArchived],
    queryFn: () => tasks({ data: { showAborted, showArchived } }),
    refetchInterval: 5000,
  });

  const createTaskMutation = useMutation({
    mutationFn: createTaskFn,
  });

  const resolveAnalysisMutation = useMutation({
    mutationFn: resolveAnalysisFn,
  });

  const archiveTaskMutation = useMutation({
    mutationFn: archiveTaskFn,
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
    resolveAnalysis: (data: { taskId: string; probability: number; secondsToComplete: number }) => resolveAnalysisMutation.mutate({ data }),
    checkAllTasks: checkAllTasksMutation,
    startTask: (taskId: string) => startTaskMutation.mutate({ data: taskId }),
    abortTask: (taskId: string) => abortTaskMutation.mutate({ data: taskId }),
    archiveTask: (taskId: string) => archiveTaskMutation.mutate({ data: taskId }),
    createTask: (newTask: NewTask) => createTaskMutation.mutate({ data: newTask }),
  };
};
