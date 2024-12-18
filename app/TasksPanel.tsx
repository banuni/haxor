import { Task } from "./api/tasks";

function TaskCard({ task }: { task: Task }) {
  return (
    <div className="bg-black rounded-md p-2 text-[#FFFFFF] border-[#00ff00]">
      <div>{task.description}</div>
      <div>{task.probability}</div>
      <div>{task.status}</div>
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
    <div className="bg-stone-800 w-auto">
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
