import { useMessages } from '../api/messages';
import { useTasks } from '../api/tasks';
import { Button } from './ui/button';
import { Task } from '../db/schema';
import { differenceInSeconds } from 'date-fns';
import { useState, useEffect } from 'react';

function TaskCard({ task, user }: { task: Task; user: string }) {
  const { startTask, abortTask } = useTasks();
  const { addMessage } = useMessages();
  const { targetName, algorithmName, taskType, probability, estimatedSecondsToComplete, status, goal, startedAt } = task;
  const handleStartTask = () => {
    startTask(task.id);
    addMessage({
      content: `HACK ${targetName} --algo=${algorithmName} --${taskType}`,
      fromName: user,
      fromRole: 'user',
    });
    setTimeout(() => {
      addMessage({
        content: `starting hack - target: ${targetName} algorithm: ${algorithmName} objective: ${taskType}`,
        fromName: 'System',
        fromRole: 'system',
      });
    }, 1000);
  };

  const handleAbortTask = () => {
    abortTask(task.id);
    addMessage({
      content: `Aborting - target: ${targetName}`,
      fromName: 'System',
      fromRole: 'system',
    });
  };

  return (
    <div className="bg-black rounded-md p-2 text-white border-[#00ff00] flex gap-2 w-full">
      <div className="flex flex-col w-full">
        <div>
          Goal: {goal} → {targetName} using {algorithmName}
        </div>
        {probability && <div>Success probability: {probability}</div>}
        <div className="capitalize">{status}</div>
        <TimeDisplay startedAt={startedAt} estimatedSecondsToComplete={estimatedSecondsToComplete} status={status} />
      </div>
      <div className="flex flex-col gap-2">
        <Button onClick={handleStartTask} disabled={status !== 'pending'} className={buttonStyle}>
          Hack
        </Button>
        <Button onClick={handleAbortTask} disabled={status !== 'pending' && status !== 'analyzing'} className={buttonStyle}>
          Abort
        </Button>
      </div>
    </div>
  );
}

const buttonStyle = 'bg-black border border-white rounded-md p-2 text-white cursor-pointer';

export function TasksPanel({ tasks, username }: { tasks: Task[]; username: string }) {
  return (
    <div className="bg-stone-800 w-auto p-2">
      <h2 className="text-[#FFFFFF] font-bold text-lg">Tasks</h2>
      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <div key={task.id} className="flex gap-2">
            <TaskCard task={task} user={username} />
          </div>
        ))}
      </div>
    </div>
  );
}

const TimeDisplay = ({
  startedAt,
  estimatedSecondsToComplete,
  status,
}: {
  startedAt?: Date | null;
  estimatedSecondsToComplete?: number | null;
  status: string;
}) => {
  const [elapsedTime, setElapsedTime] = useState(startedAt ? differenceInSeconds(new Date(), startedAt) : 0);
  const remainingTime = estimatedSecondsToComplete! - elapsedTime;
  useEffect(() => {
    if (status !== 'in-progress') return;
    const interval = setInterval(() => {
      const diff = differenceInSeconds(new Date(), startedAt!);
      if (diff !== elapsedTime) {
        setElapsedTime(diff);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [startedAt, status]);
  if (!startedAt && !estimatedSecondsToComplete) return null;
  const estimatedElement =
    estimatedSecondsToComplete && ['in-progress', 'pending'].includes(status) ? <span>Estimated: {estimatedSecondsToComplete} seconds</span> : null;
  const runningElement =
    startedAt && status === 'in-progress' ? <span className="text-cyan-100">({Math.max(remainingTime, 0)} remaining)</span> : null;
  return (
    <div className="flex gap-2">
      {estimatedElement}
      {runningElement}
    </div>
  );
};
