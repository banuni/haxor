import { createFileRoute } from "@tanstack/react-router";
import { useMessages } from "../api/messages";
import { useTasks } from "../api/tasks";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { SimpleSelect } from "../components/SimpleSelect";
import { type Task } from "../db/schema";

export const Route = createFileRoute("/master")({
  component: RouteComponent,
});

function RouteComponent() {
  const { messages, addMessage } = useMessages();
  const { tasks, resolveAnalysis } = useTasks();

  const handleEnterClick = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addMessage({
        fromName: "System",
        fromRole: "master",
        content: e.currentTarget.value,
      });
      e.currentTarget.value = "";
    }
  };

  return (
    <div className="bg-blue-900 flex w-full h-[100vh] text-white gap-5">
      <div className="flex flex-col justify-between">
        <div>Master Hacker</div>
        <div className="flex flex-col grow bg-eggplant-100">
          {messages.map((message, idx) => (
            <div key={idx} className="flex gap-2">
              <div className="text-eggplant-600">{message.fromName}:</div>
              <div className="text-white">{message.content}</div>
            </div>
          ))}
        </div>
        <input
          type="text"
          className="bg-eggplant-100 border border-eggplant-500 rounded-md p-2 text-eggplant-600"
          onKeyDown={handleEnterClick}
        />
      </div>
      <div className="flex flex-col gap-2 border-red-900 border">
        {tasks?.map((task) => <MasterTaskCard task={task} />)}
      </div>
    </div>
  );
}

const MasterTaskCard = ({ task }: { task: Task }) => {
  return (
    <div className="flex gap-2 not-last:border-b border-white pb-2">
      <div className="flex flex-col gap-2">
        <div className="text-eggplant-200">Details:</div>
        <div>Target: {task.targetName}</div>
        <div>Algorithm: {task.algorithmName}</div>
        <div>Status: {task.status}</div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-eggplant-200">By Target</div>

        <SimpleSelect
          options={["small", "medium", "large", "huge"]}
          defaultValue="small"
          onChange={(value) => {
            console.log(value);
          }}
        />
        <Input
          type="number"
          placeholder="distance (meters)"
          className="text-white"
        />
        <SimpleSelect
          options={["low", "medium", "high", "impossible"]}
          defaultValue="low"
          onChange={(value) => {
            console.log(value);
          }}
        />
      </div>
    </div>
  );
};
