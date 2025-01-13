import { useMessages } from "./api/messages";
import { useTasks } from "./api/tasks";
import { Button } from "./components/ui/button";
import { Task } from "./db/schema";

function TaskCard({ task }: { task: Task }) {
  const { startTask, abortTask } = useTasks();
  const { addMessage } = useMessages();

  const handleStartTask = () => {
    startTask(task.id);
    addMessage({
      content: `Starting hack - target: ${task.targetName} algorithm: ${task.algorithmName} objective: ${task.taskType}`,
      fromName: "System",
      fromRole: "system",
    });
  };

  const handleAbortTask = () => {
    abortTask(task.id);
    addMessage({
      content: `Aborting - target: ${task.targetName}`,
      fromName: "System",
      fromRole: "system",
    });
  };

  return (
    <div className="bg-black rounded-md p-2 text-[#FFFFFF] border-[#00ff00] flex gap-2">
      <div className="flex flex-col">
        <div>{task.description}</div>
        <div>{task.probability}</div>
        <div>{task.status}</div>
      </div>
      <div className="flex flex-col gap-2">
        <Button onClick={handleStartTask} disabled={task.status !== "pending"}>
          Hack
        </Button>
        <Button
          onClick={handleAbortTask}
          disabled={task.status !== "pending" && task.status !== "analyzing"}
        >
          Abort
        </Button>
      </div>
    </div>
  );
}

const buttonStyle =
  "bg-cyan-100 border border-cyan-500 rounded-md p-2 text-cyan-600 cursor-pointer";

export function TasksPanel({
  master,
  tasks,
}: {
  master: boolean;
  tasks: Task[];
}) {
  return (
    <div className="bg-stone-800 w-auto p-2">
      <h2 className="text-[#FFFFFF] font-bold text-lg">Tasks</h2>
      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <div key={task.id} className="flex gap-2">
            <TaskCard task={task} />
          </div>
        ))}
      </div>
    </div>
  );
}
